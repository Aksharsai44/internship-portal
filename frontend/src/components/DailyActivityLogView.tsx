import React, { useState } from "react";
import { Student, DailyActivityLog } from "../types";
import {
  FileText,
  Flame,
  Send,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import confetti from "canvas-confetti";

interface DailyActivityLogViewProps {
  currentStudent: Student;
  activityLogs: DailyActivityLog[];
  onUpdateActivityLogs: (logs: DailyActivityLog[]) => void;
  onToast?: (msg: string) => void;
}

export const DailyActivityLogView: React.FC<DailyActivityLogViewProps> = ({
  currentStudent,
  activityLogs,
  onUpdateActivityLogs,
  onToast,
}) => {
  // Form State
  const [logType, setLogType] = useState<
    "Daily Achievement" | "Weekly Sprint Contribution" | "Monthly Milestone"
  >("Daily Achievement");
  const [description, setDescription] = useState("");
  const [hasBlockers, setHasBlockers] = useState(false);
  const [blockerDescription, setBlockerDescription] = useState("");

  // Edit Modal State
  const [editingLog, setEditingLog] = useState<DailyActivityLog | null>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  const studentLogs = activityLogs.filter(
    (log) => !log.internId || log.internId === currentStudent.id
  );

  const filteredLogs = studentLogs.filter((log) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.description.toLowerCase().includes(q) ||
      log.logType.toLowerCase().includes(q) ||
      log.date.toLowerCase().includes(q)
    );
  });

  const handleSubmitNewLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const now = new Date();
    const formattedDate = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;

    const newEntry: DailyActivityLog = {
      id: `act_${Date.now()}`,
      internId: currentStudent.id,
      internName: currentStudent.name,
      batchId: currentStudent.batchId,
      batchName: currentStudent.batchName,
      logType,
      description: description.trim(),
      date: formattedDate,
      createdAt: now.toISOString(),
      hasBlockers,
      blockerDescription: hasBlockers ? blockerDescription.trim() : undefined,
      status: "pending",
    };

    onUpdateActivityLogs([newEntry, ...activityLogs]);
    setDescription("");
    setHasBlockers(false);
    setBlockerDescription("");

    try {
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
    } catch {}

    if (onToast) onToast("Daily activity logged successfully!");
  };

  const handleDeleteLog = (logId: string) => {
    onUpdateActivityLogs(activityLogs.filter((l) => l.id !== logId));
    if (onToast) onToast("Activity log entry removed.");
  };

  const handleUpdateLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLog || !editingLog.description.trim()) return;

    onUpdateActivityLogs(
      activityLogs.map((l) => (l.id === editingLog.id ? editingLog : l))
    );
    setEditingLog(null);
    if (onToast) onToast("Activity log updated.");
  };

  return (
    <div className="space-y-6 pb-16">
      {/* ── HEADER ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 tracking-tight">
            Daily Activity Log
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Track your accomplishments, blockers, and progress for your cohort mentor.
          </p>
        </div>

        {/* Active Session Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Active Session</span>
        </div>
      </div>

      {/* ── TWO COLUMN LAYOUT: LOG NEW ACTIVITY (LEFT) & RECENT ACTIVITIES (RIGHT) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ══════════════════════════════════════════════════════════ */}
        {/* LEFT CARD: LOG NEW ACTIVITY                                */}
        {/* ══════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-100">
            <Flame className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-black text-slate-900">Log New Activity</h3>
          </div>

          <form onSubmit={handleSubmitNewLog} className="space-y-4">
            {/* Log Type Dropdown (Full Width, Project Tag Removed per user request) */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Log Type</label>
              <select
                value={logType}
                onChange={(e) => setLogType(e.target.value as any)}
                className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-300 transition cursor-pointer"
              >
                <option value="Daily Achievement">Daily Achievement</option>
                <option value="Weekly Sprint Contribution">Weekly Sprint Contribution</option>
                <option value="Monthly Milestone">Monthly Milestone</option>
              </select>
            </div>

            {/* Description Textarea */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                What did you accomplish?
              </label>
              <textarea
                required
                rows={7}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail the technical tasks completed today, files updated, PRs opened, unit tests authored, or architecture milestones reached..."
                className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-300 transition resize-none leading-relaxed"
              />
            </div>

            {/* Current Blockers Toggle Switch Row */}
            <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Current Blockers</span>
                </div>

                {/* Switch Toggle */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasBlockers}
                    onChange={(e) => setHasBlockers(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>

              {hasBlockers && (
                <input
                  type="text"
                  value={blockerDescription}
                  onChange={(e) => setBlockerDescription(e.target.value)}
                  placeholder="Describe your current blocker or mentor assistance required..."
                  className="w-full text-xs font-medium text-slate-800 bg-white border border-amber-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-amber-300 transition animate-in fade-in duration-150"
                />
              )}
            </div>

            {/* Submit Log Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Log</span>
            </button>
          </form>
        </div>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* RIGHT CARD: RECENT ACTIVITIES LIST                         */}
        {/* ══════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-black text-slate-900">Recent Activities</h3>
              <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {studentLogs.length}
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search accomplishments..."
                className="pl-8 pr-3 py-2 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-300 transition w-56 sm:w-72"
              />
            </div>
          </div>

          {/* Activity Cards List */}
          <div className="space-y-3.5">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-200 transition shadow-2xs space-y-3 group"
              >
                {/* Top Row: Pill Tag + Date + Review Status + Edit/Delete */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-black tracking-wider uppercase border border-emerald-200">
                      {log.logType === "Daily Achievement"
                        ? "Daily"
                        : log.logType === "Weekly Sprint Contribution"
                        ? "Sprint"
                        : "Milestone"}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 font-mono">
                      {log.date}
                    </span>

                    {/* Review Status Pill */}
                    {log.status === "approved" && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Approved
                      </span>
                    )}
                    {log.status === "needs_revision" && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                        <AlertCircle className="w-3 h-3 text-rose-600" />
                        Needs Revision
                      </span>
                    )}
                    {(!log.status || log.status === "pending") && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                        <Clock className="w-3 h-3 text-amber-600" />
                        Pending Review
                      </span>
                    )}
                    {log.status === "reviewed" && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3 h-3 text-blue-600" />
                        Reviewed
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition">
                    <button
                      onClick={() => setEditingLog(log)}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                      title="Edit Log"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteLog(log.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Delete Log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Description Text */}
                <p className="text-xs text-slate-700 leading-relaxed font-normal">
                  {log.description}
                </p>

                {/* Blocker Alert if present */}
                {log.hasBlockers && log.blockerDescription && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>
                      <strong>Blocker:</strong> {log.blockerDescription}
                    </span>
                  </div>
                )}

                {/* ── ADMIN REVIEW & FEEDBACK (if reviewed by admin) ── */}
                {log.adminFeedback && (
                  <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs space-y-1.5 animate-in fade-in">
                    <div className="flex items-center justify-between text-blue-900 font-black text-[11px]">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-blue-600" />
                        Cohort Admin Review
                        {log.adminRating && (
                          <span className="inline-flex items-center gap-0.5 text-amber-500 font-bold ml-1">
                            {Array.from({ length: log.adminRating }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-amber-400" />
                            ))}
                            <span className="text-[10px] text-slate-600 ml-0.5">({log.adminRating}/5)</span>
                          </span>
                        )}
                      </span>
                      <span className="text-slate-400 font-normal text-[10px]">
                        {log.adminReviewedAt || ""}
                      </span>
                    </div>
                    <p className="text-slate-800 font-medium italic pl-1 border-l-2 border-blue-400">
                      "{log.adminFeedback}"
                    </p>
                  </div>
                )}

                {/* ── AI AUTO-REVIEW ASSESSMENT (if reviewed by AI) ── */}
                {log.aiReview && (
                  <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-50/90 via-purple-50/50 to-blue-50/70 border border-indigo-200/80 text-xs space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded-md bg-indigo-600 text-white">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-xs font-black text-indigo-950">AI Auto-Review Assessment</span>
                          <span className="text-[10px] font-medium text-slate-400 ml-2">{log.aiReview.reviewedAt}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-600 text-white shadow-2xs">
                          {log.aiReview.rating.toFixed(1)} / 5.0 ⭐
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.aiReview.velocityAssessment === "Outstanding"
                            ? "bg-emerald-100 text-emerald-800"
                            : log.aiReview.velocityAssessment === "Blocked"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-blue-100 text-blue-800"
                        }`}>
                          {log.aiReview.velocityAssessment}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-normal">
                      {log.aiReview.summary}
                    </p>

                    {log.aiReview.technicalHighlights && log.aiReview.technicalHighlights.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Technical Highlights:</span>
                        <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5 pl-1">
                          {log.aiReview.technicalHighlights.map((highlight, idx) => (
                            <li key={idx}>{highlight}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {log.aiReview.blockerAdvice && (
                      <div className="p-2.5 rounded-lg bg-amber-50/90 border border-amber-200 text-[11px] text-amber-900">
                        <strong>AI Blocker Guidance:</strong> {log.aiReview.blockerAdvice}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {filteredLogs.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs">
                No activity entries found matching your query.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── EDIT LOG MODAL (Project Tag removed) ── */}
      {editingLog && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Edit Activity Log</h3>
              <button
                onClick={() => setEditingLog(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateLog} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Log Type</label>
                <select
                  value={editingLog.logType}
                  onChange={(e) =>
                    setEditingLog({ ...editingLog, logType: e.target.value as any })
                  }
                  className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
                >
                  <option value="Daily Achievement">Daily Achievement</option>
                  <option value="Weekly Sprint Contribution">Weekly Sprint Contribution</option>
                  <option value="Monthly Milestone">Monthly Milestone</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={5}
                  value={editingLog.description}
                  onChange={(e) => setEditingLog({ ...editingLog, description: e.target.value })}
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-300 resize-none leading-relaxed"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingLog(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
