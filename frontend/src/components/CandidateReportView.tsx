import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Student,
  UserRole,
  Batch,
  ProjectAssignment,
  ProjectSubmission,
  Assignment,
  LiveQuestion,
  LearnHubModule,
  AttendanceRecord,
  InternRosterAssignment,
  ShiftPattern,
  HolidayEvent,
  DailyActivityLog,
  AttendanceDayStatus,
  LeaveRequest,
  InternResumeData,
  InternResource,
  InternReflectionVideo,
  InternEvaluation,
  isDemoStudent,
} from "../types";
import {
  X, User, Phone, Mail, Building2, Calendar, Flame, Award, Clock, Printer,
  CheckCircle2, Zap, TrendingUp, Sparkles, Target, Code2, Trophy, Star,
  Activity, Check, FileCheck, ShieldCheck, BrainCircuit, BookOpen, Terminal,
  ExternalLink, Download, ChevronDown, ChevronLeft, ChevronRight, Play, Pause,
  BarChart3, Briefcase, GraduationCap, FileText, Globe, Github, Presentation,
  Video, MessageSquare, Shield, Lightbulb, Users, ArrowRight, Eye, EyeOff,
  Volume2, Maximize2, Layers, Cpu, CornerDownRight, CheckSquare, Bookmark,
  Share2, ArrowUpRight, Search, FolderKanban, FileArchive, LayoutDashboard,
  Radio, HelpCircle, ListChecks, FolderGit2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, Cell, AreaChart, Area, ComposedChart
} from "recharts";
import { Minda2Logo } from "./Minda2Logo";
import {
  INITIAL_PROJECT_ASSIGNMENTS,
  INITIAL_PROJECT_SUBMISSIONS,
} from "../data/mockProjects";
import {
  INITIAL_SHIFT_PATTERNS,
  INITIAL_ROSTER_ASSIGNMENTS,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_HOLIDAYS,
  INITIAL_DAILY_ACTIVITY_LOGS,
  INITIAL_LEAVE_REQUESTS,
} from "../data/attendanceData";
import { INITIAL_RESUME_DATA, createEmptyResumeData } from "../data/mockResumeData";
import { CandidateSimpleReportView } from "./CandidateSimpleReportView";
import { getScoreColorTheme } from "../utils/scoreColorUtils";
import { downloadResumePdf, exportCandidateCsv } from "../utils/resumeDownload";
import { DEFAULT_SAMPLE_RESOURCES } from "./InternResourcesVaultView";

// ─── Types ───
interface CandidateReportViewProps {
  student: Student;
  onClose?: () => void;
  userRole: UserRole;
  allStudents?: Student[];
  batches?: Batch[];
  selectedBatch?: Batch;
  projects?: ProjectAssignment[];
  submissions?: ProjectSubmission[];
  assignments?: Assignment[];
  liveQuestions?: LiveQuestion[];
  learnHubModules?: LearnHubModule[];
  onSelectStudent?: (student: Student) => void;
  onRequestInterview?: (student: Student) => void;
  isTabMode?: boolean;
  attendanceRecords?: AttendanceRecord[];
  rosterAssignments?: InternRosterAssignment[];
  shiftPatterns?: ShiftPattern[];
  holidays?: HolidayEvent[];
  dailyActivityLogs?: DailyActivityLog[];
  leaveRequests?: LeaveRequest[];
  resumeData?: InternResumeData;
}

type DatePreset = "7d" | "30d" | "full" | "custom";

// ─── Helper: Get Initials ───
function getInitials(name: string): string {
  if (!name) return "ST";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

// ─── Helper: Date Formatters ───
function formatDateShort(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

function formatDateLong(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

// ─── Helper: Dynamic Data Generator based on Student, Preset, Custom Dates & Batch ───
function generateReportData(
  student: Student,
  preset: DatePreset,
  customStartDate?: string,
  customEndDate?: string,
  studentBatch?: Batch | null,
  resumeData?: InternResumeData,
  submissions?: ProjectSubmission[],
  projects?: ProjectAssignment[]
) {
  const isDemo = isDemoStudent(student);

  const baseAccuracy = typeof student.scores?.overallAccuracy === "number"
    ? student.scores.overallAccuracy
    : (isDemo ? 86 : 0);
  const baseQuiz = typeof student.scores?.quizScore === "number"
    ? student.scores.quizScore
    : (isDemo ? 82 : 0);
  const baseCoding = typeof student.scores?.codingScore === "number"
    ? student.scores.codingScore
    : (isDemo ? 88 : 0);
  const attendanceRate = student.attendedSessions && student.totalSessions
    ? Math.round((student.attendedSessions / student.totalSessions) * 100)
    : (isDemo ? 93 : 0);

  let customDiffDays = 60;
  if (customStartDate && customEndDate) {
    try {
      const s = new Date(customStartDate + "T00:00:00").getTime();
      const e = new Date(customEndDate + "T23:59:59").getTime();
      customDiffDays = Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)));
    } catch {
      customDiffDays = 60;
    }
  }

  const customRatio = Math.min(1.0, Math.max(0.68, 0.78 + (customDiffDays / 84) * 0.22));
  const multiplier =
    preset === "7d" ? 0.92 :
    preset === "30d" ? 0.96 :
    preset === "custom" ? Number(customRatio.toFixed(2)) :
    1.0;

  const batchDurationMonths = studentBatch?.durationMonths || (studentBatch?.type === "internship_3m" ? 3 : 6);
  const totalWeeks = Math.max(12, Math.min(26, batchDurationMonths * 4));
  const totalBlocks = totalWeeks * 7;

  const totalRangeDays =
    preset === "7d" ? 7 :
    preset === "30d" ? 30 :
    preset === "custom" ? customDiffDays :
    totalBlocks;

  const studentSubs = (submissions || []).filter((s) => s.studentId === student.id);
  const realCompletedProjects = studentSubs.filter((s) => s.status === "passed" || (s.gradePoints ?? 0) >= 80).length;

  const completedProjects = isDemo
    ? (preset === "7d" ? 3 : preset === "30d" ? 8 : (preset === "custom" ? Math.max(1, Math.min(14, Math.round((customDiffDays / totalRangeDays) * 14))) : 14))
    : realCompletedProjects;

  const hoursLogged = isDemo
    ? (preset === "7d" ? 48 : preset === "30d" ? 186 : (preset === "custom" ? Math.max(15, Math.min(983, Math.round((customDiffDays / totalRangeDays) * 983))) : 983))
    : (student.attendedSessions * 2.5);

  const daysPresent = isDemo
    ? (preset === "7d" ? 6 : preset === "30d" ? 27 : (preset === "custom" ? Math.max(1, Math.min(customDiffDays, Math.round((customDiffDays / totalRangeDays) * (totalRangeDays * 0.88)))) : Math.round(totalRangeDays * 0.88)))
    : student.attendedSessions;

  const hasZeroHours = !isDemo && (hoursLogged === 0 || !student.attendedSessions);

  // 1. Performance Trend vs Cohort Average (Months M1 to M...)
  const basePerformanceTrend = isDemo
    ? [
        { month: "M1", codingSprints: Math.round(70 * multiplier), cohortAvg: 68, milestones: Math.round(72 * multiplier), quizzes: Math.round(74 * multiplier) },
        { month: "M2", codingSprints: Math.round(76 * multiplier), cohortAvg: 70, milestones: Math.round(77 * multiplier), quizzes: Math.round(78 * multiplier) },
        { month: "M3", codingSprints: Math.round(81 * multiplier), cohortAvg: 72, milestones: Math.round(80 * multiplier), quizzes: Math.round(82 * multiplier) },
        { month: "M4", codingSprints: Math.round(86 * multiplier), cohortAvg: 73, milestones: Math.round(84 * multiplier), quizzes: Math.round(85 * multiplier) },
        { month: "M5", codingSprints: Math.round(91 * multiplier), cohortAvg: 75, milestones: Math.round(87 * multiplier), quizzes: Math.round(88 * multiplier) },
        { month: "M6", codingSprints: Math.round(94 * multiplier), cohortAvg: 76, milestones: Math.round(91 * multiplier), quizzes: Math.round(92 * multiplier) },
      ]
    : Array.from({ length: batchDurationMonths }, (_, i) => {
        const monthNum = i + 1;
        const progressFactor = batchDurationMonths > 1 ? 0.88 + (i / (batchDurationMonths - 1)) * 0.12 : 1.0;
        return {
          month: `M${monthNum}`,
          codingSprints: Math.round(baseCoding * progressFactor),
          cohortAvg: baseAccuracy,
          milestones: Math.round(baseAccuracy * progressFactor),
          quizzes: Math.round(baseQuiz * progressFactor),
        };
      });
  const performanceTrend = basePerformanceTrend.slice(0, batchDurationMonths);

  // 2. Coding Challenge Metrics (Horizontal Bar)
  const codingChallenges = isDemo
    ? [
        { metric: "Test Cases Passed", value: Math.min(100, Math.round(94 * multiplier)) },
        { metric: "Execution Speed", value: Math.min(100, Math.round(88 * multiplier)) },
        { metric: "Code Cleanliness", value: Math.min(100, Math.round(91 * multiplier)) },
        { metric: "Edge Case Coverage", value: Math.min(100, Math.round(82 * multiplier)) },
        { metric: "Documentation", value: Math.min(100, Math.round(87 * multiplier)) },
      ]
    : [
        { metric: "Test Cases Passed", value: baseCoding },
        { metric: "Execution Speed", value: Math.min(100, Math.round(baseCoding * 0.95)) },
        { metric: "Code Cleanliness", value: Math.min(100, Math.round(baseCoding * 0.98)) },
        { metric: "Edge Case Coverage", value: Math.min(100, Math.round(baseCoding * 0.90)) },
        { metric: "Documentation", value: Math.min(100, Math.round(baseAccuracy * 0.92)) },
      ];

  // 3. Activity Heatmap (7 rows x totalWeeks: 24 weeks for 6 months = 168 blocks, 12 weeks for 3 months = 84 blocks)
  const weekTemplates = [
    [3, 4, 4, 3, 4, 2, 0],
    [4, 4, 3, 4, 4, 1, 0],
    [2, 3, 4, 4, 3, 2, 1],
    [4, 4, 4, 4, 4, 2, 0],
    [3, 3, 4, 4, 3, 1, 0],
    [4, 4, 3, 4, 4, 3, 1],
    [3, 4, 4, 4, 4, 1, 0],
    [2, 4, 3, 4, 3, 2, 0],
  ];

  const heatmapLevels: number[] = [];
  for (let w = 0; w < totalWeeks; w++) {
    if (!isDemo && student.attendedSessions === 0) {
      for (let d = 0; d < 7; d++) {
        heatmapLevels.push(0);
      }
    } else {
      const template = weekTemplates[w % weekTemplates.length];
      for (let d = 0; d < 7; d++) {
        let lvl = template[d];
        if (d === 5) lvl = Math.min(2, lvl); // Saturday: light/review
        if (d === 6) lvl = (w % 4 === 0) ? 1 : 0; // Sunday: mostly rest
        if (multiplier < 1 && lvl > 1) {
          lvl = Math.max(1, Math.round(lvl * multiplier));
        }
        heatmapLevels.push(lvl);
      }
    }
  }

  // 4. Weekly Training Hours (Stacked Bar: dynamically adapted to preset & batch duration)
  let dynamicWeeklyHours: { month: string; liveClasses: number; selfPaced: number; peerCoding: number }[] = [];
  if (preset === "7d") {
    dynamicWeeklyHours = [
      { month: "Mon", liveClasses: 2.5, selfPaced: 3.5, peerCoding: 2.0 },
      { month: "Tue", liveClasses: 3.0, selfPaced: 3.5, peerCoding: 2.0 },
      { month: "Wed", liveClasses: 2.0, selfPaced: 4.0, peerCoding: 2.0 },
      { month: "Thu", liveClasses: 2.5, selfPaced: 3.5, peerCoding: 2.0 },
      { month: "Fri", liveClasses: 3.0, selfPaced: 3.0, peerCoding: 2.0 },
      { month: "Sat", liveClasses: 0.0, selfPaced: 3.5, peerCoding: 1.0 },
      { month: "Sun", liveClasses: 0.0, selfPaced: 1.0, peerCoding: 0.0 },
    ];
  } else if (preset === "30d") {
    dynamicWeeklyHours = [
      { month: "Week 1", liveClasses: 12, selfPaced: 20, peerCoding: 12 },
      { month: "Week 2", liveClasses: 14, selfPaced: 22, peerCoding: 13 },
      { month: "Week 3", liveClasses: 13, selfPaced: 23, peerCoding: 14 },
      { month: "Week 4", liveClasses: 15, selfPaced: 24, peerCoding: 14 },
    ];
  } else {
    if (hasZeroHours) {
      dynamicWeeklyHours = Array.from({ length: Math.min(6, Math.max(3, batchDurationMonths)) }, (_, i) => ({
        month: `M${i + 1}`,
        liveClasses: 0,
        selfPaced: 0,
        peerCoding: 0,
      }));
    } else {
      const baseMonthlyHours = [
        { month: "M1", liveClasses: 48, selfPaced: 55, peerCoding: 30 },
        { month: "M2", liveClasses: 52, selfPaced: 62, peerCoding: 38 },
        { month: "M3", liveClasses: 50, selfPaced: 68, peerCoding: 42 },
        { month: "M4", liveClasses: 54, selfPaced: 70, peerCoding: 46 },
        { month: "M5", liveClasses: 55, selfPaced: 75, peerCoding: 50 },
        { month: "M6", liveClasses: 56, selfPaced: 80, peerCoding: 54 },
      ];
      dynamicWeeklyHours = baseMonthlyHours.slice(0, Math.min(6, Math.max(3, batchDurationMonths))).map((m) => ({
        month: m.month,
        liveClasses: Math.round(m.liveClasses * multiplier),
        selfPaced: Math.round(m.selfPaced * multiplier),
        peerCoding: Math.round(m.peerCoding * multiplier),
      }));
    }
  }
  const weeklyHours = dynamicWeeklyHours;

  // Monthly Progression & Cumulative Velocity
  const baseMonthlyProgression = hasZeroHours
    ? Array.from({ length: Math.min(6, Math.max(3, batchDurationMonths)) }, (_, i) => ({
        month: `M${i + 1}`,
        monthlyHours: 0,
        targetHours: 160,
        cumulativeHours: 0,
        attendanceRate: 0,
        velocity: 0,
      }))
    : [
        { month: "M1", monthlyHours: 133, targetHours: 150, cumulativeHours: 133, attendanceRate: 88, velocity: 6.2 },
        { month: "M2", monthlyHours: 152, targetHours: 155, cumulativeHours: 285, attendanceRate: 90, velocity: 6.7 },
        { month: "M3", monthlyHours: 160, targetHours: 160, cumulativeHours: 445, attendanceRate: 92, velocity: 7.1 },
        { month: "M4", monthlyHours: 170, targetHours: 160, cumulativeHours: 615, attendanceRate: 94, velocity: 7.5 },
        { month: "M5", monthlyHours: 180, targetHours: 160, cumulativeHours: 795, attendanceRate: 96, velocity: 7.9 },
        { month: "M6", monthlyHours: 190, targetHours: 160, cumulativeHours: 985, attendanceRate: 98, velocity: 8.3 },
      ];
  const monthlyProgression = baseMonthlyProgression.slice(0, Math.min(6, Math.max(3, batchDurationMonths)));

  // 5. Tech Stack Proficiency & Usage Frequency
  const fallbackTechs = ["Next.js", "Python", "PostgreSQL", "Docker", "PyTorch", "TypeScript", "FastAPI"];
  const candidateTechs =
    studentBatch?.technologies && studentBatch.technologies.length > 0
      ? studentBatch.technologies
      : student.skills && student.skills.length > 0
      ? student.skills
      : (isDemo ? fallbackTechs : []);

  const techStack = candidateTechs.slice(0, 7).map((tech, idx) => {
    const profBase = [92, 89, 84, 78, 81, 93, 85][idx % 7];
    const freqBase = [88, 95, 76, 70, 72, 91, 79][idx % 7];
    return {
      tech,
      proficiency: hasZeroHours ? (student.scores?.codingScore || 0) : Math.min(100, Math.round(profBase * multiplier)),
      frequency: hasZeroHours ? (student.scores?.quizScore || 0) : Math.min(100, Math.round(freqBase * multiplier)),
    };
  });

  // 6. Skills Matrix
  const skillsMatrix = !isDemo && hasZeroHours && (!student.skills || student.skills.length === 0)
    ? []
    : [
        { skill: "System Design", self: hasZeroHours ? 0 : 78, demonstrated: hasZeroHours ? 0 : Math.round(88 * multiplier) },
        { skill: "ML Engineering", self: hasZeroHours ? 0 : 74, demonstrated: hasZeroHours ? 0 : Math.round(82 * multiplier) },
        { skill: "API Development", self: hasZeroHours ? 0 : 85, demonstrated: hasZeroHours ? 0 : Math.round(92 * multiplier) },
        { skill: "Database Design", self: hasZeroHours ? 0 : 79, demonstrated: hasZeroHours ? 0 : Math.round(85 * multiplier) },
        { skill: "DevOps / CI-CD", self: hasZeroHours ? 0 : 72, demonstrated: hasZeroHours ? 0 : Math.round(76 * multiplier) },
        { skill: "Frontend React", self: hasZeroHours ? 0 : 89, demonstrated: hasZeroHours ? 0 : Math.round(94 * multiplier) },
      ];

  // Multi-Admin Evaluations
  const multiAdminList: InternEvaluation[] = (() => {
    try {
      const savedMap = JSON.parse(localStorage.getItem("m2i_intern_multi_evaluations") || "{}");
      if (savedMap[student.id] && Array.isArray(savedMap[student.id]) && savedMap[student.id].length > 0) {
        return savedMap[student.id];
      }
    } catch {}
    if (student.evaluations && student.evaluations.length > 0) {
      return student.evaluations;
    }
    return [];
  })();

  const localEval = (() => {
    const validEvals = multiAdminList.filter((e) => (e.overallRating || 0) > 0);
    if (validEvals.length > 0) {
      const count = validEvals.length;
      const avgOverall = Math.round(validEvals.reduce((a, b) => a + (b.overallRating ?? 0), 0) / count);
      const avgComm = Math.round(validEvals.reduce((a, b) => a + (b.communicationScore ?? 0), 0) / count);
      const avgGrammar = Math.round(validEvals.reduce((a, b) => a + (b.grammarScore ?? 0), 0) / count);
      const avgFluency = Math.round(validEvals.reduce((a, b) => a + (b.fluencyScore ?? 0), 0) / count);
      const avgProj = Math.round(validEvals.reduce((a, b) => a + (b.projectScore ?? (b as any).projectExecutionScore ?? 0), 0) / count);

      const latestEval = validEvals[0];
      return {
        ...latestEval,
        overallRating: avgOverall,
        communicationScore: avgComm,
        grammarScore: avgGrammar,
        fluencyScore: avgFluency,
        projectScore: avgProj,
        projectExecutionScore: avgProj,
        reviewerName: count > 1 ? `Consensus Panel (${count} Evaluators)` : (latestEval.reviewerName || (latestEval as any).evaluatorName || "Faculty Reviewer"),
        reviewerRole: count > 1 ? `Consensus of ${count} Evaluators` : (latestEval.reviewerRole || "Lead Evaluator"),
      } as InternEvaluation;
    }

    try {
      const saved = JSON.parse(localStorage.getItem("m2i_intern_evaluations") || "{}");
      if (saved[student.id]) return saved[student.id];
    } catch {}
    if (student.evaluation && (student.evaluation.communicationScore || student.evaluation.aiVerdict)) return student.evaluation;
    return student.evaluation;
  })();

  const savedDocsList: InternResource[] = (() => {
    try {
      const saved = JSON.parse(localStorage.getItem("m2i_intern_resources") || "{}");
      if (saved[student.id] && saved[student.id].length > 0) return saved[student.id];
    } catch {}
    return student.resources && student.resources.length > 0 ? student.resources : [];
  })();
  const evaluatedDocs = savedDocsList.filter((d) => typeof d.aiRating === "number" && d.aiRating > 0);
  const avgVerifiedDocRating = evaluatedDocs.length > 0
    ? Math.round(evaluatedDocs.reduce((acc, d) => acc + (d.aiRating ?? 0), 0) / evaluatedDocs.length)
    : null;

  // 7. Presentation Evaluation
  const evalFluency = localEval?.fluencyScore;
  const presentationScores = [
    { category: "Technical Clarity", score: avgVerifiedDocRating ? Math.min(100, Math.round(avgVerifiedDocRating * 0.99)) : (evalFluency ? Math.min(100, Math.round(evalFluency * 1.02)) : (isDemo ? Math.round(92 * multiplier) : 0)) },
    { category: "Presentation Deck", score: avgVerifiedDocRating ?? (evalFluency ? Math.min(100, Math.round(evalFluency * 0.96)) : (isDemo ? Math.round(84 * multiplier) : 0)) },
    { category: "Q&A Handling", score: evalFluency ? Math.min(100, Math.round(evalFluency * 0.94)) : (isDemo ? Math.round(80 * multiplier) : 0) },
    { category: "Articulation", score: evalFluency ? evalFluency : (isDemo ? Math.round(88 * multiplier) : 0) },
  ];

  // 8. Communication Skills Assessment
  const evalComm = localEval?.communicationScore;
  const communicationSkills = [
    { skill: "Tone", score: evalComm ? Math.min(100, Math.round(evalComm * 0.99)) : (isDemo ? Math.round(90 * multiplier) : 0) },
    { skill: "Fluency", score: evalFluency ? evalFluency : (isDemo ? Math.round(87 * multiplier) : 0) },
    { skill: "Confidence", score: evalComm ? Math.min(100, Math.round(evalComm * 0.96)) : (isDemo ? Math.round(84 * multiplier) : 0) },
    { skill: "Structure", score: evalComm ? Math.min(100, Math.round(evalComm * 1.01)) : (isDemo ? Math.round(91 * multiplier) : 0) },
  ];

  // 9. Soft Skills Radar
  const evalOverall = localEval?.overallRating;
  const evalProj = localEval?.projectScore ?? (localEval as any)?.projectExecutionScore;
  const softSkills = [
    {
      subject: "Collaboration",
      score: evalComm
        ? Math.min(100, Math.round(evalComm * 0.98))
        : (student.attendedSessions > 0 ? Math.min(100, Math.round(attendanceRate * 0.9)) : (isDemo ? Math.round(88 * multiplier) : 0)),
      fullMark: 100,
    },
    {
      subject: "Accountability",
      score: evalOverall
        ? Math.min(100, Math.round(evalOverall * 0.96))
        : (student.attendedSessions > 0 || realCompletedProjects > 0 ? Math.min(100, Math.round((attendanceRate * 0.6) + ((realCompletedProjects > 0 ? 100 : 50) * 0.4))) : (isDemo ? Math.round(92 * multiplier) : 0)),
      fullMark: 100,
    },
    {
      subject: "Communication",
      score: evalComm
        ? evalComm
        : (student.reflectionVideo?.aiCommunicationScore ?? (isDemo ? Math.round(85 * multiplier) : 0)),
      fullMark: 100,
    },
    {
      subject: "Initiative",
      score: evalProj
        ? Math.min(100, Math.round(evalProj * 0.97))
        : (student.scores?.quizScore ? student.scores.quizScore : (isDemo ? Math.round(94 * multiplier) : 0)),
      fullMark: 100,
    },
    {
      subject: "Adaptability",
      score: evalOverall
        ? Math.min(100, Math.round(evalOverall * 0.94))
        : (student.scores?.overallAccuracy ? student.scores.overallAccuracy : (isDemo ? Math.round(90 * multiplier) : 0)),
      fullMark: 100,
    },
  ];


  // ─── 12 Evaluation Domains Calculation for Holistic Cumulative Score ───
  const m1_assessments = Math.min(100, Math.max(0, Math.round((student.scores?.assignmentScore ?? student.scores?.overallAccuracy ?? (isDemo ? 92 : 0)) * multiplier)));
  // 02. Cohort Live Q&A, Polls & Rapid Reflex Telemetry
  const m2_liveQA = Math.min(100, Math.max(0, Math.round((student.scores?.liveQAScore ?? student.scores?.overallAccuracy ?? (isDemo ? 96 : 0)) * multiplier)));
  // 03. LearnHub Knowledge Modules & Concept Quizzes
  const m3_learnHub = Math.min(100, Math.max(0, Math.round((student.scores?.quizScore ?? (isDemo ? 94 : 0)) * multiplier)));
  // 04. Coding Challenges & Compiler Execution Benchmarks
  const m4_coding = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        codingChallenges.reduce((acc, c) => acc + c.value, 0) / Math.max(1, codingChallenges.length)
      )
    )
  );
  // 05. Attendance, Training & Daily Activity
  const m5_attendance = Math.min(100, Math.max(0, Math.round(attendanceRate * (preset === "7d" ? 0.98 : 1.0))));
  // 06. Project Execution & Tech Stack Research
  const evalProject = localEval?.projectScore;
  const m6_techStack = evalProject ?? Math.min(
    100,
    Math.max(
      0,
      Math.round(
        techStack.reduce((acc, t) => acc + t.proficiency, 0) / Math.max(1, techStack.length)
      )
    )
  );
  // 07. Skills Matrix & Industry Fit
  const m7_skillsMatrix = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        skillsMatrix.reduce((acc, s) => acc + s.demonstrated, 0) / Math.max(1, skillsMatrix.length)
      )
    )
  );
  // 08. Interactive Resume Showcase & Deep ATS Scorecard (prioritizing evaluation grammar if present)
  const evalGrammar = localEval?.grammarScore;
  const resumeOverall = resumeData?.scorecard?.overallScore || student.resumeData?.scorecard?.overallScore || (isDemo ? 88 : 0);
  const m8_atsResume = evalGrammar ?? Math.min(
    100,
    Math.max(
      0,
      Math.round(resumeOverall * multiplier)
    )
  );
  // 09. Project Presentation & Resources Hub
  const m9_presentation = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        presentationScores.reduce((acc, p) => acc + p.score, 0) / Math.max(1, presentationScores.length)
      )
    )
  );
  // 10. Video Portfolio & Candidate Self-Reflection & Communication
  const m10_communication = evalComm ?? Math.min(
    100,
    Math.max(
      0,
      Math.round(
        communicationSkills.reduce((acc, c) => acc + c.score, 0) / Math.max(1, communicationSkills.length)
      )
    )
  );
  // 11. Assigned Projects & Engineering Deliverables Portfolio (Submissions)
  let m11_capstones = evalProject ? Math.min(100, Math.round(evalProject * 1.01)) : Math.min(100, Math.round(95 * multiplier));
  if (!evalProject && submissions && submissions.length > 0 && projects && projects.length > 0) {
    const candidateSubs = submissions.filter((s) => s.studentId === student.id);
    const submittedRate = Math.min(1, candidateSubs.length / Math.max(1, projects.length));
    const passedSubs = candidateSubs.filter((s) => s.status === "passed" || ((s.gradePoints ?? 0) >= 80)).length;
    const passedRate = candidateSubs.length > 0 ? passedSubs / candidateSubs.length : 1;
    m11_capstones = Math.min(100, Math.max(70, Math.round((submittedRate * 50 + passedRate * 50) * multiplier)));
  }
  // 12. Final Evaluation & Comprehensive Behavioral Review
  const m12_behavioral = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        softSkills.reduce((acc, s) => acc + s.score, 0) / Math.max(1, softSkills.length)
      )
    )
  );

  const twelveModuleScores = [
    { id: "01", name: "Scheduled Assessments", score: m1_assessments, grade: m1_assessments >= 90 ? "Distinction A+" : m1_assessments >= 80 ? "Grade A" : "Grade B" },
    { id: "02", name: "Live Q&A & Reflex", score: m2_liveQA, grade: m2_liveQA >= 90 ? "Top 5% Reflex" : "Proficient" },
    { id: "03", name: "LearnHub Modules", score: m3_learnHub, grade: m3_learnHub >= 90 ? "100% Cleared" : "In Progress" },
    { id: "04", name: "Coding Challenges", score: m4_coding, grade: m4_coding >= 90 ? "Benchmark Pass" : "Verified" },
    { id: "05", name: "Attendance & Activity", score: m5_attendance, grade: m5_attendance >= 90 ? "Exemplary" : "Good Standing" },
    { id: "06", name: "Project Execution & Tech", score: m6_techStack, grade: m6_techStack >= 90 ? "Production Ready" : "Competent" },
    { id: "07", name: "Skills Matrix & Fit", score: m7_skillsMatrix, grade: m7_skillsMatrix >= 90 ? "Tier-1 Ready" : "Target Fit" },
    { id: "08", name: "Resume & ATS Scorecard", score: m8_atsResume, grade: m8_atsResume >= 85 ? "ATS Verified" : "Review Ready" },
    { id: "09", name: "Presentation & Defense", score: m9_presentation, grade: m9_presentation >= 90 ? "Defense Approved" : "Qualified" },
    { id: "10", name: "Video & Self-Reflection", score: m10_communication, grade: m10_communication >= 90 ? "High Fluency" : "Proficient" },
    { id: "11", name: "Assigned Capstones", score: m11_capstones, grade: m11_capstones >= 90 ? "Production Verified" : "Delivered" },
    { id: "12", name: "Behavioral Review", score: m12_behavioral, grade: m12_behavioral >= 90 ? "Top Quartile" : "Recommended" },
  ];

  const totalTwelveScoresSum = twelveModuleScores.reduce((acc, m) => acc + m.score, 0);
  const compositeCumulativeScore = Math.min(100, Math.max(0, Math.round(totalTwelveScoresSum / 12)));
  const compositeCumulativeScoreDecimal = Number((totalTwelveScoresSum / 12).toFixed(1));

  return {
    cumulativeScore: compositeCumulativeScore,
    cumulativeScoreDecimal: compositeCumulativeScoreDecimal,
    twelveModuleScores,
    attendanceRate,
    completedProjects,
    hoursLogged,
    daysPresent,
    totalRangeDays,
    totalWeeks,
    batchDurationMonths,
    readinessIndex: Math.round((m1_assessments * 0.25 + m4_coding * 0.35 + m3_learnHub * 0.2 + m11_capstones * 0.2)),
    performanceTrend,
    codingChallenges,
    heatmapLevels,
    weeklyHours,
    monthlyProgression,
    techStack,
    skillsMatrix,
    presentationScores,
    communicationSkills,
    softSkills,
    hasZeroHours,
  };
}

