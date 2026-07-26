export type Critique = {
  category: string;
  issue: string;
  solution: string;
};

export type AnalysisResult = {
  ats_score: number;
  match_percentage?: number | null;
  gap_analysis?: string[] | null;
  summary: string;
  critiques: Critique[];
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
