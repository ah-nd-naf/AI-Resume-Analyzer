"use client";

import { useCallback, useState } from "react";
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
  Sparkles
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

export default function Home() {
  const { userId } = useAuth();
  
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setResults(null);
      setError(null);
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500 stroke-emerald-500";
    if (score >= 60) return "text-amber-500 stroke-amber-500";
    return "text-rose-500 stroke-rose-500";
  };

  const getScoreGlow = (score: number) => {
    if (score >= 80) return "drop-shadow-[0_0_20px_rgba(16,185,129,0.45)]";
    if (score >= 60) return "drop-shadow-[0_0_20px_rgba(245,158,11,0.45)]";
    return "drop-shadow-[0_0_20px_rgba(244,63,94,0.45)]";
  };

  return (
    <main className="min-h-screen bg-[#F5F7FA] font-sans selection:bg-indigo-100 selection:text-indigo-900 relative overflow-hidden flex flex-col">
      
      {/* Enhanced Ambient Background Entities for Glass Refraction */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] rounded-full bg-indigo-400/20 blur-[120px] mix-blend-multiply"></div>
        <div className="absolute top-[10%] right-[-5%] w-[35rem] h-[35rem] rounded-full bg-violet-400/20 blur-[120px] mix-blend-multiply"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[45rem] h-[45rem] rounded-full bg-blue-400/10 blur-[150px] mix-blend-multiply"></div>
      </div>

      {/* Ultra-Thin Frosted Glass Navigation Bar */}
      <nav className="sticky top-0 z-50 w-full backdrop-blur-2xl bg-white/40 border-b border-white/60 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-2 rounded-xl shadow-inner border border-white/20">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">AI Resume Analyzer</span>
          </div>
          <div>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="px-5 py-2 text-sm font-semibold text-white bg-slate-900/90 backdrop-blur-md rounded-full hover:bg-slate-800 transition-all shadow-md hover:shadow-lg border border-slate-700">
                  Sign In
                </button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <UserButton appearance={{ elements: { avatarBox: "w-9 h-9 ring-2 ring-white/50 shadow-sm" } }} />
            </Show>
          </div>
        </div>
      </nav>

      <div className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 space-y-12 z-10">
        
        {/* Premium Hero Section */}
        <div className="text-center space-y-6 max-w-3xl mx-auto mt-6">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/40 backdrop-blur-md border border-white/60 text-indigo-700 text-xs font-bold tracking-wide uppercase shadow-sm">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Powered by Gemini 3.5</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-slate-900 via-slate-700 to-slate-500 pb-2 drop-shadow-sm">
            Resume Intelligence
          </h1>
          <p className="text-lg text-slate-600/90 leading-relaxed font-medium">
            Elevate your career trajectory. Upload your resume for a deep-dive ATS analysis and actionable AI-driven improvements.
          </p>
        </div>

        {/* True Glassmorphism Input Form Card */}
        <div className="bg-white/40 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-8 sm:p-12 space-y-10 relative overflow-hidden">
          
          {/* Subtle interior glare */}
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>

          {/* Job Description Textarea */}
          <div className="space-y-3 relative z-10">
            <label htmlFor="jd" className="flex items-center text-sm font-bold tracking-wide text-slate-800 uppercase">
              Target Job Description <span className="ml-2 px-2 py-0.5 rounded text-[10px] bg-white/50 border border-white/60 text-slate-500 backdrop-blur-sm">Optional</span>
            </label>
            <p className="text-sm text-slate-500/90">
              Paste the job description you are applying for to get a customized match score and keyword gap analysis.
            </p>
            <textarea
              id="jd"
              rows={4}
              className="block w-full rounded-2xl border border-white/60 py-4 px-5 text-slate-800 shadow-inner bg-white/30 backdrop-blur-md focus:bg-white/60 focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all sm:text-sm sm:leading-6 resize-none placeholder:text-slate-400"
              placeholder="Paste job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          <div className="relative z-10">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-white/80 mix-blend-overlay"></div>
            </div>
          </div>

          {/* Glass Dropzone */}
          <div
            {...getRootProps()}
            className={`group relative z-10 flex flex-col items-center justify-center py-16 px-6 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 ease-out overflow-hidden ${
              isDragActive 
                ? "border-indigo-400 bg-indigo-50/50 scale-[1.01]" 
                : "border-slate-300/60 hover:border-indigo-300 bg-white/20 hover:bg-white/40 backdrop-blur-sm"
            }`}
          >
            <input {...getInputProps()} />
            <div className={`p-4 rounded-2xl mb-4 transition-all duration-300 shadow-sm border border-white/60 ${isDragActive ? "bg-indigo-100/80" : "bg-white/60 group-hover:bg-white/90"}`}>
              <UploadCloud className={`h-10 w-10 transition-colors duration-300 ${isDragActive ? "text-indigo-600" : "text-slate-500 group-hover:text-indigo-600"}`} />
            </div>
            <div className="text-center space-y-1">
              <p className="text-lg font-bold text-slate-700">
                {isDragActive ? "Drop your resume here" : "Click to upload or drag and drop"}
              </p>
              <p className="text-sm text-slate-500 font-medium">PDF documents only (up to 5MB)</p>
            </div>
          </div>

          {/* File Selected State */}
          {file && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white/60 backdrop-blur-xl rounded-2xl shadow-sm border border-white/80">
                <div className="flex items-center space-x-4 mb-4 sm:mb-0 pl-2">
                  <div className="p-2.5 bg-white/80 shadow-sm border border-white rounded-xl">
                    <FileText className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 line-clamp-1">{file.name}</p>
                    <p className="text-xs font-semibold text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full sm:w-auto flex items-center justify-center px-8 py-3.5 text-sm font-bold text-white transition-all duration-300 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-xl hover:from-indigo-600 hover:to-violet-600 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.23)] hover:-translate-y-0.5 border border-white/20"
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

          {/* Error Message */}
          {error && (
            <div className="p-5 bg-rose-500/10 backdrop-blur-md rounded-2xl border border-rose-500/20 flex items-start space-x-3 animate-in fade-in relative z-10 shadow-inner">
              <AlertCircle className="h-5 w-5 text-rose-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-rose-800 font-semibold leading-relaxed">{error}</p>
            </div>
          )}
        </div>

        {/* Glassmorphism Results Dashboard */}
        {results && (
          <div className="bg-white/40 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 relative">
            
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>

            {/* Top Section: Score & Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 border-b border-white/50 relative z-10">
              
              {/* Score Circular Display */}
              <div className="p-10 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/50 bg-white/20 relative overflow-hidden">
                <div className="relative flex items-center justify-center z-10">
                  <svg className="w-44 h-44 transform -rotate-90 drop-shadow-sm">
                    <circle cx="88" cy="88" r="80" fill="none" strokeWidth="8" className="stroke-white/60" />
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
                <h3 className="mt-6 text-xs font-black tracking-widest text-slate-500 uppercase drop-shadow-sm">Overall ATS Score</h3>
              </div>

              {/* Summary & JD Match Text */}
              <div className="p-10 md:col-span-2 flex flex-col justify-center bg-white/10">
                <h3 className="text-2xl font-extrabold text-slate-800 mb-4 drop-shadow-sm">Executive Summary</h3>
                <p className="text-slate-700 leading-relaxed text-lg mb-8 font-medium">
                  {results.summary}
                </p>
                
                {/* Conditionally render JD Match if provided */}
                {results.match_percentage && (
                  <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/10 backdrop-blur-md rounded-2xl p-6 border border-white/60 relative overflow-hidden shadow-sm">
                    <div className="absolute -right-4 -top-4 text-indigo-500/10 mix-blend-multiply">
                      <Target className="w-32 h-32" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-1.5 bg-white/60 rounded-lg shadow-sm border border-white">
                          <Target className="h-5 w-5 text-indigo-600" />
                        </div>
                        <h4 className="text-xl font-extrabold text-slate-800">JD Match: <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">{results.match_percentage}%</span></h4>
                      </div>
                      {results.gap_analysis && results.gap_analysis.length > 0 && (
                        <div>
                          <span className="text-xs font-bold tracking-widest text-indigo-800/70 uppercase block mb-3">Missing Keywords Found</span>
                          <div className="flex flex-wrap gap-2">
                            {results.gap_analysis.map((gap, i) => (
                              <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-white/80 backdrop-blur-sm text-indigo-900 shadow-sm border border-white">
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

            {/* Bottom Section: Critiques */}
            <div className="p-10 bg-white/10 relative z-10">
              <h3 className="text-2xl font-extrabold text-slate-800 mb-8 flex items-center drop-shadow-sm">
                <div className="p-1.5 bg-white/60 rounded-xl shadow-sm border border-white mr-3">
                  <CheckCircle2 className="h-6 w-6 text-indigo-600" />
                </div>
                Strategic Action Plan
              </h3>
              
              <div className="grid grid-cols-1 gap-6">
                {results.critiques.map((critique, idx) => (
                  <div key={idx} className="bg-white/50 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-white/80 hover:shadow-lg hover:bg-white/70 transition-all duration-300">
                    <div className="mb-6">
                      <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[11px] font-black tracking-widest bg-slate-900/5 border border-slate-900/10 text-slate-700 uppercase shadow-inner">
                        {critique.category}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                      <div className="space-y-3">
                        <span className="text-xs font-bold tracking-widest text-slate-500 uppercase flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mr-2 shadow-[0_0_8px_rgba(251,113,133,0.8)]"></span>
                          Current State
                        </span>
                        <p className="text-slate-700 text-sm leading-relaxed font-medium">
                          {critique.issue}
                        </p>
                      </div>
                      
                      <div className="hidden md:flex items-center justify-center absolute left-1/2 -ml-4 top-1/2 -mt-4">
                        <div className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-sm border border-white text-slate-400">
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>

                      <div className="space-y-3 md:pl-8">
                        <span className="text-xs font-bold tracking-widest text-emerald-600 uppercase flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                          Recommendation
                        </span>
                        <p className="text-slate-900 text-sm leading-relaxed font-bold">
                          {critique.solution}
                        </p>
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