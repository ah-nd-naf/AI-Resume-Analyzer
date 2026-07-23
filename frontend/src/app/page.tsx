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
  Download 
} from "lucide-react";

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
      fetch(`http://127.0.0.1:8000/api/resumes/history?user_id=${userId}`)
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
      const response = await fetch("http://127.0.0.1:8000/api/resumes/upload", {
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
      const response = await fetch("http://127.0.0.1:8000/api/resumes/rewrite", {
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
        margin:       [0.5, 0.5, 0.5, 0.5],
        filename:     `${file?.name ? file.name.split('.')[0] : 'Resume'}_AI_Analysis.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#020617' }, 
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
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
    if (score >= 80) return "drop-shadow-[0_0_20px_rgba(52,211,153,0.6)]";
    if (score >= 60) return "drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]";
    return "drop-shadow-[0_0_20px_rgba(244,63,94,0.6)]";
  };

  return (
    <main className="min-h-screen bg-slate-950 font-sans text-slate-200 selection:bg-cyan-500/30 selection:text-cyan-100 relative overflow-hidden flex flex-col">
      
      {showHistory && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity" 
          onClick={() => setShowHistory(false)}
        ></div>
      )}

      <div className={`fixed inset-y-0 left-0 z-50 w-full sm:w-96 bg-slate-900/60 backdrop-blur-3xl border-r border-white/10 shadow-2xl transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${showHistory ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-900/40">
          <h2 className="text-xl font-extrabold text-white flex items-center">
            <History className="w-5 h-5 mr-2 text-cyan-400" />
            Recent Uploads
          </h2>
          <button 
            onClick={() => setShowHistory(false)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {history.length === 0 ? (
            <div className="text-center text-slate-500 mt-10">
              <FileText className="w-12 h-12 mx-auto text-slate-600 mb-3" />
              <p>No past resumes found.</p>
            </div>
          ) : (
            history.map((item) => (
              <div key={item.id} className="p-4 bg-slate-800/40 backdrop-blur-md rounded-2xl shadow-sm border border-white/5 hover:border-white/20 hover:bg-slate-800/60 transition-all cursor-pointer group">
                <p className="font-bold text-sm text-slate-200 truncate mb-1 group-hover:text-cyan-400 transition-colors">
                  {item.filename}
                </p>
                <p className="text-xs font-medium text-slate-400 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] rounded-full bg-cyan-500/10 blur-[120px] mix-blend-screen"></div>
        <div className="absolute top-[10%] right-[-5%] w-[35rem] h-[35rem] rounded-full bg-fuchsia-500/10 blur-[120px] mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[45rem] h-[45rem] rounded-full bg-indigo-500/10 blur-[150px] mix-blend-screen"></div>
      </div>

      <nav className="sticky top-0 z-30 w-full backdrop-blur-2xl bg-slate-950/50 border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-cyan-400 to-indigo-600 p-2 rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.4)] border border-white/20">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white hidden sm:block">AI Resume Analyzer</span>
          </div>
          <div className="flex items-center space-x-3">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="px-5 py-2 text-sm font-semibold text-slate-900 bg-white backdrop-blur-md rounded-full hover:bg-slate-200 transition-all shadow-md border border-transparent">
                  Sign In
                </button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <button
                onClick={() => setShowHistory(true)}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-bold text-slate-300 bg-slate-800/50 hover:bg-slate-700/50 hover:text-white backdrop-blur-md rounded-full border border-white/10 shadow-sm transition-all"
              >
                <History className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">History</span>
              </button>
              <UserButton appearance={{ elements: { avatarBox: "w-9 h-9 ring-2 ring-slate-700 shadow-sm" } }} />
            </Show>
          </div>
        </div>
      </nav>

      <div className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 space-y-12 z-10">
        
        <div className="text-center space-y-6 max-w-3xl mx-auto mt-6">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-900/50 backdrop-blur-md border border-white/10 text-cyan-400 text-xs font-bold tracking-wide uppercase shadow-sm">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Powered by Gemini 3.5</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-500 pb-2 drop-shadow-sm">
            Resume Intelligence
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed font-medium">
            Elevate your career trajectory. Upload your resume for a deep-dive ATS analysis and actionable AI-driven improvements.
          </p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/10 p-8 sm:p-12 space-y-10 relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

          <div className="space-y-3 relative z-10">
            <label htmlFor="jd" className="flex items-center text-sm font-bold tracking-wide text-slate-300 uppercase">
              Target Job Description <span className="ml-2 px-2 py-0.5 rounded text-[10px] bg-slate-800 border border-white/10 text-slate-400 backdrop-blur-sm">Optional</span>
            </label>
            <p className="text-sm text-slate-500">
              Paste the job description you are applying for to get a customized match score and keyword gap analysis.
            </p>
            <textarea
              id="jd"
              rows={4}
              className="block w-full rounded-2xl border border-white/10 py-4 px-5 text-white shadow-inner bg-slate-950/50 backdrop-blur-md focus:bg-slate-900/80 focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all sm:text-sm sm:leading-6 resize-none placeholder:text-slate-600"
              placeholder="Paste job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          <div className="relative z-10">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-white/10 mix-blend-overlay"></div>
            </div>
          </div>

          <div
            {...getRootProps()}
            className={`group relative z-10 flex flex-col items-center justify-center py-16 px-6 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 ease-out overflow-hidden ${
              isDragActive 
                ? "border-cyan-400 bg-cyan-950/20 scale-[1.01]" 
                : "border-slate-700/60 hover:border-cyan-500/50 bg-slate-950/30 hover:bg-slate-900/50 backdrop-blur-sm"
            }`}
          >
            <input {...getInputProps()} />
            <div className={`p-4 rounded-2xl mb-4 transition-all duration-300 shadow-sm border border-white/10 ${isDragActive ? "bg-cyan-900/50" : "bg-slate-800 group-hover:bg-slate-800/80"}`}>
              <UploadCloud className={`h-10 w-10 transition-colors duration-300 ${isDragActive ? "text-cyan-400" : "text-slate-400 group-hover:text-cyan-400"}`} />
            </div>
            <div className="text-center space-y-1">
              <p className="text-lg font-bold text-slate-300">
                {isDragActive ? "Drop your resume here" : "Click to upload or drag and drop"}
              </p>
              <p className="text-sm text-slate-500 font-medium">PDF documents only (up to 5MB)</p>
            </div>
          </div>

          {file && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-sm border border-white/10">
                <div className="flex items-center space-x-4 mb-4 sm:mb-0 pl-2">
                  <div className="p-2.5 bg-slate-900 shadow-sm border border-white/10 rounded-xl">
                    <FileText className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white line-clamp-1">{file.name}</p>
                    <p className="text-xs font-semibold text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full sm:w-auto flex items-center justify-center px-8 py-3.5 text-sm font-bold text-white transition-all duration-300 bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-xl hover:from-cyan-400 hover:to-indigo-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-cyan-400 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:-translate-y-0.5 border border-white/10"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      Running AI Analysis...
                    </>
                  ) : (
                    "Analyze Resume"
                  )}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="p-5 bg-rose-950/50 backdrop-blur-md rounded-2xl border border-rose-500/30 flex items-start space-x-3 animate-in fade-in relative z-10 shadow-inner">
              <AlertCircle className="h-5 w-5 text-rose-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-rose-200 font-semibold leading-relaxed">{error}</p>
            </div>
          )}
        </div>

        {results && (
          <div id="report-container" className="bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/10 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 relative">
            
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 border-b border-white/10 relative z-10">
              
              <div className="p-10 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/10 bg-slate-800/30 relative overflow-hidden">
                <div className="relative flex items-center justify-center z-10">
                  <svg className="w-44 h-44 transform -rotate-90 drop-shadow-sm">
                    <circle cx="88" cy="88" r="80" fill="none" strokeWidth="8" className="stroke-slate-800" />
                    <circle 
                      cx="88" cy="88" r="80" fill="none" strokeWidth="10" 
                      strokeLinecap="round"
                      className={`${getScoreColor(results.ats_score)} ${getScoreGlow(results.ats_score)} transition-all duration-1500 ease-out`}
                      strokeDasharray="502"
                      strokeDashoffset={502 - (502 * results.ats_score) / 100}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className={`text-6xl font-black tracking-tighter ${getScoreColor(results.ats_score).split(' ')[0]}`}>
                      {results.ats_score}
                    </span>
                  </div>
                </div>
                <h3 className="mt-6 text-xs font-black tracking-widest text-slate-400 uppercase drop-shadow-sm">Overall ATS Score</h3>
              </div>

              <div className="p-10 md:col-span-2 flex flex-col justify-center bg-slate-900/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                  <h3 className="text-2xl font-extrabold text-white drop-shadow-sm">Executive Summary</h3>
                  
                  <button
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                    data-html2canvas-ignore="true" 
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-sm font-bold rounded-xl border border-cyan-500/30 transition-all disabled:opacity-50"
                  >
                    {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    <span>{isDownloading ? 'Generating...' : 'Export PDF'}</span>
                  </button>
                </div>
                
                <p className="text-slate-300 leading-relaxed text-lg mb-8 font-medium">
                  {results.summary}
                </p>
                
                {results.match_percentage && (
                  <div className="bg-gradient-to-br from-cyan-950/40 to-indigo-950/40 backdrop-blur-md rounded-2xl p-6 border border-white/10 relative overflow-hidden shadow-sm">
                    <div className="absolute -right-4 -top-4 text-cyan-500/10 mix-blend-screen">
                      <Target className="w-32 h-32" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-1.5 bg-slate-800 rounded-lg shadow-sm border border-white/10">
                          <Target className="h-5 w-5 text-cyan-400" />
                        </div>
                        <h4 className="text-xl font-extrabold text-white">JD Match: <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">{results.match_percentage}%</span></h4>
                      </div>
                      {results.gap_analysis && results.gap_analysis.length > 0 && (
                        <div>
                          <span className="text-xs font-bold tracking-widest text-cyan-400/80 uppercase block mb-3">Missing Keywords Found</span>
                          <div className="flex flex-wrap gap-2">
                            {results.gap_analysis.map((gap, i) => (
                              <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-slate-950/50 backdrop-blur-sm text-cyan-300 shadow-sm border border-white/10">
                                {gap}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-10 bg-slate-900/20 relative z-10">
              <h3 className="text-2xl font-extrabold text-white mb-8 flex items-center drop-shadow-sm">
                <div className="p-1.5 bg-slate-800 rounded-xl shadow-sm border border-white/10 mr-3">
                  <CheckCircle2 className="h-6 w-6 text-cyan-400" />
                </div>
                Strategic Action Plan
              </h3>
              
              <div className="grid grid-cols-1 gap-6">
                {results.critiques.map((critique, idx) => (
                  <div key={idx} className="bg-slate-800/40 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-white/10 hover:shadow-lg hover:bg-slate-800/60 hover:border-white/20 transition-all duration-300">
                    <div className="mb-6">
                      <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[11px] font-black tracking-widest bg-slate-950/50 border border-slate-700 text-slate-300 uppercase shadow-inner">
                        {critique.category}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                      <div className="space-y-3">
                        <span className="text-xs font-bold tracking-widest text-slate-400 uppercase flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-2 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span>
                          Current State
                        </span>
                        <p className="text-slate-300 text-sm leading-relaxed font-medium">
                          {critique.issue}
                        </p>
                      </div>
                      
                      <div className="hidden md:flex items-center justify-center absolute left-1/2 -ml-4 top-1/2 -mt-4">
                        <div className="bg-slate-900 backdrop-blur-sm p-2 rounded-full shadow-sm border border-white/10 text-slate-500">
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>

                      <div className="space-y-3 md:pl-8">
                        <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                          Recommendation
                        </span>
                        <p className="text-white text-sm leading-relaxed font-bold">
                          {critique.solution}
                        </p>

                        <div className="mt-4 pt-4 border-t border-slate-700/50" data-html2canvas-ignore="true">
                          {!rewrites[idx]?.text ? (
                            <button
                              onClick={() => handleRewrite(idx, critique.issue, critique.solution)}
                              disabled={rewrites[idx]?.loading}
                              className="flex items-center text-xs font-bold text-cyan-400 hover:text-cyan-300 bg-slate-950/50 hover:bg-slate-900 border border-white/10 px-4 py-2 rounded-xl transition-all shadow-sm disabled:opacity-50"
                            >
                              {rewrites[idx]?.loading ? (
                                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                              ) : (
                                <Sparkles className="w-3.5 h-3.5 mr-2" />
                              )}
                              {rewrites[idx]?.loading ? "Generating Magic Rewrite..." : "Rewrite with AI"}
                            </button>
                          ) : (
                            <div className="bg-cyan-950/30 p-5 rounded-2xl border border-cyan-500/20 shadow-sm animate-in fade-in zoom-in duration-300">
                              <span className="text-[10px] font-black tracking-widest text-cyan-400 uppercase mb-3 flex items-center">
                                <Sparkles className="w-3.5 h-3.5 mr-1.5" /> 
                                AI Optimized Bullet Point
                              </span>
                              <p className="text-white text-sm font-bold mb-3 italic">
                                "{rewrites[idx].text}"
                              </p>
                              <p className="text-slate-400 text-xs font-medium leading-relaxed">
                                <span className="font-bold text-slate-300">Why this works:</span> {rewrites[idx].explanation}
                              </p>
                            </div>
                          )}
                          {rewrites[idx]?.error && (
                            <p className="text-rose-400 text-xs mt-2 font-medium">{rewrites[idx]?.error}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}