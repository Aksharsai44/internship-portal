import React, { useState, useMemo } from "react";
import { Batch, Student, ClientUser, InterviewRequest } from "../types";
import {
  Calendar,
  CalendarCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
  ChevronDown,
  Video,
  Phone,
  MapPin,
  ExternalLink,
  Plus,
  Building2,
  User,
  AlertCircle,
  Send,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";

interface InterviewRequestsViewProps {
  userRole: "admin" | "client";
  clientUser?: ClientUser;
  clients: ClientUser[];
  interviewRequests: InterviewRequest[];
  students: Student[];
  batches: Batch[];
  onUpdateRequests: (requests: InterviewRequest[]) => void;
}

export function InterviewRequestsView({
  userRole,
  clientUser,
  clients,
  interviewRequests,
  students,
  batches,
  onUpdateRequests,
}: InterviewRequestsViewProps) {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterBatch, setFilterBatch] = useState<string>("all");
  const [scheduleModal, setScheduleModal] = useState<InterviewRequest | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleLink, setScheduleLink] = useState("");
  const [scheduleType, setScheduleType] = useState<"virtual" | "in_person" | "phone">("virtual");
  const [adminNote, setAdminNote] = useState("");

  const filteredRequests = useMemo(() => {
    let list = [...interviewRequests];

    if (userRole === "client" && clientUser) {
      list = list.filter((r) => r.clientId === clientUser.id);
    }

    if (filterStatus !== "all") {
      list = list.filter((r) => r.status === filterStatus);
    }

    if (filterBatch !== "all") {
      list = list.filter((r) => r.batchId === filterBatch);
    }

    return list.sort((a, b) => {
      const order = { pending: 0, approved: 1, scheduled: 2, completed: 3, rejected: 4 };
      return (order[a.status] || 5) - (order[b.status] || 5);
    });
  }, [interviewRequests, userRole, clientUser, filterStatus, filterBatch]);

  const statusCounts = useMemo(() => {
    const base = userRole === "client" && clientUser
      ? interviewRequests.filter((r) => r.clientId === clientUser.id)
      : interviewRequests;
    return {
      all: base.length,
      pending: base.filter((r) => r.status === "pending").length,
      approved: base.filter((r) => r.status === "approved").length,
      scheduled: base.filter((r) => r.status === "scheduled").length,
      completed: base.filter((r) => r.status === "completed").length,
      rejected: base.filter((r) => r.status === "rejected").length,
    };
  }, [interviewRequests, userRole, clientUser]);

  const handleAction = async (requestId: string, action: "approve" | "reject" | "complete") => {
    try {
      const res = await axios.post(`/api/interview-requests/${requestId}/${action}/`, { adminNotes: adminNote });
      if (res.data) {
        onUpdateRequests(
          interviewRequests.map((r) => (r.id === requestId ? { ...r, ...res.data, clientId: res.data.clientId || res.data.client, internId: res.data.internId || res.data.intern, batchId: res.data.batchId || res.data.batch } : r))
        );
      }
    } catch (err) {
      console.error(`Failed to ${action} interview:`, err);
    }
    setAdminNote("");
  };

  const handleSchedule = async () => {
    if (!scheduleModal) return;
    try {
      const res = await axios.post(`/api/interview-requests/${scheduleModal.id}/schedule/`, {
        scheduledDate: scheduleDate,
        meetingLink: scheduleLink,
        interviewType: scheduleType,
        adminNotes: adminNote,
      });
      if (res.data) {
        onUpdateRequests(
          interviewRequests.map((r) => (r.id === scheduleModal.id ? { ...r, ...res.data, clientId: res.data.clientId || res.data.client, internId: res.data.internId || res.data.intern, batchId: res.data.batchId || res.data.batch } : r))
        );
      }
    } catch (err) {
      console.error("Failed to schedule interview:", err);
    }
    setScheduleModal(null);
    setScheduleDate("");
    setScheduleLink("");
    setAdminNote("");
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending": return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: Clock, dot: "bg-amber-400" };
      case "approved": return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: CheckCircle2, dot: "bg-emerald-400" };
      case "scheduled": return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: CalendarCheck, dot: "bg-blue-400" };
      case "completed": return { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", icon: CheckCircle2, dot: "bg-slate-400" };
      case "rejected": return { bg: "bg-red-50", text: "text-red-600", border: "border-red-200", icon: XCircle, dot: "bg-red-400" };
      default: return { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", icon: AlertCircle, dot: "bg-slate-400" };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "virtual": return <Video className="w-3.5 h-3.5" />;
      case "phone": return <Phone className="w-3.5 h-3.5" />;
      case "in_person": return <MapPin className="w-3.5 h-3.5" />;
      default: return <Video className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-violet-500" />
          Interview Requests
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {userRole === "admin" ? "Manage all interview requests from clients" : "Track your interview requests"}
        </p>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {["all", "pending", "approved", "scheduled", "completed", "rejected"].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterStatus === s
                ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span className="capitalize">{s}</span>
            <span className="ml-1.5 opacity-70">({statusCounts[s as keyof typeof statusCounts] || 0})</span>
          </button>
        ))}
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
          <Calendar className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-black text-slate-500">No interview requests</h3>
          <p className="text-sm text-slate-400 mt-1">
            {userRole === "client" ? "Browse the leaderboard to request interviews with interns" : "No requests from clients yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((req, i) => {
            const config = getStatusConfig(req.status);
            const StatusIcon = config.icon;
            const intern = students.find((s) => s.id === req.internId);
            const client = clients.find((c) => c.id === req.clientId);
            const batch = batches.find((b) => b.id === req.batchId);

            return (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`bg-white rounded-2xl border ${config.border} p-5 transition-all hover:shadow-md`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Status Badge */}
                  <div className={`px-3 py-1.5 rounded-xl ${config.bg} ${config.text} text-xs font-black capitalize flex items-center gap-1.5 flex-shrink-0`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {req.status}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {userRole === "admin" && (
                        <span className="flex items-center gap-1 text-xs font-bold text-slate-700">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {req.clientName || client?.companyName || "Client"}
                        </span>
                      )}
                      <span className="text-slate-300">→</span>
                      <span className="flex items-center gap-1 text-xs font-bold text-slate-700">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {req.internName || intern?.name || "Intern"}
                      </span>
                      {batch && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold">{batch.name}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        {getTypeIcon(req.interviewType)}
                        <span className="capitalize">{req.interviewType}</span>
                      </span>
                      {req.scheduledDate && (
                        <span className="flex items-center gap-1">
                          <CalendarCheck className="w-3 h-3" />
                          {new Date(req.scheduledDate).toLocaleDateString()}
                        </span>
                      )}
                      {req.createdAt && (
                        <span>Requested {new Date(req.createdAt).toLocaleDateString()}</span>
                      )}
                    </div>

                    {req.notes && (
                      <p className="text-xs text-slate-500 mt-1 italic">"{req.notes}"</p>
                    )}
                    {req.adminNotes && userRole === "client" && (
                      <p className="text-xs text-teal-600 mt-1 font-medium">Admin: {req.adminNotes}</p>
                    )}
                  </div>

                  {/* Actions */}
                  {userRole === "admin" && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {req.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleAction(req.id, "approve")}
                            className="px-3 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(req.id, "reject")}
                            className="px-3 py-2 bg-red-50 text-red-500 rounded-xl text-xs font-bold hover:bg-red-100 transition"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {req.status === "approved" && (
                        <button
                          onClick={() => setScheduleModal(req)}
                          className="px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl text-xs font-bold hover:shadow-md transition"
                        >
                          <CalendarCheck className="w-3.5 h-3.5 inline mr-1" />
                          Schedule
                        </button>
                      )}
                      {req.status === "scheduled" && (
                        <button
                          onClick={() => handleAction(req.id, "complete")}
                          className="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  )}

                  {userRole === "client" && req.status === "scheduled" && req.meetingLink && (
                    <a
                      href={req.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl text-xs font-bold hover:shadow-md transition flex items-center gap-1"
                    >
                      Join <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Schedule Modal */}
      <AnimatePresence>
        {scheduleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setScheduleModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-black text-slate-800 mb-4">Schedule Interview</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Interview Type</label>
                  <div className="flex gap-2">
                    {(["virtual", "phone", "in_person"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setScheduleType(t)}
                        className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold capitalize transition ${
                          scheduleType === t
                            ? "bg-teal-500 text-white"
                            : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {t.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Meeting Link</label>
                  <input
                    type="url"
                    value={scheduleLink}
                    onChange={(e) => setScheduleLink(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Admin Notes</label>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Any notes for the client..."
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/30 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setScheduleModal(null)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSchedule}
                  disabled={!scheduleDate}
                  className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl text-sm font-bold hover:shadow-md transition disabled:opacity-50"
                >
                  Confirm Schedule
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
