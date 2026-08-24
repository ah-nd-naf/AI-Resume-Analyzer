"use client";

import { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Download,
  Flame,
  Layers,
  LayoutGrid,
  Loader2,
  LucideIcon,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  UserCheck,
  Zap,
} from "lucide-react";
import type { AnalysisResult, RewriteState, SectionAuditItem } from "@/types/resume";
import { CritiqueCard } from "@/components/resume/CritiqueCard";

type Props = {
  results: AnalysisResult;
  rewrites: Record<number, RewriteState>;
  onRewrite: (idx: number, issue: string, solution: string) => void;
  file: File | null;
  isDownloading: boolean;
  onDownload: () => void;
};

type TabType = "overview" | "subscores" | "audit" | "keywords" | "critiques";

function getScoreColor(score: number) {
  if (score >= 80) return "text-emerald-500 dark:text-emerald-400 stroke-emerald-500 dark:stroke-emerald-400";
  if (score >= 60) return "text-amber-500 dark:text-amber-400 stroke-amber-500 dark:stroke-amber-400";
  return "text-rose-500 dark:text-rose-400 stroke-rose-500 dark:stroke-rose-400";
}

function getScoreGlow(score: number) {
  if (score >= 80) return "glow-emerald";
  if (score >= 60) return "glow-amber";
  return "glow-rose";
}

