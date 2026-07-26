"use client";

import { useDropzone } from "react-dropzone";
import {
  UploadCloud,
  FileText,
  AlertCircle,
  Loader2,
  ArrowRight,
  Briefcase,
} from "lucide-react";

type Props = {
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
  file: File | null;
  onDrop: (acceptedFiles: File[]) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  error: string | null;
};

export function UploadCard({
  jobDescription,
  onJobDescriptionChange,
  file,
  onDrop,
  onAnalyze,
  isAnalyzing,
  error,
}: Props) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  return (
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
            onChange={(e) => onJobDescriptionChange(e.target.value)}
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
              onClick={onAnalyze}
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
  );
}
