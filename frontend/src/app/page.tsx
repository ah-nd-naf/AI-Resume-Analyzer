"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { 
  UploadCloud, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  ArrowRight,
  TrendingUp,
  Target
} from "lucide-react";

type Critique = {
  category: string;
  issue: string;
  solution: string;
};

type AnalysisResult = {
  ats_score: number;
  match_percentage?: number | null; // NEW: Prepared for JD Matching
  gap_analysis?: string[] | null;   // NEW: Prepared for JD Matching
  summary: string;
  critiques: Critique[];
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState(""); // NEW: State for JD
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
    
    // NEW: Append the Job Description to our API request if it exists
    if (jobDescription.trim()) {
      formData.append("job_description", jobDescription.trim());
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
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-amber-500";
    return "text-rose-500";
  };

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-2xl mb-2">
            <TrendingUp className="h-8 w-8 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
            AI Resume Intelligence
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-600">
            Elevate your career trajectory. Upload your resume for a deep-dive ATS analysis and actionable AI-driven improvements.
          </p>
        </div>

        {/* Input Form Card */}
        <div className="bg-white rounded-3xl shadow-xl ring-1 ring-slate-900/5 p-6 sm:p-10 space-y-8">
          
          {/* NEW: Job Description Textarea */}
          <div>
            <label htmlFor="jd" className="block text-sm font-semibold text-slate-900 mb-2">
              Target Job Description <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <p className="text-sm text-slate-500 mb-4">
              Paste the job description you are applying for to get a customized match score and keyword gap analysis.
            </p>
            <textarea
              id="jd"
              rows={5}
              className="block w-full rounded-xl border-0 py-3 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              placeholder="Paste job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          <hr className="border-slate-100" />

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`group relative flex flex-col items-center justify-center py-12 px-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ease-in-out ${
              isDragActive 
                ? "border-indigo-500 bg-indigo-50/50" 
                : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50"
            }`}
          >
            <input {...getInputProps()} />
            <UploadCloud className={`h-12 w-12 mb-4 transition-colors duration-200 ${isDragActive ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-500"}`} />
            <div className="text-center">
              <p className="text-lg font-semibold text-slate-700">
                {isDragActive ? "Drop your resume here" : "Click to upload or drag and drop"}
              </p>
              <p className="text-sm text-slate-500 mt-1">PDF documents only (up to 5MB)</p>
            </div>
          </div>

          {/* File Selected State */}
          {file && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col sm:flex-row items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                  <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                    <FileText className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white transition-all duration-200 bg-indigo-600 border border-transparent rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing...
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
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-rose-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-rose-800 font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* Results Dashboard */}
        {results && (
          <div className="bg-white rounded-3xl shadow-xl ring-1 ring-slate-900/5 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            {/* Top Section: Score & Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 border-b border-slate-100">
              
              {/* Score Circular Display */}
              <div className="p-8 md:p-10 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/50">
                <div className="relative flex items-center justify-center">
                  <svg className="w-40 h-40 transform -rotate-90">
                    <circle cx="80" cy="80" r="74" fill="none" strokeWidth="8" className="stroke-slate-200" />
                    <circle 
                      cx="80" cy="80" r="74" fill="none" strokeWidth="8" 
                      strokeLinecap="round"
                      className={`${getScoreColor(results.ats_score)} transition-all duration-1000 ease-out`}
                      strokeDasharray="465"
                      strokeDashoffset={465 - (465 * results.ats_score) / 100}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className={`text-5xl font-black tracking-tighter ${getScoreColor(results.ats_score)}`}>
                      {results.ats_score}
                    </span>
                  </div>
                </div>
                <h3 className="mt-6 text-sm font-bold tracking-widest text-slate-400 uppercase">Overall ATS Score</h3>
              </div>

              {/* Summary & JD Match Text */}
              <div className="p-8 md:p-10 md:col-span-2 flex flex-col justify-center">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Executive Summary</h3>
                <p className="text-slate-600 leading-relaxed text-lg mb-6">
                  {results.summary}
                </p>
                
                {/* Conditionally render JD Match if provided */}
                {results.match_percentage && (
                  <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
                    <div className="flex items-center space-x-3 mb-3">
                      <Target className="h-6 w-6 text-indigo-600" />
                      <h4 className="text-lg font-bold text-slate-900">JD Match: {results.match_percentage}%</h4>
                    </div>
                    {results.gap_analysis && results.gap_analysis.length > 0 && (
                      <div>
                        <span className="text-xs font-bold tracking-wider text-indigo-800 uppercase block mb-2">Missing Keywords / Gaps</span>
                        <div className="flex flex-wrap gap-2">
                          {results.gap_analysis.map((gap, i) => (
                            <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white text-slate-700 border border-slate-200 shadow-sm">
                              {gap}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Section: Critiques */}
            <div className="p-8 md:p-10 bg-slate-50/30">
              <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center">
                <CheckCircle2 className="h-6 w-6 text-indigo-500 mr-3" />
                Strategic Improvements
              </h3>
              
              <div className="grid grid-cols-1 gap-6">
                {results.critiques.map((critique, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-slate-200 hover:shadow-md transition-shadow duration-200">
                    <div className="mb-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-indigo-50 text-indigo-700 uppercase">
                        {critique.category}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <span className="text-xs font-bold tracking-wider text-slate-400 uppercase block">Current State</span>
                        <p className="text-slate-700 text-sm leading-relaxed">
                          {critique.issue}
                        </p>
                      </div>
                      
                      <div className="hidden md:flex items-center justify-center absolute left-1/2 -ml-3 mt-8">
                        <ArrowRight className="h-5 w-5 text-slate-300" />
                      </div>

                      <div className="space-y-2 md:pl-6 md:border-l border-slate-100">
                        <span className="text-xs font-bold tracking-wider text-emerald-500 uppercase block">Recommended Action</span>
                        <p className="text-slate-700 text-sm leading-relaxed font-medium">
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