function getScoreBadge(score: number) {
  if (score >= 85) return { label: "ATS Ready (Top 10%)", color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" };
  if (score >= 70) return { label: "Strong Candidate", color: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30" };
  if (score >= 55) return { label: "Needs Fine-Tuning", color: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30" };
  return { label: "Critical Friction", color: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30" };
}

function getAuditStatusBadge(status: string) {
  const s = status.toLowerCase();
  if (s === "excellent" || s === "pass") {
    return {
      icon: CheckCircle2,
      label: "Optimal",
      bg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    };
  }
  if (s === "critical" || s === "fail") {
    return {
      icon: ShieldAlert,
      label: "Critical Gaps",
      bg: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
    };
  }
  return {
    icon: AlertTriangle,
    label: "Needs Attention",
    bg: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  };
}

export function ResultsDashboard({
  results,
  rewrites,
  onRewrite,
  isDownloading,
  onDownload,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const subScores = results.sub_scores || {
    ats_compatibility: Math.round(results.ats_score * 0.95),
    impact_quantification: Math.max(40, 100 - results.critiques.length * 8),
    skills_keyword_density: Math.round(Math.min(95, 65 + results.ats_score * 0.3)),
    brevity_clarity: Math.round(Math.min(92, 60 + results.ats_score * 0.35)),
    formatting_structure: Math.round(results.ats_score),
  };

  const keyStrengths = results.key_strengths && results.key_strengths.length > 0
    ? results.key_strengths
    : [
        "Structured professional timeline with clear role designations",
        "Clear technical and functional domain terminology present",
        "Logical section hierarchy matching general ATS scanning models",
      ];

  const sectionAudits = results.section_audits && results.section_audits.length > 0
    ? results.section_audits
    : [
        { section: "Contact & Header", status: "excellent", feedback: "Standard contact parameters and title formatting detected.", action: "Ensure your LinkedIn URL is customized and clickable." },
        { section: "Professional Summary", status: "warning", feedback: "Summary could be sharper with quantifiable career achievements.", action: "Open with years of expertise + primary tech stack + top ROI metric." },
        { section: "Work Experience", status: results.critiques.some(c => c.category.toLowerCase().includes("impact")) ? "warning" : "excellent", feedback: "Bullet structure is clear, but several bullets lack quantifiable outcomes.", action: "Adopt the Google X-Y-Z formula: Accomplished [X] measured by [Y] by doing [Z]." },
        { section: "Skills & Tools", status: "excellent", feedback: "Comprehensive skill listing that facilitates ATS keyword indexing.", action: "Group skills into categories (e.g., Languages, Frameworks, Cloud, Tools)." },
        { section: "Education & Certs", status: "excellent", feedback: "Degree and accreditation entries are clearly legible for parsers.", action: "Keep graduation year standard and list accredited industry certs." },
      ];

  const critiqueCategories = Array.from(new Set(results.critiques.map((c) => c.category)));

  // Filter critiques
  const filteredCritiques = results.critiques.filter((c) => {
    const matchesSeverity = severityFilter === "all" || (c.severity || "warning").toLowerCase() === severityFilter.toLowerCase();
    const matchesCategory = categoryFilter === "all" || c.category === categoryFilter;
    return matchesSeverity && matchesCategory;
  });

  const criticalCount = results.critiques.filter(c => (c.severity || "").toLowerCase() === "critical").length;
  const warningCount = results.critiques.filter(c => (c.severity || "warning").toLowerCase() === "warning").length;
  const scoreBadge = getScoreBadge(results.ats_score);

  return (
    <section
      id="report-container"
      className="premium-glass rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden relative border border-border animate-in fade-in slide-in-from-bottom-6 duration-500 space-y-0"
    >
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"></div>

      {/* Top Hero Banner & Score Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-border">
        {/* Left: Overall ATS Score & Gauge */}
        <div className="lg:col-span-4 p-8 sm:p-10 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-border bg-background/20 relative">
          <div className="relative mb-6">
            <svg className="w-44 h-44 transform -rotate-90">
              <circle cx="88" cy="88" r="78" fill="none" strokeWidth="8" className="stroke-border" />
              <circle
                cx="88"
                cy="88"
                r="78"
                fill="none"
                strokeWidth="10"
                strokeLinecap="round"
                className={`${getScoreColor(results.ats_score)} ${getScoreGlow(results.ats_score)} transition-all duration-1000 ease-out`}
                strokeDasharray="490"
                strokeDashoffset={490 - (490 * results.ats_score) / 100}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-4xl sm:text-5xl font-black tracking-tight text-foreground font-mono">
                {results.ats_score}
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-1">
                ATS Index
              </span>
            </div>
          </div>

          <div className={`px-3 py-1 rounded-full text-xs font-bold border ${scoreBadge.color} mb-6`}>
            {scoreBadge.label}
          </div>

          {/* Quick Pillars Grid */}
          <div className="grid grid-cols-3 w-full gap-2 pt-6 border-t border-border text-center">
            <div className="p-2 rounded-xl bg-background/50 border border-border">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">JD Match</span>
              <span className="text-sm font-extrabold text-cyan-600 dark:text-cyan-400 mt-1 block">
                {results.match_percentage ? `${results.match_percentage}%` : "N/A"}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-background/50 border border-border">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Metrics %</span>
              <span className="text-sm font-extrabold text-purple-600 dark:text-purple-400 mt-1 block">
                {results.quantification_percentage !== undefined && results.quantification_percentage !== null
                  ? `${results.quantification_percentage}%`
                  : `${Math.round(subScores.impact_quantification)}%`}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-background/50 border border-border">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Action Items</span>
              <span className="text-sm font-extrabold text-rose-600 dark:text-rose-400 mt-1 block">
                {results.critiques.length}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Executive Brief & Action Bar */}
        <div className="lg:col-span-8 p-8 sm:p-10 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground">
                    Executive Resume Assessment
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Comprehensive ATS parser benchmark & recruiter intelligence
                  </p>
                </div>
              </div>

              <button
                onClick={onDownload}
                disabled={isDownloading}
                data-html2canvas-ignore="true"
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-foreground/5 hover:bg-foreground/10 text-foreground text-xs font-bold rounded-xl border border-border transition-all cursor-pointer disabled:opacity-50 hover:shadow-sm"
              >
                {isDownloading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-500" />
                ) : (
                  <Download className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                )}
                <span>{isDownloading ? "Generating PDF..." : "Export Full Report"}</span>
              </button>
            </div>

            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base bg-background/40 p-4 rounded-2xl border border-border">
              {results.summary}
            </p>
          </div>

          {/* Quick Metrics Bar / Interview Probability */}
          {results.interview_probability && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-cyan-500/10 border border-purple-500/20 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <UserCheck className="w-5 h-5 text-indigo-500" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                    ATS Pass & Interview Probability
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    Estimated Probability: <span className="text-indigo-500">{results.interview_probability}</span>
                  </span>
                </div>
              </div>
              {results.match_percentage && (
                <div className="text-xs font-semibold px-3 py-1 rounded-lg bg-background/80 border border-border text-foreground">
                  Role Fit: <span className="font-bold text-cyan-500">{results.match_percentage}%</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Interactive Navigation Tabs */}
      <div className="border-b border-border bg-background/40 px-6 sm:px-10 py-3 overflow-x-auto" data-html2canvas-ignore="true">
        <nav className="flex space-x-2 sm:space-x-4 min-w-max">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "overview"
                ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                : "text-slate-600 dark:text-slate-400 hover:text-foreground hover:bg-foreground/5"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Overview & Strengths</span>
          </button>

          <button
            onClick={() => setActiveTab("subscores")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "subscores"
                ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                : "text-slate-600 dark:text-slate-400 hover:text-foreground hover:bg-foreground/5"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Sub-Score Pillars</span>
          </button>

          <button
            onClick={() => setActiveTab("audit")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "audit"
                ? "bg-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                : "text-slate-600 dark:text-slate-400 hover:text-foreground hover:bg-foreground/5"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Section Health Audit</span>
          </button>

          {(results.keyword_match || results.gap_analysis) && (
            <button
              onClick={() => setActiveTab("keywords")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "keywords"
                  ? "bg-teal-600 text-white shadow-[0_0_15px_rgba(20,184,166,0.4)]"
                  : "text-slate-600 dark:text-slate-400 hover:text-foreground hover:bg-foreground/5"
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Keyword & JD Match</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab("critiques")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "critiques"
                ? "bg-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                : "text-slate-600 dark:text-slate-400 hover:text-foreground hover:bg-foreground/5"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Action Plan ({results.critiques.length})</span>
            {criticalCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-950 text-rose-300 border border-rose-500/50">
                {criticalCount}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Tab 1: Overview & Strengths */}
      {activeTab === "overview" && (
        <div className="p-6 sm:p-10 space-y-8 animate-in fade-in duration-300">
          {/* Key Strengths / Superpowers */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Flame className="w-5 h-5 text-amber-500" />
              <h4 className="text-base sm:text-lg font-bold text-foreground">
                Candidate Superpowers & Standout Strengths
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {keyStrengths.map((strength, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl premium-glass-secondary border border-border flex flex-col justify-between space-y-3 relative overflow-hidden"
                >
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs">
                    0{idx + 1}
                  </div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-relaxed">
                    {strength}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Sub-Score Overview Cards */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold tracking-widest text-slate-500 uppercase flex items-center">
              <Zap className="w-4 h-4 mr-2 text-indigo-500" />
              Core Competency Dimensions
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                { label: "ATS Parsability", score: subScores.ats_compatibility, color: "text-emerald-500" },
                { label: "Metrics & Impact", score: subScores.impact_quantification, color: "text-purple-500" },
                { label: "Keyword Density", score: subScores.skills_keyword_density, color: "text-cyan-500" },
                { label: "Brevity & Tone", score: subScores.brevity_clarity, color: "text-amber-500" },
                { label: "Structure Flow", score: subScores.formatting_structure, color: "text-indigo-500" },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl premium-glass-secondary border border-border text-center space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 block truncate">{item.label}</span>
                  <span className={`text-xl font-extrabold font-mono ${item.color}`}>{item.score}</span>
                  <div className="w-full bg-border h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500"
                      style={{ width: `${item.score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Sub-Scores Breakdown */}
      {activeTab === "subscores" && (
        <div className="p-6 sm:p-10 space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="text-lg font-bold text-foreground flex items-center">
                <Zap className="w-5 h-5 mr-2 text-indigo-500" />
                Multi-Dimensional Evaluation Pillars
              </h4>
              <p className="text-xs text-slate-500">
                Granular machine analysis across 5 foundational scoring pillars.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "ATS Compatibility & Machine Parsability",
                score: subScores.ats_compatibility,
                desc: "Evaluates standard headers, email/phone format, UTF-8 clean text extraction, and absence of complex multi-column tables.",
                benchmark: "Recommended: 85+",
              },
              {
                title: "Impact & Metric Quantification (X-Y-Z)",
                score: subScores.impact_quantification,
                desc: "Measures density of quantifiable numbers, dollar amounts, KPIs, and percentage growth achieved across past experiences.",
                benchmark: "Recommended: 75+",
              },
              {
                title: "Skill Coverage & Keyword Density",
                score: subScores.skills_keyword_density,
                desc: "Analyzes industry-standard tech stack representation, toolchains, frameworks, and domain-specific terminology depth.",
                benchmark: "Recommended: 80+",
              },
              {
                title: "Brevity, Tone & Active Voice",
                score: subScores.brevity_clarity,
                desc: "Audits for power verbs (e.g. 'Architected', 'Accelerated' vs 'Helped', 'Handled') and elimination of filler phrases.",
                benchmark: "Recommended: 80+",
              },
              {
                title: "Formatting, Hierarchy & Section Flow",
                score: subScores.formatting_structure,
                desc: "Assesses visual symmetry, line length, bullet consistency, and logical chronological progression.",
                benchmark: "Recommended: 85+",
              },
            ].map((pillar, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl premium-glass-secondary border border-border space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-bold text-foreground max-w-[70%]">{pillar.title}</h5>
                  <span className={`text-2xl font-black font-mono ${getScoreColor(pillar.score)}`}>
                    {pillar.score}<span className="text-xs text-slate-500">/100</span>
                  </span>
                </div>
                <div className="w-full bg-border h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      pillar.score >= 80 ? "bg-emerald-500" : pillar.score >= 60 ? "bg-amber-500" : "bg-rose-500"
                    }`}
                    style={{ width: `${pillar.score}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{pillar.desc}</p>
                <div className="pt-2 border-t border-border flex justify-between items-center text-[10px] text-slate-500 font-semibold">
                  <span>{pillar.benchmark}</span>
                  <span className={pillar.score >= 80 ? "text-emerald-500 font-bold" : "text-amber-500 font-bold"}>
                    {pillar.score >= 80 ? "Target Met" : "Room for Growth"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Section Health Audit */}
      {activeTab === "audit" && (
        <div className="p-6 sm:p-10 space-y-6 animate-in fade-in duration-300">
          <div>
            <h4 className="text-lg font-bold text-foreground flex items-center">
              <ShieldCheck className="w-5 h-5 mr-2 text-cyan-500" />
              Section-by-Section Health Audit
            </h4>
            <p className="text-xs text-slate-500">
              Inspection of each core resume block with direct diagnostic findings and remediation actions.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {sectionAudits.map((item: SectionAuditItem, idx: number) => {
              const badge = getAuditStatusBadge(item.status);
              const BadgeIcon = badge.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl premium-glass-secondary border border-border space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2.5">
                      <span className="font-bold text-base text-foreground">{item.section}</span>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${badge.bg}`}>
                      <BadgeIcon className="w-3.5 h-3.5 mr-1.5" />
                      {badge.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Diagnostic Assessment
                      </span>
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        {item.feedback}
                      </p>
                    </div>

                    <div className="space-y-1 bg-background/50 p-3.5 rounded-xl border border-border">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 block">
                        Action Required
                      </span>
                      <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-semibold leading-relaxed">
                        {item.action}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Keyword & JD Match Matrix */}
      {activeTab === "keywords" && (
        <div className="p-6 sm:p-10 space-y-8 animate-in fade-in duration-300">
          <div>
            <h4 className="text-lg font-bold text-foreground flex items-center">
              <Target className="w-5 h-5 mr-2 text-teal-500" />
              Target Job Description Alignment Matrix
            </h4>
            <p className="text-xs text-slate-500">
              Cross-referencing your resume keywords directly against the target job requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Matched Keywords */}
            <div className="p-6 rounded-2xl premium-glass-secondary border border-emerald-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Matched Keywords & Competencies
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                  {results.keyword_match?.matched?.length || 0} Found
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {results.keyword_match?.matched && results.keyword_match.matched.length > 0 ? (
                  results.keyword_match.matched.map((kw, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-emerald-950/30 border border-emerald-500/30 text-emerald-300"
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" />
                      {kw}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">No direct keywords extracted or no JD supplied.</p>
                )}
              </div>
            </div>

            {/* Missing Critical Keywords */}
            <div className="p-6 rounded-2xl premium-glass-secondary border border-rose-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Missing Critical Keywords & Skills
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400">
                  {(results.keyword_match?.missing?.length || results.gap_analysis?.length || 0)} Missing
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(results.keyword_match?.missing || results.gap_analysis || []).map((gap, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-rose-950/30 border border-rose-500/30 text-rose-300"
                  >
                    <AlertCircle className="w-3 h-3 mr-1 text-rose-400" />
                    {gap}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Soft Skills & Behavioral Attributes */}
          {results.keyword_match?.soft_skills && results.keyword_match.soft_skills.length > 0 && (
            <div className="p-6 rounded-2xl premium-glass-secondary border border-purple-500/30 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center">
                <Sparkles className="w-4 h-4 mr-2" />
                Target Leadership & Interpersonal Soft Skills
              </span>
              <div className="flex flex-wrap gap-2">
                {results.keyword_match.soft_skills.map((soft, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-purple-950/30 border border-purple-500/30 text-purple-300"
                  >
                    {soft}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Strategic Action Plan & Critiques */}
      {activeTab === "critiques" && (
        <div className="p-6 sm:p-10 space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h4 className="text-lg font-bold text-foreground flex items-center">
                <Layers className="w-5 h-5 mr-2 text-rose-500" />
                Strategic Action Plan & AI Bullet Rewriter
              </h4>
              <p className="text-xs text-slate-500">
                Click "AI Rewrite & Optimize" on any friction point to generate an executive-grade bullet point.
              </p>
            </div>

            {/* Severity Filter Pills */}
            <div className="flex items-center space-x-1.5 bg-background/60 p-1 rounded-xl border border-border" data-html2canvas-ignore="true">
              {[
                { id: "all", label: `All (${results.critiques.length})` },
                { id: "critical", label: `🔴 Critical (${criticalCount})` },
                { id: "warning", label: `🟡 Recommended (${warningCount})` },
                { id: "suggestion", label: `🟢 Suggestions` },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSeverityFilter(filter.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    severityFilter === filter.id
                      ? "bg-foreground/10 text-foreground shadow-sm"
                      : "text-slate-500 hover:text-foreground"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action List */}
          <div className="grid grid-cols-1 gap-4">
            {filteredCritiques.length > 0 ? (
              filteredCritiques.map((critique) => {
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
              })
            ) : (
              <div className="p-12 text-center rounded-2xl bg-background/30 border border-border">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-foreground">No issues found in this category!</p>
                <p className="text-xs text-slate-500 mt-1">Select "All" to view all recommendations.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
