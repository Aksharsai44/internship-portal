import React, { useState, useMemo } from "react";
import {
  Student,
  InternResumeData,
  ResumeBulletFix,
} from "../types";
import {
  Sparkles,
  ShieldCheck,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Download,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Github,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Code2,
  RefreshCw,
  Check,
  Sliders,
  Eye,
  FileCheck,
  Zap,
} from "lucide-react";

interface AIResumeBuilderViewProps {
  currentStudent: Student;
  resumeData: InternResumeData;
  onUpdateResumeData: (data: InternResumeData) => void;
  onToast: (msg: string) => void;
}

export const AIResumeBuilderView: React.FC<AIResumeBuilderViewProps> = ({
  currentStudent,
  resumeData,
  onUpdateResumeData,
  onToast,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"scorecard" | "editor" | "preview">("scorecard");
  const targetRole = resumeData.targetRole || "Generative AI & LLM";
  const [selectedTemplate, setSelectedTemplate] = useState<"faang" | "executive" | "minimal">("faang");
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // Sync state if student changes
  const effectiveResume = useMemo(() => {
    return {
      ...resumeData,
      internName: currentStudent?.name || resumeData.internName,
      email: currentStudent?.email || resumeData.email,
      mobile: currentStudent?.mobile || resumeData.mobile,
    };
  }, [resumeData, currentStudent]);

  // Handle Apply AI Fix
  const handleApplyAIFix = (fixId: string) => {
    const fix = effectiveResume.scorecard.bulletFixes.find((f) => f.id === fixId);
    if (!fix || fix.applied) return;

    // 1. Update bullet in experience
    const updatedExperience = effectiveResume.experience.map((exp) => {
      const idx = exp.bullets.findIndex((b) => b.trim() === fix.originalText.trim());
      if (idx !== -1) {
        const newBullets = [...exp.bullets];
        newBullets[idx] = fix.suggestedText;
        return { ...exp, bullets: newBullets };
      }
      return exp;
    });

    // 2. Mark fix as applied and bump score
    const updatedFixes = effectiveResume.scorecard.bulletFixes.map((f) =>
      f.id === fixId ? { ...f, applied: true } : f
    );

    const newScore = Math.min(98, effectiveResume.scorecard.overallScore + 4);
    const newMetricsScore = Math.min(100, effectiveResume.scorecard.quantifiedMetricsScore + 5);

    const updatedData: InternResumeData = {
      ...effectiveResume,
      experience: updatedExperience,
      scorecard: {
        ...effectiveResume.scorecard,
        overallScore: newScore,
        quantifiedMetricsScore: newMetricsScore,
        bulletFixes: updatedFixes,
        grammarScore: Math.min(100, effectiveResume.scorecard.grammarScore + 6),
      },
      isSyncedToClientPortal: true,
      lastSyncedAt: new Date().toISOString(),
    };

    onUpdateResumeData(updatedData);
    onToast("Applied AI Polish: Added quantifiable impact metric (+4 ATS Score)");
  };

  // Handle Add Missing Skill
  const handleAddMissingSkill = (skill: string) => {
    if (effectiveResume.skills.includes(skill)) return;

    const newSkills = [...effectiveResume.skills, skill];
    const newMissing = effectiveResume.scorecard.missingSkills.filter((s) => s !== skill);
    const newMatched = [...effectiveResume.scorecard.matchedSkills, skill];
    const newMatchRate = Math.min(100, Math.round((newMatched.length / (newMatched.length + newMissing.length)) * 100));
    const newScore = Math.min(99, effectiveResume.scorecard.overallScore + 2);

    const updatedData: InternResumeData = {
      ...effectiveResume,
      skills: newSkills,
      scorecard: {
        ...effectiveResume.scorecard,
        overallScore: newScore,
        keywordMatchRate: newMatchRate,
        matchedSkills: newMatched,
        missingSkills: newMissing,
      },
      isSyncedToClientPortal: true,
      lastSyncedAt: new Date().toISOString(),
    };

    onUpdateResumeData(updatedData);
    onToast(`Added "${skill}" to technical skills (+2 ATS Score)`);
  };

  // Handle Sync to Client Portal
  const handleSyncPortal = () => {
    const updated: InternResumeData = {
      ...effectiveResume,
      isSyncedToClientPortal: true,
      lastSyncedAt: new Date().toISOString(),
    };
    onUpdateResumeData(updated);
    onToast("✓ Verified resume & ATS scorecard synced to Client Portal and Candidate Report");
  };

  // Upload PDF / Docx simulation
  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanProgress(20);

    const t1 = setTimeout(() => setScanProgress(55), 400);
    const t2 = setTimeout(() => setScanProgress(85), 900);
    const t3 = setTimeout(() => {
      setIsScanning(false);
      setScanProgress(100);

      const fileName = file.name;
      const updated: InternResumeData = {
        ...effectiveResume,
        scorecard: {
          ...effectiveResume.scorecard,
          lastScannedFileName: fileName,
          lastScannedDate: new Date().toISOString().split("T")[0],
          overallScore: 91,
          keywordMatchRate: 85,
        },
      };
      onUpdateResumeData(updated);
      onToast(`Successfully scanned ${fileName} • ATS Score: 91/100 (Grade A)`);
    }, 1400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* ── TOP HEADER (Matching Reference Image 1) ── */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>AI Resume Builder & Deep ATS Compatibility Scanner</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                Scan your resume for recruiter ATS algorithms, fix grammar and impact verbs, and format with FAANG-ready templates.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Sync Button */}
            <button
              onClick={handleSyncPortal}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all shadow-sm shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Sync to Client Portal</span>
            </button>
          </div>
        </div>

        {/* Sub-Tab Navigation & Upload Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveSubTab("scorecard")}
              className={`px-3 py-1.5 rounded-lg font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === "scorecard"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>ATS Scanner Scorecard ({effectiveResume.scorecard.overallScore}/100)</span>
            </button>

            <button
              onClick={() => setActiveSubTab("editor")}
              className={`px-3 py-1.5 rounded-lg font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === "editor"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Interactive Resume Editor</span>
            </button>

            <button
              onClick={() => setActiveSubTab("preview")}
              className={`px-3 py-1.5 rounded-lg font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === "preview"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Templates & Live PDF Preview</span>
            </button>
          </div>

          {/* Upload Button with hidden file input */}
          <div>
            <label className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold transition flex items-center gap-1.5 cursor-pointer text-xs shadow-2xs">
              <Upload className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isScanning ? `Scanning ${scanProgress}%...` : "Upload PDF/Docx to Scan"}</span>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleSimulateUpload}
                disabled={isScanning}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* ── TAB 1: ATS SCORECARD & AUDIT ENGINE ── */}
      {activeSubTab === "scorecard" && (
        <div className="space-y-6">
          {/* Top 5-Cards Grid (Matching Reference Image 1) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Card 1: ATS Audit Engine (Navy Card) */}
            <div className="lg:row-span-2 bg-[#0d1527] text-white p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between gap-2 mb-6">
                  <span className="px-2.5 py-1 rounded-md bg-slate-800/90 border border-slate-700 text-indigo-400 font-black text-[10px] uppercase tracking-wider">
                    ATS AUDIT ENGINE
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    Target: <strong className="text-white uppercase">{targetRole.split(" ")[0]}</strong>
                  </span>
                </div>

                {/* Score Circle */}
                <div className="flex flex-col items-center justify-center my-6">
                  <div className="w-32 h-32 rounded-full border-4 border-indigo-500/40 bg-indigo-950/40 flex flex-col items-center justify-center relative shadow-inner">
                    <div className="text-4xl font-black text-white tracking-tight">
                      {effectiveResume.scorecard.overallScore}
                    </div>
                    <div className="text-[11px] font-bold text-indigo-300">/ 100 SCORE</div>
                  </div>

                  <div className="mt-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 text-xs font-bold shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      {effectiveResume.scorecard.grade}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 text-center truncate">
                Last scanned from <strong className="text-slate-200">{effectiveResume.scorecard.lastScannedFileName}</strong>
              </div>
            </div>

            {/* Card 2: Keyword Match Rate */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    KEYWORD MATCH RATE
                  </span>
                  <span className="text-base font-black text-indigo-600">
                    {effectiveResume.scorecard.keywordMatchRate}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${effectiveResume.scorecard.keywordMatchRate}%` }}
                  />
                </div>

                <p className="text-xs text-slate-600 mb-3">
                  Matched {effectiveResume.scorecard.matchedSkills.length} of{" "}
                  {effectiveResume.scorecard.matchedSkills.length + effectiveResume.scorecard.missingSkills.length}{" "}
                  critical skills for {targetRole.split(" ")[0]}.
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                {effectiveResume.scorecard.matchedSkills.slice(0, 4).map((skill, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-[10.5px] flex items-center gap-1"
                  >
                    <Check className="w-3 h-3 text-indigo-600" />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Card 3: Quantified Metrics & Impact */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    QUANTIFIED METRICS & IMPACT
                  </span>
                  <span className="text-base font-black text-emerald-600">
                    {effectiveResume.scorecard.quantifiedMetricsScore}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${effectiveResume.scorecard.quantifiedMetricsScore}%` }}
                  />
                </div>

                <p className="text-xs text-slate-600 mb-3">
                  {effectiveResume.scorecard.quantifiedMetricsDetail}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified quantifiable project metrics</span>
                </span>
              </div>
            </div>

            {/* Card 4: Formatting & Parseability */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    FORMATTING & PARSEABILITY
                  </span>
                  <span className="text-base font-black text-purple-600">
                    {effectiveResume.scorecard.formattingScore}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-purple-600 rounded-full transition-all duration-500"
                    style={{ width: `${effectiveResume.scorecard.formattingScore}%` }}
                  />
                </div>

                <p className="text-xs text-slate-600 mb-3">
                  {effectiveResume.scorecard.formattingDetail}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-bold">
                  <FileCheck className="w-3.5 h-3.5 text-purple-600" />
                  <span>100% ATS Parser Safe</span>
                </span>
              </div>
            </div>

            {/* Card 5: Grammar & Action Verbs */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    GRAMMAR & ACTION VERBS
                  </span>
                  <span className="text-base font-black text-amber-500">
                    {effectiveResume.scorecard.grammarScore}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${effectiveResume.scorecard.grammarScore}%` }}
                  />
                </div>

                <p className="text-xs text-slate-600 mb-3">
                  {effectiveResume.scorecard.bulletFixes.filter((f) => !f.applied).length} verb improvement suggestions found.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-indigo-600 font-bold hover:underline cursor-pointer flex items-center gap-1">
                  <span>Review Grammar Fixes</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>

          {/* ── AI GRAMMAR & ACTION VERB POLISH SUGGESTIONS (Matching Reference Image 2) ── */}
          <div className="bg-amber-50/40 border border-amber-200/80 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900">
                  AI Grammar & Action Verb Polish Suggestions
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  One-click AI replacements to transform weak bullets into high-impact recruiter achievements.
                </p>
              </div>
            </div>

            {/* Side-by-side Suggestion Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {effectiveResume.scorecard.bulletFixes.map((fix) => (
                <div
                  key={fix.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200/80 shadow-xs flex flex-col justify-between space-y-3.5"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-black tracking-wider text-[10px] uppercase">
                        {fix.scopeTag}
                      </span>
                      <span className="text-slate-400 font-medium">{fix.category}</span>
                    </div>

                    {/* Strikethrough Original Text */}
                    <div className="text-xs text-rose-600 line-through leading-relaxed font-medium">
                      "{fix.originalText}"
                    </div>

                    {/* Green Suggested Replacement */}
                    <div className="text-xs text-emerald-700 font-bold leading-relaxed">
                      → "{fix.suggestedText}"
                    </div>

                    <p className="text-[11px] text-slate-500 italic">
                      {fix.impactReason}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleApplyAIFix(fix.id)}
                      disabled={fix.applied}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        fix.applied
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs shadow-indigo-500/20"
                      }`}
                    >
                      {fix.applied ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Applied to Resume</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Apply AI Fix</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── BOTTOM ROW (Matching Reference Image 2) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recommended Missing Skills Card */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Code2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    Recommended Missing Skills for {targetRole.split(" ")[0]}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Boost automated recruiting keyword searchability
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Include these industry-standard keywords into your Projects or Skills list to boost your searchability on automated recruiting filters:
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {effectiveResume.scorecard.missingSkills.map((skill, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAddMissingSkill(skill)}
                    className="px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs group"
                  >
                    <Plus className="w-3.5 h-3.5 group-hover:scale-125 transition-transform" />
                    <span>{skill}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ATS Verification Pass Checklist */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    ATS Verification Pass Checklist
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Technical audit criteria for enterprise ATS parsers
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {effectiveResume.scorecard.verificationChecklist.map((item) => (
                  <div key={item.id} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── AI EXECUTIVE RESUME SUMMARY NARRATIVE CARD ── */}
          <div className="bg-gradient-to-r from-indigo-50/70 via-sky-50/50 to-purple-50/60 p-5 sm:p-6 rounded-3xl border border-indigo-100 shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-black uppercase tracking-wider text-indigo-950">
                  AI Executive Resume Synthesis & Recruiter Match Quotient
                </h4>
              </div>
              <span className="px-3 py-1 rounded-full bg-indigo-600 text-white font-black text-[10px] uppercase shadow-2xs">
                FAANG Interview Ready
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              {effectiveResume.scorecard.executiveSummary}
            </p>
          </div>
        </div>
      )}

      {/* ── TAB 2: INTERACTIVE RESUME EDITOR ── */}
      {activeSubTab === "editor" && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900">Interactive Resume Editor</h3>
              <p className="text-xs text-slate-400 font-medium">Edit your personal details, summary, and experience bullets in real time.</p>
            </div>
            <button
              onClick={handleSyncPortal}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save & Sync</span>
            </button>
          </div>

          {/* Personal Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Full Name</label>
              <input
                type="text"
                value={effectiveResume.internName}
                onChange={(e) => onUpdateResumeData({ ...effectiveResume, internName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Email Address</label>
              <input
                type="email"
                value={effectiveResume.email}
                onChange={(e) => onUpdateResumeData({ ...effectiveResume, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Mobile / Phone</label>
              <input
                type="text"
                value={effectiveResume.mobile}
                onChange={(e) => onUpdateResumeData({ ...effectiveResume, mobile: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Location</label>
              <input
                type="text"
                value={effectiveResume.location}
                onChange={(e) => onUpdateResumeData({ ...effectiveResume, location: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">GitHub Profile</label>
              <input
                type="text"
                value={effectiveResume.githubUrl}
                onChange={(e) => onUpdateResumeData({ ...effectiveResume, githubUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">LinkedIn Profile</label>
              <input
                type="text"
                value={effectiveResume.linkedinUrl}
                onChange={(e) => onUpdateResumeData({ ...effectiveResume, linkedinUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Professional Summary */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-black uppercase text-slate-400">Professional Summary</label>
              <button
                onClick={() => onToast("AI Polish: Optimized summary for FAANG recruiter ATS scanners")}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>AI Polish Summary</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={effectiveResume.professionalSummary}
              onChange={(e) => onUpdateResumeData({ ...effectiveResume, professionalSummary: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 leading-relaxed outline-none focus:border-indigo-500"
            />
          </div>

          {/* Experience List */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
              <span>Work Experience Bullets</span>
            </h4>

            {effectiveResume.experience.map((exp, expIdx) => (
              <div key={exp.id} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-bold text-xs text-slate-900">
                    {exp.title} · <span className="text-indigo-600">{exp.company}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{exp.period}</span>
                </div>

                <div className="space-y-2">
                  {exp.bullets.map((bullet, bulletIdx) => (
                    <div key={bulletIdx} className="flex items-start gap-2 text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2 shrink-0" />
                      <input
                        type="text"
                        value={bullet}
                        onChange={(e) => {
                          const newExp = [...effectiveResume.experience];
                          newExp[expIdx].bullets[bulletIdx] = e.target.value;
                          onUpdateResumeData({ ...effectiveResume, experience: newExp });
                        }}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 font-medium outline-none focus:border-indigo-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: TEMPLATES & LIVE PDF PREVIEW ── */}
      {activeSubTab === "preview" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <span>Select ATS Template:</span>
              {(["faang", "executive", "minimal"] as const).map((tmpl) => (
                <button
                  key={tmpl}
                  onClick={() => setSelectedTemplate(tmpl)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold uppercase cursor-pointer transition ${
                    selectedTemplate === tmpl
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tmpl}
                </button>
              ))}
            </div>

            <button
              onClick={() => onToast("Downloaded FAANG-ready resume PDF.")}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>

          {/* Formatted A4 Document Preview */}
          <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-lg space-y-6 font-sans">
            {/* Header */}
            <div className="text-center space-y-1.5 pb-4 border-b border-slate-200">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {effectiveResume.internName}
              </h2>
              <div className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
                {targetRole}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center justify-center gap-3 flex-wrap">
                <span>{effectiveResume.email}</span>
                <span>•</span>
                <span>{effectiveResume.mobile}</span>
                <span>•</span>
                <span>{effectiveResume.location}</span>
                <span>•</span>
                <span className="font-semibold text-slate-700">{effectiveResume.githubUrl}</span>
                <span>•</span>
                <span className="font-semibold text-slate-700">{effectiveResume.linkedinUrl}</span>
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1">
                Professional Summary
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {effectiveResume.professionalSummary}
              </p>
            </div>

            {/* Technical Skills */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1">
                Technical Skills
              </h3>
              <div className="text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-slate-900">Core Engineering: </span>
                {effectiveResume.skills.join(" • ")}
              </div>
            </div>

            {/* Experience */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1">
                Professional Experience
              </h3>

              {effectiveResume.experience.map((exp) => (
                <div key={exp.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-900">
                      {exp.title} — <span className="text-indigo-600">{exp.company}</span>
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">{exp.period}</span>
                  </div>
                  <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 pl-1">
                    {exp.bullets.map((b, i) => (
                      <li key={i} className="leading-relaxed">
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Education */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1">
                Education & Academics
              </h3>
              {effectiveResume.education.map((edu) => (
                <div key={edu.id} className="text-xs flex justify-between">
                  <div>
                    <div className="font-bold text-slate-900">{edu.degree}</div>
                    <div className="text-slate-500 text-[11px]">{edu.institution} {edu.grade ? `• ${edu.grade}` : ""}</div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">{edu.period}</span>
                </div>
              ))}
            </div>

            {/* Certifications */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1">
                Verified Certifications
              </h3>
              <div className="text-xs text-slate-700 leading-relaxed">
                {effectiveResume.certifications.join(" • ")}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
