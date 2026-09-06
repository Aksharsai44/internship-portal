import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ProjectAssignment, ProjectSubmission } from "../types";
import {
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Github,
  Globe,
  FileArchive,
  Lock,
  Sparkles,
  Award,
  MessageSquare,
  ShieldCheck,
  ExternalLink,
  Check,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { evaluateSubmissionWithAI, AIReviewResult } from "../utils/aiProjectReviewEvaluator";

interface ProjectReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectAssignment;
  submission: ProjectSubmission;
  onSaveReview: (updatedSubmission: ProjectSubmission) => void;
  autoTriggerAI?: boolean;
}

export const ProjectReviewModal: React.FC<ProjectReviewModalProps> = ({
  isOpen,
  onClose,
  project,
  submission,
  onSaveReview,
  autoTriggerAI = false,
}) => {
  const [status, setStatus] = useState<"pending" | "passed" | "needs_revision">(
    submission.status || "pending"
  );
  const [gradePoints, setGradePoints] = useState<number>(
    submission.gradePoints ?? project.leaderboardPoints ?? 100
  );
  const [mentorFeedback, setMentorFeedback] = useState<string>(
    submission.mentorFeedback || ""
  );

  // AI Auto-Review states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAuditResult, setAiAuditResult] = useState<AIReviewResult | null>(null);
  const [analysisStep, setAnalysisStep] = useState<string>("");

  const handleAIAutoReview = async () => {
    setIsAnalyzing(true);
    setAnalysisStep("Reading intern solution & architecture notes...");
    try {
      await new Promise((r) => setTimeout(r, 350));
      setAnalysisStep("Auditing alignment with confidential benchmark & project requirements...");
      const result = await evaluateSubmissionWithAI(project, submission);
      await new Promise((r) => setTimeout(r, 300));
      setAnalysisStep("Formulating grading verdict, score, and feedback...");
      await new Promise((r) => setTimeout(r, 200));

      // Auto-populate Grading & Decision controls
      setStatus(result.status);
      setGradePoints(result.gradePoints);
      setMentorFeedback(result.mentorFeedback);
      setAiAuditResult(result);
    } catch (err) {
      console.error("AI Review evaluation failed:", err);
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep("");
    }
  };

  useEffect(() => {
    if (autoTriggerAI && isOpen) {
      handleAIAutoReview();
    }
  }, [autoTriggerAI, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ProjectSubmission = {
      ...submission,
      status,
      gradePoints: Number(gradePoints) || 0,
      mentorFeedback: mentorFeedback.trim(),
    };
    onSaveReview(updated);
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/70">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Mentor Evaluation & Benchmark Audit
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  {project.technicalCategory}
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Reviewing Submission: {project.title}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Submitted by <strong className="text-slate-800">{submission.studentName}</strong> on{" "}
                {new Date(submission.submittedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* DELIVERABLE LINKS & ASSETS */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-3">
                Candidate Submitted Deliverables
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {submission.githubRepoUrl ? (
                  <a
                    href={submission.githubRepoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-slate-800 text-xs font-bold transition shadow-2xs group"
                  >
                    <Github className="w-4 h-4 text-slate-600 group-hover:text-indigo-600 shrink-0" />
                    <span className="truncate">GitHub Branch</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 ml-auto group-hover:text-indigo-600 shrink-0" />
                  </a>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-100/60 border border-slate-200 text-slate-400 text-xs font-semibold">
                    No GitHub Repo
                  </div>
                )}

                {submission.liveDemoUrl ? (
                  <a
                    href={submission.liveDemoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-slate-800 text-xs font-bold transition shadow-2xs group"
                  >
                    <Globe className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="truncate">Live Deployment</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 ml-auto group-hover:text-indigo-600 shrink-0" />
                  </a>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-100/60 border border-slate-200 text-slate-400 text-xs font-semibold">
                    No Live Demo
                  </div>
                )}

                {submission.fileName ? (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-bold shadow-2xs">
                    <FileArchive className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="truncate">
                      <div className="truncate text-slate-900">{submission.fileName}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{submission.fileSize || "Deliverable Archive"}</div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-100/60 border border-slate-200 text-slate-400 text-xs font-semibold">
                    No Archive Uploaded
                  </div>
                )}
              </div>
            </div>

            {/* SIDE-BY-SIDE BENCHMARK AUDIT: Intern Writeup vs Mentor Scenario */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Intern's Architecture Remarks */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-blue-900">
                    Intern's Solution & Architecture Notes
                  </h4>
                </div>
                <p className="text-[11px] text-blue-700 font-medium mb-3">
                  What the candidate explained regarding how they built it and how it works:
                </p>
                <div className="p-3.5 bg-white rounded-xl border border-blue-200 text-xs font-mono font-medium text-slate-800 leading-relaxed whitespace-pre-line flex-1 shadow-2xs">
                  {submission.submissionNotes || "(No notes provided by intern)"}
                </div>
              </div>

              {/* Mentor Benchmark Scenario (Internal Standard) with AI AUTO-REVIEW BUTTON */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 flex flex-col">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold">
                      <Lock className="w-3 h-3" />
                    </div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-900">
                      Our Benchmark & Observation Scenario
                    </h4>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                      Mentor Only
                    </span>
                  </div>

                  {/* AI AUTO-REVIEW BUTTON */}
                  <button
                    type="button"
                    onClick={handleAIAutoReview}
                    disabled={isAnalyzing}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 hover:from-indigo-700 hover:to-purple-700 transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 group shrink-0"
                    title="Read intern's solution notes, verify sync with project & benchmark, and auto-generate decision & grade"
                  >
                    <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${isAnalyzing ? "animate-spin" : "group-hover:rotate-12 transition-transform"}`} />
                    <span>{isAnalyzing ? "AI Analyzing..." : "✨ AI Auto-Review"}</span>
                  </button>
                </div>
                <p className="text-[11px] text-amber-800 font-medium mb-3">
                  The evaluation gold standard specified during assignment creation:
                </p>
                <div className="p-3.5 bg-white rounded-xl border border-amber-200 text-xs font-mono font-medium text-slate-800 leading-relaxed whitespace-pre-line flex-1 shadow-2xs">
                  {project.mentorObservationBenchmark || "No benchmark scenario defined."}
                </div>
              </div>
            </div>

            {/* AI EVALUATION IN-PROGRESS BANNER */}
            {isAnalyzing && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-indigo-200 flex items-center gap-3 shadow-xs animate-pulse">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                </div>
                <div>
                  <div className="text-xs font-black text-indigo-950">
                    AI Auto-Review & Benchmark Audit in Progress
                  </div>
                  <div className="text-[11px] font-semibold text-indigo-700 mt-0.5">
                    {analysisStep || "Auditing intern's solution against confidential benchmark..."}
                  </div>
                </div>
              </div>
            )}

            {/* AI AUDIT ASSESSMENT CARD (Visible after AI runs) */}
            {aiAuditResult && !isAnalyzing && (
              <div className="p-4.5 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-purple-50/50 to-white border border-indigo-200/90 shadow-2xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs shadow-2xs">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-indigo-950 tracking-tight">
                        AI Benchmark Audit & Decision Assessment
                      </h5>
                      <div className="text-[10px] text-slate-500 font-medium">
                        Cross-referenced with project summary ({project.technicalCategory}) & internal benchmark
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-indigo-100 text-indigo-800 border border-indigo-200">
                      🎯 {aiAuditResult.alignmentScore}% Benchmark Alignment
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        aiAuditResult.status === "passed"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      AI Recommended: {aiAuditResult.status === "passed" ? "✓ Pass" : "⚠ Revision"}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 font-medium bg-white/80 p-2.5 rounded-xl border border-slate-200/80">
                  {aiAuditResult.syncSummary}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5 text-xs">
                  {/* Verified Strengths */}
                  <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200">
                    <div className="text-[10px] font-black uppercase tracking-wider text-emerald-800 mb-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Benchmark Strengths Verified</span>
                    </div>
                    <ul className="space-y-1 text-slate-700 text-[11px] font-medium">
                      {aiAuditResult.keyMatches.map((m, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-500 font-bold shrink-0">•</span>
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Audit Gaps / Observations */}
                  <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200">
                    <div className="text-[10px] font-black uppercase tracking-wider text-amber-800 mb-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-amber-600" />
                      <span>Audit Gaps & Revision Observations</span>
                    </div>
                    <ul className="space-y-1 text-slate-700 text-[11px] font-medium">
                      {aiAuditResult.suggestedImprovements.map((s, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-500 font-bold shrink-0">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-indigo-100 flex-wrap gap-2">
                  <span className="flex items-center gap-1 text-indigo-700 font-bold">
                    <Check className="w-3.5 h-3.5 text-indigo-600" />
                    AI auto-populated Verdict, Score, and Feedback below. You can fine-tune any field before saving.
                  </span>
                  <button
                    type="button"
                    onClick={handleAIAutoReview}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Re-Run Audit</span>
                  </button>
                </div>
              </div>
            )}

            {/* GRADING & STATUS CONTROLS */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Grading & Decision
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Status Toggle */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Verdict Status
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setStatus("passed")}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                        status === "passed"
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                      }`}
                    >
                      ✓ Passed
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus("needs_revision")}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                        status === "needs_revision"
                          ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                          : "bg-white text-amber-700 border-amber-200 hover:bg-amber-50"
                      }`}
                    >
                      ⚠ Revision
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus("pending")}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                        status === "pending"
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      • Pending
                    </button>
                  </div>
                </div>

                {/* Points Awarded */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Awarded Leaderboard Points (Max: {project.leaderboardPoints} pts)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={project.leaderboardPoints * 2}
                    value={gradePoints}
                    onChange={(e) => setGradePoints(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Mentor Feedback Textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mentor Evaluation Feedback (Visible to Candidate)
                </label>
                <textarea
                  rows={3}
                  value={mentorFeedback}
                  onChange={(e) => setMentorFeedback(e.target.value)}
                  placeholder="Provide constructive feedback, highlight benchmark strengths, or specify required fixes..."
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-md flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-indigo-200" />
                <span>Save Evaluation & Grade</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
