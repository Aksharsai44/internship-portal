import React, { useState, useMemo, useEffect } from "react";
import { DailyActivityLog, Batch, Student } from "../types";
import { analyzeDailyLogWithAI } from "../data/aiReviewEngine";
import {
  FileText,
  Search,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Clock,
  Star,
  Users,
  Calendar,
  Filter,
  Check,
  Edit3,
  X,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import confetti from "canvas-confetti";

interface AdminDailyLogsReviewViewProps {
  activityLogs: DailyActivityLog[];
  batches: Batch[];
  students: Student[];
  onUpdateActivityLogs: (logs: DailyActivityLog[]) => void;
  onToast?: (msg: string) => void;
  selectedBatch?: Batch;
}

export const AdminDailyLogsReviewView: React.FC<AdminDailyLogsReviewViewProps> = ({
  activityLogs,
  batches,
  students,
  onUpdateActivityLogs,
  onToast,
  selectedBatch: selectedBatchProp,
}) => {
  // Timeframe filter: "day" | "week" | "month" | "all"
  const [timeframe, setTimeframe] = useState<"day" | "week" | "month" | "all">("all");
  const [selectedIntern, setSelectedIntern] = useState("All Interns");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Review Modal State
  const [reviewingLog, setReviewingLog] = useState<DailyActivityLog | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewStatus, setReviewStatus] = useState<"approved" | "needs_revision" | "reviewed">("approved");
  const [reviewFeedback, setReviewFeedback] = useState("");

  // Active opened batch
  const activeBatch = selectedBatchProp;
  const activeBatchName = activeBatch?.name || "";

  // Helper function to check if a log belongs to the active batch
  const isLogInActiveBatch = (log: DailyActivityLog) => {
    // If no specific batch is opened or cohort name is empty/all, show all
    if (!activeBatch || !activeBatchName || activeBatchName === "All Batches" || activeBatch.id === "all") {
      return true;
    }

    // 1. Direct name match or substring match
    if (
      log.batchName &&
      (log.batchName.toLowerCase().trim() === activeBatchName.toLowerCase().trim() ||
        log.batchName.toLowerCase().includes(activeBatchName.toLowerCase()) ||
        activeBatchName.toLowerCase().includes(log.batchName.toLowerCase()))
    ) {
      return true;
    }

    // 2. Direct batch ID match
    if (log.batchId && (log.batchId === activeBatch.id || log.batchId === activeBatch.name)) {
      return true;
    }

    // 3. Check if student enrolled in this active batch
    const student = students.find(
      (s) =>
        (log.internId && s.id === log.internId) ||
        (log.internName && s.name.toLowerCase().trim() === log.internName.toLowerCase().trim())
    );
    if (student) {
      if (
        student.batchId === activeBatch.id ||
        (student.batchName &&
          (student.batchName.toLowerCase().includes(activeBatch.name.toLowerCase()) ||
            activeBatch.name.toLowerCase().includes(student.batchName.toLowerCase())))
      ) {
        return true;
      }
    }

    return false;
  };

  // Intern Options scoped to the active opened batch
  const internOptions = useMemo(() => {
    const names = new Set<string>();

    if (!activeBatch || !activeBatchName || activeBatchName === "All Batches") {
      students.forEach((s) => {
        if (s.name) names.add(s.name);
      });
      activityLogs.forEach((l) => {
        if (l.internName) names.add(l.internName);
      });
    } else {
      students.forEach((s) => {
        if (
          s.batchId === activeBatch.id ||
          (s.batchName &&
            (s.batchName.toLowerCase().includes(activeBatch.name.toLowerCase()) ||
              activeBatch.name.toLowerCase().includes(s.batchName.toLowerCase())))
        ) {
          if (s.name) names.add(s.name);
        }
      });

      activityLogs.forEach((l) => {
        if (isLogInActiveBatch(l)) {
          if (l.internName) names.add(l.internName);
        }
      });
    }

    return ["All Interns", ...Array.from(names)];
  }, [students, activityLogs, activeBatch, activeBatchName]);

  // Reset intern selection if not in new options
  useEffect(() => {
    if (selectedIntern !== "All Interns" && !internOptions.includes(selectedIntern)) {
      setSelectedIntern("All Interns");
    }
  }, [internOptions, selectedIntern]);

  // Filtered Logs scoped to the opened batch
  const filteredLogs = useMemo(() => {
    const now = new Date();

    return activityLogs.filter((log) => {
      // 1. Timeframe check
      if (timeframe !== "all") {
        const logDate = new Date(log.createdAt || log.date);
        const diffDays = (now.getTime() - logDate.getTime()) / (1000 * 3600 * 24);
        if (timeframe === "day" && diffDays > 1.5) return false;
        if (timeframe === "week" && diffDays > 7.5) return false;
        if (timeframe === "month" && diffDays > 31.0) return false;
      }

      // 2. Opened Batch check
      if (!isLogInActiveBatch(log)) {
        return false;
      }

      // 3. Intern check
      if (selectedIntern !== "All Interns") {
        if (log.internName !== selectedIntern) return false;
      }

      // 4. Status check
      if (statusFilter !== "all") {
        if (statusFilter === "pending" && log.status && log.status !== "pending") return false;
        if (statusFilter === "approved" && log.status !== "approved") return false;
        if (statusFilter === "needs_revision" && log.status !== "needs_revision") return false;
        if (statusFilter === "has_blockers" && !log.hasBlockers) return false;
      }

      // 5. Search check
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          log.internName.toLowerCase().includes(q) ||
          log.description.toLowerCase().includes(q) ||
          log.logType.toLowerCase().includes(q) ||
          (log.batchName || "").toLowerCase().includes(q) ||
          (log.blockerDescription || "").toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [activityLogs, timeframe, activeBatch, activeBatchName, selectedIntern, statusFilter, searchQuery]);

  // Statistics scoped to the opened batch
  const stats = useMemo(() => {
    const batchLogs = activityLogs.filter((l) => isLogInActiveBatch(l));
    const total = batchLogs.length;
    const pending = batchLogs.filter((l) => !l.status || l.status === "pending").length;
    const approved = batchLogs.filter((l) => l.status === "approved").length;
    const blockers = batchLogs.filter((l) => l.hasBlockers).length;
    const aiReviewed = batchLogs.filter((l) => !!l.aiReview).length;
    return { total, pending, approved, blockers, aiReviewed };
  }, [activityLogs, activeBatch, activeBatchName]);

  // Single AI Auto-Review
  const handleRunSingleAIReview = (log: DailyActivityLog) => {
    const aiResult = analyzeDailyLogWithAI(log);
    const updated = activityLogs.map((l) =>
      l.id === log.id
        ? {
            ...l,
            aiReview: aiResult,
            status: (l.status === "approved" ? "approved" : "reviewed") as any,
          }
        : l
    );
    onUpdateActivityLogs(updated);
    if (onToast) onToast(`AI Auto-Review generated for ${log.internName}!`);
  };

  // AI Auto-Review All Pending Logs
  const handleAIAutoReviewAllPending = () => {
    const pendingInFilter = filteredLogs.filter((l) => !l.aiReview || l.status === "pending");
    if (pendingInFilter.length === 0) {
      if (onToast) onToast("All logs in the current filter are already AI reviewed!");
      return;
    }

    const updated = activityLogs.map((log) => {
      const match = pendingInFilter.find((p) => p.id === log.id);
      if (match) {
        const aiResult = analyzeDailyLogWithAI(log);
        return {
          ...log,
          aiReview: aiResult,
          status: (log.status === "approved" ? "approved" : "reviewed") as any,
        };
      }
      return log;
    });

    onUpdateActivityLogs(updated);
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch {}
    if (onToast) onToast(`Successfully AI Auto-Reviewed ${pendingInFilter.length} intern activity logs!`);
  };

  // Open Manual Review Modal
  const handleOpenReviewModal = (log: DailyActivityLog) => {
    setReviewingLog(log);
    setReviewRating(log.adminRating || 5);
    setReviewStatus(log.status === "needs_revision" ? "needs_revision" : "approved");
    setReviewFeedback(log.adminFeedback || "");
  };

  // Save Manual Review
  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingLog) return;

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " - " + new Date().toLocaleDateString();

    const updated = activityLogs.map((l) =>
      l.id === reviewingLog.id
        ? {
            ...l,
            status: reviewStatus,
            adminRating: reviewRating,
            adminFeedback: reviewFeedback.trim(),
            adminReviewedAt: nowStr,
            adminReviewerName: "Cohort Lead Admin",
          }
        : l
    );

    onUpdateActivityLogs(updated);
    setReviewingLog(null);
    if (onToast) onToast(`Feedback & rating saved for ${reviewingLog.internName}!`);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* ── HEADER BANNER ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 tracking-tight flex items-center gap-3">
              <span>Intern Daily Logs & AI Reviews</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                Admin Portal
              </span>
            </h2>
            {activeBatchName && activeBatchName !== "All Batches" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
                Opened Cohort: {activeBatchName}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Review day, week, and monthly submissions across cohort batches with automated AI grading and feedback.
          </p>
        </div>

        {/* Master AI Auto-Review Button */}
        <button
          onClick={handleAIAutoReviewAllPending}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-bold transition shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>AI Auto-Review All Pending</span>
        </button>
      </div>

      {/* ── KPI METRICS RIBBON ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Logs</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">{stats.total}</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-2xs">
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">Pending Review</span>
          <span className="text-xl font-black text-amber-700 mt-1 block">{stats.pending}</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Approved</span>
          <span className="text-xl font-black text-emerald-700 mt-1 block">{stats.approved}</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-rose-200 shadow-2xs">
          <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">Active Blockers</span>
          <span className="text-xl font-black text-rose-700 mt-1 block">{stats.blockers}</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-indigo-200 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">AI Graded</span>
          <span className="text-xl font-black text-indigo-700 mt-1 block">{stats.aiReviewed}</span>
        </div>
      </div>

      {/* ── FILTER & TIMEFRAME CONTROLS ── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 space-y-4">
        {/* Top: Timeframe Selector (Day / Week / Month / All) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setTimeframe("day")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                timeframe === "day"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Today (Day)
            </button>
            <button
              onClick={() => setTimeframe("week")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                timeframe === "week"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              This Week (7 Days)
            </button>
            <button
              onClick={() => setTimeframe("month")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                timeframe === "month"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              This Month (30 Days)
            </button>
            <button
              onClick={() => setTimeframe("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                timeframe === "all"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Time
            </button>
          </div>

          <div className="text-xs font-bold text-slate-500">
            Showing <span className="text-slate-900 font-black">{filteredLogs.length}</span> logs
          </div>
        </div>

        {/* Bottom: Dropdown Filters & Search */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Intern Selector */}
          <select
            value={selectedIntern}
            onChange={(e) => setSelectedIntern(e.target.value)}
            className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300 transition cursor-pointer"
          >
            {internOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          {/* Review Status Selector */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300 transition cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="needs_revision">Needs Revision</option>
            <option value="has_blockers">Has Active Blockers</option>
          </select>

          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keyword, intern, or task..."
              className="w-full pl-8 pr-3 py-2 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-300 transition"
            />
          </div>
        </div>
      </div>

      {/* ── ACTIVITY CARDS STREAM ── */}
      <div className="space-y-4">
        {filteredLogs.map((log) => {
          const isPending = !log.status || log.status === "pending";
          return (
            <div
              key={log.id}
              className={`p-5 rounded-3xl border bg-white shadow-xs transition space-y-4 ${
                log.hasBlockers
                  ? "border-amber-200 hover:border-amber-300"
                  : isPending
                  ? "border-slate-200 hover:border-indigo-300"
                  : "border-slate-200"
              }`}
            >
              {/* Card Header: Intern Info + Log Type + Status */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-2xs">
                    {log.internName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-black text-slate-900">{log.internName}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200/60 text-indigo-700">
                        {log.batchName || students.find((s) => s.id === log.internId)?.batchName || selectedBatchProp?.name || "General Cohort"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                      <span className="font-semibold text-slate-600">{log.date}</span>
                      <span>•</span>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded text-[10px] uppercase tracking-wider">
                        {log.logType}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Status & Action Buttons */}
                <div className="flex items-center gap-2">
                  {/* Status Badges */}
                  {log.status === "approved" && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Approved
                    </span>
                  )}
                  {log.status === "needs_revision" && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-xl">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                      Needs Revision
                    </span>
                  )}
                  {isPending && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      Pending Review
                    </span>
                  )}

                  {/* AI Auto-Review Button */}
                  <button
                    onClick={() => handleRunSingleAIReview(log)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    title="Generate instant AI assessment and scoring"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{log.aiReview ? "Re-run AI" : "AI Auto-Review"}</span>
                  </button>

                  {/* Manual Review Button */}
                  <button
                    onClick={() => handleOpenReviewModal(log)}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{log.adminFeedback ? "Edit Review" : "Review & Rate"}</span>
                  </button>
                </div>
              </div>

              {/* Card Body: Task Accomplishment Description */}
              <div className="text-xs sm:text-sm text-slate-800 leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-slate-100 font-normal">
                {log.description}
              </div>

              {/* Blocker Alert Banner if present */}
              {log.hasBlockers && log.blockerDescription && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black text-amber-900">Current Blocker Reported:</span>
                    <p className="mt-0.5 text-amber-800 font-medium">{log.blockerDescription}</p>
                  </div>
                </div>
              )}

              {/* ── ADMIN REVIEW DISPLAY ── */}
              {log.adminFeedback && (
                <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 text-xs space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 font-black text-blue-950">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>Admin Review by {log.adminReviewerName || "Cohort Lead"}</span>
                      {log.adminRating && (
                        <span className="inline-flex items-center gap-1 text-amber-500 font-bold ml-1">
                          {Array.from({ length: log.adminRating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                          ))}
                          <span className="text-[11px] text-slate-600">({log.adminRating}/5)</span>
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-medium text-slate-500">{log.adminReviewedAt}</span>
                  </div>
                  <p className="text-slate-800 font-medium italic pl-2 border-l-2 border-blue-400">
                    "{log.adminFeedback}"
                  </p>
                </div>
              )}

              {/* ── AI AUTO-REVIEW ASSESSMENT DISPLAY ── */}
              {log.aiReview && (log.aiReview.summary || typeof log.aiReview.rating === "number") && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-purple-50/40 to-blue-50/70 border border-indigo-200 text-xs space-y-2.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-2xs">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-indigo-950">Antigravity AI Assessment</span>
                        <span className="text-[10px] font-medium text-slate-400 ml-2">{log.aiReview.reviewedAt || ""}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-600 text-white shadow-2xs">
                        {typeof log.aiReview.rating === "number" ? log.aiReview.rating.toFixed(1) : "4.5"} / 5.0 ⭐
                      </span>
                      {log.aiReview.velocityAssessment && (
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            log.aiReview.velocityAssessment === "Outstanding"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : log.aiReview.velocityAssessment === "Blocked"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-blue-100 text-blue-800 border border-blue-200"
                          }`}
                        >
                          {log.aiReview.velocityAssessment}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-normal">
                    {log.aiReview.summary}
                  </p>

                  {log.aiReview.technicalHighlights && log.aiReview.technicalHighlights.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Technical Highlights:
                      </span>
                      <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5 pl-1">
                        {log.aiReview.technicalHighlights.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {log.aiReview.blockerAdvice && (
                    <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900">
                      <strong>AI Blocker Guidance:</strong> {log.aiReview.blockerAdvice}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filteredLogs.length === 0 && (
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-2">
            <p className="text-sm font-bold text-slate-700">
              No daily activity logs found {activeBatchName ? `for cohort "${activeBatchName}"` : ""}.
            </p>
            <p className="text-xs text-slate-400">
              Try adjusting the timeframe filter or clearing your search term.
            </p>
          </div>
        )}
      </div>

      {/* ── MANUAL REVIEW & RATING MODAL ── */}
      {reviewingLog && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Review & Rate Activity</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Intern: <strong>{reviewingLog.internName}</strong> • {reviewingLog.date}
                </p>
              </div>
              <button
                onClick={() => setReviewingLog(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReview} className="space-y-4">
              {/* Star Rating Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Rating (1 to 5 Stars)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="p-1.5 rounded-xl hover:bg-amber-50 transition cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 transition ${
                          star <= reviewRating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-200"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-black text-slate-700 ml-2">
                    {reviewRating} of 5 Stars
                  </span>
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Review Decision</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewStatus("approved")}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer border ${
                      reviewStatus === "approved"
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Approve Log</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewStatus("needs_revision")}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer border ${
                      reviewStatus === "needs_revision"
                        ? "bg-rose-50 border-rose-300 text-rose-800 shadow-2xs"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>Needs Revision</span>
                  </button>
                </div>
              </div>

              {/* Feedback Note Textarea */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Mentor Feedback & Notes
                </label>
                <textarea
                  rows={4}
                  required
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  placeholder="Provide constructive feedback, commend accomplishments, or guide blocker resolution..."
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-300 transition leading-relaxed resize-none"
                />

                {/* Quick Feedback Snippets */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] font-bold text-slate-400">Quick insert:</span>
                  <button
                    type="button"
                    onClick={() =>
                      setReviewFeedback(
                        "Great technical progress and thorough sprint contribution! Clean architecture."
                      )
                    }
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                  >
                    + Great Progress
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setReviewFeedback(
                        "Please add unit test coverage and mention PR links for verification."
                      )
                    }
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                  >
                    + Request Tests
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setReviewFeedback(
                        "Blocker noted. Connecting you with lead architect during today's standup."
                      )
                    }
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                  >
                    + Blocker Help
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReviewingLog(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-xs cursor-pointer"
                >
                  Save & Publish Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
