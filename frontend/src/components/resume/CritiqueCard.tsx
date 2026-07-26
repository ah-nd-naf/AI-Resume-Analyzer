"use client";

import { Loader2, Sparkle } from "lucide-react";
import type { Critique, RewriteState } from "@/types/resume";

type Props = {
  critique: Critique;
  realIdx: number;
  rewrite: RewriteState | undefined;
  onRewrite: (idx: number, issue: string, solution: string) => void;
};

export function CritiqueCard({ critique, realIdx, rewrite, onRewrite }: Props) {
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
            {!rewrite?.text ? (
              <button
                onClick={() => onRewrite(realIdx, critique.issue, critique.solution)}
                disabled={rewrite?.loading}
                className="inline-flex items-center text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 border border-cyan-400/30 px-4 py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50 shadow-[0_0_14px_rgba(34,211,238,0.3)] hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] hover:-translate-y-0.5"
              >
                {rewrite?.loading ? (
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin text-white" />
                ) : (
                  <Sparkle className="w-3.5 h-3.5 mr-2 text-white" />
                )}
                {rewrite?.loading ? "Optimizing Bullet..." : "Optimize with AI"}
              </button>
            ) : (

              /* Terminal style comparisons */
              <div className="mt-2 rounded-2xl bg-slate-900 border border-cyan-500/30 shadow-[0_0_25px_rgba(34,211,238,0.08)] animate-in fade-in duration-300 overflow-hidden">
                {/* Sticky header bar */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-slate-900 sticky top-0 z-10">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-[9px] text-slate-400 font-mono pl-1.5">optimization-panel.sh</span>
                  </div>
                  <span className="text-[9px] text-cyan-300 font-bold bg-cyan-500/20 border border-cyan-400/30 px-1.5 py-0.5 rounded">AUTO_REWRITE</span>
                </div>

                {/* Scrollable body */}
                <div className="p-4 max-h-72 overflow-y-auto rewrite-scroll">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-[11px] font-mono mb-3 items-stretch">
                    <div className="space-y-1 flex flex-col">
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Before</span>
                      <div className="flex-1 overflow-y-auto h-32 text-slate-300 bg-rose-900/30 p-2.5 rounded-lg border border-rose-500/20 leading-relaxed rewrite-scroll">
                        {critique.issue}
                      </div>
                    </div>
                    <div className="space-y-1 flex flex-col">
                      <span className="text-[9px] text-cyan-300 uppercase tracking-wider block">Optimized</span>
                      <div className="flex-1 overflow-y-auto h-32 text-emerald-200 bg-emerald-900/30 p-2.5 rounded-lg border border-emerald-500/20 font-semibold leading-relaxed rewrite-scroll">
                        {rewrite.text}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-white/10 text-xs text-slate-300 flex items-start">
                    <Sparkle className="w-3.5 h-3.5 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" />
                    <p>
                      <span className="font-semibold text-white">Why it fits: </span>
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
