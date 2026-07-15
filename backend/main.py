from fastapi import FastAPI, UploadFile, File, HTTPException
from contextlib import asynccontextmanager
from pydantic import BaseModel, Field
from typing import List
from prisma import Prisma
import pdfplumber
import io

# Initialize the Prisma client
db = Prisma()

# Define Pydantic models for structured AI analysis response
class CritiqueItem(BaseModel):
    category: str = Field(description="The category of the issue (e.g., Formatting, Impact, Keywords, Structure)")
    issue: str = Field(description="A clear explanation of what is wrong or could be improved.")
    solution: str = Field(description="An explicit, actionable suggestion or rewrite showing how to fix the issue.")

class ResumeAnalysis(BaseModel):
    ats_score: int = Field(description="An overall ATS compatibility and formatting score out of 100.")
    summary: str = Field(description="A brief, professional 2-3 sentence overview of the resume's core strengths and primary areas for growth.")
    critiques: List[CritiqueItem] = Field(description="A list of specific, detailed improvement items.")


# This handles connecting to the database when the server starts and disconnecting on shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.connect()
    yield
    await db.disconnect()

# Add the lifespan context manager to our FastAPI app
app = FastAPI(title="AI Resume Analyzer API", lifespan=lifespan)

@app.get("/")
async def root():
    return {"message": "Backend is running successfully!"}

@app.post("/api/resumes/upload")
async def upload_resume(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported for now.")
    
    try:
        content = await file.read()
        
        extracted_text = ""
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n"
        
        cleaned_text = extracted_text.strip()
        
        # Save the extracted data to NeonDB using Prisma
        resume_record = await db.resume.create(
            data={
                "filename": file.filename,
                "content": cleaned_text
            }
        )
        
        return {
            "message": "Resume successfully processed and saved to database!",
            "resume_id": resume_record.id,
            "filename": resume_record.filename
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")