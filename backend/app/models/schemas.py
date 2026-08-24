from pydantic import BaseModel, Field
from typing import List, Optional

# Define Pydantic models for structured AI analysis response

class SubScores(BaseModel):
    ats_compatibility: int = Field(default=75, description="ATS parsing friendliness and machine readability score (0-100)")
    impact_quantification: int = Field(default=70, description="Presence of measurable metrics, KPIs, and results using X-Y-Z formula (0-100)")
    skills_keyword_density: int = Field(default=75, description="Depth and relevance of hard skills, domain competencies, and tools (0-100)")
    brevity_clarity: int = Field(default=80, description="Action-verb strength, conciseness, and absence of filler language (0-100)")
    formatting_structure: int = Field(default=80, description="Visual hierarchy, section flow, and structural consistency (0-100)")

class SectionAuditItem(BaseModel):
    section: str = Field(description="Section evaluated: 'Contact & Header', 'Professional Summary', 'Work Experience', 'Skills & Tools', 'Education & Certs'")
    status: str = Field(description="Health rating: 'excellent', 'warning', or 'critical'")
    feedback: str = Field(description="Direct diagnostic evaluation of this section.")
    action: str = Field(description="High-priority actionable recommendation for this section.")

class KeywordMatch(BaseModel):
    matched: List[str] = Field(default_factory=list, description="Keywords and competencies in the JD that the candidate successfully has in their resume.")
    missing: List[str] = Field(default_factory=list, description="Important keywords, tools, or requirements in the JD not found in the resume.")
    soft_skills: List[str] = Field(default_factory=list, description="Key soft skills and interpersonal competencies identified.")

class CritiqueItem(BaseModel):
    category: str = Field(description="The category of the issue (e.g., 'Impact & Metrics', 'ATS & Formatting', 'Keywords & Skills', 'Brevity & Tone', 'Structure')")
    severity: str = Field(default="warning", description="Severity level: 'critical' (high impact friction), 'warning' (recommended improvement), 'suggestion' (polishing)")
    issue: str = Field(description="A clear explanation of what is wrong or could be improved.")
    solution: str = Field(description="An explicit, actionable suggestion or rewrite showing how to fix the issue.")

class ResumeAnalysis(BaseModel):
    ats_score: int = Field(description="An overall ATS compatibility and quality score out of 100.")
    sub_scores: SubScores = Field(description="Granular scores across 5 core evaluation pillars.")
    summary: str = Field(description="A brief, professional executive summary of the resume's core strengths and growth areas.")
    key_strengths: List[str] = Field(default_factory=list, description="Top 3-4 standout positive superpowers / competitive advantages in this resume.")
    quantification_percentage: Optional[int] = Field(default=None, description="Estimated percentage of bullet points that include quantifiable numbers/metrics (0-100).")
    section_audits: List[SectionAuditItem] = Field(default_factory=list, description="Section-by-section health audits across all major resume sections.")
    critiques: List[CritiqueItem] = Field(description="List of prioritized specific, actionable improvement critiques.")
    match_percentage: Optional[int] = Field(default=None, description="The match percentage against the provided job description (0-100). Null if no JD provided.")
    interview_probability: Optional[str] = Field(default=None, description="Interview likelihood rating: 'High', 'Moderate', or 'Low'. Null if no JD provided.")
    gap_analysis: Optional[List[str]] = Field(default=None, description="List of missing key skills or qualifications based on the job description. Null if no JD provided.")
    keyword_match: Optional[KeywordMatch] = Field(default=None, description="Detailed keyword match breakdown if JD is provided. Null if no JD provided.")

class RewriteRequest(BaseModel):
    original_text: str = Field(description="The weak text or issue from the resume.")
    recommendation: str = Field(description="The AI's original recommendation on how to fix it.")

class RewriteResponse(BaseModel):
    rewritten_text: str = Field(description="A highly professional, impactful, and quantified rewritten bullet point.")
    explanation: str = Field(description="A brief 1-sentence explanation of why this new version is much stronger.")
