import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  ProjectAssignment,
  ProjectSubmission,
  Student,
} from "../types";
import {
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Github,
  Globe,
  FileArchive,
  ExternalLink,
  Award,
  Search,
  Users,
  Send,
  Check,
  Lock,
  ChevronRight,
  TrendingUp,
  FileText,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Calendar,
  LayoutGrid,
  Table,
  CheckSquare,
  Square,
  RotateCcw,
  Play,
  Zap,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ProjectReviewModal } from "./ProjectReviewModal";
import { formatCompactSchedule } from "../utils/projectDateUtils";
import { evaluateSubmissionWithAI, AIReviewResult } from "../utils/aiProjectReviewEvaluator";

interface ProjectSubmissionsRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectAssignment;
  submissions: ProjectSubmission[];
  students: Student[];
  onSaveReview: (updatedSubmission: ProjectSubmission) => void;
  onBulkUpdateSubmissions?: (updatedSubmissions: ProjectSubmission[]) => void;
}

export const ProjectSubmissionsRosterModal: React.FC<ProjectSubmissionsRosterModalProps> = ({
  isOpen,
  onClose,
  project,
  submissions,
  students,
  onSaveReview,
  onBulkUpdateSubmissions,
}) => {
  const [activeTab, setActiveTab] = useState<"submitted" | "not_submitted" | "benchmark">("submitted");
  const [filterVerdict, setFilterVerdict] = useState<"all" | "pending" | "passed" | "needs_revision" | "ontime" | "late">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubmissionForReview, setSelectedSubmissionForReview] = useState<ProjectSubmission | null>(null);
  const [remindedStudentIds, setRemindedStudentIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [autoTriggerAIForReview, setAutoTriggerAIForReview] = useState(false);

  // Multi-selection states
  const [selectedSubIds, setSelectedSubIds] = useState<Set<string>>(new Set());

  // Bulk AI Auto-Review Studio Modal states
  const [isBulkAuditModalOpen, setIsBulkAuditModalOpen] = useState(false);
  const [bulkTargetMode, setBulkTargetMode] = useState<"pending" | "all" | "selected">("pending");
  const [isBulkRunning, setIsBulkRunning] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{
    current: number;
    total: number;
    currentStudent: string;
    stepText: string;
  }>({ current: 0, total: 0, currentStudent: "", stepText: "" });

  const [bulkEvaluatedResults, setBulkEvaluatedResults] = useState<
    Array<{
      submission: ProjectSubmission;
      aiResult: AIReviewResult;
      editedFeedback: string;
      editedPoints: number;
      editedStatus: "passed" | "needs_revision";
    }>
  >([]);

  const [bulkNotice, setBulkNotice] = useState<string | null>(null);

  // Derive all submissions for this project
  const projectSubmissions = useMemo(() => {
    return submissions.filter((s) => s.projectId === project.id);
  }, [submissions, project.id]);

  // Derive cohort students relevant to this project
  const cohortStudents = useMemo(() => {
    let pool = students;
    if (project.batchId && project.batchId !== "all") {
      pool = students.filter((s) => s.batchId === project.batchId);
    }
    return pool;
  }, [students, project.batchId, project.batchName]);

  // Check if a submission is on-time
  const isSubmissionOnTime = (sub: ProjectSubmission) => {
    try {
      const subTime = new Date(sub.submittedAt).getTime();
      const deadlineStr = project.deadlineTime
        ? `${project.deadline}T${project.deadlineTime}`
        : `${project.deadline}T23:59:59`;
      const deadlineTime = new Date(deadlineStr).getTime();
      return subTime <= deadlineTime;
    } catch {
      return true;
    }
  };

  // Find students who haven't submitted yet
  const submittedStudentIds = useMemo(() => {
    return new Set(projectSubmissions.map((s) => s.studentId));
  }, [projectSubmissions]);

  const submittedStudentNames = useMemo(() => {
    return new Set(projectSubmissions.map((s) => s.studentName.toLowerCase().trim()));
  }, [projectSubmissions]);

  const notSubmittedStudents = useMemo(() => {
    return cohortStudents.filter(
      (s) => !submittedStudentIds.has(s.id) && !submittedStudentNames.has(s.name.toLowerCase().trim())
    );
  }, [cohortStudents, submittedStudentIds, submittedStudentNames]);

  // Metrics Calculations
  const submittedCount = projectSubmissions.length;
  const totalAssigned = Math.max(cohortStudents.length, submittedCount);
  const notSubmittedCount = Math.max(0, totalAssigned - submittedCount);

  const onTimeCount = useMemo(() => {
    return projectSubmissions.filter(isSubmissionOnTime).length;
  }, [projectSubmissions]);

  const lateCount = Math.max(0, submittedCount - onTimeCount);

  const passedCount = projectSubmissions.filter((s) => s.status === "passed").length;
  const revisionCount = projectSubmissions.filter((s) => s.status === "needs_revision").length;
  const pendingCount = projectSubmissions.filter((s) => s.status === "pending").length;

  const submissionPercentage = totalAssigned > 0 ? Math.round((submittedCount / totalAssigned) * 100) : 0;

  // Filtered submissions list
  const filteredSubmissions = useMemo(() => {
    return projectSubmissions.filter((sub) => {
      // Verdict filter
      if (filterVerdict === "pending" && sub.status !== "pending") return false;
      if (filterVerdict === "passed" && sub.status !== "passed") return false;
      if (filterVerdict === "needs_revision" && sub.status !== "needs_revision") return false;
      if (filterVerdict === "ontime" && !isSubmissionOnTime(sub)) return false;
      if (filterVerdict === "late" && isSubmissionOnTime(sub)) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = sub.studentName.toLowerCase().includes(q);
        const matchesNotes = sub.submissionNotes.toLowerCase().includes(q);
        if (!matchesName && !matchesNotes) return false;
      }
      return true;
    });
  }, [projectSubmissions, filterVerdict, searchQuery]);

  const handleToggleSelectSubmission = (subId: string) => {
    setSelectedSubIds((prev) => {
      const next = new Set(prev);
      if (next.has(subId)) {
        next.delete(subId);
      } else {
        next.add(subId);
      }
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    if (selectedSubIds.size === filteredSubmissions.length && filteredSubmissions.length > 0) {
      setSelectedSubIds(new Set());
    } else {
      setSelectedSubIds(new Set(filteredSubmissions.map((s) => s.id)));
    }
  };

  const handleSelectOnlyPending = () => {
    const pendingIds = projectSubmissions.filter((s) => s.status === "pending").map((s) => s.id);
    setSelectedSubIds(new Set(pendingIds));
  };

  const openBulkAuditModal = (initialMode?: "pending" | "all" | "selected") => {
    if (initialMode) {
      setBulkTargetMode(initialMode);
    } else if (selectedSubIds.size > 0) {
      setBulkTargetMode("selected");
    } else if (pendingCount > 0) {
      setBulkTargetMode("pending");
    } else {
      setBulkTargetMode("all");
    }
    setBulkEvaluatedResults([]);
    setIsBulkAuditModalOpen(true);
  };

  const getTargetSubmissionsForBulk = () => {
    if (bulkTargetMode === "selected" && selectedSubIds.size > 0) {
      return projectSubmissions.filter((s) => selectedSubIds.has(s.id));
    }
    if (bulkTargetMode === "pending") {
      const pending = projectSubmissions.filter((s) => s.status === "pending");
      return pending.length > 0 ? pending : projectSubmissions;
    }
    return projectSubmissions;
  };

  const runBulkAIAudit = async () => {
    const targets = getTargetSubmissionsForBulk();
    if (targets.length === 0) return;

    setIsBulkRunning(true);
    const results: Array<{
      submission: ProjectSubmission;
      aiResult: AIReviewResult;
      editedFeedback: string;
      editedPoints: number;
      editedStatus: "passed" | "needs_revision";
    }> = [];

    for (let i = 0; i < targets.length; i++) {
      const sub = targets[i];
      setBulkProgress({
        current: i + 1,
        total: targets.length,
        currentStudent: sub.studentName,
        stepText: `Cross-referencing solution notes against benchmark scenario (${i + 1}/${targets.length})...`,
      });

      // Small delay for smooth UI feedback & pacing
      await new Promise((r) => setTimeout(r, 220));

      const aiRes = await evaluateSubmissionWithAI(project, sub);

      results.push({
        submission: sub,
        aiResult: aiRes,
        editedFeedback: aiRes.mentorFeedback,
        editedPoints: aiRes.gradePoints,
        editedStatus: aiRes.status,
      });

      // Update state incrementally so results stream in live!
      setBulkEvaluatedResults([...results]);
    }

    setIsBulkRunning(false);
  };

  const updateEvaluatedItem = (
    index: number,
    updates: Partial<{
      editedFeedback: string;
      editedPoints: number;
      editedStatus: "passed" | "needs_revision";
    }>
  ) => {
    setBulkEvaluatedResults((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, ...updates } : item))
    );
  };

  const applyAndSaveBulkEvaluations = () => {
    if (bulkEvaluatedResults.length === 0) return;

    const updatedSubmissions: ProjectSubmission[] = bulkEvaluatedResults.map((item) => ({
      ...item.submission,
      status: item.editedStatus,
      gradePoints: item.editedPoints,
      mentorFeedback: item.editedFeedback,
    }));

    if (onBulkUpdateSubmissions) {
      onBulkUpdateSubmissions(updatedSubmissions);
    } else {
      updatedSubmissions.forEach((sub) => onSaveReview(sub));
    }

    // Clear selection
    setSelectedSubIds(new Set());
    setIsBulkAuditModalOpen(false);
    setBulkNotice(
      `Successfully auto-reviewed and updated ${updatedSubmissions.length} submissions with AI Scenario Benchmark Audit!`
    );

    setTimeout(() => {
      setBulkNotice(null);
    }, 6000);
  };

  if (!isOpen) return null;

  const handleSendReminder = (studentId: string) => {
    setRemindedStudentIds((prev) => new Set([...prev, studentId]));
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-[100] bg-[#f8fafc] flex flex-col h-screen w-screen overflow-hidden"
      >
        {/* TOP HEADER (Full Screen Takeover with generous padding to prevent any top clipping) */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 sm:px-10 pt-5 sm:pt-6 pb-4 sm:pb-5 shrink-0 shadow-xs">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2.5 rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/70 border border-slate-200 transition cursor-pointer flex items-center gap-1.5 text-xs font-black shadow-2xs group shrink-0"
                title="Return to Assigned Projects"
              >
                <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-indigo-600 transition-colors" />
                <span>Back to Board</span>
              </button>

              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Project Deliverables & Review Center
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {project.technicalCategory}
                  </span>
                  <span className="text-amber-500 font-black text-xs">
                    +{project.leaderboardPoints} pts
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-normal">
                  {project.title}
                </h2>
                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-1.5 flex-wrap">
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

        {/* SUMMARY ANALYTICS BAR (Ultra Compact to maximize screen real estate for reviews) */}
        <section className="bg-slate-50/80 border-b border-slate-200 px-6 sm:px-10 py-2 shrink-0">
          <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Total Assigned */}
            <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                <Users className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[9.5px] font-black uppercase tracking-wider text-slate-400 leading-tight">Total Assigned</div>
                <div className="text-xs font-black text-slate-900 leading-tight mt-0.5 flex items-center gap-1">
                  <span>{totalAssigned}</span>
                  <span className="text-[10px] font-semibold text-slate-500">Interns</span>
                </div>
              </div>
            </div>

            {/* Submitted & Submission Rate */}
            <div className="px-3 py-1.5 rounded-xl bg-indigo-50/40 border border-indigo-200/80 shadow-2xs flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[9.5px] font-black uppercase tracking-wider text-indigo-700 leading-tight">Submitted</div>
                <div className="text-xs font-black text-indigo-950 leading-tight mt-0.5 flex items-center gap-1.5">
                  <span>{submittedCount}</span>
                  <span className="text-[10px] font-bold text-indigo-600">({submissionPercentage}%)</span>
                </div>
              </div>
            </div>

            {/* In-Time Submissions */}
            <div className="px-3 py-1.5 rounded-xl bg-emerald-50/40 border border-emerald-200/80 shadow-2xs flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[9.5px] font-black uppercase tracking-wider text-emerald-700 leading-tight">In-Time Submissions</div>
                <div className="text-xs font-black text-emerald-950 leading-tight mt-0.5 flex items-center gap-1.5">
                  <span>{onTimeCount} On-time</span>
                  {lateCount > 0 && (
                    <span className="text-[10px] font-bold text-amber-700">({lateCount} late)</span>
                  )}
                </div>
              </div>
            </div>

            {/* Mentor Reviews Status (High Clarity!) */}
            <div className="px-3 py-1.5 rounded-xl bg-purple-50/40 border border-purple-200/80 shadow-2xs flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <Award className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[9.5px] font-black uppercase tracking-wider text-purple-700 leading-tight">Reviews & Grading</div>
                <div className="text-xs font-black text-purple-950 leading-tight mt-0.5 flex items-center gap-1.5">
                  <span>{passedCount + revisionCount}/{submittedCount} Graded</span>
                  {pendingCount > 0 ? (
                    <span className="text-[10px] font-bold text-rose-600">({pendingCount} pending)</span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-600">(All Graded)</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TABS NAVIGATION */}
        <nav className="bg-white border-b border-slate-200 px-6 sm:px-10 pt-3 shrink-0">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setActiveTab("submitted")}
                className={`pb-3 text-xs font-black transition cursor-pointer border-b-2 flex items-center gap-2 ${
                  activeTab === "submitted"
                    ? "border-indigo-600 text-indigo-600 font-black"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <span>Submitted Work</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-700">
                  {submittedCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("not_submitted")}
                className={`pb-3 text-xs font-black transition cursor-pointer border-b-2 flex items-center gap-2 ${
                  activeTab === "not_submitted"
                    ? "border-indigo-600 text-indigo-600 font-black"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <span>Not Submitted</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-700">
                  {notSubmittedCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("benchmark")}
                className={`pb-3 text-xs font-black transition cursor-pointer border-b-2 flex items-center gap-2 ${
                  activeTab === "benchmark"
                    ? "border-indigo-600 text-indigo-600 font-black"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>Mentor Scenario Benchmark</span>
              </button>
            </div>

            {activeTab === "submitted" && (
              <div className="relative pb-2.5">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search candidate or note..."
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white w-56 shadow-2xs"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              </div>
            )}
          </div>
        </nav>

        {/* TAB CONTENT AREA */}
        <main className="p-6 sm:p-10 overflow-y-auto flex-1 bg-[#f8fafc]">
          <div className="max-w-7xl mx-auto space-y-4">
            {/* Bulk Notice Banner */}
            {bulkNotice && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between gap-3 shadow-xs animate-in fade-in duration-150">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{bulkNotice}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setBulkNotice(null)}
                  className="p-1 text-emerald-700 hover:text-emerald-900 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* TAB 1: SUBMITTED WORK */}
            {activeTab === "submitted" && (
              <div className="space-y-4">
                {/* Filter Pills & View Switcher */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setFilterVerdict("all")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        filterVerdict === "all"
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      All ({submittedCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterVerdict("pending")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        filterVerdict === "pending"
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                      }`}
                    >
                      • Pending Review ({pendingCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterVerdict("passed")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        filterVerdict === "passed"
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                      }`}
                    >
                      ✓ Passed ({passedCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterVerdict("needs_revision")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        filterVerdict === "needs_revision"
                          ? "bg-amber-600 text-white border-amber-600"
                          : "bg-white text-amber-700 border-amber-200 hover:bg-amber-50"
                      }`}
                    >
                      ⚠ Needs Revision ({revisionCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterVerdict("ontime")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        filterVerdict === "ontime"
                          ? "bg-emerald-700 text-white border-emerald-700"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      On-Time ({onTimeCount})
                    </button>
                    {lateCount > 0 && (
                      <button
                        type="button"
                        onClick={() => setFilterVerdict("late")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          filterVerdict === "late"
                            ? "bg-rose-600 text-white border-rose-600"
                            : "bg-white text-rose-700 border-rose-200 hover:bg-rose-50"
                        }`}
                      >
                        Late ({lateCount})
                      </button>
                    )}
                  </div>

                  {/* Right Actions: Bulk AI Auto-Review Button & View Mode Switcher */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => openBulkAuditModal()}
                      className="px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-xs hover:shadow transition flex items-center gap-1.5 cursor-pointer shrink-0"
                      title="Run AI Benchmark Audit across multiple submissions in bulk"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>✨ Bulk AI Auto-Review</span>
                      {pendingCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-black">
                          {pendingCount} Pending
                        </span>
                      )}
                    </button>

                    {/* View Mode Switcher (Compact Cards vs All Reviews Table) */}
                    <div className="flex items-center gap-1 bg-white border border-slate-200 p-0.5 rounded-xl shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setViewMode("cards")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                          viewMode === "cards"
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                        title="Card Layout"
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        <span>Card View</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode("table")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                          viewMode === "table"
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                        title="All Reviews Matrix Table"
                      >
                        <Table className="w-3.5 h-3.5" />
                        <span>All Reviews Table</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* MULTI-SELECTION BATCH ACTION BAR */}
                {selectedSubIds.size > 0 && (
                  <div className="p-3 rounded-2xl bg-slate-900 text-white shadow-lg flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
                    <div className="flex items-center gap-3 text-xs font-bold">
                      <div className="flex items-center gap-1.5">
                        <CheckSquare className="w-4 h-4 text-indigo-400" />
                        <span>
                          <strong className="text-white">{selectedSubIds.size}</strong> of {filteredSubmissions.length} submissions selected
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleSelectAllFiltered}
                        className="text-[11px] font-bold text-indigo-300 hover:text-indigo-200 underline cursor-pointer"
                      >
                        {selectedSubIds.size === filteredSubmissions.length ? "Deselect All" : "Select All Filtered"}
                      </button>
                      {pendingCount > 0 && (
                        <button
                          type="button"
                          onClick={handleSelectOnlyPending}
                          className="text-[11px] font-bold text-indigo-300 hover:text-indigo-200 underline cursor-pointer"
                        >
                          Select Only Pending ({pendingCount})
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openBulkAuditModal("selected")}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Run AI Auto-Review on Selected ({selectedSubIds.size})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedSubIds(new Set())}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}

                {filteredSubmissions.length === 0 ? (
                  <div className="py-14 text-center rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 text-xs font-semibold bg-white">
                    No submissions matching this filter
                  </div>
                ) : viewMode === "table" ? (
                  /* ========================================================
                     ALL REVIEWS MATRIX TABLE (Dense Bird's Eye View)
                     ======================================================== */
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/90 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500">
                            <th className="py-2.5 px-3 text-center w-10">
                              <input
                                type="checkbox"
                                aria-label="Select all submissions"
                                checked={
                                  filteredSubmissions.length > 0 &&
                                  filteredSubmissions.every((s) => selectedSubIds.has(s.id))
                                }
                                onChange={handleSelectAllFiltered}
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer w-4 h-4"
                              />
                            </th>
                            <th className="py-2.5 px-3.5">Candidate</th>
                            <th className="py-2.5 px-3">Timeline</th>
                            <th className="py-2.5 px-3">Deliverables</th>
                            <th className="py-2.5 px-3 min-w-[200px]">Intern Solution Notes</th>
                            <th className="py-2.5 px-3">Review Status & Score</th>
                            <th className="py-2.5 px-3.5 min-w-[280px]">Official Mentor Feedback</th>
                            <th className="py-2.5 px-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {filteredSubmissions.map((sub) => {
                            const onTime = isSubmissionOnTime(sub);
                            const candidate = cohortStudents.find((s) => s.id === sub.studentId);
                            const isReviewed = sub.status !== "pending" || !!sub.mentorFeedback;

                            return (
                              <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                                {/* Select Checkbox */}
                                <td className="py-3 px-3 text-center">
                                  <input
                                    type="checkbox"
                                    aria-label={`Select ${sub.studentName}`}
                                    checked={selectedSubIds.has(sub.id)}
                                    onChange={() => handleToggleSelectSubmission(sub.id)}
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer w-4 h-4"
                                  />
                                </td>
                                {/* Candidate */}
                                <td className="py-3 px-3.5">
                                  <div className="flex items-center gap-2.5">
                                    <img
                                      src={candidate?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(sub.studentName)}`}
                                      alt={sub.studentName}
                                      className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 shrink-0 shadow-2xs"
                                    />
                                    <div>
                                      <div className="font-black text-slate-900 leading-snug">{sub.studentName}</div>
                                      <div className="text-[10px] text-slate-500 font-medium">{candidate?.college || "Enrolled Intern"}</div>
                                    </div>
                                  </div>
                                </td>

                                {/* Timeline */}
                                <td className="py-3 px-3 whitespace-nowrap">
                                  {onTime ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      <CheckCircle2 className="w-3 h-3" />
                                      <span>On-Time</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                      <Clock className="w-3 h-3" />
                                      <span>Late</span>
                                    </span>
                                  )}
                                  <div className="text-[10px] text-slate-400 mt-0.5">
                                    {new Date(sub.submittedAt).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </div>
                                </td>

                                {/* Deliverables */}
                                <td className="py-3 px-3">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    {sub.githubRepoUrl && (
                                      <a
                                        href={sub.githubRepoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1 rounded-md bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200 transition"
                                        title="View GitHub Branch"
                                      >
                                        <Github className="w-3.5 h-3.5" />
                                      </a>
                                    )}
                                    {sub.liveDemoUrl && (
                                      <a
                                        href={sub.liveDemoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1 rounded-md bg-slate-100 hover:bg-indigo-50 text-indigo-600 border border-slate-200 transition"
                                        title="Open Live Deployment Demo"
                                      >
                                        <Globe className="w-3.5 h-3.5" />
                                      </a>
                                    )}
                                    {sub.fileName && (
                                      <span
                                        className="p-1 rounded-md bg-slate-100 text-emerald-700 border border-slate-200 inline-flex items-center gap-1"
                                        title={sub.fileName}
                                      >
                                        <FileArchive className="w-3.5 h-3.5" />
                                      </span>
                                    )}
                                  </div>
                                </td>

                                {/* Intern Solution Notes */}
                                <td className="py-3 px-3">
                                  <p className="text-xs text-slate-600 font-medium leading-relaxed max-h-16 overflow-y-auto line-clamp-3">
                                    {sub.submissionNotes || "No architecture notes provided."}
                                  </p>
                                </td>

                                {/* Review Status & Score */}
                                <td className="py-3 px-3 whitespace-nowrap">
                                  {sub.status === "passed" && (
                                    <div>
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black text-emerald-800 bg-emerald-50 border border-emerald-200">
                                        ✓ Passed
                                      </span>
                                      <div className="text-[11px] font-black text-emerald-950 mt-1">
                                        {sub.gradePoints ?? project.leaderboardPoints} / {project.leaderboardPoints} pts
                                      </div>
                                    </div>
                                  )}
                                  {sub.status === "needs_revision" && (
                                    <div>
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black text-amber-800 bg-amber-50 border border-amber-200">
                                        ⚠ Revision
                                      </span>
                                      <div className="text-[11px] font-black text-amber-950 mt-1">
                                        {sub.gradePoints ?? 0} / {project.leaderboardPoints} pts
                                      </div>
                                    </div>
                                  )}
                                  {sub.status === "pending" && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200">
                                      • Awaiting Review
                                    </span>
                                  )}
                                </td>

                                {/* Mentor Feedback */}
                                <td className="py-3 px-3.5">
                                  {isReviewed ? (
                                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                                      <p className="text-xs font-semibold italic text-slate-800 leading-snug">
                                        "{sub.mentorFeedback || (sub.status === "passed" ? "Deliverable approved and meets all benchmark requirements." : "Needs revisions before full points can be awarded.")}"
                                      </p>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-slate-400 italic">No feedback recorded yet</span>
                                  )}
                                </td>

                                {/* Action */}
                                <td className="py-3 px-3 text-right whitespace-nowrap">
                                  <div className="inline-flex items-center gap-1.5 justify-end">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedSubmissionForReview(sub);
                                        setAutoTriggerAIForReview(true);
                                      }}
                                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 text-purple-700 border border-purple-200 shadow-2xs cursor-pointer flex items-center gap-1"
                                      title="Run AI Benchmark Audit directly on this submission"
                                    >
                                      <Sparkles className="w-3 h-3 text-purple-600" />
                                      <span>AI Review</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedSubmissionForReview(sub);
                                        setAutoTriggerAIForReview(false);
                                      }}
                                      className={`px-3 py-1 rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer ${
                                        sub.status === "pending"
                                          ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                                          : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                                      }`}
                                    >
                                      {sub.status === "pending" ? "Grade Now" : "Edit Review"}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  /* ========================================================
                     SIDE-BY-SIDE COMPACT CARDS VIEW
                     ======================================================== */
                  <div className="space-y-3">
                    {filteredSubmissions.map((sub) => {
                      const onTime = isSubmissionOnTime(sub);
                      const candidate = cohortStudents.find((s) => s.id === sub.studentId);
                      const isReviewed = sub.status !== "pending" || !!sub.mentorFeedback;

                      return (
                        <div
                          key={sub.id}
                          className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-xs transition space-y-2.5"
                        >
                          {/* Top Row: Intern Info, Deliverables, Status & Review Button */}
                          <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
                            {/* Candidate Meta & Deliverables */}
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <input
                                type="checkbox"
                                aria-label={`Select ${sub.studentName}`}
                                checked={selectedSubIds.has(sub.id)}
                                onChange={() => handleToggleSelectSubmission(sub.id)}
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer w-4 h-4 mr-0.5 shrink-0"
                              />
                              <img
                                src={candidate?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(sub.studentName)}`}
                                alt={sub.studentName}
                                className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 shrink-0 shadow-2xs"
                              />
                              <div>
                                <div className="text-xs font-black text-slate-900 flex items-center gap-2">
                                  <span>{sub.studentName}</span>
                                  {onTime ? (
                                    <span className="px-1.5 py-0.2 rounded-md text-[9.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-0.5">
                                      <CheckCircle2 className="w-2.5 h-2.5" />
                                      <span>On-Time</span>
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.2 rounded-md text-[9.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-0.5">
                                      <Clock className="w-2.5 h-2.5" />
                                      <span>Late</span>
                                    </span>
                                  )}
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    • {new Date(sub.submittedAt).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                              </div>

                              {/* Deliverable Assets Links Inline */}
                              <div className="flex items-center gap-1.5 ml-1 flex-wrap">
                                {sub.githubRepoUrl && (
                                  <a
                                    href={sub.githubRepoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 text-[10px] font-bold transition"
                                  >
                                    <Github className="w-3 h-3 text-slate-600" />
                                    <span>GitHub</span>
                                    <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                                  </a>
                                )}

                                {sub.liveDemoUrl && (
                                  <a
                                    href={sub.liveDemoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 hover:bg-indigo-50 text-indigo-700 hover:text-indigo-800 border border-slate-200 text-[10px] font-bold transition"
                                  >
                                    <Globe className="w-3 h-3 text-indigo-500" />
                                    <span>Live Demo</span>
                                    <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                                  </a>
                                )}

                                {sub.fileName && (
                                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-semibold">
                                    <FileArchive className="w-3 h-3 text-emerald-600" />
                                    <span className="truncate max-w-[140px]">{sub.fileName}</span>
                                    <span className="text-[9px] text-slate-400">({sub.fileSize || "Zip"})</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Status & Review Button */}
                            <div className="flex items-center gap-2 shrink-0">
                              {sub.status === "passed" && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black text-emerald-800 bg-emerald-50 border border-emerald-200">
                                  ✓ Passed ({sub.gradePoints ?? project.leaderboardPoints} pts)
                                </span>
                              )}
                              {sub.status === "needs_revision" && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black text-amber-800 bg-amber-50 border border-amber-200">
                                  ⚠ Needs Revision ({sub.gradePoints ?? 0} pts)
                                </span>
                              )}
                              {sub.status === "pending" && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200">
                                  • Awaiting Review
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedSubmissionForReview(sub);
                                  setAutoTriggerAIForReview(true);
                                }}
                                className="px-2.5 py-1 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 text-purple-700 border border-purple-200 shadow-2xs flex items-center gap-1 cursor-pointer shrink-0"
                                title="Run AI Benchmark Audit directly on this submission"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                                <span>AI Review</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedSubmissionForReview(sub);
                                  setAutoTriggerAIForReview(false);
                                }}
                                className={`px-3 py-1 rounded-xl text-xs font-black transition shadow-2xs flex items-center gap-1.5 cursor-pointer shrink-0 ${
                                  sub.status === "pending"
                                    ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                                }`}
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>{sub.status === "pending" ? "Review & Grade" : "Edit Review"}</span>
                              </button>
                            </div>
                          </div>

                          {/* SIDE-BY-SIDE PANELS: Intern Solution vs Official Mentor Review */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-0.5">
                            {/* Left Box: Intern Solution Writeup */}
                            <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/90 flex flex-col justify-between">
                              <div>
                                <div className="text-[9.5px] font-black uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                                  <FileText className="w-3 h-3 text-slate-400" />
                                  <span>Intern Solution & Architecture Writeup</span>
                                </div>
                                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                                  {sub.submissionNotes || "No architecture notes provided."}
                                </p>
                              </div>
                            </div>

                            {/* Right Box: Official Mentor Review (High Clarity!) */}
                            {isReviewed ? (
                              <div
                                className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                                  sub.status === "passed"
                                    ? "bg-emerald-50/70 border-emerald-300 text-emerald-950"
                                    : "bg-amber-50/70 border-amber-300 text-amber-950"
                                }`}
                              >
                                <div>
                                  <div className="text-[9.5px] font-black uppercase tracking-wider flex items-center justify-between mb-1 pb-1 border-b border-black/5">
                                    <span className="flex items-center gap-1">
                                      <Award className={`w-3.5 h-3.5 ${sub.status === "passed" ? "text-emerald-600" : "text-amber-600"}`} />
                                      <span>Official Mentor Review & Evaluation</span>
                                    </span>
                                    <span className="font-black text-[11px]">
                                      Awarded: {sub.gradePoints ?? project.leaderboardPoints} / {project.leaderboardPoints} pts
                                    </span>
                                  </div>
                                  <p className="text-xs font-semibold leading-relaxed italic text-slate-800">
                                    "{sub.mentorFeedback || (sub.status === "passed" ? "Deliverable approved and meets all benchmark requirements." : "Needs revisions before full points can be awarded.")}"
                                  </p>
                                </div>
                                <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium pt-1 mt-1 border-t border-black/5">
                                  <span className="flex items-center gap-1 text-emerald-700 font-bold">
                                    <CheckCircle2 className="w-3 h-3" /> Recorded in Candidate Report
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedSubmissionForReview(sub);
                                      setAutoTriggerAIForReview(false);
                                    }}
                                    className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                                  >
                                    Edit Review →
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="p-2.5 bg-indigo-50/40 rounded-xl border border-dashed border-indigo-200 flex items-center justify-between gap-2.5 text-xs text-indigo-900">
                                <div className="flex items-center gap-2">
                                  <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                                  <div>
                                    <div className="font-bold text-indigo-950 text-xs">Awaiting Mentor Evaluation</div>
                                    <div className="text-[10px] text-slate-500 font-normal">
                                      Not reviewed yet. Evaluate deliverables and assign points.
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedSubmissionForReview(sub);
                                      setAutoTriggerAIForReview(true);
                                    }}
                                    className="px-2.5 py-1 rounded-lg text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 shadow-2xs cursor-pointer flex items-center gap-1"
                                    title="Auto-evaluate against benchmark"
                                  >
                                    <Sparkles className="w-3 h-3 text-purple-600" />
                                    <span>AI Audit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedSubmissionForReview(sub);
                                      setAutoTriggerAIForReview(false);
                                    }}
                                    className="px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-2xs cursor-pointer"
                                  >
                                    Grade Now →
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: NOT SUBMITTED INTERNS */}
            {activeTab === "not_submitted" && (
              <div className="space-y-4">
                <div className="p-5 rounded-3xl bg-rose-50/60 border border-rose-200 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-rose-900">
                      Pending Deliverables Summary
                    </h4>
                    <p className="text-xs text-rose-700 font-medium mt-0.5">
                      The following <strong>{notSubmittedCount} interns</strong> have not submitted their code or URLs for this assignment.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const allIds = new Set(notSubmittedStudents.map((s) => s.id));
                      setRemindedStudentIds(allIds);
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 transition shadow-xs cursor-pointer shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Remind All Pending</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {notSubmittedStudents.map((student) => {
                    const isReminded = remindedStudentIds.has(student.id);

                    return (
                      <div
                        key={student.id}
                        className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 truncate">
                          <img
                            src={student.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(student.name)}`}
                            alt={student.name}
                            className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 shrink-0"
                          />
                          <div className="truncate">
                            <div className="text-xs font-black text-slate-900 truncate">
                              {student.name}
                            </div>
                            <div className="text-[11px] text-slate-400 font-medium truncate">
                              {student.college || student.batchName}
                            </div>
                            <span className="inline-block mt-1 px-2 py-0.2 rounded text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              Missing Submission
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSendReminder(student.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                            isReminded
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 font-black"
                              : "bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200"
                          }`}
                        >
                          {isReminded ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Reminder Sent!</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3 h-3 text-slate-500" />
                              <span>Remind</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: BENCHMARK & EVALUATION CRITERIA */}
            {activeTab === "benchmark" && (
              <div className="space-y-4">
                {/* AI Benchmark Verification Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-sm flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-purple-200">
                        Bulk AI Scenario Benchmark Audit
                      </h4>
                      <p className="text-xs text-slate-300 font-medium">
                        Automatically evaluate candidate solution architecture notes against this confidential gold standard in bulk.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => openBulkAuditModal(pendingCount > 0 ? "pending" : "all")}
                    className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white shadow-md flex items-center gap-2 cursor-pointer shrink-0 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Run Bulk AI Audit ({pendingCount > 0 ? `${pendingCount} Pending` : `All ${submittedCount}`})</span>
                  </button>
                </div>

                <div className="p-5 rounded-3xl bg-amber-50/70 border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-4 h-4 text-amber-700" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-900">
                      Our Confidential Scenario & Observation Benchmark (Admin/Mentor Only)
                    </h4>
                  </div>
                  <p className="text-xs text-amber-800 font-medium mb-3">
                    This scenario is strictly confidential and hidden from candidates. Use it as the gold standard when evaluating submitted code, architecture notes, and unit tests:
                  </p>
                  <div className="p-4 bg-white rounded-2xl border border-amber-200 text-xs font-mono font-medium text-slate-800 leading-relaxed whitespace-pre-line shadow-2xs">
                    {project.mentorObservationBenchmark || "No benchmark scenario defined."}
                  </div>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-2">
                    Public Detailed Instructions Provided to Candidates:
                  </h4>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-mono text-slate-700 leading-relaxed whitespace-pre-line">
                    {project.detailedInstructions}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* FOOTER */}
        <footer className="bg-white border-t border-slate-200 px-6 sm:px-10 py-3.5 shrink-0">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="text-xs text-slate-500 font-medium">
              Showing <strong>{projectSubmissions.length}</strong> submissions out of <strong>{totalAssigned}</strong> enrolled interns.
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-2xs cursor-pointer"
            >
              Close / Return
            </button>
          </div>
        </footer>
      </motion.div>

      {/* BULK AI AUTO-REVIEW STUDIO MODAL */}
      {isBulkAuditModalOpen && (
        <div className="fixed inset-0 z-[120] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="bg-[#f8fafc] rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
          >
            {/* Modal Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                      Bulk AI Benchmark Review & Auto-Grading Studio
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-50 text-purple-700 border border-purple-200">
                      Dual AI Engine
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-tight mt-0.5">
                    Batch-auditing against: <span className="font-bold text-slate-700">{project.title}</span> • Max {project.leaderboardPoints} pts
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isBulkRunning) {
                    setIsBulkAuditModalOpen(false);
                  }
                }}
                disabled={isBulkRunning}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Scope Pill Selectors */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Target Submissions:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={isBulkRunning}
                    onClick={() => {
                      setBulkTargetMode("pending");
                      setBulkEvaluatedResults([]);
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer border ${
                      bulkTargetMode === "pending"
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Pending Review Only ({pendingCount})
                  </button>
                  <button
                    type="button"
                    disabled={isBulkRunning}
                    onClick={() => {
                      setBulkTargetMode("all");
                      setBulkEvaluatedResults([]);
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer border ${
                      bulkTargetMode === "all"
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    All Submissions ({projectSubmissions.length})
                  </button>
                  {selectedSubIds.size > 0 && (
                    <button
                      type="button"
                      disabled={isBulkRunning}
                      onClick={() => {
                        setBulkTargetMode("selected");
                        setBulkEvaluatedResults([]);
                      }}
                      className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer border ${
                        bulkTargetMode === "selected"
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      Selected Only ({selectedSubIds.size})
                    </button>
                  )}
                </div>
              </div>

              {/* Status summary pill */}
              <div className="text-xs text-slate-600 font-semibold">
                {bulkEvaluatedResults.length > 0 ? (
                  <span className="text-emerald-700 font-bold">
                    ✓ {bulkEvaluatedResults.length} Submissions Audited
                  </span>
                ) : (
                  <span>{getTargetSubmissionsForBulk().length} candidate(s) ready</span>
                )}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {/* Confidential Scenario Benchmark Box Preview */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/90 text-xs">
                <div className="flex items-center gap-1.5 text-amber-900 font-black uppercase text-[10px] tracking-wider mb-1">
                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                  <span>Gold Standard Scenario Benchmark Being Tested:</span>
                </div>
                <p className="text-slate-800 font-mono text-[11px] line-clamp-2 leading-relaxed">
                  {project.mentorObservationBenchmark || "Standard rubric criteria & architectural best practices."}
                </p>
              </div>

              {/* LIVE PROGRESS BAR (When Running) */}
              {isBulkRunning && (
                <div className="p-5 rounded-2xl bg-indigo-50/80 border border-indigo-200 shadow-sm space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
                      <span className="font-black text-indigo-950">
                        Auditing candidate {bulkProgress.current} of {bulkProgress.total}:
                      </span>
                      <span className="font-bold text-indigo-700">{bulkProgress.currentStudent}</span>
                    </div>
                    <span className="font-black text-indigo-900">
                      {Math.round((bulkProgress.current / Math.max(1, bulkProgress.total)) * 100)}%
                    </span>
                  </div>

                  {/* Visual progress track */}
                  <div className="w-full h-2.5 bg-indigo-200/60 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(bulkProgress.current / Math.max(1, bulkProgress.total)) * 100}%`,
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>

                  <p className="text-[11px] text-indigo-700 font-medium">
                    {bulkProgress.stepText}
                  </p>
                </div>
              )}

              {/* STATE 1: NOT YET RUN (Target candidates preview & Start Button) */}
              {!isBulkRunning && bulkEvaluatedResults.length === 0 && (
                <div className="space-y-4">
                  <div className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    Candidates Queued for Evaluation ({getTargetSubmissionsForBulk().length}):
                  </div>

                  <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                    {getTargetSubmissionsForBulk().map((sub) => {
                      const candidate = cohortStudents.find((s) => s.id === sub.studentId);
                      return (
                        <div
                          key={sub.id}
                          className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={candidate?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(sub.studentName)}`}
                              alt={sub.studentName}
                              className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="text-xs font-black text-slate-900 truncate">
                                {sub.studentName}
                              </div>
                              <div className="text-[10px] text-slate-500 line-clamp-1">
                                {sub.submissionNotes || "No notes provided"}
                              </div>
                            </div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black shrink-0 ${
                              sub.status === "passed"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : sub.status === "needs_revision"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                            }`}
                          >
                            {sub.status.replace("_", " ")}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {getTargetSubmissionsForBulk().length === 0 ? (
                    <div className="p-8 text-center text-xs font-semibold text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                      No submissions in this target group. Try switching to "All Submissions".
                    </div>
                  ) : (
                    <div className="pt-2 text-center">
                      <button
                        type="button"
                        onClick={runBulkAIAudit}
                        className="px-6 py-3 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 mx-auto cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Run Bulk AI Audit on {getTargetSubmissionsForBulk().length} Candidates</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* STATE 2: AUDIT RESULTS MATRIX (Live or Finished) */}
              {bulkEvaluatedResults.length > 0 && (
                <div className="space-y-4">
                  {/* Results metrics header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                    <div className="flex items-center gap-2 text-xs font-black text-slate-800">
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      <span>AI Audit Findings ({bulkEvaluatedResults.length} Submissions)</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px]">
                        ✓ {bulkEvaluatedResults.filter((r) => r.editedStatus === "passed").length} Passed
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px]">
                        ⚠ {bulkEvaluatedResults.filter((r) => r.editedStatus === "needs_revision").length} Needs Revision
                      </span>
                      {!isBulkRunning && (
                        <button
                          type="button"
                          onClick={runBulkAIAudit}
                          className="px-2.5 py-0.5 rounded-lg text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center gap-1 cursor-pointer ml-1"
                          title="Re-run evaluation"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Re-Run</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* List of Evaluated Items with inline controls */}
                  <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                    {bulkEvaluatedResults.map((item, idx) => {
                      const candidate = cohortStudents.find((s) => s.id === item.submission.studentId);
                      return (
                        <div
                          key={item.submission.id}
                          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3"
                        >
                          {/* Row 1: Candidate, AI Alignment & Status Toggles */}
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={candidate?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(item.submission.studentName)}`}
                                alt={item.submission.studentName}
                                className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 shrink-0"
                              />
                              <div>
                                <div className="text-xs font-black text-slate-900 leading-tight">
                                  {item.submission.studentName}
                                </div>
                                <div className="text-[10px] text-slate-400 font-medium">
                                  {candidate?.college || "Enrolled Intern"}
                                </div>
                              </div>
                            </div>

                            {/* AI Alignment Score & Status Button Toggles */}
                            <div className="flex items-center gap-2">
                              {/* Alignment Badge */}
                              <div
                                className={`px-2.5 py-1 rounded-xl text-xs font-black border flex items-center gap-1 ${
                                  item.aiResult.alignmentScore >= 80
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                    : "bg-amber-50 text-amber-800 border-amber-200"
                                }`}
                              >
                                <span>{item.aiResult.alignmentScore}% Match</span>
                              </div>

                              {/* Status Select Buttons */}
                              <div className="flex items-center rounded-xl bg-slate-100 p-0.5 border border-slate-200 text-xs font-bold">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateEvaluatedItem(idx, { editedStatus: "passed" })
                                  }
                                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                                    item.editedStatus === "passed"
                                      ? "bg-emerald-600 text-white font-black shadow-2xs"
                                      : "text-slate-600 hover:text-slate-900"
                                  }`}
                                >
                                  ✓ Passed
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateEvaluatedItem(idx, { editedStatus: "needs_revision" })
                                  }
                                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                                    item.editedStatus === "needs_revision"
                                      ? "bg-amber-600 text-white font-black shadow-2xs"
                                      : "text-slate-600 hover:text-slate-900"
                                  }`}
                                >
                                  ⚠ Revision
                                </button>
                              </div>

                              {/* Points input */}
                              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded-xl text-xs">
                                <span className="text-[10px] font-bold text-slate-500">Pts:</span>
                                <input
                                  type="number"
                                  min={0}
                                  max={project.leaderboardPoints}
                                  value={item.editedPoints}
                                  onChange={(e) =>
                                    updateEvaluatedItem(idx, {
                                      editedPoints: Math.max(0, parseInt(e.target.value) || 0),
                                    })
                                  }
                                  className="w-14 text-center font-black text-slate-900 bg-white border border-slate-200 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                <span className="text-[10px] text-slate-400 font-bold">
                                  / {project.leaderboardPoints}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Row 2: Key Matches Tags & Sync Summary */}
                          {item.aiResult.keyMatches && item.aiResult.keyMatches.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                Verified:
                              </span>
                              {item.aiResult.keyMatches.map((m, mIdx) => (
                                <span
                                  key={mIdx}
                                  className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
                                >
                                  ✓ {m}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Row 3: Editable Mentor Feedback */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                              Generated Mentor Feedback (Visible to Candidate):
                            </label>
                            <textarea
                              rows={2}
                              value={item.editedFeedback}
                              onChange={(e) =>
                                updateEvaluatedItem(idx, { editedFeedback: e.target.value })
                              }
                              className="w-full text-xs font-medium text-slate-800 bg-slate-50/70 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white resize-none"
                              placeholder="Mentor feedback notes..."
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Sticky Footer */}
            <div className="bg-white border-t border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsBulkAuditModalOpen(false)}
                disabled={isBulkRunning}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer disabled:opacity-50"
              >
                Cancel / Close
              </button>

              {bulkEvaluatedResults.length > 0 && !isBulkRunning && (
                <button
                  type="button"
                  onClick={applyAndSaveBulkEvaluations}
                  className="px-6 py-2.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>
                    Apply & Save All {bulkEvaluatedResults.length} Reviews (Instant Sync)
                  </span>
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* INDIVIDUAL SUBMISSION REVIEW DIALOG */}
      {selectedSubmissionForReview && (
        <ProjectReviewModal
          isOpen={!!selectedSubmissionForReview}
          onClose={() => {
            setSelectedSubmissionForReview(null);
            setAutoTriggerAIForReview(false);
          }}
          project={project}
          submission={selectedSubmissionForReview}
          autoTriggerAI={autoTriggerAIForReview}
          onSaveReview={(updated) => {
            onSaveReview(updated);
            setSelectedSubmissionForReview(null);
            setAutoTriggerAIForReview(false);
          }}
        />
      )}
    </AnimatePresence>,
    document.body
  );
};
