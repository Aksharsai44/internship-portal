import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import {
  UserRole,
  Batch,
  Student,
  Assignment,
  LearnHubModule,
  LiveQuestion,
  AppSettings,
  CertificateTemplate,
  ScheduledMeeting,
  ClientUser,
  InterviewRequest,
  ProjectAssignment,
  ProjectSubmission,
  ShiftPattern,
  InternRosterAssignment,
  AttendanceRecord,
  PunchLogEntry,
  DailyActivityLog,
  HolidayEvent,
  LeaveRequest,
  InternResumeData,
  AppNotification,
  InternEvaluation,
  InternResource,
  isDemoStudent,
} from "./types";

import {
  INITIAL_SHIFT_PATTERNS,
  INITIAL_ROSTER_ASSIGNMENTS,
  INITIAL_HOLIDAYS,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_PUNCH_LOGS,
  INITIAL_DAILY_ACTIVITY_LOGS,
} from "./data/attendanceData";
import { INITIAL_RESUME_DATA, createEmptyResumeData } from "./data/mockResumeData";
import { INITIAL_NOTIFICATIONS } from "./data/notificationData";
import { AssignedProjectsKanbanView } from "./components/AssignedProjectsKanbanView";
import {
  initialBatches,
  initialStudents,
  initialAssignments,
  initialLearnHubModules,
  initialSettings,
  initialCertificateTemplate,
  initialScheduledMeetings,
  emptyBatch,
  emptyStudent,
  initialClients,
  initialInterviewRequests,
} from "./data/initialData";
import { AdminDashboardView } from "./components/AdminDashboardView";
import { BatchManagementView } from "./components/BatchManagementView";
import { LearnHubInteractive } from "./components/LearnHubInteractive";
import { AssignmentManagerView } from "./components/AssignmentManagerView";
import { LiveQAManagerView } from "./components/LiveQAManagerView";
import { ReportsAnalyticsView } from "./components/ReportsAnalyticsView";
import { LeaderboardView } from "./components/LeaderboardView";
import { CertificateManagerView } from "./components/CertificateManagerView";
import { SettingsView } from "./components/SettingsView";
import LandingView from "./components/LandingView";
import LoginModal from "./components/LoginModal";
import { BatchRegistrationModal } from "./components/BatchRegistrationModal";
import { StudentDashboardView } from "./components/StudentDashboardView";
import { CandidateReportView } from "./components/CandidateReportView";
import { ClientDashboardView } from "./components/ClientDashboardView";
import { ClientLeaderboardView } from "./components/ClientLeaderboardView";
import { ClientCohortsView } from "./components/ClientCohortsView";
import { ClientShortlistPipelineView } from "./components/ClientShortlistPipelineView";
import { ClientAnalyticsView } from "./components/ClientAnalyticsView";
import { InterviewRequestsView } from "./components/InterviewRequestsView";
import { InternInterviewsView } from "./components/InternInterviewsView";
import { ClientManagementView } from "./components/ClientManagementView";
import { ShiftManagementView } from "./components/ShiftManagementView";
import { InternAttendanceView } from "./components/InternAttendanceView";
import { DailyActivityLogView } from "./components/DailyActivityLogView";
import { AdminDailyLogsReviewView } from "./components/AdminDailyLogsReviewView";
import { AdminProfileEvaluationsView } from "./components/AdminProfileEvaluationsView";
import { AIResumeBuilderView } from "./components/AIResumeBuilderView";
import { NotificationDropdown } from "./components/NotificationDropdown";
import { Minda2Logo } from "./components/Minda2Logo";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  BookOpen,
  Code2,
  Radio,
  BarChart3,
  Trophy,
  Award,
  Settings,
  User,
  ShieldCheck,
  GraduationCap,
  Building2,
  ChevronDown,
  LogOut,
  Menu,
  X,
  Search,
  Lock,
  Library,
  Calendar,
  BookmarkCheck,
  FolderKanban,
  Clock,
  FileText,
  CheckCircle2,
  Sparkles,
  Bell,
  FolderGit2,
  Check,
} from "lucide-react";
import { ResourcesView } from "./components/ResourcesView";
import { ProfileView } from "./components/ProfileView";
import { InternResourcesVaultView, DEFAULT_SAMPLE_RESOURCES } from "./components/InternResourcesVaultView";
import { motion, AnimatePresence } from "motion/react";

export const DEFAULT_ADMIN_USER = {
  name: "Vijaya Kumar Mekala",
  role: "Lead Evaluator & Program Director",
  email: "vijayakumar@mind2i.edu",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=VijayaKumar",
  assignedBatches: ["all"],
};

export const getInitialAuthSession = () => {
  try {
    const explicitLogout = localStorage.getItem("mind2i_explicit_logout");
    if (explicitLogout === "true") {
      return {
        isAuthenticated: false,
        role: "admin" as UserRole,
        user: null,
      };
    }
    const saved = localStorage.getItem("mind2i_auth_session");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed.isAuthenticated === "boolean") {
        return {
          isAuthenticated: parsed.isAuthenticated,
          role: (parsed.role as UserRole) || "admin",
          user: parsed.user || (parsed.role === "admin" ? DEFAULT_ADMIN_USER : null),
        };
      }
    }
    // Default to authenticated as admin so page refreshes never redirect to the brochure page
    return {
      isAuthenticated: true,
      role: "admin" as UserRole,
      user: DEFAULT_ADMIN_USER,
    };
  } catch {
    return {
      isAuthenticated: true,
      role: "admin" as UserRole,
      user: DEFAULT_ADMIN_USER,
    };
  }
};

