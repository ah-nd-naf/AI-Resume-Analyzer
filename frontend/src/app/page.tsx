"use client";

import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { SignInButton, Show, UserButton, useAuth } from "@clerk/nextjs";
import { 
  UploadCloud, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  ArrowRight,
  TrendingUp,
  Target,
  Sparkles,
  History,
  X,
  Clock,
  Download,
  Briefcase,
  Layers,
  Award,
  ChevronRight,
  Sparkle
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

type Critique = {
  category: string;
  issue: string;
  solution: string;
};

type AnalysisResult = {
  ats_score: number;
  match_percentage?: number | null;
  gap_analysis?: string[] | null;
  summary: string;
  critiques: Critique[];
};

type RewriteState = {
  loading: boolean;
  text?: string;
  explanation?: string;
  error?: string;
};

type HistoryItem = {
  id: string;
  filename: string;
  createdAt: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function Home() {
  const { userId } = useAuth();
  
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rewrites, setRewrites] = useState<Record<number, RewriteState>>({});
  
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (userId) {
      fetch(`${API_BASE_URL}/api/resumes/history?user_id=${userId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.history) setHistory(data.history);
        })
        .catch((err) => console.error("Failed to load history", err));
    }
  }, [userId, results]); 

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setResults(null);
      setError(null);
      setRewrites({});
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setError(null);
    setRewrites({});

    const formData = new FormData();
    formData.append("file", file);
    
    if (jobDescription.trim()) {
      formData.append("job_description", jobDescription.trim());
    }

    if (userId) {
      formData.append("user_id", userId);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/resumes/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to analyze resume. Please try again.");
      }

      const data = await response.json();
      setResults(data.analysis);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRewrite = async (idx: number, issue: string, solution: string) => {
    setRewrites((prev) => ({ ...prev, [idx]: { loading: true } }));
    try {
      const response = await fetch(`${API_BASE_URL}/api/resumes/rewrite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ original_text: issue, recommendation: solution }),
      });
      if (!response.ok) throw new Error("Failed to generate rewrite.");
      const data = await response.json();
      setRewrites((prev) => ({
        ...prev,
        [idx]: { loading: false, text: data.rewritten_text, explanation: data.explanation }
      }));
    } catch (err: any) {
      setRewrites((prev) => ({
        ...prev,
        [idx]: { loading: false, error: err.message }
      }));
    }
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('report-container');
    if (!element) return;

    setIsDownloading(true);
    
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin:       0.5,
        filename:     `${file?.name ? file.name.split('.')[0] : 'Resume'}_AI_Analysis.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#030014' }, 
        jsPDF:        { unit: 'in' as const, format: 'letter', orientation: 'portrait' as const }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("Failed to generate PDF", error);
      alert("Something went wrong while generating the PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 stroke-emerald-400";
    if (score >= 60) return "text-amber-400 stroke-amber-400";
    return "text-rose-400 stroke-rose-400";
  };

  const getScoreGlow = (score: number) => {
    if (score >= 80) return "glow-emerald";
    if (score >= 60) return "glow-amber";
    return "glow-rose";
  };

  // Get unique critique categories if results exist
  const critiqueCategories = results 
    ? Array.from(new Set(results.critiques.map((c) => c.category))) 
    : [];

  return (
    <main className="min-h-screen font-sans text-foreground relative overflow-hidden flex flex-col pb-24 transition-colors duration-300">
      
      {/* Background Grids & Orbs */}
      <div className="absolute inset-0 premium-grid opacity-35 pointer-events-none -z-20"></div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-15%] left-[-15%] w-[60rem] h-[60rem] rounded-full bg-purple-900/10 blur-[140px] animate-pulse-glow"></div>
        <div className="absolute top-[25%] right-[-10%] w-[50rem] h-[50rem] rounded-full bg-indigo-900/10 blur-[150px] animate-float-slow"></div>
        <div className="absolute bottom-[-10%] left-[15%] w-[55rem] h-[55rem] rounded-full bg-cyan-900/10 blur-[130px]"></div>
      </div>

      {/* History Sidebar */}
      {showHistory && (
        <div 
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm transition-opacity duration-300" 
          onClick={() => setShowHistory(false)}
        ></div>
      )}

      <div className={`fixed inset-y-0 left-0 z-50 w-full sm:w-96 bg-background/95 backdrop-blur-3xl border-r border-border shadow-2xl transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${showHistory ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground flex items-center">
            <History className="w-5 h-5 mr-2.5 text-purple-600 dark:text-purple-400" />
            Recent Analyses
          </h2>
          <button 
            onClick={() => setShowHistory(false)}
            className="p-2 rounded-full hover:bg-foreground/10 transition-colors text-slate-500 dark:text-slate-400 hover:text-foreground cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center text-slate-500 mt-16 space-y-3">
              <FileText className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-sm font-medium">No past uploads found.</p>
            </div>
          ) : (
            history.map((item) => (
              <div key={item.id} className="p-4 premium-glass-secondary premium-glass-hover rounded-2xl cursor-pointer group">
                <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate mb-1.5 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {item.filename}
                </p>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-600 dark:text-slate-500" />
                  {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sticky Header Nav */}
      <header className="sticky top-4 z-30 max-w-6xl mx-auto w-[calc(100%-2rem)] mt-4 px-4 sm:px-6">
        <div className="premium-glass rounded-2xl px-6 py-3 flex items-center justify-between shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2.5 rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.3)] border border-border">
              <TrendingUp className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300">
              ATS Studio
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="px-5 py-2 text-xs font-bold text-background bg-foreground rounded-xl hover:opacity-90 transition-all shadow-md cursor-pointer">
                  Sign In
                </button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <button
                onClick={() => setShowHistory(true)}
                className="flex items-center space-x-2 px-4 py-2 text-xs font-bold text-foreground premium-glass-secondary hover:premium-glass-hover rounded-xl transition-all cursor-pointer"
              >
                <History className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>History</span>
              </button>
              <UserButton appearance={{ elements: { avatarBox: "w-8 h-8 ring-2 ring-purple-500/30 shadow-sm" } }} />
            </Show>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 py-12 space-y-12 z-10">
        
        {/* Hero Section */}
        <section className="text-center space-y-5 max-w-3xl mx-auto mt-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-bold tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>AI-Powered Resume Optimization v2.0</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight pb-1">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 dark:from-white dark:via-slate-200 dark:to-slate-400">ATS Resume</span>{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500">Intelligence</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Elevate your professional narrative. Paste your target job description, drop your resume, and get instant feedback with AI-powered critiques and optimized bullet-points.
          </p>
        </section>

        {/* Input & Upload Dashboard Card */}
        <section className="premium-glass rounded-[2rem] p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Job Description Panel */}
            <div className="space-y-3">
              <label htmlFor="jd" className="flex items-center text-xs font-bold tracking-widest text-purple-600 dark:text-purple-400 uppercase">
                <Briefcase className="w-4 h-4 mr-2" />
                Target Job Description
                <span className="ml-2 px-2 py-0.5 rounded text-[10px] bg-black/5 dark:bg-white/[0.04] border border-black/10 dark:border-white/5 text-slate-600 dark:text-slate-400 lowercase">
                  Optional
                </span>
              </label>
              <textarea
                id="jd"
                rows={7}
                className="block w-full rounded-2xl border border-border p-4 text-foreground bg-background/60 placeholder:text-slate-600 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-transparent transition-all sm:text-sm resize-none premium-glass-secondary"
                placeholder="Paste the target job description to run match scoring and keyword gap reviews..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            {/* Dropzone Upload Panel */}
            <div className="space-y-3 flex flex-col">
              <label className="flex items-center text-xs font-bold tracking-widest text-cyan-600 dark:text-cyan-400 uppercase">
                <UploadCloud className="w-4 h-4 mr-2" />
                Resume Upload
                <span className="ml-2 px-2 py-0.5 rounded text-[10px] bg-black/5 dark:bg-white/[0.04] border border-black/10 dark:border-white/5 text-slate-600 dark:text-slate-400 lowercase">
                  PDF only
                </span>
              </label>
              <div
                {...getRootProps()}
                className={`group flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 premium-glass-secondary ${
                  isDragActive 
                    ? "border-cyan-400 bg-cyan-950/20" 
                    : "border-border hover:border-purple-500/40 hover:bg-purple-950/5"
                }`}
              >
                <input {...getInputProps()} />
                <div className={`p-4 rounded-xl mb-3.5 transition-all border border-border ${isDragActive ? "bg-cyan-100 dark:bg-cyan-900/45 text-cyan-600 dark:text-cyan-400" : "bg-foreground/5 text-slate-600 dark:text-slate-500 group-hover:text-purple-600 dark:group-hover:text-purple-500 group-hover:bg-purple-500/10"}`}>
                  <UploadCloud className="h-7 w-7 transition-colors duration-300" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">
                    {isDragActive ? "Drop your resume now" : "Drag & drop file or browse"}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-500 mt-1">Accepts PDF documents up to 5MB</p>
                </div>
              </div>
            </div>

          </div>

          {/* Uploaded File Bar / Action */}
          {file && (
            <div className="pt-4 border-t border-border animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex flex-col sm:flex-row items-center justify-between p-3 premium-glass-secondary rounded-2xl gap-4">
                <div className="flex items-center space-x-3.5 pl-2">
                  <div className="p-2.5 bg-background border border-border rounded-xl text-purple-600 dark:text-purple-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{file.name}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full sm:w-auto flex items-center justify-center px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-all duration-300 bg-gradient-to-r from-purple-500 via-indigo-600 to-cyan-500 rounded-xl hover:-translate-y-0.5 hover:shadow-[0_0_25px_rgba(168,85,247,0.45)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2.5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <span>Optimize Resume</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-950/20 border border-rose-500/25 rounded-2xl flex items-start space-x-3 text-rose-200 animate-in fade-in">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-rose-500" />
              <p className="text-xs sm:text-sm font-medium leading-relaxed">{error}</p>
            </div>
          )}
        </section>

        {/* Results Analytics Dashboard */}
        {results && (
          <section id="report-container" className="premium-glass rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden relative border border-border animate-in fade-in slide-in-from-bottom-6 duration-500">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
            
            {/* Top Info Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 border-b border-border">
              
              {/* Score Box */}
              <div className="p-8 sm:p-10 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-border bg-background/20">
                <div className="relative mb-6">
                  <svg className="w-40 h-40 transform -rotate-90">
                    <circle cx="80" cy="80" r="72" fill="none" strokeWidth="6" className="stroke-border" />
                    <circle 
                      cx="80" cy="80" r="72" fill="none" strokeWidth="8" 
                      strokeLinecap="round"
                      className={`${getScoreColor(results.ats_score)} ${getScoreGlow(results.ats_score)} transition-all duration-1000 ease-out`}
                      strokeDasharray="452.4"
                      strokeDashoffset={452.4 - (452.4 * results.ats_score) / 100}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-5xl font-black tracking-tight text-foreground">
                      {results.ats_score}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">ATS Index</span>
                  </div>
                </div>
                
                {/* Secondary Indicators */}
                <div className="grid grid-cols-3 w-full gap-2 mt-8 pt-6 border-t border-border text-center">
                  <div>
                    <span className="block text-xs font-semibold text-slate-600 dark:text-slate-500">JD Fit</span>
                    <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400 mt-1 block">
                      {results.match_percentage ? `${results.match_percentage}%` : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-600 dark:text-slate-500">Impact</span>
                    <span className="text-sm font-bold text-purple-600 dark:text-purple-400 mt-1 block">
                      {Math.max(50, 100 - results.critiques.length * 7)}%
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-600 dark:text-slate-500">Readability</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                      {Math.min(95, 60 + results.ats_score * 0.35)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="p-8 sm:p-10 lg:col-span-2 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-foreground flex items-center">
                      <Target className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                      Executive Assessment
                    </h3>
                    
                    <button 
                      onClick={handleDownloadPDF}
                      disabled={isDownloading}
                      data-html2canvas-ignore="true" 
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-foreground/5 hover:bg-foreground/10 text-foreground text-xs font-bold rounded-xl border border-border transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />}
                      <span>{isDownloading ? "Generating PDF..." : "Export Report"}</span>
                    </button>
                  </div>
                  
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
                    {results.summary}
                  </p>
                </div>
                
                {/* Gap Analysis / Missing Keywords */}
                {results.match_percentage && results.gap_analysis && results.gap_analysis.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-border space-y-3">
                    <span className="text-[10px] font-bold tracking-widest text-cyan-600 dark:text-cyan-400 uppercase flex items-center">
                      <Target className="w-3.5 h-3.5 mr-1.5" />
                      Missing Keyword Gap Analysis
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {results.gap_analysis.map((gap, i) => (
                        <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-background border border-border text-cyan-700 dark:text-cyan-300">
                          <AlertCircle className="w-3 h-3 mr-1.5" />
                          {gap}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Structured Critiques & Rewrites */}
            <div className="premium-glass rounded-[2rem] p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] mt-8">
              <h3 className="text-xl font-bold text-foreground mb-6 flex items-center">
                <Layers className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
                Strategic Action Plan
              </h3>
              
              <div className="space-y-8">
                {critiqueCategories.map((category) => (
                  <div key={category} className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <ChevronRight className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <h4 className="text-xs font-bold tracking-widest text-purple-700 dark:text-purple-300 uppercase">
                        {category}
                      </h4>
                      <span className="h-[1px] flex-1 bg-black/5 dark:bg-white/5"></span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {results.critiques
                        .filter((c) => c.category === category)
                        .map((critique) => {
                          const realIdx = results.critiques.indexOf(critique);
                          return (
                            <div 
                              key={realIdx} 
                              className="premium-glass-secondary premium-glass-hover rounded-2xl p-5 sm:p-6 cursor-pointer"
                            >
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
                                
                                {/* Issue block */}
                                <div className="space-y-2">
                                  <span className="text-[10px] font-bold tracking-widest text-slate-600 dark:text-slate-500 uppercase flex items-center">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-2 shadow-[0_0_8px_rgba(244,63,94,0.6)]"></span>
                                    Identified Friction Point
                                  </span>
                                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-medium">
                                    {critique.issue}
                                  </p>
                                </div>
                                
                                {/* Recommendation & action block */}
                                <div className="space-y-3 flex flex-col justify-between">
                                  <div className="space-y-2">
                                    <span className="text-[10px] font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase flex items-center">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 mr-2 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span>
                                      Action Recommendation
                                    </span>
                                    <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed font-semibold">
                                      {critique.solution}
                                    </p>
                                  </div>

                                  <div className="pt-3 border-t border-black/5 dark:border-white/5" data-html2canvas-ignore="true">
                                    {!rewrites[realIdx]?.text ? (
                                      <button
                                        onClick={() => handleRewrite(realIdx, critique.issue, critique.solution)}
                                        disabled={rewrites[realIdx]?.loading}
                                        className="inline-flex items-center text-xs font-bold text-cyan-700 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-950/20 hover:bg-cyan-200 dark:hover:bg-cyan-950/40 border border-cyan-300 dark:border-cyan-500/20 px-3.5 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                                      >
                                        {rewrites[realIdx]?.loading ? (
                                          <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin text-cyan-700 dark:text-cyan-400" />
                                        ) : (
                                          <Sparkle className="w-3.5 h-3.5 mr-2 text-cyan-700 dark:text-cyan-400" />
                                        )}
                                        {rewrites[realIdx]?.loading ? "Optimizing Bullet..." : "Optimize with AI"}
                                      </button>
                                    ) : (
                                      
                                      /* Terminal style comparisons */
                                      <div className="mt-2 rounded-2xl bg-black/60 border border-cyan-500/20 p-4 overflow-hidden shadow-inner backdrop-blur-md animate-in fade-in duration-300">
                                        <div className="flex items-center justify-between pb-2.5 border-b border-white/5 mb-3">
                                          <div className="flex items-center space-x-1.5">
                                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                            <span className="text-[9px] text-slate-500 font-mono pl-1.5">optimization-panel.sh</span>
                                          </div>
                                          <span className="text-[9px] text-cyan-400 font-bold bg-cyan-950/50 px-1.5 py-0.5 rounded">AUTO_REWRITE</span>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-[11px] font-mono mb-3">
                                          <div className="space-y-1">
                                            <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Before</span>
                                            <p className="text-slate-400 bg-rose-950/20 p-2 rounded-lg border border-rose-950/40 line-clamp-3">
                                              {critique.issue}
                                            </p>
                                          </div>
                                          <div className="space-y-1">
                                            <span className="text-[9px] text-cyan-400 uppercase tracking-wider block">Optimized</span>
                                            <p className="text-emerald-300 bg-emerald-950/20 p-2 rounded-lg border border-emerald-950/40 font-semibold line-clamp-3">
                                              {rewrites[realIdx].text}
                                            </p>
                                          </div>
                                        </div>
                                        
                                        <div className="pt-2.5 border-t border-white/5 text-xs text-slate-400 flex items-start">
                                          <Sparkle className="w-3.5 h-3.5 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" />
                                          <p>
                                            <span className="font-semibold text-slate-300">Why it fits: </span>
                                            {rewrites[realIdx].explanation}
                                          </p>
                                        </div>
                                      </div>

                                    )}
                                    
                                    {rewrites[realIdx]?.error && (
                                      <p className="text-rose-400 text-xs mt-2 font-medium">{rewrites[realIdx]?.error}</p>
                                    )}
                                  </div>
                                </div>

                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </section>
        )}

      </div>
    </main>
  );
}