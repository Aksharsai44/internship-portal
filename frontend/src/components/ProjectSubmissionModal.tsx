import React, { useState } from "react";
import { createPortal } from "react-dom";
import { ProjectAssignment, ProjectSubmission, Student } from "../types";
import {
  X,
  Clock,
  ExternalLink,
  UploadCloud,
  FileCheck,
  CheckCircle2,
  Sparkles,
  Github,
  Globe,
  FileText,
  AlertCircle,
  FileArchive,
  Trash2,
  Award,
  MessageSquare,
  ArrowLeft,
  BookOpen,
  Check,
  ShieldCheck,
  Calendar,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import {
  formatTime12h,
  formatDateDisplay,
  formatCompactSchedule,
  formatFullSchedule,
  getProjectScheduleStatus,
} from "../utils/projectDateUtils";

interface ProjectSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectAssignment;
  currentStudent?: Student;
  existingSubmission?: ProjectSubmission | null;
  onSubmit: (submission: ProjectSubmission) => void;
}

export const ProjectSubmissionModal: React.FC<ProjectSubmissionModalProps> = ({
  isOpen,
  onClose,
  project,
  currentStudent,
  existingSubmission,
  onSubmit,
}) => {
  const isApproved =
    existingSubmission?.status === "passed" ||
    Boolean(existingSubmission?.mentorFeedback && existingSubmission?.status !== "needs_revision");

  const [githubUrl, setGithubUrl] = useState(
    existingSubmission?.githubRepoUrl ||
      (currentStudent?.githubUrl ? `${currentStudent.githubUrl}/project-deliverable` : "https://github.com/alexrivera-ux/corporate-token")
  );
  const [liveDemoUrl, setLiveDemoUrl] = useState(
    existingSubmission?.liveDemoUrl || "https://alex-tokens-preview.vercel.app"
  );
  const [submissionNotes, setSubmissionNotes] = useState(
    existingSubmission?.submissionNotes ||
      "Implemented the full WCAG AA token contrast system with automated theme variables. Verified on Chrome and Safari."
  );

  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: string;
  } | null>(
    existingSubmission?.fileName
      ? {
          name: existingSubmission.fileName,
          size: existingSubmission.fileSize || "12.4 MB",
        }
      : null
  );

  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isApproved) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setUploadedFile({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isApproved) return;
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploadedFile({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isApproved) {
      onClose();
      return;
    }
    setSubmitting(true);

    const submission: ProjectSubmission = {
      id: existingSubmission?.id || `sub_${Date.now()}`,
      projectId: project.id,
      studentId: currentStudent?.id || "student_01",
      studentName: currentStudent?.name || "Alex Rivera",
      batchId: project.batchId,
      submittedAt: new Date().toISOString(),
      githubRepoUrl: githubUrl.trim(),
      liveDemoUrl: liveDemoUrl.trim(),
      fileName: uploadedFile?.name,
      fileSize: uploadedFile?.size,
      submissionNotes: submissionNotes.trim(),
      status: existingSubmission?.status || "pending",
      gradePoints: existingSubmission?.gradePoints,
      mentorFeedback: existingSubmission?.mentorFeedback,
    };

    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.6 },
    });

    setTimeout(() => {
      onSubmit(submission);
      setSubmitting(false);
      onClose();
    }, 400);
  };

  const priorityBadgeColor =
    project.priority === "High"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : project.priority === "Medium"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-emerald-50 text-emerald-700 border-emerald-200";

  const scheduleStatus = getProjectScheduleStatus(
    project.startDate,
    project.startTime,
    project.deadline,
    project.deadlineTime
  );

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-[100] bg-[#f8fafc] flex flex-col h-screen w-screen overflow-hidden"
      >
        {/* TOP STICKY HEADER (Full Screen Takeover with clean padding) */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 sm:px-10 pt-5 sm:pt-6 pb-4 sm:pb-5 shrink-0 shadow-xs">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2.5 rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/70 border border-slate-200 transition cursor-pointer flex items-center gap-1.5 text-xs font-black shadow-2xs group shrink-0"
                title="Return to Assigned Projects"
              >
                <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-indigo-600 transition-colors" />
                <span>Back to Projects</span>
              </button>

              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${priorityBadgeColor}`}
                  >
                    {project.priority.toUpperCase()} PRIORITY
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {project.technicalCategory}
                  </span>
                  <span className="text-amber-500 font-black text-xs flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    <span>+{project.leaderboardPoints} Points</span>
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${scheduleStatus.badgeClass}`}>
                    {scheduleStatus.label}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-normal">
                  {project.title}
                </h2>

                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-1 flex-wrap">
                  {project.startDate && (
                    <>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Start: <strong className="text-slate-800">{formatCompactSchedule(project.startDate, project.startTime || "09:00")}</strong></span>
                      </span>
                      <span>•</span>
                    </>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-rose-500" />
                    <span>Deadline: <strong className="text-slate-800">{formatCompactSchedule(project.deadline, project.deadlineTime || "23:59")}</strong></span>
                  </span>
                  <span>•</span>
                  <span>Cohort: <strong className="text-slate-700">{project.batchName || "All Cohorts"}</strong></span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition cursor-pointer shadow-2xs shrink-0"
              title="Close Full Screen View"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* MAIN SCROLLABLE BODY */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6 sm:p-10 bg-[#f8fafc]">
            <div className="max-w-7xl mx-auto space-y-6 pb-16">
              {/* MENTOR EVALUATION & FEEDBACK BANNER (If Submission Graded) */}
              {existingSubmission && (existingSubmission.status !== "pending" || existingSubmission.mentorFeedback) && (
                <div
                  className={`p-5 rounded-3xl border-2 shadow-2xs ${
                    existingSubmission.status === "passed"
                      ? "bg-emerald-50/80 border-emerald-300"
                      : existingSubmission.status === "needs_revision"
                      ? "bg-amber-50/80 border-amber-300"
                      : "bg-indigo-50/80 border-indigo-200"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                          existingSubmission.status === "passed"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                          Official Mentor Evaluation & Verdict
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Reviewed by Cohort Lead / Mentor
                        </p>
                      </div>
                    </div>

                    <div>
                      {existingSubmission.status === "passed" && (
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                          ✓ Passed ({existingSubmission.gradePoints ?? project.leaderboardPoints} pts awarded)
                        </span>
                      )}
                      {existingSubmission.status === "needs_revision" && (
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300">
                          ⚠ Needs Revision ({existingSubmission.gradePoints ?? 0} pts)
                        </span>
                      )}
                    </div>
                  </div>

                  {existingSubmission.mentorFeedback && (
                    <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium mt-2 shadow-2xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
                        <MessageSquare className="w-4 h-4 text-indigo-600" />
                        <span>Mentor Review Remarks:</span>
                      </div>
                      <p className="italic text-slate-800">"{existingSubmission.mentorFeedback}"</p>
                    </div>
                  )}
                </div>
              )}

              {/* TWO-COLUMN SPACIOUS LAYOUT */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* LEFT COLUMN (5 cols): Instructions, Specs & Rubric */}
                <div className="lg:col-span-5 space-y-6">
                  {/* CARD 0: PROJECT SCHEDULE & TIME WINDOW (Requested: Start Date/Time & Deadline Date/Time) */}
                  <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900">
                        <Calendar className="w-4 h-4 text-indigo-600" />
                        <span>Project Schedule & Timeline</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${scheduleStatus.badgeClass}`}>
                        {scheduleStatus.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="p-3.5 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-1">
                        <div className="text-[10px] uppercase font-black tracking-wider text-indigo-700 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-indigo-500" />
                          <span>Kickoff Start</span>
                        </div>
                        <div className="text-xs font-black text-slate-900">
                          {formatDateDisplay(project.startDate || "2026-09-08")}
                        </div>
                        <div className="text-[11px] text-indigo-800 font-bold">
                          {formatTime12h(project.startTime || "09:00")}
                        </div>
                      </div>

                      <div className="p-3.5 bg-rose-50/50 rounded-2xl border border-rose-100 space-y-1">
                        <div className="text-[10px] uppercase font-black tracking-wider text-rose-700 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-rose-500" />
                          <span>Final Deadline</span>
                        </div>
                        <div className="text-xs font-black text-slate-900">
                          {formatDateDisplay(project.deadline)}
                        </div>
                        <div className="text-[11px] text-rose-700 font-bold">
                          {formatTime12h(project.deadlineTime || "23:59")}
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 font-medium">
                      All deliverables submitted prior to deadline cutoff are eligible for 100% on-time leaderboard rank.
                    </p>
                  </div>

                  {/* CARD 1: ASSIGNMENT INSTRUCTIONS & REQUIREMENTS */}
                  <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900">
                        <FileText className="w-4 h-4 text-indigo-600" />
                        <span>Assignment Instructions & Requirements</span>
                      </div>
                    </div>

                    {project.executiveSummary && (
                      <div className="p-3.5 bg-indigo-50/60 rounded-2xl border border-indigo-100 text-xs text-indigo-950 font-medium leading-relaxed">
                        <strong className="font-bold text-indigo-900 block mb-0.5">Objective:</strong>
                        {project.executiveSummary}
                      </div>
                    )}

                    <div className="text-xs text-slate-700 font-medium leading-relaxed whitespace-pre-line space-y-1.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 font-mono">
                      {project.detailedInstructions}
                    </div>
                  </div>

                  {/* CARD 2: ATTACHED SPECS & STARTER MATERIALS */}
                  {project.resources && project.resources.length > 0 && (
                    <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900">
                          <BookOpen className="w-4 h-4 text-indigo-600" />
                          <span>Attached Specs & Starter Materials</span>
                        </div>
                        <span className="text-[11px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                          {project.resources.length} Specs
                        </span>
                      </div>

                      <div className="space-y-2 pt-1">
                        {project.resources.map((res) => (
                          <a
                            key={res.id}
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-xs font-bold text-slate-800 transition shadow-2xs group cursor-pointer"
                          >
                            <span className="truncate pr-2">{res.title}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-indigo-600 group-hover:scale-110 transition-transform shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CARD 3: EVALUATION & SCORING GUIDANCE */}
                  <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800">
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      <span>Grading Criteria & Punctuality</span>
                    </div>
                    <ul className="text-xs text-slate-600 space-y-2 font-medium">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>Functional implementation conforming to project instructions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>Production-ready deploy preview URL and accessible Git repo</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>Detailed architecture notes outlining design decisions and edge cases</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* RIGHT COLUMN (7 cols): Deliverables Submission Area */}
                <div className="lg:col-span-7 space-y-6">
                  {/* APPROVED & LOCKED BANNER */}
                  {isApproved && (
                    <div className="p-4 sm:p-5 rounded-3xl bg-emerald-50/90 border-2 border-emerald-300 text-xs shadow-2xs flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-black text-emerald-950 text-xs uppercase tracking-wide">
                          Deliverable Approved & Locked
                        </h5>
                        <p className="text-[11px] text-emerald-800 font-medium mt-0.5 leading-relaxed">
                          This submission has already received official mentor grading ({existingSubmission?.gradePoints ?? project.leaderboardPoints} pts awarded). Deliverable updates are permanently locked.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* CARD 1: DELIVERABLE FILE ARCHIVE DROPZONE */}
                  <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900">
                        <UploadCloud className="w-4 h-4 text-indigo-600" />
                        <span>Upload Deliverables Archive</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">
                        ZIP, PDF, or tar.gz (Max 50MB)
                      </span>
                    </div>

                    <div
                      onDragOver={(e) => {
                        if (isApproved) return;
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleFileDrop}
                      className={`relative p-8 rounded-2xl border-2 border-dashed text-center transition-all ${
                        isApproved
                          ? "border-slate-200 bg-slate-50/60 cursor-default"
                          : isDragging
                          ? "border-indigo-500 bg-indigo-50/50"
                          : uploadedFile
                          ? "border-emerald-300 bg-emerald-50/30"
                          : "border-slate-200 bg-slate-50/40 hover:bg-slate-50"
                      }`}
                    >
                      {uploadedFile ? (
                        <div className="flex items-center justify-between max-w-md mx-auto p-3.5 bg-white rounded-2xl border border-emerald-200 shadow-2xs">
                          <div className="flex items-center gap-3 truncate">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                              <FileArchive className="w-5 h-5" />
                            </div>
                            <div className="text-left truncate">
                              <div className="text-xs font-bold text-slate-900 truncate">
                                {uploadedFile.name}
                              </div>
                              <div className="text-[10px] text-slate-400 font-medium">
                                {uploadedFile.size} • {isApproved ? "Archived & Verified" : "Ready for mentor review"}
                              </div>
                            </div>
                          </div>
                          {!isApproved && (
                            <button
                              type="button"
                              onClick={() => setUploadedFile(null)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Remove file"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <div>
                          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2.5 shadow-2xs">
                            <UploadCloud className="w-7 h-7" />
                          </div>
                          <p className="text-xs font-bold text-slate-800">
                            {isApproved ? (
                              "No archive file attached."
                            ) : (
                              <>
                                Drag & drop deliverable archive here, or{" "}
                                <label className="text-indigo-600 hover:underline cursor-pointer">
                                  browse
                                  <input
                                    type="file"
                                    accept=".zip,.tar.gz,.tar,.pdf"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                  />
                                </label>
                              </>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Accepted formats: ZIP, PDF, tar.gz (Up to 50MB)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CARD 2: GITHUB REPO & LIVE DEPLOYMENT URLS */}
                  <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
                      <Globe className="w-4 h-4 text-indigo-600" />
                      <span>Project Links & Deployment URLs</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          GitHub Repository Branch URL <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Github className="w-4 h-4" />
                          </div>
                          <input
                            type="url"
                            required
                            readOnly={isApproved}
                            disabled={isApproved}
                            value={githubUrl}
                            onChange={(e) => setGithubUrl(e.target.value)}
                            placeholder="https://github.com/alexrivera-ux/corporate-token"
                            className={`w-full pl-10 pr-3 py-2.5 rounded-xl text-xs font-mono font-medium transition ${
                              isApproved
                                ? "bg-slate-100 text-slate-600 border border-slate-200 cursor-not-allowed"
                                : "bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                            }`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Live Deployment / Demo URL <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Globe className="w-4 h-4" />
                          </div>
                          <input
                            type="url"
                            required
                            readOnly={isApproved}
                            disabled={isApproved}
                            value={liveDemoUrl}
                            onChange={(e) => setLiveDemoUrl(e.target.value)}
                            placeholder="https://alex-tokens-preview.vercel.app"
                            className={`w-full pl-10 pr-3 py-2.5 rounded-xl text-xs font-mono font-medium transition ${
                              isApproved
                                ? "bg-slate-100 text-slate-600 border border-slate-200 cursor-not-allowed"
                                : "bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CARD 3: SUBMISSION NOTES & ARCHITECTURE REMARKS */}
                  <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900">
                        <MessageSquare className="w-4 h-4 text-indigo-600" />
                        <span>Submission Notes & Architecture Remarks</span>
                      </div>
                      <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                        Intern Technical Writeup
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 font-medium">
                      Explain your technical solution: how it was built, component architecture, state management patterns, and verified edge cases. Your mentor evaluates this writeup against gold standard benchmarks.
                    </p>

                    <textarea
                      rows={5}
                      readOnly={isApproved}
                      disabled={isApproved}
                      value={submissionNotes}
                      onChange={(e) => setSubmissionNotes(e.target.value)}
                      placeholder="Explain your approach, component hierarchy, trade-offs made, and how to test the application..."
                      className={`w-full p-4 rounded-2xl text-xs font-medium leading-relaxed shadow-inner transition ${
                        isApproved
                          ? "bg-slate-100 text-slate-600 border border-slate-200 cursor-not-allowed"
                          : "bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* STICKY BOTTOM ACTION FOOTER */}
          <footer className="sticky bottom-0 z-30 bg-white border-t border-slate-200 px-6 sm:px-10 py-4 shrink-0 shadow-xs">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>
                  {isApproved ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Deliverable Graded & Evaluated by Mentor</span>
                    </span>
                  ) : (
                    <>
                      Submission Window Open • Target Deadline:{" "}
                      <strong className="text-slate-800">
                        {formatFullSchedule(project.deadline, project.deadlineTime || "23:59")}
                      </strong>
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                >
                  {isApproved ? "Close" : "Cancel"}
                </button>
                {isApproved ? (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 transition shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>Deliverable Approved & Locked</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4 text-indigo-200" />
                    <span>
                      {submitting
                        ? "Submitting Work..."
                        : existingSubmission?.status === "needs_revision"
                        ? "Resubmit Revised Deliverable"
                        : existingSubmission
                        ? "Update Deliverable Submission"
                        : "Submit Project for Grading"}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </footer>
        </form>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};
