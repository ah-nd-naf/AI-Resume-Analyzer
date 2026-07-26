"use client";

import { History, X, FileText, Clock } from "lucide-react";
import type { HistoryItem } from "@/types/resume";

type Props = {
  history: HistoryItem[];
  showHistory: boolean;
  onClose: () => void;
};

export function HistorySidebar({ history, showHistory, onClose }: Props) {
  return (
    <>
      {/* History Sidebar */}
      {showHistory && (
        <div
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
        ></div>
      )}

      <div className={`fixed inset-y-0 left-0 z-50 w-full sm:w-96 bg-background/95 backdrop-blur-3xl border-r border-border shadow-2xl transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${showHistory ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground flex items-center">
            <History className="w-5 h-5 mr-2.5 text-purple-600 dark:text-purple-400" />
            Recent Analyses
          </h2>
          <button
            onClick={onClose}
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
    </>
  );
}
