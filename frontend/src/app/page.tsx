"use client";

import { useCallback, useState, useEffect } from "react";
import { SignInButton, Show, UserButton, useAuth } from "@clerk/nextjs";
import { TrendingUp, Sparkles, History } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { HistorySidebar } from "@/components/resume/HistorySidebar";
import { UploadCard } from "@/components/resume/UploadCard";
import { ResultsDashboard } from "@/components/resume/ResultsDashboard";
import { analyzeResume, rewriteBullet, fetchHistory } from "@/lib/api";
import type { AnalysisResult, RewriteState, HistoryItem } from "@/types/resume";

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
      fetchHistory(userId)
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
      const data = await analyzeResume(formData);
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
      const data = await rewriteBullet(issue, solution);
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
      const html2canvas = (await import('html2canvas-pro')).default;
      const { jsPDF } = await import('jspdf');

      const isDark = document.documentElement.classList.contains('dark');
      const bgColor = isDark ? '#030014' : '#faf8fd';

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: bgColor,
        onclone: (clonedDoc) => {
          const container = clonedDoc.getElementById('report-container');
          if (container) {
            container.style.boxShadow = 'none';
            container.style.border = 'none';
            container.style.borderRadius = '0';

            // Fix main glass container
            container.style.background = bgColor;
            container.classList.remove('premium-glass');

            // Fix nested glass containers
            const glassElements = container.querySelectorAll('.premium-glass');
            glassElements.forEach((el) => {
              (el as HTMLElement).style.background = isDark ? '#0a0524' : '#ffffff';
              (el as HTMLElement).style.boxShadow = 'none';
            });

            const secondaryGlassElements = container.querySelectorAll('.premium-glass-secondary');
            secondaryGlassElements.forEach((el) => {
              (el as HTMLElement).style.background = isDark ? '#120b38' : '#ffffff';
              (el as HTMLElement).style.boxShadow = 'none';
              (el as HTMLElement).style.border = `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`;
            });

            // Fix SVG filters (drop-shadow causes white/black box artifacts in html2canvas)
            const svgs = container.querySelectorAll('svg, circle, path');
            svgs.forEach((el) => {
              (el as HTMLElement).style.filter = 'none';
            });

            // Hide the download button from PDF
            const downloadBtn = container.querySelector('[data-html2canvas-ignore="true"]');
            if (downloadBtn) {
               (downloadBtn as HTMLElement).style.display = 'none';
            }
          }
        }
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.98);

      const pdf = new jsPDF({
        unit: 'in',
        format: 'letter',
        orientation: 'portrait'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const margin = 0.5; // 0.5 inch margin
      const renderWidth = pdfWidth - (margin * 2);
      const renderHeight = (canvas.height * renderWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', margin, margin, renderWidth, renderHeight);
      pdf.save(`${file?.name ? file.name.split('.')[0] : 'Resume'}_AI_Analysis.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF", error);
      alert("Something went wrong while generating the PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <main className="min-h-screen font-sans text-foreground relative overflow-hidden flex flex-col pb-24 transition-colors duration-300">

      {/* Background Grids & Orbs */}
      <div className="absolute inset-0 premium-grid opacity-35 pointer-events-none -z-20"></div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-15%] left-[-15%] w-[60rem] h-[60rem] rounded-full bg-purple-900/10 blur-[140px] animate-pulse-glow"></div>
        <div className="absolute top-[25%] right-[-10%] w-[50rem] h-[50rem] rounded-full bg-indigo-900/10 blur-[150px] animate-float-slow"></div>
        <div className="absolute bottom-[-10%] left-[15%] w-[55rem] h-[55rem] rounded-full bg-cyan-900/10 blur-[130px]"></div>
      </div>

      <HistorySidebar
        history={history}
        showHistory={showHistory}
        onClose={() => setShowHistory(false)}
      />

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
            <span>AI-Powered by Groq · Llama 3.3</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight pb-1">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 dark:from-white dark:via-slate-200 dark:to-slate-400">ATS Resume</span>{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500">Intelligence</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Elevate your professional narrative. Paste your target job description, drop your resume, and get instant feedback with AI-powered critiques and optimized bullet-points.
          </p>
        </section>

        <UploadCard
          jobDescription={jobDescription}
          onJobDescriptionChange={setJobDescription}
          file={file}
          onDrop={onDrop}
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
          error={error}
        />

        {results && (
          <ResultsDashboard
            results={results}
            rewrites={rewrites}
            onRewrite={handleRewrite}
            file={file}
            isDownloading={isDownloading}
            onDownload={handleDownloadPDF}
          />
        )}

      </div>
    </main>
  );
}