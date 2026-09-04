import React, { useState } from "react";
import { Student, Batch, InterviewRequest, ClientUser } from "../types";
import {
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  Building2,
  ExternalLink,
  Sparkles,
  Award,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  Send,
  CalendarCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";

interface InternInterviewsViewProps {
  currentStudent: Student;
  interviewRequests: InterviewRequest[];
  clients: ClientUser[];
  batches: Batch[];
  onUpdateRequests: (requests: InterviewRequest[]) => void;
}

export function InternInterviewsView({
  currentStudent,
  interviewRequests,
  clients,
  batches,
  onUpdateRequests,
}: InternInterviewsViewProps) {
  // CRITICAL REQUIREMENT:
  // Interns must ONLY see requests that have been APPROVED by the admin, SCHEDULED, or COMPLETED.
  // PENDING requests (awaiting admin review) and REJECTED requests MUST NOT BE DISPLAYED!
  const internOpportunities = interviewRequests.filter(
    (r) =>
      r.internId === currentStudent.id &&
      (r.status === "approved" || r.status === "scheduled" || r.status === "completed")
  );

  const [scheduleModal, setScheduleModal] = useState<InterviewRequest | null>(null);
  const [chosenDate, setChosenDate] = useState("");
  const [chosenTime, setChosenTime] = useState("14:00");
  const [internMessage, setInternMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleModal || !chosenDate) return;

    setIsSubmitting(true);
    const combinedDateTime = `${chosenDate}T${chosenTime}:00Z`;
    const meetingLink =
      scheduleModal.meetingLink ||
      `https://meet.google.com/mind2i-${scheduleModal.id.slice(-6)}`;

    try {
      const res = await axios.post(`/api/interview-requests/${scheduleModal.id}/schedule/`, {
        scheduledDate: combinedDateTime,
        meetingLink,
        adminNotes: internMessage
          ? `Intern confirmed slot: ${chosenDate} at ${chosenTime}. Note: ${internMessage}`
          : `Intern confirmed slot: ${chosenDate} at ${chosenTime}`,
      });

      const updated = res.data;
      onUpdateRequests(
        interviewRequests.map((r) =>
          r.id === scheduleModal.id
            ? {
                ...r,
                status: "scheduled",
                scheduledDate: combinedDateTime,
                meetingLink,
              }
            : r
        )
      );
      setScheduleModal(null);
    } catch (err) {
      console.error("Failed to schedule interview:", err);
      // Fallback local update
      onUpdateRequests(
        interviewRequests.map((r) =>
          r.id === scheduleModal.id
            ? {
                ...r,
                status: "scheduled",
                scheduledDate: combinedDateTime,
                meetingLink,
              }
            : r
        )
      );
      setScheduleModal(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const scheduledCount = internOpportunities.filter((r) => r.status === "scheduled").length;
  const approvedCount = internOpportunities.filter((r) => r.status === "approved").length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-teal-700/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Hiring Pipeline & Client Opportunities</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Client Interviews & Offers
          </h1>
          <p className="text-sm text-teal-100 font-medium max-w-2xl leading-relaxed">
            Partner technology companies review top-performing interns directly from the cohort leaderboard. 
            Once approved by the program director, you can schedule and attend technical interview rounds here.
          </p>

          {/* Quick Metrics */}
          <div className="flex flex-wrap gap-3 pt-2">
            <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center gap-2.5">
              <CalendarCheck className="w-4 h-4 text-amber-300" />
              <div>
                <span className="text-xs font-black">{approvedCount} Ready to Schedule</span>
              </div>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center gap-2.5">
              <Video className="w-4 h-4 text-emerald-300" />
              <div>
                <span className="text-xs font-black">{scheduledCount} Confirmed Interviews</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Opportunities List */}
      {internOpportunities.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-800">No Approved Interviews Yet</h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            When client companies like your profile and request an interview, the program administration reviews and approves it. 
            Once approved, it will appear here for you to schedule your slot.
          </p>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 font-medium">
            💡 <strong>Pro-Tip:</strong> Maintain a high coding IDE score, active streak days, and complete assignments to rank in the Top 5 of your cohort leaderboard!
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
            <span>Your Approved Opportunities</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black">
              {internOpportunities.length} Total
            </span>
          </h2>

          <div className="grid gap-4">
            {internOpportunities.map((req, i) => {
              const clientObj = clients.find((c) => c.id === req.clientId);
              const batchObj = batches.find((b) => b.id === req.batchId);
              const isApproved = req.status === "approved";
              const isScheduled = req.status === "scheduled";
              const isCompleted = req.status === "completed";

              return (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`bg-white rounded-3xl border p-6 shadow-sm transition-all duration-300 ${
                    isScheduled
                      ? "border-emerald-200 hover:shadow-lg hover:border-emerald-300"
                      : isApproved
                      ? "border-amber-200 hover:shadow-lg hover:border-amber-300"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center font-black text-base shadow-md shadow-teal-500/15">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-black text-slate-900">
                            {clientObj?.companyName || "Hiring Partner Enterprise"}
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600">
                            {clientObj?.industry || "Technology"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          Point of Contact: {clientObj?.contactPerson || "Talent Acquisition Team"} • Track: {batchObj?.name || "Internship Track"}
                        </p>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div>
                      {isApproved && (
                        <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-black flex items-center gap-1.5 shadow-2xs">
                          <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                          <span>Approved by Admin • Select Slot</span>
                        </span>
                      )}
                      {isScheduled && (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black flex items-center gap-1.5 shadow-2xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Interview Scheduled</span>
                        </span>
                      )}
                      {isCompleted && (
                        <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>Interview Completed</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Notes */}
                  <div className="py-4 space-y-2.5 text-xs">
                    {req.notes && (
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 text-teal-600" />
                          Client Hiring Note
                        </span>
                        <p className="text-slate-700 font-semibold leading-relaxed">
                          "{req.notes}"
                        </p>
                      </div>
                    )}

                    {req.adminNotes && (
                      <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          Program Director Endorsement
                        </span>
                        <p className="text-emerald-900 font-semibold leading-relaxed">
                          {req.adminNotes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Date & Action Footer */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-teal-600" />
                      {req.scheduledDate ? (
                        <span className="font-bold text-slate-800">
                          Date: {new Date(req.scheduledDate).toLocaleDateString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })} at {new Date(req.scheduledDate).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      ) : (
                        <span className="font-medium text-amber-700">
                          Waiting for your preferred interview time confirmation.
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                      {isApproved && (
                        <button
                          onClick={() => {
                            setScheduleModal(req);
                            setChosenDate(new Date(Date.now() + 86400000).toISOString().split("T")[0]);
                          }}
                          className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-xl text-xs font-black shadow-md shadow-teal-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <CalendarCheck className="w-4 h-4" />
                          <span>Confirm & Pick Time Slot</span>
                        </button>
                      )}

                      {isScheduled && req.meetingLink && (
                        <a
                          href={req.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Video className="w-4 h-4" />
                          <span>Join Virtual Interview</span>
                          <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Intern Slot Selection Modal */}
      <AnimatePresence>
        {scheduleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-teal-600" />
                  <h3 className="text-base font-black text-slate-900">
                    Schedule Your Interview Slot
                  </h3>
                </div>
                <button
                  onClick={() => setScheduleModal(null)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  Cancel
                </button>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Choose the date and time when you are fully available for your technical round with the client.
              </p>

              <form onSubmit={handleConfirmSchedule} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500">
                      Date
                    </label>
                    <input
                      type="date"
                      required
                      value={chosenDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setChosenDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500">
                      Time (IST)
                    </label>
                    <input
                      type="time"
                      required
                      value={chosenTime}
                      onChange={(e) => setChosenTime(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500">
                    Note for Client & Admin (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Ready with laptop and camera setup for live coding."
                    value={internMessage}
                    onChange={(e) => setInternMessage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setScheduleModal(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-xl text-xs font-black shadow-md shadow-teal-500/20 transition flex items-center gap-1.5"
                  >
                    {isSubmitting ? "Confirming..." : "Confirm Schedule"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
