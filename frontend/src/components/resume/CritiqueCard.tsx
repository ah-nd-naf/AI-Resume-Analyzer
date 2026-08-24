"use client";

import { useState } from "react";
import { Loader2, Sparkles, Copy, Check, AlertTriangle, AlertCircle, Info, ChevronRight } from "lucide-react";
import type { Critique, RewriteState } from "@/types/resume";

type Props = {
  critique: Critique;
  realIdx: number;
  rewrite: RewriteState | undefined;
  onRewrite: (idx: number, issue: string, solution: string) => void;
};

export function CritiqueCard({ critique, realIdx, rewrite, onRewrite }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSeverityBadge = (severity?: string) => {
    const sev = severity?.toLowerCase() || "warning";
    if (sev === "critical") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/15 text-rose-500 dark:text-rose-400 border border-rose-500/30">
          <AlertCircle className="w-3 h-3 mr-1" />
          Critical Friction
        </span>
      );
    }
    if (sev === "suggestion") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
          <Info className="w-3 h-3 mr-1" />
          Polish Suggestion
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
        <AlertTriangle className="w-3 h-3 mr-1" />
        Recommended
      </span>
    );
  };

  return (
    <div
      key={realIdx}
      className="premium-glass-secondary premium-glass-hover rounded-2xl p-5 sm:p-6 transition-all duration-300 border border-border"
    >
      {/* Card Header with Severity & Category */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-border">
        <div className="flex items-center space-x-2">
          {getSeverityBadge(critique.severity)}
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            in <span className="font-bold text-foreground">{critique.category}</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
        {/* Issue block */}
        <div className="space-y-2 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-slate-600 dark:text-slate-400 uppercase flex items-center mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-2 shadow-[0_0_8px_rgba(244,63,94,0.6)]"></span>
              Identified Friction Point
            </span>
            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-medium">
              {critique.issue}
            </p>
          </div>
        </div>

        {/* Recommendation & action block */}
        <div className="space-y-3 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase flex items-center mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 mr-2 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span>
              Action Strategy
            </span>
            <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed font-semibold">
              {critique.solution}
            </p>
          </div>

          <div className="pt-3 border-t border-border" data-html2canvas-ignore="true">
            {!rewrite?.text ? (
              <button
                onClick={() => onRewrite(realIdx, critique.issue, critique.solution)}
                disabled={rewrite?.loading}
                className="inline-flex items-center text-xs font-bold text-white bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 border border-cyan-400/30 px-4 py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50 shadow-[0_0_14px_rgba(34,211,238,0.25)] hover:shadow-[0_0_20px_rgba(34,211,238,0.45)] hover:-translate-y-0.5"
              >
                {rewrite?.loading ? (
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin text-white" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 mr-2 text-white" />
                )}
                {rewrite?.loading ? "Generating Optimized Rewrite..." : "AI Rewrite & Optimize"}
              </button>
            ) : (
              /* Terminal style comparisons */
              <div className="mt-2 rounded-2xl bg-slate-950 border border-cyan-500/30 shadow-[0_0_25px_rgba(34,211,238,0.08)] animate-in fade-in duration-300 overflow-hidden">
                {/* Header bar */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-slate-900">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-[10px] text-slate-400 font-mono pl-1.5">ai-optimized-bullet.sh</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleCopy(rewrite.text || "")}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 transition-colors cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 max-h-80 overflow-y-auto rewrite-scroll space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-[11px] font-mono items-stretch">
                    <div className="space-y-1 flex flex-col">
                      <span className="text-[9px] text-rose-400 uppercase tracking-wider block font-bold">Original / Weak</span>
                      <div className="flex-1 overflow-y-auto h-28 text-slate-300 bg-rose-950/40 p-2.5 rounded-lg border border-rose-500/20 leading-relaxed rewrite-scroll">
                        {critique.issue}
                      </div>
                    </div>
                    <div className="space-y-1 flex flex-col">
                      <span className="text-[9px] text-emerald-400 uppercase tracking-wider block font-bold">High-Impact Rewrite</span>
                      <div className="flex-1 overflow-y-auto h-28 text-emerald-200 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-500/30 font-semibold leading-relaxed rewrite-scroll">
                        {rewrite.text}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-white/10 text-xs text-slate-300 flex items-start">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" />
                    <p>
                      <span className="font-semibold text-white">Why it converts: </span>
                      {rewrite.explanation}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {rewrite?.error && (
              <p className="text-rose-400 text-xs mt-2 font-medium">{rewrite?.error}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
