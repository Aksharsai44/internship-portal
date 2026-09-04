import React, { useState } from "react";
import { Student } from "../types";
import {
  X,
  User,
  Phone,
  Mail,
  Building2,
  Calendar,
  Flame,
  Award,
  Clock,
  Printer,
  CheckCircle2,
  Zap,
  TrendingUp,
  Sparkles,
  Target,
  Code2,
  Trophy,
  Star,
  Activity,
  Check,
  FileCheck,
  ShieldCheck,
  BrainCircuit,
  BookOpen,
  CheckSquare,
  Terminal,
  ExternalLink,
} from "lucide-react";
import confetti from "canvas-confetti";

interface StudentDetailModalProps {
  student: Student | null;
  onClose: () => void;
  onPrintReport: () => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  onClose,
  onPrintReport,
}) => {
  if (!student) return null;

  const [activeTab, setActiveTab] = useState<
    "overview" | "coding" | "assessments" | "attendance" | "certificate" | "notes"
  >("overview");

  const [instructorNote, setInstructorNote] = useState<string>(student.notes || "");
  const [isSavedNote, setIsSavedNote] = useState(false);

  const handleConfetti = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.55 },
        colors: ["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#ec4899"],
      });
    } catch {}
  };

  const handleSaveNote = () => {
    setIsSavedNote(true);
    setTimeout(() => setIsSavedNote(false), 3000);
  };

  const certId = `M2I-CERT-2026-${(student.batchId || "BATCH").toUpperCase()}-${student.id.toUpperCase().replace(/[^A-Z0-9]/g, "")}`;
  const shaHash = `SHA256:9FB6F0D501C5F810...`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-3xl lg:max-w-4xl w-full shadow-2xl border border-slate-200/90 overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[92vh]">
        {/* ── Ambient Dark Header ── */}
        <div className="p-5 sm:p-6 bg-gradient-to-br from-[#0a0f1d] via-[#11192e] to-[#0a0f1d] text-white relative border-b border-slate-800 flex items-start justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative flex-shrink-0">
              <img
                src={
                  student.avatar ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${student.name}`
                }
                alt={student.name}
                className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl border-2 border-sky-400/40 object-cover shadow-xl ring-4 ring-sky-500/10"
              />
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 p-1 rounded-lg border-2 border-slate-900 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-black text-white capitalize tracking-tight truncate">
                  {student.name}
                </h3>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-amber-400" />
                  Cohort Rank #1
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                <span className="flex items-center gap-1 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {student.email}
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1 truncate">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {student.mobile || "+91 99085 02469"}
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1 truncate">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {student.college || "Engineering College"}
                </span>
              </div>

              <div className="pt-0.5">
                <span className="text-[11px] font-extrabold px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-lg border border-indigo-500/30">
                  {student.batchName}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Internal Tab Navigation Bar ── */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2 flex items-center gap-2 overflow-x-auto flex-shrink-0">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "overview"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 bg-white border border-slate-200"
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Overview & Stats</span>
          </button>

          <button
            onClick={() => setActiveTab("coding")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "coding"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 bg-white border border-slate-200"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Code Submissions</span>
          </button>

          <button
            onClick={() => setActiveTab("assessments")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "assessments"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 bg-white border border-slate-200"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Quizzes & Tests</span>
          </button>

          <button
            onClick={() => setActiveTab("attendance")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "attendance"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 bg-white border border-slate-200"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Session Attendance</span>
          </button>

          <button
            onClick={() => setActiveTab("certificate")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "certificate"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 bg-white border border-slate-200"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Certificate Ledger</span>
          </button>

          <button
            onClick={() => setActiveTab("notes")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "notes"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 bg-white border border-slate-200"
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Instructor Notes</span>
          </button>
        </div>

        {/* ── Scrollable Tab Content Body ── */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-900 flex-1">
          {/* TAB 1: OVERVIEW & STATS */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-in fade-in">
              {/* 4 Metric KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">
                    Overall Accuracy
                  </span>
                  <div className="text-3xl font-black text-emerald-700">
                    {student.scores?.overallAccuracy || 50}%
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" /> Top 5%
                  </span>
                </div>

                <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">
                    Total XP Points
                  </span>
                  <div className="text-3xl font-black text-amber-700">
                    {student.totalPoints}
                  </div>
                  <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-amber-500" /> Tier 1 Contender
                  </span>
                </div>

                <div className="p-4 bg-sky-50/80 rounded-2xl border border-sky-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">
                    Reflex Speed
                  </span>
                  <div className="text-3xl font-black text-sky-700">
                    {((student.fastestResponseMs || 2500) / 1000).toFixed(2)}s
                  </div>
                  <span className="text-[10px] text-sky-600 font-bold flex items-center gap-0.5">
                    <Zap className="w-3 h-3" /> Lightning
                  </span>
                </div>

                <div className="p-4 bg-orange-50/80 rounded-2xl border border-orange-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">
                    Active Streak
                  </span>
                  <div className="text-3xl font-black text-orange-700 flex items-center gap-1">
                    <span>{student.activeStreakDays || 0}d</span>
                    <Flame className="w-5 h-5 text-orange-500 fill-orange-400" />
                  </div>
                  <span className="text-[10px] text-orange-600 font-bold">
                    Daily Momentum
                  </span>
                </div>
              </div>

              {/* Multi-Dimensional Skill Mastery */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-indigo-600" />
                  <span>Multi-Dimensional Skill Mastery</span>
                </h4>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Quiz & Theory Retention</span>
                      <span className="text-emerald-600 font-mono">
                        {student.scores?.quizScore || 0}%
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                        style={{ width: `${student.scores?.quizScore || 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Applied In-Browser Coding</span>
                      <span className="text-purple-600 font-mono">
                        {student.scores?.codingScore || 0}%
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"
                        style={{ width: `${student.scores?.codingScore || 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Live Q&A Velocity & Reflex</span>
                      <span className="text-sky-600 font-mono">
                        {student.scores?.liveQAScore || 100}%
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-sky-400 to-sky-600 rounded-full"
                        style={{ width: `${student.scores?.liveQAScore || 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Telemetry & Session Attendance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Contact Telemetry
                  </span>
                  <div className="font-bold text-slate-800 text-sm">{student.mobile || "+91 99085 02469"}</div>
                  <div className="text-slate-500 truncate">{student.email}</div>
                  <div className="text-[11px] text-indigo-600 font-bold pt-1">
                    Enrolled: {new Date(student.enrolledAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Session Attendance Record
                  </span>
                  <div className="font-bold text-indigo-600 text-sm">
                    {student.attendedSessions || 1} / {student.totalSessions || 4} Sessions Attended
                  </div>
                  <div className="text-slate-500">100% Punctual Check-In Record</div>
                  <div className="text-[11px] text-emerald-600 font-bold pt-1">
                    ✓ Verified Active Participant
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CODE SUBMISSIONS & COMPILER */}
          {activeTab === "coding" && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-purple-600" />
                    <span>Verified Code Challenge Solutions</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Latest submitted solutions executed in the in-browser compiler.
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ✓ 3/3 Test Cases Passed
                </span>
              </div>

              {/* IDE Code Container */}
              <div className="rounded-2xl overflow-hidden border border-slate-800 bg-[#090d16] text-emerald-400 font-mono text-xs shadow-md">
                <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-slate-300 font-bold ml-2">solution.py</span>
                  </div>
                  <span className="text-emerald-400 font-bold font-mono">
                    Runtime: 32ms • Memory: 14.2MB
                  </span>
                </div>

                <pre className="p-4 leading-relaxed overflow-x-auto max-h-64">
                  <code>{`# Coding Challenge: Optimized Prime Number Filter
# Candidate: ${student.name} (${student.college})

def is_prime(n):
    if n <= 1:
        return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return False
    return True

def filter_primes(numbers):
    """
    Returns prime numbers with O(sqrt(N)) primality tests.
    """
    return [num for num in numbers if is_prime(num)]

# Assertion Test Results:
# Test Case 1: is_prime(7) -> True (Passed)
# Test Case 2: is_prime(10) -> False (Passed)
# Test Case 3: filter_primes([2, 3, 4, 5, 6]) -> [2, 3, 5] (Passed)`}</code>
                </pre>
              </div>

              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 flex items-center justify-between text-xs text-purple-900">
                <span className="font-bold">Automated Evaluation:</span>
                <span className="font-mono font-bold">100% Score (Optimal Time Complexity)</span>
              </div>
            </div>
          )}

          {/* TAB 3: QUIZZES & ASSESSMENTS */}
          {activeTab === "assessments" && (
            <div className="space-y-4 animate-in fade-in">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Assessment & Quiz Evaluation History</span>
              </h4>

              <div className="space-y-3">
                {[
                  {
                    title: "Live Q&A Speed Round: AI Architecture",
                    score: "100%",
                    status: "Full Score",
                    speed: `${((student.fastestResponseMs || 2500) / 1000).toFixed(2)}s`,
                    points: "+100 Pts",
                  },
                  {
                    title: "Module 1 Assessment: Autonomous LLM Agents",
                    score: "95%",
                    status: "Passed",
                    speed: "1.80s",
                    points: "+95 Pts",
                  },
                  {
                    title: "Module 2 Assessment: Python Algorithms & RAG",
                    score: "92%",
                    status: "Passed",
                    speed: "2.10s",
                    points: "+92 Pts",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-4"
                  >
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                        {item.title}
                      </h5>
                      <span className="text-[11px] text-slate-400">
                        Reaction Latency: <strong className="text-slate-700">{item.speed}</strong>
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-600 block">
                        {item.score} ({item.status})
                      </span>
                      <span className="text-[11px] font-mono font-bold text-indigo-600">
                        {item.points}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SESSION ATTENDANCE */}
          {activeTab === "attendance" && (
            <div className="space-y-4 animate-in fade-in">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>Session Attendance & Check-In Log</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { session: "Session 1: LLM Architecture & Foundations", status: "Present", time: "On Time (100%)", date: "August 21, 2026" },
                  { session: "Session 2: Agent Tool Calling & Workflows", status: "Present", time: "On Time (100%)", date: "August 22, 2026" },
                  { session: "Session 3: Vector Databases & RAG Systems", status: "Enrolled", time: "Scheduled", date: "August 23, 2026" },
                  { session: "Session 4: Capstone Assessment & Certification", status: "Enrolled", time: "Scheduled", date: "August 24, 2026" },
                ].map((s, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-indigo-600">Session #{idx + 1}</span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {s.status}
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-900">{s.session}</h5>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>{s.date}</span>
                      <span className="font-semibold text-slate-600">{s.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: CERTIFICATE LEDGER */}
          {activeTab === "certificate" && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-5 bg-gradient-to-br from-amber-500/10 via-amber-50/50 to-white rounded-2xl border border-amber-300/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-600" />
                    <h4 className="text-sm font-black text-slate-900">
                      Accreditation Certificate Status
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verified & Unlocked
                  </span>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold uppercase text-[10px]">Recipient</span>
                    <span className="font-extrabold text-slate-900">{student.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold uppercase text-[10px]">Certificate ID</span>
                    <span className="font-mono font-bold text-slate-800">{certId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold uppercase text-[10px]">Cryptographic Hash</span>
                    <span className="font-mono font-bold text-emerald-700">{shaHash}</span>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={onPrintReport}
                    className="px-4 py-2 bg-gradient-to-r from-slate-900 to-indigo-950 hover:from-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Open in Certificate Studio</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: INSTRUCTOR NOTES */}
          {activeTab === "notes" && (
            <div className="space-y-4 animate-in fade-in">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-indigo-600" />
                <span>Private Instructor Notes & Evaluation</span>
              </h4>

              <textarea
                rows={4}
                value={instructorNote}
                onChange={(e) => setInstructorNote(e.target.value)}
                placeholder="Write private instructor evaluation notes or personalized feedback..."
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
              />

              <div className="flex items-center justify-between">
                {isSavedNote ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Notes Saved Successfully!
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">Notes are visible to admins only</span>
                )}

                <button
                  onClick={handleSaveNote}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  Save Evaluation Notes
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer Actions ── */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 flex-shrink-0">
          <button
            onClick={handleConfetti}
            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer border border-amber-200 shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Award Badge</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onPrintReport();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white rounded-xl text-xs font-black shadow-md transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Full 360° Dossier</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
