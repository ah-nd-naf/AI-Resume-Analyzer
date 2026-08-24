from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
import pdfplumber
import json
import io
import time
import os

from app.models.schemas import ResumeAnalysis, RewriteRequest, RewriteResponse
from app.core.config import db, ai_client

router = APIRouter()

GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")


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
        
        # 4. Build a comprehensive evaluation prompt
        prompt = f"""
You are an elite Executive Career Coach, Senior Talent Acquisition Partner, and ATS Optimization Specialist.
Perform an in-depth, multi-dimensional evaluation of the extracted resume text below.

### Evaluation Guidelines:
1. **Overall ATS Score (0-100)**: Reflects candidate's overall readiness to pass competitive corporate ATS filters.
2. **Sub-Scores (0-100 each)**:
   - `ats_compatibility`: Machine readability, standard headings, clear contact information, parsing friendliness.
   - `impact_quantification`: Use of quantifiable metrics, KPIs, percentages, and Google's X-Y-Z formula ("Accomplished [X] as measured by [Y] by doing [Z]").
   - `skills_keyword_density`: Depth, relevance, and placement of industry-standard hard skills and tools.
   - `brevity_clarity`: Power action verbs (e.g., 'Spearheaded', 'Orchestrated' vs 'Helped', 'Responsible for'), absence of fluff, conciseness.
   - `formatting_structure`: Section hierarchy, bullet length balance, and structural consistency.
3. **Key Strengths (3-4 items)**: Standout superpowers, career progression wins, or notable technical capabilities.
4. **Quantification Percentage (0-100)**: Real estimated percentage of work experience bullet points that include quantifiable numbers, metrics, or revenue/efficiency impact.
5. **Section Audits**: Audit the 5 core sections:
   - 'Contact & Header': Detect presence/absence of professional email, phone, location, LinkedIn/portfolio links.
   - 'Professional Summary': Assess hook strength, target role clarity, and value proposition.
   - 'Work Experience': Assess action verbs, metric density, and depth.
   - 'Skills & Tools': Assess hard skills organization, tech stack modernity, and depth.
   - 'Education & Certs': Assess degree clarity, institution, graduation year, and certifications.
   Set status to 'excellent', 'warning', or 'critical' for each.
6. **Prioritized Critiques (4-7 items)**:
   - Categorized by: 'Impact & Metrics', 'ATS & Formatting', 'Keywords & Skills', 'Brevity & Tone', or 'Structure'.
   - Assign severity: 'critical' (fix immediately), 'warning' (recommended improvement), or 'suggestion' (fine-tuning).
   - Provide concrete, actionable solution rewrites.
"""
        
        if job_description:
            prompt += f"""
### Job Description Match Analysis:
Compare the candidate's resume directly against this target Job Description:
{job_description}

Provide:
- `match_percentage`: Accurate 0-100 match rating based on requirements vs actual experience.
- `interview_probability`: 'High' (75%+ fit), 'Moderate' (50-74% fit), or 'Low' (<50% fit).
- `gap_analysis`: 3-6 crucial missing skills, qualifications, or requirements.
- `keyword_match`:
  - `matched`: High-priority technical skills and requirements from the JD that are found in the resume.
  - `missing`: Important required skills/tools from the JD that are missing from the resume.
  - `soft_skills`: Relevant interpersonal, leadership, or behavioral competencies identified.
"""
        else:
            prompt += """
Note: No job description provided. Set match_percentage, interview_probability, gap_analysis, and keyword_match to null.
"""

        prompt += f"""
### Extracted Resume Text:
\"\"\"
{cleaned_text}
\"\"\"

Please return your response strictly as a JSON object adhering to this schema:
{json.dumps(ResumeAnalysis.model_json_schema())}
"""

        # 5. Call Groq with retries and structured validation
        max_retries = 3
        structured_analysis = None
        
        for attempt in range(max_retries):
            try:
                ai_response = ai_client.chat.completions.create(
                    model=GROQ_MODEL,
                    messages=[
                        {
                            "role": "system",
                            "content": "You are a master ATS optimization engine and senior executive resume reviewer. Always output strictly valid JSON matching the provided schema. Ensure every element in section_audits and critiques is a complete JSON object."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.2,
                )
                structured_analysis = ResumeAnalysis.model_validate_json(ai_response.choices[0].message.content)
                break  # Success!
                
            except Exception as api_error:
                error_str = str(api_error)
                if attempt < max_retries - 1:
                    print(f"Resume analysis attempt {attempt + 1} failed: {error_str[:100]}. Retrying in 2 seconds...")
                    time.sleep(2)
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
                    model=GROQ_MODEL,
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
                if attempt < max_retries - 1:
                    print(f"Rewrite attempt {attempt + 1} failed: {error_str[:100]}. Retrying in 2 seconds...")
                    time.sleep(2)
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
