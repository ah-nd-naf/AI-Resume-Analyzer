export type SubScores = {
  ats_compatibility: number;
  impact_quantification: number;
  skills_keyword_density: number;
  brevity_clarity: number;
  formatting_structure: number;
};

export type SectionAuditItem = {
  section: string;
  status: "excellent" | "warning" | "critical" | string;
  feedback: string;
  action: string;
};

export type KeywordMatch = {
  matched: string[];
  missing: string[];
  soft_skills: string[];
};

export type Critique = {
  category: string;
  severity?: "critical" | "warning" | "suggestion" | string;
  issue: string;
  solution: string;
};

export type AnalysisResult = {
  ats_score: number;
  sub_scores?: SubScores;
  summary: string;
  key_strengths?: string[];
  quantification_percentage?: number | null;
  section_audits?: SectionAuditItem[];
  critiques: Critique[];
  match_percentage?: number | null;
  interview_probability?: "High" | "Moderate" | "Low" | string | null;
  gap_analysis?: string[] | null;
  keyword_match?: KeywordMatch | null;
};

export type RewriteState = {
  loading: boolean;
  text?: string;
  explanation?: string;
  error?: string;
};

export type HistoryItem = {
  id: string;
  filename: string;
  createdAt: string;
};
