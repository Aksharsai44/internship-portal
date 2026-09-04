import React, { useState } from "react";
import { Student, Batch, InterviewRequest, ClientUser } from "../types";
import {
  Bookmark,
  BookmarkCheck,
  Calendar,
  ExternalLink,
  Github,
  Linkedin,
  Trash2,
  Trophy,
  ArrowRight,
  Search,
  Building2,
  Mail,
  Phone,
  FileText,
  Star,
  CheckCircle2,
  Clock,
  MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ClientShortlistPipelineViewProps {
  clientUser: ClientUser;
  shortlistedInterns: Student[];
  batches: Batch[];
  interviewRequests: InterviewRequest[];
  onRemoveFromShortlist: (internId: string) => void;
  onRequestInterview: (intern: Student) => void;
  onViewIntern: (intern: Student) => void;
  onNavigateLeaderboard: () => void;
}

export function ClientShortlistPipelineView({
  clientUser,
  shortlistedInterns,
  batches,
  interviewRequests,
  onRemoveFromShortlist,
  onRequestInterview,
  onViewIntern,
  onNavigateLeaderboard,
}: ClientShortlistPipelineViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [candidateNotes, setCandidateNotes] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem(`client_notes_${clientUser.id}`) || "{}");
    } catch {
      return {};
    }
  });
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNoteText, setTempNoteText] = useState("");

  const handleSaveNote = (internId: string) => {
    const updated = { ...candidateNotes, [internId]: tempNoteText };
    setCandidateNotes(updated);
    localStorage.setItem(`client_notes_${clientUser.id}`, JSON.stringify(updated));
    setEditingNoteId(null);
  };

  const filtered = shortlistedInterns.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.college || "").toLowerCase().includes(q) ||
      (s.skills || []).some((sk) => sk.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-black uppercase tracking-wider mb-2">
            <BookmarkCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Hiring Shortlist Pipeline</span>
            <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center">
              {shortlistedInterns.length}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            Shortlisted Pipeline
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Evaluate, take private notes, and request interviews with your bookmarked candidates.
          </p>
        </div>

        <button
          onClick={onNavigateLeaderboard}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black transition flex items-center gap-2 shadow-md cursor-pointer"
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Browse More Talent</span>
        </button>
      </div>

      {/* Search Input */}
      {shortlistedInterns.length > 0 && (
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, college, or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          />
        </div>
      )}

      {/* Empty State */}
      {shortlistedInterns.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 text-amber-500 flex items-center justify-center mx-auto">
            <Bookmark className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-800">Your Pipeline is Empty</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Star or bookmark interns from the <strong>Intern Leaderboard</strong> to build your shortlist, take private evaluation notes, and trigger direct interview scheduling.
          </p>
          <button
            onClick={onNavigateLeaderboard}
            className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-teal-500/20 transition inline-flex items-center gap-2 cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-white" />
            <span>Open Intern Leaderboard</span>
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {filtered.map((intern, i) => {
            const clientRequest = interviewRequests.find(
              (r) => r.internId === intern.id && r.clientId === clientUser.id
            );

            const privateNote = candidateNotes[intern.id] || "";

            return (
              <motion.div
                key={intern.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-xl hover:border-amber-300 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={
                          intern.avatar ||
                          `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                            intern.name
                          )}`
                        }
                        alt={intern.name}
                        className="w-13 h-13 rounded-2xl object-cover border border-slate-200 shadow-xs"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-black text-slate-900 leading-tight">
                            {intern.name}
                          </h3>
                          <span className="px-2 py-0.5 rounded-lg bg-teal-50 text-teal-700 text-[10px] font-black border border-teal-200">
                            {intern.totalPoints} pts
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {intern.college} • {intern.batchName}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveFromShortlist(intern.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                      title="Remove from shortlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Bio */}
                  {intern.bio && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 font-medium mb-3 leading-relaxed">
                      "{intern.bio}"
                    </p>
                  )}

                  {/* Skills */}
                  {intern.skills && intern.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {intern.skills.map((sk) => (
                        <span
                          key={sk}
                          className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Score breakdown metrics */}
                  <div className="grid grid-cols-4 gap-2 py-3 border-y border-slate-100 mb-4 text-center">
                    <div className="p-2 bg-slate-50 rounded-xl">
                      <div className="text-[9px] font-bold text-slate-400 uppercase">Coding</div>
                      <div className="text-xs font-black text-slate-800">
                        {intern.scores?.codingScore || 0}%
                      </div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl">
                      <div className="text-[9px] font-bold text-slate-400 uppercase">Quiz</div>
                      <div className="text-xs font-black text-slate-800">
                        {intern.scores?.quizScore || 0}%
                      </div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl">
                      <div className="text-[9px] font-bold text-slate-400 uppercase">Live Q&A</div>
                      <div className="text-xs font-black text-slate-800">
                        {intern.scores?.liveQAScore || 0}%
                      </div>
                    </div>
                    <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100">
                      <div className="text-[9px] font-bold text-emerald-600 uppercase">Accuracy</div>
                      <div className="text-xs font-black text-emerald-700">
                        {intern.scores?.overallAccuracy || 0}%
                      </div>
                    </div>
                  </div>

                  {/* Private Client Notes */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-amber-500" />
                        Private Hiring Notes
                      </span>
                      {editingNoteId !== intern.id && (
                        <button
                          onClick={() => {
                            setEditingNoteId(intern.id);
                            setTempNoteText(privateNote);
                          }}
                          className="text-[10px] font-bold text-amber-600 hover:text-amber-700 cursor-pointer"
                        >
                          {privateNote ? "Edit Note" : "+ Add Note"}
                        </button>
                      )}
                    </div>

                    {editingNoteId === intern.id ? (
                      <div className="space-y-2">
                        <textarea
                          rows={2}
                          value={tempNoteText}
                          onChange={(e) => setTempNoteText(e.target.value)}
                          placeholder="e.g. Recommended by lead mentor for backend role..."
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/30 resize-none"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingNoteId(null)}
                            className="px-2.5 py-1 text-[11px] font-bold text-slate-500 hover:bg-slate-100 rounded-lg"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveNote(intern.id)}
                            className="px-3 py-1 bg-amber-500 text-white text-[11px] font-bold rounded-lg hover:bg-amber-600 shadow-xs"
                          >
                            Save Note
                          </button>
                        </div>
                      </div>
                    ) : privateNote ? (
                      <p className="text-xs text-amber-900 bg-amber-50/70 border border-amber-200/80 p-2.5 rounded-xl font-medium">
                        {privateNote}
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">No notes added yet.</p>
                    )}
                  </div>
                </div>

                {/* Footer & Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {intern.githubUrl && (
                      <a
                        href={intern.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                        title="GitHub Profile"
                      >
                        <Github className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {intern.linkedinUrl && (
                      <a
                        href={intern.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-600 transition"
                        title="LinkedIn Profile"
                      >
                        <Linkedin className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => onViewIntern(intern)}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>Profile</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>

                  {clientRequest ? (
                    <span
                      className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 ${
                        clientRequest.status === "scheduled"
                          ? "bg-emerald-100 text-emerald-800"
                          : clientRequest.status === "approved"
                          ? "bg-teal-100 text-teal-800"
                          : clientRequest.status === "completed"
                          ? "bg-slate-100 text-slate-700"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {clientRequest.status === "scheduled"
                        ? "Interview Set"
                        : clientRequest.status === "approved"
                        ? "Approved"
                        : clientRequest.status === "completed"
                        ? "Completed"
                        : "Requested"}
                    </span>
                  ) : (
                    <button
                      onClick={() => onRequestInterview(intern)}
                      className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-xl text-xs font-black shadow-md shadow-teal-500/15 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Request Interview</span>
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
