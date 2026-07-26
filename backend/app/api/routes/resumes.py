from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
import pdfplumber
import json
import io
import time

from app.models.schemas import ResumeAnalysis, RewriteRequest, RewriteResponse
from app.core.config import db, ai_client

router = APIRouter()


@router.post("/api/resumes/upload")
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
                    model="llama-3.3-70b-versatile",
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
                if ("503" in error_str or "502" in error_str or "rate_limit" in error_str.lower()) and attempt < max_retries - 1:
                    print(f"Groq servers busy. Retrying attempt {attempt + 2} of {max_retries} in 3 seconds...")
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


@router.post("/api/resumes/rewrite")
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
                    model="llama-3.3-70b-versatile",
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
                if ("503" in error_str or "502" in error_str or "rate_limit" in error_str.lower()) and attempt < max_retries - 1:
                    print(f"Groq servers busy. Retrying rewrite attempt {attempt + 2} of {max_retries} in 3 seconds...")
                    time.sleep(3)
                else:
                    raise api_error
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating rewrite: {str(e)}")


@router.get("/api/resumes/history")
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
