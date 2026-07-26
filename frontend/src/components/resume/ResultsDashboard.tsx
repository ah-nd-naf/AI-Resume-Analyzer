"use client";

import {
  AlertCircle,
  Loader2,
  Target,
  Layers,
  ChevronRight,
  Download,
} from "lucide-react";
import type { AnalysisResult, RewriteState } from "@/types/resume";
import { CritiqueCard } from "@/components/resume/CritiqueCard";

type Props = {
  results: AnalysisResult;
  rewrites: Record<number, RewriteState>;
  onRewrite: (idx: number, issue: string, solution: string) => void;
  file: File | null;
  isDownloading: boolean;
  onDownload: () => void;
};

function getScoreColor(score: number) {
  if (score >= 80) return "text-emerald-400 stroke-emerald-400";
  if (score >= 60) return "text-amber-400 stroke-amber-400";
  return "text-rose-400 stroke-rose-400";
}

function getScoreGlow(score: number) {
  if (score >= 80) return "glow-emerald";
  if (score >= 60) return "glow-amber";
  return "glow-rose";
}

export function ResultsDashboard({
  results,
  rewrites,
  onRewrite,
  isDownloading,
  onDownload,
}: Props) {
  // Get unique critique categories
  const critiqueCategories = Array.from(new Set(results.critiques.map((c) => c.category)));

  return (
    <section id="report-container" className="premium-glass rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden relative border border-border animate-in fade-in slide-in-from-bottom-6 duration-500">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>

      {/* Top Info Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 border-b border-border">

        {/* Score Box */}
        <div className="p-8 sm:p-10 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-border bg-background/20">
          <div className="relative mb-6">
            {/* Arc SVG — rotated for top-start animation */}
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
            {/* Text overlay SVG — NOT rotated, sits on top of arc */}
            <svg className="absolute inset-0 w-40 h-40" viewBox="0 0 160 160">
              <text
                x="80" y="72"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  fill: 'currentColor',
                  fontSize: '2.5rem',
                  fontWeight: '900',
                  letterSpacing: '-0.02em',
                }}
              >
                {results.ats_score}
              </text>
              <text
                x="80" y="98"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  fill: '#64748b',
                  fontSize: '0.52rem',
                  fontWeight: '700',
                  letterSpacing: '0.12em',
                }}
              >
                ATS INDEX
              </text>
            </svg>
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
                {Math.round(Math.min(95, 60 + results.ats_score * 0.35))}%
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
                onClick={onDownload}
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
                      <CritiqueCard
                        key={realIdx}
                        critique={critique}
                        realIdx={realIdx}
                        rewrite={rewrites[realIdx]}
                        onRewrite={onRewrite}
                      />
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