export default function App() {
  // Global State
  const initialAuth = useMemo(() => getInitialAuthSession(), []);
  const [userRole, setUserRole] = useState<UserRole>(initialAuth.role);
  const [batches, setBatches] = useState<Batch[]>(initialBatches);
  const [selectedBatch, setSelectedBatch] = useState<Batch>(() => {
    try {
      const savedBatchId = localStorage.getItem("mind2i_selected_batch_id");
      if (savedBatchId) {
        const found = initialBatches.find((b) => b.id === savedBatchId);
        if (found) return found;
      }
    } catch {}
    return emptyBatch;
  });
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const savedEvals = JSON.parse(localStorage.getItem("m2i_intern_evaluations") || "{}");
      const savedResources = JSON.parse(localStorage.getItem("m2i_intern_resources") || "{}");
      const savedVideos = JSON.parse(localStorage.getItem("m2i_intern_videos") || "{}");
      return initialStudents.map((s) => ({
        ...s,
        evaluation: savedEvals[s.id] || s.evaluation,
        resources: savedResources[s.id] || s.resources || (isDemoStudent(s) ? DEFAULT_SAMPLE_RESOURCES(s.id, s.batchId) : []),
        reflectionVideo: savedVideos[s.id] || s.reflectionVideo,
      }));
    } catch {
      return initialStudents;
    }
  });
  const [currentStudent, setCurrentStudent] = useState<Student>(emptyStudent);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [learnHubModules, setLearnHubModules] = useState<LearnHubModule[]>(initialLearnHubModules);
  const [liveQuestions, setLiveQuestions] = useState<LiveQuestion[]>([]);
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const [scheduledMeetings, setScheduledMeetings] = useState<ScheduledMeeting[]>(initialScheduledMeetings);
  const [certificateTemplate, setCertificateTemplate] = useState<CertificateTemplate>(
    initialCertificateTemplate
  );

  // Client State
  const [clients, setClients] = useState<ClientUser[]>(initialClients);
  const [currentClient, setCurrentClient] = useState<ClientUser | null>(null);
  const [interviewRequests, setInterviewRequests] = useState<InterviewRequest[]>(initialInterviewRequests);
  const [shortlistedInternIds, setShortlistedInternIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("client_shortlisted_ids");
      return saved ? JSON.parse(saved) : ["intern_05", "intern_01"];
    } catch {
      return ["intern_05", "intern_01"];
    }
  });

  // Project Assignments Board State
  const [projectAssignments, setProjectAssignments] = useState<ProjectAssignment[]>(() => {
    try {
      const saved = localStorage.getItem("mind2i_project_assignments");
      if (saved) {
        const parsed: ProjectAssignment[] = JSON.parse(saved);
        return parsed.map((p) => ({
          ...p,
          startDate: p.startDate || "2026-09-08",
          startTime: p.startTime || "09:00",
          deadlineTime: p.deadlineTime || "23:59",
        }));
      }
      return [];
    } catch {
      return [];
    }
  });

  const [projectSubmissions, setProjectSubmissions] = useState<ProjectSubmission[]>(() => {
    try {
      const saved = localStorage.getItem("mind2i_project_submissions");
      if (saved) {
        return JSON.parse(saved);
      }
      return [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("mind2i_project_assignments", JSON.stringify(projectAssignments));
    } catch {}
  }, [projectAssignments]);

  useEffect(() => {
    try {
      localStorage.setItem("mind2i_project_submissions", JSON.stringify(projectSubmissions));
    } catch {}
  }, [projectSubmissions]);

  // Shifts & Attendance State
  const [shiftPatterns, setShiftPatterns] = useState<ShiftPattern[]>(() => {
    try {
      const saved = localStorage.getItem("mind2i_shift_patterns");
      return saved ? JSON.parse(saved) : INITIAL_SHIFT_PATTERNS;
    } catch {
      return INITIAL_SHIFT_PATTERNS;
    }
  });

  const [rosterAssignments, setRosterAssignments] = useState<InternRosterAssignment[]>(() => {
    try {
      const saved = localStorage.getItem("mind2i_roster_assignments");
      if (saved) {
        return JSON.parse(saved);
      }
      return [];
    } catch {
      return [];
    }
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem("mind2i_attendance_records");
      if (saved) {
        return JSON.parse(saved);
      }
      return [];
    } catch {
      return [];
    }
  });

  const [punchLogs, setPunchLogs] = useState<PunchLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem("mind2i_punch_logs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [dailyActivityLogs, setDailyActivityLogs] = useState<DailyActivityLog[]>(() => {
    try {
      const saved = localStorage.getItem("mind2i_daily_activity_logs");
      if (saved) {
        return JSON.parse(saved);
      }
      return [];
    } catch {
      return [];
    }
  });

  const [holidays, setHolidays] = useState<HolidayEvent[]>(() => {
    try {
      const saved = localStorage.getItem("mind2i_holidays");
      return saved ? JSON.parse(saved) : INITIAL_HOLIDAYS;
    } catch {
      return INITIAL_HOLIDAYS;
    }
  });

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    try {
      const saved = localStorage.getItem("mind2i_leave_requests");
      if (saved) {
        return JSON.parse(saved);
      }
      return [];
    } catch {
      return [];
    }
  });

  const [resumeData, setResumeData] = useState<InternResumeData>(() => {
    try {
      const saved = localStorage.getItem("mind2i_resume_data");
      return saved ? JSON.parse(saved) : createEmptyResumeData();
    } catch {
      return createEmptyResumeData();
    }
  });

  const [toastNotification, setToastNotification] = useState<string | null>(null);
  const showToastNotification = (msg: string) => {
    setToastNotification(msg);
    setTimeout(() => setToastNotification(null), 3500);
  };

  useEffect(() => {
    try {
      localStorage.setItem("mind2i_shift_patterns", JSON.stringify(shiftPatterns));
    } catch {}
  }, [shiftPatterns]);

  useEffect(() => {
    try {
      localStorage.setItem("mind2i_roster_assignments", JSON.stringify(rosterAssignments));
    } catch {}
  }, [rosterAssignments]);

  useEffect(() => {
    try {
      localStorage.setItem("mind2i_attendance_records", JSON.stringify(attendanceRecords));
    } catch {}
  }, [attendanceRecords]);

  useEffect(() => {
    try {
      localStorage.setItem("mind2i_punch_logs", JSON.stringify(punchLogs));
    } catch {}
  }, [punchLogs]);

  useEffect(() => {
    try {
      localStorage.setItem("mind2i_daily_activity_logs", JSON.stringify(dailyActivityLogs));
    } catch {}
  }, [dailyActivityLogs]);

  useEffect(() => {
    try {
      localStorage.setItem("mind2i_holidays", JSON.stringify(holidays));
    } catch {}
  }, [holidays]);

  useEffect(() => {
    try {
      localStorage.setItem("mind2i_leave_requests", JSON.stringify(leaveRequests));
    } catch {}
  }, [leaveRequests]);

  useEffect(() => {
    try {
      if (currentStudent?.id) {
        const customResumes = JSON.parse(localStorage.getItem("m2i_custom_resumes") || "{}");
        customResumes[currentStudent.id] = resumeData;
        localStorage.setItem("m2i_custom_resumes", JSON.stringify(customResumes));
      }
      localStorage.setItem("mind2i_resume_data", JSON.stringify(resumeData));
    } catch {}
  }, [resumeData, currentStudent?.id]);

  // Synchronize resumeData with the current student so other names never bleed through
  useEffect(() => {
    if (currentStudent && userRole === "student") {
      try {
        const customResumes = JSON.parse(localStorage.getItem("m2i_custom_resumes") || "{}");
        if (customResumes[currentStudent.id]) {
          setResumeData(customResumes[currentStudent.id]);
          return;
        }
      } catch {}

      if (!isDemoStudent(currentStudent)) {
        // Fresh student starts with clean empty resume data
        setResumeData(createEmptyResumeData(currentStudent));
      } else {
        setResumeData((prev) => ({
          ...prev,
          internId: currentStudent.id,
          internName: currentStudent.name,
          email: currentStudent.email || prev.email,
          mobile: currentStudent.mobile || prev.mobile,
          location: currentStudent.city ? `${currentStudent.city}, ${currentStudent.state || "India"}` : (currentStudent.college || prev.location),
          githubUrl: currentStudent.githubUrl || (prev.githubUrl && !prev.githubUrl.includes("aksharsai") ? prev.githubUrl : `github.com/${currentStudent.name.toLowerCase().replace(/\s+/g, "")}`),
          linkedinUrl: currentStudent.linkedinUrl || (prev.linkedinUrl && !prev.linkedinUrl.includes("aksharsai") ? prev.linkedinUrl : `linkedin.com/in/${currentStudent.name.toLowerCase().replace(/\s+/g, "")}`),
          skills: currentStudent.skills && currentStudent.skills.length > 0 ? currentStudent.skills : prev.skills,
          scorecard: {
            ...prev.scorecard,
            lastScannedFileName: `${currentStudent.name.replace(/\s+/g, "_")}_Resume.pdf`,
            executiveSummary: `Analysis of ${currentStudent.name}'s resume indicates strong technical depth in Generative AI architectures, real-time asynchronous streaming, and distributed microservices. Quantified project achievements position ${currentStudent.name} in the top quartile of automated ATS screens for modern AI and Full-Stack engineering roles.`,
          },
        }));
      }
    }
  }, [currentStudent?.id, currentStudent?.name, userRole]);

  // Auto-sync students from batches into roster assignments
  useEffect(() => {
    if (students && students.length > 0) {
      setRosterAssignments((prevRoster) => {
        let hasChanges = false;
        const updated = [...prevRoster];

        students.forEach((student) => {
          const existingIdx = updated.findIndex(
            (r) => r.internId === student.id || r.internName.toLowerCase() === student.name.toLowerCase()
          );
          const studentBatch = batches.find((b) => b.id === student.batchId);
          const batchName = student.batchName || studentBatch?.name || "Full-Stack AI Engineering";

          if (existingIdx === -1) {
            updated.push({
              internId: student.id,
              internName: student.name,
              avatar: student.avatar,
              role: student.branch ? `${student.branch} Intern` : "Software Development Intern",
              department: student.branch || "Software Development",
              batchId: student.batchId || studentBatch?.id || "batch_ai",
              batchName,
              shiftId: shiftPatterns[0]?.id || "shift_morning",
              shiftName: shiftPatterns[0]?.name || "Morning Shift",
              requiredHours: shiftPatterns[0]?.requiredHours || 8,
              customWeekends: [0, 6],
            });
            hasChanges = true;
          } else {
            const current = updated[existingIdx];
            if (current.batchName !== batchName || current.batchId !== (student.batchId || studentBatch?.id)) {
              updated[existingIdx] = {
                ...current,
                batchId: student.batchId || studentBatch?.id || current.batchId,
                batchName,
                internName: student.name,
              };
              hasChanges = true;
            }
          }
        });

        return hasChanges ? updated : prevRoster;
      });
    }
  }, [students, batches, shiftPatterns]);

  const handleCreateProjectAssignment = (newProj: ProjectAssignment) => {
    setProjectAssignments((prev) => [newProj, ...prev]);
    axios.post("/api/project-assignments/", newProj).catch((err) => {
      console.warn("Failed to create project assignment on backend:", err);
    });
  };

  const handleUpdateProjectAssignment = (updatedProj: ProjectAssignment) => {
    setProjectAssignments((prev) =>
      prev.map((p) => (p.id === updatedProj.id ? updatedProj : p))
    );
    axios.put(`/api/project-assignments/${updatedProj.id}/`, updatedProj)
      .catch(() => axios.post("/api/project-assignments/", updatedProj))
      .catch((err) => console.warn("Failed to update project assignment on backend:", err));
  };

  const handleDeleteProjectAssignment = (projectId: string) => {
    setProjectAssignments((prev) => prev.filter((p) => p.id !== projectId));
    axios.delete(`/api/project-assignments/${projectId}/`).catch((err) => {
      console.warn("Failed to delete project assignment on backend:", err);
    });
  };

  const handleSubmitProjectWork = (submission: ProjectSubmission) => {
    setProjectSubmissions((prev) => [
      submission,
      ...prev.filter(
        (s) => !(s.projectId === submission.projectId && s.studentId === submission.studentId)
      ),
    ]);
    setProjectAssignments((prev) =>
      prev.map((p) => (p.id === submission.projectId ? { ...p, status: "in_progress" } : p))
    );
    axios.post("/api/project-submissions/", submission)
      .catch(() => axios.put(`/api/project-submissions/${submission.id}/`, submission))
      .catch((err) => console.warn("Failed to save project submission to backend:", err));
    axios.patch(`/api/project-assignments/${submission.projectId}/`, { status: "in_progress" }).catch(() => {});
  };

  const handleUpdateProjectSubmission = (updatedSub: ProjectSubmission) => {
    setProjectSubmissions((prev) =>
      prev.map((s) => (s.id === updatedSub.id ? updatedSub : s))
    );
    if (updatedSub.status === "passed") {
      setProjectAssignments((prev) =>
        prev.map((p) => (p.id === updatedSub.projectId ? { ...p, status: "completed" } : p))
      );
      axios.patch(`/api/project-assignments/${updatedSub.projectId}/`, { status: "completed" }).catch(() => {});
    }
    axios.put(`/api/project-submissions/${updatedSub.id}/`, updatedSub)
      .catch(() => axios.post("/api/project-submissions/", updatedSub))
      .catch((err) => console.warn("Failed to update project submission on backend:", err));
  };

  const handleBulkUpdateProjectSubmissions = (updatedSubs: ProjectSubmission[]) => {
    const updatedMap = new Map(updatedSubs.map((s) => [s.id, s]));
    setProjectSubmissions((prev) =>
      prev.map((s) => (updatedMap.has(s.id) ? updatedMap.get(s.id)! : s))
    );
    const hasPassed = updatedSubs.some((s) => s.status === "passed");
    if (hasPassed && updatedSubs.length > 0) {
      const projectId = updatedSubs[0].projectId;
      setProjectAssignments((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, status: "completed" } : p))
      );
      axios.patch(`/api/project-assignments/${projectId}/`, { status: "completed" }).catch(() => {});
    }
    updatedSubs.forEach((sub) => {
      axios.put(`/api/project-submissions/${sub.id}/`, sub)
        .catch(() => axios.post("/api/project-submissions/", sub))
        .catch((err) => console.warn("Failed to save bulk submission on backend:", err));
    });
  };

  const handleUpdateShiftPatterns = (newPatterns: ShiftPattern[]) => {
    setShiftPatterns(newPatterns);
    axios.post("/api/shift-patterns/bulk_sync/", { items: newPatterns }).catch((err) => {
      console.warn("Failed to sync shift patterns to backend:", err);
    });
  };

  const handleUpdateRosterAssignments = (newRoster: InternRosterAssignment[]) => {
    setRosterAssignments(newRoster);
    axios.post("/api/roster-assignments/bulk_sync/", { items: newRoster }).catch((err) => {
      console.warn("Failed to sync roster assignments to backend:", err);
    });
  };

  const handleUpdateAttendanceRecords = (
    updater: AttendanceRecord[] | ((prev: AttendanceRecord[]) => AttendanceRecord[])
  ) => {
    setAttendanceRecords((prev) => {
      const updated = typeof updater === "function" ? updater(prev) : updater;
      axios.post("/api/attendance-records/bulk_create_or_update/", { records: updated }).catch((err) => {
        console.warn("Failed to sync attendance records to backend:", err);
      });
      return updated;
    });
  };

  const handleUpdatePunchLogs = (
    updater: PunchLogEntry[] | ((prev: PunchLogEntry[]) => PunchLogEntry[])
  ) => {
    setPunchLogs((prev) => {
      const updated = typeof updater === "function" ? updater(prev) : updater;
      if (updated.length > 0) {
        const latest = updated[0];
        axios.post("/api/punch-logs/", latest).catch((err) => {
          console.warn("Failed to save punch log to backend:", err);
        });
      }
      return updated;
    });
  };

  const handleUpdateHolidays = (newHols: HolidayEvent[]) => {
    setHolidays(newHols);
    axios.post("/api/holidays/bulk_sync/", { items: newHols }).catch((err) => {
      console.warn("Failed to sync holidays to backend:", err);
    });
  };

  const handleUpdateLeaveRequests = (
    updater: LeaveRequest[] | ((prev: LeaveRequest[]) => LeaveRequest[])
  ) => {
    setLeaveRequests((prev) => {
      const updated = typeof updater === "function" ? updater(prev) : updater;
      if (updated.length > 0) {
        const latest = updated[0];
        axios.put(`/api/leave-requests/${latest.id}/`, latest)
          .catch(() => axios.post("/api/leave-requests/", latest))
          .catch((err) => console.warn("Failed to save leave request to backend:", err));
      }
      return updated;
    });
  };

  const handleUpdateActivityLogs = (
    updater: DailyActivityLog[] | ((prev: DailyActivityLog[]) => DailyActivityLog[])
  ) => {
    setDailyActivityLogs((prev) => {
      const updated = typeof updater === "function" ? updater(prev) : updater;
      axios.post("/api/daily-activity-logs/bulk_sync/", { items: updated }).catch((err) => {
        console.warn("Failed to sync daily activity logs to backend:", err);
      });
      return updated;
    });
  };

  const handleToggleShortlist = (internId: string) => {
    setShortlistedInternIds((prev) => {
      const next = prev.includes(internId)
        ? prev.filter((id) => id !== internId)
        : [...prev, internId];
      try {
        localStorage.setItem("client_shortlisted_ids", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Active Navigation Tab (persisted across page reloads)
  const [activeTab, setActiveTab] = useState<string>(() => {
    try {
      const savedTab = localStorage.getItem("mind2i_active_tab");
      if (savedTab) return savedTab;
    } catch {}
    return "dashboard";
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Authentication State (persisted across page reloads)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initialAuth.isAuthenticated);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<any>(initialAuth.user);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Sync activeTab to localStorage
  useEffect(() => {
    try {
      if (activeTab) {
        localStorage.setItem("mind2i_active_tab", activeTab);
      }
    } catch {}
  }, [activeTab]);

  // Sync authentication session to localStorage
  useEffect(() => {
    try {
      if (isAuthenticated) {
        localStorage.setItem(
          "mind2i_auth_session",
          JSON.stringify({
            isAuthenticated: true,
            role: userRole,
            user: loggedInUser || (userRole === "admin" ? DEFAULT_ADMIN_USER : null),
          })
        );
        localStorage.removeItem("mind2i_explicit_logout");
      }
    } catch {}
  }, [isAuthenticated, userRole, loggedInUser]);

  // Sync selectedBatch to localStorage
  useEffect(() => {
    try {
      if (selectedBatch && selectedBatch.id) {
        localStorage.setItem("mind2i_selected_batch_id", selectedBatch.id);
      }
    } catch {}
  }, [selectedBatch]);

  // Sync currentStudent and currentClient on reload
  useEffect(() => {
    if (userRole === "student" && loggedInUser?.email && students.length > 0) {
      const match = students.find((s) => s.email.toLowerCase() === loggedInUser.email.toLowerCase());
      if (match && match.id !== currentStudent?.id) {
        setCurrentStudent(match);
        const b = batches.find((x) => x.id === match.batchId);
        if (b && (!selectedBatch || selectedBatch.id !== b.id)) {
          setSelectedBatch(b);
        }
      }
    }
  }, [students, userRole, loggedInUser, batches, currentStudent?.id, selectedBatch]);

  useEffect(() => {
    if (userRole === "client" && loggedInUser && !currentClient) {
      setCurrentClient(loggedInUser);
    }
  }, [userRole, loggedInUser, currentClient]);

  // Notification State & Interconnected Feed
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const notificationMenuRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem("mind2i_notifications");
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("mind2i_notifications", JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target as Node)) {
        setNotificationMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddNotification = (newNotif: Omit<AppNotification, "id" | "timestamp" | "isRead">) => {
    const fullNotif: AppNotification = {
      ...newNotif,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    setNotifications((prev) => [fullNotif, ...prev]);
    axios.post("/api/notifications/", fullNotif).catch((err) => {
      console.warn("Failed to save notification to backend:", err);
    });
  };

  const userNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (userRole === "admin") {
        return n.recipientRole === "admin" || n.recipientRole === "all";
      }
      if (userRole === "student") {
        if (n.recipientRole === "all") return true;
        if (n.recipientRole !== "student") return false;
        if (n.recipientId && currentStudent?.id && n.recipientId === currentStudent.id) return true;
        if (n.recipientName && currentStudent?.name && n.recipientName.toLowerCase() === currentStudent.name.toLowerCase()) return true;
        if (n.recipientEmail && currentStudent?.email && n.recipientEmail.toLowerCase() === currentStudent.email.toLowerCase()) return true;
        if (!n.recipientId && !n.recipientName && !n.recipientEmail) return true;
        return false;
      }
      if (userRole === "client") {
        if (n.recipientRole === "all") return true;
        if (n.recipientRole !== "client") return false;
        if (n.recipientId && currentClient?.id && n.recipientId === currentClient.id) return true;
        if (!n.recipientId) return true;
        return false;
      }
      return false;
    });
  }, [notifications, userRole, currentStudent, currentClient]);

  const unreadNotificationCount = useMemo(() => {
    return userNotifications.filter((n) => !n.isRead).length;
  }, [userNotifications]);

  const handleMarkNotificationAsRead = (notifId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notifId));
    showToastNotification("Notification cleared.");
    axios.delete(`/api/notifications/${notifId}/`).catch(() => {
      axios.post(`/api/notifications/${notifId}/mark_read/`).catch(() => {});
    });
  };

  const handleClearNotification = (notifId: string) => {
    handleMarkNotificationAsRead(notifId);
  };

  const handleMarkAllNotificationsAsRead = () => {
    const unreadUserNotifIds = new Set(
      userNotifications.filter((n) => !n.isRead).map((n) => n.id)
    );
    setNotifications((prev) => prev.filter((n) => !unreadUserNotifIds.has(n.id)));
    showToastNotification("All unread notifications cleared.");
    axios
      .post("/api/notifications/clear_all/", {
        role: userRole,
        userId: userRole === "student" ? currentStudent?.id : undefined,
        unreadOnly: true,
      })
      .catch(() => {});
  };

  const handleClearAllNotifications = () => {
    const userNotifIds = new Set(userNotifications.map((n) => n.id));
    setNotifications((prev) => prev.filter((n) => !userNotifIds.has(n.id)));
    showToastNotification("Notifications cleared.");
    axios
      .post("/api/notifications/clear_all/", {
        role: userRole,
        userId: userRole === "student" ? currentStudent?.id : undefined,
      })
      .catch(() => {});
  };

  const handleNotificationClick = (notif: AppNotification) => {
    handleMarkNotificationAsRead(notif.id);
    if (notif.actionTab) {
      setActiveTab(notif.actionTab);
    }
    setNotificationMenuOpen(false);
  };

  // Modals
  const [inspectedStudent, setInspectedStudent] = useState<Student | null>(null);
  const [selfRegisterBatch, setSelfRegisterBatch] = useState<Batch | null>(null);

  // Interview Request Modal
  const [interviewModalIntern, setInterviewModalIntern] = useState<Student | null>(null);
  const [interviewNote, setInterviewNote] = useState("");

  // Check URL for registration link (?register=1&batch=batch_id)
  useEffect(() => {
    if (batches.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("register") === "1") {
        const batchParam = urlParams.get("batch");
        const found = batches.find((b) => b.id === batchParam) || batches[0];
        if (found) {
          setSelfRegisterBatch(found);
        }
      }
    }
  }, [batches]);

  // Fetch real data from Django backend
  useEffect(() => {
    axios.get('/api/batches/')
      .then(res => {
        if (Array.isArray(res.data)) {
          setBatches(res.data);
          if (res.data.length > 0) {
            const savedBatchId = localStorage.getItem("mind2i_selected_batch_id");
            const matched = savedBatchId ? res.data.find((b: Batch) => b.id === savedBatchId) : null;
            setSelectedBatch(matched || res.data[0]);
          }
        }
      })
      .catch(err => console.error("API Fetch Error (Batches):", err));

    axios.get('/api/students/')
      .then(res => {
        if (Array.isArray(res.data)) {
          let savedEvals: Record<string, InternEvaluation> = {};
          let savedResources: Record<string, any[]> = {};
          let savedVideos: Record<string, any> = {};
          try {
            savedEvals = JSON.parse(localStorage.getItem("m2i_intern_evaluations") || "{}");
            savedResources = JSON.parse(localStorage.getItem("m2i_intern_resources") || "{}");
            savedVideos = JSON.parse(localStorage.getItem("m2i_intern_videos") || "{}");
          } catch {}

          const apiStudents = res.data.map((s: any) => ({
            ...s,
            batchId: s.batch || s.batchId,
            evaluation: savedEvals[s.id] || s.evaluation,
            resources: savedResources[s.id] || s.resources || (isDemoStudent(s) ? DEFAULT_SAMPLE_RESOURCES(s.id, s.batch || s.batchId) : []),
            reflectionVideo: savedVideos[s.id] || s.reflectionVideo,
            scores: s.scores || {
              quizScore: 0,
              codingScore: 0,
              liveQAScore: 0,
              assignmentScore: 0,
              overallAccuracy: 0.0,
            },
            totalPoints: s.totalPoints ?? 0,
            activeStreakDays: s.activeStreakDays ?? 0,
            fastestResponseMs: s.fastestResponseMs ?? 0,
            attendedSessions: s.attendedSessions ?? 0,
            totalSessions: s.totalSessions ?? 0,
            skills: s.skills || [],
          }));
          setStudents(apiStudents);
          if (apiStudents.length > 0) {
            setCurrentStudent(apiStudents[0]);
          }
        }
      })
      .catch(err => console.error("API Fetch Error (Students):", err));

    // Fetch LearnHub Modules from Backend
    axios.get('/api/learnhub-modules/')
      .then(res => {
        if (Array.isArray(res.data)) {
          const apiModules: LearnHubModule[] = res.data.map((m: any) => ({
            ...m,
            batchId: m.batch || m.batchId,
          }));
          setLearnHubModules(apiModules);
        }
      })
      .catch(err => console.error("API Fetch Error (LearnHub Modules):", err));

    // Fetch Clients
    const fetchClients = () => {
      axios.get('/api/clients/')
        .then(res => {
          if (Array.isArray(res.data)) setClients(res.data);
        })
        .catch(err => console.error("API Fetch Error (Clients):", err));
    };
    fetchClients();
    const clientTimer = setInterval(fetchClients, 4000);

    // Fetch Interview Requests
    const fetchInterviewRequests = () => {
      axios.get('/api/interview-requests/')
        .then(res => {
          if (Array.isArray(res.data)) {
            const mapped = res.data.map((r: any) => ({
              ...r,
              clientId: r.clientId || r.client,
              internId: r.internId || r.intern,
              batchId: r.batchId || r.batch,
            }));
            setInterviewRequests(mapped);
          }
        })
        .catch(err => console.error("API Fetch Error (Interview Requests):", err));
    };
    fetchInterviewRequests();
    const reqTimer = setInterval(fetchInterviewRequests, 4000);

    // Fetch Project Assignments & Submissions
    const fetchProjects = () => {
      axios.get('/api/project-assignments/')
        .then(res => {
          if (Array.isArray(res.data)) {
            setProjectAssignments(res.data);
          }
        })
        .catch(err => console.warn("API Fetch Error (Project Assignments):", err));

      axios.get('/api/project-submissions/')
        .then(res => {
          if (Array.isArray(res.data)) {
            setProjectSubmissions(res.data);
          }
        })
        .catch(err => console.warn("API Fetch Error (Project Submissions):", err));
    };
    fetchProjects();
    const projectsTimer = setInterval(fetchProjects, 4000);

    // Fetch Attendance & Shifts Data
    const fetchAttendanceData = () => {
      axios.get('/api/shift-patterns/')
        .then(res => {
          if (Array.isArray(res.data)) setShiftPatterns(res.data.length > 0 ? res.data : INITIAL_SHIFT_PATTERNS);
        })
        .catch(err => console.warn("API Fetch Error (Shift Patterns):", err));

      axios.get('/api/roster-assignments/')
        .then(res => {
          if (Array.isArray(res.data)) setRosterAssignments(res.data);
        })
        .catch(err => console.warn("API Fetch Error (Roster Assignments):", err));

      axios.get('/api/attendance-records/')
        .then(res => {
          if (Array.isArray(res.data)) setAttendanceRecords(res.data);
        })
        .catch(err => console.warn("API Fetch Error (Attendance Records):", err));

      axios.get('/api/punch-logs/')
        .then(res => {
          if (Array.isArray(res.data)) setPunchLogs(res.data);
        })
        .catch(err => console.warn("API Fetch Error (Punch Logs):", err));

      axios.get('/api/holidays/')
        .then(res => {
          if (Array.isArray(res.data)) setHolidays(res.data.length > 0 ? res.data : INITIAL_HOLIDAYS);
        })
        .catch(err => console.warn("API Fetch Error (Holidays):", err));

      axios.get('/api/leave-requests/')
        .then(res => {
          if (Array.isArray(res.data)) setLeaveRequests(res.data);
        })
        .catch(err => console.warn("API Fetch Error (Leave Requests):", err));
    };
    fetchAttendanceData();
    const attendanceTimer = setInterval(fetchAttendanceData, 4000);

    // Fetch Daily Activity Logs
    const fetchDailyLogs = () => {
      axios.get('/api/daily-activity-logs/')
        .then(res => {
          if (Array.isArray(res.data)) setDailyActivityLogs(res.data);
        })
        .catch(err => console.warn("API Fetch Error (Daily Logs):", err));
    };
    fetchDailyLogs();
    const dailyLogsTimer = setInterval(fetchDailyLogs, 4000);

    // Fetch Intern Resources Vault
    axios.get('/api/intern-resources/')
      .then(res => {
        if (Array.isArray(res.data)) {
          const resMap: Record<string, InternResource[]> = {};
          res.data.forEach((r: InternResource) => {
            if (!resMap[r.studentId]) resMap[r.studentId] = [];
            resMap[r.studentId].push(r);
          });
          setStudents((prev) =>
            prev.map((s) => ({
              ...s,
              resources: resMap[s.id] || [],
            }))
          );
        }
      })
      .catch(err => console.warn("API Fetch Error (Intern Resources):", err));

    return () => {
      clearInterval(clientTimer);
      clearInterval(reqTimer);
      clearInterval(projectsTimer);
      clearInterval(attendanceTimer);
      clearInterval(dailyLogsTimer);
    };
  }, []);

  // Real-Time Notifications Live Sync
  useEffect(() => {
    const fetchNotifications = () => {
      const params = new URLSearchParams();
      if (userRole) params.append("role", userRole);
      if (userRole === "student" && currentStudent?.id) {
        params.append("userId", currentStudent.id);
      }
      const queryStr = params.toString() ? `?${params.toString()}` : "";
      axios.get(`/api/notifications/${queryStr}`)
        .then((res) => {
          if (Array.isArray(res.data)) setNotifications(res.data);
        })
        .catch((err) => console.warn("API Fetch Error (Notifications):", err));
    };
    fetchNotifications();
    const notifTimer = setInterval(fetchNotifications, 3000);
    return () => clearInterval(notifTimer);
  }, [userRole, currentStudent?.id]);

  // Real-Time Live Q&A Sync
  useEffect(() => {
    if (!selectedBatch?.id) return;
    const fetchLiveQuestions = () => {
      axios.get(`/api/live-questions/?batchId=${selectedBatch.id}`)
        .then((res) => {
          if (Array.isArray(res.data)) {
            const apiQuestions: LiveQuestion[] = res.data.map((q: any) => ({
              ...q,
              batchId: q.batch || q.batchId,
              responses: (q.responses || []).map((r: any) => ({
                ...r,
                timestamp: r.submittedAt ? new Date(r.submittedAt).getTime() : Date.now(),
              })),
            }));
            setLiveQuestions(apiQuestions);
          }
        })
        .catch((err) => console.error("API Fetch Error (Live Questions):", err));
    };
    fetchLiveQuestions();
    const interval = setInterval(fetchLiveQuestions, 3000);
    return () => clearInterval(interval);
  }, [selectedBatch?.id]);

  // Real-Time Assignments Sync
  useEffect(() => {
    if (!selectedBatch?.id) return;
    const fetchAssignments = () => {
      axios.get(`/api/assignments/?batchId=${selectedBatch.id}`)
        .then((res) => {
          if (Array.isArray(res.data)) {
            const apiAssignments: Assignment[] = res.data.map((a: any) => ({
              ...a,
              batchId: a.batch || a.batchId,
            }));
            setAssignments(apiAssignments);
          }
        })
        .catch((err) => console.error("API Fetch Error (Assignments):", err));
    };
    fetchAssignments();
    const interval = setInterval(fetchAssignments, 3000);
    return () => clearInterval(interval);
  }, [selectedBatch?.id]);

  // Settings Sync
  useEffect(() => {
    const fetchSettings = () => {
      axios.get("/api/settings/")
        .then((res) => {
          if (Array.isArray(res.data) && res.data.length > 0) {
            const backendSettings = res.data[0];
            setSettings((prev) => ({
              ...prev,
              enableCodingIDE: backendSettings.enableCodingIDE ?? prev.enableCodingIDE,
              enableQuiz: backendSettings.enableQuiz ?? prev.enableQuiz,
              enableLearnHub: backendSettings.enableLearnHub ?? prev.enableLearnHub,
              enableCertificate: backendSettings.enableCertificate ?? prev.enableCertificate,
              enableMyReport: backendSettings.enableMyReport ?? prev.enableMyReport,
              enableLiveQA: backendSettings.enableLiveQA ?? prev.enableLiveQA,
              enableLeaderboard: backendSettings.enableLeaderboard ?? prev.enableLeaderboard,
              enablePeerReview: backendSettings.enablePeerReview ?? prev.enablePeerReview,
              enableTelemetryAnalytics: backendSettings.enableTelemetryAnalytics ?? prev.enableTelemetryAnalytics,
              enableClientPortal: backendSettings.enableClientPortal ?? prev.enableClientPortal,
              defaultStudentPassword: backendSettings.defaultStudentPassword || prev.defaultStudentPassword,
              defaultClientPassword: backendSettings.defaultClientPassword || prev.defaultClientPassword,
            }));
          }
        })
        .catch((err) => console.warn("Settings fetch error:", err));
    };
    fetchSettings();
    const interval = setInterval(fetchSettings, 8000);
    return () => clearInterval(interval);
  }, []);

  // Scheduled Meetings Sync (Real-time 2.5s poll)
  useEffect(() => {
    const fetchScheduledMeetings = () => {
      axios.get("/api/scheduled-meetings/")
        .then((res) => {
          if (Array.isArray(res.data)) {
            const apiMeetings: ScheduledMeeting[] = res.data.map((m: any) => ({
              ...m,
              batchId: m.batchId || m.batch,
            }));
            setScheduledMeetings(apiMeetings);
          }
        })
        .catch((err) => console.warn("Scheduled meetings fetch error:", err));
    };
    fetchScheduledMeetings();
    const interval = setInterval(fetchScheduledMeetings, 2500);
    return () => clearInterval(interval);
  }, []);

  // Update current student if batch changes in student view
  useEffect(() => {
    if (!selectedBatch) return;
    const matching = students.find((s) => s.batchId === selectedBatch.id);
    if (matching) {
      setCurrentStudent(matching);
    } else {
      setCurrentStudent({
        id: `guest_${selectedBatch.id}`,
        name: "Enrolled Intern",
        email: "intern@mind2i.edu",
        mobile: "+1 (555) 000-0000",
        batchId: selectedBatch.id,
        batchName: selectedBatch.name,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(selectedBatch.name)}`,
        college: selectedBatch.college,
        enrolledAt: new Date().toISOString(),
        status: "active",
        scores: {
          quizScore: 0,
          codingScore: 0,
          liveQAScore: 0,
          assignmentScore: 0,
          overallAccuracy: 0,
        },
        totalPoints: 0,
        activeStreakDays: 0,
        fastestResponseMs: 0,
        attendedSessions: 0,
        totalSessions: 0,
        skills: [],
      });
    }
  }, [selectedBatch?.id, students, userRole]);

  // Handlers
  const handleAddStudent = (newStudent: Partial<Student>) => {
    const targetBatch = (newStudent.batchId ? batches.find((b) => b.id === newStudent.batchId) : null) || selectedBatch;
    if (targetBatch?.isLocked) {
      alert(`Cannot register or add intern: Cohort "${targetBatch.name}" is locked and registration is closed.`);
      return;
    }
    const targetBatchId = newStudent.batchId || targetBatch?.id || "batch_default";
    const targetBatchName = newStudent.batchName || targetBatch?.name || "Internship Cohort";
    const targetCollege = newStudent.college || targetBatch?.college || "";

    const fullStudent: Student = {
      id: newStudent.id || `stu_${Date.now()}`,
      name: newStudent.name || "New Intern",
      email: newStudent.email || `intern_${Date.now()}@mind2i.edu`,
      mobile: newStudent.mobile || "+1 (555) 000-0000",
      college: targetCollege,
      branch: newStudent.branch || "",
      city: newStudent.city || "",
      state: newStudent.state || "",
      password: newStudent.password || settings?.defaultStudentPassword || "intern123",
      batchId: targetBatchId,
      batchName: targetBatchName,
      avatar: newStudent.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(newStudent.name || "Intern")}`,
      status: newStudent.status || "active",
      enrolledAt: newStudent.enrolledAt || new Date().toISOString(),
      scores: newStudent.scores || {
        quizScore: 0,
        codingScore: 0,
        liveQAScore: 0,
        assignmentScore: 0,
        overallAccuracy: 0.0,
      },
      totalPoints: newStudent.totalPoints || 0,
      activeStreakDays: 0,
      fastestResponseMs: 0,
      attendedSessions: 0,
      totalSessions: 0,
      skills: newStudent.skills || [],
      resumeUrl: newStudent.resumeUrl || "",
      githubUrl: newStudent.githubUrl || "",
      linkedinUrl: newStudent.linkedinUrl || "",
      bio: newStudent.bio || "",
    };
    setStudents((prev) => [fullStudent, ...prev.filter((s) => s.email !== fullStudent.email)]);

    setBatches((prev) =>
      prev.map((b) =>
        b.id === fullStudent.batchId ? { ...b, studentCount: (b.studentCount || 0) + 1 } : b
      )
    );

    const payload = { ...fullStudent, batch: fullStudent.batchId, batchId: fullStudent.batchId };
    axios.post('/api/students/', payload)
      .catch(err => console.error("Failed to save student to API:", err));
  };

  const handleBulkAddStudents = (newStudents: Partial<Student>[]) => {
    if (selectedBatch?.isLocked) {
      alert(`Cannot add interns: Cohort "${selectedBatch.name}" is locked and registration is closed.`);
      return;
    }
    const fullList: Student[] = newStudents.map((s, idx) => ({
      id: `stu_bulk_${Date.now()}_${idx}`,
      name: s.name || `Intern ${idx + 1}`,
      email: s.email || `intern${idx + 1}@mind2i.edu`,
      mobile: s.mobile || "+1 (555) 012-3456",
      college: s.college || selectedBatch.college,
      batchId: s.batchId || selectedBatch.id,
      batchName: s.batchName || selectedBatch.name,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(s.name || idx.toString())}`,
      status: "active",
      enrolledAt: new Date().toISOString(),
      scores: s.scores || { quizScore: 0, codingScore: 0, liveQAScore: 0, assignmentScore: 0, overallAccuracy: 0.0 },
      totalPoints: 0, activeStreakDays: 0, fastestResponseMs: 0, attendedSessions: 0, totalSessions: 0,
      skills: s.skills || [],
    }));
    setStudents((prev) => [...fullList, ...prev]);
    fullList.forEach(student => {
      const payload = { ...student, batch: student.batchId };
      axios.post('/api/students/', payload)
        .catch(err => console.error("Failed to save bulk student to API:", err));
    });
  };

  const handleEditStudent = (updatedStudent: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
    const payload = { ...updatedStudent, batch: updatedStudent.batchId };
    axios.put(`/api/students/${updatedStudent.id}/`, payload)
      .catch(err => console.error("Failed to update student:", err));
  };

  const handleUpdateStudentEvaluation = (studentId: string, evaluation: InternEvaluation) => {
    setStudents((prev) => {
      const updated = prev.map((s) => (s.id === studentId ? { ...s, evaluation } : s));
      try {
        const stored: Record<string, InternEvaluation> = JSON.parse(
          localStorage.getItem("m2i_intern_evaluations") || "{}"
        );
        stored[studentId] = evaluation;
        localStorage.setItem("m2i_intern_evaluations", JSON.stringify(stored));
      } catch (err) {
        console.error("Failed to save evaluation to localStorage", err);
      }
      return updated;
    });

    setInspectedStudent((prev) => (prev && prev.id === studentId ? { ...prev, evaluation } : prev));
    setCurrentStudent((prev) => (prev && prev.id === studentId ? { ...prev, evaluation } : prev));

    axios.post("/api/evaluations/bulk_sync/", { [studentId]: [evaluation] }).catch((err) => {
      console.warn("Failed to sync student evaluation to backend:", err);
    });
  };

  const handleUpdateStudentResources = (studentId: string, resources: InternResource[]) => {
    setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, resources } : s)));
    setInspectedStudent((prev) => (prev && prev.id === studentId ? { ...prev, resources } : prev));
    setCurrentStudent((prev) => (prev && prev.id === studentId ? { ...prev, resources } : prev));
    try {
      const stored = JSON.parse(localStorage.getItem("m2i_intern_resources") || "{}");
      stored[studentId] = resources;
      localStorage.setItem("m2i_intern_resources", JSON.stringify(stored));
    } catch (err) {
      console.error("Failed to save resources to localStorage", err);
    }
    resources.forEach((r) => {
      axios.post("/api/intern-resources/", { ...r, studentId }).catch(() => {});
    });
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    axios.delete(`/api/students/${studentId}/`)
      .catch(err => console.error("Failed to delete student:", err));
  };

  const handleCreateBatch = (newBatchData: Partial<Batch>, cloneFromBatchId?: string, cloneAssignmentsBatchId?: string): Batch => {
    const newBatch: Batch = {
      id: `batch_${Date.now()}`,
      name: newBatchData.name || "New Cohort",
      type: newBatchData.type || "internship_3m",
      programType: newBatchData.programType || "internship",
      durationMonths: newBatchData.durationMonths || 3,
      durationLabel: newBatchData.durationLabel || "3 Months",
      college: newBatchData.college || "",
      startDate: newBatchData.startDate || new Date().toISOString().split("T")[0],
      endDate: newBatchData.endDate || new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
      status: newBatchData.status || "active",
      studentCount: 0,
      description: newBatchData.description || "Intern cohort focused on hands-on technical development.",
      technologies: newBatchData.technologies || [],
    };

    if (cloneFromBatchId) {
      const modulesToClone = learnHubModules.filter((m) => !m.batchId || m.batchId === cloneFromBatchId);
      const clonedModules: LearnHubModule[] = modulesToClone.map((mod) => ({
        ...mod,
        id: `mod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        batchId: newBatch.id,
        slides: mod.slides ? mod.slides.map(s => ({ ...s, id: `slide_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` })) : undefined
      }));
      setLearnHubModules((prev) => [...prev, ...clonedModules]);
    }

    if (cloneAssignmentsBatchId) {
      const assignmentsToClone = assignments.filter((a) => !a.batchId || a.batchId === cloneAssignmentsBatchId);
      const clonedAssignments: Assignment[] = assignmentsToClone.map((asg) => ({
        ...asg,
        id: `asg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        batchId: newBatch.id,
        questions: asg.questions ? asg.questions.map(q => ({ ...q, id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` })) : []
      }));
      setAssignments((prev) => [...clonedAssignments, ...prev]);
      clonedAssignments.forEach((asg) => {
        axios.post("/api/assignments/", { ...asg, batch: asg.batchId, batchId: asg.batchId })
          .catch((err) => console.error("Failed to persist cloned assignment:", err));
      });
    }

    setBatches((prev) => [newBatch, ...prev]);
    setSelectedBatch(newBatch);
    axios.post('/api/batches/', newBatch)
      .catch(err => console.error("Failed to save batch to API:", err));
    return newBatch;
  };

  const handleUpdateBatch = (updatedBatch: Batch) => {
    setBatches((prev) => prev.map((b) => (b.id === updatedBatch.id ? updatedBatch : b)));
    if (selectedBatch.id === updatedBatch.id) setSelectedBatch(updatedBatch);
    axios.put(`/api/batches/${updatedBatch.id}/`, updatedBatch)
      .catch(err => console.error("Failed to update batch:", err));
    setStudents((prev) =>
      prev.map((s) =>
        s.batchId === updatedBatch.id ? { ...s, batchName: updatedBatch.name, college: updatedBatch.college } : s
      )
    );
  };

  const handleUpdateStudentProfile = (updatedStudent: Student) => {
    setCurrentStudent(updatedStudent);
    setStudents((prev) => prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
    if (loggedInUser && loggedInUser.email === updatedStudent.email) {
      setLoggedInUser({ ...loggedInUser, name: updatedStudent.name, avatar: updatedStudent.avatar });
    }
    axios.patch(`/api/students/${updatedStudent.id}/`, {
      name: updatedStudent.name,
      avatar: updatedStudent.avatar,
      college: updatedStudent.college,
      branch: updatedStudent.branch,
      year: updatedStudent.year,
      phoneNumber: updatedStudent.phoneNumber,
      linkedinUrl: updatedStudent.linkedinUrl,
      githubUrl: updatedStudent.githubUrl,
      portfolioUrl: updatedStudent.portfolioUrl,
      bio: updatedStudent.bio,
      skills: updatedStudent.skills,
      resumeData: updatedStudent.resumeData,
    }).catch((err) => console.warn("Failed to patch student profile to backend:", err));
  };

  const handleDeleteBatch = (batchId: string) => {
    const remaining = batches.filter((b) => b.id !== batchId);
    setBatches(remaining);
    if (selectedBatch.id === batchId && remaining.length > 0) setSelectedBatch(remaining[0]);
    axios.delete(`/api/batches/${batchId}/`).catch(err => console.error("Failed to delete batch:", err));
  };

  const handleCreateInstantPoll = (q: {
    question: string; options: string[]; correctAnswer?: string;
    type: "mcq" | "poll" | "true_false" | "open"; timeLimitSeconds?: number; points?: number; explanation?: string;
  }) => {
    const newLiveQ: LiveQuestion = {
      id: `live_${Date.now()}`, batchId: selectedBatch.id, question: q.question, type: q.type,
      options: q.options, correctAnswer: q.correctAnswer, timeLimitSeconds: q.timeLimitSeconds || 30,
      points: q.points || 100, explanation: q.explanation, isActive: true, isClosed: false,
      createdAt: new Date().toISOString(), responses: [],
    };
    setLiveQuestions((prev) => [newLiveQ, ...prev]);
    axios.post('/api/live-questions/', { ...newLiveQ, batch: selectedBatch.id, batchId: selectedBatch.id })
      .catch(err => console.error("Failed to create live question:", err));
  };

  const handleAddLiveQuestion = (q: LiveQuestion) => {
    setLiveQuestions((prev) => [q, ...prev]);
    axios.post('/api/live-questions/', { ...q, batch: q.batchId || selectedBatch.id, batchId: q.batchId || selectedBatch.id })
      .catch(err => console.error("Failed to create live question:", err));
  };

  const handleBulkAddQuestions = (qs: LiveQuestion[]) => {
    setLiveQuestions((prev) => [...qs, ...prev]);
    axios.post('/api/live-questions/bulk_create/', { batchId: selectedBatch.id, questions: qs })
      .catch(err => console.error("Failed to bulk create live questions:", err));
  };

  const handleSubmitLiveAnswer = (questionId: string, answer: string, isCorrect?: boolean, responseTimeMs?: number) => {
    const responseTime = responseTimeMs || 1800 + Math.floor(Math.random() * 1200);
    setLiveQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        const exists = q.responses.some((r) => r.studentId === currentStudent.id);
        if (exists) return q;
        return {
          ...q,
          responses: [...q.responses, {
            studentId: currentStudent.id, studentName: currentStudent.name, avatar: currentStudent.avatar,
            answer, isCorrect, responseTimeMs: responseTime, submittedAt: new Date().toISOString(), timestamp: Date.now(),
          }],
        };
      })
    );
    axios.post(`/api/live-questions/${questionId}/respond/`, {
      studentId: currentStudent.id, answer, isCorrect, responseTimeMs: responseTime,
    }).then(res => {
      if (res.data) {
        setLiveQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...res.data, batchId: res.data.batch || res.data.batchId } : q)));
      }
    }).catch(err => console.error("Failed to submit live answer:", err));
  };

  const handleUpdateLiveQuestion = (updatedQ: LiveQuestion) => {
    setLiveQuestions((prev) => prev.map((q) => (q.id === updatedQ.id ? updatedQ : q)));
    axios.patch(`/api/live-questions/${updatedQ.id}/`, { ...updatedQ, batch: updatedQ.batchId || selectedBatch.id })
      .catch(err => console.error("Failed to update live question:", err));
  };

  const handleDeleteLiveQuestion = (qId: string) => {
    setLiveQuestions((prev) => prev.filter((q) => q.id !== qId));
    axios.delete(`/api/live-questions/${qId}/`).catch(err => console.error("Failed to delete live question:", err));
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    axios.post("/api/settings/", { id: "global", ...newSettings })
      .catch((err) => console.error("Failed to save settings to backend:", err));
  };

  // Scheduled Meetings Handlers
  const handleCreateScheduledMeeting = async (meeting: Partial<ScheduledMeeting>) => {
    const newMeet: ScheduledMeeting = {
      id: meeting.id || `meet_${Date.now()}`,
      batchId: meeting.batchId || selectedBatch?.id || "",
      title: meeting.title || "Scheduled Session",
      agenda: meeting.agenda || "", instructorName: meeting.instructorName || "",
      scheduledDate: meeting.scheduledDate || "Today", scheduledTime: meeting.scheduledTime || "10:00 AM - 01:00 PM",
      meetingLink: meeting.meetingLink || "", meetingId: meeting.meetingId || "",
      passcode: meeting.passcode || "", status: meeting.status || "scheduled",
      recordingUrl: meeting.recordingUrl || "", isPublished: meeting.isPublished !== false,
      isRecordingUnlocked: true, orderIndex: meeting.orderIndex || scheduledMeetings.length + 1,
      createdAt: new Date().toISOString(),
    };
    setScheduledMeetings((prev) => [...prev, newMeet]);
    try {
      const res = await axios.post("/api/scheduled-meetings/", { ...newMeet, batch: newMeet.batchId });
      if (res.data && res.data.id) {
        setScheduledMeetings((prev) => prev.map((m) => m.id === newMeet.id ? { ...res.data, batchId: res.data.batchId || res.data.batch } : m));
      }
    } catch (err) { console.error("Failed to create scheduled meeting:", err); }
  };

  const handleUpdateScheduledMeeting = async (updatedMeet: ScheduledMeeting) => {
    setScheduledMeetings((prev) => {
      const exists = prev.some((m) => m.id === updatedMeet.id);
      if (exists) return prev.map((m) => (m.id === updatedMeet.id ? updatedMeet : m));
      return [...prev, updatedMeet];
    });
    try {
      await axios.put(`/api/scheduled-meetings/${updatedMeet.id}/`, { ...updatedMeet, batch: updatedMeet.batchId });
    } catch {
      try {
        await axios.post('/api/scheduled-meetings/', { ...updatedMeet, batch: updatedMeet.batchId });
      } catch (err) {
        console.error("Failed to update/create scheduled meeting:", err);
      }
    }
  };

  const handleDeleteScheduledMeeting = async (meetingId: string) => {
    setScheduledMeetings((prev) => prev.filter((m) => m.id !== meetingId));
    try { await axios.delete(`/api/scheduled-meetings/${meetingId}/`); }
    catch (err) { console.error("Failed to delete scheduled meeting:", err); }
  };

  const handleSetLiveMeeting = (meeting: ScheduledMeeting) => {
    const nextMeetings = scheduledMeetings.map((m) => {
      if (m.id === meeting.id) return { ...m, status: "live" as const };
      if (m.batchId === meeting.batchId && m.status === "live") return { ...m, status: "scheduled" as const };
      return m;
    });
    setScheduledMeetings(nextMeetings);
    axios.post(`/api/scheduled-meetings/${meeting.id}/set_live/`)
      .catch(() => { axios.put(`/api/scheduled-meetings/${meeting.id}/`, { ...meeting, status: "live", batch: meeting.batchId }); });
  };

  // Assignment Handlers
  const handleCreateAssignment = (newAsg: Assignment) => {
    setAssignments((prev) => [newAsg, ...prev]);
    axios.post("/api/assignments/", { ...newAsg, batch: newAsg.batchId || selectedBatch.id, batchId: newAsg.batchId || selectedBatch.id })
      .catch((err) => console.error("Failed to save assignment:", err));
  };

  const handleUpdateAssignment = (updatedAsg: Assignment) => {
    setAssignments((prev) => prev.map((a) => (a.id === updatedAsg.id ? updatedAsg : a)));
    axios.put(`/api/assignments/${updatedAsg.id}/`, { ...updatedAsg, batch: updatedAsg.batchId || selectedBatch.id, batchId: updatedAsg.batchId || selectedBatch.id })
      .catch((err) => console.error("Failed to update assignment:", err));
  };

  const handleDeleteAssignment = (asgId: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== asgId));
    axios.delete(`/api/assignments/${asgId}/`).catch((err) => console.error("Failed to delete assignment:", err));
  };

  // LearnHub Handlers
  const handleUpdateLearnHubModules = (updatedList: LearnHubModule[]) => {
    setLearnHubModules(updatedList);
    updatedList.forEach((mod) => {
      const payload = { ...mod, batch: mod.batchId || selectedBatch.id };
      axios.put(`/api/learnhub-modules/${mod.id}/`, payload)
        .catch(() => { axios.post('/api/learnhub-modules/', payload).catch(err => console.error("Failed to persist LearnHub module:", err)); });
    });
  };

  const handleUpdateSingleModule = (updatedModule: LearnHubModule) => {
    setLearnHubModules((prev) => {
      const exists = prev.some((m) => m.id === updatedModule.id);
      if (exists) return prev.map((m) => (m.id === updatedModule.id ? updatedModule : m));
      return [...prev, updatedModule];
    });
    const payload = { ...updatedModule, batch: updatedModule.batchId || selectedBatch.id };
    axios.put(`/api/learnhub-modules/${updatedModule.id}/`, payload)
      .catch(() => { axios.post('/api/learnhub-modules/', payload).catch(err => console.error("Failed to save module:", err)); });
  };

  const handleDeleteLearnHubModule = (moduleId: string) => {
    setLearnHubModules((prev) => prev.filter((m) => m.id !== moduleId));
    axios.delete(`/api/learnhub-modules/${moduleId}/`).catch(err => console.error("Failed to delete module:", err));
  };

  // Interview Request Handler
  const handleRequestInterview = async (intern: Student) => {
    if (!currentClient) return;
    const newReq: InterviewRequest = {
      id: `intv_${Date.now()}`,
      clientId: currentClient.id,
      clientName: currentClient.companyName,
      internId: intern.id,
      internName: intern.name,
      batchId: intern.batchId,
      batchName: intern.batchName,
      status: "pending",
      interviewType: "virtual",
      notes: interviewNote,
      adminNotes: "",
      createdAt: new Date().toISOString(),
    };
    setInterviewRequests((prev) => [newReq, ...prev]);

    // Send targeted interview notifications to the specific intern & admin
    handleAddNotification({
      recipientRole: "student",
      recipientId: intern.id,
      recipientName: intern.name,
      title: "New Interview Invitation",
      message: `${currentClient.companyName} invited you for a virtual interview round.`,
      type: "interview",
      actionTab: "interviews",
    });
    handleAddNotification({
      recipientRole: "admin",
      title: "Interview Request Logged",
      message: `${currentClient.companyName} requested an interview with candidate ${intern.name}.`,
      type: "interview",
      actionTab: "interviews",
    });

    try {
      const res = await axios.post("/api/interview-requests/", {
        ...newReq,
        client: currentClient.id,
        intern: intern.id,
        batch: intern.batchId,
      });
      if (res.data) {
        setInterviewRequests((prev) =>
          prev.map((r) => (r.id === newReq.id ? { ...r, ...res.data, clientId: res.data.clientId || res.data.client, internId: res.data.internId || res.data.intern, batchId: res.data.batchId || res.data.batch } : r))
        );
      }
    } catch (err) { console.error("Failed to create interview request:", err); }
    setInterviewModalIntern(null);
    setInterviewNote("");
  };

  // Nav Items for each role
  const adminNavItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "batch", label: "Cohorts", icon: Users },
    { id: "profile_evaluations", label: "Profile Reviews & AI", icon: UserCheck, badgeText: "AI", badgeType: "violet" },
    { id: "shifts", label: "Shifts & Attendance", icon: Clock },
    { id: "daily_logs", label: "Daily Logs & AI Reviews", icon: Sparkles },
    { id: "learn_hub", label: "Learn Hub", icon: BookOpen },
    { id: "assignments", label: "Assignments", icon: Code2 },
    { id: "projects", label: "Project Assignments", icon: FolderKanban },
    { id: "live_qa", label: "Live Q&A", icon: Radio },
    { id: "reports", label: "Reports & Analytics", icon: BarChart3 },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
    { id: "resources", label: "Resources", icon: Library },
    { id: "certificate", label: "Certificate", icon: Award },
    { id: "interviews", label: "Interview Requests", icon: Calendar },
    { id: "clients", label: "Client Management", icon: Building2 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const internOpportunitiesCount = interviewRequests.filter(
    (r) =>
      r.internId === currentStudent?.id &&
      (r.status === "approved" || r.status === "scheduled")
  ).length;

  const studentNavItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "attendance", label: "Time Clock & Attendance", icon: Clock },
    { id: "activity_log", label: "Daily Activity Log", icon: FileText },
    ...(settings.enableLearnHub !== false ? [{ id: "learn_hub", label: "Learn Hub", icon: BookOpen }] : []),
    ...(settings.enableLiveQA !== false ? [{ id: "live_qa", label: "Live Q&A", icon: Radio }] : []),
    ...(settings.enableCodingIDE !== false ? [{ id: "assignments", label: "Assignments", icon: Code2 }] : []),
    { id: "projects", label: "Assigned Projects", icon: FolderKanban },
    {
      id: "my_resources",
      label: "My Resources",
      icon: FolderGit2,
      badgeText: "AI",
      badgeType: "violet",
    },
    { id: "resources", label: "Resources", icon: Library },
    ...(settings.enableMyReport !== false ? [{ id: "reports", label: "My Report", icon: BarChart3 }] : []),
    {
      id: "interviews",
      label: "My Interviews",
      icon: Calendar,
      badgeText: internOpportunitiesCount > 0 ? internOpportunitiesCount.toString() : undefined,
      badgeType: "emerald",
    },
    {
      id: "resume_builder",
      label: "AI Resume & ATS Score",
      icon: Sparkles,
    },
    ...(settings.enableCertificate !== false ? [{ id: "certificate", label: "My Certificate", icon: Award }] : []),
    { id: "profile", label: "My Profile", icon: User },
  ];

  const clientNavItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    {
      id: "cohorts",
      label: "Cohorts & Batches",
      icon: Users,
      badgeText: "All Tracks",
      badgeType: "violet",
    },
    { id: "leaderboard", label: "Intern Leaderboard", icon: Trophy },
    {
      id: "reports",
      label: "Analytics & Reports",
      icon: BarChart3,
      badgeText: "Dossier",
      badgeType: "emerald",
    },
    {
      id: "shortlist",
      label: "Shortlisted Pipeline",
      icon: BookmarkCheck,
      badgeText: shortlistedInternIds.length.toString(),
      badgeType: "amber",
    },
    {
      id: "interviews",
      label: "Interview Requests",
      icon: Calendar,
    },
  ];

  const currentNavItems = userRole === "admin" ? adminNavItems : userRole === "client" ? clientNavItems : studentNavItems;

  // Logout - Explicit sign-out clears session and presents the brochure / landing page
  const handleLogout = () => {
    try {
      localStorage.setItem("mind2i_explicit_logout", "true");
      localStorage.removeItem("mind2i_auth_session");
      localStorage.removeItem("mind2i_active_tab");
      localStorage.removeItem("mind2i_selected_batch_id");
      localStorage.removeItem("m2i_admin_eval_view_mode");
      localStorage.removeItem("m2i_admin_eval_selected_round");
      localStorage.removeItem("m2i_admin_eval_selected_student_id");
    } catch {}
    setIsAuthenticated(false);
    setLoggedInUser(null);
    setCurrentClient(null);
    setUserRole("student");
    setActiveTab("dashboard");
  };

  // Gradient based on role
  const roleGradient = userRole === "admin" ? "from-indigo-500 via-violet-500 to-purple-500" :
    userRole === "client" ? "from-teal-500 via-emerald-500 to-green-500" :
    "from-sky-500 via-cyan-500 to-teal-500";

  const roleAccent = userRole === "admin" ? "sky" : userRole === "client" ? "teal" : "cyan";

  // Render Landing Page if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <LandingView onLoginClick={() => setShowLoginModal(true)} />
        {showLoginModal && (
          <LoginModal
            onClose={() => setShowLoginModal(false)}
            onLoginSuccess={(role, user) => {
              try {
                localStorage.removeItem("mind2i_explicit_logout");
                localStorage.setItem(
                  "mind2i_auth_session",
                  JSON.stringify({
                    isAuthenticated: true,
                    role,
                    user,
                  })
                );
              } catch {}
              setIsAuthenticated(true);
              setUserRole(role);
              setLoggedInUser(user);
              setShowLoginModal(false);

              // Restore saved tab if valid for this role, else default to dashboard
              const savedTab = localStorage.getItem("mind2i_active_tab");
              const validTabsForRole =
                role === "admin"
                  ? adminNavItems.map((n) => n.id)
                  : role === "client"
                  ? clientNavItems.map((n) => n.id)
                  : studentNavItems.map((n) => n.id);

              if (savedTab && validTabsForRole.includes(savedTab)) {
                setActiveTab(savedTab);
              } else {
                setActiveTab("dashboard");
              }

              if (role === "student" && user) {
                const stu = students.find(s => s.email === user.email);
                if (stu) {
                  setCurrentStudent(stu);
                  const b = batches.find(x => x.id === stu.batchId);
                  if (b) setSelectedBatch(b);
                }
              } else if (role === "admin" && user) {
                const assigned = user.assignedBatches || [];
                if (assigned.length > 0 && !assigned.includes("all")) {
                  const firstAssigned = batches.find(x => assigned.includes(x.id));
                  if (firstAssigned) setSelectedBatch(firstAssigned);
                }
              } else if (role === "client" && user) {
                setCurrentClient(user);
              }
            }}
          />
        )}
        {selfRegisterBatch && (
          <BatchRegistrationModal
            batch={selfRegisterBatch}
            existingStudents={students}
            onRegisterStudent={handleAddStudent}
            onAutoLogin={(newStudent) => {
              try {
                localStorage.removeItem("mind2i_explicit_logout");
                localStorage.setItem(
                  "mind2i_auth_session",
                  JSON.stringify({
                    isAuthenticated: true,
                    role: "student",
                    user: {
                      email: newStudent.email || "",
                      name: newStudent.name || "Student",
                      role: "student",
                    },
                  })
                );
              } catch {}
              setIsAuthenticated(true);
              setUserRole("student");
              setLoggedInUser({
                email: newStudent.email || "",
                name: newStudent.name || "Student",
                role: "student",
              });
              const foundStu = students.find(s => s.email === newStudent.email);
              const stu: Student = foundStu
                ? { ...foundStu, ...newStudent, skills: newStudent.skills || foundStu.skills || [] }
                : ({
                    id: `stu_${Date.now()}`,
                    name: newStudent.name || "Student",
                    email: newStudent.email || "",
                    mobile: newStudent.mobile || "",
                    college: newStudent.college || "",
                    branch: newStudent.branch || "",
                    city: newStudent.city || "",
                    state: newStudent.state || "",
                    batchId: newStudent.batchId || "",
                    batchName: newStudent.batchName || "",
                    enrolledAt: new Date().toISOString(),
                    status: "active",
                    scores: { quizScore: 0, codingScore: 0, liveQAScore: 0, assignmentScore: 0, overallAccuracy: 0 },
                    totalPoints: 0,
                    activeStreakDays: 0,
                    fastestResponseMs: 0,
                    attendedSessions: 0,
                    totalSessions: 0,
                    skills: newStudent.skills || [],
                    resumeUrl: newStudent.resumeUrl || "",
                    githubUrl: newStudent.githubUrl || "",
                    linkedinUrl: newStudent.linkedinUrl || "",
                    bio: newStudent.bio || "",
                  } as Student);
              setCurrentStudent(stu);
              const b = batches.find(x => x.id === stu.batchId);
              if (b) setSelectedBatch(b);
              setSelfRegisterBatch(null);
            }}
            onClose={() => setSelfRegisterBatch(null)}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* TOPBAR */}
      <header className={`sticky top-0 z-40 bg-white border-b border-slate-100 px-4 sm:px-6 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] ${inspectedStudent ? "print:hidden" : ""}`}>
        <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${roleGradient}`}></div>

        {/* Left: Brand Logo & Mobile Menu */}
        <div className="flex items-center gap-3 py-3">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div onClick={() => setActiveTab("dashboard")} className="flex items-center gap-3 cursor-pointer group">
            <Minda2Logo size="md" showTagline={true} />
            <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-slate-200">
              <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-gradient-to-r ${
                userRole === "admin" ? "from-indigo-50 to-violet-50 text-indigo-700 border border-indigo-100" :
                userRole === "client" ? "from-teal-50 to-emerald-50 text-teal-700 border border-teal-100" :
                "from-cyan-50 to-sky-50 text-cyan-700 border border-cyan-100"
              }`}>
                {userRole === "admin" ? "Admin" : userRole === "client" ? "Client Portal" : "Intern"}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Notifications & User Profile */}
        <div className="flex items-center gap-3">
          {/* Notification Icon */}
          <div className="relative" ref={notificationMenuRef}>
            <button
              type="button"
              onClick={() => setNotificationMenuOpen(!notificationMenuOpen)}
              className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 flex items-center justify-center transition-all relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400"
              title="Notifications"
            >
              <Bell className="w-5 h-5 text-slate-600" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs ring-2 ring-white animate-pulse">
                  {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
                </span>
              )}
            </button>

            <NotificationDropdown
              isOpen={notificationMenuOpen}
              onClose={() => setNotificationMenuOpen(false)}
              notifications={userNotifications}
              onMarkAsRead={handleMarkNotificationAsRead}
              onClearNotification={handleClearNotification}
              onMarkAllAsRead={handleMarkAllNotificationsAsRead}
              onClearAll={handleClearAllNotifications}
              onNotificationClick={handleNotificationClick}
              userRole={userRole}
              userName={
                userRole === "admin"
                  ? loggedInUser?.name || "Administrator"
                  : userRole === "student"
                  ? currentStudent?.name || loggedInUser?.name || "Intern"
                  : loggedInUser?.companyName || "Client"
              }
            />
          </div>

          {/* User Profile */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${roleGradient} flex items-center justify-center text-white font-black text-sm shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 cursor-pointer`}
            >
              {(loggedInUser?.name || loggedInUser?.contactPerson || "U").charAt(0).toUpperCase()}
            </button>

          <AnimatePresence>
            {profileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 mt-2 w-56 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden z-50"
              >
                <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                  <div className="text-sm font-black text-slate-800 truncate">{loggedInUser?.name || loggedInUser?.contactPerson || "Vijaya Kumar Mekala"}</div>
                  <div className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${
                    userRole === "admin" ? "text-indigo-500" : userRole === "client" ? "text-teal-500" : "text-cyan-500"
                  }`}>{userRole === "client" ? loggedInUser?.companyName || "Client" : (loggedInUser?.role || userRole)}</div>
                </div>

                <div className="p-2">
                  <button
                    onClick={() => { setProfileMenuOpen(false); handleLogout(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>

      {/* MAIN LAYOUT */}
      <div id="app-main-layout" className={`flex-1 flex overflow-hidden ${inspectedStudent ? "print:hidden" : ""}`}>
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex print:hidden w-60 xl:w-64 bg-white border-r border-slate-100 p-3.5 xl:p-4 flex-col justify-between overflow-y-auto flex-shrink-0 transition-all duration-200">
          <div className="space-y-4">
            <nav className="space-y-1">
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-2.5 pb-2 flex items-center justify-between">
                <span>{userRole === "admin" ? "Management Modules" : userRole === "client" ? "Client Portal" : "Intern Portal"}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-xs shadow-emerald-500/50"></span>
              </div>

              {currentNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const isLockedCert = item.id === "certificate" && !certificateTemplate.isUnlocked && userRole === "student";

                return (
                  <button
                    key={item.id}
                    disabled={isLockedCert}
                    onClick={() => { if (!isLockedCert) setActiveTab(item.id); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 text-left group ${
                      isLockedCert ? "text-slate-400 opacity-70 cursor-not-allowed bg-slate-50/50" :
                      isActive ? `bg-gradient-to-r ${roleGradient} text-white shadow-md font-black cursor-pointer` :
                      "text-slate-600 hover:bg-gradient-to-r hover:from-slate-50 hover:to-teal-50/50 hover:text-slate-900 cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive && !isLockedCert ? "text-white" : "text-slate-400 group-hover:text-teal-500"}`} />
                      <span className="tracking-tight truncate">{item.label}</span>
                    </div>
                    {isLockedCert && <Lock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 ml-1" />}
                    {(item as any).badgeText && (
                      (item as any).badgeType === "violet" ? (
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all ${
                          isActive
                            ? "bg-white/25 text-white border-white/40"
                            : "border-violet-200 bg-violet-50 text-violet-700"
                        }`}>
                          {(item as any).badgeText}
                        </span>
                      ) : (item as any).badgeType === "emerald" ? (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all ${
                          isActive
                            ? "bg-white/25 text-white border-white/40"
                            : "border-emerald-200 bg-emerald-50 text-emerald-700"
                        }`}>
                          {(item as any).badgeText}
                        </span>
                      ) : (
                        <span className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center flex-shrink-0 shadow-xs ${
                          isActive
                            ? "bg-white text-slate-900"
                            : (item as any).badgeType === "amber"
                            ? "bg-amber-500 text-white"
                            : "bg-teal-500 text-white"
                        }`}>
                          {(item as any).badgeText}
                        </span>
                      )
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="pt-3 text-center space-y-2 border-t border-slate-100">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            </div>
            <span className="text-[11px] font-black text-slate-600 block tracking-tight">MIND2I Internship Platform</span>
            <span className="text-[10px] text-slate-400 font-semibold block truncate">
              {selectedBatch.name || "No cohort selected"}
            </span>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: -200 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -200 }}
              className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm lg:hidden flex"
            >
              <div className="w-80 bg-white h-full p-6 space-y-6 flex flex-col justify-between shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <Minda2Logo size="md" showTagline={false} />
                    <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <nav className="space-y-1.5">
                    {currentNavItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition text-left ${
                            isActive ? `bg-gradient-to-r ${roleGradient} text-white font-black shadow-md` : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                            <span className="tracking-tight">{item.label}</span>
                          </div>
                          {(item as any).badgeText && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              (item as any).badgeType === "violet" ? "bg-violet-100 text-violet-700" :
                              (item as any).badgeType === "emerald" ? "bg-emerald-100 text-emerald-700" :
                              "bg-amber-500 text-white"
                            }`}>
                              {(item as any).badgeText}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </div>
                <div className="text-center text-xs text-slate-400 font-semibold border-t border-slate-100 pt-4">
                  MIND2I • INTERNSHIP PLATFORM
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#fbfcfd] relative">
          <div className="max-w-7xl mx-auto relative z-10">

            {/* ===== ADMIN VIEWS ===== */}
            {activeTab === "dashboard" && userRole === "admin" && (
              <AdminDashboardView
                batches={batches} selectedBatch={selectedBatch} onSelectBatch={setSelectedBatch}
                students={students} liveQuestions={liveQuestions} assignments={assignments}
                settings={settings} scheduledMeetings={scheduledMeetings}
                onUpdateSettings={handleUpdateSettings}
                onUpdateScheduledMeeting={handleUpdateScheduledMeeting}
                onDeleteScheduledMeeting={handleDeleteScheduledMeeting}
                onToggleRecordingUnlock={() => {}}
                onNavigateTab={setActiveTab}
                onCreateInstantPoll={handleCreateInstantPoll}
                onViewStudent={(s) => setInspectedStudent(s)}
                onUpdateStudents={setStudents}
              />
            )}

            {activeTab === "batch" && userRole === "admin" && (
              <BatchManagementView
                batches={batches} selectedBatch={selectedBatch} onSelectBatch={setSelectedBatch}
                onCreateBatch={handleCreateBatch} onUpdateBatch={handleUpdateBatch} onDeleteBatch={handleDeleteBatch}
                students={students} onAddStudent={handleAddStudent} onBulkAddStudents={handleBulkAddStudents}
                onEditStudent={handleEditStudent} onDeleteStudent={handleDeleteStudent}
                onViewStudentDetails={(s) => setInspectedStudent(s)}
                onOpenSelfRegisterPortal={(batchId) => {
                  const b = batches.find((x) => x.id === batchId) || selectedBatch;
                  setSelfRegisterBatch(b);
                }}
              />
            )}

            {activeTab === "profile_evaluations" && userRole === "admin" && (
              <AdminProfileEvaluationsView
                batches={batches}
                selectedBatch={selectedBatch}
                students={students}
                dailyActivityLogs={dailyActivityLogs}
                projectSubmissions={projectSubmissions}
                attendanceRecords={attendanceRecords}
                resumeData={resumeData}
                assignmentSubmissions={projectSubmissions}
                onUpdateStudentEvaluation={handleUpdateStudentEvaluation}
                onUpdateStudentResources={handleUpdateStudentResources}
                onViewStudentReport={(s) => setInspectedStudent(s)}
                onToast={showToastNotification}
                currentAdminUser={
                  loggedInUser || {
                    name: "Vijaya Kumar Mekala",
                    role: "Lead Evaluator & Program Director",
                    email: "vijayakumar@mind2i.edu",
                    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=VijayaKumar",
                  }
                }
              />
            )}

            {activeTab === "learn_hub" && (userRole === "admin" || userRole === "student") && (
              <LearnHubInteractive
                modules={learnHubModules} selectedBatch={selectedBatch} userRole={userRole}
                currentStudent={currentStudent} students={students}
                onUpdateModules={handleUpdateLearnHubModules} onUpdateModule={handleUpdateSingleModule}
              />
            )}

            {activeTab === "assignments" && (userRole === "admin" || userRole === "student") && (
              <AssignmentManagerView
                assignments={assignments} selectedBatch={selectedBatch} userRole={userRole}
                currentStudent={currentStudent} students={students}
                onCreateAssignment={handleCreateAssignment} onUpdateAssignment={handleUpdateAssignment}
                onDeleteAssignment={handleDeleteAssignment}
              />
            )}

            {activeTab === "projects" && (userRole === "admin" || userRole === "student") && (
              <AssignedProjectsKanbanView
                userRole={userRole}
                currentStudent={currentStudent}
                students={students}
                batches={batches}
                selectedBatch={selectedBatch}
                projects={projectAssignments}
                submissions={projectSubmissions}
                onCreateProject={handleCreateProjectAssignment}
                onUpdateProject={handleUpdateProjectAssignment}
                onDeleteProject={handleDeleteProjectAssignment}
                onSubmitWork={handleSubmitProjectWork}
                onUpdateSubmission={handleUpdateProjectSubmission}
                onBulkUpdateSubmissions={handleBulkUpdateProjectSubmissions}
              />
            )}

            {activeTab === "live_qa" && (userRole === "admin" || userRole === "student") && (
              <LiveQAManagerView
                liveQuestions={liveQuestions} selectedBatch={selectedBatch} userRole={userRole}
                currentStudent={currentStudent} students={students} settings={settings}
                scheduledMeetings={scheduledMeetings}
                onAddLiveQuestion={handleAddLiveQuestion} onBulkAddQuestions={handleBulkAddQuestions}
                onUpdateLiveQuestion={handleUpdateLiveQuestion} onDeleteLiveQuestion={handleDeleteLiveQuestion}
                onSubmitLiveAnswer={handleSubmitLiveAnswer}
                onToggleRecordingUnlock={() => {}}
                onUpdateSettings={handleUpdateSettings}
              />
            )}

            {activeTab === "reports" && userRole === "student" && currentStudent && (
              <CandidateReportView
                student={currentStudent}
                onClose={() => setActiveTab("dashboard")}
                userRole={userRole}
                batches={batches}
                selectedBatch={selectedBatch}
                projects={projectAssignments}
                submissions={projectSubmissions}
                assignments={assignments}
                liveQuestions={liveQuestions}
                learnHubModules={learnHubModules}
                isTabMode={true}
                attendanceRecords={attendanceRecords}
                rosterAssignments={rosterAssignments}
                shiftPatterns={shiftPatterns}
                holidays={holidays}
                dailyActivityLogs={dailyActivityLogs}
                leaveRequests={leaveRequests}
                resumeData={currentStudent.resumeData || resumeData}
              />
            )}

            {activeTab === "resume_builder" && currentStudent && (
              <AIResumeBuilderView
                currentStudent={currentStudent}
                resumeData={currentStudent.resumeData || resumeData}
                onUpdateResumeData={(newResume) => {
                  setResumeData(newResume);
                  handleUpdateStudentProfile({
                    ...currentStudent,
                    resumeData: newResume,
                  });
                }}
                onToast={showToastNotification}
              />
            )}

            {activeTab === "reports" && userRole === "admin" && (
              <ReportsAnalyticsView
                batches={batches} selectedBatch={selectedBatch} students={students}
                userRole={userRole} currentStudent={currentStudent}
                onViewStudent={(s) => setInspectedStudent(s)}
              />
            )}

            {activeTab === "leaderboard" && userRole === "admin" && (
              <LeaderboardView
                selectedBatch={selectedBatch} students={students} userRole={userRole}
                currentStudent={currentStudent} onViewStudent={(s) => setInspectedStudent(s)}
              />
            )}

            {activeTab === "resources" && (userRole === "admin" || userRole === "student") && (
              <ResourcesView modules={learnHubModules} batch={selectedBatch} scheduledMeetings={scheduledMeetings} />
            )}

            {activeTab === "certificate" && (userRole === "admin" || userRole === "student") && (
              <CertificateManagerView
                certificateTemplate={certificateTemplate} selectedBatch={selectedBatch}
                userRole={userRole} currentStudent={currentStudent} students={students}
                onUpdateCertificateTemplate={setCertificateTemplate}
              />
            )}

            {activeTab === "interviews" && userRole === "admin" && (
              <InterviewRequestsView
                userRole="admin"
                clients={clients}
                interviewRequests={interviewRequests}
                students={students}
                batches={batches}
                selectedBatch={selectedBatch}
                onUpdateRequests={setInterviewRequests}
              />
            )}

            {activeTab === "clients" && userRole === "admin" && (
              <ClientManagementView
                clients={clients} batches={batches} onUpdateClients={setClients}
              />
            )}

            {activeTab === "shifts" && userRole === "admin" && (
              <ShiftManagementView
                shiftPatterns={shiftPatterns}
                rosterAssignments={rosterAssignments}
                holidays={holidays}
                leaveRequests={leaveRequests}
                batches={batches}
                selectedBatch={selectedBatch}
                students={students}
                onUpdateShiftPatterns={handleUpdateShiftPatterns}
                onUpdateRosterAssignments={handleUpdateRosterAssignments}
                onUpdateHolidays={handleUpdateHolidays}
                onUpdateLeaveRequests={handleUpdateLeaveRequests}
                onAddNotification={handleAddNotification}
                onToast={showToastNotification}
                onNavigateToDailyLogs={() => setActiveTab("daily_logs")}
              />
            )}

            {activeTab === "daily_logs" && userRole === "admin" && (
              <AdminDailyLogsReviewView
                activityLogs={dailyActivityLogs}
                batches={batches}
                selectedBatch={selectedBatch}
                students={students}
                onUpdateActivityLogs={handleUpdateActivityLogs}
                onToast={showToastNotification}
              />
            )}

            {activeTab === "settings" && userRole === "admin" && (
              <SettingsView
                settings={settings} onUpdateSettings={handleUpdateSettings}
                batches={batches} selectedBatch={selectedBatch}
                scheduledMeetings={scheduledMeetings}
                onCreateScheduledMeeting={handleCreateScheduledMeeting}
                onUpdateScheduledMeeting={handleUpdateScheduledMeeting}
                onDeleteScheduledMeeting={handleDeleteScheduledMeeting}
                onSetLiveMeeting={handleSetLiveMeeting}
              />
            )}

            {/* ===== STUDENT/INTERN VIEWS ===== */}
            {activeTab === "dashboard" && userRole === "student" && (
              <StudentDashboardView
                currentStudent={currentStudent} selectedBatch={selectedBatch}
                assignments={assignments} liveQuestions={liveQuestions}
                settings={settings} scheduledMeetings={scheduledMeetings}
                interviewRequests={interviewRequests} clients={clients}
                onNavigateTab={setActiveTab} onSubmitLiveAnswer={handleSubmitLiveAnswer}
                onUpdateSettings={handleUpdateSettings}
                onUpdateScheduledMeeting={handleUpdateScheduledMeeting}
                onToggleRecordingUnlock={() => {}}
                shiftName={
                  rosterAssignments.find((r) => r.internId === currentStudent.id)?.shiftName ||
                  shiftPatterns[0]?.name ||
                  "Morning Shift"
                }
                latestPunch={punchLogs.find((p) => !p.internId || p.internId === currentStudent.id)}
              />
            )}

            {activeTab === "attendance" && userRole === "student" && currentStudent && (
              <InternAttendanceView
                currentStudent={currentStudent}
                shiftPatterns={shiftPatterns}
                rosterAssignments={rosterAssignments}
                attendanceRecords={attendanceRecords}
                punchLogs={punchLogs}
                holidays={holidays}
                leaveRequests={leaveRequests}
                onUpdatePunchLogs={handleUpdatePunchLogs}
                onUpdateAttendanceRecords={handleUpdateAttendanceRecords}
                onCreateLeaveRequest={(req) => {
                  handleUpdateLeaveRequests((prev) => [req, ...prev]);
                  axios.post("/api/leave-requests/", req).catch(() => {});
                }}
                onAddNotification={handleAddNotification}
                onToast={showToastNotification}
              />
            )}

            {activeTab === "activity_log" && userRole === "student" && currentStudent && (
              <DailyActivityLogView
                currentStudent={currentStudent}
                activityLogs={dailyActivityLogs}
                onUpdateActivityLogs={handleUpdateActivityLogs}
                onToast={showToastNotification}
              />
            )}

            {activeTab === "interviews" && userRole === "student" && currentStudent && (
              <InternInterviewsView
                currentStudent={currentStudent}
                interviewRequests={interviewRequests}
                clients={clients}
                batches={batches}
                onUpdateRequests={setInterviewRequests}
              />
            )}

            {activeTab === "my_resources" && userRole === "student" && currentStudent && (
              <InternResourcesVaultView
                currentStudent={currentStudent}
                onUpdateStudent={handleUpdateStudentProfile}
              />
            )}

            {activeTab === "profile" && userRole === "student" && (
              <ProfileView userRole={userRole} currentStudent={currentStudent} onUpdateStudent={handleUpdateStudentProfile} />
            )}

            {/* ===== CLIENT VIEWS ===== */}
            {activeTab === "dashboard" && userRole === "client" && currentClient && (
              <ClientDashboardView
                clientUser={currentClient} batches={batches} students={students}
                interviewRequests={interviewRequests} onNavigateTab={setActiveTab}
                onSelectBatch={setSelectedBatch}
              />
            )}

            {activeTab === "cohorts" && userRole === "client" && currentClient && (
              <ClientCohortsView
                batches={batches}
                students={students}
                assignedBatches={currentClient.assignedBatches || ["all"]}
                onSelectCohortForLeaderboard={(batchId) => {
                  const b = batches.find((x) => x.id === batchId);
                  if (b) setSelectedBatch(b);
                  setActiveTab("leaderboard");
                }}
                onSelectCohortForAnalytics={(batchId) => {
                  const b = batches.find((x) => x.id === batchId);
                  if (b) setSelectedBatch(b);
                  setActiveTab("reports");
                }}
              />
            )}

            {activeTab === "leaderboard" && userRole === "client" && currentClient && (
              <ClientLeaderboardView
                clientUser={currentClient} batches={batches} students={students}
                interviewRequests={interviewRequests}
                shortlistedIds={shortlistedInternIds}
                onToggleShortlist={handleToggleShortlist}
                onRequestInterview={(intern) => setInterviewModalIntern(intern)}
                onViewIntern={(intern) => setInspectedStudent(intern)}
              />
            )}

            {activeTab === "shortlist" && userRole === "client" && currentClient && (
              <ClientShortlistPipelineView
                clientUser={currentClient}
                shortlistedInterns={students.filter((s) => shortlistedInternIds.includes(s.id))}
                batches={batches}
                interviewRequests={interviewRequests}
                onRemoveFromShortlist={handleToggleShortlist}
                onRequestInterview={(intern) => setInterviewModalIntern(intern)}
                onViewIntern={(intern) => setInspectedStudent(intern)}
                onNavigateLeaderboard={() => setActiveTab("leaderboard")}
              />
            )}

            {activeTab === "reports" && userRole === "client" && currentClient && (
              <ClientAnalyticsView
                clientUser={currentClient}
                batches={batches}
                students={students}
                interviewRequests={interviewRequests}
                onViewIntern={(intern) => setInspectedStudent(intern)}
                onRequestInterview={(intern) => setInterviewModalIntern(intern)}
              />
            )}

            {activeTab === "interviews" && userRole === "client" && currentClient && (
              <InterviewRequestsView
                userRole="client" clientUser={currentClient} clients={clients}
                interviewRequests={interviewRequests} students={students} batches={batches}
                onUpdateRequests={setInterviewRequests}
              />
            )}
          </div>
        </main>
      </div>

      {/* Global Toast Notification */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastNotification}</span>
        </div>
      )}

      {/* Candidate Performance Report Overlay */}
      {inspectedStudent && (
        <CandidateReportView
          student={inspectedStudent}
          onClose={() => setInspectedStudent(null)}
          userRole={userRole}
          allStudents={students}
          batches={batches}
          selectedBatch={selectedBatch}
          projects={projectAssignments}
          submissions={projectSubmissions}
          assignments={assignments}
          liveQuestions={liveQuestions}
          learnHubModules={learnHubModules}
          onSelectStudent={(s) => setInspectedStudent(s)}
          onRequestInterview={(s) => setInterviewModalIntern(s)}
          attendanceRecords={attendanceRecords}
          rosterAssignments={rosterAssignments}
          shiftPatterns={shiftPatterns}
          holidays={holidays}
          dailyActivityLogs={dailyActivityLogs}
          leaveRequests={leaveRequests}
          resumeData={inspectedStudent.resumeData || resumeData}
        />
      )}

      {/* Interview Request Modal (Client) */}
      <AnimatePresence>
        {interviewModalIntern && currentClient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setInterviewModalIntern(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-black text-slate-800 mb-1">Request Interview</h3>
              <p className="text-sm text-slate-500 mb-4">
                Request an interview with <span className="font-bold text-teal-600">{interviewModalIntern.name}</span>
              </p>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <img
                      src={interviewModalIntern.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(interviewModalIntern.name)}`}
                      alt={interviewModalIntern.name}
                      className="w-12 h-12 rounded-xl"
                    />
                    <div>
                      <div className="font-black text-slate-800">{interviewModalIntern.name}</div>
                      <div className="text-xs text-slate-500">{interviewModalIntern.batchName} • {interviewModalIntern.totalPoints} pts</div>
                    </div>
                  </div>
                  {interviewModalIntern.skills && interviewModalIntern.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {interviewModalIntern.skills.map((sk) => (
                        <span key={sk} className="px-2 py-0.5 bg-teal-100 text-teal-700 rounded-lg text-[10px] font-bold">{sk}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Notes (Optional)</label>
                  <textarea
                    value={interviewNote}
                    onChange={(e) => setInterviewNote(e.target.value)}
                    placeholder="Any specific topics or requirements..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/30 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setInterviewModalIntern(null)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRequestInterview(interviewModalIntern)}
                  className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl text-sm font-bold hover:shadow-md transition"
                >
                  <Calendar className="w-4 h-4 inline mr-1.5" />
                  Submit Request
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Self-Registration Modal (Admin Preview or Authenticated Trigger) */}
        {selfRegisterBatch && (
          <BatchRegistrationModal
            batch={selfRegisterBatch}
            existingStudents={students}
            onRegisterStudent={handleAddStudent}
            onClose={() => setSelfRegisterBatch(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