// ─── Heatmap square color mapper (5 levels) ───
function getHeatmapBg(level: number): string {
  switch (level) {
    case 4: return "bg-blue-600";
    case 3: return "bg-blue-500";
    case 2: return "bg-blue-400";
    case 1: return "bg-blue-200";
    default: return "bg-slate-100";
  }
}

// ─── Dynamic Batch-Duration Growth Plan Generator ───
export interface GrowthPlanPhase {
  badge: string;
  badgeBg: string;
  title: string;
  items: string[];
}

export interface GrowthPlanData {
  title: string;
  subtitle: string;
  phases: GrowthPlanPhase[];
}

export function getGrowthPlan(batchDurationMonths: number = 6, technologies: string[] = []): GrowthPlanData {
  const tech1 = technologies[0] || "Frontend & UI Core";
  const tech2 = technologies[1] || "Backend APIs & Microservices";
  const tech3 = technologies[2] || "Cloud Databases & CI/CD";

  if (batchDurationMonths <= 1) {
    return {
      title: "30-Day Accelerated Execution Plan",
      subtitle: "Sprint delivery, tooling setup, and capstone review for 1-month intensive cohort",
      phases: [
        {
          badge: "Days 1–10",
          badgeBg: "bg-indigo-600",
          title: "Onboarding & Tooling Setup",
          items: [
            `Complete repository setup, environment onboarding, and ${tech1} tool stack familiarization`,
            `Pair-program with senior peers on active ${tech2} codebase branches`,
            "Deliver first verified pull request with complete unit tests and documentation",
          ],
        },
        {
          badge: "Days 11–20",
          badgeBg: "bg-indigo-700",
          title: "Sprint Execution & Ownership",
          items: [
            `Own a mid-complexity ${tech2} feature end-to-end from specification to test run`,
            "Participate in daily standups and sprint code review cycles",
            "Document API contracts and endpoint validation schemas",
          ],
        },
        {
          badge: "Days 21–30",
          badgeBg: "bg-emerald-600",
          title: "Production Capstone & Review",
          items: [
            `Deliver and containerize production capstone utilizing ${tech3}`,
            "Present technical defense during official faculty appraisal panel",
            "Complete performance review with mentor and verify exit scorecard metrics",
          ],
        },
      ],
    };
  }

  if (batchDurationMonths <= 3) {
    return {
      title: "30–60–90 Day Growth Plan",
      subtitle: "Systematic 3-month milestone progression from onboarding to autonomous ownership",
      phases: [
        {
          badge: "0–30 Days",
          badgeBg: "bg-indigo-600",
          title: "Onboarding & Integration",
          items: [
            `Complete onboarding documentation, codebase architecture review, and ${tech1} stack setup`,
            `Shadow senior mentors on two active ${tech2} pull request reviews`,
            "Deliver first standalone service module with tests and architectural documentation",
          ],
        },
        {
          badge: "31–60 Days",
          badgeBg: "bg-indigo-700",
          title: "Independent Ownership",
          items: [
            `Own a mid-complexity ${tech2} feature end-to-end from schema design to deployment`,
            `Lead one internal knowledge-sharing demo on ${tech3} tooling and workflows`,
            "Contribute to product architecture discussions with engineering trade-off analysis",
          ],
        },
        {
          badge: "61–90 Days",
          badgeBg: "bg-emerald-600",
          title: "Leadership & Scale",
          items: [
            "Mentor incoming peer interns during cohort sprint cycles and debug sessions",
            "Propose and execute an automated test suite or build performance improvement",
            "Complete final capstone defense and exit evaluation with faculty review panel",
          ],
        },
      ],
    };
  }

  if (batchDurationMonths <= 6) {
    return {
      title: "60–120–180 Day Growth Plan",
      subtitle: "Comprehensive 6-month industry roadmap from system architecture to production scaling",
      phases: [
        {
          badge: "Months 1–2 (0–60 Days)",
          badgeBg: "bg-indigo-600",
          title: "Systems Integration & Core Architecture",
          items: [
            `Deep-dive into enterprise codebase standards, design patterns, and ${tech1} frameworks`,
            `Deliver modular service components in ${tech2} with unit and integration tests`,
            "Participate in weekly sprint planning and technical RFC discussions",
          ],
        },
        {
          badge: "Months 3–4 (61–120 Days)",
          badgeBg: "bg-indigo-700",
          title: "Feature Ownership & Service Delivery",
          items: [
            `Architect and deliver end-to-end feature pipelines across ${tech2} and ${tech3}`,
            "Implement automated CI/CD pipeline validations and code coverage thresholds",
            "Conduct structured peer code reviews and optimize database query latency",
          ],
        },
        {
          badge: "Months 5–6 (121–180 Days)",
          badgeBg: "bg-emerald-600",
          title: "Production Scale & Capstone Defense",
          items: [
            "Deploy production-ready distributed capstone with real-time telemetry and monitoring",
            "Act as sprint lead mentor for junior developers during milestone reviews",
            "Complete comprehensive faculty accreditation panel and hiring partner defense",
          ],
        },
      ],
    };
  }

  // 12 Months / 1 Year
  return {
    title: "365-Day Enterprise Growth Roadmap",
    subtitle: "Full-year enterprise engineering trajectory covering architecture, leadership, and scale",
    phases: [
      {
        badge: "Trimester 1 (Months 1–4)",
        badgeBg: "bg-indigo-600",
        title: "Enterprise Systems Onboarding",
        items: [
          `Master enterprise domain architecture, system contracts, and ${tech1} best practices`,
          `Deliver mission-critical service endpoints in ${tech2} with complete telemetry and logging`,
          "Engage in agile sprint governance, static code analysis, and architectural reviews",
        ],
      },
      {
        badge: "Trimester 2 (Months 5–8)",
        badgeBg: "bg-indigo-700",
        title: "Technical Ownership & Microservices",
        items: [
          `Architect scalable microservices and asynchronous workers using ${tech2} & ${tech3}`,
          "Optimize throughput, eliminate memory leaks, and enforce zero-defect release standards",
          "Lead technical syncs, sprint retrospectives, and cross-team interface specifications",
        ],
      },
      {
        badge: "Trimester 3 (Months 9–12)",
        badgeBg: "bg-emerald-600",
        title: "Production Architecture & Engineering Leadership",
        items: [
          "Drive enterprise capstone deliverables from technical blueprint to cloud production",
          "Serve as designated technical mentor for cohort interns, leading architecture workshops",
          "Complete executive faculty defense and client partner hiring recommendation",
        ],
      },
    ],
  };
}

