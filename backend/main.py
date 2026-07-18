from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, File, HTTPException
from contextlib import asynccontextmanager
from pydantic import BaseModel, Field
from typing import List
from prisma import Prisma
from google import genai
from google.genai import types
import pdfplumber
import json
import io

# Initialize the Prisma client
db = Prisma()

# Initialize the modern Google Gen AI client
# (It automatically detects GEMINI_API_KEY from your .env file)
ai_client = genai.Client()

# Define Pydantic models for structured AI analysis response
class CritiqueItem(BaseModel):
    category: str = Field(description="The category of the issue (e.g., Formatting, Impact, Keywords, Structure)")
    issue: str = Field(description="A clear explanation of what is wrong or could be improved.")
    solution: str = Field(description="An explicit, actionable suggestion or rewrite showing how to fix the issue.")

class ResumeAnalysis(BaseModel):
    ats_score: int = Field(description="An overall ATS compatibility and formatting score out of 100.")
    summary: str = Field(description="A brief, professional 2-3 sentence overview of the resume's core strengths and primary areas for growth.")
    critiques: List[CritiqueItem] = Field(description="A list of specific, detailed improvement items.")


# Handles connecting to the database when the server starts and disconnecting on shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.connect()
    yield
    await db.disconnect()

app = FastAPI(title="AI Resume Analyzer API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Your Next.js frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Backend is running successfully!"}

@app.post("/api/resumes/upload")
async def upload_resume(file: UploadFile = File(...)):
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
                "content": cleaned_text
            }
        )
        
        # 3. Call Gemini to perform a structured ATS audit
        prompt = f"""
        Analyze the following extracted resume text thoroughly. Rate it out of 100 on ATS compatibility, 
        provide a professional summary of the assessment, and list distinct, explicit formatting or content critiques 
        along side high-impact actionable solutions.
        
        Resume text:
        {cleaned_text}
        """
        
        # Using the current SDK methods and recommended model
        ai_response = ai_client.models.generate_content(
            model="gemini-3.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction="You are an expert ATS (Applicant Tracking System) optimization manager and professional resume writer.",
                response_mime_type="application/json",
                response_schema=ResumeAnalysis,
            ),
        )
        
        # Access the parsed Pydantic object directly
        structured_analysis = ai_response.parsed
        
        # 4. Return the database payload + validated AI analysis data
        return {
            "message": "Resume successfully processed, saved, and analyzed!",
            "resume_id": resume_record.id,
            "filename": resume_record.filename,
            "analysis": structured_analysis
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")