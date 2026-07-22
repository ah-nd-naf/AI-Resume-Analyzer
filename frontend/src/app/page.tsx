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
    if (score >= 80) return "drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]";
    if (score >= 60) return "drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]";
    return "drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]";
  };

  return (
    <main className="min-h-screen bg-[#FAFCFF] font-sans selection:bg-indigo-100 selection:text-indigo-900 relative overflow-hidden flex flex-col">
      
      {/* Ambient Background Blur Entities */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 rounded-full bg-indigo-500/10 blur-[100px]"></div>
        <div className="absolute top-[20%] right-[-5%] w-96 h-96 rounded-full bg-violet-500/10 blur-[100px]"></div>
      </div>

      {/* Frosted Glass Navigation Bar */}
      <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/70 border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">AI Resume Analyzer</span>
          </div>
          <div>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 rounded-full hover:bg-slate-800 transition-all shadow-md hover:shadow-lg">
                  Sign In
                </button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <UserButton appearance={{ elements: { avatarBox: "w-9 h-9" } }} />
            </Show>
          </div>
        </div>
      </nav>

      <div className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 space-y-12 z-10">
        
        {/* Premium Hero Section */}
        <div className="text-center space-y-6 max-w-3xl mx-auto mt-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100/50 text-indigo-600 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Powered by Gemini 3.5</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-slate-900 via-slate-800 to-slate-500 pb-2">
            Resume Intelligence
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Elevate your career trajectory. Upload your resume for a deep-dive ATS analysis and actionable AI-driven improvements.
          </p>
        </div>

        {/* Floating Input Form Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-slate-200/50 ring-1 ring-slate-900/5 p-8 sm:p-12 space-y-10">
          
          {/* Job Description Textarea */}
          <div className="space-y-3">
            <label htmlFor="jd" className="flex items-center text-sm font-bold tracking-wide text-slate-900 uppercase">
              Target Job Description <span className="ml-2 px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-500">Optional</span>
            </label>
            <p className="text-sm text-slate-500">
              Paste the job description you are applying for to get a customized match score and keyword gap analysis.
            </p>
            <textarea
              id="jd"
              rows={4}
              className="block w-full rounded-2xl border-0 py-4 px-5 text-slate-900 shadow-inner bg-slate-50/50 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 focus:bg-white transition-all sm:text-sm sm:leading-6 resize-none"
              placeholder="Paste job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-200/60"></div>
            </div>
          </div>

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`group relative flex flex-col items-center justify-center py-16 px-6 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 ease-out ${
              isDragActive 
                ? "border-indigo-500 bg-indigo-50/80 scale-[1.01]" 
                : "border-slate-200 hover:border-indigo-400 hover:bg-slate-50/50"
            }`}
          >
            <input {...getInputProps()} />
            <div className={`p-4 rounded-2xl mb-4 transition-all duration-300 ${isDragActive ? "bg-indigo-100" : "bg-slate-100 group-hover:bg-indigo-50"}`}>
              <UploadCloud className={`h-10 w-10 transition-colors duration-300 ${isDragActive ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-600"}`} />
            </div>
            <div className="text-center space-y-1">
              <p className="text-lg font-semibold text-slate-700">
                {isDragActive ? "Drop your resume here" : "Click to upload or drag and drop"}
              </p>
              <p className="text-sm text-slate-500">PDF documents only (up to 5MB)</p>
            </div>
          </div>

          {/* File Selected State */}
          {file && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5">
                <div className="flex items-center space-x-4 mb-4 sm:mb-0 pl-2">
                  <div className="p-2.5 bg-indigo-50 rounded-xl">
                    <FileText className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 line-clamp-1">{file.name}</p>
                    <p className="text-xs font-medium text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full sm:w-auto flex items-center justify-center px-8 py-3.5 text-sm font-bold text-white transition-all duration-300 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl hover:from-indigo-700 hover:to-violet-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-xl hover:-translate-y-0.5"
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
            <div className="p-5 bg-rose-50/80 backdrop-blur-sm rounded-2xl border border-rose-100 flex items-start space-x-3 animate-in fade-in">
              <AlertCircle className="h-5 w-5 text-rose-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-rose-800 font-medium leading-relaxed">{error}</p>
            </div>
          )}
        </div>

        {/* Results Dashboard */}
        {results && (
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-slate-200/50 ring-1 ring-slate-900/5 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            {/* Top Section: Score & Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 border-b border-slate-100">
              
              {/* Score Circular Display */}
              <div className="p-10 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/30 relative overflow-hidden">
                <div className="relative flex items-center justify-center z-10">
                  <svg className="w-44 h-44 transform -rotate-90">
                    <circle cx="88" cy="88" r="80" fill="none" strokeWidth="8" className="stroke-slate-100" />
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
                <h3 className="mt-6 text-xs font-black tracking-widest text-slate-400 uppercase">Overall ATS Score</h3>
              </div>

              {/* Summary & JD Match Text */}
              <div className="p-10 md:col-span-2 flex flex-col justify-center">
                <h3 className="text-2xl font-extrabold text-slate-900 mb-4">Executive Summary</h3>
                <p className="text-slate-600 leading-relaxed text-lg mb-8">
                  {results.summary}
                </p>
                
                {/* Conditionally render JD Match if provided */}
                {results.match_percentage && (
                  <div className="bg-gradient-to-br from-indigo-50/50 to-violet-50/50 rounded-2xl p-6 ring-1 ring-indigo-100/50 relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 text-indigo-500/10">
                      <Target className="w-32 h-32" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center space-x-3 mb-4">
                        <Target className="h-6 w-6 text-indigo-600" />
                        <h4 className="text-xl font-bold text-slate-900">JD Match: <span className="text-indigo-600">{results.match_percentage}%</span></h4>
                      </div>
                      {results.gap_analysis && results.gap_analysis.length > 0 && (
                        <div>
                          <span className="text-xs font-bold tracking-widest text-indigo-400 uppercase block mb-3">Missing Keywords Found</span>
                          <div className="flex flex-wrap gap-2">
                            {results.gap_analysis.map((gap, i) => (
                              <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-white text-indigo-900 shadow-sm ring-1 ring-indigo-900/5">
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
            <div className="p-10 bg-slate-50/30">
              <h3 className="text-2xl font-extrabold text-slate-900 mb-8 flex items-center">
                <CheckCircle2 className="h-7 w-7 text-indigo-500 mr-3" />
                Strategic Action Plan
              </h3>
              
              <div className="grid grid-cols-1 gap-6">
                {results.critiques.map((critique, idx) => (
                  <div key={idx} className="bg-white rounded-3xl p-8 shadow-sm ring-1 ring-slate-900/5 hover:shadow-lg hover:ring-indigo-100 transition-all duration-300">
                    <div className="mb-6">
                      <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-[11px] font-black tracking-widest bg-slate-100 text-slate-600 uppercase">
                        {critique.category}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                      <div className="space-y-3">
                        <span className="text-xs font-bold tracking-widest text-slate-400 uppercase block flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mr-2"></span>
                          Current State
                        </span>
                        <p className="text-slate-600 text-sm leading-relaxed">
                          {critique.issue}
                        </p>
                      </div>
                      
                      <div className="hidden md:flex items-center justify-center absolute left-1/2 -ml-4 top-1/2 -mt-4">
                        <div className="bg-slate-50 p-2 rounded-full ring-1 ring-slate-100">
                          <ArrowRight className="h-4 w-4 text-slate-300" />
                        </div>
                      </div>

                      <div className="space-y-3 md:pl-8">
                        <span className="text-xs font-bold tracking-widest text-emerald-500 uppercase block flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
                          Recommendation
                        </span>
                        <p className="text-slate-900 text-sm leading-relaxed font-medium">
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