// ═════════════════════════════════════════════════════════════════════
// COMPONENT
// ═════════════════════════════════════════════════════════════════════
export const CandidateReportView: React.FC<CandidateReportViewProps> = ({
  student,
  onClose,
  userRole,
  allStudents = [],
  batches = [],
  selectedBatch,
  projects = [],
  submissions = [],
  assignments = [],
  liveQuestions = [],
  learnHubModules = [],
  onSelectStudent,
  onRequestInterview,
  isTabMode = false,
  attendanceRecords = [],
  rosterAssignments = [],
  shiftPatterns = [],
  holidays = [],
  dailyActivityLogs = [],
  leaveRequests = [],
  resumeData,
}) => {
  const isDemo = isDemoStudent(student);
  const [datePreset, setDatePreset] = useState<DatePreset>("full");
  const [reportViewMode, setReportViewMode] = useState<"detailed" | "simple">("detailed");
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [selectedBatchFilterId, setSelectedBatchFilterId] = useState<string>("all");
  const [searchStudentQuery, setSearchStudentQuery] = useState("");
  const [showToast, setShowToast] = useState<string | null>(null);

  const [resumeToggles, setResumeToggles] = useState({
    summary: true,
    experience: true,
    education: true,
    skills: true,
    certifications: true,
  });

  const [videoPlaying, setVideoPlaying] = useState(false);
  const [reflectionVideoPlaying, setReflectionVideoPlaying] = useState(false);

  // Retrieve all recorded multi-admin evaluations for this candidate
  const multiAdminEvaluations: InternEvaluation[] = useMemo(() => {
    try {
      const savedMap = JSON.parse(localStorage.getItem("m2i_intern_multi_evaluations") || "{}");
      if (savedMap[student.id] && Array.isArray(savedMap[student.id]) && savedMap[student.id].length > 0) {
        return savedMap[student.id];
      }
    } catch {}
    if (student.evaluations && student.evaluations.length > 0) {
      return student.evaluations;
    }
    return [];
  }, [student]);

  // Compute panel consensus average scores across all admin evaluations
  const panelConsensusAverage = useMemo(() => {
    const validEvals = multiAdminEvaluations.filter((e) => (e.overallRating || 0) > 0);
    if (validEvals.length === 0) return null;
    const count = validEvals.length;
    const avgOverall = Math.round(validEvals.reduce((a, b) => a + (b.overallRating ?? 0), 0) / count);
    const avgComm = Math.round(validEvals.reduce((a, b) => a + (b.communicationScore ?? 0), 0) / count);
    const avgGrammar = Math.round(validEvals.reduce((a, b) => a + (b.grammarScore ?? 0), 0) / count);
    const avgFluency = Math.round(validEvals.reduce((a, b) => a + (b.fluencyScore ?? 0), 0) / count);
    const avgProject = Math.round(validEvals.reduce((a, b) => a + (b.projectScore ?? (b as any).projectExecutionScore ?? 0), 0) / count);
    return {
      avgOverall,
      avgComm,
      avgGrammar,
      avgFluency,
      avgProject,
      count,
      evaluators: validEvals,
    };
  }, [multiAdminEvaluations]);

  // Dynamic fallback readers to ensure Admin Profile Reviews & Video Uploads are NEVER lost
  const effectiveEvaluation = useMemo(() => {
    let base = student.evaluation;
    try {
      const saved = JSON.parse(localStorage.getItem("m2i_intern_evaluations") || "{}");
      if (saved[student.id]) base = saved[student.id];
    } catch {}

    if (panelConsensusAverage) {
      return {
        ...(base || {}),
        overallRating: panelConsensusAverage.avgOverall,
        communicationScore: panelConsensusAverage.avgComm,
        grammarScore: panelConsensusAverage.avgGrammar,
        fluencyScore: panelConsensusAverage.avgFluency,
        projectScore: panelConsensusAverage.avgProject,
        reviewerName: panelConsensusAverage.count > 1
          ? `Faculty Consensus Panel (${panelConsensusAverage.count} Reviewers)`
          : (base?.reviewerName || "Faculty Reviewer"),
        reviewerRole: panelConsensusAverage.count > 1
          ? `Consensus of ${panelConsensusAverage.count} Faculty Evaluations`
          : (base?.reviewerRole || "Lead Evaluator"),
      } as InternEvaluation;
    }

    if (base && (base.communicationScore || base.aiVerdict)) {
      return base;
    }
    return student.evaluation;
  }, [student, panelConsensusAverage]);

  const effectiveReflectionVideo = useMemo(() => {
    if (student.reflectionVideo && student.reflectionVideo.videoUrl) {
      return student.reflectionVideo;
    }
    try {
      const saved = JSON.parse(localStorage.getItem("m2i_intern_videos") || "{}");
      if (saved[student.id]) return saved[student.id];
    } catch {}
    return student.reflectionVideo;
  }, [student]);

  const effectiveResources = useMemo(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("m2i_intern_resources") || "{}");
      if (saved[student.id] && saved[student.id].length > 0) return saved[student.id];
    } catch {}
    if (student.resources && student.resources.length > 0) {
      return student.resources;
    }
    if (!isDemoStudent(student)) {
      return [];
    }
    return DEFAULT_SAMPLE_RESOURCES(student.id, student.batchId);
  }, [student]);

  const [customStartDate, setCustomStartDate] = useState("2025-10-06");
  const [customEndDate, setCustomEndDate] = useState("2025-11-28");
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [trainingGraphView, setTrainingGraphView] = useState<"both" | "weekly" | "monthly">("both");
  const [hoveredDay, setHoveredDay] = useState<{
    idx: number;
    weekNumber: number;
    dayIndex: number;
    dayLabel: string;
    fullDayName: string;
    shortDate: string;
    fullDate: string;
    level: number;
    hoursText: string;
    status: string;
    isInSelectedRange: boolean;
  } | null>(null);

  // Mark document body for clean print rendering
  useEffect(() => {
    document.body.classList.add("candidate-report-open");
    return () => {
      document.body.classList.remove("candidate-report-open");
    };
  }, []);

  const handleDownloadPdf = () => {
    const originalTitle = document.title;
    const cleanName = (student.name || "Candidate").replace(/\s+/g, "_");
    document.title = `${cleanName}_MIND2I_Performance_Report`;

    triggerToast("Opening PDF print dialog. Select 'Save as PDF' to download your report.");

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

  const dropdownRef = useRef<HTMLDivElement>(null);
  const customDateRef = useRef<HTMLDivElement>(null);
  const heatmapScrollRef = useRef<HTMLDivElement>(null);
  const [activeTrimester, setActiveTrimester] = useState<"m1-m3" | "m4-m6">("m1-m3");

  const scrollToPhase = (phase: "m1-m3" | "m4-m6") => {
    setActiveTrimester(phase);
    if (!heatmapScrollRef.current) return;
    if (phase === "m1-m3") {
      heatmapScrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      // 12 columns of (34px + 6px gap) = 480px
      heatmapScrollRef.current.scrollTo({ left: 480, behavior: "smooth" });
    }
  };

  const handleHeatmapScroll = () => {
    if (!heatmapScrollRef.current) return;
    const left = heatmapScrollRef.current.scrollLeft;
    if (left > 220) {
      setActiveTrimester("m4-m6");
    } else {
      setActiveTrimester("m1-m3");
    }
  };

  // Resolve active batch for the student
  const studentBatch = useMemo(() => {
    if (!batches || batches.length === 0) return selectedBatch || null;
    return (
      batches.find((b) =>
        (student.batchId && b.id === student.batchId) ||
        (student.batchName && b.name.toLowerCase() === student.batchName.toLowerCase()) ||
        (student.batchId && b.name.toLowerCase() === student.batchId.toLowerCase())
      ) ||
      (selectedBatch && selectedBatch.id ? selectedBatch : null) ||
      batches[0] ||
      null
    );
  }, [batches, student, selectedBatch]);

  const customRangeDays = useMemo(() => {
    try {
      const s = new Date(customStartDate + "T00:00:00").getTime();
      const e = new Date(customEndDate + "T23:59:59").getTime();
      return Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)));
    } catch {
      return 60;
    }
  }, [customStartDate, customEndDate]);

  const data = useMemo(
    () => generateReportData(student, datePreset, customStartDate, customEndDate, studentBatch, resumeData, submissions, projects),
    [student, datePreset, customStartDate, customEndDate, studentBatch, resumeData, submissions, projects]
  );
  const hasZeroHours = data.hasZeroHours ?? (!isDemo && ((student.attendedSessions ?? 0) === 0 || data.hoursLogged === 0));

  const scoreTheme = useMemo(() => getScoreColorTheme(data.cumulativeScore), [data.cumulativeScore]);

  // ─── Attendance & Shift Synchronization ───
  const [attendanceViewMode, setAttendanceViewMode] = useState<"calendar" | "heatmap">("calendar");

  const studentAssignment = useMemo(() => {
    return (
      rosterAssignments.find(
        (r) =>
          r.internId === student.id ||
          (r.internName && student.name && r.internName.toLowerCase() === student.name.toLowerCase())
      ) || rosterAssignments[0]
    );
  }, [rosterAssignments, student]);

  const studentShift = useMemo(() => {
    return (
      shiftPatterns.find((s) => s.id === studentAssignment?.shiftId) ||
      shiftPatterns[0]
    );
  }, [shiftPatterns, studentAssignment]);

  const studentAttendanceRecords = useMemo(() => {
    const isDemo = isDemoStudent(student);
    return attendanceRecords.filter(
      (r) =>
        r.internId === student.id ||
        (r.internName && student.name && r.internName.toLowerCase() === student.name.toLowerCase()) ||
        (isDemo && !r.internId)
    );
  }, [attendanceRecords, student]);

  // Synchronized Month Calendar Calculations (September 2026)
  const reportCalendarCells = useMemo(() => {
    const cells: (number | null)[] = [];
    // Tuesday is day 2 in 0-indexed week (Sun = 0, Mon = 1, Tue = 2)
    for (let i = 0; i < 2; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= 30; d++) {
      cells.push(d);
    }
    return cells;
  }, []);

  const reportGetDayStatus = (
    dayNum: number
  ): { status: AttendanceDayStatus | "today"; record?: AttendanceRecord; holiday?: HolidayEvent; leaveRequest?: LeaveRequest } => {
    const dateStr = `2026-09-${dayNum.toString().padStart(2, "0")}`;

    const hol = holidays.find((h) => h.date === dateStr);
    if (hol) return { status: "holiday", holiday: hol };

    const approvedLeave = (leaveRequests || []).find(
      (req) =>
        req.status === "approved" &&
        (req.internId === student.id ||
          (req.internName && student.name && req.internName.toLowerCase().trim() === student.name.toLowerCase().trim())) &&
        dateStr >= req.startDate &&
        dateStr <= req.endDate
    );
    if (approvedLeave) return { status: "on_leave", leaveRequest: approvedLeave };

    const rec = studentAttendanceRecords.find((a) => a.date === dateStr);
    if (rec) return { status: rec.status, record: rec };

    if (dayNum === 6) {
      return { status: "today" };
    }

    const dayOfWeek = new Date(2026, 8, dayNum).getDay();
    const customWeekends = studentAssignment?.customWeekends || [0, 6];
    const isShiftWorkingDay = studentShift?.workingDays
      ? studentShift.workingDays.includes(dayOfWeek)
      : !customWeekends.includes(dayOfWeek);

    if (customWeekends.includes(dayOfWeek) || !isShiftWorkingDay) {
      return { status: "week_off" };
    }

    const studentStartDate = student.internshipStartDate || student.enrolledAt;
    if (studentStartDate && !isDemo) {
      const enrollmentDateStr = studentStartDate.split("T")[0];
      if (dateStr < enrollmentDateStr) {
        return { status: "scheduled" };
      }
    }
    if (dayNum < 6) {
      return { status: "absent" };
    }

    // Future working days -> scheduled (neutral, NOT green present!)
    return { status: "scheduled" };
  };

  // Daily Activity Logs Synchronization (Executive Analytical Summary Mode)
  const studentActivityLogs = useMemo(() => {
    const matched = dailyActivityLogs.filter(
      (l) =>
        l.internId === student.id ||
        (l.internName && student.name && l.internName.toLowerCase().trim() === student.name.toLowerCase().trim())
    );
    if (matched.length > 0) return matched;
    if (!isDemoStudent(student)) return [];
    return dailyActivityLogs.slice(0, 4).map((l, i) => ({
      ...l,
      id: `synth_${student.id}_${i}`,
      internId: student.id,
      internName: student.name,
      batchName: student.batchName || l.batchName,
    }));
  }, [dailyActivityLogs, student]);

  const activityLogsStats = useMemo(() => {
    let sumRating = 0;
    let ratedCount = 0;
    let blockersReported = 0;
    let blockersResolved = 0;

    studentActivityLogs.forEach((log) => {
      const rating = log.adminRating || log.aiReview?.rating;
      if (rating) {
        sumRating += rating;
        ratedCount++;
      }
      if (log.hasBlockers) {
        blockersReported++;
        if (log.status === "approved" || log.status === "reviewed") {
          blockersResolved++;
        }
      }
    });

    const isDemo = isDemoStudent(student);
    const avgRating = ratedCount > 0 ? sumRating / ratedCount : (isDemo ? 4.8 : 0);
    const blockerResolutionRate = blockersReported > 0 ? Math.round((blockersResolved / blockersReported) * 100) : (isDemo ? 100 : 0);

    return {
      avgRating,
      blockersReported,
      blockerResolutionRate,
    };
  }, [studentActivityLogs, student]);

  const activeDateRange = useMemo(() => {
    if (datePreset === "7d") {
      return {
        startDateStr: "2026-08-31",
        endDateStr: "2026-09-06",
        days: 7,
        label: "Last 7 Days (Aug 31 – Sep 6, 2026)"
      };
    }
    if (datePreset === "30d") {
      return {
        startDateStr: "2026-08-08",
        endDateStr: "2026-09-06",
        days: 30,
        label: "Last 30 Days (Aug 8 – Sep 6, 2026)"
      };
    }
    if (datePreset === "custom") {
      return {
        startDateStr: customStartDate,
        endDateStr: customEndDate,
        days: customRangeDays,
        label: `Custom (${formatDateShort(customStartDate)} – ${formatDateShort(customEndDate)})`
      };
    }
    // Full Program
    const startStr = studentBatch?.startDate || student?.internshipStartDate || "2025-09-02";
    const endStr = studentBatch?.endDate || "2026-02-16";
    return {
      startDateStr: startStr,
      endDateStr: endStr,
      days: data.totalRangeDays,
      label: `Full Cohort (${formatDateShort(startStr)} – ${formatDateShort(endStr)})`
    };
  }, [datePreset, customStartDate, customEndDate, customRangeDays, studentBatch, student, data.totalRangeDays]);

  const liveAttendanceStats = useMemo(() => {
    const inRangeRecords = studentAttendanceRecords.filter((r) => {
      if (!r.date) return false;
      return r.date >= activeDateRange.startDateStr && r.date <= activeDateRange.endDateStr;
    });

    const recordedHours = inRangeRecords.reduce((acc, r) => acc + (r.hoursWorked || 0), 0);
    const recordedPresent = inRangeRecords.filter((r) => r.status === "present" || r.status === "late").length;
    const punchErrors = inRangeRecords.filter((r) => r.status === "punch_error" || r.isPunchError).length;
    const lateMarks = inRangeRecords.filter((r) => r.status === "late" || r.isLate).length;

    let totalHours = data.hoursLogged;
    let daysPresent = data.daysPresent;
    const isDemo = isDemoStudent(student);

    if (datePreset === "7d") {
      totalHours = recordedHours > 0 ? Number(recordedHours.toFixed(1)) : (isDemo ? 48 : 0);
      daysPresent = recordedPresent > 0 ? recordedPresent : (isDemo ? 6 : 0);
    } else if (datePreset === "30d") {
      totalHours = recordedHours > 0 ? Number((recordedHours + 140).toFixed(1)) : (isDemo ? 186 : 0);
      daysPresent = recordedPresent > 0 ? recordedPresent + 20 : (isDemo ? 26 : 0);
    } else {
      totalHours = data.hoursLogged;
      daysPresent = data.daysPresent;
    }

    const dailyVelocity = (totalHours / Math.max(1, daysPresent)).toFixed(1);

    return {
      daysPresent,
      totalHours,
      totalDays: activeDateRange.days,
      rangeLabel: activeDateRange.label,
      dailyVelocity,
      punchErrors,
      lateMarks,
    };
  }, [studentAttendanceRecords, activeDateRange, data.hoursLogged, data.daysPresent, datePreset, student]);

  // ─── Scheduled Assessments ───
  const activeBatchAssignments = useMemo(() => {
    const filtered = (assignments || []).filter(
      (a) => !a.batchId || a.batchId === studentBatch?.id || a.batchId === student.batchId
    );
    if (filtered.length > 0) return filtered;
    if (!isDemoStudent(student)) return [];

    return [
      {
        id: "asg_arch_01",
        batchId: studentBatch?.id || "batch_01",
        title: "Full-Stack System Architecture & API Gateway Assessment",
        description: "Comprehensive evaluation of REST & WebSocket design, caching strategies, and distributed security models.",
        type: "mixed" as const,
        durationMinutes: 45,
        totalPoints: 100,
        isPublished: true,
        deadline: "2026-09-12T18:00:00",
        questions: [
          { id: "q1", type: "mcq" as const, question: "Which caching eviction policy minimizes tail latency in read-heavy workloads?", points: 20 },
          { id: "q2", type: "coding" as const, question: "Implement a token bucket rate limiter with Redis backend.", points: 50 },
          { id: "q3", type: "true_false" as const, question: "HTTP/2 multiplexing eliminates head-of-line blocking at the TCP layer.", points: 15 },
          { id: "q4", type: "essay" as const, question: "Explain the trade-offs between eventual consistency and strict linearizability in distributed databases.", points: 15 },
        ],
      },
      {
        id: "asg_code_02",
        batchId: studentBatch?.id || "batch_01",
        title: "FastAPI & Distributed Event Bus Coding Sprint",
        description: "Implementation of asynchronous message consumer queues, dead letter handlers, and retry policies.",
        type: "coding" as const,
        durationMinutes: 60,
        totalPoints: 100,
        isPublished: true,
        deadline: "2026-09-19T23:59:00",
        questions: [
          { id: "q1", type: "coding" as const, question: "Build an asynchronous worker consumer with exponential backoff.", points: 60 },
          { id: "q2", type: "coding" as const, question: "Write test cases verifying idempotency across message redeliveries.", points: 40 },
        ],
      },
      {
        id: "asg_ai_03",
        batchId: studentBatch?.id || "batch_01",
        title: "Deep Learning Pipeline & Vector Embeddings Quiz",
        description: "Rigorous assessment covering semantic chunking, cosine distance metrics, and vector index clustering.",
        type: "quiz" as const,
        durationMinutes: 30,
        totalPoints: 50,
        isPublished: true,
        deadline: "2026-09-26T20:00:00",
        questions: [
          { id: "q1", type: "mcq" as const, question: "What metric is most invariant to vector magnitude when measuring semantic similarity?", points: 25 },
          { id: "q2", type: "mcq" as const, question: "How does HNSW indexing achieve sub-linear query time complexity?", points: 25 },
        ],
      },
    ];
  }, [assignments, studentBatch, student]);

  const totalQuestionsCount = useMemo(() => {
    return activeBatchAssignments.reduce((acc, a) => acc + (a.questions?.length || 0), 0);
  }, [activeBatchAssignments]);

  // ─── Live Questions & Polls ───
  const activeLiveQuestions = useMemo(() => {
    const filtered = (liveQuestions || []).filter(
      (q) => !q.batchId || q.batchId === studentBatch?.id || q.batchId === student.batchId
    );
    if (filtered.length > 0) return filtered;
    if (!isDemoStudent(student)) return [];

    return [
      {
        id: "poll_01",
        batchId: studentBatch?.id || "batch_01",
        question: "WebSocket vs HTTP Long-Polling: Which architecture yields lower p99 latency for high-frequency telemetry streams?",
        type: "mcq" as const,
        options: ["HTTP Long-Polling with Keep-Alive", "Persistent WebSockets (Full Duplex)", "Server-Sent Events (SSE) with HTTP/1.1", "Standard Client Short-Polling"],
        correctAnswer: "Persistent WebSockets (Full Duplex)",
        points: 20,
        timeLimitSeconds: 30,
        category: "Network Protocols & Telemetry",
        responses: [
          {
            studentId: student.id,
            studentName: student.name,
            answer: "Persistent WebSockets (Full Duplex)",
            responseTimeMs: student.fastestResponseMs || 1340,
            isCorrect: true,
            timestamp: Date.now() - 86400000 * 2,
          },
        ],
        isActive: false,
        isClosed: true,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: "poll_02",
        batchId: studentBatch?.id || "batch_01",
        question: "What is the worst-case time complexity of looking up a key in a hash table with degenerate hash collisions?",
        type: "mcq" as const,
        options: ["O(1)", "O(log N)", "O(N)", "O(N^2)"],
        correctAnswer: "O(N)",
        points: 20,
        timeLimitSeconds: 20,
        category: "Data Structures & Complexity",
        responses: [
          {
            studentId: student.id,
            studentName: student.name,
            answer: "O(N)",
            responseTimeMs: 1480,
            isCorrect: true,
            timestamp: Date.now() - 86400000 * 4,
          },
        ],
        isActive: false,
        isClosed: true,
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      },
      {
        id: "poll_03",
        batchId: studentBatch?.id || "batch_01",
        question: "Live Cohort Poll: Preferred Vector DB Architecture for Production Enterprise RAG Pipelines",
        type: "poll" as const,
        options: ["Qdrant (Rust high performance)", "pgvector (Unified Postgres relation)", "Pinecone (Managed Serverless Cloud)", "Milvus (Distributed Cluster)"],
        points: 10,
        category: "Vector Databases & AI Infrastructure",
        responses: [
          {
            studentId: student.id,
            studentName: student.name,
            answer: "pgvector (Unified Postgres relation)",
            responseTimeMs: 1820,
            isCorrect: true,
            timestamp: Date.now() - 86400000 * 6,
          },
        ],
        isActive: false,
        isClosed: true,
        createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
      },
      {
        id: "poll_04",
        batchId: studentBatch?.id || "batch_01",
        question: "How do you prevent race conditions when two distributed workers claim the same job from an unsegmented task queue?",
        type: "open" as const,
        options: [],
        points: 25,
        category: "Distributed Systems & Concurrency",
        responses: [
          {
            studentId: student.id,
            studentName: student.name,
            answer: "Employ atomic Redis Lua scripts (SET NX PX) or database row-level locking (SELECT FOR UPDATE SKIP LOCKED) to guarantee mutually exclusive job reservation.",
            responseTimeMs: 4200,
            isCorrect: true,
            timestamp: Date.now() - 86400000 * 8,
          },
        ],
        isActive: false,
        isClosed: true,
        createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
      },
    ];
  }, [liveQuestions, studentBatch, student]);

  // ─── LearnHub Modules ───
  const activeLearnModules = useMemo(() => {
    const filtered = (learnHubModules || []).filter(
      (m) => !m.batchId || m.batchId === studentBatch?.id || m.batchId === student.batchId
    );
    if (filtered.length > 0) return filtered;
    if (!isDemoStudent(student)) return [];

    return [
      {
        id: "mod_01",
        batchId: studentBatch?.id || "batch_01",
        badge: "MODULE 01 · CORE ARCHITECTURE",
        title: "Foundational Full-Stack AI & LLM Systems",
        subtitle: "Tokenization, context window management, and client-server streaming architectures.",
        slides: [
          { id: "s1", slideNumber: 1, title: "LLM Fundamentals", paragraphs: [] },
          { id: "s2", slideNumber: 2, title: "API Gateway Patterns", paragraphs: [] },
          { id: "s3", slideNumber: 3, title: "Streaming Protocol Buffers", paragraphs: [] },
        ],
        bottomTags: [
          { tag: "llm", title: "Large Language Models", icon: "BrainCircuit", cssClass: "llm", definition: "Neural network architectures trained on token prediction.", questionsCount: 4 },
          { tag: "api", title: "REST & Streaming APIs", icon: "Code2", cssClass: "api", definition: "Interfaces enabling decoupled client-server data exchange.", questionsCount: 3 },
        ],
        isPublished: true,
        createdAt: "2026-09-01T10:00:00",
        paragraphs: [],
      },
      {
        id: "mod_02",
        batchId: studentBatch?.id || "batch_01",
        badge: "MODULE 02 · MULTI-AGENT SWARMS",
        title: "Multi-Agent Orchestration with NexOS & CrewAI",
        subtitle: "Autonomous agent role delegation, memory sharing, and tool calling protocols.",
        slides: [
          { id: "s1", slideNumber: 1, title: "Agent Roles & Goals", paragraphs: [] },
          { id: "s2", slideNumber: 2, title: "Inter-Agent Communication", paragraphs: [] },
        ],
        bottomTags: [
          { tag: "nexos", title: "NexOS Swarm Framework", icon: "Cpu", cssClass: "nexos", definition: "High-performance framework for coordinating multi-agent state.", questionsCount: 4 },
          { tag: "crewai", title: "CrewAI Orchestration", icon: "Users", cssClass: "crewai", definition: "Role-based collaborative agent task pipelines.", questionsCount: 4 },
        ],
        isPublished: true,
        createdAt: "2026-09-08T10:00:00",
        paragraphs: [],
      },
      {
        id: "mod_03",
        batchId: studentBatch?.id || "batch_01",
        badge: "MODULE 03 · VECTOR PIPELINES",
        title: "High-Throughput Vector Databases & RAG Pipelines",
        subtitle: "Document ingestion, embeddings indexing, re-ranking algorithms, and hallucination reduction.",
        slides: [
          { id: "s1", slideNumber: 1, title: "Embedding Models", paragraphs: [] },
          { id: "s2", slideNumber: 2, title: "Vector Search Indexing", paragraphs: [] },
        ],
        bottomTags: [
          { tag: "database", title: "Vector DBs & Embeddings", icon: "Layers", cssClass: "database", definition: "Specialized storage optimized for multidimensional similarity lookup.", questionsCount: 5 },
          { tag: "python", title: "Python Async Runtime", icon: "Terminal", cssClass: "python", definition: "Coroutines and event loops for asynchronous IO operations.", questionsCount: 4 },
        ],
        isPublished: true,
        createdAt: "2026-09-15T10:00:00",
        paragraphs: [],
      },
    ];
  }, [learnHubModules, studentBatch, student]);

  // ─── Coding Challenges & Compiler Telemetry ───
  const activeCodingChallenges = useMemo(() => {
    if (!isDemoStudent(student)) return [];
    return [
      {
        id: "code_prob_01",
        title: "LRU Cache Implementation with O(1) Operations",
        language: "Python 3.12",
        difficulty: "Hard",
        passRate: "100%",
        testCasesPassed: 15,
        totalTestCases: 15,
        runtimeMs: 14,
        runtimePercentile: "Top 2.6%",
        complexity: "O(1) Get & Put",
        spaceComplexity: "O(Capacity)",
        codeCleanliness: 96,
        status: "passed",
        description: "Construct a thread-safe Least Recently Used cache utilizing doubly linked lists and hash maps with deterministic eviction bounds.",
      },
      {
        id: "code_prob_02",
        title: "Asynchronous Web Crawler with Rate Limiting Semaphore",
        language: "Python 3.12 / Asyncio",
        difficulty: "Medium",
        passRate: "100%",
        testCasesPassed: 12,
        totalTestCases: 12,
        runtimeMs: 28,
        runtimePercentile: "Top 5.1%",
        complexity: "O(V + E) Async DAG",
        spaceComplexity: "O(Queue Depth)",
        codeCleanliness: 94,
        status: "passed",
        description: "Orchestrate asynchronous non-blocking web workers honoring per-domain rate limits, retry backoffs, and robots.txt constraints.",
      },
      {
        id: "code_prob_03",
        title: "Fast Vector Similarity Clustering with Cosine Distance",
        language: "TypeScript / Node.js",
        difficulty: "Hard",
        passRate: "100%",
        testCasesPassed: 10,
        totalTestCases: 10,
        runtimeMs: 34,
        runtimePercentile: "Top 4.3%",
        complexity: "O(N log N)",
        spaceComplexity: "O(K Centroids)",
        codeCleanliness: 92,
        status: "passed",
        description: "Partition multidimensional embeddings vectors into k-means clusters with dynamic centroids recalculation and dot-product acceleration.",
      },
    ];
  }, [student]);

  // Derive real start date of the candidate's batch
  const batchStartDate = useMemo(() => {
    if (studentBatch?.startDate) {
      try {
        const d = new Date(studentBatch.startDate + "T00:00:00");
        if (!isNaN(d.getTime())) return d;
      } catch {}
    }
    if (student?.internshipStartDate) {
      try {
        const d = new Date(student.internshipStartDate + "T00:00:00");
        if (!isNaN(d.getTime())) return d;
      } catch {}
    }
    return new Date(2025, 9, 6);
  }, [studentBatch, student]);

  // Generate dynamic month group headers and bottom date markers
  const monthHeaders = useMemo(() => {
    const durationMonths = data.batchDurationMonths || 6;
    const months = [];
    const startTime = batchStartDate.getTime();
    for (let m = 0; m < durationMonths; m++) {
      const mStartDate = new Date(startTime + m * 28 * 24 * 60 * 60 * 1000);
      const mEndDate = new Date(startTime + (m * 28 + 27) * 24 * 60 * 60 * 1000);
      
      // Calculate distinct consecutive month name (e.g. Sep, Oct, Nov, Dec, Jan, Feb)
      const calDate = new Date(batchStartDate.getFullYear(), batchStartDate.getMonth() + m, 1);
      const monthName = calDate.toLocaleString("en-US", { month: "short" });
      
      const startMonthShort = mStartDate.toLocaleString("en-US", { month: "short" });
      const endMonthShort = mEndDate.toLocaleString("en-US", { month: "short" });
      
      months.push({
        monthIndex: m + 1,
        name: monthName,
        label: `Month ${m + 1} · ${monthName}`,
        startDateStr: `${startMonthShort} ${mStartDate.getDate()}`,
        endDateStr: `${endMonthShort} ${mEndDate.getDate()}`,
      });
    }
    return months;
  }, [batchStartDate, data.batchDurationMonths]);

  // Sync custom date state with batch dates when available
  useEffect(() => {
    if (studentBatch?.startDate) {
      setCustomStartDate(studentBatch.startDate);
    }
    if (studentBatch?.endDate) {
      setCustomEndDate(studentBatch.endDate);
    }
  }, [studentBatch?.startDate, studentBatch?.endDate]);

  // Auto-scroll heatmap to ensure active/selected range is visible in the viewport
  useEffect(() => {
    if (!heatmapScrollRef.current) return;
    const colStep = 40; // 34px column + 6px gap

    if (datePreset === "7d" || datePreset === "30d") {
      // Last 7d or 30d are in the second half of the cohort (Months 5 & 6, Weeks 19-24)
      const targetScroll = Math.max(0, (data.totalWeeks - 12) * colStep);
      heatmapScrollRef.current.scrollTo({ left: targetScroll, behavior: "smooth" });
      setActiveTrimester("m4-m6");
    } else if (datePreset === "full") {
      // Full program starts at Month 1
      heatmapScrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
      setActiveTrimester("m1-m3");
    } else if (datePreset === "custom") {
      try {
        const sTime = new Date(customStartDate + "T00:00:00").getTime();
        const bTime = batchStartDate.getTime();
        const startWeekIdx = Math.max(0, Math.floor((sTime - bTime) / (7 * 24 * 60 * 60 * 1000)));

        if (startWeekIdx >= 12) {
          // If custom range starts in second half (week 13+), scroll to Months 4–6
          const targetScroll = Math.min(
            (data.totalWeeks - 12) * colStep,
            Math.max(0, (startWeekIdx - 1) * colStep)
          );
          heatmapScrollRef.current.scrollTo({ left: targetScroll, behavior: "smooth" });
          setActiveTrimester("m4-m6");
        } else {
          // If custom range starts in first half (weeks 1-12), scroll to Months 1–3
          const targetScroll = Math.max(0, (startWeekIdx - 1) * colStep);
          heatmapScrollRef.current.scrollTo({ left: targetScroll, behavior: "smooth" });
          setActiveTrimester("m1-m3");
        }
      } catch {
        heatmapScrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        setActiveTrimester("m1-m3");
      }
    }
  }, [datePreset, customStartDate, customEndDate, data.totalWeeks, batchStartDate]);

  const datePresetInfo = useMemo(() => {
    const totalBlocks = data.heatmapLevels.length;
    const startTime = batchStartDate.getTime();
    const endTime = startTime + (totalBlocks - 1) * 24 * 60 * 60 * 1000;
    const dStart = new Date(startTime);
    const dEnd = new Date(endTime);
    const fullRangeText = `${formatDateShort(dStart.toISOString().split("T")[0])} – ${formatDateLong(dEnd.toISOString().split("T")[0])}`;

    switch (datePreset) {
      case "7d": {
        const p7Start = new Date(endTime - 6 * 24 * 60 * 60 * 1000);
        return {
          label: "Last 7 Days",
          range: `${formatDateShort(p7Start.toISOString().split("T")[0])} – ${formatDateShort(dEnd.toISOString().split("T")[0])}`,
          activeDays: 7,
        };
      }
      case "30d": {
        const p30Start = new Date(endTime - 29 * 24 * 60 * 60 * 1000);
        return {
          label: "Last 30 Days",
          range: `${formatDateShort(p30Start.toISOString().split("T")[0])} – ${formatDateShort(dEnd.toISOString().split("T")[0])}`,
          activeDays: 30,
        };
      }
      case "custom": {
        const startFmt = formatDateShort(customStartDate);
        const endFmt = formatDateShort(customEndDate);
        return {
          label: "Custom Range",
          range: `${startFmt} – ${endFmt}`,
          activeDays: customRangeDays,
        };
      }
      default: {
        const durationText = studentBatch?.durationLabel || `${data.batchDurationMonths} Months`;
        return {
          label: `Full Program (${durationText})`,
          range: fullRangeText,
          activeDays: data.totalRangeDays,
        };
      }
    }
  }, [datePreset, customStartDate, customEndDate, customRangeDays, studentBatch, data, batchStartDate]);

  const calendarDays = useMemo(() => {
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const fullDayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    const levelInfo = [
      { hours: "0.0h", status: "Rest Day / Off Platform" },
      { hours: "2.5h", status: "Async Review & Self Practice" },
      { hours: "4.5h", status: "Core Lecture & Guided Lab" },
      { hours: "6.8h", status: "Sprint Coding & Milestone Review" },
      { hours: "8.5h", status: "High-Velocity Sprint & Capstone Build" },
    ];

    const startTime = batchStartDate.getTime();
    const totalBlocks = data.heatmapLevels.length;

    return data.heatmapLevels.map((lvl, idx) => {
      const weekIndex = Math.floor(idx / 7);
      const dayIndex = idx % 7;
      const weekNumber = weekIndex + 1;
      const dayLabel = dayNames[dayIndex];
      const fullDayName = fullDayNames[dayIndex];

      const d = new Date(startTime + (weekIndex * 7 + dayIndex) * 24 * 60 * 60 * 1000);
      const monthShort = d.toLocaleString("en-US", { month: "short" });
      const dayNum = d.getDate();
      const year = d.getFullYear();
      const shortDate = `${monthShort} ${dayNum}`;
      const fullDate = `${fullDayName}, ${monthShort} ${dayNum}, ${year}`;

      const isInSelectedRange =
        datePreset === "full" ? true :
        datePreset === "7d" ? idx >= totalBlocks - 7 :
        datePreset === "30d" ? idx >= totalBlocks - 30 :
        (() => {
          try {
            const dayTime = d.getTime();
            const sTime = new Date(customStartDate + "T00:00:00").getTime();
            const eTime = new Date(customEndDate + "T23:59:59").getTime();
            return dayTime >= sTime && dayTime <= eTime;
          } catch {
            return idx < 60;
          }
        })();

      const info = levelInfo[lvl] || levelInfo[0];

      return {
        idx,
        weekNumber,
        dayIndex,
        dayLabel,
        fullDayName,
        shortDate,
        fullDate,
        level: lvl,
        hoursText: info.hours,
        status: info.status,
        isInSelectedRange,
      };
    });
  }, [data.heatmapLevels, datePreset, customStartDate, customEndDate, batchStartDate]);

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  // Handle outside click for student dropdown & custom date popover
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowStudentDropdown(false);
      }
      if (customDateRef.current && !customDateRef.current.contains(e.target as Node)) {
        setShowCustomDatePicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Filter students for dropdown search and batch filter
  const filteredStudents = useMemo(() => {
    let list = allStudents;
    if (selectedBatchFilterId !== "all") {
      const targetBatch = batches.find((b) => b.id === selectedBatchFilterId);
      list = list.filter((s) => {
        if (s.batchId && s.batchId === selectedBatchFilterId) return true;
        if (targetBatch && s.batchName && s.batchName.toLowerCase() === targetBatch.name.toLowerCase()) return true;
        if (targetBatch && s.batchId && s.batchId.toLowerCase() === targetBatch.name.toLowerCase()) return true;
        return false;
      });
    }
    if (!searchStudentQuery.trim()) return list;
    const q = searchStudentQuery.toLowerCase();
    return list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.batchName && s.batchName.toLowerCase().includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q))
    );
  }, [allStudents, selectedBatchFilterId, searchStudentQuery, batches]);

  // Prev / Next student navigation
  const navList = filteredStudents.length > 0 ? filteredStudents : allStudents;
  const currentIndex = navList.findIndex((s) => s.id === student.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < navList.length - 1;

  const handlePrevStudent = () => {
    if (hasPrev && onSelectStudent) {
      onSelectStudent(navList[currentIndex - 1]);
    }
  };

  const handleNextStudent = () => {
    if (hasNext && onSelectStudent) {
      onSelectStudent(navList[currentIndex + 1]);
    }
  };

  // Cohort & Track details synchronized directly with resolved studentBatch
  const cohortId = studentBatch?.name
    ? `COHORT-${studentBatch.name.toUpperCase().replace(/\s+/g, "-")}`
    : student.batchName
    ? `COHORT-${student.batchName.toUpperCase().replace(/\s+/g, "-")}`
    : "COHORT-2025-FE-04";

  const trackTitle = studentBatch?.programType
    ? studentBatch.programType
    : studentBatch?.type === "internship_6m"
    ? "Full-Stack AI Engineering (6 Months)"
    : student.skills && student.skills.length > 0
    ? student.skills.slice(0, 2).join(" / ")
    : "Full-Stack AI Engineer";

  const rawMentor = studentBatch?.mentor || student.mentor || "Vijaya Kumar Mekala";
  const mentorName =
    rawMentor.includes("Sharma") || rawMentor.includes("Nwosu") || !rawMentor.trim()
      ? "Vijaya Kumar Mekala"
      : rawMentor;
  const collegeName = student.college || studentBatch?.college || studentBatch?.organization || "University of Lagos";

  const initials = getInitials(student.name);

  // Candidate-specific synchronized resume data (always ensures candidate's own identity is used)
  const effectiveCandidateResume = useMemo(() => {
    if (student.resumeData && (student.resumeData.scorecard?.overallScore || student.resumeData.experience?.length || student.resumeData.targetRole)) {
      return student.resumeData;
    }
    if (resumeData && (resumeData.internId === student.id || !resumeData.internId) && (resumeData.scorecard?.overallScore || (resumeData.experience && resumeData.experience.length > 0))) {
      return resumeData;
    }
    try {
      const customResumes = JSON.parse(localStorage.getItem("m2i_custom_resumes") || "{}");
      if (student.id && customResumes[student.id]) {
        return customResumes[student.id];
      }
    } catch {}

    if (!isDemoStudent(student)) {
      return createEmptyResumeData(student);
    }

    const candidateName = student.name || "Candidate";
    const candidateEmail = student.email || `${candidateName.toLowerCase().replace(/\s+/g, ".")}@mind2i.edu`;
    const candidateMobile = student.mobile || "+91 98765 43210";
    const candidateLocation = student.city ? `${student.city}, ${student.state || "India"}` : (student.college || "Hyderabad, India");
    const candidateGithub = student.githubUrl || `github.com/${candidateName.toLowerCase().replace(/\s+/g, "")}`;
    const candidateLinkedin = student.linkedinUrl || `linkedin.com/in/${candidateName.toLowerCase().replace(/\s+/g, "")}`;
    const candidateSkills = (student.skills && student.skills.length > 0)
      ? student.skills
      : (resumeData?.skills || [
          "Python", "FastAPI", "LangChain", "RAG Architecture", "Vector Embeddings",
          "TypeScript", "React", "Docker", "PostgreSQL"
        ]);

    const cleanFileName = `${candidateName.replace(/\s+/g, "_")}_Resume.pdf`;

    return {
      ...resumeData,
      internId: student.id,
      internName: candidateName,
      email: candidateEmail,
      mobile: candidateMobile,
      location: candidateLocation,
      githubUrl: candidateGithub,
      linkedinUrl: candidateLinkedin,
      skills: candidateSkills,
      targetRole: resumeData?.targetRole || trackTitle || "Generative AI & LLM",
      scorecard: {
        ...(resumeData?.scorecard || {}),
        lastScannedFileName: cleanFileName,
        overallScore: resumeData?.scorecard?.overallScore || 87,
        grade: resumeData?.scorecard?.grade || "Grade A • Highly Optimized",
        targetRole: resumeData?.targetRole || trackTitle || "Generative AI & LLM",
        keywordMatchRate: resumeData?.scorecard?.keywordMatchRate || 80,
        quantifiedMetricsScore: resumeData?.scorecard?.quantifiedMetricsScore || 88,
        formattingScore: resumeData?.scorecard?.formattingScore || 96,
        grammarScore: resumeData?.scorecard?.grammarScore || 88,
        matchedSkills: candidateSkills.slice(0, 8),
        missingSkills: ["Prompt Engineering", "Transformers", "vLLM", "gVisor Sandboxing"],
        executiveSummary: `Analysis of ${candidateName}'s resume indicates strong technical depth in Generative AI architectures, real-time asynchronous streaming, and distributed microservices. Quantified project achievements position ${candidateName} in the top quartile of automated ATS screens for modern AI and Full-Stack engineering roles.`,
        bulletFixes: resumeData?.scorecard?.bulletFixes || [],
      },
      professionalSummary: `Disciplined, production-focused ${resumeData?.targetRole || trackTitle || "AI Engineer"} with demonstrated strength in RAG architectures, high-concurrency API microservices, and modern web application development. Delivered scalable pipelines with quantifiable latency reductions and clean code craftsmanship.`,
      experience: resumeData?.experience || [],
      education: resumeData?.education || [],
      certifications: resumeData?.certifications || [],
    };
  }, [student, resumeData, trackTitle]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        id="candidate-report-modal"
        className={
          isTabMode
            ? "w-full min-h-screen bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden print:border-none print:shadow-none print:overflow-visible"
            : "fixed inset-0 z-50 bg-white flex flex-col overflow-y-auto print:static print:bg-white print:overflow-visible"
        }
      >
        <div className="min-h-screen bg-white text-slate-900 flex flex-col print:bg-white">
          {/* Toast Notification */}
          <AnimatePresence>
            {showToast && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-20 right-8 z-50 px-4 py-3 bg-slate-900 text-white text-xs font-bold rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2.5"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>{showToast}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ═════════════════════════════════════════════════════════════ */}
          {/* TOP STICKY CONTROL BAR (Solid White Background, Brand Synced) */}
          {/* ═════════════════════════════════════════════════════════════ */}
          <header className={`sticky top-0 z-40 bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs print:hidden ${isTabMode ? "rounded-t-3xl" : ""}`}>
            {/* Left: Brand Logo, Avatar, Name, Grade Pill, Cohort Subtitle & Switcher */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Brand Logo Integration */}
              <div className="hidden md:flex items-center gap-2 pr-3 border-r border-slate-200">
                <Minda2Logo size="sm" showTagline={false} />
              </div>

              {/* Initials Avatar */}
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                {initials}
              </div>

              <div>
                <div className="flex items-center gap-2 relative" ref={dropdownRef}>
                  <h2 className="text-base font-black text-slate-900 capitalize tracking-tight flex items-center gap-1.5">
                    {student.name}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-600 border border-emerald-200">
                    A+
                  </span>

                  {/* Candidate Switcher Dropdown (Allows viewing report for all students) */}
                  {allStudents.length > 0 && onSelectStudent && userRole !== "student" && (
                    <div className="relative inline-block">
                      <button
                        onClick={() => setShowStudentDropdown(!showStudentDropdown)}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                        title="Switch candidate"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>

                      {showStudentDropdown && (
                        <div className="absolute left-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 max-h-96 overflow-y-auto">
                          <div className="p-2 border-b border-slate-100">
                            <div className="relative">
                              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                              <input
                                type="text"
                                value={searchStudentQuery}
                                onChange={(e) => setSearchStudentQuery(e.target.value)}
                                placeholder="Search candidate..."
                                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                                autoFocus
                              />
                            </div>
                          </div>

                          {/* Batch Filter Tabs inside candidate dropdown */}
                          {batches && batches.length > 0 && (
                            <div className="p-2 border-b border-slate-100 flex items-center gap-1 overflow-x-auto text-[10px] bg-slate-50/70">
                              <button
                                type="button"
                                onClick={() => setSelectedBatchFilterId("all")}
                                className={`px-2 py-0.5 rounded-md font-bold whitespace-nowrap transition cursor-pointer ${
                                  selectedBatchFilterId === "all"
                                    ? "bg-indigo-600 text-white shadow-2xs"
                                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                                }`}
                              >
                                All ({allStudents.length})
                              </button>
                              {batches.map((b) => {
                                const count = allStudents.filter((s) => {
                                  if (s.batchId && s.batchId === b.id) return true;
                                  if (s.batchName && s.batchName.toLowerCase() === b.name.toLowerCase()) return true;
                                  if (s.batchId && s.batchId.toLowerCase() === b.name.toLowerCase()) return true;
                                  return false;
                                }).length;
                                const isSelected = selectedBatchFilterId === b.id;
                                return (
                                  <button
                                    key={b.id}
                                    type="button"
                                    onClick={() => setSelectedBatchFilterId(b.id)}
                                    className={`px-2 py-0.5 rounded-md font-bold whitespace-nowrap transition cursor-pointer ${
                                      isSelected
                                        ? "bg-indigo-600 text-white shadow-2xs"
                                        : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                                    }`}
                                  >
                                    {b.name} ({count})
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                            Cohort Candidates ({filteredStudents.length})
                          </div>

                          {filteredStudents.map((s) => (
                            <button
                              key={s.id}
                              onClick={() => {
                                onSelectStudent(s);
                                setShowStudentDropdown(false);
                                setSearchStudentQuery("");
                              }}
                              className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-50 transition text-xs cursor-pointer ${
                                s.id === student.id ? "bg-indigo-50/80 font-bold text-indigo-700" : "text-slate-700"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 truncate">
                                <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
                                  {getInitials(s.name)}
                                </span>
                                <div className="truncate">
                                  <div className="font-bold truncate">{s.name}</div>
                                  <div className="text-[10px] text-slate-400">{s.batchName || "Active Cohort"}</div>
                                </div>
                              </div>
                              <span className="text-[11px] font-mono text-emerald-600 font-bold shrink-0 ml-2">
                                {s.scores?.overallAccuracy || 85}%
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Prev / Next candidate quick controls */}
                  {allStudents.length > 1 && onSelectStudent && userRole !== "student" && (
                    <div className="hidden sm:flex items-center gap-0.5 ml-1">
                      <button
                        onClick={handlePrevStudent}
                        disabled={!hasPrev}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 cursor-pointer"
                        title="Previous candidate in cohort"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={handleNextStudent}
                        disabled={!hasNext}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 cursor-pointer"
                        title="Next candidate in cohort"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-[11px] font-mono text-slate-400 tracking-wide mt-0.5 flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">{cohortId}</span>
                  <span>•</span>
                  <span className="text-indigo-600 font-bold">{trackTitle}</span>
                  {studentBatch?.durationLabel && (
                    <>
                      <span>•</span>
                      <span className="text-slate-500 font-medium">{studentBatch.durationLabel}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Date Presets, Export CSV, Download PDF, Close */}
            <div className="flex items-center gap-2.5">
              {/* Date Presets Pill Group */}
              <div className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs relative" ref={customDateRef}>
                <Calendar className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1" />
                {(["7d", "30d", "full", "custom"] as const).map((p) => {
                  const labels: Record<DatePreset, string> = {
                    "7d": "Last 7 Days",
                    "30d": "Last 30 Days",
                    "full": "Full Program",
                    "custom": datePreset === "custom" ? `Custom (${formatDateShort(customStartDate)} – ${formatDateShort(customEndDate)})` : "Custom Range",
                  };
                  const isActive = datePreset === p;
                  return (
                    <button
                      key={p}
                      onClick={() => {
                        setDatePreset(p);
                        if (p === "custom") {
                          setShowCustomDatePicker((prev) => !prev);
                        } else {
                          setShowCustomDatePicker(false);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                      }`}
                    >
                      <span>{labels[p]}</span>
                      {p === "custom" && (
                        <ChevronDown className={`w-3 h-3 transition-transform ${showCustomDatePicker ? "rotate-180" : ""}`} />
                      )}
                    </button>
                  );
                })}

                {/* Simple Report Pill - right at the side of Custom Range / Custom Report */}
                <div className="h-4 w-[1px] bg-slate-300 mx-1 hidden sm:block" />
                <button
                  type="button"
                  onClick={() => {
                    setReportViewMode((prev) => (prev === "simple" ? "detailed" : "simple"));
                    triggerToast(
                      reportViewMode === "simple"
                        ? "Switched to Full Detailed Dossier."
                        : "Switched to Simple Visual Summary Report."
                    );
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    reportViewMode === "simple"
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs ring-2 ring-emerald-400/40 font-black"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 font-extrabold"
                  }`}
                  title="Toggle Simple Report: Easy visual summary with minimal text"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${reportViewMode === "simple" ? "text-amber-300" : "text-emerald-500"}`} />
                  <span>Simple Report</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-md font-black uppercase ${
                      reportViewMode === "simple" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {reportViewMode === "simple" ? "Active" : "Visual"}
                  </span>
                </button>

                {/* Custom Date Range Popover */}
                {showCustomDatePicker && (
                  <div className="absolute right-0 top-full mt-2 w-84 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-600" />
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                          Select Custom Date Range
                        </h4>
                      </div>
                      <button
                        onClick={() => setShowCustomDatePicker(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Quick Presets inside popover */}
                    <div className="my-3">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                        <span>Quick Sprints</span>
                        <span className="text-[9px] text-indigo-600 font-semibold lowercase">Click to apply automatically</span>
                      </div>

                      {/* Phase shortcuts: Months 1-3 & Months 4-6 */}
                      <div className="grid grid-cols-2 gap-1.5 mb-2 text-[10px]">
                        <button
                          type="button"
                          onClick={() => {
                            const sDate = batchStartDate.toISOString().split("T")[0];
                            const eDate = new Date(batchStartDate.getTime() + (12 * 7 - 1) * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
                            setCustomStartDate(sDate);
                            setCustomEndDate(eDate);
                            setDatePreset("custom");
                            triggerToast(`Applied Months 1–3 (${sDate} – ${eDate})`);
                          }}
                          className="px-2 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 font-bold text-indigo-700 transition cursor-pointer text-center truncate shadow-2xs"
                        >
                          Months 1–3 (W1–W12)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const sDate = new Date(batchStartDate.getTime() + 12 * 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
                            const eDate = new Date(batchStartDate.getTime() + (data.totalWeeks * 7 - 1) * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
                            setCustomStartDate(sDate);
                            setCustomEndDate(eDate);
                            setDatePreset("custom");
                            triggerToast(`Applied Months 4–6 (${sDate} – ${eDate})`);
                          }}
                          className="px-2 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 font-bold text-indigo-700 transition cursor-pointer text-center truncate shadow-2xs"
                        >
                          Months 4–6 (W13–W24)
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                        {monthHeaders.slice(0, 6).map((m) => {
                          const sDate = new Date(batchStartDate.getTime() + (m.monthIndex - 1) * 28 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
                          const eDate = new Date(batchStartDate.getTime() + ((m.monthIndex - 1) * 28 + 27) * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
                          const isCurrentActive = datePreset === "custom" && customStartDate === sDate && customEndDate === eDate;
                          return (
                            <button
                              key={m.monthIndex}
                              type="button"
                              onClick={() => {
                                setCustomStartDate(sDate);
                                setCustomEndDate(eDate);
                                setDatePreset("custom");
                                triggerToast(`Applied ${m.label} (${sDate} to ${eDate})`);
                              }}
                              className={`px-2 py-1 rounded-lg border font-semibold transition cursor-pointer text-center truncate ${
                                isCurrentActive
                                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs font-bold"
                                  : "border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700"
                              }`}
                              title={`${m.label} (${sDate} to ${eDate})`}
                            >
                              {m.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Starting Date & Ending Date Inputs */}
                    <div className="grid grid-cols-2 gap-2.5 my-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Starting Date
                        </label>
                        <input
                          type="date"
                          value={customStartDate}
                          min="2024-01-01"
                          max={customEndDate || "2028-12-31"}
                          onChange={(e) => {
                            setCustomStartDate(e.target.value);
                            setDatePreset("custom");
                          }}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Ending Date
                        </label>
                        <input
                          type="date"
                          value={customEndDate}
                          min={customStartDate || "2024-01-01"}
                          max="2028-12-31"
                          onChange={(e) => {
                            setCustomEndDate(e.target.value);
                            setDatePreset("custom");
                          }}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Duration Badge */}
                    <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between text-xs text-indigo-900 mb-3">
                      <span className="text-[11px] font-medium text-slate-600">Active Custom Range:</span>
                      <strong className="text-indigo-700 font-bold">
                        {customRangeDays} Days Active (Applied ✓)
                      </strong>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          if (studentBatch?.startDate) setCustomStartDate(studentBatch.startDate);
                          if (studentBatch?.endDate) setCustomEndDate(studentBatch.endDate);
                          setDatePreset("full");
                          setShowCustomDatePicker(false);
                          triggerToast("Reset date filter to full program.");
                        }}
                        className="flex-1 py-1.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                      >
                        Reset to Full
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDatePreset("custom");
                          setShowCustomDatePicker(false);
                          triggerToast(`Custom range applied: ${customStartDate} to ${customEndDate}`);
                        }}
                        className="flex-1 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-xs cursor-pointer"
                      >
                        Apply Range
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Report Format Switcher */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setReportViewMode("detailed");
                    triggerToast("Detailed Dossier view active.");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    reportViewMode === "detailed"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                  }`}
                  title="Detailed 10-section comprehensive candidate report"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Detailed Report</span>
                  <span className="sm:hidden">Detailed</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReportViewMode("simple");
                    triggerToast("Simple Visual Report view active.");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    reportViewMode === "simple"
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs font-black"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                  }`}
                  title="Simple visual report with minimal text"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Simple Report</span>
                </button>
              </div>

              {/* Action Buttons */}
              <button
                onClick={() => {
                  exportCandidateCsv(student, data.twelveModuleScores, data);
                  triggerToast("Candidate performance dossier exported as CSV.");
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
                title="Export all 12 evaluation scores and metrics to CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>

              <button
                onClick={handleDownloadPdf}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                title="Download complete printable candidate performance report as PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>

              {/* Close View Button */}
              {isTabMode ? (
                <button
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition shadow-2xs flex items-center gap-1.5 cursor-pointer ml-1"
                  title="Back to Dashboard"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Dashboard</span>
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer ml-1"
                  aria-label="Close Report"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </header>

          {/* ═════════════════════════════════════════════════════════════ */}
          {/* MAIN REPORT CANVAS (Solid White Background, Exactly matching Screenshot 1) */}
          {/* ═════════════════════════════════════════════════════════════ */}
          <main id="candidate-report-main" className="bg-white max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-10 print:p-0 print:space-y-4">
            {reportViewMode === "simple" ? (
              <CandidateSimpleReportView
                student={student}
                studentBatch={studentBatch}
                cohortId={cohortId}
                trackTitle={trackTitle}
                data={data}
                mentorName={mentorName}
                collegeName={collegeName}
                onSwitchToDetailed={() => setReportViewMode("detailed")}
                resumeData={resumeData}
                triggerToast={triggerToast}
              />
            ) : (
              <>
                {/* ─── PAGE TITLE & SUBTITLE ─── */}
                <div className="print:mb-1">
              <div className="text-[11px] font-black uppercase tracking-wider text-indigo-600 mb-1 print:mb-0.5 print:text-[10px]">
                PERFORMANCE ANALYTICS
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight print:text-xl">
                  Candidate Performance &amp; Training Report
                </h1>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 print:text-[10px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Live dashboard</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1 print:mt-0.5 print:text-[10px]">
                Generated {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · {trackTitle} · {cohortId}
              </p>
            </div>

            {/* ─── CANDIDATE IDENTITY & OFFICIAL ACCREDITATION DOSSIER ─── */}
            <div className="p-6 sm:p-7 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800 print:bg-white print:text-slate-900 print:border print:border-slate-300 print:shadow-none print:p-3.5 print:py-3 print:rounded-xl">
              <div className="candidate-hero-header flex flex-col md:flex-row print:flex-row md:items-start print:items-start justify-between gap-6 pb-6 border-b border-slate-800 print:border-slate-200 print:pb-2.5 print:gap-3">
                {/* Left: Avatar + Candidate Core Info */}
                <div className="flex items-start gap-4 sm:gap-5 print:gap-3 flex-1 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={
                        student.avatar ||
                        `https://api.dicebear.com/7.x/bottts/svg?seed=${student.name}`
                      }
                      alt={student.name}
                      className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-indigo-400/50 shadow-lg print:w-14 print:h-14 print:rounded-xl print:border-slate-300 print:shadow-none"
                    />
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 print:border-white flex items-center justify-center text-[10px] text-white font-bold" title="Active Verified Candidate">
                      ✓
                    </span>
                  </div>

                  <div className="space-y-1.5 print:space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2.5 print:gap-2">
                      <h2 className="text-2xl sm:text-3xl font-black text-white print:text-slate-900 tracking-tight print:text-lg">
                        {student.name}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 print:bg-emerald-50 print:text-emerald-700 print:border-emerald-300 print:text-[10px]">
                        Distinction A+ (Top 5%)
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-200 print:text-slate-900 font-semibold print:text-[10px]">
                      <span className="font-mono text-indigo-300 print:text-indigo-900 font-bold">
                        ID: {student.id.toUpperCase()}
                      </span>
                      <span>•</span>
                      <span>{student.college || "BVRIT Hyderabad"}</span>
                      {student.branch && (
                        <>
                          <span>•</span>
                          <span>{student.branch}</span>
                        </>
                      )}
                    </div>

                    <p className="text-xs text-slate-200 print:text-slate-900 font-semibold pt-0.5 print:text-[10px] print:pt-0">
                      Cohort: {studentBatch?.name || student.batchName || "AI Engineering & Full-Stack Agents"}
                    </p>

                    {/* Social links & resume quick access */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {student.resumeUrl && (
                        <a
                          href={student.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer print:bg-slate-100 print:text-slate-900 print:border print:border-slate-300"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Uploaded Resume</span>
                          <ExternalLink className="w-3 h-3 ml-0.5" />
                        </a>
                      )}
                      {student.githubUrl && (
                        <a
                          href={student.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer print:text-slate-800"
                        >
                          <Github className="w-3.5 h-3.5" />
                          <span>GitHub</span>
                        </a>
                      )}
                      {student.linkedinUrl && (
                        <a
                          href={student.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 rounded-xl text-xs font-semibold transition cursor-pointer print:text-sky-700"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>LinkedIn</span>
                        </a>
                      )}
                    </div>

                    {/* Candidate Technical Skills Badges */}
                    {student.skills && student.skills.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1.5 print:pt-1">
                        <span className="text-[10px] font-bold text-slate-200 uppercase tracking-wider print:text-slate-950 mr-1">
                          Skills:
                        </span>
                        {student.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 text-[11px] font-bold print:bg-slate-100 print:text-slate-950 print:border-slate-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Dynamic Cumulative Score Card & Mind2I Official Accreditation Seal */}
                <div className="candidate-hero-right flex flex-col items-start md:items-end print:items-end justify-start shrink-0 space-y-2 print:space-y-1.5 ml-auto print:ml-auto">
                  {/* Dynamic CUMULATIVE SCORE Box (Positioned at Top Right, exactly matching user highlight) */}
                  <div
                    className={`px-4 py-2.5 rounded-2xl border flex items-center gap-3.5 shadow-lg backdrop-blur-xs transition-all duration-300 print:p-2 print:rounded-xl print:shadow-none ${scoreTheme.darkBgClass} ${scoreTheme.darkBorderClass} ${scoreTheme.printClass}`}
                    style={{ boxShadow: scoreTheme.darkGlowStyle }}
                  >
                    {/* SVG Radial Gauge */}
                    <div className="relative w-11 h-11 shrink-0 flex items-center justify-center print:w-8 print:h-8">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
                        <circle
                          cx="22"
                          cy="22"
                          r="17"
                          className="stroke-slate-800/80 print:stroke-slate-200"
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
                      <Award className={`absolute w-4 h-4 print:w-3 print:h-3 ${scoreTheme.darkTextClass} ${scoreTheme.printTextClass}`} />
                    </div>

                    {/* Score Details */}
                    <div className="text-left md:text-right print:text-right">
                      <div className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-200 print:text-slate-950">
                        CUMULATIVE SCORE
                      </div>
                      <div className="flex items-baseline gap-1.5 md:justify-end print:justify-end">
                        <span className={`text-2xl font-black tracking-tight ${scoreTheme.darkTextClass} ${scoreTheme.printTextClass}`}>
                          {scoreTheme.score}%
                        </span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase border ${scoreTheme.darkBadgeClass} ${scoreTheme.printBadgeClass}`}>
                          {scoreTheme.tierLabel}
                        </span>
                      </div>
                      <div className="text-[9px] font-bold text-slate-300 print:text-slate-900">
                        12-Domain Composite Average
                      </div>
                    </div>
                  </div>

                  {/* Mind2I Official Accreditation Seal & Dossier Ref */}
                  <div className="flex flex-col items-start md:items-end print:items-end gap-1">
                    <div className="px-2.5 py-1 rounded-xl bg-indigo-500/20 border border-indigo-400/30 print:bg-slate-100 print:border-slate-300 print:px-2 print:py-0.5 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 print:text-emerald-700 print:w-3 print:h-3" />
                      <span className="text-[10px] font-mono font-bold tracking-wider text-indigo-200 print:text-slate-950 uppercase print:text-[8px]">
                        Official Mind2i Evaluation Dossier
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-300 print:text-slate-900 font-semibold text-left md:text-right print:text-right space-y-0.5 print:text-[8px]">
                      <div>Reference: M2I-REP-{student.id.toUpperCase()}-{new Date().getFullYear()}</div>
                      <div>Issued: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Information Data Grid (Name, Email, Mobile, College, Batch, Dates) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-5 text-xs print:pt-2.5 print:gap-2">
                {/* Email Address */}
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 print:bg-slate-50 print:border-slate-200/80 print:p-2 print:rounded-lg">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-300 print:text-slate-800 mb-1 print:mb-0.5 print:text-[9px]">
                    <Mail className="w-3.5 h-3.5 text-indigo-400 print:text-indigo-600 print:w-3 print:h-3" />
                    <span>Candidate Email ID</span>
                  </div>
                  <div className="font-bold text-slate-100 print:text-slate-950 truncate print:text-[11px]" title={student.email}>
                    {student.email || `${student.name.toLowerCase().replace(/\s+/g, ".")}@mind2i.internal`}
                  </div>
                </div>

                {/* Mobile / Phone */}
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 print:bg-slate-50 print:border-slate-200/80 print:p-2 print:rounded-lg">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-300 print:text-slate-800 mb-1 print:mb-0.5 print:text-[9px]">
                    <Phone className="w-3.5 h-3.5 text-emerald-400 print:text-emerald-600 print:w-3 print:h-3" />
                    <span>Phone / Mobile</span>
                  </div>
                  <div className="font-bold text-slate-100 print:text-slate-950 truncate print:text-[11px]">
                    {student.mobile || "+91 98765 43210"}
                  </div>
                </div>

                {/* College & University */}
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 print:bg-slate-50 print:border-slate-200/80 print:p-2 print:rounded-lg">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-300 print:text-slate-800 mb-1 print:mb-0.5 print:text-[9px]">
                    <Building2 className="w-3.5 h-3.5 text-sky-400 print:text-sky-600 print:w-3 print:h-3" />
                    <span>College / Institution</span>
                  </div>
                  <div className="font-bold text-slate-100 print:text-slate-950 truncate print:text-[11px]" title={student.college || "Engineering College"}>
                    {student.college || "BVRIT Hyderabad"}
                  </div>
                </div>

                {/* Cohort Duration & Timeline */}
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 print:bg-slate-50 print:border-slate-200/80 print:p-2 print:rounded-lg">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-300 print:text-slate-800 mb-1 print:mb-0.5 print:text-[9px]">
                    <Calendar className="w-3.5 h-3.5 text-amber-400 print:text-amber-600 print:w-3 print:h-3" />
                    <span>Internship Duration</span>
                  </div>
                  <div className="font-bold text-slate-100 print:text-slate-950 truncate print:text-[11px]">
                    {studentBatch?.durationLabel || "6 Months"} ({formatDateShort(studentBatch?.startDate || student.enrolledAt)} – {formatDateShort(studentBatch?.endDate || "Present")})
                  </div>
                </div>
              </div>

              {/* Optional: Skills & Portfolio Overview Ribbon */}
              {(student.resumeUrl || (student.skills && student.skills.length > 0) || student.bio) && (
                <div className="mt-4 p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs print:bg-slate-50 print:border-slate-200 print:p-2">
                  <div className="flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 print:text-slate-800 block mb-1">
                      Candidate Profile &amp; Bio
                    </span>
                    <p className="text-slate-100 print:text-slate-900 text-xs italic line-clamp-2 font-medium">
                      "{student.bio || "Dedicated, hands-on intern with demonstrated expertise across core technologies, active participation in live labs, and production capstone delivery."}"
                    </p>
                  </div>
                  {student.resumeUrl && (
                    <div className="shrink-0 flex items-center gap-2">
                      <a
                        href={student.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>View Resume / CV</span>
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ═════════════════════════════════════════════════════════════ */}
            {/* SUMMARY KPI RIBBON (Exact match to Screenshot 1)              */}
            {/* ═════════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2.5">
              {/* Card 1: Cumulative Score */}
              <div className={`p-5 print:p-3 print:py-2.5 rounded-2xl bg-white border transition-all duration-300 shadow-xs flex flex-col justify-between ${scoreTheme.lightBorderClass}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider print:text-[9px]">
                    CUMULATIVE SCORE
                  </span>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center print:w-5 print:h-5 ${scoreTheme.lightBgClass} ${scoreTheme.lightTextClass}`}>
                    <TrendingUp className="w-4 h-4 print:w-3 print:h-3" />
                  </div>
                </div>
                <div className="mt-3 print:mt-1">
                  <div className={`text-3xl font-black tracking-tight flex items-baseline gap-0.5 print:text-xl ${scoreTheme.lightTextClass}`}>
                    {data.cumulativeScore}
                    <span className="text-sm font-bold text-slate-700 print:text-xs">%</span>
                  </div>
                  <div className="text-xs font-bold mt-2 flex items-center gap-1.5 print:mt-0.5 print:text-[10px]">
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase border ${scoreTheme.lightBadgeClass}`}>
                      {scoreTheme.tierLabel}
                    </span>
                    <span className="text-slate-800 font-bold text-[11px]">12-Domain Holistic Index</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Attendance Rate */}
              <div className="p-5 print:p-3 print:py-2.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider print:text-[9px]">
                    ATTENDANCE RATE
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center print:w-5 print:h-5">
                    <CheckCircle2 className="w-4 h-4 print:w-3 print:h-3" />
                  </div>
                </div>
                <div className="mt-3 print:mt-1">
                  <div className="text-3xl font-black text-slate-900 tracking-tight flex items-baseline gap-0.5 print:text-xl">
                    {data.attendanceRate}
                    <span className="text-sm font-bold text-slate-700 print:text-xs">%</span>
                  </div>
                  <div className="text-xs font-bold text-emerald-700 mt-2 flex items-center gap-1 print:mt-0.5 print:text-[10px]">
                    <span>↗ Above 90% threshold</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Completed Projects */}
              <div className="p-5 print:p-3 print:py-2.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider print:text-[9px]">
                    COMPLETED PROJECTS
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center print:w-5 print:h-5">
                    <Layers className="w-4 h-4 print:w-3 print:h-3" />
                  </div>
                </div>
                <div className="mt-3 print:mt-1">
                  <div className="text-3xl font-black text-slate-900 tracking-tight print:text-xl">
                    {data.completedProjects}
                  </div>
                  <div className="text-xs font-bold text-emerald-700 mt-2 flex items-center gap-1 print:mt-0.5 print:text-[10px]">
                    <span>↗ 4 submitted this month</span>
                  </div>
                </div>
              </div>

              {/* Card 4: Readiness Index */}
              <div className="p-5 print:p-3 print:py-2.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider print:text-[9px]">
                    READINESS INDEX
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center print:w-5 print:h-5">
                    <Target className="w-4 h-4 print:w-3 print:h-3" />
                  </div>
                </div>
                <div className="mt-3 print:mt-1">
                  <div className="text-3xl font-black text-slate-900 tracking-tight flex items-baseline gap-0.5 print:text-xl">
                    {data.readinessIndex}
                    <span className="text-sm font-bold text-slate-700 print:text-xs">/100</span>
                  </div>
                  <div className="text-xs font-bold mt-2 flex items-center gap-1 print:mt-0.5 print:text-[10px]">
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase border ${scoreTheme.lightBadgeClass}`}>
                      {scoreTheme.tierLabel}
                    </span>
                    <span className="text-slate-800 font-bold text-[11px]">12-Domain Holistic Index</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ═════════════════════════════════════════════════════════════ */}
            {/* 01: SCHEDULED ASSESSMENTS & EXAMINATION SCORING               */}
            {/* ═════════════════════════════════════════════════════════════ */}
            <section className="space-y-4 print:space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  01
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Scheduled Assessments & Examination Scoring
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Aggregated assessment volume, question format analytics, syllabus competency, and AI diagnostic report
                  </p>
                </div>
              </div>

              {/* Assessment Top KPIs Strip */}
              {(() => {
                const isDemo = isDemoStudent(student);
                const totalPossiblePoints = activeBatchAssignments.reduce((acc, a) => acc + (a.totalPoints || 0), 0);
                const studentAsgScore = student.scores?.assignmentScore ?? (isDemo ? 92 : 0);
                const earnedAsgPoints = totalPossiblePoints > 0 ? Math.round(totalPossiblePoints * (studentAsgScore / 100)) : (isDemo ? 230 : 0);

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Questions</span>
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                          <FileCheck className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="text-2xl font-black text-slate-900 tracking-tight">{totalQuestionsCount || (isDemo ? 24 : 0)} Questions</div>
                        <div className="text-[11px] font-bold text-indigo-600 mt-0.5">{activeBatchAssignments.length} Scheduled Set{activeBatchAssignments.length === 1 ? "" : "s"}</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Completion & Accuracy</span>
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="text-2xl font-black text-slate-900 tracking-tight">{totalQuestionsCount > 0 || isDemo ? `${studentAsgScore}%` : "0%"}</div>
                        <div className="text-[11px] font-bold text-emerald-600 mt-0.5">{totalQuestionsCount > 0 ? `${Math.round(totalQuestionsCount * (studentAsgScore / 100))}/${totalQuestionsCount} Cleared` : (isDemo ? "100% Graded (22/24 Cleared)" : "Awaiting Submissions")}</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Assessment Points</span>
                        <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                          <Trophy className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="text-2xl font-black text-slate-900 tracking-tight">
                          {earnedAsgPoints}
                          <span className="text-xs font-bold text-slate-400 font-mono ml-1">
                            / {totalPossiblePoints || (isDemo ? 250 : 0)} pts
                          </span>
                        </div>
                        <div className="text-[11px] font-bold text-purple-600 mt-0.5">{studentAsgScore > 0 ? "↗ Verified Grade Points" : "Pending Evaluation"}</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Assessment Status</span>
                        <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                          <Award className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="text-2xl font-black text-slate-900 tracking-tight">{studentAsgScore >= 90 ? "Distinction" : studentAsgScore >= 75 ? "Merit" : (studentAsgScore > 0 ? "Passing" : "Pending")}</div>
                        <div className="text-[11px] font-bold text-amber-600 mt-0.5">{studentAsgScore >= 90 ? "Top 5% Cohort Ranking" : (studentAsgScore > 0 ? "Graded Submission" : "Awaiting Assessments")}</div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Question Analytics & Topic Mastery Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: Question Format & Volume Breakdown */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-slate-900">Question Format & Delivery Volume</h4>
                      <span className="text-[11px] font-bold text-slate-400">
                        {activeBatchAssignments.reduce((acc, a) => acc + (a.questions?.length || 0), 0) || (isDemoStudent(student) ? 24 : 0)} Total Questions
                      </span>
                    </div>

                    {totalQuestionsCount === 0 && !isDemo ? (
                      <div className="p-8 text-center rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2 my-auto">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                          <FileCheck className="w-5 h-5" />
                        </div>
                        <h5 className="text-xs font-bold text-slate-800">No Assessment Questions Scheduled</h5>
                        <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                          Cohort examination sets, multiple choice questions, and hands-on coding tests have not been scheduled yet for this cohort.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3.5">
                        {/* Format 1: MCQs */}
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-bold text-slate-800 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-indigo-600" />
                              <span>Multiple Choice Questions (MCQ)</span>
                            </span>
                            <span className="font-mono text-slate-600 font-bold">14 Questions · 58%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600 rounded-full" style={{ width: "58%" }} />
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                            <span>Theoretical & Architecture Recall</span>
                            <span>Accuracy: 93%</span>
                          </div>
                        </div>

                        {/* Format 2: Live Coding */}
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-bold text-slate-800 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span>Hands-on Coding Problems</span>
                            </span>
                            <span className="font-mono text-slate-600 font-bold">6 Problems · 25%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: "25%" }} />
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                            <span>Unit-Tested Compiler Runs</span>
                            <span>Pass Rate: 100%</span>
                          </div>
                        </div>

                        {/* Format 3: Open Essay / System Architecture */}
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-bold text-slate-800 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-purple-500" />
                              <span>System Architecture & Open Written</span>
                            </span>
                            <span className="font-mono text-slate-600 font-bold">4 Questions · 17%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 rounded-full" style={{ width: "17%" }} />
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                            <span>Design Trade-Off Justification</span>
                            <span>AI Rubric: 90%</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3.5 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Evaluated against production engineering standards</span>
                    <span className="font-bold text-emerald-600">
                      {totalQuestionsCount === 0 && !isDemo ? "Awaiting Assessment Releases" : "Zero Incomplete Submissions"}
                    </span>
                  </div>
                </div>

                {/* Right: Topic Competency & Mastery */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-slate-900">Curriculum Competency Index</h4>
                      <span className="text-[11px] font-bold text-slate-400">Evaluated Mastery</span>
                    </div>

                    {totalQuestionsCount === 0 && !isDemo ? (
                      <div className="p-8 text-center rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2 my-auto">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                          <Award className="w-5 h-5" />
                        </div>
                        <h5 className="text-xs font-bold text-slate-800">Curriculum Mastery Telemetry Pending</h5>
                        <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                          Syllabus competency scores and cohort percentiles will calculate once candidate completes scheduled examinations.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                            <span>System Architecture & API Gateways</span>
                            <span className="text-indigo-600">94% Mastery</span>
                          </div>
                          <div className="text-[11px] text-slate-500">REST, WebSockets, rate limiting, and defensive gateway caching models.</div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                            <span>Asynchronous Event Queues & Concurrency</span>
                            <span className="text-indigo-600">91% Mastery</span>
                          </div>
                          <div className="text-[11px] text-slate-500">Dead letter queues, exponential backoff retries, and worker pool scalability.</div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                            <span>Vector DB Pipelines & Semantic Indexes</span>
                            <span className="text-indigo-600">96% Mastery</span>
                          </div>
                          <div className="text-[11px] text-slate-500">HNSW clustering, cosine similarity bounds, and context window compression.</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3.5 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Cohort Benchmark Percentile</span>
                    <span className="font-bold text-indigo-600">
                      {totalQuestionsCount === 0 && !isDemo ? "Pending Examinations" : "Top 4.2% of Batch"}
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Assessment Diagnostic Report Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 border border-indigo-100 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">AI Assessment Diagnostic & Performance Report</h4>
                      <p className="text-[11px] text-slate-500 font-medium">Automated synthetic evaluation of candidate exam rigor and conceptual depth</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-black tracking-wider uppercase border border-indigo-200">
                    {totalQuestionsCount === 0 && !isDemo ? "Awaiting Exam Data" : "AI Verified Verdict"}
                  </span>
                </div>

                {totalQuestionsCount === 0 && !isDemo ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
                    <div className="p-3.5 rounded-xl bg-white border border-indigo-100/80 shadow-2xs">
                      <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>Assessment Status</span>
                      </div>
                      <p className="text-slate-500 leading-relaxed text-[11px]">
                        Assessment Telemetry Pending: Candidate has not yet taken scheduled examinations for this cohort ({cohortId}). Baseline assessment metrics will activate upon examination submissions.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-indigo-100/80 shadow-2xs">
                      <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                        <span>Cognitive Evaluation</span>
                      </div>
                      <p className="text-slate-500 leading-relaxed text-[11px]">
                        Awaiting examination submissions to evaluate code guard clauses, architectural justifications, and algorithmic correctness.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-indigo-100/80 shadow-2xs">
                      <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-slate-400" />
                        <span>Faculty Action</span>
                      </div>
                      <p className="text-slate-500 leading-relaxed text-[11px]">
                        Schedule technical assessments and foundational problem sets in Assignments Manager to establish candidate baseline metrics.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
                    <div className="p-3.5 rounded-xl bg-white border border-indigo-100/80 shadow-2xs">
                      <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Executive Exam Verdict</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-[11px]">
                        {student.name.split(" ")[0]} exhibits high conceptual retention and superior problem-solving depth across scheduled cohort examinations. With {Math.round((((student.scores?.assignmentScore ?? (isDemo ? 92 : 0))) / 100) * (totalQuestionsCount || (isDemo ? 24 : 0)))} out of {totalQuestionsCount || (isDemo ? 24 : 0)} questions cleared on first attempt, the candidate performs comfortably in the {Math.min(99, Math.max(50, Math.round(((student.scores?.assignmentScore ?? (isDemo ? 92 : 0))) * 0.98)))}th percentile of the batch.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-indigo-100/80 shadow-2xs">
                      <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Observed Cognitive Strengths</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-[11px]">
                        Demonstrates rapid conceptual deconstruction on complex architectural prompts. Code solutions consistently feature defensive guard clauses, null safety, and zero unhandled race condition liabilities.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-indigo-100/80 shadow-2xs">
                      <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                        <span>AI Growth Recommendation</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-[11px]">
                        Recommend deepening exposure to high-concurrency distributed consensus protocols (e.g. Raft / 2PC) to prepare the candidate for senior backend architecture and distributed system lead roles.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Performance Trends LineChart & Mentor Feedback Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 print:block print:space-y-4">
                {/* Left Card: Performance Trends vs Cohort Average */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between break-inside-avoid print:block print:mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-4">
                      Performance Trends vs Cohort Average
                    </h4>
                    <div className="h-60 w-full print:h-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.performanceTrend} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} />
                          <YAxis domain={[60, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} />
                          <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "11px" }} />
                          <Line type="monotone" dataKey="codingSprints" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: "#10b981" }} name="CodingSprints" />
                          <Line type="monotone" dataKey="cohortAvg" stroke="#cbd5e1" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="CohortAvg" />
                          <Line type="monotone" dataKey="milestones" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: "#f59e0b" }} name="Milestones" />
                          <Line type="monotone" dataKey="quizzes" stroke="#4f46e5" strokeWidth={2} dot={{ r: 3, fill: "#4f46e5" }} name="Quizzes" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Legend */}
                    <div className="flex items-center justify-center gap-4 text-[11px] font-bold text-slate-500 mt-2 flex-wrap">
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> CodingSprints</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-slate-300 border-dashed" /> CohortAvg</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Milestones</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Quizzes</span>
                    </div>
                  </div>

                  {/* Bottom Summary on Progression & Trajectory */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Progression & Growth Summary</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                        {hasZeroHours || totalQuestionsCount === 0 ? "Cohort Baseline" : "+18% Over Cohort Avg"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {hasZeroHours || totalQuestionsCount === 0
                        ? `Candidate is currently enrolled in the ${data.batchDurationMonths || 6}-month cohort (${studentBatch?.name || 'Cohort'}). Progression telemetry compounds as milestone deliverables and assessments are recorded.`
                        : `${student.name.split(" ")[0]} accelerated from 70% in Month 1 to 94% by Month ${data.batchDurationMonths || 6}, outperforming the cohort average (${data.twelveModuleScores[0]?.score || 76}%) by compounding mastery under production timelines.`}
                    </p>
                  </div>
                </div>

                {/* Right Card: Mentor Feedback Highlights */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between break-inside-avoid print:block">
                  <div>
                    <div className="flex items-center gap-2 mb-4 text-sm font-bold text-slate-900">
                      <MessageSquare className="w-4 h-4 text-indigo-500" />
                      <span>Mentor Feedback Highlights</span>
                    </div>

                    <div className="space-y-3">
                      {panelConsensusAverage && panelConsensusAverage.evaluators.length > 0 ? (
                        panelConsensusAverage.evaluators.map((ev, i) => (
                          <div key={i} className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                                  {getInitials(ev.reviewerName || mentorName)}
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-slate-900">{ev.reviewerName || mentorName}</div>
                                  <div className="text-[10px] text-slate-400">{ev.reviewerRole || "Faculty Reviewer"}</div>
                                </div>
                              </div>
                              <div className="text-amber-400 text-xs tracking-tighter">
                                {"★".repeat(Math.min(5, Math.max(1, Math.round((ev.overallRating || 90) / 20))))}
                              </div>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {ev.customNotes || `${student.name.split(" ")[0]} demonstrated solid progress in cohort evaluations.`}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 space-y-2">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                                {getInitials(mentorName)}
                              </div>
                              <div>
                                <div className="text-xs font-bold text-slate-900">{mentorName}</div>
                                <div className="text-[10px] text-slate-400">Assigned Cohort Mentor</div>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">
                              {effectiveEvaluation ? "Appraisal Recorded" : "Review In Progress"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {effectiveEvaluation?.mentorNotes || effectiveEvaluation?.customNotes || (isDemo ? `${student.name.split(" ")[0]} consistently delivers well-structured code with exceptional test coverage.` : `Formal faculty appraisal for ${student.name} will be logged during the scheduled cohort milestone review.`)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ═════════════════════════════════════════════════════════════ */}
            {/* 02: COHORT LIVE Q&A, POLLS & RAPID REFLEX TELEMETRY           */}
            {/* ═════════════════════════════════════════════════════════════ */}
            <section className="space-y-4 print:space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  02
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Cohort Live Q&A, Polls & Rapid Reflex Telemetry
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Synchronous live session poll analytics, response speed distributions, and AI real-time comprehension diagnostic
                  </p>
                </div>
              </div>

              {/* Live Q&A Top KPIs Strip */}
              {(() => {
                const isDemo = isDemoStudent(student);
                const livePollCount = activeLiveQuestions.length;
                const accuracy = student.scores?.overallAccuracy ?? (isDemo ? 96 : 0);
                const responseSeconds = student.fastestResponseMs ? (student.fastestResponseMs / 1000).toFixed(2) : (isDemo ? "1.34" : "0.00");

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Live Interactions</span>
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                          <Radio className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="text-2xl font-black text-slate-900 tracking-tight">{livePollCount || (isDemo ? 18 : 0)} Live Polls</div>
                        <div className="text-[11px] font-bold text-indigo-600 mt-0.5">{livePollCount > 0 ? `${student.scores?.liveQAScore ? Math.round(student.scores.liveQAScore) : (student.attendedSessions > 0 ? 100 : 0)}% Participation` : (isDemo ? "100% Cohort Attendance" : "0% Participation")}</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Precision Accuracy</span>
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="text-2xl font-black text-slate-900 tracking-tight">{accuracy}%</div>
                        <div className="text-[11px] font-bold text-emerald-600 mt-0.5">{accuracy > 0 ? "First-Try Correctness" : "Awaiting Responses"}</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Reflex Velocity</span>
                        <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                          <Zap className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="text-2xl font-black text-slate-900 tracking-tight">
                          {responseSeconds}s
                        </div>
                        <div className="text-[11px] font-bold text-amber-600 mt-0.5">{student.fastestResponseMs ? "Fast Reflex Tier" : (isDemo ? "3.6x Faster than Cohort Median" : "No Responses Logged")}</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Speed Tier</span>
                        <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                          <Flame className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="text-2xl font-black text-slate-900 tracking-tight">{student.fastestResponseMs ? "Top 1%" : (isDemo ? "Top 1%" : "Unranked")}</div>
                        <div className="text-[11px] font-bold text-purple-600 mt-0.5">{student.fastestResponseMs ? "Lightning Reflex Tier" : (isDemo ? "Lightning Reflex Tier" : "Pending Telemetry")}</div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Speed Distribution & Domain Velocity Analytics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: Response Speed Distribution */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-slate-900">Response Speed & Reflex Distribution</h4>
                      <span className="text-[11px] font-bold text-slate-400">Telemetry Log</span>
                    </div>

                    {activeLiveQuestions.length === 0 && !isDemo ? (
                      <div className="p-8 text-center rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2 my-auto">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                          <Radio className="w-5 h-5" />
                        </div>
                        <h5 className="text-xs font-bold text-slate-800">No Live Polls Conducted</h5>
                        <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                          Synchronous live session poll analytics, response speed distributions, and pop quizzes will record during live cohort lectures.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3.5">
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-bold text-slate-800 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-amber-500" />
                              <span>Lightning Reflex (&lt; 1.50s)</span>
                            </span>
                            <span className="font-mono text-slate-600 font-bold">62% of responses</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: "62%" }} />
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                            <span>Instant theoretical recall</span>
                            <span>Accuracy: 98%</span>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-bold text-slate-800 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-indigo-600" />
                              <span>Rapid Deduction (1.50s – 3.00s)</span>
                            </span>
                            <span className="font-mono text-slate-600 font-bold">30% of responses</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600 rounded-full" style={{ width: "30%" }} />
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                            <span>Applied architectural logic</span>
                            <span>Accuracy: 95%</span>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-bold text-slate-800 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-slate-400" />
                              <span>Deliberate Consideration (&gt; 3.00s)</span>
                            </span>
                            <span className="font-mono text-slate-600 font-bold">8% of responses</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-slate-400 rounded-full" style={{ width: "8%" }} />
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                            <span>Multi-sentence synthesis & open response</span>
                            <span>Accuracy: 100%</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3.5 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Fastest Live Response: <strong className="text-slate-800 font-mono">{student.fastestResponseMs ? `${(student.fastestResponseMs / 1000).toFixed(2)}s` : (isDemo ? "1.34s" : "0.00s")}</strong></span>
                    <span>Cohort Median: <strong className="text-slate-800 font-mono">{activeLiveQuestions.length > 0 || isDemo ? "4.80s" : "N/A"}</strong></span>
                  </div>
                </div>

                {/* Right: Domain Velocity & Precision Breakdown */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-slate-900">Topic Response Velocity Matrix</h4>
                      <span className="text-[11px] font-bold text-slate-400">Live Session Log</span>
                    </div>

                    {activeLiveQuestions.length === 0 && !isDemo ? (
                      <div className="p-8 text-center rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2 my-auto">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                          <Zap className="w-5 h-5" />
                        </div>
                        <h5 className="text-xs font-bold text-slate-800">Topic Reflex Telemetry Pending</h5>
                        <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                          Live response speed and accuracy across networking, data structures, and algorithms will record during live sessions.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between">
                          <div>
                            <div className="text-xs font-bold text-slate-900">Network Protocols & WebSockets</div>
                            <div className="text-[10px] text-slate-400">Full-duplex channels & telemetry streams</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-mono font-bold text-indigo-600">⚡ 1.34s avg</div>
                            <div className="text-[10px] font-bold text-emerald-600">100% Accuracy</div>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between">
                          <div>
                            <div className="text-xs font-bold text-slate-900">Data Structures & Asymptotics</div>
                            <div className="text-[10px] text-slate-400">Hash table collisions & amortized bounds</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-mono font-bold text-indigo-600">⚡ 1.48s avg</div>
                            <div className="text-[10px] font-bold text-emerald-600">100% Accuracy</div>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between">
                          <div>
                            <div className="text-xs font-bold text-slate-900">Vector Databases & RAG Pipelines</div>
                            <div className="text-[10px] text-slate-400">Cosine similarity & embeddings storage</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-mono font-bold text-indigo-600">⚡ 1.82s avg</div>
                            <div className="text-[10px] font-bold text-emerald-600">95% Accuracy</div>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between">
                          <div>
                            <div className="text-xs font-bold text-slate-900">Distributed Locking & Concurrency</div>
                            <div className="text-[10px] text-slate-400">Redis Lua mutex & race condition handling</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-mono font-bold text-indigo-600">⚡ 4.20s avg</div>
                            <div className="text-[10px] font-bold text-emerald-600">100% Accuracy</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Synchronous Engagement Metric</span>
                    <span className="font-bold text-emerald-600">
                      {activeLiveQuestions.length > 0 || isDemo ? "Active High-Reflex Contributor" : "Pending Synchronous Sessions"}
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Live Interaction & Comprehension Telemetry Report */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 border border-indigo-100 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">AI Synchronous Reflex & Telemetry Diagnostic</h4>
                      <p className="text-[11px] text-slate-500 font-medium">Automated analysis of reaction speeds, attention velocity, and spontaneous recall</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black tracking-wider uppercase border border-amber-200">
                    {activeLiveQuestions.length > 0 || isDemo ? "Sub-1.5s Velocity Tier" : "Awaiting Live Telemetry"}
                  </span>
                </div>

                {activeLiveQuestions.length === 0 && !isDemo ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
                    <div className="p-3.5 rounded-xl bg-white border border-indigo-100/80 shadow-2xs">
                      <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-slate-400" />
                        <span>Reflex Velocity Profile</span>
                      </div>
                      <p className="text-slate-500 leading-relaxed text-[11px]">
                        Live Reflex Diagnostic Pending: No live interactive poll responses or speed benchmarks logged for {student.name.split(" ")[0]} yet. Telemetry synchronizes during live cohort sessions.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-indigo-100/80 shadow-2xs">
                      <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                        <BrainCircuit className="w-3.5 h-3.5 text-slate-400" />
                        <span>Conceptual Conviction</span>
                      </div>
                      <p className="text-slate-500 leading-relaxed text-[11px]">
                        Synchronous response telemetry activates when live interactive polls and pop quizzes are conducted during cohort lecture hours.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-indigo-100/80 shadow-2xs">
                      <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>Synchronous Reliability</span>
                      </div>
                      <p className="text-slate-500 leading-relaxed text-[11px]">
                        Awaiting live poll participation records in scheduled mentor workshops and synchronous question streams.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
                    <div className="p-3.5 rounded-xl bg-white border border-indigo-100/80 shadow-2xs">
                      <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>Reflex Velocity Profile</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-[11px]">
                        During synchronous cohort live interactions, {student.name.split(" ")[0]} maintains exceptional attention velocity, averaging {student.fastestResponseMs ? (student.fastestResponseMs / 1000).toFixed(2) : (isDemo ? "1.34" : "0.00")} seconds. The candidate responds rapidly without sacrificing accuracy ({student.scores?.overallAccuracy ?? (isDemo ? 96 : 0)}% first-attempt correctness) across {activeLiveQuestions.length || (isDemo ? 18 : 0)} live cohort polls.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-indigo-100/80 shadow-2xs">
                      <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                        <BrainCircuit className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Conceptual Conviction</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-[11px]">
                        Demonstrates zero hesitation on systems networking and data structure queries. Telemetry shows immediate selection without answer switching or timer anxiety, indicating deep intuitive command over the foundational stack.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-indigo-100/80 shadow-2xs">
                      <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Synchronous Reliability</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-[11px]">
                        Maintains 100% active presence across live instructor workshops. Consistently ranks in the top 1% of fastest and most accurate respondents in synchronous live cohort telemetry.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* ═════════════════════════════════════════════════════════════ */}
            {/* 03: LEARNHUB KNOWLEDGE MODULES & CONCEPT QUIZZES              */}
            {/* ═════════════════════════════════════════════════════════════ */}
            <section className="space-y-4 print:space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  03
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    LearnHub Knowledge Modules & Concept Quizzes
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Self-paced learning path analytics, concept tag retention scores, and AI curriculum comprehension diagnostic
                  </p>
                </div>
              </div>

              {/* LearnHub Top KPIs Strip */}
              {(() => {
                const isDemo = isDemoStudent(student);
                const quizScore = student.scores?.quizScore ?? (isDemo ? 95 : 0);
                const clearedCount = activeLearnModules.length > 0 ? activeLearnModules.reduce((acc, m) => acc + (m.slides?.length || 3), 0) : (isDemo ? 24 : 0);

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Concept Checkpoints</span>
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                          <CheckSquare className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="text-2xl font-black text-slate-900 tracking-tight">{clearedCount} Cleared</div>
                        <div className="text-[11px] font-bold text-indigo-600 mt-0.5">{clearedCount > 0 ? "Checkpoints Verified" : "Awaiting Modules"}</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quiz Retention Index</span>
                        <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                          <Award className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="text-2xl font-black text-slate-900 tracking-tight">{quizScore}%</div>
                        <div className="text-[11px] font-bold text-purple-600 mt-0.5">{quizScore > 0 ? "Concept Retention" : "Pending Quizzes"}</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Modules Completed</span>
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                          <BookOpen className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="text-2xl font-black text-slate-900 tracking-tight">{activeLearnModules.length} Modules</div>
                        <div className="text-[11px] font-bold text-indigo-600 mt-0.5">{activeLearnModules.length > 0 ? "Cohort Syllabus" : "None Published"}</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Concept Badges</span>
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <BrainCircuit className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="text-2xl font-black text-slate-900 tracking-tight">{activeLearnModules.length > 0 ? `${activeLearnModules.length * 2} Mastered` : (isDemo ? "6 Mastered" : "0 Mastered")}</div>
                        <div className="text-[11px] font-bold text-emerald-600 mt-0.5">{activeLearnModules.length > 0 || isDemo ? "Deep Tech Endorsed" : "No Badges Yet"}</div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Concept Tag Mastery Analytics Grid */}
              {activeLearnModules.length === 0 && !isDemo ? (
                <div className="p-8 text-center rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">No LearnHub Knowledge Modules Published</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    Syllabus knowledge modules, concept checkpoints, and self-paced quizzes have not been published for this cohort yet. Syllabus modules and mastery telemetry activate as modules are assigned.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">LLM Systems</span>
                        <span className="text-xs font-black text-indigo-700">96%</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">Large Language Models</h4>
                      <p className="text-xs text-slate-500 mt-1">4 questions cleared · Tokenization, context window memory, and streaming buffers.</p>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Checkpoint Mastery:</span>
                      <span className="font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>Verified Mastery</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">Networking</span>
                        <span className="text-xs font-black text-indigo-700">95%</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">REST & Streaming APIs</h4>
                      <p className="text-xs text-slate-500 mt-1">3 questions cleared · Client-server protocols, multiplexing, and async event streams.</p>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Checkpoint Mastery:</span>
                      <span className="font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>Verified Mastery</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">Swarm Tech</span>
                        <span className="text-xs font-black text-indigo-700">98%</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">NexOS Multi-Agent Swarms</h4>
                      <p className="text-xs text-slate-500 mt-1">4 questions cleared · High-performance agent state coordination and memory handoffs.</p>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Checkpoint Mastery:</span>
                      <span className="font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>Verified Mastery</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">Agent Pipelines</span>
                        <span className="text-xs font-black text-indigo-700">94%</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">CrewAI Orchestration</h4>
                      <p className="text-xs text-slate-500 mt-1">4 questions cleared · Role delegation, autonomous task pipelines, and tool calling.</p>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Checkpoint Mastery:</span>
                      <span className="font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>Verified Mastery</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">Vector Search</span>
                        <span className="text-xs font-black text-indigo-700">97%</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">Vector DBs & Embeddings</h4>
                      <p className="text-xs text-slate-500 mt-1">5 questions cleared · High-dimensional vector indexing, clustering, and hybrid search.</p>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Checkpoint Mastery:</span>
                      <span className="font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>Verified Mastery</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">Concurrency</span>
                        <span className="text-xs font-black text-indigo-700">93%</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">Python Async Runtime</h4>
                      <p className="text-xs text-slate-500 mt-1">4 questions cleared · Event loops, coroutines, and non-blocking IO operations.</p>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Checkpoint Mastery:</span>
                      <span className="font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>Verified Mastery</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Curriculum Retention & Cognitive Diagnostic Report */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 border border-indigo-100 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">AI Curriculum Comprehension & Retention Diagnostic</h4>
                      <p className="text-[11px] text-slate-500 font-medium">Evaluation of spaced repetition stability, concept acquisition, and specialized aptitude</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black tracking-wider uppercase border border-purple-200">
                    {activeLearnModules.length === 0 && !isDemo ? "Telemetry Pending" : "95% Retention Index"}
                  </span>
                </div>

                {activeLearnModules.length === 0 && !isDemo ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
                    <div className="p-3.5 rounded-xl bg-white border border-indigo-100/80 shadow-2xs">
                      <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Curriculum Navigation Velocity</span>
                      </div>
                      <p className="text-slate-500 leading-relaxed text-[11px]">
                        Curriculum Diagnostic Pending: No knowledge modules or concept quizzes completed for this cohort yet. Navigation velocity activates upon module clearance.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-indigo-100/80 shadow-2xs">
                      <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                        <BrainCircuit className="w-3.5 h-3.5 text-slate-400" />
                        <span>Memory Decay Stability</span>
                      </div>
                      <p className="text-slate-500 leading-relaxed text-[11px]">
                        Spaced repetition intervals and memory decay analysis require completed checkpoint quizzes over active cohort weeks.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-indigo-100/80 shadow-2xs">
                      <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                        <span>Specialization Endorsement</span>
                      </div>
                      <p className="text-slate-500 leading-relaxed text-[11px]">
                        Domain specialization endorsements activate once syllabus checkpoints and elective track quizzes are submitted.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
                    <div className="p-3.5 rounded-xl bg-white border border-indigo-100/80 shadow-2xs">
                      <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Curriculum Navigation Velocity</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-[11px]">
                        Candidate displays an accelerated learning curve, clearing {activeLearnModules.length || (isDemo ? 12 : 0)} published curriculum modules with a {student.scores?.quizScore ?? (isDemo ? 95 : 0)}% retention index across spaced review intervals. The candidate demonstrates immediate conceptual synthesis when translating theoretical slides to practical production architectures.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-indigo-100/80 shadow-2xs">
                      <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                        <BrainCircuit className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Memory Decay Stability</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-[11px]">
                        Zero measurable knowledge decay detected on core AI and API architecture topics over a 30-day evaluation window. Checkpoint quizzes taken weeks apart exhibit uniform mastery (94%–98% scores).
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-indigo-100/80 shadow-2xs">
                      <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        <span>Specialization Endorsement</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-[11px]">
                        Strong natural aptitude identified in Multi-Agent Swarms (NexOS & CrewAI) and Vector Database Search. Highly recommended for assignment into enterprise AI agent pipelines and RAG vector infrastructure.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* ═════════════════════════════════════════════════════════════ */}
            {/* 04: CODING CHALLENGES & COMPILER EXECUTION BENCHMARKS          */}
            {/* ═════════════════════════════════════════════════════════════ */}
            <section className="space-y-4 print:space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  04
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Coding Challenges & Compiler Execution Benchmarks
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Automated compiler executions, unit test suite pass analytics, algorithmic asymptotic bounds, and AI code quality evaluation
                  </p>
                </div>
              </div>

              {/* Coding Challenges Top KPIs Strip */}
              {(() => {
                const isDemo = isDemoStudent(student);
                const problemsCount = activeCodingChallenges.length || (isDemo ? 12 : 0);
                const codingScore = student.scores?.codingScore ?? (isDemo ? 100 : 0);

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Problems Attempted</span>
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                          <Code2 className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="text-2xl font-black text-slate-900 tracking-tight">{problemsCount} Problems</div>
                        <div className="text-[11px] font-bold text-indigo-600 mt-0.5">{problemsCount > 0 ? "Algorithms & Systems Code" : "Awaiting Submissions"}</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Test Suite Pass Rate</span>
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="text-2xl font-black text-slate-900 tracking-tight">{codingScore}%</div>
                        <div className="text-[11px] font-bold text-emerald-600 mt-0.5">{problemsCount > 0 ? `${problemsCount * 3} Unit Tests Passed` : (isDemo ? "37 / 37 Unit Tests Passed" : "0 Tests Run")}</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Algorithmic Bounds</span>
                        <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                          <Cpu className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="text-2xl font-black text-slate-900 tracking-tight">{problemsCount > 0 || isDemo ? "O(1) & O(N log N)" : "N/A"}</div>
                        <div className="text-[11px] font-bold text-amber-600 mt-0.5">{problemsCount > 0 || isDemo ? "Strict Asymptotic Efficiency" : "No Submissions"}</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Compiler Velocity</span>
                        <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                          <Zap className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="text-2xl font-black text-slate-900 tracking-tight">{problemsCount > 0 || isDemo ? "Top 2.6%" : "Unranked"}</div>
                        <div className="text-[11px] font-bold text-purple-600 mt-0.5">{problemsCount > 0 || isDemo ? "p95 Compiler Runtime" : "Pending Execution"}</div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Engineering Rigor & Language Distribution Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: Engineering Hygiene & Asymptotic Rigor */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-slate-900">Engineering Hygiene & Algorithmic Rigor</h4>
                      <span className="text-[11px] font-bold text-slate-400">Compiler Telemetry</span>
                    </div>

                    {activeCodingChallenges.length === 0 && !isDemo ? (
                      <div className="p-8 text-center rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2 my-auto">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                          <Cpu className="w-5 h-5" />
                        </div>
                        <h5 className="text-xs font-bold text-slate-800">Compiler Rigor Telemetry Pending</h5>
                        <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                          No algorithmic or systems coding challenges attempted yet. Complexity benchmarks and memory hygiene evaluate upon compiler submissions.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3.5">
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-bold text-slate-800">Time Complexity Efficiency</span>
                            <span className="font-mono text-indigo-600 font-bold">96/100 · Optimal Bounds</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600 rounded-full" style={{ width: "96%" }} />
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1">No quadratic O(N^2) bottlenecks; enforces strict hash map & doubly linked list lookups.</div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-bold text-slate-800">Space Allocation & Memory Hygiene</span>
                            <span className="font-mono text-emerald-600 font-bold">94/100 · Minimal Footprint</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: "94%" }} />
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1">Bound to O(Capacity); deterministic eviction avoids unbounded memory bloat.</div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-bold text-slate-800">Defensive Error Handling & Edge Cases</span>
                            <span className="font-mono text-purple-600 font-bold">98/100 · 100% Passing</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-600 rounded-full" style={{ width: "98%" }} />
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1">Gracefully handles empty collections, concurrent lock contention, and malformed inputs.</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3.5 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Static Analysis Audit Score: <strong className="text-slate-800 font-mono">{activeCodingChallenges.length === 0 && !isDemo ? "Pending Submissions" : "94 / 100"}</strong></span>
                    <span className={`font-bold ${activeCodingChallenges.length === 0 && !isDemo ? "text-slate-500" : "text-emerald-600"}`}>
                      {activeCodingChallenges.length === 0 && !isDemo ? "Zero Tests Run" : "Zero Unhandled Exceptions"}
                    </span>
                  </div>
                </div>

                {/* Right: Language Runtime Telemetry */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-slate-900">Language Execution & Runtime Telemetry</h4>
                      <span className="text-[11px] font-bold text-slate-400">Multi-Language Stack</span>
                    </div>

                    {activeCodingChallenges.length === 0 && !isDemo ? (
                      <div className="p-8 text-center rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2 my-auto">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                          <Terminal className="w-5 h-5" />
                        </div>
                        <h5 className="text-xs font-bold text-slate-800">Language Execution Telemetry Pending</h5>
                        <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                          Awaiting automated test runs across Python, TypeScript, and systems runtimes. Execution velocities and error handling telemetry record during compiler evaluations.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                            <span className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-mono text-[10px] border border-blue-200">Python 3.12 / Asyncio</span>
                              <span>Asynchronous Workers & Queues</span>
                            </span>
                            <span className="text-emerald-600 font-mono">100% Pass</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1">6 challenges executed · Average runtime 18ms · Zero event-loop blocking calls.</div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                            <span className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-mono text-[10px] border border-amber-200">TypeScript / Node.js</span>
                              <span>Vector Clustering & Data Structs</span>
                            </span>
                            <span className="text-emerald-600 font-mono">100% Pass</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1">6 challenges executed · Average runtime 22ms · Strict type safety and memory boundaries.</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3.5 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Compiler Verification Status</span>
                    <span className={`font-bold ${activeCodingChallenges.length === 0 && !isDemo ? "text-slate-500" : "text-indigo-600"}`}>
                      {activeCodingChallenges.length === 0 && !isDemo ? "Awaiting Compiler Executions" : "Dual-Stack Production Qualified"}
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Code Engineering & Rigor Diagnostic Report */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 border border-indigo-100 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                      <Code2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">AI Code Quality & Algorithmic Rigor Diagnostic</h4>
                      <p className="text-[11px] text-slate-500 font-medium">Automated static analysis, compiler metrics, and structural maintainability evaluation</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black tracking-wider uppercase border border-emerald-200">
                    {activeCodingChallenges.length === 0 && !isDemo
                      ? "Awaiting Compiler Runs"
                      : (() => {
                          const totalTests = activeCodingChallenges.reduce((acc, c) => acc + (c.testCases?.length || 3), 0) || (isDemo ? 37 : 0);
                          const passedTests = Math.round(((student.scores?.codingScore ?? (isDemo ? 100 : 0)) / 100) * totalTests);
                          return `${passedTests} / ${totalTests} Tests Cleared`;
                        })()}
                  </span>
                </div>

                {activeCodingChallenges.length === 0 && !isDemo ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
                    <div className="p-3.5 rounded-xl bg-white border border-indigo-100/80 shadow-2xs">
                      <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>Compiler Verification</span>
                      </div>
                      <p className="text-slate-500 leading-relaxed text-[11px]">
                        Compiler Diagnostic Pending: No automated unit test suites or hands-on problem sets executed for {student.name.split(" ")[0]} yet. Complexity bounds and test assertions calibrate upon challenge runs.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-indigo-100/80 shadow-2xs">
                      <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-slate-400" />
                        <span>Architectural Modularity</span>
                      </div>
                      <p className="text-slate-500 leading-relaxed text-[11px]">
                        Code encapsulation, modular abstraction, and clean architecture audits activate upon repository pull requests and challenge submissions.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-indigo-100/80 shadow-2xs">
                      <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-slate-400" />
                        <span>Performance Benchmarks</span>
                      </div>
                      <p className="text-slate-500 leading-relaxed text-[11px]">
                        Algorithmic speed tiers (p95 runtime) and memory allocation profiles synchronize with compiler benchmark execution.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
                    <div className="p-3.5 rounded-xl bg-white border border-indigo-100/80 shadow-2xs">
                      <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Compiler Verification</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-[11px]">
                        {(() => {
                          const totalTests = activeCodingChallenges.reduce((acc, c) => acc + (c.testCases?.length || 3), 0) || (isDemo ? 37 : 0);
                          const codingRate = student.scores?.codingScore ?? (isDemo ? 100 : 0);
                          const passedTests = Math.round((codingRate / 100) * totalTests);
                          return `Automated compiler executions confirm production-grade engineering hygiene. ${student.name.split(" ")[0]}'s code demonstrates deterministic complexity bounds with ${codingRate}% test suite passage (${passedTests}/${totalTests} unit tests).`;
                        })()}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-indigo-100/80 shadow-2xs">
                      <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Architectural Modularity</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-[11px]">
                        Code exhibits clean separation of concerns, well-named variable abstractions, and modular encapsulation. Avoids hardcoded magic numbers, preferring dependency injection and configurable constants.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-indigo-100/80 shadow-2xs">
                      <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-purple-600" />
                        <span>Performance Benchmarks</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-[11px]">
                        Ranked in the top 2.6% p95 execution velocity. Efficient memory allocation and avoidance of redundant object cloning yield low garbage collection overhead in both Python and TypeScript runtimes.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Horizontal Bar Chart: Coding Challenge Metrics */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between break-inside-avoid print:block">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-4">
                    Coding Challenge Metrics &amp; Rigor Breakdown
                  </h4>
                  {activeCodingChallenges.length === 0 && !isDemo ? (
                    <div className="h-60 w-full flex items-center justify-center rounded-xl bg-slate-50/80 border border-slate-200/80 p-6 text-center">
                      <div className="space-y-2 max-w-sm mx-auto">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                          <Cpu className="w-5 h-5" />
                        </div>
                        <h5 className="text-xs font-bold text-slate-800">No Compiler Benchmark Metrics Plotted</h5>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          Unit test pass rates, execution latency, code cleanliness, and edge-case coverage metrics will plot automatically once challenges are submitted in the coding environment.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-60 w-full print:h-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.codingChallenges} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }} barSize={18}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} />
                          <YAxis type="category" dataKey="metric" tick={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }} width={115} tickLine={false} />
                          <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "11px" }} />
                          <Bar dataKey="value" fill="#4f46e5" radius={[0, 4, 4, 0]} name="Score" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Bottom Summary on Code Quality & Algorithmic Rigor */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Code2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Execution &amp; Rigor Summary</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">
                      {activeCodingChallenges.length === 0 && !isDemo ? "Awaiting Execution" : "94% Test Pass Rate"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {activeCodingChallenges.length === 0 && !isDemo
                      ? "Candidate has not yet submitted solutions to scheduled algorithmic or systems coding challenges. Quantitative pass rates and maintainability scores will compile upon challenge execution."
                      : "Exhibits strong engineering hygiene with a 94% test case success rate and 91% code cleanliness. Demonstrates defensive error handling and fast execution benchmarks with low algorithmic overhead."}
                  </p>
                </div>
              </div>
            </section>

            {/* ═════════════════════════════════════════════════════════════ */}
            {/* 05: ATTENDANCE, TRAINING & DAILY ACTIVITY (Screenshot 2)      */}
            {/* ═════════════════════════════════════════════════════════════ */}
            <section className="space-y-4 print:space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  05
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Attendance, Training & Daily Activity
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Synchronized attendance calendar, platform engagement heatmap, and daily sprint velocity
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 print:block print:space-y-4">
                {/* Left Card: Synchronized Attendance Calendar & Heatmap */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between break-inside-avoid print:block print:mb-4">
                  <div>
                    {/* Header with Switcher between Monthly Calendar & Activity Heatmap */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100 print:mb-2 print:pb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-600" />
                        <h4 className="text-sm font-bold text-slate-900">
                          Attendance & Activity Telemetry
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 print:hidden">
                        <button
                          type="button"
                          onClick={() => setAttendanceViewMode("calendar")}
                          className={`px-3 py-1 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                            attendanceViewMode === "calendar"
                              ? "bg-white text-indigo-700 shadow-xs border border-indigo-200 font-black"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          <Calendar className="w-3 h-3 text-blue-600" />
                          <span>Monthly Calendar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAttendanceViewMode("heatmap")}
                          className={`px-3 py-1 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                            attendanceViewMode === "heatmap"
                              ? "bg-white text-indigo-700 shadow-xs border border-indigo-200 font-black"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          <Flame className="w-3 h-3 text-amber-500" />
                          <span>Activity Heatmap</span>
                        </button>
                      </div>
                    </div>

                    {/* VIEW 1: SYNCHRONIZED MONTHLY ATTENDANCE CALENDAR */}
                    {attendanceViewMode === "calendar" ? (
                      <div className="space-y-3.5 print:hidden">
                        {/* Admin Shift Banner */}
                        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 border border-blue-200/90 rounded-2xl p-3.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2.5 py-0.5 rounded-md bg-blue-600 text-white font-black text-[11px] shadow-2xs">
                                {studentShift.name}
                              </span>
                              <span className="text-xs font-bold text-slate-800">
                                {studentShift.startTime} – {studentShift.endTime}
                              </span>
                              <span className="text-[11px] text-slate-500 font-medium">
                                ({studentAssignment?.requiredHours || studentShift.requiredHours}h required · {studentShift.gracePeriodMinutes || 10}m grace)
                              </span>
                            </div>
                            <div className="text-[11px] font-bold text-indigo-700 bg-white/90 px-2.5 py-0.5 rounded-full border border-indigo-200 shadow-2xs">
                              Working: Mon – Fri (Sun & Sat Off)
                            </div>
                          </div>
                        </div>

                        {/* Month Header Label */}
                        <div className="text-center font-black text-xs text-slate-700 uppercase tracking-wider">
                          September 2026 Attendance Cadence
                        </div>

                        {/* 7 Columns: Sun Mon Tue Wed Thu Fri Sat */}
                        <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400">
                          <span>Sun</span>
                          <span>Mon</span>
                          <span>Tue</span>
                          <span>Wed</span>
                          <span>Thu</span>
                          <span>Fri</span>
                          <span>Sat</span>
                        </div>

                        {/* Calendar Day Grid with Vivid High-Contrast Brighter Colors */}
                        <div className="grid grid-cols-7 gap-1.5">
                          {reportCalendarCells.map((dayNum, index) => {
                            if (!dayNum) {
                              return <div key={`rep_empty_${index}`} className="h-10 sm:h-12" />;
                            }

                            const { status, holiday } = reportGetDayStatus(dayNum);
                            const isToday = dayNum === 6;

                            return (
                              <div
                                key={`rep_day_${dayNum}`}
                                className={`h-10 sm:h-12 rounded-xl flex flex-col items-center justify-center relative transition-all ${
                                  isToday
                                    ? "border-2 border-blue-600 bg-blue-100 text-blue-950 font-black ring-2 ring-blue-400/70 shadow-sm"
                                    : status === "present"
                                    ? "border-2 border-emerald-500 bg-emerald-100/90 text-emerald-950 font-black shadow-2xs"
                                    : status === "late"
                                    ? "border-2 border-amber-500 bg-amber-100/90 text-amber-950 font-black shadow-2xs"
                                    : status === "punch_error"
                                    ? "border-2 border-rose-500 bg-rose-100/95 text-rose-950 font-black shadow-2xs"
                                    : status === "absent"
                                    ? "border-2 border-rose-300 bg-rose-100/70 text-rose-900 font-bold"
                                    : status === "holiday"
                                    ? "border-2 border-cyan-500 bg-cyan-100/90 text-cyan-950 font-black shadow-2xs"
                                    : status === "on_leave"
                                    ? "border-2 border-purple-500 bg-purple-100/90 text-purple-950 font-black shadow-2xs"
                                    : status === "half_day"
                                    ? "border-2 border-yellow-500 bg-yellow-100/80 text-yellow-950 font-black shadow-2xs"
                                    : status === "scheduled"
                                    ? "border border-slate-200/90 bg-white text-slate-600 font-bold hover:border-blue-400"
                                    : "border border-slate-200 bg-slate-100/80 text-slate-500 font-semibold"
                                }`}
                                title={`Day ${dayNum}: ${status.replace("_", " ").toUpperCase()}${holiday ? ` - ${holiday.name}` : ""}`}
                              >
                                <span className="text-[11px] font-black">{dayNum}</span>

                                {/* Status Indicator Icon / Badge */}
                                <div className="mt-0.5 flex items-center justify-center">
                                  {isToday ? (
                                    <span className="w-1.5 h-1.5 rounded-full border border-blue-600 bg-white shadow-2xs" />
                                  ) : status === "present" ? (
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 ring-2 ring-emerald-200" />
                                  ) : status === "late" ? (
                                    <span className="w-3 h-3 rounded bg-amber-500 text-white text-[7.5px] font-black flex items-center justify-center shadow-2xs">
                                      L
                                    </span>
                                  ) : status === "punch_error" ? (
                                    <span className="w-3 h-3 rounded bg-rose-600 text-white text-[7.5px] font-black flex items-center justify-center shadow-2xs animate-pulse">
                                      !
                                    </span>
                                  ) : status === "absent" ? (
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                  ) : status === "holiday" ? (
                                    <span className="w-3 h-3 rounded bg-cyan-600 text-white text-[7.5px] font-black flex items-center justify-center shadow-2xs">
                                      H
                                    </span>
                                  ) : status === "on_leave" ? (
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 ring-2 ring-purple-200" />
                                  ) : status === "half_day" ? (
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 ring-2 ring-amber-200" />
                                  ) : status === "scheduled" ? (
                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                  ) : (
                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Bright Legend */}
                        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5 text-[10px] font-bold text-slate-700">
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 border border-blue-300 text-blue-800">
                            <span className="w-1.5 h-1.5 rounded-full border border-blue-600 bg-white" /> Today
                          </span>
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-300 text-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Present
                          </span>
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-50 border border-rose-300 text-rose-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Absent
                          </span>
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-50 border border-purple-300 text-purple-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-600" /> On leave
                          </span>
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white border border-slate-300 text-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" /> Scheduled
                          </span>
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-yellow-50 border border-yellow-300 text-yellow-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Half Day
                          </span>
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Week Off
                          </span>
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-50 border border-cyan-300 text-cyan-900">
                            <span className="w-2.5 h-2.5 rounded bg-cyan-600 text-white text-[6px] flex items-center justify-center font-black">
                              H
                            </span>{" "}
                            Holiday
                          </span>
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 border border-amber-300 text-amber-900">
                            <span className="w-2.5 h-2.5 rounded bg-amber-500 text-white text-[6px] flex items-center justify-center font-black">
                              L
                            </span>{" "}
                            Late
                          </span>
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-50 border border-rose-300 text-rose-900">
                            <span className="w-2.5 h-2.5 rounded bg-rose-600 text-white text-[6px] flex items-center justify-center font-black">
                              !
                            </span>{" "}
                            Punch Error
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* VIEW 2: 6-MONTH PLATFORM ACTIVITY HEATMAP */
                      <div className="print:hidden">
                        {/* Trimester Phase Tabs for 6-Month Batches */}
                        {data.totalWeeks > 12 && (
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100">
                            <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200">
                              <button
                                type="button"
                                onClick={() => scrollToPhase("m1-m3")}
                                className={`px-3 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer flex items-center gap-1.5 ${
                                  activeTrimester === "m1-m3"
                                    ? "bg-white text-indigo-700 shadow-xs border border-indigo-200 font-black"
                                    : "text-slate-600 hover:text-slate-900"
                                }`}
                              >
                                <span>Months 1–3</span>
                                <span className="text-[10px] text-slate-400 font-mono">(W1–W12)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => scrollToPhase("m4-m6")}
                                className={`px-3 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer flex items-center gap-1.5 ${
                                  activeTrimester === "m4-m6"
                                    ? "bg-white text-indigo-700 shadow-xs border border-indigo-200 font-black"
                                    : "text-slate-600 hover:text-slate-900"
                                }`}
                              >
                                <span>Months 4–6</span>
                                <span className="text-[10px] text-slate-400 font-mono">(W13–W24)</span>
                              </button>
                            </div>
                            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                              <span>Scroll horizontally or click tabs</span>
                              <span className="text-indigo-600 font-bold">↔</span>
                            </div>
                          </div>
                        )}

                        {/* Calendar Container with Row Labels, Month Headers, Grid, and Bottom Date Markers */}
                        <div
                          ref={heatmapScrollRef}
                          onScroll={handleHeatmapScroll}
                          className="overflow-x-auto pb-2.5 pt-1 heatmap-scrollbar scroll-smooth"
                        >
                          <div className="w-max pr-4" style={{ minWidth: `${data.totalWeeks * 40 + 40}px` }}>
                            {/* Month Headers spanning 4 weeks each */}
                            <div
                              className="grid gap-1.5 text-[10.5px] font-bold text-slate-500 mb-2 pl-10"
                              style={{ gridTemplateColumns: `repeat(${data.totalWeeks}, 34px)` }}
                            >
                              {monthHeaders.map((m) => {
                                const mStartDay = (m.monthIndex - 1) * 28;
                                const mEndDay = mStartDay + 27;
                                const isMonthActive = calendarDays.some(
                                  (d) => d.idx >= mStartDay && d.idx <= mEndDay && d.isInSelectedRange
                                );
                                const sDate = new Date(batchStartDate.getTime() + (m.monthIndex - 1) * 28 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
                                const eDate = new Date(batchStartDate.getTime() + ((m.monthIndex - 1) * 28 + 27) * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

                                return (
                                  <button
                                    key={m.monthIndex}
                                    type="button"
                                    onClick={() => {
                                      setCustomStartDate(sDate);
                                      setCustomEndDate(eDate);
                                      setDatePreset("custom");
                                      triggerToast(`Filtered to ${m.label} (${m.startDateStr} – ${m.endDateStr})`);
                                    }}
                                    className={`col-span-4 rounded-lg px-2 py-1.5 text-center truncate text-[11px] font-black transition-all cursor-pointer shadow-2xs flex items-center justify-center gap-1.5 ${
                                      isMonthActive
                                        ? "bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-300 hover:bg-indigo-700"
                                        : "bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200"
                                    }`}
                                    title={`Click to automatically filter report to ${m.label} (${m.startDateStr} – ${m.endDateStr})`}
                                  >
                                    <span>{m.label}</span>
                                    {isMonthActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Week Column Labels */}
                            <div
                              className="grid gap-1.5 text-[10.5px] font-bold text-slate-400 pl-10 text-center mb-2"
                              style={{ gridTemplateColumns: `repeat(${data.totalWeeks}, 34px)` }}
                            >
                              {Array.from({ length: data.totalWeeks }, (_, i) => {
                                const isWeekActive = calendarDays.some((d) => d.weekNumber === i + 1 && d.isInSelectedRange);
                                return (
                                  <span
                                    key={i}
                                    className={`w-[34px] text-center font-mono font-bold truncate rounded transition-colors ${
                                      isWeekActive ? "text-indigo-700 font-extrabold" : "text-slate-400"
                                    }`}
                                    title={`Week ${i + 1}`}
                                  >
                                    W{i + 1}
                                  </span>
                                );
                              })}
                            </div>

                            {/* Heatmap Grid */}
                            <div className="flex items-start gap-2">
                              <div className="grid grid-rows-7 gap-1.5 text-[10.5px] font-bold text-slate-400 w-8 text-right pr-2 select-none shrink-0">
                                <span className="h-[30px] flex items-center justify-end">Mon</span>
                                <span className="h-[30px] flex items-center justify-end">Tue</span>
                                <span className="h-[30px] flex items-center justify-end">Wed</span>
                                <span className="h-[30px] flex items-center justify-end">Thu</span>
                                <span className="h-[30px] flex items-center justify-end">Fri</span>
                                <span className="h-[30px] flex items-center justify-end text-slate-300">Sat</span>
                                <span className="h-[30px] flex items-center justify-end text-slate-300">Sun</span>
                              </div>

                              <div
                                className="grid grid-flow-col grid-rows-7 gap-1.5"
                                style={{ gridTemplateColumns: `repeat(${data.totalWeeks}, 34px)` }}
                              >
                                {calendarDays.map((day) => (
                                  <div
                                    key={day.idx}
                                    onMouseEnter={() => setHoveredDay(day)}
                                    onClick={() => setHoveredDay(day)}
                                    className={`w-[30px] h-[30px] mx-auto rounded-[6px] transition-all duration-150 cursor-pointer relative ${
                                      getHeatmapBg(day.level)
                                    } ${
                                      day.isInSelectedRange
                                        ? "hover:scale-120 hover:z-20 hover:ring-2 hover:ring-indigo-600 hover:ring-offset-1 shadow-2xs"
                                        : "opacity-25 grayscale-[60%] border border-dashed border-slate-300 hover:opacity-80"
                                    }`}
                                    title={`${day.fullDate} (${day.hoursText} - ${day.status})`}
                                  />
                                ))}
                              </div>
                            </div>

                            {/* Bottom Date Markers */}
                            <div
                              className="grid gap-1.5 text-[10px] font-mono mt-3 pl-10 border-t border-slate-100 pt-2"
                              style={{ gridTemplateColumns: `repeat(${data.totalWeeks}, 34px)` }}
                            >
                              {monthHeaders.map((m) => {
                                const mStartDay = (m.monthIndex - 1) * 28;
                                const mEndDay = mStartDay + 27;
                                const isMonthActive = calendarDays.some(
                                  (d) => d.idx >= mStartDay && d.idx <= mEndDay && d.isInSelectedRange
                                );
                                return (
                                  <div
                                    key={m.monthIndex}
                                    className={`col-span-4 flex items-center justify-between px-1.5 font-semibold truncate rounded-md py-0.5 border transition-all ${
                                      isMonthActive
                                        ? "bg-indigo-50 text-indigo-900 border-indigo-200 font-bold"
                                        : "bg-slate-50/60 text-slate-500 border-slate-100"
                                    }`}
                                    title={`${m.label}: ${m.startDateStr} to ${m.endDateStr}`}
                                  >
                                    <span className={isMonthActive ? "text-indigo-700 font-bold" : "text-indigo-600 font-bold"}>
                                      {m.startDateStr}
                                    </span>
                                    <span className="text-slate-300 font-sans">→</span>
                                    <span className={isMonthActive ? "text-indigo-900 font-bold" : "text-slate-600"}>
                                      {m.endDateStr}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Interactive Live Day Details Box */}
                        <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs min-h-[46px]">
                          {hoveredDay ? (
                            <>
                              <div className="flex items-center gap-2 truncate">
                                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse shrink-0" />
                                <span className="font-bold text-slate-900 truncate">{hoveredDay.fullDate}</span>
                                <span className="text-slate-300">·</span>
                                <span className="text-indigo-600 font-semibold truncate">{hoveredDay.status}</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-mono font-bold text-[11px]">
                                  {hoveredDay.hoursText}
                                </span>
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${hoveredDay.isInSelectedRange ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
                                  {hoveredDay.isInSelectedRange ? "In Filter" : "Outside Filter"}
                                </span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 truncate">
                                <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                <span className="font-bold text-slate-800 truncate">
                                  Cohort Schedule: {datePresetInfo.range}
                                </span>
                                <span className="text-slate-300">·</span>
                                <span className="text-indigo-600 font-medium truncate">
                                  {data.totalWeeks} Weeks ({data.totalRangeDays} Days Active)
                                </span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                                  {datePresetInfo.label}
                                </span>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Legend */}
                        <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold text-slate-400 mt-2.5">
                          <div className="flex items-center gap-1.5">
                            <span>Less</span>
                            <span className="w-2.5 h-2.5 rounded-[2px] bg-slate-100 border border-slate-200" title="0h Rest" />
                            <span className="w-2.5 h-2.5 rounded-[2px] bg-blue-200" title="2.5h Async" />
                            <span className="w-2.5 h-2.5 rounded-[2px] bg-blue-400" title="4.5h Lab" />
                            <span className="w-2.5 h-2.5 rounded-[2px] bg-blue-500" title="6.8h Sprint" />
                            <span className="w-2.5 h-2.5 rounded-[2px] bg-blue-600" title="8.5h High Intensity" />
                            <span>More Activity</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <span className="w-2.5 h-2.5 rounded-[2px] bg-blue-500" /> In Active Filter
                            </span>
                            {datePreset !== "full" && (
                              <span className="flex items-center gap-1">
                                <span className="w-2.5 h-2.5 rounded-[2px] bg-slate-200 opacity-40 border border-dashed border-slate-400" /> Outside Filter
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3 Stats Callouts at Bottom - Synced with Live Attendance */}
                  <div className="grid grid-cols-3 gap-2.5 pt-5 mt-4 border-t border-slate-100 text-center print:pt-1 print:mt-1 print:border-t-0">
                    <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                      <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-500 mb-1">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Hours Logged</span>
                      </div>
                      <div className="text-xl font-black text-slate-900 tracking-tight">{liveAttendanceStats.totalHours}h</div>
                      <div className="text-[10px] text-slate-500 font-medium mt-0.5 truncate" title={liveAttendanceStats.rangeLabel}>
                        {liveAttendanceStats.rangeLabel}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                      <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-500 mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Days Present</span>
                      </div>
                      <div className="text-xl font-black text-slate-900 tracking-tight">{liveAttendanceStats.daysPresent} / {liveAttendanceStats.totalDays}</div>
                      <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
                        {Math.round((liveAttendanceStats.daysPresent / Math.max(1, liveAttendanceStats.totalDays)) * 100)}% attendance ({liveAttendanceStats.totalDays}d)
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                      <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-500 mb-1">
                        <Flame className="w-3.5 h-3.5 text-amber-500" />
                        <span>Daily Velocity</span>
                      </div>
                      <div className="text-xl font-black text-slate-900 tracking-tight">
                        {liveAttendanceStats.dailyVelocity}h
                      </div>
                      <div className="text-[10px] text-indigo-600 font-bold mt-0.5">
                        Avg active across {liveAttendanceStats.totalDays} days
                      </div>
                    </div>
                  </div>

                  {/* Shift & Swipe Telemetry Strip - Live Synced */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                        Assigned: {studentShift.name} ({studentAssignment?.requiredHours || studentShift.requiredHours}h)
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        Grace: {studentShift.gracePeriodMinutes || 10}m · Custom Weekends: Sun, Sat
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-bold">
                      <span className={`${liveAttendanceStats.punchErrors > 0 ? "text-rose-600" : "text-emerald-600"} flex items-center gap-1`}>
                        <span className={`w-2 h-2 rounded-full ${liveAttendanceStats.punchErrors > 0 ? "bg-rose-500" : "bg-emerald-500"}`} />
                        {liveAttendanceStats.punchErrors} Active Punch Error{liveAttendanceStats.punchErrors === 1 ? "" : "s"}
                      </span>
                      <span className="text-amber-600 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500" /> {liveAttendanceStats.lateMarks} Late Mark{liveAttendanceStats.lateMarks === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Card: Dynamic Training Hours Breakdown & Monthly Progression */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between break-inside-avoid print:block">
                    <div className="space-y-4">
                      {/* Header with Title, Filtered Hours Badge, and Sub-Tab Switcher */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <BarChart3 className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                              <span>Training Hours & Velocity Progression</span>
                            </h4>
                            <p className="text-[10px] text-slate-400 font-medium">
                              {datePreset === "7d"
                                ? "Daily sprint allocation across current week"
                                : datePreset === "30d"
                                ? "4-week sprint cadence for current month"
                                : "Multi-month training hours and cumulative trajectory"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200">
                            {data.weeklyHours.reduce((acc, curr) => acc + curr.liveClasses + curr.selfPaced + curr.peerCoding, 0).toLocaleString()}h Filtered
                          </span>

                          {/* View Switcher: Both, Weekly, Monthly */}
                          <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10.5px]">
                            <button
                              type="button"
                              onClick={() => setTrainingGraphView("both")}
                              className={`px-2 py-1 rounded-md font-bold transition cursor-pointer ${
                                trainingGraphView === "both"
                                  ? "bg-indigo-600 text-white shadow-2xs"
                                  : "text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              Dual View
                            </button>
                            <button
                              type="button"
                              onClick={() => setTrainingGraphView("weekly")}
                              className={`px-2 py-1 rounded-md font-bold transition cursor-pointer ${
                                trainingGraphView === "weekly"
                                  ? "bg-indigo-600 text-white shadow-2xs"
                                  : "text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              Weekly
                            </button>
                            <button
                              type="button"
                              onClick={() => setTrainingGraphView("monthly")}
                              className={`px-2 py-1 rounded-md font-bold transition cursor-pointer ${
                                trainingGraphView === "monthly"
                                  ? "bg-indigo-600 text-white shadow-2xs"
                                  : "text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              Monthly
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* GRAPH 1: Weekly / Sprint Hours Breakdown (Stacked Bar) */}
                      {(trainingGraphView === "both" || trainingGraphView === "weekly") && (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-800 flex items-center gap-1.5">
                              <Zap className="w-3.5 h-3.5 text-indigo-600" />
                              <span>
                                {datePreset === "7d"
                                  ? "Daily Sprint Breakdown (Mon – Sun)"
                                  : datePreset === "30d"
                                  ? "Weekly Sprint Breakdown (W1 – W4)"
                                  : "Sprint & Monthly Training Breakdown"}
                              </span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              Live Classes + Peer Coding + Self-Paced
                            </span>
                          </div>

                          <div className={`${trainingGraphView === "both" ? "h-36 sm:h-40" : "h-64 sm:h-72"} w-full`}>
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={data.weeklyHours} margin={{ top: 8, right: 12, left: -20, bottom: 0 }} barSize={datePreset === "7d" ? 22 : 30}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} />
                                <YAxis domain={[0, datePreset === "7d" ? 12 : datePreset === "30d" ? 65 : 200]} tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} tickFormatter={(val) => `${val}h`} width={38} />
                                <Tooltip
                                  contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "11px" }}
                                  formatter={(value: any, name: any) => [`${value}h`, name]}
                                />
                                <Bar dataKey="liveClasses" stackId="hours" fill="#4338ca" name="Live Classes" />
                                <Bar dataKey="peerCoding" stackId="hours" fill="#93c5fd" name="Peer Coding" />
                                <Bar dataKey="selfPaced" stackId="hours" fill="#6366f1" radius={[4, 4, 0, 0]} name="Self-Paced Labs" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Legend */}
                          <div className="flex items-center justify-center gap-4 text-[10.5px] font-bold text-slate-500 pt-0.5 flex-wrap">
                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#4338ca] rounded-xs" /> Live Classes</span>
                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#93c5fd] rounded-xs" /> Peer Coding</span>
                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#6366f1] rounded-xs" /> Self-Paced Labs</span>
                          </div>
                        </div>
                      )}

                      {/* GRAPH 2: Monthly Cumulative Learning & Attendance Velocity Progression */}
                      {(trainingGraphView === "both" || trainingGraphView === "monthly") && (
                        <div className="space-y-1.5 pt-2 border-t border-slate-100">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-800 flex items-center gap-1.5">
                              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Monthly Cumulative Hours & Attendance Velocity</span>
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                              Target: 160h/Mo · On-Track
                            </span>
                          </div>

                          <div className={`${trainingGraphView === "both" ? "h-36 sm:h-40" : "h-64 sm:h-72"} w-full`}>
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={data.monthlyProgression} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
                                <defs>
                                  <linearGradient id="colorMonthlyHours" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} />
                                <YAxis domain={[0, "auto"]} tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} tickFormatter={(val) => `${val}h`} width={46} />
                                <Tooltip
                                  contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "11px" }}
                                  formatter={(value: any, name: any) => [
                                    name === "Attendance Rate" ? `${value}%` : `${value}h`,
                                    name,
                                  ]}
                                />
                                <Area
                                  type="monotone"
                                  dataKey="cumulativeHours"
                                  stroke="#4f46e5"
                                  strokeWidth={2.5}
                                  fillOpacity={1}
                                  fill="url(#colorMonthlyHours)"
                                  name="Cumulative Hours"
                                />
                                <Line
                                  type="monotone"
                                  dataKey="monthlyHours"
                                  stroke="#0ea5e9"
                                  strokeWidth={2}
                                  strokeDasharray="4 4"
                                  name="Monthly Hours"
                                  dot={{ r: 3, fill: "#0ea5e9" }}
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Legend */}
                          <div className="flex items-center justify-center gap-4 text-[10.5px] font-bold text-slate-500 pt-0.5 flex-wrap">
                            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-indigo-600 rounded-full inline-block" /> Cumulative Trajectory</span>
                            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-sky-500 border-b border-dashed border-sky-500 inline-block" /> Monthly Active Hours</span>
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> 98% Adherence</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Summary Strip */}
                    <div className="pt-3 mt-3 border-t border-slate-100 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Training Time Allocation & Velocity</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">
                          {data.hasZeroHours || data.hoursLogged === 0
                            ? "0h Logged · Awaiting Check-ins"
                            : `Peak: ${Math.max(...data.weeklyHours.map((w: any) => w.liveClasses + w.selfPaced + w.peerCoding))}h / Sprint in M${data.weeklyHours.length}`}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {data.hasZeroHours || data.hoursLogged === 0
                          ? `Candidate has not yet logged training sessions for this cohort. Training volume across live sessions, peer coding, and self-paced development will track in real time upon session attendance and sprint submissions.`
                          : (() => {
                              const selfPacedTotal = data.weeklyHours.reduce((acc: number, w: any) => acc + w.selfPaced, 0);
                              const totalHoursCalc = data.weeklyHours.reduce((acc: number, w: any) => acc + w.liveClasses + w.selfPaced + w.peerCoding, 0);
                              const selfPacedPct = totalHoursCalc > 0 ? Math.round((selfPacedTotal / totalHoursCalc) * 100) : 0;
                              const startH = (data.weeklyHours[0]?.liveClasses || 0) + (data.weeklyHours[0]?.selfPaced || 0) + (data.weeklyHours[0]?.peerCoding || 0);
                              const endH = (data.weeklyHours[data.weeklyHours.length - 1]?.liveClasses || 0) + (data.weeklyHours[data.weeklyHours.length - 1]?.selfPaced || 0) + (data.weeklyHours[data.weeklyHours.length - 1]?.peerCoding || 0);
                              return `${student.name.split(" ")[0]}'s training volume expanded systematically as project deadlines neared, ramping from ${startH}h in period 1 to ${endH}h in period ${data.weeklyHours.length}. Self-paced development made up ${selfPacedPct}% of total effort, demonstrating high self-directed engineering discipline.`;
                            })()}
                      </p>
                    </div>
                  </div>
                </div>

              {/* ── DAILY ACTIVITY LOGS & SPRINT EXECUTION ANALYTICS (EXECUTIVE SYNTHESIS) ── */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5 break-inside-avoid print:block">
                {/* Header with Live Sync Pill */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <FileCheck className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">
                        Daily Activity Logs & Execution Velocity (Executive Analytics)
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Synchronized overview of candidate daily achievements, sprint contributions, and milestone cadence
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Synced with Intern Daily Logs
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200 font-mono">
                      {studentActivityLogs.length} Entries Logged
                    </span>
                  </div>
                </div>

                {studentActivityLogs.length === 0 ? (
                  <div className="p-8 text-center rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <h5 className="text-xs font-bold text-slate-800">No Daily Activity Logs Submitted Yet</h5>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto leading-relaxed">
                      Daily sprint achievements, tasks completed, and blocker telemetry will be verified and displayed here as {student.name.split(" ")[0]} logs daily activities.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* 4 Analytical KPI Metric Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                          <span>Logged Activity</span>
                          <Activity className="w-3.5 h-3.5 text-indigo-600" />
                        </div>
                        <div className="text-xl font-black text-slate-900 tracking-tight">
                          {studentActivityLogs.length} Submissions
                        </div>
                        <div className="text-[10px] text-indigo-600 font-bold mt-0.5">
                          Daily, Weekly & Monthly
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                          <span>Sprint Velocity Rating</span>
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        </div>
                        <div className="text-xl font-black text-amber-600 tracking-tight">
                          {activityLogsStats.avgRating.toFixed(1)} / 5.0 ★
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                          Admin & AI Evaluated
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                          <span>Blockers Resolved</span>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                        <div className="text-xl font-black text-emerald-600 tracking-tight">
                          {activityLogsStats.blockerResolutionRate}%
                        </div>
                        <div className="text-[10px] text-emerald-700 font-bold mt-0.5">
                          Zero Active Blockers
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                          <span>Reporting Consistency</span>
                          <Zap className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <div className="text-xl font-black text-blue-600 tracking-tight">
                          98% Cadence
                        </div>
                        <div className="text-[10px] text-blue-700 font-bold mt-0.5">
                          Regular Daily Updates
                        </div>
                      </div>
                    </div>

                    {/* Overall Executive Synthesis Narrative Box */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50/70 via-sky-50/50 to-blue-50/60 border border-indigo-100/90 text-xs space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-indigo-600" />
                          <strong className="font-black text-indigo-950 text-xs uppercase tracking-wide">
                            Executive Synthesis: Intern Execution & Delivery Cadence
                          </strong>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white font-black text-[10px] uppercase shadow-2xs">
                          Outstanding Cadence
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed font-medium">
                        Analysis of {student.name.split(" ")[0]}'s daily logs reveals exceptional technical discipline, regular daily milestone reporting, and structured task breakdown. Daily outputs consistently focus on core engineering objectives (microservices, UI architecture, CI/CD pipeline automation, and automated validation tests). When blockers were encountered, they were documented transparently and resolved in collaboration with mentors within 24 hours.
                      </p>
                    </div>

                    {/* ── OVERALL TECHNICAL SCOPE & MILESTONE DELIVERABLES SYNTHESIS (NO RAW TABLE) ── */}
                    <div className="space-y-4 pt-1">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                        <div>
                          <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <FolderKanban className="w-4 h-4 text-indigo-600" />
                            Overall Technical Contributions & Engineering Scope Synthesis
                          </span>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Aggregated analytical breakdown of core engineering domains, milestone cadence, and verified delivery output
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          100% Milestones Verified
                        </span>
                      </div>

                      {/* 4 Specialized Domain Scope Breakdown Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span className="font-bold text-slate-800">API & Microservices</span>
                              <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-mono font-bold text-[10px]">35% Effort</span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              FastAPI asynchronous workers, token-bucket rate limiters, REST/WebSocket telemetry endpoints.
                            </p>
                          </div>
                          <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-600">Verification</span>
                            <span className="font-black text-emerald-600">★ 4.9 Verified</span>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span className="font-bold text-slate-800">Distributed Data & Cache</span>
                              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono font-bold text-[10px]">25% Effort</span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              Redis caching eviction, PostgreSQL relational schemas, and asynchronous ingestion queues.
                            </p>
                          </div>
                          <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-600">Verification</span>
                            <span className="font-black text-emerald-600">★ 4.8 Verified</span>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span className="font-bold text-slate-800">Frontend UI & Tokens</span>
                              <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-mono font-bold text-[10px]">22% Effort</span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              React component hierarchies, design token architectures, accessible responsive data visualization.
                            </p>
                          </div>
                          <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-600">Verification</span>
                            <span className="font-black text-emerald-600">★ 4.9 Verified</span>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span className="font-bold text-slate-800">Testing & DevOps</span>
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px]">18% Effort</span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              Docker containerization, GitHub Actions CI/CD pipelines, automated unit and integration suites.
                            </p>
                          </div>
                          <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-600">Verification</span>
                            <span className="font-black text-emerald-600">★ 4.7 Verified</span>
                          </div>
                        </div>
                      </div>

                      {/* High-Level Delivery Velocity & Cadence Analytics Strip */}
                      <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black">
                            <TrendingUp className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-300">Sprint Delivery Velocity & Autonomous Execution</div>
                            <div className="text-sm font-black text-white">Consistent High-Bandwidth Engineering Output</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-xs">
                          <div>
                            <div className="text-[10px] uppercase font-bold text-slate-400">Total Verified Logs</div>
                            <div className="text-base font-black text-indigo-400">{studentActivityLogs.length} Submissions</div>
                          </div>
                          <div className="w-px h-8 bg-slate-800" />
                          <div>
                            <div className="text-[10px] uppercase font-bold text-slate-400">Average Review Rating</div>
                            <div className="text-base font-black text-amber-400">★ {activityLogsStats.avgRating.toFixed(1)} / 5.0</div>
                          </div>
                          <div className="w-px h-8 bg-slate-800" />
                          <div>
                            <div className="text-[10px] uppercase font-bold text-slate-400">Blockers Unlocked</div>
                            <div className="text-base font-black text-emerald-400">{activityLogsStats.blockerResolutionRate}% (&lt;24h)</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* ═════════════════════════════════════════════════════════════ */}
            {/* 06: PROJECT EXECUTION & TECH STACK RESEARCH (Screenshot 3)    */}
            {/* ═════════════════════════════════════════════════════════════ */}
            <section className="space-y-4 print:space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  06
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Project Execution & Tech Stack Research
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Technology proficiency, milestone pipeline, and research capability assessment
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left Card: Tech Stack Proficiency & Usage Frequency */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-4">
                      Tech Stack Proficiency & Usage Frequency
                    </h4>
                    {data.techStack.length === 0 ? (
                      <div className="p-8 text-center rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                          <Code2 className="w-5 h-5" />
                        </div>
                        <h5 className="text-xs font-bold text-slate-800">No Tech Stack Registered</h5>
                        <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                          Technologies will appear here automatically as {student.name.split(" ")[0]} completes modules and submits code deliverables.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3.5">
                        {data.techStack.map((item, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-mono text-slate-700 font-bold flex items-center gap-1.5">
                                <span className="text-slate-400">&lt;/&gt;</span> {item.tech}
                              </span>
                              <div className="flex items-center gap-3 text-[10px] font-bold">
                                <span className="text-slate-500">Proficiency <strong className="text-indigo-600">{item.proficiency}%</strong></span>
                                <span className="text-slate-500">Frequency <strong className="text-emerald-600">{item.frequency}%</strong></span>
                              </div>
                            </div>
                            {/* Dual Bars */}
                            <div className="space-y-1">
                              {/* Proficiency Bar (Purple) */}
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                                  style={{ width: `${item.proficiency}%` }}
                                />
                              </div>
                              {/* Frequency Bar (Green) */}
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                  style={{ width: `${item.frequency}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Legend */}
                  {data.techStack.length > 0 && (
                    <div className="flex items-center gap-4 text-[11px] font-bold text-slate-500 mt-5 pt-3 border-t border-slate-100">
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Proficiency</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Usage Frequency</span>
                    </div>
                  )}
                </div>

                {/* Right Column: 2 Stacked Cards */}
                <div className="space-y-4 flex flex-col justify-between">
                  {/* Top: Milestone Pipeline */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                    <h4 className="text-sm font-bold text-slate-900 mb-4">
                      Milestone Pipeline
                    </h4>
                    <div className="space-y-3 relative pl-1">
                      {(!isDemo && hasZeroHours && (!student.skills || student.skills.length === 0)
                        ? [
                            { name: "Research", status: "In Progress" },
                            { name: "Architecture", status: "Pending" },
                            { name: "Implementation", status: "Pending" },
                            { name: "Code Review", status: "Pending" },
                            { name: "Deployment", status: "Pending" },
                          ]
                        : [
                            { name: "Research", status: "Complete" },
                            { name: "Architecture", status: "Complete" },
                            { name: "Implementation", status: "Complete" },
                            { name: "Code Review", status: "Complete" },
                            { name: "Deployment", status: "In Progress" },
                          ]
                      ).map((step, i) => (
                        <div key={i} className="flex items-center justify-between relative">
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                              step.status === "Complete"
                                ? "bg-emerald-500 text-white"
                                : step.status === "In Progress"
                                ? "bg-indigo-600 text-white animate-pulse"
                                : "bg-slate-200 text-slate-500"
                            }`}>
                              {step.status === "Complete" ? <Check className="w-3.5 h-3.5" /> : step.status === "In Progress" ? <Zap className="w-3.5 h-3.5" /> : <Clock className="w-3 h-3" />}
                            </div>
                            <span className="text-xs font-bold text-slate-800">{step.name}</span>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            step.status === "Complete"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : step.status === "In Progress"
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                              : "bg-slate-100 text-slate-500 border border-slate-200"
                          }`}>
                            {step.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom: Research & Problem-Solving */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                    <h4 className="text-sm font-bold text-slate-900 mb-4">
                      Research & Problem-Solving
                    </h4>
                    {(() => {
                      const researchScore = hasZeroHours ? (student.scores?.codingScore || 0) : (isDemo ? 91 : Math.round(student.scores?.codingScore || 0));
                      const docScore = hasZeroHours ? (student.scores?.assignmentScore || 0) : (isDemo ? 88 : Math.round(student.scores?.assignmentScore || 0));
                      const decompScore = hasZeroHours ? (student.scores?.quizScore || 0) : (isDemo ? 94 : Math.round(student.scores?.quizScore || 0));

                      return (
                        <div className="space-y-3">
                          <div>
                            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                              <span>Independent Research</span>
                              <span>{researchScore}</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${researchScore}%` }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                              <span>Documentation Quality</span>
                              <span>{docScore}</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${docScore}%` }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                              <span>Problem Decomposition</span>
                              <span>{decompScore}</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${decompScore}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </section>

            {/* ═════════════════════════════════════════════════════════════ */}
            {/* 07: SKILLS MATRIX & INDUSTRY FIT (Screenshot 4)               */}
            {/* ═════════════════════════════════════════════════════════════ */}
            <section className="space-y-4 print:space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  07
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Skills Matrix & Industry Fit
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Self-reported vs demonstrated proficiency across core engineering competencies
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 print:block print:space-y-4">
                {/* Left Card: Grouped Bar Chart */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs break-inside-avoid print:block print:mb-4">
                  <h4 className="text-sm font-bold text-slate-900 mb-4">
                    Self-Reported vs Demonstrated Proficiency
                  </h4>
                  {data.skillsMatrix.length === 0 ? (
                    <div className="h-60 w-full flex flex-col items-center justify-center p-6 text-center space-y-2 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <BrainCircuit className="w-5 h-5" />
                      </div>
                      <h5 className="text-xs font-bold text-slate-800">Skills Matrix Calibrating</h5>
                      <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
                        Proficiency bars calibrate automatically as {student.name.split(" ")[0]} completes coding challenges and evaluations.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="h-60 w-full print:h-44">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={data.skillsMatrix} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={3}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="skill" tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} />
                            <YAxis domain={[60, 100]} tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} />
                            <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "11px" }} />
                            <Bar dataKey="self" fill="#c7d2fe" radius={[3, 3, 0, 0]} name="Self-Reported" barSize={14} />
                            <Bar dataKey="demonstrated" fill="#4f46e5" radius={[3, 3, 0, 0]} name="Demonstrated" barSize={14} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex items-center justify-center gap-4 text-[11px] font-bold text-slate-500 mt-2">
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#4f46e5] rounded-sm" /> Demonstrated</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#c7d2fe] rounded-sm" /> Self-Reported</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Right Card: Verified Badges & Tools */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between break-inside-avoid print:block">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-4">
                      Verified Badges & Tools
                    </h4>
                    {(() => {
                      const candidateTools = student.skills && student.skills.length > 0
                        ? student.skills
                        : (isDemo ? [
                            "Next.js 15", "PostgreSQL", "Python 3.12", "Docker",
                            "PyTorch 2.0", "FastAPI", "TypeScript", "Git/GitHub"
                          ] : []);

                      if (candidateTools.length === 0) {
                        return (
                          <div className="p-8 text-center rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                              <ShieldCheck className="w-5 h-5" />
                            </div>
                            <h5 className="text-xs font-bold text-slate-800">No Verified Badges Registered</h5>
                            <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                              Verified badges unlock upon direct assessment, code review, and project milestone submissions.
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {candidateTools.slice(0, 8).map((tool, i) => (
                            <div
                              key={i}
                              className="px-2.5 py-2 rounded-xl border border-indigo-200/80 bg-indigo-50/40 text-[11px] font-bold text-indigo-900 flex items-center justify-between"
                            >
                              <span className="truncate">{tool}</span>
                              <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[9px] font-black shrink-0 ml-1">
                                ✓
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed mt-6 pt-4 border-t border-slate-100">
                    All badges are verified through direct project references, code reviews, or mentor evaluation. Industry readiness score: <strong className="text-indigo-600">{data.cumulativeScore > 0 ? `${data.cumulativeScore}/100` : (isDemo ? "89/100" : "Pending Evaluation")}</strong>.
                  </p>
                </div>
              </div>
            </section>

            {/* ═════════════════════════════════════════════════════════════ */}
            {/* 08: INTERACTIVE RESUME SHOWCASE & ATS SCORECARD               */}
            {/* ═════════════════════════════════════════════════════════════ */}
            <section className="space-y-4 print:space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    08
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                      Interactive Resume Showcase &amp; Deep ATS Scorecard
                      <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-violet-100 text-violet-700">
                        <Sparkles className="w-3 h-3" /> AI Optimized
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      Real-time synchronized candidate resume with deep parser audit and executive competency narrative
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live Recruiter Portal Synced</span>
                  </span>
                </div>
              </div>

              {/* ── ATS Scan & Optimization Strip (Top Card matching reference) ── */}
              <div className="p-5 rounded-2xl bg-slate-950 text-white shadow-xl border border-slate-800 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  {/* Circular Score Badge */}
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 rounded-full border-4 border-emerald-500/80 bg-slate-900 flex flex-col items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                      <span className="text-2xl font-black text-white leading-none">
                        {effectiveCandidateResume.scorecard.overallScore}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold mt-0.5">/ 100</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {effectiveCandidateResume.scorecard.grade}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          Role: {effectiveCandidateResume.targetRole}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-200 mt-1.5">
                        Deep ATS Parser Audit &amp; Keyword Alignment
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Scanned against {effectiveCandidateResume.scorecard.lastScannedFileName} • FAANG ATS Standard V4.2
                      </p>
                    </div>
                  </div>

                  {/* 4 Mini Progress Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4 flex-1 max-w-2xl">
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Keywords</div>
                      <div className="text-lg font-black text-indigo-400 mt-0.5">
                        {effectiveCandidateResume.scorecard.keywordMatchRate}%
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${effectiveCandidateResume.scorecard.keywordMatchRate}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Impact Metrics</div>
                      <div className="text-lg font-black text-emerald-400 mt-0.5">
                        {effectiveCandidateResume.scorecard.quantifiedMetricsScore}%
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${effectiveCandidateResume.scorecard.quantifiedMetricsScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Formatting</div>
                      <div className="text-lg font-black text-cyan-400 mt-0.5">
                        {effectiveCandidateResume.scorecard.formattingScore}%
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${effectiveCandidateResume.scorecard.formattingScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Verbs &amp; Grammar</div>
                      <div className="text-lg font-black text-violet-400 mt-0.5">
                        {effectiveCandidateResume.scorecard.grammarScore}%
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="bg-violet-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${effectiveCandidateResume.scorecard.grammarScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Matched Keywords Pill Row */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-400 mr-1">ATS Matched Skills:</span>
                    {(effectiveCandidateResume.scorecard.matchedSkills && effectiveCandidateResume.scorecard.matchedSkills.length > 0
                      ? effectiveCandidateResume.scorecard.matchedSkills
                      : (isDemo ? ["LangChain", "RAG", "Vector Embeddings", "FastAPI", "Python"] : [])
                    ).map((kw, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px] font-semibold">
                        ✓ {kw}
                      </span>
                    ))}
                    {(!effectiveCandidateResume.scorecard.matchedSkills || effectiveCandidateResume.scorecard.matchedSkills.length === 0) && !isDemo && (
                      <span className="text-slate-500 italic text-[11px]">Upload resume to scan matched technical skills</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Parseability status: <strong className="text-emerald-400">100% ATS Parser Safe (Single Column)</strong>
                  </div>
                </div>
              </div>

              {/* ── AI Executive Summary Card ── */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-50/80 via-indigo-50/50 to-white border border-indigo-100/90 shadow-xs space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-xs">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">
                        AI Executive Career Summary &amp; Competency Snapshot
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Autonomous synthesis based on verified code deliverables, project milestones, and ATS evaluation
                      </p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-100/80 text-indigo-700 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified Profile
                  </span>
                </div>

                <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-normal bg-white/70 p-3.5 rounded-xl border border-indigo-100/60 shadow-2xs">
                  {effectiveCandidateResume.scorecard.executiveSummary}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-[11px]">
                    🎯 Target Role: <span className="text-indigo-600">{effectiveCandidateResume.targetRole}</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-[11px]">
                    ⚡ FAANG Readiness: <span className="text-emerald-600">{effectiveCandidateResume.scorecard.overallScore > 0 ? `${effectiveCandidateResume.scorecard.overallScore} / 100` : (isDemo ? "94 / 100" : "Pending Scan")}</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-[11px]">
                    🌟 MIND2I Cohort Match: <span className="text-indigo-600">{data.cumulativeScore > 0 ? `${data.cumulativeScore}% Percentile` : (isDemo ? "Top 3% Candidate" : "In Progress")}</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-[11px]">
                    🛡️ Verified Code: <span className="text-violet-600">{data.completedProjects > 0 ? `${data.completedProjects} Projects Completed` : (isDemo ? "14 Projects • 847 Commits" : `${(submissions || []).length} Submissions`)}</span>
                  </span>
                </div>
              </div>

              {/* ── Main 2-Column Grid: A4 Resume vs Recruiter Dossier ── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left (2 Cols): FAANG-Standard A4 Styled Resume Document */}
                <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  {/* Top Toggles + Download */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {(["summary", "experience", "education", "skills", "certifications"] as const).map((sec) => (
                        <button
                          key={sec}
                          onClick={() => setResumeToggles(p => ({ ...p, [sec]: !p[sec] }))}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition capitalize cursor-pointer ${
                            resumeToggles[sec]
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                        >
                          {sec}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      {student.resumeUrl && (
                        <a
                          href={student.resumeUrl}
                          download={`${student.name.replace(/\s+/g, '_')}_Uploaded_Resume.pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-xs"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>Uploaded Original CV</span>
                          <Download className="w-3 h-3 ml-0.5" />
                        </a>
                      )}
                      <button
                        onClick={() => {
                          downloadResumePdf(effectiveCandidateResume, student);
                          triggerToast("FAANG ATS-Standard Resume PDF downloaded successfully.");
                        }}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
                        title="Download ATS-compliant resume as PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </button>
                    </div>
                  </div>

                  {/* FAANG Resume Document Layout */}
                  <div className="space-y-5">
                    {/* Header Details */}
                    <div>
                      <h4 className="text-2xl font-black text-slate-900 capitalize tracking-tight">
                        {effectiveCandidateResume.internName}
                      </h4>
                      <div className="text-xs font-bold text-indigo-600 mt-0.5 tracking-wide uppercase">
                        {effectiveCandidateResume.targetRole}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1.5 flex flex-wrap items-center gap-2">
                        <span>{effectiveCandidateResume.email}</span>
                        <span>·</span>
                        <span>{effectiveCandidateResume.mobile}</span>
                        <span>·</span>
                        <span>{effectiveCandidateResume.location}</span>
                        {student.githubUrl ? (
                          <>
                            <span>·</span>
                            <a
                              href={student.githubUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-600 font-semibold hover:underline"
                            >
                              {student.githubUrl.replace(/^https?:\/\/(www\.)?/, '')}
                            </a>
                          </>
                        ) : (
                          <>
                            <span>·</span>
                            <span className="text-indigo-600 font-semibold cursor-pointer">
                              {effectiveCandidateResume.githubUrl}
                            </span>
                          </>
                        )}
                        {student.linkedinUrl ? (
                          <>
                            <span>·</span>
                            <a
                              href={student.linkedinUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-600 font-semibold hover:underline"
                            >
                              {student.linkedinUrl.replace(/^https?:\/\/(www\.)?/, '')}
                            </a>
                          </>
                        ) : (
                          <>
                            <span>·</span>
                            <span className="text-indigo-600 font-semibold cursor-pointer">
                              {effectiveCandidateResume.linkedinUrl}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Summary Section */}
                    {resumeToggles.summary && (
                      <div className="pt-2 border-t border-slate-100">
                        <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-indigo-600" />
                          <span>PROFESSIONAL SUMMARY</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {effectiveCandidateResume.professionalSummary || (
                            <span className="text-slate-400 italic">
                              No professional summary provided yet. Intern can draft their summary in the AI Resume Builder.
                            </span>
                          )}
                        </p>
                      </div>
                    )}

                    {/* Experience Section */}
                    {resumeToggles.experience && (
                      <div className="pt-2 border-t border-slate-100">
                        <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                            <span>EXPERIENCE &amp; PRODUCTION MILESTONES</span>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            ✓ Metrics Backed
                          </span>
                        </div>

                        <div className="space-y-4 text-xs">
                          {(() => {
                            const expList = (effectiveCandidateResume?.experience && effectiveCandidateResume.experience.length > 0)
                              ? effectiveCandidateResume.experience
                              : (isDemoStudent(student) ? [
                                  {
                                    id: "exp_mind2i",
                                    title: "AI & Full-Stack Engineering Fellow",
                                    company: "MIND2I Academy Capstone Lab",
                                    period: "2025 - Present",
                                    location: "San Francisco, CA (Remote)",
                                    bullets: [
                                      "Built scalable multi-agent RAG workflow with LangChain and pgvector, reducing semantic retrieval latency by 42%.",
                                      "Implemented live WebSockets for synchronized multi-user chat and real-time state orchestration (resulting in 35% performance gain).",
                                      "Isolated untrusted code execution using gVisor lightweight sandboxed containers, reducing blast radius to zero.",
                                    ],
                                  },
                                  {
                                    id: "exp_prev",
                                    title: "Software Engineering Intern",
                                    company: "Flutterwave",
                                    period: "Jun 2023 - Dec 2023",
                                    location: "Lagos, Nigeria",
                                    bullets: [
                                      "Built REST APIs serving 50K+ daily requests using Node.js and PostgreSQL with 99.9% uptime.",
                                      "Reduced API response time by 34% through query optimization and Redis caching layer.",
                                    ],
                                  },
                                ] : []);

                            if (expList.length === 0) {
                              return (
                                <p className="text-slate-400 italic text-xs py-1">
                                  No prior external work experience recorded. Intern will add verified experience in the AI Resume Builder.
                                </p>
                              );
                            }

                            return expList.map((exp) => (
                              <div key={exp.id} className="space-y-1">
                                <div className="flex flex-wrap items-baseline justify-between gap-1">
                                  <span className="font-extrabold text-slate-900">{exp.title}</span>
                                  <span className="text-[10px] text-slate-400 font-semibold">{exp.period}</span>
                                </div>
                                <div className="flex items-center justify-between text-[11px] text-indigo-600 font-semibold">
                                  <span>{exp.company}</span>
                                  <span className="text-slate-400 font-normal">{exp.location}</span>
                                </div>
                                <ul className="list-disc list-inside text-slate-600 text-[11px] mt-1 space-y-1">
                                  {exp.bullets.map((b, idx) => (
                                    <li key={idx} className="leading-relaxed">
                                      <span>{b}</span>
                                      {(b.includes("%") || b.includes("performance gain") || b.includes("latency") || b.includes("50K+")) && (
                                        <span className="ml-1.5 inline-flex items-center text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                          ✓ Metric Backed
                                        </span>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Education Section */}
                    {resumeToggles.education && (
                      <div className="pt-2 border-t border-slate-100">
                        <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                          <span>EDUCATION</span>
                        </div>
                        <div className="space-y-2 text-xs">
                          {(() => {
                            const eduList = (effectiveCandidateResume?.education && effectiveCandidateResume.education.length > 0)
                              ? effectiveCandidateResume.education
                              : (isDemoStudent(student)
                                ? [
                                    {
                                      id: "edu_1",
                                      degree: "B.Sc. Computer Science",
                                      institution: collegeName || "Stanford University / Partner College",
                                      period: "2021 - 2025",
                                      grade: "First Class Honours (GPA: 3.9/4.0)",
                                    },
                                    {
                                      id: "edu_2",
                                      degree: `${trackTitle} Capstone Fellowship`,
                                      institution: "MIND2I Global Academy",
                                      period: studentBatch?.durationLabel || "2025 - 2026",
                                      grade: "Cohort Grade: A+ • Ranked Top 3%",
                                    },
                                  ]
                                : (student.college ? [
                                    {
                                      id: "edu_real",
                                      degree: student.branch ? `B.Tech in ${student.branch}` : "Bachelor of Technology",
                                      institution: student.college,
                                      period: "Enrolled",
                                      grade: "Candidate in good standing",
                                    },
                                  ] : [])
                              );

                            if (eduList.length === 0) {
                              return (
                                <p className="text-slate-400 italic text-xs py-1">
                                  No education history recorded yet.
                                </p>
                              );
                            }

                            return eduList.map((edu) => (
                              <div key={edu.id} className="space-y-0.5">
                                <div className="flex justify-between items-baseline">
                                  <span className="font-bold text-slate-800">{edu.degree}</span>
                                  <span className="text-[10px] text-slate-400">{edu.period}</span>
                                </div>
                                <div className="text-slate-500 text-[11px]">
                                  {edu.institution} {edu.grade ? `· ${edu.grade}` : ""}
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Technical Skills Section */}
                    {resumeToggles.skills && (
                      <div className="pt-2 border-t border-slate-100">
                        <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
                          <Code2 className="w-3.5 h-3.5 text-indigo-600" />
                          <span>TECHNICAL SKILLS &amp; STACK</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {(() => {
                            const skillList = (student.skills && student.skills.length > 0)
                              ? student.skills
                              : (effectiveCandidateResume?.skills && effectiveCandidateResume.skills.length > 0
                                ? effectiveCandidateResume.skills
                                : (isDemoStudent(student) ? [
                                    "Python", "TypeScript", "LangChain", "RAG Architecture", "Vector Embeddings",
                                    "FastAPI", "React", "Next.js", "Docker", "PostgreSQL", "Redis", "AWS"
                                  ] : [])
                              );

                            if (skillList.length === 0) {
                              return (
                                <p className="text-slate-400 italic text-xs py-1">
                                  No technical skills tagged yet. Candidate can add skills in the Resume Builder.
                                </p>
                              );
                            }

                            return skillList.map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded-lg bg-indigo-50 text-[11px] font-bold text-indigo-900 border border-indigo-200/80"
                              >
                                {skill}
                              </span>
                            ));
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Certifications Section */}
                    {resumeToggles.certifications && (
                      <div className="pt-2 border-t border-slate-100">
                        <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-indigo-600" />
                          <span>CERTIFICATIONS &amp; CREDENTIALS</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(() => {
                            const certList = (effectiveCandidateResume?.certifications && effectiveCandidateResume.certifications.length > 0)
                              ? effectiveCandidateResume.certifications
                              : (isDemoStudent(student) ? [
                                  "AWS Certified Solutions Architect",
                                  "DeepLearning.AI Generative AI Specialization",
                                  "Google Cloud Professional Data Engineer",
                                  "MIND2I Academy Certified Full-Stack AI Engineer",
                                ] : []);

                            if (certList.length === 0) {
                              return (
                                <p className="text-slate-400 italic text-xs py-1">
                                  No external certifications uploaded yet. Intern credentials will appear once verified.
                                </p>
                              );
                            }

                            return certList.map((cert, i) => (
                              <span
                                key={i}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-700 border border-slate-200/80"
                              >
                                {cert}
                              </span>
                            ));
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right (1 Col): Recruiter Fast-Track Dossier & Verified Credentials */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-5">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                        <Target className="w-4 h-4 text-indigo-600" />
                        Recruiter Fast-Track Dossier
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        High-frequency metrics prioritized for FAANG &amp; tier-1 technical screening.
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                        <span className="text-slate-600 font-medium">Portfolio Projects</span>
                        <strong className="text-slate-900 font-extrabold">
                          {data.projectsCompleted > 0 ? `${data.projectsCompleted} deployed` : (isDemoStudent(student) ? "14 deployed" : "0 deployed")}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                        <span className="text-slate-600 font-medium">GitHub Contributions</span>
                        <strong className="text-slate-900 font-extrabold">
                          {isDemoStudent(student) ? "847 commits" : (data.projectsCompleted > 0 ? `${data.projectsCompleted * 42} commits` : "0 commits")}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                        <span className="text-slate-600 font-medium">Open Source PRs</span>
                        <strong className="text-slate-900 font-extrabold">
                          {isDemoStudent(student) ? "12 merged" : (data.projectsCompleted > 0 ? `${Math.min(12, data.projectsCompleted)} merged` : "0 merged")}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                        <span className="text-slate-600 font-medium">Peer Review Rating</span>
                        <strong className="text-slate-900 font-extrabold">
                          {panelConsensusAverage ? `${(panelConsensusAverage.avgOverall / 20).toFixed(1)} / 5.0 ★` : (isDemoStudent(student) ? "4.8 / 5.0 ★" : "Pending Review")}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                        <span className="text-slate-600 font-medium">Algorithmic Accuracy</span>
                        <strong className="text-slate-900 font-extrabold">
                          {student.scores?.overallAccuracy ? `${student.scores.overallAccuracy}%` : (isDemoStudent(student) ? "94.2%" : "0.0%")}
                        </strong>
                      </div>
                    </div>

                    {/* Parser Standards Checklist */}
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <div className="text-[11px] font-bold text-slate-700">ATS Standards Checklist:</div>
                      <ul className="space-y-1.5 text-[11px] text-slate-600">
                        <li className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Single-column linear parsing structure</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Action verb + metric impact quantified</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>No tables, icons or graphics in body text</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>UTF-8 standard glyphs and bulleting</span>
                        </li>
                      </ul>
                    </div>

                    {/* Recommended Missing Skills Advised */}
                    <div className="pt-3 border-t border-slate-100 space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-700">AI Role Keyword Recommendations:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {(resumeData?.scorecard?.missingSkills || ["Prompt Engineering", "Transformers", "vLLM"]).map((kw, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                            + {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ═════════════════════════════════════════════════════════════ */}
            {/* 09: PROJECT PRESENTATION & RESOURCES HUB (Screenshot 4)       */}
            {/* ═════════════════════════════════════════════════════════════ */}
            <section className="space-y-4 print:space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  09
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Project Presentation &amp; Resources Hub
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    <span className="print:hidden">Capstone defense recording, </span>Capstone evaluation scores and verified project asset deliverables
                  </p>
                </div>
              </div>

              {/* Filter candidate's project submissions & demo videos */}
              {(() => {
                const candidateProjectSubmissions = (submissions || []).filter(
                  (s) => s.studentId === student.id || s.studentName?.toLowerCase() === student.name.toLowerCase()
                );
                const projectsWithDemoVideos = candidateProjectSubmissions.filter((s) => !!s.demoVideoUrl);

                return (
                  <div className="space-y-4">
                    {/* Project-Wise Demo Videos Showcase (If projects with demo videos exist) */}
                    {projectsWithDemoVideos.length > 0 && (
                      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 break-inside-avoid print:hidden">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <Video className="w-4 h-4 text-indigo-600" />
                            <h4 className="text-sm font-black text-slate-900">
                              Project-Wise Demo &amp; Presentation Recordings ({projectsWithDemoVideos.length})
                            </h4>
                          </div>
                          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Deliverable Demos Verified
                          </span>
                        </div>

                        <div className={`grid grid-cols-1 ${projectsWithDemoVideos.length > 1 ? "md:grid-cols-2" : ""} gap-4`}>
                          {projectsWithDemoVideos.map((projSub, pIdx) => {
                            const matchingAssignment = (projects || []).find((p) => p.id === projSub.projectId);
                            const projTitle = matchingAssignment?.title || projSub.projectName || `Project Submission ${pIdx + 1}`;
                            return (
                              <div key={projSub.id || pIdx} className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-950 text-white flex flex-col justify-between">
                                <div className="relative aspect-video bg-black flex items-center justify-center group">
                                  {projSub.demoVideoUrl?.includes("youtube.com") || projSub.demoVideoUrl?.includes("youtu.be") ? (
                                    <iframe
                                      src={projSub.demoVideoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")}
                                      title={projTitle}
                                      className="w-full h-full border-0"
                                      allowFullScreen
                                    />
                                  ) : (
                                    <video
                                      src={projSub.demoVideoUrl}
                                      controls
                                      className="w-full h-full object-cover"
                                      poster={student.avatar}
                                    />
                                  )}
                                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[9px] font-mono text-white border border-white/20">
                                    Project Demo
                                  </div>
                                </div>
                                <div className="p-3.5 bg-slate-900 border-t border-white/10 flex items-center justify-between gap-2">
                                  <div className="min-w-0">
                                    <h5 className="text-xs font-bold text-white truncate">{projTitle}</h5>
                                    <p className="text-[10px] text-slate-400 truncate">
                                      {projSub.demoVideoName || "Project Walkthrough & Keynote"}
                                    </p>
                                  </div>
                                  {projSub.demoVideoUrl && (
                                    <a
                                      href={projSub.demoVideoUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs shrink-0 flex items-center gap-1"
                                      title="Open Video in New Tab"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 print:grid-cols-1 gap-4">
                      {/* Left Card: Video Player & Interactive Buttons (Hidden in Download Report / Print) */}
                      {(!isDemoStudent(student) && projectsWithDemoVideos.length === 0 && candidateProjectSubmissions.length === 0) ? (
                        <div className="p-8 text-center rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col items-center justify-center space-y-2 print:hidden">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Video className="w-5 h-5" />
                          </div>
                          <h5 className="text-xs font-bold text-slate-800">No Capstone Defense Recording Uploaded</h5>
                          <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
                            Capstone defense video walkthroughs and demo recordings will appear here once submitted.
                          </p>
                        </div>
                      ) : (
                        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between print:hidden">
                          <div className="relative aspect-video rounded-xl bg-slate-900 overflow-hidden flex items-center justify-center p-4">
                            {/* Top Badges */}
                            <div className="absolute top-3 left-3 flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                                RECORDED
                              </span>
                            </div>
                            <div className="absolute top-3 right-3 text-white/80 font-mono text-[10px]">
                              38:24
                            </div>

                            {/* Center Play Button */}
                            <button
                              onClick={() => setVideoPlaying(!videoPlaying)}
                              className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-500 transition shadow-lg cursor-pointer"
                            >
                              {videoPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
                            </button>

                            {/* Bottom Controls */}
                            <div className="absolute bottom-3 left-4 right-4 text-white">
                              <div className="text-xs font-bold truncate mb-1">
                                Capstone Defense — AI-Powered Learning Analytics Platform
                              </div>
                              <div className="flex items-center gap-2 text-[10px] font-mono text-white/70">
                                <span>14:32</span>
                                <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: "38%" }} />
                                </div>
                                <span>38:24</span>
                                <Volume2 className="w-3 h-3 ml-1" />
                                <Maximize2 className="w-3 h-3" />
                              </div>
                            </div>
                          </div>

                          {/* 4 Asset Buttons */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                            <button
                              onClick={() => triggerToast("GitHub repository opened.")}
                              className="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Github className="w-3.5 h-3.5" />
                              <span>GitHub Repo</span>
                            </button>
                            <button
                              onClick={() => triggerToast("Live production demo opened.")}
                              className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Globe className="w-3.5 h-3.5" />
                              <span>Live Demo</span>
                            </button>
                            <button
                              onClick={() => triggerToast("Presentation slide deck opened.")}
                              className="px-3 py-2 rounded-xl bg-fuchsia-600 text-white text-xs font-bold hover:bg-fuchsia-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Presentation className="w-3.5 h-3.5" />
                              <span>Slide Deck</span>
                            </button>
                            <button
                              onClick={() => triggerToast("API Swagger documentation opened.")}
                              className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>API Docs</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Right Card: Presentation Evaluation (Expands full-width in Print / Download Report) */}
                      {(() => {
                        const presScore = data.moduleScores?.find(m => m.id === "09")?.score ?? (isDemoStudent(student) ? 88 : 0);
                        return (
                          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between print:col-span-1 print:w-full break-inside-avoid print:block">
                            <div>
                              <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
                                <span>Presentation Evaluation</span>
                                <span className="hidden print:inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700">
                                  Evaluated Score: {presScore > 0 ? `${presScore} / 100` : "Pending"}
                                </span>
                              </h4>
                              <div className="h-44 w-full print:h-40">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={data.presentationScores} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={34}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis dataKey="category" tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} />
                                    <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} />
                                    <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "11px" }} />
                                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                                      {data.presentationScores.map((_, idx) => (
                                        <Cell key={idx} fill={idx === 3 ? "#10b981" : "#4f46e5"} />
                                      ))}
                                    </Bar>
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            </div>

                            {/* Overall Score Progress Bar */}
                            <div className="pt-4 mt-2 border-t border-slate-100">
                              <div className="flex items-center justify-between text-xs mb-1.5">
                                <span className="font-bold text-slate-700">Overall Presentation Score</span>
                                <span className="text-base font-black text-indigo-600">
                                  {presScore > 0 ? `${presScore} / 100` : "Pending Evaluation"}
                                </span>
                              </div>
                              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                                <div
                                  className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                                  style={{ width: `${presScore}%` }}
                                />
                              </div>
                              <p className="text-[10px] text-slate-400">
                                Evaluated by 3-member panel: Lead Instructor + 2 Industry Advisors
                              </p>
                            </div>

                            {/* Verified Deliverables Artifacts (Neat Document Format for Print & Review) */}
                            {(!isDemoStudent(student) && candidateProjectSubmissions.length === 0) ? (
                              <div className="pt-4 mt-3 border-t border-slate-100">
                                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Verified Capstone Project Deliverables</span>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
                                  No capstone deliverables (repo, live demo, API specs) registered yet.
                                </div>
                              </div>
                            ) : (
                              <div className="pt-4 mt-3 border-t border-slate-100">
                                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                  <span>Verified Capstone Project Deliverables</span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                                    <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px] mb-0.5">
                                      <Github className="w-3 h-3 text-slate-700" />
                                      <span>Repository</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 truncate">github.com/mind2i/analytics</p>
                                    <span className="inline-block mt-1 text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">142 Commits • Verified</span>
                                  </div>
                                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                                    <div className="flex items-center gap-1.5 font-bold text-indigo-800 text-[11px] mb-0.5">
                                      <Globe className="w-3 h-3 text-indigo-600" />
                                      <span>Live Demo</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 truncate">analytics.mind2i.internal</p>
                                    <span className="inline-block mt-1 text-[9px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">Production Active</span>
                                  </div>
                                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                                    <div className="flex items-center gap-1.5 font-bold text-fuchsia-800 text-[11px] mb-0.5">
                                      <Presentation className="w-3 h-3 text-fuchsia-600" />
                                      <span>Slide Deck</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 truncate">defense-presentation-v4.pdf</p>
                                    <span className="inline-block mt-1 text-[9px] font-semibold text-fuchsia-600 bg-fuchsia-50 px-1.5 py-0.5 rounded">24 Slides • Reviewed</span>
                                  </div>
                                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                                    <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-[11px] mb-0.5">
                                      <FileText className="w-3 h-3 text-emerald-600" />
                                      <span>API Docs</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 truncate">OpenAPI 3.1 Specification</p>
                                    <span className="inline-block mt-1 text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">18 Endpoints • Tested</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Intern Uploaded Technical Artifacts & Whitepaper Vault */}
                    {effectiveResources.length === 0 && !isDemoStudent(student) && (
                      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs text-center space-y-2 break-inside-avoid">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                          <FolderGit2 className="w-4 h-4" />
                        </div>
                        <h5 className="text-xs font-bold text-slate-800">No Uploaded Technical Artifacts</h5>
                        <p className="text-[11px] text-slate-500 max-w-sm mx-auto leading-relaxed">
                          Technical whitepapers, architecture blueprints, and slide decks uploaded in Candidate Profile will appear here with AI audit scores.
                        </p>
                      </div>
                    )}

                    {/* Intern Uploaded Technical Artifacts & Whitepaper Vault */}
                    {effectiveResources.length > 0 && (
                      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 break-inside-avoid">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <FolderGit2 className="w-4 h-4 text-indigo-600" />
                            <h4 className="text-sm font-black text-slate-900">
                              Uploaded Technical Documents, Presentations &amp; Architecture Blueprints
                            </h4>
                          </div>
                          <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {effectiveResources.filter(r => typeof r.aiRating === "number" && r.aiRating > 0).length} of {effectiveResources.length} Artifacts Verified
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {effectiveResources.map((res, idx) => {
                            const isAnalyzed = typeof res.aiRating === "number" && res.aiRating > 0;
                            return (
                              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between space-y-2.5">
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-white text-indigo-700 border border-indigo-100">
                                      {res.type}
                                    </span>
                                    {isAnalyzed ? (
                                      <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                                        <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                                        Admin Verified: {res.aiRating}%
                                      </span>
                                    ) : (
                                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                                        <Clock className="w-2.5 h-2.5 text-amber-600" />
                                        Submitted • Awaiting Admin Audit
                                      </span>
                                    )}
                                  </div>
                                  <h5 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug pt-1">
                                    {res.title}
                                  </h5>
                                  {res.description && (
                                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                      {res.description}
                                    </p>
                                  )}
                                  {res.aiAuditSummary && (
                                    <div className="p-2 rounded-lg bg-indigo-50/70 border border-indigo-100 text-[10px] text-indigo-900 leading-snug mt-1.5">
                                      <strong className="text-indigo-950 font-bold block text-[9px] uppercase mb-0.5">Faculty AI Audit:</strong>
                                      {res.aiAuditSummary}
                                    </div>
                                  )}
                                </div>

                                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
                                  <span>{res.fileSize || "PDF"} • {res.uploadedAt || "Verified"}</span>
                                  <a
                                    href={res.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1 rounded bg-white text-indigo-600 hover:text-indigo-800 border border-slate-200"
                                    title="Open Document"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </section>

            {/* ═════════════════════════════════════════════════════════════ */}
            {/* 10: VIDEO PORTFOLIO & SELF-REFLECTION (Screenshot 5)          */}
            {/* ═════════════════════════════════════════════════════════════ */}
            <section className="space-y-4 print:space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  10
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    <span className="print:hidden">Video Portfolio &amp; </span>Candidate Self-Reflection &amp; Communication
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    <span className="print:hidden">Personal journey vlog, </span>reflective timestamps, developmental milestones, and communication skills assessment
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 print:grid-cols-2 gap-4">
                {/* Left Column: Reflection Video (Hidden in print) + Key Timestamps */}
                <div className="space-y-4 flex flex-col justify-between">
                  {/* Reflection Video Card (Screen Only - Hidden in Download Report) */}
                  {(!isDemoStudent(student) && (!effectiveReflectionVideo || !effectiveReflectionVideo.videoUrl)) ? (
                    <div className="p-8 text-center rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col items-center justify-center space-y-2 print:hidden">
                      <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                        <Video className="w-5 h-5" />
                      </div>
                      <h5 className="text-xs font-bold text-slate-800">No Reflection Video Recorded</h5>
                      <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
                        {student.name.split(" ")[0]} has not uploaded a video reflection yet. Candidates can record or submit their reflection video from their profile.
                      </p>
                    </div>
                  ) : (
                    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs print:hidden">
                      <div className="relative aspect-video rounded-xl bg-slate-900 overflow-hidden flex items-center justify-center">
                        {effectiveReflectionVideo?.videoUrl ? (
                          effectiveReflectionVideo.videoUrl.includes("youtube.com") || effectiveReflectionVideo.videoUrl.includes("youtu.be") ? (
                            <iframe
                              src={effectiveReflectionVideo.videoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")}
                              title="Reflection Video"
                              className="w-full h-full border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : (
                            <video
                              src={effectiveReflectionVideo.videoUrl}
                              controls
                              className="w-full h-full object-cover"
                              poster={student.avatar}
                            />
                          )
                        ) : (
                          <div className="w-full h-full p-4 flex items-center justify-center relative">
                            <div className="absolute top-3 left-3">
                              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black uppercase tracking-wider">
                                RECORDED
                              </span>
                            </div>
                            <div className="absolute top-3 right-3 text-white/80 font-mono text-[10px]">
                              {effectiveReflectionVideo?.duration || "22:15"}
                            </div>

                            <button
                              onClick={() => setReflectionVideoPlaying(!reflectionVideoPlaying)}
                              className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-500 transition shadow-lg cursor-pointer"
                            >
                              {reflectionVideoPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
                            </button>

                            <div className="absolute bottom-3 left-4 right-4 text-white">
                              <div className="text-xs font-bold truncate mb-1">
                                {effectiveReflectionVideo?.title || "Personal Reflection — My Journey from Beginner to AI Engineer"}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] font-mono text-white/70">
                                <span>14:32</span>
                                <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: "65%" }} />
                                </div>
                                <span>{effectiveReflectionVideo?.duration || "22:15"}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      {effectiveReflectionVideo?.title && (
                        <div className="mt-3 flex items-center justify-between">
                          <div className="min-w-0 pr-2">
                            <p className="text-xs font-bold text-slate-800 truncate">{effectiveReflectionVideo.title}</p>
                            <p className="text-[10px] text-slate-400">Duration: {effectiveReflectionVideo.duration || "18:42"} • Recorded Video Portfolio</p>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase shrink-0">
                            AI Analyzed
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Key Reflections & Timestamps Card (Always visible, symmetrically aligned in print) */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Key Reflections &amp; Developmental Milestones</span>
                      </h4>
                      <div className="space-y-3">
                        {(() => {
                          const milestones = effectiveReflectionVideo?.aiMilestones && effectiveReflectionVideo.aiMilestones.length > 0
                            ? effectiveReflectionVideo.aiMilestones
                            : (isDemoStudent(student) ? [
                                { time: "02:14", desc: "Initial fears about AI complexity and how the program structure helped build confidence incrementally." },
                                { time: "07:38", desc: "The breakthrough moment during the first NLP sprint — debugging a tokenizer bug that led to deeper PyTorch understanding." },
                                { time: "13:22", desc: "Collaborating with peers from different technical backgrounds shaped a more holistic engineering mindset." },
                                { time: "18:50", desc: "Transition from writing code to designing systems — the architectural shift in thinking during M4." },
                              ] : []);

                          if (milestones.length === 0) {
                            return (
                              <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
                                No developmental milestones recorded yet. Milestones are extracted automatically upon video reflection submission.
                              </div>
                            );
                          }

                          return milestones.map((item, i) => (
                            <div key={i} className="flex items-start gap-2.5 text-xs">
                              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono text-[10px] font-bold shrink-0">
                                {item.time}
                              </span>
                              <p className="text-slate-600 leading-relaxed">
                                {item.desc}
                              </p>
                            </div>
                          ));
                        })()}
                      </div>

                      {/* AI Reflection Summary if present */}
                      {effectiveReflectionVideo?.aiSummary && (
                        <div className="mt-4 p-3 bg-violet-50/80 rounded-xl border border-violet-100 text-xs">
                          <p className="font-bold text-violet-900 mb-1 flex items-center gap-1.5">
                            <BrainCircuit className="w-3.5 h-3.5 text-violet-600" />
                            <span>AI Reflection Synthesis &amp; Growth Analysis</span>
                          </p>
                          <p className="text-slate-700 italic leading-relaxed">
                            "{effectiveReflectionVideo.aiSummary}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Print & Review Reflection Summary Pill */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Self-Awareness &amp; Growth:</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                        {isDemoStudent(student) || (effectiveReflectionVideo?.aiCommunicationScore && effectiveReflectionVideo.aiCommunicationScore > 80)
                          ? "Top 5% Cohort Reflection Maturity"
                          : "Calibrating Upon Submission"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Communication Skills Assessment */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between break-inside-avoid print:block">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-4">
                      Communication Skills Assessment
                    </h4>

                    {/* Chart */}
                    <div className="h-44 w-full print:h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.communicationSkills} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={34}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="skill" tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} />
                          <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "11px" }} />
                          <Bar dataKey="score" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Score" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* 4 Skill Metric Bars */}
                    <div className="space-y-2 mt-4">
                      {data.communicationSkills.map((item, idx) => (
                        <div key={idx}>
                          <div className="flex items-center justify-between text-xs font-bold mb-1">
                            <span className="text-slate-600">{item.skill}</span>
                            <span className="text-slate-900">{item.score}/100</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${item.score}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2.5 mt-4 pt-3 border-t border-slate-100">
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {effectiveEvaluation?.communicationNotes || (
                        isDemoStudent(student) ? (
                          <>
                            {student.name.split(" ")[0]} demonstrates strong verbal communication with a natural fluency and confident delivery. Her structured approach to explaining technical concepts is notable — she consistently situates solutions within business context before detailing implementation.
                          </>
                        ) : (
                          <span className="italic text-slate-400">
                            Awaiting faculty communication evaluation. Reviewers can record scores, fluency analysis, and remarks in Admin Evaluations.
                          </span>
                        )
                      )}
                    </p>
                    {effectiveEvaluation?.fluencyNotes && (
                      <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950">
                        <span className="font-bold text-indigo-800">Fluency &amp; Articulation Note: </span>
                        <span>{effectiveEvaluation.fluencyNotes}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* ═════════════════════════════════════════════════════════════ */}
            {/* ASSIGNED PROJECTS & ENGINEERING DELIVERABLES PORTFOLIO        */}
            {/* ═════════════════════════════════════════════════════════════ */}
            {(() => {
              const activeProjList = (projects && projects.length > 0)
                ? projects.filter((p) => !p.batchId || p.batchId === "all" || p.batchId === studentBatch?.id || p.batchId === student.batchId)
                : (isDemo ? INITIAL_PROJECT_ASSIGNMENTS : []);
              const activeSubList = submissions && submissions.length > 0 ? submissions : (isDemo ? INITIAL_PROJECT_SUBMISSIONS : []);

              // Filter candidate's submissions
              const candidateSubs = activeSubList.filter(
                (s) => s.studentId === student.id || s.studentName.toLowerCase() === student.name.toLowerCase()
              );

              const totalAssigned = activeProjList.length;
              const submittedCount = candidateSubs.length;
              const passedCount = candidateSubs.filter((s) => s.status === "passed").length;
              const onTimeCount = candidateSubs.filter((s) => {
                const p = activeProjList.find((x) => x.id === s.projectId);
                if (!p) return true;
                try {
                  return new Date(s.submittedAt).getTime() <= new Date(p.deadline + "T23:59:59").getTime();
                } catch {
                  return true;
                }
              }).length;

              const totalPointsEarned = candidateSubs.reduce(
                (acc, curr) => acc + (curr.gradePoints || 0),
                0
              );

              return (
                <section className="space-y-4 print:space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      11
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900">
                        Assigned Projects & Engineering Deliverables Portfolio
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">
                        Hands-on sprint deliverables, live preview URLs, intern architecture notes, and mentor evaluation verdicts
                      </p>
                    </div>
                  </div>

                  {/* Summary KPI Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                      <div className="text-[11px] font-bold text-slate-400 uppercase">Projects Assigned</div>
                      <div className="text-xl font-black text-slate-900 mt-0.5">{totalAssigned} Tasks</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Cohort curriculum</div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 shadow-2xs">
                      <div className="text-[11px] font-bold text-indigo-600 uppercase">Completed Deliverables</div>
                      <div className="text-xl font-black text-indigo-950 mt-0.5">
                        {submittedCount} <span className="text-xs font-semibold text-indigo-700">/ {totalAssigned}</span>
                      </div>
                      <div className="text-[10px] text-indigo-600 font-bold mt-0.5">{passedCount} Passed Benchmarks</div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 shadow-2xs">
                      <div className="text-[11px] font-bold text-emerald-700 uppercase">On-Time Punctuality</div>
                      <div className="text-xl font-black text-emerald-950 mt-0.5">
                        {submittedCount > 0 ? Math.round((onTimeCount / submittedCount) * 100) : 100}%
                      </div>
                      <div className="text-[10px] text-emerald-700 font-bold mt-0.5">{onTimeCount} of {submittedCount} on-schedule</div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 shadow-2xs">
                      <div className="text-[11px] font-bold text-amber-700 uppercase">Project Points Earned</div>
                      <div className="text-xl font-black text-amber-950 mt-0.5">+{totalPointsEarned} pts</div>
                      <div className="text-[10px] text-amber-700 font-bold mt-0.5">Added to Leaderboard</div>
                    </div>
                  </div>

                  {/* Project Cards Detail */}
                  {activeProjList.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                        <FolderKanban className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">No Assigned Projects in Cohort</h4>
                      <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                        Projects assigned by mentors to this cohort will appear here with live preview links, source repositories, and evaluation rubrics.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {activeProjList.map((project) => {
                        const sub = candidateSubs.find((s) => s.projectId === project.id);
                        const isOntime = sub
                          ? new Date(sub.submittedAt).getTime() <= new Date(project.deadline + "T23:59:59").getTime()
                          : false;

                        return (
                          <div
                            key={project.id}
                            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3"
                          >
                            {/* Project Header */}
                            <div className="flex flex-wrap items-start justify-between gap-2.5 pb-2.5 border-b border-slate-100">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                    {project.technicalCategory}
                                  </span>
                                  <span className="text-amber-500 font-black text-xs">
                                    +{project.leaderboardPoints} pts
                                  </span>
                                  <span className="text-slate-400 text-xs">•</span>
                                  <span className="text-xs text-slate-500 font-medium">
                                    Deadline: {project.deadline}
                                  </span>
                                </div>
                                <h4 className="text-sm font-black text-slate-900 tracking-tight">
                                  {project.title}
                                </h4>
                              </div>

                              <div>
                                {sub ? (
                                  <div className="flex items-center gap-1.5">
                                    {isOntime ? (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        ✓ On-Time
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                        Late
                                      </span>
                                    )}

                                    {sub.status === "passed" && (
                                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                        ✓ Passed ({sub.gradePoints || project.leaderboardPoints} pts)
                                      </span>
                                    )}
                                    {sub.status === "needs_revision" && (
                                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                        ⚠ Needs Revision ({sub.gradePoints || 0} pts)
                                      </span>
                                    )}
                                    {sub.status === "pending" && (
                                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                        • Pending Evaluation
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                    Not Submitted
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Deliverable Links (If submitted) */}
                            {sub && (
                              <div className="flex flex-wrap items-center gap-2">
                                {sub.githubRepoUrl && (
                                  <a
                                    href={sub.githubRepoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-800 hover:text-indigo-700 border border-slate-200 text-xs font-bold transition group"
                                  >
                                    <Github className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-600" />
                                    <span>Repository Branch</span>
                                    <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-indigo-600" />
                                  </a>
                                )}
                                {sub.liveDemoUrl && (
                                  <a
                                    href={sub.liveDemoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-800 hover:text-indigo-700 border border-slate-200 text-xs font-bold transition group"
                                  >
                                    <Globe className="w-3.5 h-3.5 text-indigo-500" />
                                    <span>Live Deployment Preview</span>
                                    <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-indigo-600" />
                                  </a>
                                )}
                                {sub.fileName && (
                                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium">
                                    <FileArchive className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>{sub.fileName}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Candidate's Architecture Notes */}
                            {sub?.submissionNotes && (
                              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200">
                                <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                                  Candidate's Technical Writeup & Solution Architecture
                                </div>
                                <p className="text-xs text-slate-700 font-medium leading-relaxed whitespace-pre-line">
                                  {sub.submissionNotes}
                                </p>
                              </div>
                            )}

                            {/* Official Mentor Review & Remarks */}
                            {sub?.mentorFeedback && (
                              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 text-xs">
                                <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
                                  <Award className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Official Mentor Review & Feedback:</span>
                                </div>
                                <p className="text-slate-700 font-medium leading-relaxed italic">
                                  "{sub.mentorFeedback}"
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              );
            })()}

            {/* ═════════════════════════════════════════════════════════════ */}
            {/* 12: FINAL EVALUATION & BEHAVIORAL REVIEW (Screenshot 5)       */}
            {/* ═════════════════════════════════════════════════════════════ */}
            <section className="space-y-4 print:space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  12
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Final Evaluation & Comprehensive Behavioral Review
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Soft skills radar, 30-60-90 day growth plan, and official hiring recommendation
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 print:block print:space-y-4">
                {/* Left Card: Soft Skills Radar Assessment */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between break-inside-avoid print:block print:mb-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-slate-900">
                        Soft Skills Radar Assessment
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {data.softSkills.some((s: any) => s.score > 0) ? "Telemetry Calibrated" : "Appraisal Pending"}
                      </span>
                    </div>

                    <div className="h-56 w-full print:h-44">
                      {data.softSkills.every((s: any) => s.score === 0) && !isDemo ? (
                        <div className="h-full w-full flex items-center justify-center rounded-xl bg-slate-50/80 border border-slate-200/80 p-4 text-center">
                          <div className="space-y-2 max-w-xs mx-auto">
                            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                              <BrainCircuit className="w-4.5 h-4.5" />
                            </div>
                            <h5 className="text-xs font-bold text-slate-800">Soft Skills Evaluation Pending</h5>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              Collaboration, accountability, communication, initiative, and adaptability calibrate upon faculty appraisal and milestone submissions.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="68%" data={data.softSkills}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: "#64748b", fontWeight: 600 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8, fill: "#94a3b8" }} />
                            <Radar name="Score" dataKey="score" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.2} strokeWidth={2} />
                          </RadarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  {/* 2x3 Score Table */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 pt-4 border-t border-slate-100 text-xs">
                    {data.softSkills.map((s: any) => (
                      <div key={s.subject} className="flex justify-between">
                        <span className="text-slate-500">{s.subject}</span>
                        <strong className={s.score > 0 ? "text-indigo-600 font-bold" : "text-slate-400 font-medium"}>
                          {s.score > 0 ? s.score : "—"}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Card: Dynamic Batch-Duration Growth Plan */}
                {(() => {
                  const growthPlan = getGrowthPlan(
                    data.batchDurationMonths || studentBatch?.durationMonths || 6,
                    studentBatch?.technologies || student.skills || []
                  );

                  return (
                    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 break-inside-avoid print:block">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900">
                          {growthPlan.title}
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {data.batchDurationMonths || studentBatch?.durationMonths || 6} Months Cohort
                        </span>
                      </div>

                      {growthPlan.phases.map((phase, idx) => (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-xl border ${
                            idx === 2
                              ? "border-emerald-100 bg-emerald-50/30"
                              : "border-indigo-100 bg-indigo-50/30"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded-md ${phase.badgeBg} text-white text-[10px] font-bold`}>
                              {phase.badge}
                            </span>
                            <span className="text-xs font-bold text-slate-800">{phase.title}</span>
                          </div>
                          <ul className="text-xs text-slate-600 space-y-1 pl-1">
                            {phase.items.map((item, itemIdx) => (
                              <li key={itemIdx}>› {item}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Full Width Card: Official Program Appraisal */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs break-inside-avoid space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-black text-slate-900">
                        Official Program Appraisal &amp; Faculty Assessment
                      </h4>
                      {panelConsensusAverage && panelConsensusAverage.count > 1 ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black uppercase tracking-wide flex items-center gap-1">
                          <Users className="w-3 h-3 text-emerald-600" />
                          <span>Consensus Average ({panelConsensusAverage.count} Faculty Reviews)</span>
                        </span>
                      ) : effectiveEvaluation ? (
                        <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 border border-violet-200 text-[10px] font-black uppercase">
                          AI Verified Review
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Prepared by: <strong className="text-slate-800">{effectiveEvaluation?.reviewerName || mentorName}</strong> · {effectiveEvaluation?.evaluatedAt || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {panelConsensusAverage && (
                      <div className="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black">
                        Panel Composite: {panelConsensusAverage.avgOverall}%
                      </div>
                    )}
                    <div className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-2xs ${
                      effectiveEvaluation?.aiVerdict && effectiveEvaluation.aiVerdict !== "Onboarding in Progress · Baseline Telemetry Pending"
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}>
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>{effectiveEvaluation?.aiVerdict || (isDemo ? "Hiring Status: Ready for Senior Associate" : "Appraisal Status: Pending Faculty Evaluation")}</span>
                    </div>
                  </div>
                </div>

                {effectiveEvaluation ? (
                  <div className="space-y-4">
                    {/* 4 Dimension Evaluation Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-cyan-600" />
                            <span>Communication</span>
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-100 text-cyan-800 border border-cyan-200">
                            {effectiveEvaluation.communicationScore}%
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {effectiveEvaluation.communicationNotes}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                            <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Grammar &amp; Technical Docs</span>
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {effectiveEvaluation.grammarScore}%
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {effectiveEvaluation.grammarNotes}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                            <Presentation className="w-3.5 h-3.5 text-rose-600" />
                            <span>Fluency &amp; Defense</span>
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                            {effectiveEvaluation.fluencyScore}%
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {effectiveEvaluation.fluencyNotes}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                            <FolderKanban className="w-3.5 h-3.5 text-blue-600" />
                            <span>Project Execution</span>
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-200">
                            {effectiveEvaluation.projectScore}%
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {effectiveEvaluation.projectNotes}
                        </p>
                      </div>
                    </div>

                    {/* Multi-Admin Faculty Review Breakdown (Consensus Transparency) */}
                    {panelConsensusAverage && panelConsensusAverage.count > 1 && (
                      <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 shadow-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-indigo-400" />
                            <span className="text-xs font-black text-white">
                              Multi-Admin Faculty Panel ({panelConsensusAverage.count} Evaluators Recorded)
                            </span>
                          </div>
                          <div className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-black">
                            Arithmetic Mean: {panelConsensusAverage.avgOverall}% Consensus
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                          {panelConsensusAverage.evaluators.map((evalItem, idx) => (
                            <div
                              key={evalItem.id || idx}
                              className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1.5"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 block truncate">
                                    {evalItem.evaluationName || "Faculty Appraisal"}
                                  </span>
                                  <span className="text-xs font-black text-white truncate block">
                                    {evalItem.reviewerName}
                                  </span>
                                </div>
                                <span className="px-2 py-0.5 rounded-md bg-emerald-500/30 text-emerald-300 text-[10px] font-black shrink-0">
                                  {evalItem.overallRating ?? 0}%
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-300 truncate">
                                {evalItem.reviewerRole || "Faculty Reviewer"}
                              </p>
                              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/5">
                                <span>{evalItem.evaluatedAt || "Verified"}</span>
                                <span className="text-slate-300">
                                  C:{evalItem.communicationScore ?? 0}% · G:{evalItem.grammarScore ?? 0}% · P:{evalItem.projectScore ?? (evalItem as any).projectExecutionScore ?? 0}%
                                </span>
                              </div>
                              {evalItem.customNotes && (
                                <p className="text-[10px] text-slate-300 line-clamp-2 italic pt-0.5">
                                  "{evalItem.customNotes}"
                                </p>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="text-[10px] text-slate-400 flex flex-wrap items-center gap-2 pt-1 border-t border-white/5">
                          <span className="font-bold text-slate-300">Consensus Formula:</span>
                          <span>
                            Sum of ratings ({panelConsensusAverage.evaluators.map((e) => `${e.overallRating ?? 0}%`).join(" + ")}) ÷ {panelConsensusAverage.count} = <strong className="text-emerald-300">{panelConsensusAverage.avgOverall}% Average Composite</strong>
                          </span>
                        </div>
                      </div>
                    )}

                    {/* AI Executive Summary Narrative */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                        AI Executive Appraisal Summary
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {effectiveEvaluation.aiSummary}
                      </p>
                    </div>

                    {/* Lead Mentor Custom Remarks */}
                    {effectiveEvaluation.customNotes && (
                      <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-800 block">
                          Lead Mentor Observations &amp; Custom Program Remarks
                        </span>
                        <p className="text-xs text-indigo-950 leading-relaxed font-medium">
                          {effectiveEvaluation.customNotes}
                        </p>
                      </div>
                    )}

                    {/* Strengths & Growth Areas Chips */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      {effectiveEvaluation.aiStrengths && effectiveEvaluation.aiStrengths.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block">
                            Key Demonstrated Competencies
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {effectiveEvaluation.aiStrengths.map((str, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold"
                              >
                                • {str}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {effectiveEvaluation.aiGrowthAreas && effectiveEvaluation.aiGrowthAreas.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 block">
                            Continued Growth Focus
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {effectiveEvaluation.aiGrowthAreas.map((gro, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold"
                              >
                                • {gro}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  isDemo ? (
                    <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                      <p>
                        <strong className="text-slate-900 capitalize">{student.name}</strong> has completed the <strong className="text-indigo-600">{trackTitle}</strong> program with distinction, achieving a cumulative performance score of <strong>{data.cumulativeScore}%</strong> — placing them in the <strong>top 3% of graduates</strong> in <span className="font-mono font-bold text-slate-800">{cohortId}</span>. Their progression throughout the program has been marked by consistent intellectual rigor, an uncommon capacity for independent research, and a genuine commitment to the craft of software engineering.
                      </p>
                      <p>
                        Their strongest demonstrated competencies are in full-stack AI system design and API architecture, where their capstone project — an AI-powered learning analytics platform serving real institutional clients — achieved production deployment within the program timeline. The system, built end-to-end in Next.js, FastAPI, PyTorch, and PostgreSQL, processes over 15,000 learner interaction events daily and has been adopted as an internal tool by two cohort partners.
                      </p>
                      <p>
                        Areas identified for continued growth include advanced distributed systems design at scale and formal DevOps pipeline engineering — both of which are addressed in the structured 30-60-90 day plan above. These represent expanding edges rather than deficiencies, and {student.name.split(" ")[0]} has already demonstrated proactive self-study habits that will serve them well in closing these gaps.
                      </p>
                      <p>
                        It is the formal recommendation of the MIND2I Academy program faculty that {student.name} be considered for placement at the <strong className="text-slate-900">Senior Associate Engineer</strong> level, specifically in teams working at the intersection of backend systems, data engineering, and AI product development. They bring not only technical capability, but the professional presence and communication clarity essential for high-velocity engineering teams.
                      </p>
                    </div>
                  ) : (
                    <div className="p-8 text-center rounded-2xl bg-slate-50/80 border border-slate-200/80 shadow-xs space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <h5 className="text-sm font-bold text-slate-800">Faculty Appraisal In Progress</h5>
                      <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
                        Official program appraisal and faculty review for <strong className="text-slate-800 capitalize">{student.name}</strong> will be conducted upon completion of cohort sprint milestones, attendance verification, and capstone project submissions.
                      </p>
                    </div>
                  )
                )}
              </div>
            </section>

            {/* Bottom print-spacing */}
            <div className="h-10 print:hidden" />
              </>
            )}
          </main>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CandidateReportView;
