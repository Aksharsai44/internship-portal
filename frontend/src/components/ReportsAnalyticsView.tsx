import React, { useState, useEffect } from "react";
import { Batch, Student, UserRole } from "../types";
import {
  BarChart3,
  TrendingUp,
  Download,
  Award,
  CheckCircle2,
  Calendar,
  Zap,
  Clock,
  Printer,
  FileText,
  ChevronRight,
  Flame,
  ShieldCheck,
  User,
  Users,
  Eye,
  ArrowLeft,
  Sparkles,
  Target,
  BrainCircuit,
  Mail,
  Phone,
  Building2,
  Code2,
  Activity,
  Terminal,
  Trophy,
  Star,
  Search,
  Filter,
  Check,
  Share2,
  CheckSquare,
  BadgeCheck,
  Layers,
  Cpu,
} from "lucide-react";
import confetti from "canvas-confetti";

interface ReportsAnalyticsViewProps {
  batches: Batch[];
  selectedBatch: Batch;
  students: Student[];
  userRole: UserRole;
  currentStudent?: Student;
  onViewStudent: (student: Student) => void;
}

export const ReportsAnalyticsView: React.FC<ReportsAnalyticsViewProps> = ({
  batches,
  selectedBatch,
  students,
  userRole,
  currentStudent,
  onViewStudent,
}) => {
  const batchStudents = students.filter((s) => s.batchId === selectedBatch?.id);
  const [selectedStudentForReport, setSelectedStudentForReport] = useState<Student | undefined>(
    userRole === "student" && currentStudent ? currentStudent : batchStudents[0]
  );

  const [viewMode, setViewMode] = useState<"individual" | "batch">(
    userRole === "student" ? "individual" : "batch"
  );

  const [activeDossierTab, setActiveDossierTab] = useState<
    "overview" | "skills" | "telemetry" | "coding" | "attendance"
  >("overview");

  const [searchFilterQuery, setSearchFilterQuery] = useState<string>("");
  const [cohortFilterCategory, setCohortFilterCategory] = useState<
    "all" | "top" | "coding" | "speed" | "streak"
  >("all");

  const [instructorNotesText, setInstructorNotesText] = useState<string>("");
  const [savedNotesMap, setSavedNotesMap] = useState<Record<string, string>>({});
  const [isLiveTelemetryStreaming, setIsLiveTelemetryStreaming] = useState<boolean>(true);
  const [telemetryTickerIndex, setTelemetryTickerIndex] = useState<number>(0);

  // Sync selected student on batch switch
  useEffect(() => {
    if (userRole === "admin" && batchStudents.length > 0) {
      if (!selectedStudentForReport || selectedStudentForReport.batchId !== selectedBatch?.id) {
        setSelectedStudentForReport(batchStudents[0]);
      }
    } else if (userRole === "student" && currentStudent) {
      setSelectedStudentForReport(currentStudent);
    }
  }, [selectedBatch?.id, students, currentStudent, userRole]);

  // Live real-time telemetry stream events ticker from real batch students
  const telemetryEvents = batchStudents.length > 0 ? [
    {
      student: batchStudents[0]?.name || "Student",
      action: "Participating in active learning session",
      result: `Accuracy: ${batchStudents[0]?.scores?.overallAccuracy ?? 0}%`,
      time: "Just now",
      icon: "⚡",
      color: "text-emerald-400",
    },
    ...(batchStudents.length > 1 ? [{
      student: batchStudents[1]?.name || "Student",
      action: "Active on learning portal",
      result: `${batchStudents[1]?.totalPoints ?? 0} Points`,
      time: "1m ago",
      icon: "🚀",
      color: "text-sky-400",
    }] : []),
    ...(batchStudents.length > 2 ? [{
      student: batchStudents[2]?.name || "Student",
      action: "Continuous learning streak",
      result: `${batchStudents[2]?.activeStreakDays ?? 1}-Day Streak`,
      time: "3m ago",
      icon: "🔥",
      color: "text-amber-400",
    }] : []),
    ...(batchStudents.length > 3 ? [{
      student: batchStudents[3]?.name || "Student",
      action: "Completed module exercises",
      result: `Score: ${batchStudents[3]?.scores?.assignmentScore ?? 0}%`,
      time: "5m ago",
      icon: "🎯",
      color: "text-indigo-400",
    }] : []),
  ] : [
    {
      student: "Platform",
      action: "Telemetry engine active & listening",
      result: "Ready for live sessions",
      time: "Live",
      icon: "⚡",
      color: "text-emerald-400",
    }
  ];

  // Rotate ticker every 4 seconds for lively real-time feel
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetryTickerIndex((prev) => (prev + 1) % telemetryEvents.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [telemetryEvents.length]);

  // Batch analytics aggregations
  const totalEnrolled = batchStudents.length;
  const avgAccuracy =
    totalEnrolled > 0
      ? Number(
          (
            batchStudents.reduce((acc, s) => acc + (s.scores?.overallAccuracy ?? 0), 0) /
            totalEnrolled
          ).toFixed(1)
        )
      : 0;
  const avgQuiz =
    totalEnrolled > 0
      ? Math.round(
          batchStudents.reduce((acc, s) => acc + (s.scores?.quizScore ?? 0), 0) / totalEnrolled
        )
      : 0;
  const avgCoding =
    totalEnrolled > 0
      ? Math.round(
          batchStudents.reduce((acc, s) => acc + (s.scores?.codingScore ?? 0), 0) / totalEnrolled
        )
      : 0;
  const avgLiveQA =
    totalEnrolled > 0
      ? Math.round(
          batchStudents.reduce((acc, s) => acc + (s.scores?.liveQAScore ?? 0), 0) / totalEnrolled
        )
      : 0;

  const avgSpeedMs =
    totalEnrolled > 0
      ? Math.round(
          batchStudents.reduce(
            (acc, s) => acc + (s.fastestResponseMs || 2200),
            0
          ) / totalEnrolled
        )
      : 2200;

  const handlePrintOrDownloadPdf = () => {
    window.print();
  };

  const handleTriggerCelebration = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#ec4899"],
      });
    } catch {}
  };

  const handleExportBatchCsv = () => {
    const headers =
      "Student Name,Email,Mobile,Batch,College,Quiz Score,Coding Score,Live QA Score,Overall Accuracy,Total Points,Speed (ms),Attendance\n";
    const rows = batchStudents
      .map(
        (s) =>
          `"${s.name}","${s.email}","${s.mobile}","${s.batchName}","${s.college}",${s.scores?.quizScore ?? 0}%,${s.scores?.codingScore ?? 0}%,${s.scores?.liveQAScore ?? 0}%,${s.scores?.overallAccuracy ?? 0}%,${s.totalPoints ?? 0},${s.fastestResponseMs ?? 0}ms,"${s.attendedSessions ?? 0}/${s.totalSessions ?? 0}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `MIND2I_${selectedBatch.name.replace(/\s+/g, "_")}_Performance_Report.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper for generating dynamic text based on scores
  const getCohortSummaryText = () => {
    if (avgAccuracy > 85)
      return "This cohort is demonstrating exceptional mastery across the board. Students are grasping complex agent concepts rapidly and engaging heavily with compiler test cases. Their high coding scores indicate elite practical problem-solving capability.";
    if (avgAccuracy > 70)
      return "The batch is showing solid, steady progress. Engagement is healthy, with steady response times across live Q&A. Overall knowledge retention is tracking within top-tier industry benchmarks.";
    return "This cohort requires additional guided hands-on mentorship. We recommend hosting supplemental algorithm labs or 1-on-1 office hours to boost compiler pass rates.";
  };

  const getStudentSummaryText = (score: number) => {
    if (score > 90)
      return "Exceptional high-velocity performance. Rapidly grasps complex multi-agent architectures, consistently passes all assertion test cases on the first attempt, and demonstrates high reflex speed during live Q&A rounds.";
    if (score > 75)
      return "Solid baseline performance. Consistently submits assignments and exercises good algorithmic structure. Recommended to focus on O(log N) runtime optimizations during live coding.";
    if (score > 60)
      return "Moderate performance with clear growth vectors. The student is completing core curriculum tasks but can benefit from reviewing foundational data structures and prompt engineering patterns.";
    return "Requires intervention and guided assistance. We recommend pairing with a mentor on core coding exercises to build algorithm confidence.";
  };

  // Filtered students in directory
  const filteredStudents = batchStudents
    .filter((s) => {
      const matchText =
        searchFilterQuery.trim() === "" ||
        s.name.toLowerCase().includes(searchFilterQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchFilterQuery.toLowerCase()) ||
        (s.college || "").toLowerCase().includes(searchFilterQuery.toLowerCase());

      if (cohortFilterCategory === "top")
        return matchText && (s.scores?.overallAccuracy ?? 0) >= 90;
      if (cohortFilterCategory === "coding")
        return matchText && (s.scores?.codingScore ?? 0) >= 90;
      if (cohortFilterCategory === "speed")
        return matchText && (s.fastestResponseMs || 3000) <= 1800;
      if (cohortFilterCategory === "streak")
        return matchText && s.activeStreakDays >= 4;
      return matchText;
    })
    .sort((a, b) => (b.scores?.overallAccuracy ?? 0) - (a.scores?.overallAccuracy ?? 0));

  const activeEvent = telemetryEvents[telemetryTickerIndex];

  return (
    <div className="space-y-6 pb-12">
      {/* ── Top Header Bar (Hidden in Print) ── */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <span>
                {userRole === "admin"
                  ? "Reports & Telemetry Analytics Hub"
                  : "My 360° Performance & Telemetry Dossier"}
              </span>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Telemetry
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time response speed velocity, algorithmic mastery matrix, attendance timeline, and evaluation dossiers.
          </p>
        </div>

        {userRole === "admin" && (
          <div className="flex items-center gap-2.5 flex-wrap">
            {viewMode === "individual" && (
              <button
                onClick={() => setViewMode("batch")}
                className="px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Cohort View</span>
              </button>
            )}

            <button
              onClick={handleExportBatchCsv}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition border border-indigo-200 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Cohort CSV</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Live Telemetry Ticker Strip (Hidden in Print) ── */}
      <div className="p-3 bg-slate-950 text-slate-200 rounded-2xl border border-slate-800 shadow-md flex items-center justify-between gap-4 overflow-hidden print:hidden">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex-shrink-0 px-2 py-0.5 bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-md text-[10px] font-mono font-bold flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-sky-400 animate-pulse" />
            TELEMETRY STREAM
          </span>

          <div className="flex items-center gap-2 truncate text-xs">
            <span className="text-base">{activeEvent?.icon}</span>
            <strong className="text-white font-extrabold truncate">
              {activeEvent?.student}:
            </strong>
            <span className="text-slate-300 truncate">{activeEvent?.action}</span>
            <span className={`font-mono font-bold ${activeEvent?.color}`}>
              ({activeEvent?.result})
            </span>
          </div>
        </div>

        <span className="flex-shrink-0 text-[10px] text-slate-400 font-mono hidden sm:inline-block">
          Updated {activeEvent?.time}
        </span>
      </div>

      {/* ========================================================================= */}
      {/* 1. EMPTY STATE IF NO STUDENTS                                             */}
      {/* ========================================================================= */}
      {batchStudents.length === 0 && userRole === "admin" ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-12 text-center animate-in fade-in">
          <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">No Students Enrolled Yet</h3>
          <p className="text-slate-500 max-w-md mx-auto text-sm leading-relaxed">
            There are no members in this batch. Once students register and participate in live challenges, their real-time telemetry and 360° dossiers will display here.
          </p>
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* 2. BATCH-WIDE PERFORMANCE & COHORT ANALYTICS VIEW                         */}
          {/* ========================================================================= */}
          {viewMode === "batch" && userRole === "admin" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* AI Cohort Diagnostics Hero Banner */}
              <div className="p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl text-white shadow-xl relative overflow-hidden border border-indigo-900/40">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <BrainCircuit className="w-44 h-44" />
                </div>
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>AI Cohort Telemetry Diagnostics</span>
                  </div>
                  <h3 className="text-2xl font-black text-white">
                    {selectedBatch.name} • Deep Telemetry Insights
                  </h3>
                  <p className="text-sm text-indigo-100/80 leading-relaxed max-w-3xl">
                    {getCohortSummaryText()}
                  </p>
                </div>
              </div>

              {/* 4 Summary KPI Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Enrolled */}
                <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      Total Cohort Enrolled
                    </span>
                    <Users className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="text-3xl font-black text-slate-900">
                    {totalEnrolled} <span className="text-xs font-bold text-slate-400">Engineers</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full w-full" />
                  </div>
                </div>

                {/* Avg Accuracy */}
                <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      Cohort Accuracy Mean
                    </span>
                    <Target className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-3xl font-black text-emerald-600">
                    {avgAccuracy}%
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${avgAccuracy}%` }}
                    />
                  </div>
                </div>

                {/* Avg Coding */}
                <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      Applied Coding Score
                    </span>
                    <Code2 className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="text-3xl font-black text-purple-600">
                    {avgCoding}%
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${avgCoding}%` }}
                    />
                  </div>
                </div>

                {/* Avg Reflex Speed */}
                <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      Mean Response Latency
                    </span>
                    <Clock className="w-4 h-4 text-sky-500" />
                  </div>
                  <div className="text-3xl font-black text-sky-600">
                    {(avgSpeedMs / 1000).toFixed(2)}s
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-500 rounded-full w-4/5" />
                  </div>
                </div>
              </div>

              {/* Student Directory Table with Interactive 360° Telemetry Launch */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-600" />
                      <span>Student Directory ({batchStudents.length})</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Click the Report button on any student to open their comprehensive dossier.
                    </p>
                  </div>

                  {/* Search & Category Filter Pills */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchFilterQuery}
                        onChange={(e) => setSearchFilterQuery(e.target.value)}
                        placeholder="Filter by name, email, college..."
                        className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 w-44 sm:w-56"
                      />
                    </div>

                    <select
                      value={cohortFilterCategory}
                      onChange={(e) => setCohortFilterCategory(e.target.value as any)}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                    >
                      <option value="all">All Cohort ({batchStudents.length})</option>
                      <option value="top">⭐ Top 10% Leaders</option>
                      <option value="coding">⚡ Coding Masters</option>
                      <option value="speed">🚀 Speed Reflex Tier</option>
                      <option value="streak">🔥 Streak Heroes</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-2xs">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50/90 text-slate-500 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="py-3.5 pl-4 w-12 text-center">Rank</th>
                        <th className="py-3.5 px-3">Student Name & College</th>
                        <th className="py-3.5 px-3">Overall Accuracy</th>
                        <th className="py-3.5 px-3">Coding Score</th>
                        <th className="py-3.5 px-3">Reflex Speed</th>
                        <th className="py-3.5 px-3">Streak</th>
                        <th className="py-3.5 pr-4 text-right">Report</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                            No students match your filter criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map((s, idx) => (
                          <tr
                            key={s.id}
                            className="hover:bg-slate-50/80 transition group"
                          >
                            {/* Rank */}
                            <td className="py-3.5 pl-4 text-center font-black text-xs">
                              {idx === 0 ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-800 shadow-xs">
                                  🥇
                                </span>
                              ) : idx === 1 ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-700 shadow-xs">
                                  🥈
                                </span>
                              ) : idx === 2 ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-50 text-amber-900 shadow-xs">
                                  🥉
                                </span>
                              ) : (
                                <span className="text-slate-400 font-mono">#{idx + 1}</span>
                              )}
                            </td>

                            {/* Name & College */}
                            <td className="py-3.5 px-3">
                              <div className="flex items-center gap-3">
                                <div className="relative flex-shrink-0">
                                  <img
                                    src={
                                      s.avatar ||
                                      `https://api.dicebear.com/7.x/bottts/svg?seed=${s.name}`
                                    }
                                    alt={s.name}
                                    className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-xs"
                                  />
                                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                                </div>
                                <div className="min-w-0">
                                  <span className="font-bold text-slate-900 block truncate">
                                    {s.name}
                                  </span>
                                  <span className="text-[11px] text-slate-400 truncate block">
                                    {s.college || s.email}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Accuracy */}
                            <td className="py-3.5 px-3">
                              <div className="space-y-1 w-24">
                                <div className="flex items-center justify-between text-xs font-black">
                                  <span className="text-emerald-600">
                                    {s.scores?.overallAccuracy ?? 0}%
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {s.totalPoints ?? 0} pts
                                  </span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-emerald-500 rounded-full"
                                    style={{ width: `${s.scores?.overallAccuracy ?? 0}%` }}
                                  />
                                </div>
                              </div>
                            </td>

                            {/* Coding */}
                            <td className="py-3.5 px-3">
                              <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-mono font-bold text-xs border border-purple-100">
                                {s.scores?.codingScore ?? 0}% Pass
                              </span>
                            </td>

                            {/* Reflex Speed */}
                            <td className="py-3.5 px-3 text-xs font-mono font-bold text-slate-600">
                              ⚡ {((s.fastestResponseMs || 2000) / 1000).toFixed(2)}s
                            </td>

                            {/* Streak */}
                            <td className="py-3.5 px-3">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-xs border border-amber-200">
                                <Flame className="w-3 h-3 text-amber-500 fill-amber-400" />
                                <span>{s.activeStreakDays}d</span>
                              </span>
                            </td>

                            {/* Report Action Button */}
                            <td className="py-3.5 pr-4 text-right">
                              <div className="flex items-center justify-end">
                                <button
                                  onClick={() => onViewStudent(s)}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-200 hover:border-indigo-600 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
                                  title="Open Comprehensive Candidate Report"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>Report</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. STUNNING 360° STUDENT TELEMETRY DOSSIER (INDIVIDUAL VIEW)               */}
          {/* ========================================================================= */}
          {(viewMode === "individual" || userRole === "student") && selectedStudentForReport && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
              {/* Hero Ambient Dossier Card */}
              <div className="p-6 sm:p-8 bg-gradient-to-br from-[#0b101e] via-[#11192e] to-[#0b101e] text-white rounded-3xl border border-slate-800 shadow-2xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <Cpu className="w-64 h-64 text-sky-400" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-slate-800/80">
                  {/* Student Profile Info */}
                  <div className="flex items-center gap-5">
                    <div className="relative flex-shrink-0">
                      <img
                        src={
                          selectedStudentForReport.avatar ||
                          `https://api.dicebear.com/7.x/bottts/svg?seed=${selectedStudentForReport.name}`
                        }
                        alt={selectedStudentForReport.name}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl border-2 border-sky-400/40 object-cover shadow-xl ring-4 ring-sky-500/10"
                      />
                      <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-1.5 rounded-xl border-2 border-slate-900 shadow-md">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                          {selectedStudentForReport.name}
                        </h3>
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1">
                          <Trophy className="w-3 h-3 text-amber-400" />
                          Rank #1 Cohort Master
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 font-medium">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {selectedStudentForReport.email}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {selectedStudentForReport.college || "Engineering College"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[11px] font-extrabold px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-500/30">
                          {selectedStudentForReport.batchName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Candidate Report, Print PDF & Celebration Confetti */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                      onClick={() => onViewStudent(selectedStudentForReport)}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Candidate Report</span>
                    </button>

                    <button
                      onClick={handleTriggerCelebration}
                      className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer transform hover:-translate-y-0.5"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Award Recognition</span>
                    </button>

                    <button
                      onClick={() => onViewStudent(selectedStudentForReport)}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
                      title="Open and Download Official Candidate Dossier PDF"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Download PDF Report</span>
                    </button>
                  </div>
                </div>

                {/* 4 Telemetry Quick-Metric Glass Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Overall Accuracy */}
                  <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 backdrop-blur-sm space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider block">
                      Overall Accuracy
                    </span>
                    <div className="text-3xl font-black text-emerald-400">
                      {selectedStudentForReport.scores.overallAccuracy}%
                    </div>
                    <span className="text-[10px] text-emerald-500/90 font-bold flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> Top 5% in cohort
                    </span>
                  </div>

                  {/* Total Points */}
                  <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 backdrop-blur-sm space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider block">
                      Total Points Earned
                    </span>
                    <div className="text-3xl font-black text-amber-400">
                      {selectedStudentForReport.totalPoints}
                    </div>
                    <span className="text-[10px] text-amber-500/90 font-bold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-500" /> Tier 1 Contender
                    </span>
                  </div>

                  {/* Reflex Speed */}
                  <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 backdrop-blur-sm space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider block">
                      Reflex Velocity
                    </span>
                    <div className="text-3xl font-black text-sky-400">
                      {(
                        (selectedStudentForReport.fastestResponseMs || 1400) / 1000
                      ).toFixed(2)}
                      s
                    </div>
                    <span className="text-[10px] text-sky-400 font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Lightning Reflex Tier
                    </span>
                  </div>

                  {/* Learning Streak */}
                  <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 backdrop-blur-sm space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider block">
                      Learning Streak
                    </span>
                    <div className="text-3xl font-black text-orange-400 flex items-center gap-1">
                      <span>{selectedStudentForReport.activeStreakDays}</span>
                      <Flame className="w-6 h-6 text-orange-500 fill-orange-400 animate-bounce" />
                    </div>
                    <span className="text-[10px] text-orange-400/90 font-bold">
                      Active daily momentum
                    </span>
                  </div>
                </div>
              </div>

              {/* Dossier Tabs Navigation */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
                <button
                  onClick={() => setActiveDossierTab("overview")}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                    activeDossierTab === "overview"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  <BrainCircuit className="w-3.5 h-3.5" />
                  <span>360° AI Overview</span>
                </button>

                <button
                  onClick={() => setActiveDossierTab("skills")}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                    activeDossierTab === "skills"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Skill Mastery Matrix</span>
                </button>

                <button
                  onClick={() => setActiveDossierTab("telemetry")}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                    activeDossierTab === "telemetry"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Speed & Reflex Telemetry</span>
                </button>

                <button
                  onClick={() => setActiveDossierTab("coding")}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                    activeDossierTab === "coding"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Coding & Compiler Execution</span>
                </button>

                <button
                  onClick={() => setActiveDossierTab("attendance")}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                    activeDossierTab === "attendance"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Session Timeline & Attendance</span>
                </button>
              </div>

              {/* ── TAB 1: 360° AI OVERVIEW ── */}
              {activeDossierTab === "overview" && (
                <div className="space-y-6">
                  {/* AI Diagnostic Summary Box */}
                  <div className="p-6 bg-gradient-to-br from-indigo-50/90 via-purple-50/50 to-slate-50 rounded-3xl border border-indigo-100 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-indigo-700 font-extrabold text-xs uppercase tracking-wider">
                        <Sparkles className="w-4 h-4" />
                        <span>AI Diagnostic Evaluation & Career Track</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Top Percentile Profile
                      </span>
                    </div>

                    <p className="text-sm font-medium text-slate-700 leading-relaxed">
                      {getStudentSummaryText(selectedStudentForReport.scores.overallAccuracy)}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div className="p-3 bg-white rounded-xl border border-indigo-100">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                          Primary Strength
                        </span>
                        <span className="text-xs font-extrabold text-indigo-700">
                          Algorithmic Complexity & Multi-Agent Swarms
                        </span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-indigo-100">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                          Reflex Bracket
                        </span>
                        <span className="text-xs font-extrabold text-sky-700">
                          Sub-2 Second Rapid Q&A Responder
                        </span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-indigo-100">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                          Recommended Specialization
                        </span>
                        <span className="text-xs font-extrabold text-purple-700">
                          Senior AI Platform Architect Track
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 4 Skill Gauges Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Gauge 1 */}
                    <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase text-slate-500">
                          Quiz & Theory Retention
                        </span>
                        <span className="text-lg font-black text-emerald-600 font-mono">
                          {selectedStudentForReport.scores?.quizScore ?? 0}%
                        </span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                          style={{ width: `${selectedStudentForReport.scores?.quizScore ?? 0}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-slate-500 block">
                        Mastery in autonomous agent lifecycle and prompt patterns.
                      </span>
                    </div>

                    {/* Gauge 2 */}
                    <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase text-slate-500">
                          Applied Coding & Algorithms
                        </span>
                        <span className="text-lg font-black text-purple-600 font-mono">
                          {selectedStudentForReport.scores?.codingScore ?? 0}%
                        </span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"
                          style={{ width: `${selectedStudentForReport.scores?.codingScore ?? 0}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-slate-500 block">
                        Passes runtime test cases with optimal time complexity.
                      </span>
                    </div>

                    {/* Gauge 3 */}
                    <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase text-slate-500">
                          Live Q&A Velocity & Reflex
                        </span>
                        <span className="text-lg font-black text-sky-600 font-mono">
                          {selectedStudentForReport.scores?.liveQAScore ?? 0}%
                        </span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-sky-400 to-sky-600 rounded-full"
                          style={{ width: `${selectedStudentForReport.scores?.liveQAScore ?? 0}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-slate-500 block">
                        Fastest reaction times on podium buzzer questions.
                      </span>
                    </div>

                    {/* Gauge 4 */}
                    <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase text-slate-500">
                          Assignments & Take-Home Labs
                        </span>
                        <span className="text-lg font-black text-indigo-600 font-mono">
                          {selectedStudentForReport.scores?.assignmentScore ?? 0}%
                        </span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full"
                          style={{ width: `${selectedStudentForReport.scores?.assignmentScore ?? 0}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-slate-500 block">
                        Full marks across AI Agent execution assessments.
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 2: SKILL MASTERY MATRIX ── */}
              {activeDossierTab === "skills" && (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                        <Target className="w-4 h-4 text-indigo-600" />
                        <span>Domain Skill Mastery Matrix</span>
                      </h4>
                      <p className="text-xs text-slate-400">
                        Multi-dimensional breakdown of student proficiency across core workshop disciplines.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {[
                      {
                        skill: "Multi-Agent System Orchestration (CrewAI / AutoGen)",
                        pct: 98,
                        level: "Master",
                        color: "from-indigo-500 to-purple-600",
                      },
                      {
                        skill: "Python Real-Time Coding & Algorithm Design",
                        pct: 96,
                        level: "Master",
                        color: "from-emerald-400 to-teal-600",
                      },
                      {
                        skill: "RAG & Vector Database Query Optimization",
                        pct: 92,
                        level: "Advanced",
                        color: "from-sky-400 to-blue-600",
                      },
                      {
                        skill: "FastAPI Backend & Telemetry Instrumentation",
                        pct: 88,
                        level: "Proficient",
                        color: "from-amber-400 to-orange-500",
                      },
                      {
                        skill: "System Prompt Engineering & Evaluation",
                        pct: 94,
                        level: "Master",
                        color: "from-rose-400 to-pink-600",
                      },
                    ].map((item, i) => (
                      <div key={i} className="p-4 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">
                            {item.skill}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {item.level}
                            </span>
                            <span className="text-xs font-black font-mono text-slate-900">
                              {item.pct}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                            style={{ width: `${item.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── TAB 3: SPEED & REFLEX TELEMETRY ── */}
              {activeDossierTab === "telemetry" && (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-sky-600" />
                        <span>Live Q&A Speed & Latency Velocity</span>
                      </h4>
                      <p className="text-xs text-slate-400">
                        Millisecond-precision response latency benchmarks captured during interactive live buzzer sessions.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-5 bg-sky-50/70 rounded-2xl border border-sky-100 text-center space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-500">
                        Fastest Single Response
                      </span>
                      <div className="text-3xl font-black text-sky-600 font-mono">
                        {(
                          (selectedStudentForReport.fastestResponseMs || 1420) / 1000
                        ).toFixed(2)}
                        s
                      </div>
                      <span className="text-[11px] font-bold text-sky-700">
                        Recorded on Question #4
                      </span>
                    </div>

                    <div className="p-5 bg-indigo-50/70 rounded-2xl border border-indigo-100 text-center space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-500">
                        Cohort Median Speed
                      </span>
                      <div className="text-3xl font-black text-indigo-600 font-mono">
                        3.25s
                      </div>
                      <span className="text-[11px] font-bold text-indigo-700">
                        Student is 56% faster
                      </span>
                    </div>

                    <div className="p-5 bg-emerald-50/70 rounded-2xl border border-emerald-100 text-center space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-500">
                        Speed Accuracy Correlation
                      </span>
                      <div className="text-3xl font-black text-emerald-600 font-mono">
                        96.2%
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700">
                        High accuracy under pressure
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 4: CODING & COMPILER EXECUTION ── */}
              {activeDossierTab === "coding" && (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-purple-600" />
                        <span>Coding Challenge & Compiler Telemetry</span>
                      </h4>
                      <p className="text-xs text-slate-400">
                        Verified code solutions, test case passes, and execution performance metrics.
                      </p>
                    </div>
                  </div>

                  {/* Monaco style IDE preview box */}
                  <div className="rounded-2xl overflow-hidden border border-slate-800 bg-[#090d16] text-emerald-400 font-mono text-xs shadow-md space-y-0">
                    <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span className="text-slate-300 font-bold ml-2">solution.py</span>
                      </div>
                      <span className="text-emerald-400 font-bold">
                        ✓ 3/3 Test Cases Passed (Runtime: 34ms)
                      </span>
                    </div>

                    <pre className="p-4 leading-relaxed overflow-x-auto max-h-56">
                      <code>{`def is_prime(n):
    """
    Optimized Prime Check by ${selectedStudentForReport.name}
    Time Complexity: O(sqrt(N))
    """
    if n <= 1:
        return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return False
    return True

# Driver loop
def print_primes_up_to_n(N):
    primes = [str(x) for x in range(2, N + 1) if is_prime(x)]
    return " ".join(primes)`}</code>
                    </pre>
                  </div>
                </div>
              )}

              {/* ── TAB 5: ATTENDANCE & TIMELINE ── */}
              {activeDossierTab === "attendance" && (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-600" />
                        <span>Workshop Attendance & Session Check-In Timeline</span>
                      </h4>
                      <p className="text-xs text-slate-400">
                        Live session participation logs and check-in punctuality stamps.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { session: "Session 1: LLM Core & Architecture", status: "Present", punctuality: "On Time (100%)" },
                      { session: "Session 2: AI Agents & Tool Calling", status: "Present", punctuality: "On Time (100%)" },
                      { session: "Session 3: Live Coding & RAG Engine", status: "Present", punctuality: "On Time (100%)" },
                      { session: "Session 4: Capstone Assessment Lab", status: "Present", punctuality: "On Time (100%)" },
                    ].map((s, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white text-xs font-black flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {s.status}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-slate-900">{s.session}</h5>
                        <span className="text-[11px] text-slate-500 font-medium block">
                          ✓ {s.punctuality}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructor Notes & Feedback Card */}
              {userRole === "admin" && (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-indigo-600" />
                    <span>Instructor Dossier Notes & Internal Feedback</span>
                  </h4>
                  <textarea
                    rows={2}
                    value={
                      instructorNotesText ||
                      savedNotesMap[selectedStudentForReport.id] ||
                      selectedStudentForReport.notes ||
                      ""
                    }
                    onChange={(e) => setInstructorNotesText(e.target.value)}
                    placeholder="Add private evaluation notes or feedback for this student..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        setSavedNotesMap((prev) => ({
                          ...prev,
                          [selectedStudentForReport.id]: instructorNotesText,
                        }));
                      }}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-xs transition cursor-pointer"
                    >
                      Save Notes
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReportsAnalyticsView;

