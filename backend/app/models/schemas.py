from pydantic import BaseModel, Field
from typing import List, Optional

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
