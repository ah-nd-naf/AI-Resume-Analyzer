from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from contextlib import asynccontextmanager
from pydantic import BaseModel, Field
from typing import List, Optional
from prisma import Prisma
from openai import OpenAI
import pdfplumber
import json
import io
import os
import time

# Initialize the Prisma client
db = Prisma()

# Initialize the Grok client using the OpenAI SDK standard
# It points to xAI's base URL and uses your new API key
ai_client = OpenAI(
    api_key=os.environ.get("XAI_API_KEY"),
    base_url="https://api.xai.com/v1",
)

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

allowed_origins = [
    origin.strip() for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",") if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins, 
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
        
        # 1. Extract text from PDF using standard parsing
        extracted_text = ""
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n"
        
        cleaned_text = extracted_text.strip()
        
        # 2. OCR Fallback removed - Grok handles images, not raw PDF bytes natively via standard completion API
        if not cleaned_text:
            raise HTTPException(status_code=400, detail="Document appears to be a completely unreadable scanned image.")
        
        # 3. Save the extracted raw text to NeonDB using Prisma
        resume_record = await db.resume.create(
            data={
                "filename": file.filename,
                "content": cleaned_text,
                "userId": user_id
            }
        )
        
        # 4. Build a dynamic prompt for Grok
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
            Job Description:\n{job_description}
            """
            
        prompt += f"\nResume text:\n{cleaned_text}"
        prompt += f"\nPlease return your response strictly as a JSON object matching this schema: {json.dumps(ResumeAnalysis.model_json_schema())}"
        
        # 5. Call Grok using standard chat.completions in JSON mode
        max_retries = 3
        structured_analysis = None
        
        for attempt in range(max_retries):
            try:
                ai_response = ai_client.chat.completions.create(
                    model="grok-2-latest",
                    messages=[
                        {
                            "role": "system",
                            "content": "You are an expert ATS (Applicant Tracking System) optimization manager and professional resume writer. You must output strictly valid JSON."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    response_format={"type": "json_object"},
                )
                structured_analysis = ResumeAnalysis.model_validate_json(ai_response.choices[0].message.content)
                break # Success! Break out of the retry loop
                
            except Exception as api_error:
                error_str = str(api_error)
                if ("503" in error_str or "502" in error_str) and attempt < max_retries - 1:
                    print(f"Grok servers busy. Retrying attempt {attempt + 2} of {max_retries} in 3 seconds...")
                    time.sleep(3)
                else:
                    raise api_error
        
        # 6. Return the complete payload
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
        
        prompt += f"\nPlease output strictly valid JSON matching this schema: {json.dumps(RewriteResponse.model_json_schema())}"
        
        max_retries = 3
        for attempt in range(max_retries):
            try:
                ai_response = ai_client.chat.completions.create(
                    model="grok-2-latest",
                    messages=[
                        {
                            "role": "system",
                            "content": "You are an expert resume writer. Output strictly valid JSON."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    response_format={"type": "json_object"},
                )
                return RewriteResponse.model_validate_json(ai_response.choices[0].message.content)
                
            except Exception as api_error:
                error_str = str(api_error)
                if ("503" in error_str or "502" in error_str) and attempt < max_retries - 1:
                    print(f"Grok servers busy. Retrying rewrite attempt {attempt + 2} of {max_retries} in 3 seconds...")
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
        history = await db.resume.find_many(
            where={"userId": user_id},
            order={"createdAt": "desc"}
        )
        return {"history": history}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching history: {str(e)}")