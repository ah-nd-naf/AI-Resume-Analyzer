from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from contextlib import asynccontextmanager
from pydantic import BaseModel, Field
from typing import List, Optional
from prisma import Prisma
from google import genai
from google.genai import types
import pdfplumber
import json
import io
import time  # NEW: Required for our auto-retry sleep mechanism

# Initialize the Prisma client
db = Prisma()

# Initialize the modern Google Gen AI client
ai_client = genai.Client()

# Define Pydantic models for structured AI analysis response
class CritiqueItem(BaseModel):
    category: str = Field(description="The category of the issue (e.g., Formatting, Impact, Keywords, Structure)")
    issue: str = Field(description="A clear explanation of what is wrong or could be improved.")
    solution: str = Field(description="An explicit, actionable suggestion or rewrite showing how to fix the issue.")

class ResumeAnalysis(BaseModel):
    ats_score: int = Field(description="An overall ATS compatibility and formatting score out of 100.")
    match_percentage: Optional[int] = Field(default=None, description="The match percentage against the provided job description. Null if no JD provided.")
    gap_analysis: Optional[List[str]] = Field(default=None, description="A list of missing key skills or qualifications based on the job description. Null if no JD provided.")
    summary: str = Field(description="A brief, professional overview of the resume's core strengths and primary areas for growth.")
    critiques: List[CritiqueItem] = Field(description="A list of specific, detailed improvement items.")

class RewriteRequest(BaseModel):
    original_text: str = Field(description="The weak text or issue from the resume.")
    recommendation: str = Field(description="The AI's original recommendation on how to fix it.")

class RewriteResponse(BaseModel):
    rewritten_text: str = Field(description="A highly professional, impactful, and quantified rewritten bullet point.")
    explanation: str = Field(description="A brief 1-sentence explanation of why this new version is much stronger.")

# Handles connecting to the database when the server starts and disconnecting on shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.connect()
    yield
    await db.disconnect()

app = FastAPI(title="AI Resume Analyzer API", lifespan=lifespan)

# Add CORS middleware to allow the frontend to communicate with the backend
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Backend is running successfully!"}

@app.post("/api/resumes/upload")
async def upload_resume(
    file: UploadFile = File(...),
    job_description: Optional[str] = Form(None),
    user_id: Optional[str] = Form(None)
):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported for now.")
    
    try:
        content = await file.read()
        
        # 1. Extract text from PDF
        extracted_text = ""
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n"
        
        cleaned_text = extracted_text.strip()
        if not cleaned_text:
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from the PDF. Please ensure the PDF is not a scanned image or empty."
            )
        
        # 2. Save the extracted raw text to NeonDB using Prisma
        resume_record = await db.resume.create(
            data={
                "filename": file.filename,
                "content": cleaned_text,
                "userId": user_id
            }
        )
        
        # 3. Build a dynamic prompt for Gemini
        prompt = f"""
        Analyze the following extracted resume text thoroughly. Rate it out of 100 on ATS compatibility, 
        provide a professional summary of the assessment, and list distinct, explicit formatting or content critiques 
        along side high-impact actionable solutions.
        """
        
        if job_description:
            prompt += f"""
            
            Additionally, compare the resume against the following Job Description. 
            Calculate a strict match_percentage (0-100) representing how well the candidate fits the role.
            Also, provide a gap_analysis as a list of 3-5 missing critical keywords, skills, or qualifications.
            
            Job Description:
            {job_description}
            """
            
        prompt += f"""
        
        Resume text:
        {cleaned_text}
        """
        
        # NEW: Call Gemini using the modern SDK with an Auto-Retry Loop
        max_retries = 3
        structured_analysis = None
        
        for attempt in range(max_retries):
            try:
                ai_response = ai_client.models.generate_content(
                    model="gemini-3.5-flash",
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        system_instruction="You are an expert ATS (Applicant Tracking System) optimization manager and professional resume writer.",
                        response_mime_type="application/json",
                        response_schema=ResumeAnalysis,
                    ),
                )
                
                structured_analysis = ai_response.parsed
                break # Success! Break out of the retry loop
                
            except Exception as api_error:
                # Check if it is a 503 error and we haven't run out of retries
                if "503" in str(api_error) and attempt < max_retries - 1:
                    print(f"Google servers busy. Retrying attempt {attempt + 2} of {max_retries} in 3 seconds...")
                    time.sleep(3)
                else:
                    # If it's a different error, or we are out of retries, throw the error
                    raise api_error
        
        # 4. Return the complete payload
        return {
            "message": "Resume successfully processed, saved, and analyzed!",
            "resume_id": resume_record.id,
            "filename": resume_record.filename,
            "analysis": structured_analysis
        }
    except Exception as e:
        print(f"Error processing resume: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process resume: {str(e)}")


@app.post("/api/resumes/rewrite")
async def rewrite_bullet(request: RewriteRequest):
    try:
        prompt = f"""
        You are an expert executive resume writer. 
        A candidate has a weak section in their resume based on the following context.
        
        Current Weak State: {request.original_text}
        Actionable Recommendation Given: {request.recommendation}
        
        Please provide a singular, highly professional, quantified, and impactful rewritten version of this text that the candidate can copy and paste directly into their resume.
        """
        
        # NEW: Auto-Retry Loop for the Rewrite Endpoint
        max_retries = 3
        for attempt in range(max_retries):
            try:
                ai_response = ai_client.models.generate_content(
                    model="gemini-3.5-flash",
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        system_instruction="You are an expert resume writer. Output strictly in the requested JSON structure.",
                        response_mime_type="application/json",
                        response_schema=RewriteResponse,
                    ),
                )
                
                return ai_response.parsed
                
            except Exception as api_error:
                if "503" in str(api_error) and attempt < max_retries - 1:
                    print(f"Google servers busy. Retrying rewrite attempt {attempt + 2} of {max_retries} in 3 seconds...")
                    time.sleep(3)
                else:
                    raise api_error
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating rewrite: {str(e)}")


@app.get("/api/resumes/history")
async def get_user_history(user_id: str):
    """Fetches all past resumes uploaded by a specific user."""
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID is required")
        
    try:
        # Ask Prisma for all resumes matching this user, ordered by newest first
        history = await db.resume.find_many(
            where={"userId": user_id},
            order={"createdAt": "desc"}
        )
        
        return {"history": history}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching history: {str(e)}")