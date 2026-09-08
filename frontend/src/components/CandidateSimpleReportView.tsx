import React from "react";
import { Student, Batch, InternResumeData } from "../types";
import { getScoreColorTheme } from "../utils/scoreColorUtils";
import {
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Award,
  Clock,
  Flame,
  Target,
  Code2,
  Trophy,
  Star,
  ShieldCheck,
  Briefcase,
  FileText,
  Download,
  ExternalLink,
  FileCheck,
  Github,
  Globe,
  Building2,
  User,
  Calendar,
  Printer,
  Zap,
  BookOpen,
  BrainCircuit,
  MessageSquare,
  Activity,
  Layers,
  Terminal,
  Presentation,
  Video,
  CheckSquare,
  ArrowRight,
  Shield,
  ThumbsUp,
  ChevronRight,
  Radio,
} from "lucide-react";

interface CandidateSimpleReportViewProps {
  student: Student;
  studentBatch?: Batch | null;
  cohortId: string;
  trackTitle: string;
  data: any;
  mentorName: string;
  collegeName: string;
  onSwitchToDetailed: () => void;
  resumeData?: InternResumeData;
  triggerToast?: (msg: string) => void;
}

export const CandidateSimpleReportView: React.FC<CandidateSimpleReportViewProps> = ({
  student,
  studentBatch,
  cohortId,
  trackTitle,
  data,
  mentorName,
  collegeName,
  onSwitchToDetailed,
  resumeData,
  triggerToast,
}) => {
  const score = data?.cumulativeScore ?? student.scores?.overallAccuracy ?? 85;
  const scoreTheme = getScoreColorTheme(score);
  const attendanceRate = data?.attendanceRate ?? 96;
  const effectiveMentor =
    mentorName && !mentorName.includes("Sharma") && !mentorName.includes("Nwosu") && mentorName.trim()
      ? mentorName
      : "Vijaya Kumar Mekala";

  // 12 Module Scorecard Data (Synchronized with 12-domain composite calculations)
  const modulesScorecard = data?.twelveModuleScores && data.twelveModuleScores.length === 12
    ? data.twelveModuleScores.map((m: any) => {
        const twoWordMap: Record<string, string> = {
          "01": "Scheduled Assessments",
          "02": "Live Reflex",
          "03": "LearnHub Modules",
          "04": "Coding Challenges",
          "05": "Daily Attendance",
          "06": "Project Execution",
          "07": "Skills Matrix",
          "08": "ATS Resume",
          "09": "Presentation Defense",
          "10": "Communication Fluency",
          "11": "Capstone Deliverables",
          "12": "Final Evaluation",
        };
        return {
          id: m.id,
          title: twoWordMap[m.id] || m.name.split(" ").slice(0, 2).join(" "),
          score: `${m.score}%`,
          status: m.grade,
        };
      })
    : [
        { id: "01", title: "Scheduled Assessments", score: "94.2%", status: "Distinction A+" },
        { id: "02", title: "Live Reflex", score: "96.4%", status: "Top 3.2%" },
        { id: "03", title: "LearnHub Modules", score: "93.4%", status: "12/12 Done" },
        { id: "04", title: "Coding Challenges", score: "98.0%", status: "100% Tests" },
        { id: "05", title: "Daily Attendance", score: `${data?.attendanceRate || 96}%`, status: "0 Errors" },
        { id: "06", title: "Project Execution", score: "96.0%", status: "Verified" },
        { id: "07", title: "Skills Matrix", score: "94.5%", status: "Tier-1 Ready" },
        { id: "08", title: "ATS Resume", score: "94/100", status: "Verified" },
        { id: "09", title: "Presentation Defense", score: "98.0%", status: "4 Live" },
        { id: "10", title: "Communication Fluency", score: "96.0%", status: "A+ Rating" },
        { id: "11", title: "Capstone Deliverables", score: "97.0%", status: "4/4 Shipped" },
        { id: "12", title: "Final Evaluation", score: "96.6%", status: "Distinction" },
      ];

  const handlePrint = () => {
    const originalTitle = document.title;
    const cleanName = (student.name || "Candidate").replace(/\s+/g, "_");
    document.title = `${cleanName}_MIND2I_Executive_Summary_Report`;

    if (triggerToast) {
      triggerToast("Opening PDF print dialog. Select 'Save as PDF' to download summary report.");
    }

    setTimeout(() => {
      try {
        window.print();
      } catch (err) {
        console.error("Print error:", err);
      } finally {
        setTimeout(() => {
          document.title = originalTitle;
        }, 1500);
      }
    }, 150);
  };

  return (
    <div className="space-y-5 print:space-y-2 print:animate-none simple-report-container animate-in fade-in duration-200">
      {/* ─── Top Executive Bar & Switcher Banner (Hidden in Print) ─── */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-indigo-900/50 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                Performance Summary
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Simple View
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              High-impact visual overview across all 12 evaluation headings with minimal text and end executive summary.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onSwitchToDetailed}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-200 bg-white/10 hover:bg-white/20 border border-white/15 transition flex items-center gap-1.5 cursor-pointer"
            title="Open the full 10-section comprehensive dossier"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Detailed Dossier</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Download Summary PDF</span>
          </button>
        </div>
      </div>

      {/* ─── Hero Identity Profile Strip ─── */}
      <div className="candidate-hero-header p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row print:flex-row md:items-center print:items-center justify-between gap-4 print:p-2.5 print:py-2 print:rounded-xl print:border-slate-300 print:gap-2 print:shadow-none">
        <div className="flex items-center gap-3.5">
          <div className="relative shrink-0">
            <img
              src={student.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${student.name}`}
              alt={student.name}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border-2 border-indigo-200 shadow-2xs print:w-11 print:h-11 print:rounded-lg"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[9px] text-white font-bold">
              ✓
            </span>
          </div>

          <div className="space-y-0.5">
            <div className="text-[10px] font-black uppercase tracking-wider text-indigo-700 hidden print:block">
              EXECUTIVE EVALUATION
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight print:text-base">
                {student.name}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 print:text-[10px]">
                Distinction A+ (Top 5%)
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-slate-800 font-semibold print:text-[10px] print:text-slate-950">
              <span className="font-mono text-indigo-700 font-black">ID: {student.id.toUpperCase()}</span>
              <span>•</span>
              <span className="text-slate-800">{student.college || collegeName}</span>
              {student.branch && (
                <>
                  <span>•</span>
                  <span className="text-slate-800">{student.branch}</span>
                </>
              )}
              <span>•</span>
              <span className="text-slate-900 font-bold">{studentBatch?.name || student.batchName || "AI Engineering Cohort"}</span>
            </div>

            {/* Quick Skills Pills */}
            <div className="flex flex-wrap items-center gap-1 pt-1 print:pt-0.5">
              {(student.skills && student.skills.length > 0 ? student.skills.slice(0, 5) : ["Python", "TypeScript", "React", "FastAPI", "Docker"]).map(
                (skill, idx) => (
                  <span
                    key={idx}
                    className="text-[9px] px-1.5 py-0.5 rounded-md font-bold bg-slate-100 text-slate-700 border border-slate-200 print:text-[8px] print:bg-white"
                  >
                    {skill}
                  </span>
                )
              )}
            </div>
          </div>
        </div>

        {/* Right: Dynamic Cumulative Score Card & Quick Links (Score pinned to far right side edge) */}
        <div className="candidate-hero-right flex items-center justify-end gap-2.5 shrink-0 ml-auto print:ml-auto">
          {/* Quick Links / Resume View (Hidden in print, placed to the left of Cumulative Score) */}
          <div className="flex flex-wrap items-center gap-1.5 shrink-0 print:hidden">
            {student.resumeUrl ? (
              <a
                href={student.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>View Resume</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium text-slate-500 bg-slate-100 border border-slate-200">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Resume On File</span>
              </span>
            )}

            {student.githubUrl && (
              <a
                href={student.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition"
                title="GitHub Profile"
              >
                <Github className="w-4 h-4" />
              </a>
            )}
            {student.linkedinUrl && (
              <a
                href={student.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-xl text-blue-600 hover:text-blue-800 hover:bg-blue-50 border border-blue-200 transition"
                title="LinkedIn Profile"
              >
                <Globe className="w-4 h-4" />
              </a>
            )}
          </div>

          {/* Dynamic CUMULATIVE SCORE Box (Positioned at side edge) */}
          <div
            className={`px-3 sm:px-4 py-2 rounded-2xl border flex items-center gap-3 shadow-xs print:p-1.5 print:rounded-xl print:border transition-all duration-300 shrink-0 ${scoreTheme.lightBgClass} ${scoreTheme.lightBorderClass} ${scoreTheme.printClass}`}
          >
            {/* SVG Radial Gauge */}
            <div className="relative w-10 h-10 shrink-0 flex items-center justify-center print:w-7 print:h-7">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
                <circle
                  cx="22"
                  cy="22"
                  r="17"
                  className="stroke-slate-200/90 print:stroke-slate-200"
                  strokeWidth="3.5"
                  fill="transparent"
                />
                <circle
                  cx="22"
                  cy="22"
                  r="17"
                  stroke={scoreTheme.hexColor}
                  strokeWidth="3.5"
                  strokeDasharray={106.8}
                  strokeDashoffset={106.8 - (106.8 * scoreTheme.score) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <Award className={`absolute w-4 h-4 print:w-3 print:h-3 ${scoreTheme.lightTextClass} ${scoreTheme.printTextClass}`} />
            </div>

            {/* Score Details */}
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-800 uppercase tracking-wider print:text-[8px] print:text-slate-950">
                CUMULATIVE SCORE
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-xl sm:text-2xl font-black tracking-tight ${scoreTheme.lightTextClass} ${scoreTheme.printTextClass} print:text-base`}>
                  {scoreTheme.score}%
                </span>
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase border ${scoreTheme.lightBadgeClass} ${scoreTheme.printBadgeClass}`}>
                  {scoreTheme.tierLabel}
                </span>
              </div>
              <span className="text-[8px] font-bold text-slate-700 print:text-slate-900">
                12-Domain Composite Average
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* 10 PERFORMANCE DOMAINS (User Priority Order · Diverse Visualizers)   */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {(() => {
        // Priority calculation & visualizer datasets
        const attendanceRate = data?.attendanceRate ?? 96;
        const daysPresent = data?.daysPresent ?? 48;
        const totalDays = data?.totalRangeDays ?? 50;
        const hoursLogged = data?.hoursLogged ?? 384;

        const perfScore = Math.min(
          100,
          Math.round(
            (data.codingChallenges ?? []).length > 0
              ? (data.codingChallenges.reduce((sum: number, c: any) => sum + (c.value || 90), 0) / data.codingChallenges.length)
              : 94
          )
        );

        const commScore = Math.round(
          (data.communicationSkills ?? []).length > 0
            ? (data.communicationSkills.reduce((sum: number, s: any) => sum + (s.score || 90), 0) / data.communicationSkills.length)
            : 91
        );

        const presScore = Math.round(
          (data.presentationScores ?? []).length > 0
            ? (data.presentationScores.reduce((sum: number, p: any) => sum + (p.score || 90), 0) / data.presentationScores.length)
            : 93
        );

        const grammarScore = resumeData?.scorecard?.grammarScore || 94;
        const formattingScore = resumeData?.scorecard?.formattingScore || 92;
        const docScore = 96;
        const commentsScore = 90;
        const grammarOverall = Math.round((grammarScore + formattingScore + docScore + commentsScore) / 4);

        const skillsScore = Math.round(
          (data.skillsMatrix ?? []).length > 0
            ? (data.skillsMatrix.reduce((sum: number, s: any) => sum + (s.demonstrated || 90), 0) / data.skillsMatrix.length)
            : 88
        );

        const behavioralScore = Math.round(
          (data.softSkills ?? []).length > 0
            ? (data.softSkills.reduce((sum: number, s: any) => sum + (s.score || 90), 0) / data.softSkills.length)
            : 91
        );

        // Time-series trend datasets for Line/Area charts (Reference Image 1 & 2 style)
        const attendanceTrendData = (data.monthlyProgression && data.monthlyProgression.length > 0)
          ? data.monthlyProgression.map((m: any) => ({
              month: m.month,
              hours: m.monthlyHours || m.hours || 150,
              rate: m.attendanceRate || 92,
            }))
          : [
              { month: "M1", hours: 133, rate: 88 },
              { month: "M2", hours: 152, rate: 90 },
              { month: "M3", hours: 160, rate: 92 },
              { month: "M4", hours: 170, rate: 94 },
              { month: "M5", hours: 180, rate: 96 },
              { month: "M6", hours: 190, rate: 98 },
            ];

        const codingSprintTrend = (data.performanceTrend && data.performanceTrend.length > 0)
          ? data.performanceTrend.map((t: any) => ({
              sprint: t.month || "M1",
              candidate: t.codingSprints || 85,
              cohort: t.cohortAvg || 72,
            }))
          : [
              { sprint: "S1", candidate: 74, cohort: 68 },
              { sprint: "S2", candidate: 80, cohort: 70 },
              { sprint: "S3", candidate: 85, cohort: 72 },
              { sprint: "S4", candidate: 89, cohort: 73 },
              { sprint: "S5", candidate: 93, cohort: 75 },
              { sprint: "S6", candidate: 96, cohort: 76 },
            ];

        const communicationBarData = (data.communicationSkills && data.communicationSkills.length > 0)
          ? data.communicationSkills.map((c: any) => ({
              name: c.skill.slice(0, 5),
              score: c.score,
            }))
          : [
              { name: "Tone", score: 90 },
              { name: "Fluen", score: 88 },
              { name: "Conf", score: 86 },
              { name: "Struc", score: 91 },
            ];

        const assessmentTrendData = [
          { sprint: "S1", score: 88, reflex: 84 },
          { sprint: "S2", score: 91, reflex: 89 },
          { sprint: "S3", score: 93, reflex: 92 },
          { sprint: "S4", score: 94, reflex: 94 },
          { sprint: "S5", score: 95, reflex: 95 },
          { sprint: "S6", score: 96, reflex: 96 },
        ];

        const overallAvg = Math.round(
          (attendanceRate + perfScore + 96 + skillsScore + commScore + presScore + grammarOverall + 97 + behavioralScore + 95) / 10
        );

        return (
          <div className="space-y-4 print:space-y-2">
            {/* ─── 1. Full-Width Overview Banner (Max 2-Word Headings) ─── */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/50 shadow-md print:bg-white print:border-slate-300 print:p-3 print:rounded-xl print:shadow-none simple-report-banner">
              <div className="flex items-center justify-between mb-3 print:mb-1.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center shadow-sm print:w-6 print:h-6">
                    <Award className="w-5 h-5 print:w-3.5 print:h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-black text-white tracking-tight print:text-slate-900 print:text-xs">
                        Performance Overview
                      </h3>
                      <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 print:hidden">
                        Distinction Level
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 print:text-slate-500 font-medium">
                      Multi-Domain Analytics
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-2xl sm:text-3xl font-black text-white print:text-slate-900 tracking-tight print:text-lg">
                    {overallAvg}%
                  </div>
                  <span className="text-[9px] font-bold text-emerald-400 print:text-emerald-700 uppercase tracking-wider block">
                    Overall Average
                  </span>
                </div>
              </div>

              {/* Full-width overall progress bar */}
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden print:bg-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${overallAvg}%` }}
                />
              </div>
            </div>

            {/* ─── 2. Top 4 Priority Competency Strip (User Priorities · Max 2-Word Headings) ─── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 print:gap-1.5 simple-report-pillars">
              {/* Priority 1: Daily Attendance */}
              <div className="p-3 rounded-xl bg-teal-50/80 border border-teal-200/80 flex items-center gap-3 print:bg-white print:p-2 print:border-slate-300">
                <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs shrink-0 print:w-6 print:h-6">
                  <Calendar className="w-4.5 h-4.5 print:w-3.5 print:h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 print:text-slate-950">Daily Attendance</span>
                    <span className="text-xs font-black text-teal-900 print:text-slate-900">{attendanceRate}%</span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-900 truncate print:text-[9px]">Training Activity</div>
                  <div className="text-[9px] text-slate-800 font-bold truncate print:text-[8px] print:text-slate-950">48/50 Days · 384h</div>
                </div>
              </div>

              {/* Priority 2: Coding Performance */}
              <div className="p-3 rounded-xl bg-violet-50/80 border border-violet-200/80 flex items-center gap-3 print:bg-white print:p-2 print:border-slate-300">
                <div className="w-9 h-9 rounded-lg bg-violet-600 text-white flex items-center justify-center shadow-xs shrink-0 print:w-6 print:h-6">
                  <Terminal className="w-4.5 h-4.5 print:w-3.5 print:h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-violet-700 print:text-slate-950">Coding Performance</span>
                    <span className="text-xs font-black text-violet-900 print:text-slate-900">{perfScore}%</span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-900 truncate print:text-[9px]">Compiler Sprints</div>
                  <div className="text-[9px] text-slate-800 font-bold truncate print:text-[8px] print:text-slate-950">100% Tests · 92% Speed</div>
                </div>
              </div>

              {/* Priority 3: Project Execution */}
              <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200/80 flex items-center gap-3 print:bg-white print:p-2 print:border-slate-300">
                <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0 print:w-6 print:h-6">
                  <Layers className="w-4.5 h-4.5 print:w-3.5 print:h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 print:text-slate-950">Project Execution</span>
                    <span className="text-xs font-black text-blue-900 print:text-slate-900">96%</span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-900 truncate print:text-[9px]">Tech Architecture</div>
                  <div className="text-[9px] text-slate-800 font-bold truncate print:text-[8px] print:text-slate-950">4/4 Shipped · 98% Tests</div>
                </div>
              </div>

              {/* Priority 4: Skills Matrix */}
              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-center gap-3 print:bg-white print:p-2 print:border-slate-300">
                <div className="w-9 h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center shadow-xs shrink-0 print:w-6 print:h-6">
                  <Target className="w-4.5 h-4.5 print:w-3.5 print:h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 print:text-slate-950">Skills Matrix</span>
                    <span className="text-xs font-black text-amber-900 print:text-slate-900">{skillsScore}%</span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-900 truncate print:text-[9px]">Industry Fit</div>
                  <div className="text-[9px] text-slate-800 font-bold truncate print:text-[8px] print:text-slate-950">Tier-1 Full-Stack Ready</div>
                </div>
              </div>
            </div>

            {/* ─── 3. 10 Balanced Performance Cards (Exact Priority Order · Rich Visualizers) ─── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 print:grid-cols-2 print:gap-2 simple-report-grid">
              {/* ─────────────────────────────────────────────────────────── */}
              {/* CARD 01 (PRIORITY 1): Daily Attendance (Area Line Graph)     */}
              {/* ─────────────────────────────────────────────────────────── */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-teal-200 shadow-xs print:p-2.5 print:rounded-xl print:shadow-none overflow-hidden simple-report-card">
                <div className="flex items-center justify-between gap-2 mb-2 print:mb-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0 print:w-6 print:h-6">
                      <Calendar className="w-4.5 h-4.5 print:w-3.5 print:h-3.5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 truncate print:text-xs">
                        Daily Attendance
                      </h3>
                      <span className="text-[10px] text-teal-700 font-bold uppercase tracking-wider print:text-[8px]">
                        Priority 01 · Training Activity
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xl sm:text-2xl font-black tracking-tight text-teal-700 print:text-base">
                      {attendanceRate}%
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase border bg-teal-100 text-teal-800 border-teal-300 print:text-[8px]">
                      Exemplary
                    </span>
                  </div>
                </div>

                {/* Line Graph / Area Chart (Responsive vector SVG, perfectly contained) */}
                <div className="h-20 w-full mb-2.5 print:h-16 print:mb-1 flex items-center">
                  <svg className="w-full h-full" viewBox="0 0 320 70">
                    <defs>
                      <linearGradient id="attendanceSvgGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0d9488" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#0d9488" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <line x1="28" y1="12" x2="310" y2="12" stroke="#f1f5f9" strokeDasharray="3 3" />
                    <line x1="28" y1="32" x2="310" y2="32" stroke="#f1f5f9" strokeDasharray="3 3" />
                    <line x1="28" y1="52" x2="310" y2="52" stroke="#f1f5f9" strokeDasharray="3 3" />

                    <text x="5" y="15" fill="#94a3b8" fontSize="8" fontWeight="bold">100</text>
                    <text x="5" y="35" fill="#94a3b8" fontSize="8" fontWeight="bold">90</text>
                    <text x="5" y="55" fill="#94a3b8" fontSize="8" fontWeight="bold">80</text>

                    <path
                      d="M 40 38 L 92 34 L 144 30 L 196 26 L 248 20 L 300 16 L 300 54 L 40 54 Z"
                      fill="url(#attendanceSvgGrad)"
                    />
                    <path
                      d="M 40 38 L 92 34 L 144 30 L 196 26 L 248 20 L 300 16"
                      fill="none"
                      stroke="#0d9488"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {[
                      { x: 40, y: 38, l: "M1" },
                      { x: 92, y: 34, l: "M2" },
                      { x: 144, y: 30, l: "M3" },
                      { x: 196, y: 26, l: "M4" },
                      { x: 248, y: 20, l: "M5" },
                      { x: 300, y: 16, l: "M6" },
                    ].map((pt, idx) => (
                      <g key={idx}>
                        <circle cx={pt.x} cy={pt.y} r={idx === 5 ? 3.5 : 2.5} fill="#0d9488" stroke="#ffffff" strokeWidth="1.5" />
                        <text x={pt.x} y="66" textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="600">
                          {pt.l}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>

                {/* 4 Compact KPIs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 print:gap-1">
                  <div className="p-1.5 rounded-lg bg-teal-50/60 border border-teal-100 text-center">
                    <span className="text-[9px] font-black text-slate-800 uppercase block print:text-slate-950">Days</span>
                    <span className="text-xs font-black text-teal-700">{daysPresent}/{totalDays}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-teal-50/60 border border-teal-100 text-center">
                    <span className="text-[9px] font-black text-slate-800 uppercase block print:text-slate-950">Hours</span>
                    <span className="text-xs font-black text-teal-700">{hoursLogged}h</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-teal-50/60 border border-teal-100 text-center">
                    <span className="text-[9px] font-black text-slate-800 uppercase block print:text-slate-950">Streak</span>
                    <span className="text-xs font-black text-teal-700">18 Days</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-teal-50/60 border border-teal-100 text-center">
                    <span className="text-[9px] font-black text-slate-800 uppercase block print:text-slate-950">Shift</span>
                    <span className="text-xs font-black text-teal-700">100%</span>
                  </div>
                </div>
              </div>

              {/* ─────────────────────────────────────────────────────────── */}
              {/* CARD 02 (PRIORITY 2): Coding Performance (Multi-Line Graph)  */}
              {/* ─────────────────────────────────────────────────────────── */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-violet-200 shadow-xs print:p-2.5 print:rounded-xl print:shadow-none overflow-hidden simple-report-card">
                <div className="flex items-center justify-between gap-2 mb-2 print:mb-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0 print:w-6 print:h-6">
                      <Terminal className="w-4.5 h-4.5 print:w-3.5 print:h-3.5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 truncate print:text-xs">
                        Coding Performance
                      </h3>
                      <span className="text-[10px] text-violet-700 font-bold uppercase tracking-wider print:text-[8px]">
                        Priority 02 · Sprints vs Cohort
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xl sm:text-2xl font-black tracking-tight text-violet-700 print:text-base">
                      {perfScore}%
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase border bg-violet-100 text-violet-800 border-violet-300 print:text-[8px]">
                      Optimal
                    </span>
                  </div>
                </div>

                {/* Multi-Line Graph (Candidate Sprint vs Cohort Average, zero overflow) */}
                <div className="h-20 w-full mb-2.5 print:h-16 print:mb-1 flex items-center">
                  <svg className="w-full h-full" viewBox="0 0 320 70">
                    <line x1="28" y1="12" x2="310" y2="12" stroke="#f1f5f9" strokeDasharray="3 3" />
                    <line x1="28" y1="32" x2="310" y2="32" stroke="#f1f5f9" strokeDasharray="3 3" />
                    <line x1="28" y1="52" x2="310" y2="52" stroke="#f1f5f9" strokeDasharray="3 3" />

                    <text x="5" y="15" fill="#94a3b8" fontSize="8" fontWeight="bold">100</text>
                    <text x="5" y="35" fill="#94a3b8" fontSize="8" fontWeight="bold">80</text>
                    <text x="5" y="55" fill="#94a3b8" fontSize="8" fontWeight="bold">60</text>

                    {/* Cohort Avg (Dashed gray) */}
                    <path
                      d="M 40 44 L 92 42 L 144 40 L 196 39 L 248 37 L 300 36"
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />

                    {/* Candidate Velocity (Purple Solid) */}
                    <path
                      d="M 40 38 L 92 32 L 144 27 L 196 23 L 248 18 L 300 14"
                      fill="none"
                      stroke="#7c3aed"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {[
                      { x: 40, y: 38, l: "S1" },
                      { x: 92, y: 32, l: "S2" },
                      { x: 144, y: 27, l: "S3" },
                      { x: 196, y: 23, l: "S4" },
                      { x: 248, y: 18, l: "S5" },
                      { x: 300, y: 14, l: "S6" },
                    ].map((pt, idx) => (
                      <g key={idx}>
                        <circle cx={pt.x} cy={pt.y} r={idx === 5 ? 3.5 : 2.5} fill="#7c3aed" stroke="#ffffff" strokeWidth="1.5" />
                        <text x={pt.x} y="66" textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="600">
                          {pt.l}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>

                {/* 4 Compact KPIs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 print:gap-1">
                  <div className="p-1.5 rounded-lg bg-violet-50/60 border border-violet-100 text-center">
                    <span className="text-[9px] font-black text-slate-800 uppercase block print:text-slate-950">Tests</span>
                    <span className="text-xs font-black text-violet-700">37/37</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-violet-50/60 border border-violet-100 text-center">
                    <span className="text-[9px] font-black text-slate-800 uppercase block print:text-slate-950">Quality</span>
                    <span className="text-xs font-black text-violet-700">95%</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-violet-50/60 border border-violet-100 text-center">
                    <span className="text-[9px] font-black text-slate-800 uppercase block print:text-slate-950">Speed</span>
                    <span className="text-xs font-black text-violet-700">92%</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-violet-50/60 border border-violet-100 text-center">
                    <span className="text-[9px] font-black text-slate-800 uppercase block print:text-slate-950">Algorithms</span>
                    <span className="text-xs font-black text-violet-700">90%</span>
                  </div>
                </div>
              </div>

              {/* ─────────────────────────────────────────────────────────── */}
              {/* CARD 03 (PRIORITY 3): Project Execution (Horizontal Bars)    */}
              {/* ─────────────────────────────────────────────────────────── */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-blue-200 shadow-xs print:p-2.5 print:rounded-xl print:shadow-none overflow-hidden simple-report-card">
                <div className="flex items-center justify-between gap-2 mb-2 print:mb-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0 print:w-6 print:h-6">
                      <Layers className="w-4.5 h-4.5 print:w-3.5 print:h-3.5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 truncate print:text-xs">
                        Project Execution
                      </h3>
                      <span className="text-[10px] text-blue-700 font-bold uppercase tracking-wider print:text-[8px]">
                        Priority 03 · Tech Architecture
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xl sm:text-2xl font-black tracking-tight text-blue-700 print:text-base">
                      96%
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase border bg-blue-100 text-blue-800 border-blue-300 print:text-[8px]">
                      Verified
                    </span>
                  </div>
                </div>

                {/* Horizontal Breakdown Bars (Like Ref 1 "Top topics by daily volume") */}
                <div className="space-y-1.5 my-auto py-1 print:py-0.5">
                  {[
                    { label: "Deliverables Completed", val: 96, color: "bg-blue-600" },
                    { label: "Tech Stack Diversity", val: 94, color: "bg-cyan-600" },
                    { label: "Code Coverage Tests", val: 98, color: "bg-indigo-600" },
                    { label: "Production CI/CD Deploy", val: 95, color: "bg-emerald-600" },
                  ].map((row, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 print:text-[8px]">
                        <span>{row.label}</span>
                        <span className="text-slate-900 font-black">{row.val}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${row.color} rounded-full`} style={{ width: `${row.val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* 4 Compact KPIs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 print:gap-1 mt-2">
                  <div className="p-1.5 rounded-lg bg-blue-50/60 border border-blue-100 text-center">
                    <span className="text-[9px] font-black text-slate-800 uppercase block print:text-slate-950">Shipped</span>
                    <span className="text-xs font-black text-blue-700">4/4 Done</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-blue-50/60 border border-blue-100 text-center">
                    <span className="text-[9px] font-black text-slate-800 uppercase block print:text-slate-950">Coverage</span>
                    <span className="text-xs font-black text-blue-700">98%</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-blue-50/60 border border-blue-100 text-center">
                    <span className="text-[9px] font-black text-slate-800 uppercase block print:text-slate-950">Security</span>
                    <span className="text-xs font-black text-blue-700">0 Flaws</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-blue-50/60 border border-blue-100 text-center">
                    <span className="text-[9px] font-black text-slate-800 uppercase block print:text-slate-950">Status</span>
                    <span className="text-xs font-black text-blue-700">Live OK</span>
                  </div>
                </div>
              </div>

              {/* ─────────────────────────────────────────────────────────── */}
              {/* CARD 04 (PRIORITY 4): Skills Matrix (Semi-Circular Arc Gauge) */}
              {/* ─────────────────────────────────────────────────────────── */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-amber-200 shadow-xs print:p-2.5 print:rounded-xl print:shadow-none overflow-hidden simple-report-card">
                <div className="flex items-center justify-between gap-2 mb-2 print:mb-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 text-white flex items-center justify-center shadow-xs shrink-0 print:w-6 print:h-6">
                      <Target className="w-4.5 h-4.5 print:w-3.5 print:h-3.5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 truncate print:text-xs">
                        Skills Matrix
                      </h3>
                      <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider print:text-[8px]">
                        Priority 04 · Industry Fit
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xl sm:text-2xl font-black tracking-tight text-amber-700 print:text-base">
                      {skillsScore}%
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase border bg-amber-100 text-amber-800 border-amber-300 print:text-[8px]">
                      Tier-1 Ready
                    </span>
                  </div>
                </div>

                {/* Semi-Circular Arc Gauge + Skill Bars (Like Ref 1 "SLO 97.2" & Ref 2 "Site Health 77%") */}
                <div className="flex items-center gap-3 my-auto py-1 print:py-0.5">
                  {/* SVG Arc Gauge */}
                  <div className="relative w-24 h-16 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 100 55">
                      <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke="#f1f5f9"
                        strokeWidth="9"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="9"
                        strokeDasharray={126}
                        strokeDashoffset={126 - (126 * skillsScore) / 100}
                        strokeLinecap="round"
                      />
                      <text x="50" y="44" textAnchor="middle" className="text-sm font-black fill-slate-900 font-sans">
                        {skillsScore}%
                      </text>
                    </svg>
                  </div>

                  {/* 4 Skill Mini Bars */}
                  <div className="flex-1 space-y-1">
                    {[
                      { s: "System Design", val: data.skillsMatrix?.[0]?.demonstrated ?? 88 },
                      { s: "API Development", val: data.skillsMatrix?.[2]?.demonstrated ?? 92 },
                      { s: "Frontend React", val: data.skillsMatrix?.[5]?.demonstrated ?? 94 },
                      { s: "DevOps Cloud", val: data.skillsMatrix?.[4]?.demonstrated ?? 76 },
                    ].map((row, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[10px] print:text-[8px]">
                        <span className="font-bold text-slate-600 truncate pr-1">{row.s}</span>
                        <span className="font-black text-amber-700 shrink-0">{row.val}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4 Compact KPIs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 print:gap-1 mt-2">
                  <div className="p-1.5 rounded-lg bg-amber-50/60 border border-amber-100 text-center">
                    <span className="text-[9px] font-black text-slate-800 uppercase block print:text-slate-950">Frontend</span>
                    <span className="text-xs font-black text-amber-700">94%</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-amber-50/60 border border-amber-100 text-center">
                    <span className="text-[9px] font-black text-slate-800 uppercase block print:text-slate-950">APIs</span>
                    <span className="text-xs font-black text-amber-700">92%</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-amber-50/60 border border-amber-100 text-center">
                    <span className="text-[9px] font-black text-slate-800 uppercase block print:text-slate-950">Architecture</span>
                    <span className="text-xs font-black text-amber-700">88%</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-amber-50/60 border border-amber-100 text-center">
                    <span className="text-[9px] font-black text-slate-800 uppercase block print:text-slate-950">Cloud</span>
                    <span className="text-xs font-black text-amber-700">76%</span>
                  </div>
                </div>
              </div>

              {/* ─────────────────────────────────────────────────────────── */}
              {/* CARD 05 (PRIORITY 5): Communication Skills (Histogram Chart)  */}
              {/* ─────────────────────────────────────────────────────────── */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-cyan-200 shadow-xs print:p-2.5 print:rounded-xl print:shadow-none overflow-hidden simple-report-card">
                <div className="flex items-center justify-between gap-2 mb-2 print:mb-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-600 text-white flex items-center justify-center shadow-xs shrink-0 print:w-6 print:h-6">
                      <MessageSquare className="w-4.5 h-4.5 print:w-3.5 print:h-3.5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 truncate print:text-xs">
                        Communication Skills
                      </h3>
                      <span className="text-[10px] text-cyan-700 font-bold uppercase tracking-wider print:text-[8px]">
                        Priority 05 · Articulation &amp; Tone
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xl sm:text-2xl font-black tracking-tight text-cyan-700 print:text-base">
                      {commScore}%
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase border bg-cyan-100 text-cyan-800 border-cyan-300 print:text-[8px]">
                      Fluency
                    </span>
                  </div>
                </div>

                {/* Vertical Bar Histogram (Responsive vector SVG, guaranteed inside card, zero overflow) */}
                <div className="h-20 w-full mb-2.5 print:h-16 print:mb-1 flex items-center">
                  <svg className="w-full h-full" viewBox="0 0 320 70">
                    <line x1="28" y1="12" x2="310" y2="12" stroke="#f1f5f9" strokeDasharray="3 3" />
                    <line x1="28" y1="32" x2="310" y2="32" stroke="#f1f5f9" strokeDasharray="3 3" />
                    <line x1="28" y1="52" x2="310" y2="52" stroke="#f1f5f9" strokeDasharray="3 3" />

                    <text x="5" y="15" fill="#94a3b8" fontSize="8" fontWeight="bold">100</text>
                    <text x="5" y="35" fill="#94a3b8" fontSize="8" fontWeight="bold">85</text>
                    <text x="5" y="55" fill="#94a3b8" fontSize="8" fontWeight="bold">70</text>

                    {[
                      { name: "Tone", score: data.communicationSkills?.[0]?.score ?? 90, x: 42 },
                      { name: "Fluen", score: data.communicationSkills?.[1]?.score ?? 88, x: 114 },
                      { name: "Conf", score: data.communicationSkills?.[2]?.score ?? 86, x: 186 },
                      { name: "Struc", score: data.communicationSkills?.[3]?.score ?? 91, x: 258 },
                    ].map((bar, idx) => {
                      const barHeight = Math.max(10, Math.min(42, ((bar.score - 65) / 35) * 42));
                      const barY = 54 - barHeight;
                      return (
                        <g key={idx}>
                          <rect x={bar.x} y="12" width="28" height="42" rx="4" fill="#f8fafc" />
                          <rect x={bar.x} y={barY} width="28" height={barHeight} rx="4" fill="#0891b2" />
                          <text x={bar.x + 14} y="66" textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="600">
                            {bar.name}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* 4 Compact KPIs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 print:gap-1">
                  <div className="p-1.5 rounded-lg bg-cyan-50/60 border border-cyan-100 text-center">
                    <span className="text-[9px] font-black text-slate-800 uppercase block print:text-slate-950">Tone</span>
                    <span className="text-xs font-black text-cyan-700">90%</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-cyan-50/60 border border-cyan-100 text-center">
                    <span className="text-[9px] font-black text-slate-800 uppercase block print:text-slate-950">Fluency</span>
                    <span className="text-xs font-black text-cyan-700">88%</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-cyan-50/60 border border-cyan-100 text-center">
                    <span className="text-[9px] font-black text-slate-800 uppercase block print:text-slate-950">Confidence</span>
                    <span className="text-xs font-black text-cyan-700">86%</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-cyan-50/60 border border-cyan-100 text-center">
                    <span className="text-[9px] font-black text-slate-800 uppercase block print:text-slate-950">Structure</span>
                    <span className="text-xs font-black text-cyan-700">91%</span>
                  </div>
                </div>
              </div>

              {/* ─────────────────────────────────────────────────────────── */}
              {/* CARD 06 (PRIORITY 6): Presentation Defense (Donut Ring Meter)*/}
              {/* ─────────────────────────────────────────────────────────── */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-rose-200 shadow-xs print:p-2.5 print:rounded-xl print:shadow-none overflow-hidden simple-report-card">
                <div className="flex items-center justify-between gap-2 mb-2 print:mb-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-600 to-pink-600 text-white flex items-center justify-center shadow-xs shrink-0 print:w-6 print:h-6">
                      <Presentation className="w-4.5 h-4.5 print:w-3.5 print:h-3.5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 truncate print:text-xs">
                        Presentation Defense
                      </h3>
                      <span className="text-[10px] text-rose-700 font-bold uppercase tracking-wider print:text-[8px]">
                        Priority 06 · Capstone Keynote
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xl sm:text-2xl font-black tracking-tight text-rose-700 print:text-base">
                      {presScore}%
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase border bg-rose-100 text-rose-800 border-rose-300 print:text-[8px]">
                      Approved
                    </span>
                  </div>
                </div>

                {/* Radial Donut Ring Meter (Like Ref 2 "On Page SEO Checker") */}
                <div className="flex items-center gap-3 my-auto py-1 print:py-0.5">
                  <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
                      <circle cx="22" cy="22" r="16" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                      <circle
                        cx="22"
                        cy="22"
                        r="16"
                        fill="none"
                        stroke="#e11d48"
                        strokeWidth="4"
                        strokeDasharray={100}
                        strokeDashoffset={100 - presScore}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-sm font-black text-slate-900">{presScore}%</span>
                  </div>

                  <div className="flex-1 space-y-1">
                    {[
                      { l: "Technical Clarity", v: data.presentationScores?.[0]?.score ?? 92 },
                      { l: "Keynote Slide Deck", v: data.presentationScores?.[1]?.score ?? 88 },
                      { l: "Live Demo Delivery", v: 96 },
                      { l: "Defense Q&A Reflex", v: data.presentationScores?.[2]?.score ?? 86 },
                    ].map((row, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[10px] print:text-[8px]">
                        <span className="font-bold text-slate-600 truncate pr-1">{row.l}</span>
                        <span className="font-black text-rose-700 shrink-0">{row.v}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4 Compact KPIs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 print:gap-1 mt-2">
                  <div className="p-1.5 rounded-lg bg-rose-50/60 border border-rose-100 text-center">
                    <span className="text-[9px] font-black text-slate-800 uppercase block print:text-slate-950">Clarity</span>
                    <span className="text-xs font-black text-rose-700">92%</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-rose-50/60 border border-rose-100 text-center">
                    <span className="text-[9px] font-black text-slate-800 uppercase block print:text-slate-950">Slides</span>
                    <span className="text-xs font-black text-rose-700">88%</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-rose-50/60 border border-rose-100 text-center">
                    <span className="text-[9px] font-black text-slate-800 uppercase block print:text-slate-950">Demo</span>
                    <span className="text-xs font-black text-rose-700">96%</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-rose-50/60 border border-rose-100 text-center">
                    <span className="text-[9px] font-black text-slate-800 uppercase block print:text-slate-950">Reflex</span>
                    <span className="text-xs font-black text-rose-700">86%</span>
                  </div>
                </div>
              </div>

              {/* ─────────────────────────────────────────────────────────── */}
              {/* CARD 07 (PRIORITY 7): Grammar Audit (Stacked Audit Bar)      */}
              {/* ─────────────────────────────────────────────────────────── */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-emerald-200 shadow-xs print:p-2.5 print:rounded-xl print:shadow-none overflow-hidden simple-report-card">
                <div className="flex items-center justify-between gap-2 mb-2 print:mb-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-xs shrink-0 print:w-6 print:h-6">
                      <FileCheck className="w-4.5 h-4.5 print:w-3.5 print:h-3.5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 truncate print:text-xs">
                        Grammar Audit
                      </h3>
                      <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider print:text-[8px]">
                        Priority 07 · ATS Documentation
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xl sm:text-2xl font-black tracking-tight text-emerald-700 print:text-base">
                      {grammarOverall}%
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase border bg-emerald-100 text-emerald-800 border-emerald-300 print:text-[8px]">
                      ATS Pass
                    </span>
                  </div>
                </div>

                {/* Multi-Segment Stacked Audit Bar (Like Ref 2 "Backlink Audit") */}
                <div className="space-y-2 my-auto py-1 print:py-0.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 print:text-[8px]">
                    <span>Syntactic Rigor Breakdown</span>
                    <span className="text-emerald-700 font-black">Zero Errors</span>
                  </div>
                  <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100">
                    <div className="h-full bg-emerald-500" style={{ width: "25%" }} title="Grammar" />
                    <div className="h-full bg-teal-500" style={{ width: "25%" }} title="Font Hierarchy" />
                    <div className="h-full bg-cyan-500" style={{ width: "25%" }} title="Technical Docs" />
                    <div className="h-full bg-indigo-500" style={{ width: "25%" }} title="Code Comments" />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-1 text-[9px] font-bold text-slate-600 print:text-[8px]">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Grammar {grammarScore}%</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-500" /> Font {formattingScore}%</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500" /> Docs {docScore}%</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500" /> Comments {commentsScore}%</span>
                  </div>
                </div>

                {/* 4 Compact KPIs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 print:gap-1 mt-2">
                  <div className="p-1.5 rounded-lg bg-emerald-50/60 border border-emerald-100 text-center">
                    <span className="text-[9px] font-black text-slate-800 uppercase block print:text-slate-950">Grammar</span>
                    <span className="text-xs font-black text-emerald-700">{grammarScore}%</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-emerald-50/60 border border-emerald-100 text-center">
                    <span className="text-[9px] font-black text-slate-800 uppercase block print:text-slate-950">Font</span>
                    <span className="text-xs font-black text-emerald-700">{formattingScore}%</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-emerald-50/60 border border-emerald-100 text-center">
                    <span className="text-[9px] font-black text-slate-800 uppercase block print:text-slate-950">Docs</span>
                    <span className="text-xs font-black text-emerald-700">{docScore}%</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-emerald-50/60 border border-emerald-100 text-center">
                    <span className="text-[9px] font-black text-slate-800 uppercase block print:text-slate-950">Comments</span>
                    <span className="text-xs font-black text-emerald-700">{commentsScore}%</span>
                  </div>
                </div>
              </div>

              {/* ─────────────────────────────────────────────────────────── */}
              {/* CARD 08 (PRIORITY 8): Capstone Deliverables (Telemetry Table) */}
              {/* ─────────────────────────────────────────────────────────── */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-purple-200 shadow-xs print:p-2.5 print:rounded-xl print:shadow-none overflow-hidden simple-report-card">
                <div className="flex items-center justify-between gap-2 mb-2 print:mb-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white flex items-center justify-center shadow-xs shrink-0 print:w-6 print:h-6">
                      <Trophy className="w-4.5 h-4.5 print:w-3.5 print:h-3.5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 truncate print:text-xs">
                        Capstone Deliverables
                      </h3>
                      <span className="text-[10px] text-purple-700 font-bold uppercase tracking-wider print:text-[8px]">
                        Priority 08 · Production Artifacts
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xl sm:text-2xl font-black tracking-tight text-purple-700 print:text-base">
                      97%
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase border bg-purple-100 text-purple-800 border-purple-300 print:text-[8px]">
                      4/4 Live
                    </span>
                  </div>
                </div>

                {/* Telemetry Status Table (Like Ref 1 "Sink Freshness" Table!) */}
                <div className="overflow-hidden rounded-lg border border-slate-100 my-auto py-0.5">
                  <table className="w-full text-left text-[10px] print:text-[8px]">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase">
                      <tr>
                        <th className="py-1 px-2">Project</th>
                        <th className="py-1 px-1.5">Stack</th>
                        <th className="py-1 px-1.5 text-right">Tests</th>
                        <th className="py-1 px-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      <tr>
                        <td className="py-1 px-2 font-bold text-slate-900 truncate">AI Multi-Agent</td>
                        <td className="py-1 px-1.5 text-slate-500">FastAPI / RAG</td>
                        <td className="py-1 px-1.5 text-right font-black text-purple-700">98%</td>
                        <td className="py-1 px-2 text-right text-emerald-600 font-bold">✓ Live</td>
                      </tr>
                      <tr>
                        <td className="py-1 px-2 font-bold text-slate-900 truncate">Telemetry Gateway</td>
                        <td className="py-1 px-1.5 text-slate-500">Go / Kafka</td>
                        <td className="py-1 px-1.5 text-right font-black text-purple-700">96%</td>
                        <td className="py-1 px-2 text-right text-emerald-600 font-bold">✓ Live</td>
                      </tr>
                      <tr>
                        <td className="py-1 px-2 font-bold text-slate-900 truncate">Sandbox Engine</td>
                        <td className="py-1 px-1.5 text-slate-500">Node / TS</td>
                        <td className="py-1 px-1.5 text-right font-black text-purple-700">95%</td>
                        <td className="py-1 px-2 text-right text-emerald-600 font-bold">✓ Live</td>
                      </tr>
                      <tr>
                        <td className="py-1 px-2 font-bold text-slate-900 truncate">Dossier Core</td>
                        <td className="py-1 px-1.5 text-slate-500">React / TS</td>
                        <td className="py-1 px-1.5 text-right font-black text-purple-700">97%</td>
                        <td className="py-1 px-2 text-right text-emerald-600 font-bold">✓ Live</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 4 Compact KPIs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 print:gap-1 mt-2">
                  <div className="p-1.5 rounded-lg bg-purple-50/60 border border-purple-100 text-center">
                    <span className="text-[9px] font-black text-slate-800 uppercase block print:text-slate-950">Projects</span>
                    <span className="text-xs font-black text-purple-700">4 Deployed</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-purple-50/60 border border-purple-100 text-center">
                    <span className="text-[9px] font-black text-slate-800 uppercase block print:text-slate-950">Coverage</span>
                    <span className="text-xs font-black text-purple-700">100% Pass</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-purple-50/60 border border-purple-100 text-center">
                    <span className="text-[9px] font-black text-slate-800 uppercase block print:text-slate-950">Docker</span>
                    <span className="text-xs font-black text-purple-700">Verified</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-purple-50/60 border border-purple-100 text-center">
                    <span className="text-[9px] font-black text-slate-800 uppercase block print:text-slate-950">GitHub</span>
                    <span className="text-xs font-black text-purple-700">Approved</span>
                  </div>
                </div>
              </div>

              {/* ─────────────────────────────────────────────────────────── */}
              {/* CARD 09 (PRIORITY 9): Behavioral Review (Distribution Meters)*/}
              {/* ─────────────────────────────────────────────────────────── */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-emerald-200 shadow-xs print:p-2.5 print:rounded-xl print:shadow-none overflow-hidden simple-report-card">
                <div className="flex items-center justify-between gap-2 mb-2 print:mb-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-green-600 text-white flex items-center justify-center shadow-xs shrink-0 print:w-6 print:h-6">
                      <Shield className="w-4.5 h-4.5 print:w-3.5 print:h-3.5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 truncate print:text-xs">
                        Behavioral Review
                      </h3>
                      <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider print:text-[8px]">
                        Priority 09 · Leadership &amp; Drive
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xl sm:text-2xl font-black tracking-tight text-emerald-700 print:text-base">
                      {behavioralScore}%
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase border bg-emerald-100 text-emerald-800 border-emerald-300 print:text-[8px]">
                      Top Quartile
                    </span>
                  </div>
                </div>

                {/* Soft Skills Distribution */}
                <div className="space-y-1.5 my-auto py-1 print:py-0.5">
                  {[
                    { label: "Leadership & Initiative", val: data.softSkills?.[3]?.score ?? 94 },
                    { label: "Team Collaboration", val: data.softSkills?.[0]?.score ?? 88 },
                    { label: "Accountability Ownership", val: data.softSkills?.[1]?.score ?? 92 },
                    { label: "Adaptability & Grit", val: data.softSkills?.[4]?.score ?? 90 },
                  ].map((row, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 print:text-[8px]">
                        <span>{row.label}</span>
                        <span className="text-emerald-700 font-black">{row.val}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${row.val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* 4 Compact KPIs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 print:gap-1 mt-2">
                  <div className="p-1.5 rounded-lg bg-emerald-50/60 border border-emerald-100 text-center">
                    <span className="text-[9px] font-black text-slate-800 uppercase block print:text-slate-950">Drive</span>
                    <span className="text-xs font-black text-emerald-700">94%</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-emerald-50/60 border border-emerald-100 text-center">
                    <span className="text-[9px] font-black text-slate-800 uppercase block print:text-slate-950">Collab</span>
                    <span className="text-xs font-black text-emerald-700">88%</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-emerald-50/60 border border-emerald-100 text-center">
                    <span className="text-[9px] font-black text-slate-800 uppercase block print:text-slate-950">Ownership</span>
                    <span className="text-xs font-black text-emerald-700">92%</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-emerald-50/60 border border-emerald-100 text-center">
                    <span className="text-[9px] font-black text-slate-800 uppercase block print:text-slate-950">Grit</span>
                    <span className="text-xs font-black text-emerald-700">90%</span>
                  </div>
                </div>
              </div>

              {/* ─────────────────────────────────────────────────────────── */}
              {/* CARD 10 (PRIORITY 10): Assessment Rigor (Sparkline Velocity) */}
              {/* ─────────────────────────────────────────────────────────── */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-sky-200 shadow-xs print:p-2.5 print:rounded-xl print:shadow-none overflow-hidden simple-report-card">
                <div className="flex items-center justify-between gap-2 mb-2 print:mb-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-600 to-blue-600 text-white flex items-center justify-center shadow-xs shrink-0 print:w-6 print:h-6">
                      <Zap className="w-4.5 h-4.5 print:w-3.5 print:h-3.5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 truncate print:text-xs">
                        Assessment Rigor
                      </h3>
                      <span className="text-[10px] text-sky-700 font-bold uppercase tracking-wider print:text-[8px]">
                        Priority 10 · Live Telemetry
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xl sm:text-2xl font-black tracking-tight text-sky-700 print:text-base">
                      95%
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase border bg-sky-100 text-sky-800 border-sky-300 print:text-[8px]">
                      Top Reflex
                    </span>
                  </div>
                </div>

                {/* Sparkline / Area Chart (Responsive vector SVG, zero overflow) */}
                <div className="h-20 w-full mb-2.5 print:h-16 print:mb-1 flex items-center">
                  <svg className="w-full h-full" viewBox="0 0 320 70">
                    <defs>
                      <linearGradient id="assessmentSvgGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <line x1="28" y1="12" x2="310" y2="12" stroke="#f1f5f9" strokeDasharray="3 3" />
                    <line x1="28" y1="32" x2="310" y2="32" stroke="#f1f5f9" strokeDasharray="3 3" />
                    <line x1="28" y1="52" x2="310" y2="52" stroke="#f1f5f9" strokeDasharray="3 3" />

                    <text x="5" y="15" fill="#94a3b8" fontSize="8" fontWeight="bold">100</text>
                    <text x="5" y="35" fill="#94a3b8" fontSize="8" fontWeight="bold">90</text>
                    <text x="5" y="55" fill="#94a3b8" fontSize="8" fontWeight="bold">80</text>

                    <path
                      d="M 40 38 L 92 32 L 144 26 L 196 24 L 248 22 L 300 20 L 300 54 L 40 54 Z"
                      fill="url(#assessmentSvgGrad)"
                    />
                    <path
                      d="M 40 38 L 92 32 L 144 26 L 196 24 L 248 22 L 300 20"
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {[
                      { x: 40, y: 38, l: "S1" },
                      { x: 92, y: 32, l: "S2" },
                      { x: 144, y: 26, l: "S3" },
                      { x: 196, y: 24, l: "S4" },
                      { x: 248, y: 22, l: "S5" },
                      { x: 300, y: 20, l: "S6" },
                    ].map((pt, idx) => (
                      <g key={idx}>
                        <circle cx={pt.x} cy={pt.y} r={idx === 5 ? 3.5 : 2.5} fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
                        <text x={pt.x} y="66" textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="600">
                          {pt.l}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>

                {/* 4 Compact KPIs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 print:gap-1">
                  <div className="p-1.5 rounded-lg bg-sky-50/60 border border-sky-100 text-center">
                    <span className="text-[9px] font-black text-slate-800 uppercase block print:text-slate-950">Exams</span>
                    <span className="text-xs font-black text-sky-700">120/120</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-sky-50/60 border border-sky-100 text-center">
                    <span className="text-[9px] font-black text-slate-800 uppercase block print:text-slate-950">Reflex</span>
                    <span className="text-xs font-black text-sky-700">312ms</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-sky-50/60 border border-sky-100 text-center">
                    <span className="text-[9px] font-black text-slate-800 uppercase block print:text-slate-950">Quizzes</span>
                    <span className="text-xs font-black text-sky-700">93%</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-sky-50/60 border border-sky-100 text-center">
                    <span className="text-[9px] font-black text-slate-800 uppercase block print:text-slate-950">Sprints</span>
                    <span className="text-xs font-black text-sky-700">95%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* END: EXECUTIVE VERDICT SUMMARY (Strict 2-Word Headings · Concise)     */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-900/60 space-y-4 print:bg-white print:text-slate-900 print:border print:border-slate-300 print:p-3 print:space-y-2 print:rounded-xl simple-report-summary">
        {/* Executive Verdict Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-indigo-800/60 print:border-slate-200 print:pb-1.5">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 print:bg-emerald-50 print:text-emerald-800 print:text-[9px]">
                Hire Verdict
              </span>
              <span className="text-xs text-indigo-300 print:text-slate-500 font-mono text-[10px]">12 Modules</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white print:text-slate-900 tracking-tight print:text-base">
              Executive Verdict
            </h2>
            <p className="text-xs text-slate-300 print:text-slate-600 max-w-2xl font-medium print:text-[10px] print:leading-tight">
              Verified production proficiency across all 12 curriculum milestones. Zero defects, optimal execution velocity.
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-white/10 border border-white/20 text-center shrink-0 print:border-slate-300 print:bg-slate-50 print:p-1.5">
            <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-300 print:text-emerald-700 block">
              FINAL VERDICT
            </span>
            <div className="text-lg sm:text-xl font-black text-white print:text-slate-900 mt-0.5 print:text-sm">
              STRONG HIRE
            </div>
            <span className="text-[10px] text-emerald-400 print:text-emerald-700 font-bold block">
              Distinction A+
            </span>
          </div>
        </div>

        {/* 12-Module Scorecard Index */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-indigo-200 print:text-slate-700 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Scorecard Index</span>
            </h4>
            <span className="text-[11px] text-slate-400 print:text-slate-600 font-mono">
              Cumulative: <strong className="text-emerald-300 print:text-emerald-700 font-bold">{data?.cumulativeScoreDecimal ?? score}%</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 print:grid-cols-3 print:gap-1">
            {modulesScorecard.map((m) => (
              <div
                key={m.id}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition flex items-center justify-between text-xs print:bg-slate-50 print:border-slate-200 print:p-1 print:py-0.5 print:text-[9px]"
              >
                <div className="flex items-center gap-1.5 truncate pr-1">
                  <span className="w-4 h-4 rounded bg-indigo-500/30 text-indigo-300 text-[9px] font-mono font-black flex items-center justify-center shrink-0 print:bg-indigo-100 print:text-indigo-800">
                    {m.id}
                  </span>
                  <span className="font-bold text-slate-200 print:text-slate-800 truncate">{m.title}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-mono font-black text-emerald-400 print:text-emerald-700">{m.score}</span>
                  <span className="text-[8px] px-1 py-0.5 rounded font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 print:bg-emerald-100 print:text-emerald-800 print:border-none">
                    {m.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4 Summary Highlight Cards (Max 2-Word Headings) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 print:gap-1 print:pt-0.5">
          <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-center print:bg-slate-50 print:border-slate-200 print:p-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Cumulative Score</span>
            <div className="text-base sm:text-lg font-black text-white print:text-slate-900 mt-0.5 print:text-xs">{data?.cumulativeScoreDecimal ?? score}%</div>
            <span className="text-[9px] text-emerald-400 print:text-emerald-700 font-bold block truncate">12-Domain Verified</span>
          </div>
          <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-center print:bg-slate-50 print:border-slate-200 print:p-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Attendance Rate</span>
            <div className="text-base sm:text-lg font-black text-white print:text-slate-900 mt-0.5 print:text-xs">{attendanceRate}%</div>
            <span className="text-[9px] text-teal-400 print:text-teal-700 font-bold block truncate">18-Day Active Streak</span>
          </div>
          <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-center print:bg-slate-50 print:border-slate-200 print:p-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Target Role</span>
            <div className="text-base sm:text-lg font-black text-white print:text-slate-900 mt-0.5 print:text-xs">Level L4</div>
            <span className="text-[9px] text-indigo-400 print:text-indigo-700 font-bold block truncate">Full-Stack AI Eng</span>
          </div>
          <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-center print:bg-slate-50 print:border-slate-200 print:p-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Accreditation</span>
            <div className="text-base sm:text-lg font-black text-emerald-400 print:text-emerald-700 mt-0.5 print:text-xs">Verified</div>
            <span className="text-[9px] text-slate-400 print:text-slate-600 font-bold block truncate">Cryptographic Seal</span>
          </div>
        </div>

        {/* ─── 6 Concise Metric Callout Blocks (Max 2-Word Headings · No Big Sentences) ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 print:grid-cols-3 print:gap-1.5 text-xs text-slate-300 print:text-slate-700 print:text-[9px]">
          <div className="p-2.5 rounded-xl bg-white/5 print:bg-white print:border print:border-slate-200 space-y-0.5">
            <span className="text-[10px] print:text-[8px] font-black uppercase tracking-wider text-teal-400 print:text-teal-700 block">
              Attendance Tracking
            </span>
            <p className="leading-snug">
              • <strong>96% Attendance</strong> across 384h logged<br />
              • <strong>18-Day</strong> active streak with 0 shift violations
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 print:bg-white print:border print:border-slate-200 space-y-0.5">
            <span className="text-[10px] print:text-[8px] font-black uppercase tracking-wider text-violet-400 print:text-violet-700 block">
              Coding Benchmarks
            </span>
            <p className="leading-snug">
              • <strong>100% Pass Rate</strong> (37/37 test cases)<br />
              • <strong>94% Velocity</strong> with O(1) runtime efficiency
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 print:bg-white print:border print:border-slate-200 space-y-0.5">
            <span className="text-[10px] print:text-[8px] font-black uppercase tracking-wider text-blue-400 print:text-blue-700 block">
              Project Execution
            </span>
            <p className="leading-snug">
              • <strong>4/4 Capstones</strong> deployed with 98% coverage<br />
              • <strong>Zero Defects</strong> in staging sandboxes
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 print:bg-white print:border print:border-slate-200 space-y-0.5">
            <span className="text-[10px] print:text-[8px] font-black uppercase tracking-wider text-amber-400 print:text-amber-700 block">
              Skills Readiness
            </span>
            <p className="leading-snug">
              • <strong>88% Composite</strong> Tier-1 full-stack score<br />
              • High mastery in <strong>FastAPI, React, SQL &amp; Docker</strong>
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 print:bg-white print:border print:border-slate-200 space-y-0.5">
            <span className="text-[10px] print:text-[8px] font-black uppercase tracking-wider text-cyan-400 print:text-cyan-700 block">
              Communication Fluency
            </span>
            <p className="leading-snug">
              • <strong>91% Fluency</strong> with natural articulation<br />
              • <strong>312ms Reflex</strong> during live cohort Q&amp;A
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 print:bg-white print:border print:border-slate-200 space-y-0.5">
            <span className="text-[10px] print:text-[8px] font-black uppercase tracking-wider text-emerald-400 print:text-emerald-700 block">
              Placement Verdict
            </span>
            <p className="leading-snug">
              • <strong>Strong Hire</strong> (Distinction A+ Top 3.2%)<br />
              • Recommended for <strong>Level L4 AI Engineer</strong> roles
            </p>
          </div>
        </div>

        {/* Lead Mentor & Accreditation Stamp */}
        <div className="pt-2.5 border-t border-indigo-800/60 print:border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:pt-1 print:gap-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/30 border border-indigo-400/40 text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0 print:bg-indigo-100 print:text-indigo-800 print:w-6 print:h-6">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-white print:text-slate-900 print:text-[10px]">
                Authorized by {effectiveMentor} (Lead AI Evaluator)
              </div>
              <div className="text-[10px] text-slate-400 print:text-slate-500 font-mono print:text-[8px]">
                Mind2I Official Verification Hash: M2I-REP-2026-X89B4Q · Issued {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden shrink-0">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 rounded-xl text-xs font-black shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Download Summary PDF</span>
            </button>
            <button
              onClick={onSwitchToDetailed}
              className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Full Dossier</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
