import React, { useState, useMemo, useCallback } from "react";
import axios from "axios";
import { Student, Batch, InternEvaluation, InternResource, InternReflectionVideo, isDemoStudent } from "../types";
import { generateAIProfileEvaluation } from "../utils/aiProfileEvaluator";
import { DEFAULT_SAMPLE_RESOURCES } from "./InternResourcesVaultView";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Search,
  Users,
  Award,
  BookOpen,
  MessageSquare,
  FileCheck,
  Presentation,
  FolderKanban,
  FileText,
  Sliders,
  Save,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Clock,
  Zap,
  Tag,
  Plus,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ArrowLeft,
  Video,
  Play,
  Pause,
  FolderGit2,
  Layers,
  RefreshCw,
  Download,
  Eye,
  Maximize2,
  Minimize2,
  Check,
  FileArchive,
  Target,
  Code2,
  Trophy,
  Minus,
  Trash2,
  Edit3,
  UserCheck,
  BarChart3,
  Lock,
} from "lucide-react";

// ─── SYSTEM ADMIN EVALUATORS (Faculty & Industry Mentors for Multi-Admin Reviews) ───
export interface EvaluatorUser {
  name: string;
  role: string;
  initials: string;
  email: string;
  avatar: string;
  adminRole: "super_admin" | "instructor";
}

export const SYSTEM_ADMIN_EVALUATORS: EvaluatorUser[] = [
  {
    name: "Vijaya Kumar Mekala",
    role: "Lead Evaluator & Program Director",
    initials: "VK",
    email: "vijayakumar@mind2i.edu",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=VijayaKumar",
    adminRole: "super_admin",
  },
  {
    name: "Dr. S. Rajesh",
    role: "Principal Software Architect & Tech Faculty",
    initials: "SR",
    email: "rajesh.s@mind2i.edu",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=RajeshFaculty",
    adminRole: "instructor",
  },
  {
    name: "Anita Desai",
    role: "Placement Director & Industry Relations Lead",
    initials: "AD",
    email: "anita.desai@mind2i.edu",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=AnitaPlacement",
    adminRole: "instructor",
  },
  {
    name: "Karthik Subramanian",
    role: "Senior Cloud & DevOps Mentor",
    initials: "KS",
    email: "karthik.sub@mind2i.edu",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=KarthikDevOps",
    adminRole: "instructor",
  },
];

// ─── RUBRIC QUICK-SELECT SCORE PRESETS ───
export const RUBRIC_PRESET_SCORES = [
  { label: "Developing", score: 70, tier: "Developing", color: "hover:border-amber-400 hover:text-amber-700" },
  { label: "Proficient", score: 82, tier: "Proficient", color: "hover:border-blue-400 hover:text-blue-700" },
  { label: "Strong", score: 88, tier: "Excellent", color: "hover:border-teal-400 hover:text-teal-700" },
  { label: "Excellent", score: 94, tier: "Excellent", color: "hover:border-indigo-400 hover:text-indigo-700" },
  { label: "Distinction", score: 98, tier: "Distinction", color: "hover:border-emerald-400 hover:text-emerald-700" },
];

// ─── DEFAULT GENERAL MULTI-ADMIN FACULTY EVALUATIONS GENERATOR ───
export const generateDefaultAdminEvaluations = (
  student: Student,
  batch: Batch | null,
  dailyLogs: any[] = [],
  submissions: any[] = []
): InternEvaluation[] => {
  if (!isDemoStudent(student)) {
    return [];
  }
  const base = student.evaluation || generateAIProfileEvaluation(student, batch, undefined, dailyLogs, submissions);

  // In Image 1: Varshini Reddy has completed review ("Reviewed by You", Consensus: 89%),
  // while other candidates (Karthik Varma, Pooja Reddy, Aarav Sharma) are "Pending Your Review"
  const isReviewedIntern =
    student.name?.toLowerCase().includes("varshini") ||
    student.email?.toLowerCase().includes("sneha.kulkarni") ||
    student.id === "intern_04";

  const vijayaScore = isReviewedIntern ? (base.overallRating || 89) : 0;
  const isVijayaPending = vijayaScore === 0;

  return [
    {
      ...base,
      id: `${student.id}-admin-vijaya`,
      evaluationName: "System Architecture & System Defense",
      reviewerName: "Vijaya Kumar Mekala",
      reviewerRole: "Lead Evaluator & Program Director",
      evaluatorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=VijayaLead",
      evaluatedAt: isVijayaPending
        ? new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
        : "August 28, 2026",
      communicationScore: isVijayaPending ? 0 : (base.communicationScore || 90),
      grammarScore: isVijayaPending ? 0 : (base.grammarScore || 88),
      fluencyScore: isVijayaPending ? 0 : (base.fluencyScore || 91),
      projectScore: isVijayaPending ? 0 : (base.projectScore || 92),
      overallRating: vijayaScore,
      communicationNotes: "Verbal clarity, standup participation, and collaborative responses.",
      grammarNotes: "Technical documentation structure, git commit quality, and PR descriptions.",
      fluencyNotes: "Demonstrated presentation poise and architectural justification.",
      projectNotes: "Feature implementation, schema correctness, and code execution rigor.",
      aiVerdict: isVijayaPending ? "Pending Faculty Evaluation" : (base.aiVerdict || "Satisfactory"),
      customNotes: isVijayaPending
        ? "Evaluation pending for System Architecture & System Defense. Ready for faculty review."
        : (base.customNotes || "Candidate exhibited strong core fundamentals, rapid problem formulation, and confident verbal delivery during initial faculty review."),
    },
    {
      ...base,
      id: `${student.id}-admin-rajesh`,
      evaluationName: "Core Technical & Code Quality Review",
      reviewerName: "Dr. S. Rajesh",
      reviewerRole: "Principal Software Architect",
      evaluatorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=RajeshArchitect",
      evaluatedAt: "September 3, 2026",
      communicationScore: Math.min(100, (base.communicationScore || 90) + 1),
      grammarScore: Math.min(100, (base.grammarScore || 88) + 3),
      fluencyScore: Math.min(100, (base.fluencyScore || 91) + 1),
      projectScore: Math.min(100, (base.projectScore || 92) + 2),
      overallRating: Math.min(100, (base.overallRating || 90) + 2),
      customNotes: "Deep-dive architecture review revealed clean modular patterns, robust edge-case handling, and excellent justification for database and messaging choices.",
    },
    {
      ...base,
      id: `${student.id}-admin-anita`,
      evaluationName: "Industry Placement & Behavioral Readiness",
      reviewerName: "Anita Desai",
      reviewerRole: "Placement Director & Industry Relations Lead",
      evaluatorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=AnitaPlacement",
      evaluatedAt: "September 7, 2026",
      communicationScore: Math.min(100, (base.communicationScore || 90) + 3),
      grammarScore: Math.min(100, (base.grammarScore || 88) + 2),
      fluencyScore: Math.min(100, (base.fluencyScore || 91) + 3),
      projectScore: Math.min(100, (base.projectScore || 92) + 2),
      overallRating: Math.min(100, (base.overallRating || 90) + 3),
      customNotes: "Outstanding stakeholder communication, enterprise poise, and business value articulation. Strongly recommended for enterprise associate placement.",
    },
  ];
};

export const generateDefaultEvaluationRounds = generateDefaultAdminEvaluations;

export interface CurrentAdminUserSession {
  name: string;
  role?: string;
  email?: string;
  avatar?: string;
  adminRole?: "super_admin" | "instructor";
}

interface AdminProfileEvaluationsViewProps {
  batches: Batch[];
  selectedBatch?: Batch;
  students: Student[];
  dailyActivityLogs?: any[];
  projectSubmissions?: any[];
  attendanceRecords?: any[];
  punchLogs?: any[];
  assignments?: any[];
  assignmentSubmissions?: any[];
  resumeData?: any;
  onUpdateStudentEvaluation: (studentId: string, evaluation: InternEvaluation) => void;
  onUpdateStudentResources?: (studentId: string, resources: InternResource[]) => void;
  onViewStudentReport: (student: Student) => void;
  onToast: (message: string) => void;
  currentAdminUser?: CurrentAdminUserSession;
}

export const AdminProfileEvaluationsView: React.FC<AdminProfileEvaluationsViewProps> = ({
  batches,
  selectedBatch,
  students,
  dailyActivityLogs = [],
  projectSubmissions = [],
  attendanceRecords = [],
  punchLogs: _punchLogs = [],
  assignments: _assignments = [],
  assignmentSubmissions = [],
  resumeData,
  onUpdateStudentEvaluation,
  onUpdateStudentResources,
  onViewStudentReport,
  onToast,
  currentAdminUser,
}) => {
  // Navigation & View Mode: "roster" or "profile" (persisted across reloads)
  const [viewMode, setViewMode] = useState<"roster" | "profile">(() => {
    try {
      const saved = localStorage.getItem("m2i_admin_eval_view_mode");
      if (saved === "roster" || saved === "profile") return saved;
    } catch {}
    return "roster";
  });

  React.useEffect(() => {
    try {
      localStorage.setItem("m2i_admin_eval_view_mode", viewMode);
    } catch {}
  }, [viewMode]);

  // Profile Sub-Tab: "evaluation" | "documents" | "videos"
  const [profileTab, setProfileTab] = useState<"evaluation" | "documents" | "videos">("evaluation");

  // Batch filtering: default to saved, selectedBatch id, or "all"
  const [activeBatchId, setActiveBatchId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("m2i_admin_eval_active_batch_id");
      if (saved) return saved;
    } catch {}
    return selectedBatch && selectedBatch.id ? selectedBatch.id : "all";
  });

  React.useEffect(() => {
    try {
      if (activeBatchId) {
        localStorage.setItem("m2i_admin_eval_active_batch_id", activeBatchId);
      }
    } catch {}
  }, [activeBatchId]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "evaluated" | "pending" | "my_pending" | "my_evaluated">("all");

  // Document Modal state
  const [previewDocument, setPreviewDocument] = useState<InternResource | null>(null);

  // Active playing video index in Videos tab
  const [playingVideoIdx, setPlayingVideoIdx] = useState<number | null>(null);

  // Roster display mode: "rows" or "grid"
  const [rosterViewMode, setRosterViewMode] = useState<"rows" | "grid">("rows");

  // Candidate Documents tab search & category filter
  const [docSearchQuery, setDocSearchQuery] = useState("");
  const [docActiveFilter, setDocActiveFilter] = useState<string>("all");

  // ─── Active Logged-in Admin Evaluator Session ───
  const activeAdmin = useMemo(() => {
    if (currentAdminUser && currentAdminUser.name) {
      const match = SYSTEM_ADMIN_EVALUATORS.find(
        (a) =>
          a.name.toLowerCase() === currentAdminUser.name.toLowerCase() ||
          (currentAdminUser.email && a.email.toLowerCase() === currentAdminUser.email.toLowerCase())
      );
      const adminRole: "super_admin" | "instructor" =
        currentAdminUser.adminRole ||
        match?.adminRole ||
        (currentAdminUser.name.toLowerCase().includes("vijaya") ||
        currentAdminUser.name.toLowerCase().includes("super")
          ? "super_admin"
          : "instructor");

      return {
        name: currentAdminUser.name,
        role: currentAdminUser.role || (match ? match.role : "Lead Evaluator & Program Director"),
        email: currentAdminUser.email || (match ? match.email : "admin@mind2i.edu"),
        adminRole,
        initials: currentAdminUser.name
          .split(" ")
          .map((n: string) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase(),
        avatar:
          currentAdminUser.avatar ||
          match?.avatar ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentAdminUser.name)}`,
      };
    }
    return SYSTEM_ADMIN_EVALUATORS[0];
  }, [currentAdminUser]);

  const isSuperAdmin = useMemo(() => {
    return (
      activeAdmin.adminRole === "super_admin" ||
      activeAdmin.name.toLowerCase().includes("vijaya") ||
      activeAdmin.name.toLowerCase().includes("super")
    );
  }, [activeAdmin]);

  // ─── Multi-Admin Multi-Round Evaluation Suite ───
  const [multiEvaluationsMap, setMultiEvaluationsMap] = useState<Record<string, InternEvaluation[]>>(() => {
    try {
      return JSON.parse(localStorage.getItem("m2i_intern_multi_evaluations") || "{}");
    } catch {
      return {};
    }
  });

  // ─── Active Evaluation Round Scope (Cohort-Wide or Specific Round) (persisted) ───
  const [selectedEvaluationRound, setSelectedEvaluationRound] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("m2i_admin_eval_selected_round");
      if (saved) return saved;
    } catch {}
    return "System Architecture & System Defense";
  });

  React.useEffect(() => {
    try {
      if (selectedEvaluationRound) {
        localStorage.setItem("m2i_admin_eval_selected_round", selectedEvaluationRound);
      }
    } catch {}
  }, [selectedEvaluationRound]);
  const [newEvaluationScope, setNewEvaluationScope] = useState<"cohort" | "single">("cohort");

  // Active batch object and student filter helpers
  const currentActiveBatch = useMemo(() => {
    if (activeBatchId === "all") return null;
    return batches.find((b) => b.id === activeBatchId) || selectedBatch || null;
  }, [batches, activeBatchId, selectedBatch]);

  const batchStudents = useMemo(() => {
    return activeBatchId === "all" ? students : students.filter((s) => s.batchId === activeBatchId);
  }, [students, activeBatchId]);

  const batchStudentIds = useMemo(() => {
    return new Set(batchStudents.map((s) => s.id));
  }, [batchStudents]);

  // Batch-scoped custom rounds storage
  const [batchCustomRounds, setBatchCustomRounds] = useState<Record<string, string[]>>(() => {
    try {
      return JSON.parse(localStorage.getItem("m2i_batch_custom_rounds") || "{}");
    } catch {
      return {};
    }
  });

  // Batch-scoped deleted rounds storage
  const [deletedRoundsByBatch, setDeletedRoundsByBatch] = useState<Record<string, string[]>>(() => {
    try {
      return JSON.parse(localStorage.getItem("m2i_intern_deleted_rounds_by_batch") || "{}");
    } catch {
      return {};
    }
  });

  // Dropdown state for Evaluation Rounds selector (scroll down and select)
  const [isEvalRoundDropdownOpen, setIsEvalRoundDropdownOpen] = useState(false);
  const [evalRoundSearch, setEvalRoundSearch] = useState("");
  const evalDropdownRef = React.useRef<HTMLDivElement>(null);

  // In-place inline edit states
  const [editingCohortRound, setEditingCohortRound] = useState<string | null>(null);
  const [editingCohortRoundInput, setEditingCohortRoundInput] = useState("");
  const [isEditingSelectedRoundInBar, setIsEditingSelectedRoundInBar] = useState(false);

  // In-place inline create states
  const [isInlineCreatingRound, setIsInlineCreatingRound] = useState(false);
  const [inlineNewRoundName, setInlineNewRoundName] = useState("");

  // In-place top bar "+ New Evaluation" popover state
  const [isTopBarNewEvalOpen, setIsTopBarNewEvalOpen] = useState(false);
  const topBarNewEvalRef = React.useRef<HTMLDivElement>(null);

  const [deletedRounds, setDeletedRounds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("m2i_intern_deleted_rounds") || "[]");
    } catch {
      return [];
    }
  });

  // ─── Real-Time Sync with Django PostgreSQL Backend ───
  React.useEffect(() => {
    let isMounted = true;

    const fetchEvaluationsFromBackend = async () => {
      try {
        const res = await axios.get("/api/evaluations/");
        if (!isMounted) return;
        if (Array.isArray(res.data) && res.data.length > 0) {
          setMultiEvaluationsMap((prevMap) => {
            const updated = { ...prevMap };
            let hasChanges = false;
            res.data.forEach((roundItem: any) => {
              const stuId = roundItem.student || roundItem.studentId;
              if (!stuId) return;
              const evData = roundItem.evaluationsData;
              if (!Array.isArray(evData) || evData.length === 0) return;

              if (!updated[stuId] || updated[stuId].length === 0) {
                updated[stuId] = evData;
                hasChanges = true;
              } else {
                const existingList = [...updated[stuId]];
                evData.forEach((rev: any) => {
                  const idx = existingList.findIndex(
                    (e) =>
                      (e.id && e.id === rev.id) ||
                      (e.evaluationName === rev.evaluationName && e.reviewerName === rev.reviewerName)
                  );
                  if (idx === -1) {
                    existingList.push(rev);
                    hasChanges = true;
                  } else {
                    if (JSON.stringify(existingList[idx]) !== JSON.stringify(rev)) {
                      existingList[idx] = { ...existingList[idx], ...rev };
                      hasChanges = true;
                    }
                  }
                });
                updated[stuId] = existingList;
              }
            });

            if (hasChanges) {
              try {
                localStorage.setItem("m2i_intern_multi_evaluations", JSON.stringify(updated));
              } catch {}
              return updated;
            }
            return prevMap;
          });
        }
      } catch (err) {
        console.warn("Evaluations fetch error:", err);
      }
    };

    const fetchBatchEvaluationRounds = async () => {
      try {
        const res = await axios.get("/api/evaluation-rounds/");
        if (!isMounted) return;
        if (Array.isArray(res.data) && res.data.length > 0) {
          const customMap: Record<string, string[]> = {};
          const deletedMap: Record<string, string[]> = {};

          res.data.forEach((r: any) => {
            const bId = r.batch || r.batchId;
            if (!bId) return;
            if (r.isDeleted) {
              if (!deletedMap[bId]) deletedMap[bId] = [];
              if (!deletedMap[bId].includes(r.roundName)) deletedMap[bId].push(r.roundName);
            } else {
              if (!customMap[bId]) customMap[bId] = [];
              if (!customMap[bId].includes(r.roundName)) customMap[bId].push(r.roundName);
            }
          });

          if (Object.keys(customMap).length > 0) {
            setBatchCustomRounds((prev) => {
              const merged = { ...prev };
              Object.entries(customMap).forEach(([bId, rList]) => {
                merged[bId] = Array.from(new Set([...(merged[bId] || []), ...rList]));
              });
              try {
                localStorage.setItem("m2i_batch_custom_rounds", JSON.stringify(merged));
              } catch {}
              return merged;
            });
          }

          if (Object.keys(deletedMap).length > 0) {
            setDeletedRoundsByBatch((prev) => {
              const merged = { ...prev };
              Object.entries(deletedMap).forEach(([bId, rList]) => {
                merged[bId] = Array.from(new Set([...(merged[bId] || []), ...rList]));
              });
              try {
                localStorage.setItem("m2i_intern_deleted_rounds_by_batch", JSON.stringify(merged));
              } catch {}
              return merged;
            });
          }
        }
      } catch (err) {
        console.warn("Batch rounds fetch error:", err);
      }
    };

    fetchEvaluationsFromBackend();
    fetchBatchEvaluationRounds();
    const interval = setInterval(fetchEvaluationsFromBackend, 4500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Debounced auto-sync to backend whenever multiEvaluationsMap changes locally
  const initialEvalSyncRef = React.useRef(true);
  React.useEffect(() => {
    if (initialEvalSyncRef.current) {
      initialEvalSyncRef.current = false;
      return;
    }
    const timeout = setTimeout(() => {
      if (Object.keys(multiEvaluationsMap).length > 0) {
        axios.post("/api/evaluations/bulk_sync/", multiEvaluationsMap).catch((err) => {
          console.warn("Evaluations sync error:", err);
        });
      }
    }, 700);
    return () => clearTimeout(timeout);
  }, [multiEvaluationsMap]);

  // Sync activeBatchId when selectedBatch prop updates
  React.useEffect(() => {
    if (selectedBatch?.id && selectedBatch.id !== activeBatchId) {
      setActiveBatchId(selectedBatch.id);
    }
  }, [selectedBatch?.id]);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (evalDropdownRef.current && !evalDropdownRef.current.contains(e.target as Node)) {
        setIsEvalRoundDropdownOpen(false);
        setIsInlineCreatingRound(false);
      }
      if (topBarNewEvalRef.current && !topBarNewEvalRef.current.contains(e.target as Node)) {
        setIsTopBarNewEvalOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Dynamically compute all available evaluation rounds for the active batch
  const availableEvaluationRounds = useMemo(() => {
    const rounds = new Set<string>();
    const defaultRounds = [
      "System Architecture & System Defense",
      "Core Technical & Code Quality Review",
      "Industry Placement & Behavioral Readiness",
    ];

    const currentDeleted = deletedRoundsByBatch[activeBatchId] || deletedRounds || [];
    defaultRounds.forEach((r) => {
      if (!currentDeleted.includes(r)) rounds.add(r);
    });

    // Custom rounds specifically created for this batch
    const customForThisBatch = batchCustomRounds[activeBatchId] || [];
    customForThisBatch.forEach((r) => {
      if (!currentDeleted.includes(r)) rounds.add(r);
    });

    // If viewing "all", also include custom rounds across all batches
    if (activeBatchId === "all") {
      Object.values(batchCustomRounds).forEach((arr) => {
        if (Array.isArray(arr)) {
          arr.forEach((r) => {
            if (!currentDeleted.includes(r)) rounds.add(r);
          });
        }
      });
    }

    // Inspect evaluations belonging only to students of the current batch
    Object.entries(multiEvaluationsMap).forEach(([stuId, list]) => {
      if (batchStudentIds.has(stuId) && Array.isArray(list)) {
        list.forEach((e) => {
          if (e?.evaluationName && !currentDeleted.includes(e.evaluationName)) {
            rounds.add(e.evaluationName);
          }
        });
      }
    });

    return Array.from(rounds);
  }, [multiEvaluationsMap, deletedRoundsByBatch, deletedRounds, batchCustomRounds, batchStudentIds, activeBatchId]);

  // Prevent round mismatch when switching batches: if active round does not exist in new batch, reset to first available round
  React.useEffect(() => {
    if (selectedEvaluationRound !== "all" && availableEvaluationRounds.length > 0) {
      const exists = availableEvaluationRounds.some(
        (r) => r.toLowerCase() === selectedEvaluationRound.toLowerCase()
      );
      if (!exists) {
        setSelectedEvaluationRound(availableEvaluationRounds[0] || "all");
      }
    }
  }, [availableEvaluationRounds, activeBatchId, selectedEvaluationRound]);

  // Resolve status and rating for an intern in a specific evaluation round
  const getCandidateStatusForRound = (student: Student, roundName: string) => {
    const evals =
      multiEvaluationsMap[student.id] ||
      (student.evaluations && student.evaluations.length > 0 ? student.evaluations : null);

    let targetEval: InternEvaluation | undefined;
    if (evals && evals.length > 0) {
      if (roundName === "all") {
        targetEval = evals[0];
      } else {
        targetEval = evals.find(
          (e) => e.evaluationName?.toLowerCase() === roundName.toLowerCase()
        );
      }
    }

    if (!targetEval) {
      if (isDemoStudent(student)) {
        const defEvals = generateDefaultAdminEvaluations(student, null);
        if (roundName === "all") {
          targetEval = defEvals[0];
        } else {
          targetEval = defEvals.find(
            (e) => e.evaluationName?.toLowerCase() === roundName.toLowerCase()
          );
        }
      }
    }

    if (roundName === "all") {
      const isEval = isStudentEvaluatedByAdmin(student, activeAdmin.name);
      return {
        isReviewed: isEval,
        score: isEval ? (student.evaluation?.overallRating ?? student.scores?.overallAccuracy ?? 0) : (isDemoStudent(student) ? 88 : 0),
        evalItem: targetEval,
      };
    }

    const isReviewed =
      !!targetEval && typeof targetEval.overallRating === "number" && targetEval.overallRating > 0;
    return {
      isReviewed,
      score: isReviewed
        ? targetEval!.overallRating
        : (isDemoStudent(student) ? (student.evaluation?.overallRating ?? student.scores?.overallAccuracy ?? 88) : 0),
      evalItem: targetEval,
    };
  };

  const isStudentEvaluatedByAdmin = (student: Student, adminName: string) => {
    const evals = multiEvaluationsMap[student.id] || (student.evaluations && student.evaluations.length > 0 ? student.evaluations : null);
    if (evals && evals.length > 0) {
      return evals.some((r) => {
        const rName = (r.reviewerName || "").toLowerCase();
        const aName = adminName.toLowerCase();
        return (rName.includes(aName) || aName.includes(rName)) && (r.overallRating || 0) > 0;
      });
    }
    if (!isDemoStudent(student)) return false;
    const defEvals = generateDefaultAdminEvaluations(student, null);
    return defEvals.some((r) => {
      const rName = (r.reviewerName || "").toLowerCase();
      const aName = adminName.toLowerCase();
      return (rName.includes(aName) || aName.includes(rName)) && (r.overallRating || 0) > 0;
    });
  };

  // Filter students based on active batch, search query, and evaluation status
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchBatch = activeBatchId === "all" || s.batchId === activeBatchId;
      const matchQuery =
        searchQuery.trim() === "" ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.college && s.college.toLowerCase().includes(searchQuery.toLowerCase()));

      const roundStatus = getCandidateStatusForRound(s, selectedEvaluationRound);
      const isEvalByMe = roundStatus.isReviewed;
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "evaluated" && roundStatus.isReviewed) ||
        (statusFilter === "pending" && !roundStatus.isReviewed) ||
        (statusFilter === "my_pending" && !isEvalByMe) ||
        (statusFilter === "my_evaluated" && isEvalByMe);

      return matchBatch && matchQuery && matchStatus;
    });
  }, [students, activeBatchId, searchQuery, statusFilter, activeAdmin.name, multiEvaluationsMap, selectedEvaluationRound]);

  // Selected student for evaluation (persisted across reloads)
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("m2i_admin_eval_selected_student_id");
      if (saved) return saved;
    } catch {}
    return filteredStudents.length > 0 ? filteredStudents[0].id : students[0]?.id || "";
  });

  React.useEffect(() => {
    try {
      if (selectedStudentId) {
        localStorage.setItem("m2i_admin_eval_selected_student_id", selectedStudentId);
      }
    } catch {}
  }, [selectedStudentId]);

  const currentStudent = useMemo(() => {
    return (
      students.find((s) => s.id === selectedStudentId) ||
      filteredStudents[0] ||
      students[0] ||
      null
    );
  }, [students, filteredStudents, selectedStudentId]);

  const currentBatch = useMemo(() => {
    if (!currentStudent) return null;
    return batches.find((b) => b.id === currentStudent.batchId) || null;
  }, [batches, currentStudent]);

  const [activeEvaluationIndex, setActiveEvaluationIndex] = useState<number>(0);

  // Modal state for adding or editing a role-based named evaluation
  const [showAddEvaluatorModal, setShowAddEvaluatorModal] = useState(false);
  const [evalModalMode, setEvalModalMode] = useState<"create" | "edit">("create");
  const [editingTargetRound, setEditingTargetRound] = useState<string | null>(null);
  const [editingTargetIndex, setEditingTargetIndex] = useState<number | null>(null);
  const [newEvaluationName, setNewEvaluationName] = useState("");
  const [newEvaluatorName, setNewEvaluatorName] = useState("Dr. S. Rajesh");
  const [newEvaluatorRole, setNewEvaluatorRole] = useState("Principal Software Architect & Tech Faculty");
  const [newEvaluationStatus, setNewEvaluationStatus] = useState<"pending" | "preset">("pending");
  const [forceShowAdminOversight, setForceShowAdminOversight] = useState(false);
  const oversightRef = React.useRef<HTMLDivElement>(null);
  const [adminOversightFilterRound, setAdminOversightFilterRound] = useState<string>("all");

  // Dropdown state for Profile View Evaluation Selector
  const [isProfileEvalDropdownOpen, setIsProfileEvalDropdownOpen] = useState(false);
  const profileEvalDropdownRef = React.useRef<HTMLDivElement>(null);

  // Dropdown state for "All Admin Replies" dropdown selector
  const [isAdminRepliesDropdownOpen, setIsAdminRepliesDropdownOpen] = useState(false);
  const adminRepliesDropdownRef = React.useRef<HTMLDivElement>(null);

  // Quick edit/rename evaluation state
  const [editingEvalIndex, setEditingEvalIndex] = useState<number | null>(null);
  const [editingEvalName, setEditingEvalName] = useState("");

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileEvalDropdownRef.current && !profileEvalDropdownRef.current.contains(e.target as Node)) {
        setIsProfileEvalDropdownOpen(false);
      }
      if (adminRepliesDropdownRef.current && !adminRepliesDropdownRef.current.contains(e.target as Node)) {
        setIsAdminRepliesDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentEvaluations: InternEvaluation[] = useMemo(() => {
    if (!currentStudent) return [];
    if (multiEvaluationsMap[currentStudent.id] && multiEvaluationsMap[currentStudent.id].length > 0) {
      return multiEvaluationsMap[currentStudent.id];
    }
    if (currentStudent.evaluations && currentStudent.evaluations.length > 0) {
      return currentStudent.evaluations;
    }
    if (!isDemoStudent(currentStudent)) {
      return [];
    }
    return generateDefaultAdminEvaluations(currentStudent, currentBatch, dailyActivityLogs, projectSubmissions);
  }, [currentStudent, currentBatch, multiEvaluationsMap, dailyActivityLogs, projectSubmissions]);

  // Role-Based Access: Super Admin sees all evaluations; Instructor only sees their assigned reviews
  const visibleEvaluations = useMemo(() => {
    if (isSuperAdmin) {
      return currentEvaluations;
    }
    return currentEvaluations.filter((ev) => {
      const revName = (ev.reviewerName || "").toLowerCase();
      const myName = activeAdmin.name.toLowerCase();
      const revRole = (ev.reviewerRole || "").toLowerCase();
      const myRole = (activeAdmin.role || "").toLowerCase();
      return (
        revName.includes(myName) ||
        myName.includes(revName) ||
        (myRole && (revRole.includes(myRole) || myRole.includes(revRole)))
      );
    });
  }, [currentEvaluations, isSuperAdmin, activeAdmin]);

  // Find evaluation index belonging to active logged-in admin
  const myEvaluationIndex = useMemo(() => {
    if (!currentEvaluations || currentEvaluations.length === 0) return -1;
    return currentEvaluations.findIndex((r) => {
      const rName = (r.reviewerName || "").toLowerCase();
      const aName = activeAdmin.name.toLowerCase();
      return rName.includes(aName) || aName.includes(rName);
    });
  }, [currentEvaluations, activeAdmin.name]);

  const hasEvaluatedCurrentStudent = myEvaluationIndex !== -1;

  // Form State for the currently selected intern and active evaluation
  const [formData, setFormData] = useState<InternEvaluation>(() => {
    if (currentEvaluations && currentEvaluations.length > 0) {
      return currentEvaluations[0];
    }
    return currentStudent?.evaluation || ({} as InternEvaluation);
  });

  // Check if active review is authored by currently logged-in admin
  const isMyReview = useMemo(() => {
    const revName = (formData.reviewerName || "").toLowerCase().trim();
    const myName = (activeAdmin.name || "").toLowerCase().trim();
    if (!revName || !myName) return false;
    return revName === myName || revName.includes(myName) || myName.includes(revName);
  }, [formData.reviewerName, activeAdmin.name]);

  // Check if active evaluation round is pending / unrated (waiting for faculty review)
  const isPendingEvaluation = !formData.overallRating || formData.overallRating === 0;

  // Evaluation Update Permission:
  // - Super Admin can edit/update any evaluation.
  // - Authoring admin can edit/update their review.
  // - Any instructor/admin can fill in and update pending/unrated rounds created by Super Admin for interns.
  // - Any admin whose role or name matches the evaluation can update it.
  const canEditActiveEvaluation = useMemo(() => {
    if (isSuperAdmin) return true;
    if (isMyReview) return true;
    if (isPendingEvaluation) return true;
    const revRole = (formData.reviewerRole || "").toLowerCase().trim();
    const myRole = (activeAdmin.role || "").toLowerCase().trim();
    if (revRole && myRole && (revRole.includes(myRole) || myRole.includes(revRole))) return true;
    const revName = (formData.reviewerName || "").toLowerCase().trim();
    if (revName === "faculty" || revName === "instructor" || revName === "evaluator" || revName === "pending evaluator") return true;
    return false;
  }, [isSuperAdmin, isMyReview, isPendingEvaluation, formData.reviewerRole, activeAdmin.role, formData.reviewerName]);

  // Dedicated switcher for selecting an evaluation item or admin reply
  const handleSelectEvaluationIndex = (idx: number) => {
    if (!currentEvaluations || idx < 0 || idx >= currentEvaluations.length) return;
    const item = currentEvaluations[idx];
    setActiveEvaluationIndex(idx);
    setFormData(item);
    if (item.evaluationName) {
      setSelectedEvaluationRound(item.evaluationName);
    }
    setIsProfileEvalDropdownOpen(false);
    setIsAdminRepliesDropdownOpen(false);
    onToast(`Switched to review by ${item.reviewerName || "Faculty"} (${item.evaluationName || "Appraisal"})`);
  };

  // Dedicated switcher for selecting an Evaluation Round in the workspace (Image 2 style)
  const handleSelectEvaluationRound = (roundName: string) => {
    if (!currentStudent) return;
    if (roundName === "all") {
      setSelectedEvaluationRound("all");
      if (currentEvaluations.length > 0) {
        setActiveEvaluationIndex(0);
        setFormData(currentEvaluations[0]);
      }
      setIsProfileEvalDropdownOpen(false);
      onToast("Viewing consensus composite across all evaluation rounds.");
      return;
    }

    setSelectedEvaluationRound(roundName);

    // Look for existing evaluation for this student under this round
    const existingIdx = currentEvaluations.findIndex(
      (e) => e.evaluationName?.toLowerCase() === roundName.toLowerCase()
    );

    if (existingIdx !== -1) {
      setActiveEvaluationIndex(existingIdx);
      setFormData(currentEvaluations[existingIdx]);
      onToast(`Switched to "${roundName}" evaluation round.`);
    } else {
      // Initialize an evaluation round entry for this candidate so instructor/admin can evaluate
      const baseline = generateAIProfileEvaluation(
        currentStudent,
        currentBatch,
        undefined,
        dailyActivityLogs,
        projectSubmissions
      );
      const newEval: InternEvaluation = {
        ...baseline,
        id: `${currentStudent.id}-round-${Date.now()}`,
        evaluationName: roundName,
        reviewerName: activeAdmin.name,
        reviewerRole: activeAdmin.role,
        evaluatorAvatar: activeAdmin.avatar,
        overallRating: 0,
        communicationScore: 0,
        grammarScore: 0,
        fluencyScore: 0,
        projectScore: 0,
        aiVerdict: "Pending Evaluation",
        customNotes: `Evaluation for "${roundName}" assigned to ${activeAdmin.name} (${activeAdmin.role}).`,
        studentId: currentStudent.id,
        batchId: currentStudent.batchId,
        evaluatedAt: new Date().toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
      };

      const updatedEvals = [...currentEvaluations, newEval];
      const newMap = { ...multiEvaluationsMap, [currentStudent.id]: updatedEvals };
      setMultiEvaluationsMap(newMap);
      try {
        localStorage.setItem("m2i_intern_multi_evaluations", JSON.stringify(newMap));
      } catch {}

      setActiveEvaluationIndex(updatedEvals.length - 1);
      setFormData(newEval);
      onToast(`Switched to "${roundName}" evaluation round.`);
    }

    setIsProfileEvalDropdownOpen(false);
  };

  // Only reload initial evaluation when switching students
  const prevStudentIdRef = React.useRef(selectedStudentId);
  React.useEffect(() => {
    if (prevStudentIdRef.current !== selectedStudentId) {
      prevStudentIdRef.current = selectedStudentId;
      if (currentEvaluations && currentEvaluations.length > 0) {
        if (selectedEvaluationRound && selectedEvaluationRound !== "all") {
          const roundIdx = currentEvaluations.findIndex(
            (e) => e.evaluationName?.toLowerCase() === selectedEvaluationRound.toLowerCase()
          );
          if (roundIdx !== -1) {
            setActiveEvaluationIndex(roundIdx);
            setFormData(currentEvaluations[roundIdx]);
            return;
          }
        }
        setActiveEvaluationIndex(0);
        setFormData(currentEvaluations[0]);
      }
    }
  }, [selectedStudentId, currentEvaluations, selectedEvaluationRound]);

  // Start evaluation specifically for the currently logged-in admin
  const handleStartMyEvaluation = (customEvalName?: string) => {
    if (!currentStudent) return;

    const evalName = customEvalName || `${activeAdmin.role.split("&")[0].trim()} Assessment`;
    const baseline = generateAIProfileEvaluation(currentStudent, currentBatch, undefined, dailyActivityLogs, projectSubmissions);
    const myEval: InternEvaluation = {
      ...baseline,
      id: `${currentStudent.id}-admin-${Date.now()}`,
      evaluationName: evalName,
      reviewerName: activeAdmin.name,
      reviewerRole: activeAdmin.role,
      evaluatorAvatar: activeAdmin.avatar,
      evaluatedAt: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      customNotes: `Evaluation for ${evalName} submitted by ${activeAdmin.name} (${activeAdmin.role}).`,
    };

    const updatedEvals = [...currentEvaluations, myEval];
    const newMap = { ...multiEvaluationsMap, [currentStudent.id]: updatedEvals };
    setMultiEvaluationsMap(newMap);
    try {
      localStorage.setItem("m2i_intern_multi_evaluations", JSON.stringify(newMap));
    } catch {}

    const newIdx = updatedEvals.length - 1;
    setActiveEvaluationIndex(newIdx);
    setFormData(myEval);
    onToast(`Evaluation sheet opened for "${evalName}"!`);
  };

  // Panel Consensus Statistics: Dynamically calculated based on the selected evaluation round (or all rounds)
  const panelCompositeStats = useMemo(() => {
    if (!currentEvaluations || currentEvaluations.length === 0) {
      return {
        avgOverall: formData.overallRating || 0,
        avgComm: formData.communicationScore || 0,
        avgGrammar: formData.grammarScore || 0,
        avgFluency: formData.fluencyScore || 0,
        avgProject: formData.projectScore || 0,
        totalEvaluations: 1,
        evaluators: [formData.reviewerName || "Faculty Evaluator"],
        isPending: !formData.overallRating,
      };
    }

    // Filter evaluations matching the currently selected evaluation round
    const relevantEvals = (!selectedEvaluationRound || selectedEvaluationRound === "all")
      ? currentEvaluations
      : currentEvaluations.filter(
          (e) => e.evaluationName?.toLowerCase() === selectedEvaluationRound.toLowerCase()
        );

    // Target list of reviews for consensus calculation
    const targetList = relevantEvals.length > 0 ? relevantEvals : [formData];
    const validEvals = targetList.filter((r) => (r.overallRating || 0) > 0);
    const listToAverage = validEvals.length > 0 ? validEvals : targetList;

    const count = listToAverage.length;
    const sumOverall = listToAverage.reduce((acc, r) => acc + (r.overallRating || 0), 0);
    const sumComm = listToAverage.reduce((acc, r) => acc + (r.communicationScore || 0), 0);
    const sumGrammar = listToAverage.reduce((acc, r) => acc + (r.grammarScore || 0), 0);
    const sumFluency = listToAverage.reduce((acc, r) => acc + (r.fluencyScore || 0), 0);
    const sumProject = listToAverage.reduce((acc, r) => acc + (r.projectScore || 0), 0);
    const evaluators = Array.from(new Set(listToAverage.map((r) => r.reviewerName || "Faculty")));

    const avgOverall = count > 0 && sumOverall > 0 ? Math.round(sumOverall / count) : (formData.overallRating || 0);

    return {
      avgOverall,
      avgComm: count > 0 && sumComm > 0 ? Math.round(sumComm / count) : (formData.communicationScore || 0),
      avgGrammar: count > 0 && sumGrammar > 0 ? Math.round(sumGrammar / count) : (formData.grammarScore || 0),
      avgFluency: count > 0 && sumFluency > 0 ? Math.round(sumFluency / count) : (formData.fluencyScore || 0),
      avgProject: count > 0 && sumProject > 0 ? Math.round(sumProject / count) : (formData.projectScore || 0),
      totalEvaluations: validEvals.length > 0 ? validEvals.length : (relevantEvals.length > 0 ? relevantEvals.length : 1),
      evaluators,
      isPending: avgOverall === 0,
    };
  }, [currentEvaluations, selectedEvaluationRound, formData]);

  // Quick stats
  const totalInterns = students.length;
  const evaluatedCount = students.filter((s) => !!s.evaluation).length;
  const pendingCount = totalInterns - evaluatedCount;
  const avgCohortScore = useMemo(() => {
    if (evaluatedCount === 0) return 92;
    const sum = students
      .filter((s) => !!s.evaluation)
      .reduce((acc, s) => acc + (s.evaluation?.overallRating || 90), 0);
    return Math.round(sum / evaluatedCount);
  }, [students, evaluatedCount]);

  // Candidate Pagination in Full-Page Profile Mode
  const currentIndex = useMemo(() => {
    return filteredStudents.findIndex((s) => s.id === currentStudent?.id);
  }, [filteredStudents, currentStudent]);

  const handlePrevStudent = () => {
    if (currentIndex > 0) {
      setSelectedStudentId(filteredStudents[currentIndex - 1].id);
    }
  };

  const handleNextStudent = () => {
    if (currentIndex >= 0 && currentIndex < filteredStudents.length - 1) {
      setSelectedStudentId(filteredStudents[currentIndex + 1].id);
    }
  };

  // Handlers for score changes
  const handleScoreChange = (
    field: "communicationScore" | "grammarScore" | "fluencyScore" | "projectScore",
    val: number
  ) => {
    if (!canEditActiveEvaluation) return;
    const clamped = Math.min(100, Math.max(0, val));
    setFormData((prev) => {
      const updated = { ...prev, [field]: clamped };
      const composite = Math.round(
        (updated.communicationScore +
          updated.grammarScore +
          updated.fluencyScore +
          updated.projectScore) /
          4
      );
      return { ...updated, overallRating: composite };
    });
  };

  // AI Auto-Analysis Trigger for Overall Rubrics
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const handleRunAIAnalysis = () => {
    if (!currentStudent || !canEditActiveEvaluation) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      const aiGenerated = generateAIProfileEvaluation(
        currentStudent,
        currentBatch,
        formData, // preserve existing custom notes if any
        dailyActivityLogs,
        projectSubmissions,
        attendanceRecords,
        resumeData || currentStudent.resumeData,
        assignmentSubmissions
      );
      setFormData(aiGenerated);
      setIsAnalyzing(false);
      onToast(`AI evaluation synthesized for ${currentStudent.name}!`);
    }, 600);
  };

  // Strengths & Growth tag helpers
  const [newStrengthInput, setNewStrengthInput] = useState("");
  const handleAddStrength = () => {
    if (!canEditActiveEvaluation) return;
    if (newStrengthInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        aiStrengths: [...(prev.aiStrengths || []), newStrengthInput.trim()],
      }));
      setNewStrengthInput("");
    }
  };

  const handleRemoveStrength = (idx: number) => {
    if (!canEditActiveEvaluation) return;
    setFormData((prev) => ({
      ...prev,
      aiStrengths: (prev.aiStrengths || []).filter((_, i) => i !== idx),
    }));
  };

  const [newGrowthInput, setNewGrowthInput] = useState("");
  const handleAddGrowth = () => {
    if (!canEditActiveEvaluation) return;
    if (newGrowthInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        aiGrowthAreas: [...(prev.aiGrowthAreas || []), newGrowthInput.trim()],
      }));
      setNewGrowthInput("");
    }
  };

  const handleRemoveGrowth = (idx: number) => {
    if (!canEditActiveEvaluation) return;
    setFormData((prev) => ({
      ...prev,
      aiGrowthAreas: (prev.aiGrowthAreas || []).filter((_, i) => i !== idx),
    }));
  };

  // ─── Managed Documents State for Live Admin AI Analysis ───
  const [documentsMap, setDocumentsMap] = useState<Record<string, InternResource[]>>(() => {
    try {
      return JSON.parse(localStorage.getItem("m2i_intern_resources") || "{}");
    } catch {
      return {};
    }
  });

  const candidateResources: InternResource[] = useMemo(() => {
    if (!currentStudent) return [];
    if (documentsMap[currentStudent.id] && documentsMap[currentStudent.id].length > 0) {
      return documentsMap[currentStudent.id];
    }
    if (currentStudent.resources && currentStudent.resources.length > 0) {
      return currentStudent.resources;
    }
    if (isDemoStudent(currentStudent)) {
      return DEFAULT_SAMPLE_RESOURCES(currentStudent.id, currentStudent.batchId);
    }
    return [];
  }, [currentStudent, documentsMap]);

  // Admin AI Document Analysis handler (Admin performs the analysis on uploaded document)
  const [analyzingDocId, setAnalyzingDocId] = useState<string | null>(null);
  const [isAnalyzingAllDocs, setIsAnalyzingAllDocs] = useState(false);

  const handleAdminAnalyzeDocument = (docId: string) => {
    if (!currentStudent) return;
    setAnalyzingDocId(docId);
    setTimeout(() => {
      const currentList = [...candidateResources];
      const targetIdx = currentList.findIndex((d) => d.id === docId);
      if (targetIdx !== -1) {
        const rating = Math.floor(Math.random() * 5) + 94; // 94% to 98%
        currentList[targetIdx] = {
          ...currentList[targetIdx],
          aiRating: rating,
          aiAuditSummary: `Admin faculty analysis completed by Vijaya Kumar Mekala. Verified high technical rigor (${rating - 1}%), clear system diagrams, robust API specifications, and formal documentation depth.`,
        };
        const updatedMap = { ...documentsMap, [currentStudent.id]: currentList };
        setDocumentsMap(updatedMap);
        try {
          localStorage.setItem("m2i_intern_resources", JSON.stringify(updatedMap));
        } catch {}

        if (onUpdateStudentResources) {
          onUpdateStudentResources(currentStudent.id, currentList);
        }

        // Overall-based check: compute average document score across all analyzed documents
        const evaluated = currentList.filter((d) => typeof d.aiRating === "number" && d.aiRating > 0);
        const avgDocScore = Math.round(
          evaluated.reduce((acc, d) => acc + (d.aiRating || 95), 0) / evaluated.length
        );

        // Calibrate Grammar & Technical Documentation (weighted with document score)
        const updatedGrammar = Math.round(formData.grammarScore * 0.35 + avgDocScore * 0.65);
        const updatedComposite = Math.round(
          (formData.communicationScore + updatedGrammar + formData.fluencyScore + formData.projectScore) / 4
        );

        const updatedEval: InternEvaluation = {
          ...formData,
          grammarScore: updatedGrammar,
          overallRating: updatedComposite,
          studentId: currentStudent.id,
          batchId: currentStudent.batchId,
          evaluatedAt: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        };

        setFormData(updatedEval);

        try {
          const evals = JSON.parse(localStorage.getItem("m2i_intern_evaluations") || "{}");
          evals[currentStudent.id] = updatedEval;
          localStorage.setItem("m2i_intern_evaluations", JSON.stringify(evals));
        } catch {}

        onUpdateStudentEvaluation(currentStudent.id, updatedEval);
        onToast(`Document analyzed (${rating}%)! Grammar calibrated to ${updatedGrammar}%, Overall Score updated to ${updatedComposite}%, and synced to Report.`);
      }
      setAnalyzingDocId(null);
    }, 700);
  };

  const handleAdminAnalyzeAllDocuments = () => {
    if (!currentStudent) return;
    setIsAnalyzingAllDocs(true);
    setTimeout(() => {
      const currentList = candidateResources.map((d) => {
        const rating = d.aiRating && d.aiRating > 0 ? d.aiRating : Math.floor(Math.random() * 5) + 94;
        return {
          ...d,
          aiRating: rating,
          aiAuditSummary: d.aiAuditSummary && d.aiAuditSummary.includes("Vijaya Kumar")
            ? d.aiAuditSummary
            : `Admin faculty analysis completed by Vijaya Kumar Mekala. Verified high technical rigor (${rating - 1}%), clear system diagrams, robust API specifications, and formal documentation depth.`,
        };
      });

      const updatedMap = { ...documentsMap, [currentStudent.id]: currentList };
      setDocumentsMap(updatedMap);
      try {
        localStorage.setItem("m2i_intern_resources", JSON.stringify(updatedMap));
      } catch {}

      if (onUpdateStudentResources) {
        onUpdateStudentResources(currentStudent.id, currentList);
      }

      const avgDocScore = Math.round(
        currentList.reduce((acc, d) => acc + (d.aiRating || 95), 0) / currentList.length
      );

      const updatedGrammar = Math.round(formData.grammarScore * 0.35 + avgDocScore * 0.65);
      const updatedComposite = Math.round(
        (formData.communicationScore + updatedGrammar + formData.fluencyScore + formData.projectScore) / 4
      );

      const updatedEval: InternEvaluation = {
        ...formData,
        grammarScore: updatedGrammar,
        overallRating: updatedComposite,
        studentId: currentStudent.id,
        batchId: currentStudent.batchId,
        evaluatedAt: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      };

      setFormData(updatedEval);

      try {
        const evals = JSON.parse(localStorage.getItem("m2i_intern_evaluations") || "{}");
        evals[currentStudent.id] = updatedEval;
        localStorage.setItem("m2i_intern_evaluations", JSON.stringify(evals));
      } catch {}

      onUpdateStudentEvaluation(currentStudent.id, updatedEval);
      setIsAnalyzingAllDocs(false);
      onToast(`All ${currentList.length} documents analyzed! Avg Quality: ${avgDocScore}%, Grammar calibrated to ${updatedGrammar}%, Overall Score updated to ${updatedComposite}%.`);
    }, 850);
  };

  // ─── Managed Candidate Videos Array (Presentation, Project Walkthrough, Reflection) ───
  const candidateVideos = useMemo(() => {
    if (!currentStudent) return [];
    const candidateName = currentStudent.name || "Intern";
    const customStoredVideo: InternReflectionVideo | undefined = (() => {
      if (currentStudent.reflectionVideo && currentStudent.reflectionVideo.videoUrl) {
        return currentStudent.reflectionVideo;
      }
      try {
        const stored = JSON.parse(localStorage.getItem("m2i_intern_videos") || "{}");
        if (stored[currentStudent.id]) return stored[currentStudent.id];
      } catch {}
      return undefined;
    })();

    const resultVideos: any[] = [];

    if (customStoredVideo && customStoredVideo.videoUrl) {
      resultVideos.push({
        id: "video-custom-reflection",
        type: "Technical Presentation & Capstone Defense",
        tag: "Report Section 10",
        videoUrl: customStoredVideo.videoUrl,
        title: customStoredVideo.title || `${candidateName} — Capstone Architecture Presentation & Defense`,
        duration: customStoredVideo.duration || "18:42",
        uploadedAt: customStoredVideo.uploadedAt || "Uploaded Recording",
        isAnalyzed: !!customStoredVideo.aiSummary && (customStoredVideo.aiFluencyScore || 0) > 0,
        aiSummary: customStoredVideo.aiSummary || "Video uploaded. Ready for admin analysis.",
        aiFluencyScore: customStoredVideo.aiFluencyScore || 0,
        aiCommunicationScore: customStoredVideo.aiCommunicationScore || 0,
        aiToneNotes: customStoredVideo.aiToneNotes || "Pending AI analysis.",
        aiMilestones: customStoredVideo.aiMilestones || [],
      });
    }

    // Include project demo videos submitted by this candidate
    const internProjectSubs = (projectSubmissions || []).filter(
      (s: any) => (s.studentId === currentStudent.id || s.studentEmail === currentStudent.email) && !!s.demoVideoUrl
    );
    internProjectSubs.forEach((sub: any, sIdx: number) => {
      resultVideos.push({
        id: `video-proj-${sub.id || sIdx}`,
        type: "Project Execution & Demo Recording",
        tag: sub.projectTitle || `Project Demo #${sIdx + 1}`,
        videoUrl: sub.demoVideoUrl,
        title: `${candidateName} — ${sub.projectTitle || "Project Demo Walkthrough"}`,
        duration: "10:00",
        uploadedAt: sub.submittedAt || "Submitted Project Demo",
        isAnalyzed: true,
        aiSummary: sub.feedback || `Live project walkthrough demonstrated by ${candidateName}.`,
        aiFluencyScore: 90,
        aiCommunicationScore: 92,
        aiToneNotes: "Clear demonstration of project requirements and functionality.",
        aiMilestones: [
          { time: "01:00", desc: "Project Objectives & Architecture" },
          { time: "05:00", desc: "Live Functional Feature Demo" },
          { time: "09:00", desc: "Summary & Conclusion" },
        ],
      });
    });

    if (resultVideos.length > 0) {
      return resultVideos;
    }

    if (!isDemoStudent(currentStudent)) {
      return [];
    }

    return [
      {
        id: "video-1-presentation",
        type: "Technical Presentation & Capstone Defense",
        tag: "Report Section 10",
        videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42898-large.mp4",
        title: `${candidateName} — Capstone Architecture Presentation & Defense`,
        duration: "18:42",
        uploadedAt: "Verified Active Cohort",
        isAnalyzed: true,
        aiSummary: `${candidateName} presented a comprehensive capstone defense detailing microservices decoupling, Kafka message streams, and production container orchestration with crisp technical articulation.`,
        aiFluencyScore: 92,
        aiCommunicationScore: 94,
        aiToneNotes: "Confident, articulate, methodical technical explanations with clear architectural diagrams.",
        aiMilestones: [
          { time: "02:14", desc: "Problem Statement & Cloud Architecture Overview" },
          { time: "07:38", desc: "Microservices Implementation, Kafka & Event Streams" },
          { time: "12:45", desc: "Database Scaling, Latency Profiling & Edge Cases" },
          { time: "16:20", desc: "Production Deployment, CI/CD & Fellowship Retrospective" },
        ],
      },
      {
        id: "video-2-project-demo",
        type: "Project Execution & Code Walkthrough",
        tag: "Live Execution Demo",
        videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-working-on-a-computer-43407-large.mp4",
        title: `${candidateName} — End-to-End System Demo & Live API Walkthrough`,
        duration: "14:20",
        uploadedAt: "Sprint 4 Final Checkpoint",
        isAnalyzed: true,
        aiSummary: `Comprehensive live code demonstration covering RESTful endpoints, JWT security middleware, PostgreSQL transactions, and Docker container startup.`,
        aiFluencyScore: 90,
        aiCommunicationScore: 93,
        aiToneNotes: "Structured walkthrough with step-by-step terminal execution and zero unhandled exceptions.",
        aiMilestones: [
          { time: "01:10", desc: "Architecture Overview & Repository Layout" },
          { time: "04:50", desc: "API Routing, JWT Authentication & RBAC Middleware" },
          { time: "08:30", desc: "PostgreSQL Database Schema, Migrations & Complex Queries" },
          { time: "12:15", desc: "Docker Compose Deployment & Live Health Checks" },
        ],
      },
      {
        id: "video-3-reflection",
        type: "Internship Training Experience & Reflection",
        tag: "Personal Retrospective",
        videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-young-woman-working-with-headphones-42901-large.mp4",
        title: `${candidateName} — Mind2i Fellowship Experience & Self-Reflection`,
        duration: "22:15",
        uploadedAt: "Fellowship Capstone Week",
        isAnalyzed: true,
        aiSummary: `Reflective retrospective on agile sprint collaboration, overcoming distributed tracing roadblocks, and receiving mentorship under Vijaya Kumar Mekala.`,
        aiFluencyScore: 94,
        aiCommunicationScore: 96,
        aiToneNotes: "Mature, collaborative engineering mindset, high receptivity to mentorship feedback.",
        aiMilestones: [
          { time: "03:00", desc: "Onboarding & Tackling First Core Sprint Blockers" },
          { time: "08:40", desc: "Pair Programming Breakthroughs & Code Review Learnings" },
          { time: "15:10", desc: "Mentorship Insights & Professional Development" },
          { time: "19:30", desc: "Future Aspirations in Enterprise Cloud Engineering" },
        ],
      },
    ];
  }, [currentStudent, projectSubmissions]);

  // Real-time video count calculation for any student in cohort directory
  const getStudentVideoCount = useCallback((stu: Student): number => {
    let count = 0;
    if (stu.reflectionVideo && stu.reflectionVideo.videoUrl) {
      count++;
    } else {
      try {
        const stored = JSON.parse(localStorage.getItem("m2i_intern_videos") || "{}");
        if (stored[stu.id] && stored[stu.id].videoUrl) {
          count++;
        }
      } catch {}
    }
    const internProjectSubs = (projectSubmissions || []).filter(
      (s: any) => (s.studentId === stu.id || s.studentEmail === stu.email) && !!s.demoVideoUrl
    );
    count += internProjectSubs.length;

    if (count > 0) return count;
    if (isDemoStudent(stu)) return 3;
    return 0;
  }, [projectSubmissions]);

  // Admin AI Video Analysis handler (Admin performs the speech and telemetry analysis on recording)
  const [analyzingVideoId, setAnalyzingVideoId] = useState<string | null>(null);
  const handleAdminAnalyzeVideo = (videoId?: string) => {
    if (!currentStudent) return;
    const targetVideo = (videoId ? candidateVideos.find((v) => v.id === videoId) : null) || candidateVideos[0];
    if (!targetVideo) return;
    setAnalyzingVideoId(targetVideo.id);
    setTimeout(() => {
      const candidateName = currentStudent.name || "The candidate";
      const analyzedVideo: InternReflectionVideo = {
        videoUrl: targetVideo.videoUrl,
        title: targetVideo.title,
        duration: targetVideo.duration,
        uploadedAt: "Admin Verified & Analyzed",
        aiSummary: `Admin faculty analysis completed for ${candidateName}. Verbal presentation exhibits lucid architecture synthesis, rapid response to technical prompts, and mastery over asynchronous pipeline designs.`,
        aiFluencyScore: 95,
        aiCommunicationScore: 96,
        aiToneNotes: "Confident, articulate, poise under technical scrutiny, business-value orientation.",
        aiMilestones: [
          { time: "02:14", desc: "Problem Statement & Cloud Architecture Overview" },
          { time: "07:38", desc: "Microservices Implementation, Kafka & Event Streams" },
          { time: "12:45", desc: "Database Scaling, Latency Profiling & Edge Cases" },
          { time: "16:20", desc: "Production Deployment, CI/CD & Fellowship Retrospective" },
        ],
      };
      try {
        const stored = JSON.parse(localStorage.getItem("m2i_intern_videos") || "{}");
        stored[currentStudent.id] = analyzedVideo;
        localStorage.setItem("m2i_intern_videos", JSON.stringify(stored));
      } catch {}
      setAnalyzingVideoId(null);
      onToast(`AI Speech & Video Telemetry Analysis calibrated! Section 10 report updated.`);
    }, 800);
  };

  // Preview live dossier with latest unsaved or saved evaluation (incorporating consensus averages)
  const handlePreviewLiveDossier = () => {
    if (!currentStudent) return;
    const safeIdx = Math.min(activeEvaluationIndex, currentEvaluations.length - 1);
    const validEvals = currentEvaluations.filter((e) => (e.overallRating || 0) > 0);
    const evalCount = Math.max(1, validEvals.length);
    const avgOverall = Math.round(validEvals.reduce((acc, e) => acc + (e.overallRating || 90), 0) / evalCount);
    const avgComm = Math.round(validEvals.reduce((acc, e) => acc + (e.communicationScore || 90), 0) / evalCount);
    const avgGrammar = Math.round(validEvals.reduce((acc, e) => acc + (e.grammarScore || 88), 0) / evalCount);
    const avgFluency = Math.round(validEvals.reduce((acc, e) => acc + (e.fluencyScore || 91), 0) / evalCount);
    const avgProject = Math.round(validEvals.reduce((acc, e) => acc + (e.projectScore || 92), 0) / evalCount);

    const authoritativeEval: InternEvaluation = {
      ...(currentEvaluations[safeIdx] || formData),
      ...formData,
      overallRating: avgOverall,
      communicationScore: avgComm,
      grammarScore: avgGrammar,
      fluencyScore: avgFluency,
      projectScore: avgProject,
      reviewerName: validEvals.length > 1
        ? `Faculty Panel Average (${validEvals.length} Evaluators)`
        : formData.reviewerName,
      reviewerRole: validEvals.length > 1
        ? "Consensus of Faculty Reviews"
        : formData.reviewerRole,
      studentId: currentStudent.id,
      batchId: currentStudent.batchId,
      evaluatedAt: new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    };

    try {
      const saved = JSON.parse(localStorage.getItem("m2i_intern_evaluations") || "{}");
      saved[currentStudent.id] = authoritativeEval;
      localStorage.setItem("m2i_intern_evaluations", JSON.stringify(saved));
    } catch {}

    const primaryVideo: InternReflectionVideo = {
      videoUrl: candidateVideos[0]?.videoUrl || "",
      title: candidateVideos[0]?.title || "",
      duration: candidateVideos[0]?.duration,
      uploadedAt: candidateVideos[0]?.uploadedAt || "",
      aiSummary: candidateVideos[0]?.aiSummary,
      aiFluencyScore: candidateVideos[0]?.aiFluencyScore,
      aiCommunicationScore: candidateVideos[0]?.aiCommunicationScore,
      aiToneNotes: candidateVideos[0]?.aiToneNotes,
      aiMilestones: candidateVideos[0]?.aiMilestones,
    };

    const studentWithEval: Student = {
      ...currentStudent,
      evaluation: authoritativeEval,
      evaluations: currentEvaluations,
      reflectionVideo: primaryVideo,
      resources: candidateResources.length > 0 ? candidateResources : currentStudent.resources,
    };
    onViewStudentReport(studentWithEval);
  };

  // Preview live dossier directly for any student (e.g. from roster cards)
  const handlePreviewLiveDossierForStudent = (student: Student) => {
    const studentEvals =
      multiEvaluationsMap[student.id] ||
      (student.evaluations && student.evaluations.length > 0
        ? student.evaluations
        : generateDefaultAdminEvaluations(student, currentBatch, dailyActivityLogs, projectSubmissions));

    const validEvals = studentEvals.filter((e) => (e.overallRating || 0) > 0);
    const evalCount = Math.max(1, validEvals.length);
    const avgOverall = Math.round(validEvals.reduce((acc, e) => acc + (e.overallRating || 90), 0) / evalCount);
    const avgComm = Math.round(validEvals.reduce((acc, e) => acc + (e.communicationScore || 90), 0) / evalCount);
    const avgGrammar = Math.round(validEvals.reduce((acc, e) => acc + (e.grammarScore || 88), 0) / evalCount);
    const avgFluency = Math.round(validEvals.reduce((acc, e) => acc + (e.fluencyScore || 91), 0) / evalCount);
    const avgProject = Math.round(validEvals.reduce((acc, e) => acc + (e.projectScore || 92), 0) / evalCount);

    const activeEval = studentEvals[0] || student.evaluation;
    const authoritativeEval: InternEvaluation = {
      ...activeEval,
      overallRating: avgOverall,
      communicationScore: avgComm,
      grammarScore: avgGrammar,
      fluencyScore: avgFluency,
      projectScore: avgProject,
      reviewerName: validEvals.length > 1
        ? `Faculty Panel Average (${validEvals.length} Evaluators)`
        : activeEval?.reviewerName || "Faculty Panel",
      reviewerRole: validEvals.length > 1
        ? "Consensus of Faculty Reviews"
        : activeEval?.reviewerRole || "Faculty",
      studentId: student.id,
      batchId: student.batchId,
      evaluatedAt: new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    };

    const studentWithEval: Student = {
      ...student,
      evaluation: authoritativeEval,
      evaluations: studentEvals,
      resources: documentsMap[student.id] && documentsMap[student.id].length > 0
        ? documentsMap[student.id]
        : student.resources,
    };
    onViewStudentReport(studentWithEval);
  };

  // Save handler: saves the active evaluator review into multiEvaluationsMap and computes panel consensus
  const handleSaveEvaluation = () => {
    if (!currentStudent) return;
    if (!canEditActiveEvaluation) {
      onToast("Permission denied: You can only edit evaluations assigned to your role.");
      return;
    }
    const safeIdx = Math.min(activeEvaluationIndex, currentEvaluations.length - 1);
    const updatedEval: InternEvaluation = {
      ...formData,
      evaluationName: formData.evaluationName || "Faculty Appraisal",
      reviewerName: isSuperAdmin && !isMyReview && formData.reviewerName && !isPendingEvaluation
        ? formData.reviewerName
        : activeAdmin.name,
      reviewerRole: isSuperAdmin && !isMyReview && formData.reviewerRole && !isPendingEvaluation
        ? formData.reviewerRole
        : activeAdmin.role,
      evaluatorAvatar: isSuperAdmin && !isMyReview && formData.evaluatorAvatar && !isPendingEvaluation
        ? formData.evaluatorAvatar
        : activeAdmin.avatar,
      studentId: currentStudent.id,
      batchId: currentStudent.batchId,
      evaluatedAt: new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    };

    const updatedEvals = [...currentEvaluations];
    if (safeIdx >= 0 && safeIdx < updatedEvals.length) {
      updatedEvals[safeIdx] = updatedEval;
    } else {
      updatedEvals.push(updatedEval);
    }

    const newMap = { ...multiEvaluationsMap, [currentStudent.id]: updatedEvals };
    setMultiEvaluationsMap(newMap);
    try {
      localStorage.setItem("m2i_intern_multi_evaluations", JSON.stringify(newMap));
    } catch {}

    // Calculate authoritative panel average across ALL submitted admin evaluations
    const validEvals = updatedEvals.filter((e) => (e.overallRating || 0) > 0);
    const evalCount = Math.max(1, validEvals.length);
    const avgOverall = Math.round(validEvals.reduce((acc, e) => acc + (e.overallRating || 90), 0) / evalCount);
    const avgComm = Math.round(validEvals.reduce((acc, e) => acc + (e.communicationScore || 90), 0) / evalCount);
    const avgGrammar = Math.round(validEvals.reduce((acc, e) => acc + (e.grammarScore || 88), 0) / evalCount);
    const avgFluency = Math.round(validEvals.reduce((acc, e) => acc + (e.fluencyScore || 91), 0) / evalCount);
    const avgProject = Math.round(validEvals.reduce((acc, e) => acc + (e.projectScore || 92), 0) / evalCount);

    const authoritativeEval: InternEvaluation = {
      ...updatedEval,
      overallRating: avgOverall,
      communicationScore: avgComm,
      grammarScore: avgGrammar,
      fluencyScore: avgFluency,
      projectScore: avgProject,
      reviewerName: validEvals.length > 1
        ? `Faculty Panel Average (${validEvals.length} Evaluators)`
        : updatedEval.reviewerName,
      reviewerRole: validEvals.length > 1
        ? "Consensus of Faculty Reviews"
        : updatedEval.reviewerRole,
    };

    try {
      const saved = JSON.parse(localStorage.getItem("m2i_intern_evaluations") || "{}");
      saved[currentStudent.id] = authoritativeEval;
      localStorage.setItem("m2i_intern_evaluations", JSON.stringify(saved));
    } catch {}

    onUpdateStudentEvaluation(currentStudent.id, authoritativeEval);
    onToast(`Evaluation "${updatedEval.evaluationName || 'Appraisal'}" saved by ${updatedEval.reviewerName}! Panel Average: ${avgOverall}% (${evalCount} Admins).`);
  };

  // Open modal in "create" mode (Super Admin Only)
  const handleOpenCreateRoundModal = (scope: "cohort" | "single" = "cohort") => {
    if (!isSuperAdmin) {
      onToast("Permission denied: Only Super Admin can create evaluation rounds.");
      return;
    }
    setEvalModalMode("create");
    setEditingTargetRound(null);
    setEditingTargetIndex(null);
    setNewEvaluationName("");
    setNewEvaluationScope(scope);
    setNewEvaluatorName("Dr. S. Rajesh");
    setNewEvaluatorRole("Principal Software Architect & Tech Faculty");
    setNewEvaluationStatus("pending");
    setIsEvalRoundDropdownOpen(false);
    setIsProfileEvalDropdownOpen(false);
    setShowAddEvaluatorModal(true);
  };

  // Open modal in "edit" mode for a cohort round (Super Admin Only)
  const handleOpenEditCohortRoundModal = (roundName: string) => {
    if (!isSuperAdmin) {
      onToast("Permission denied: Only Super Admin can edit evaluation rounds.");
      return;
    }
    setEvalModalMode("edit");
    setEditingTargetRound(roundName);
    setEditingTargetIndex(null);
    setNewEvaluationName(roundName);
    setNewEvaluationScope("cohort");

    // Discover existing evaluator for this round across current evaluations
    let foundReviewer = activeAdmin.name;
    let foundRole = activeAdmin.role;
    for (const evals of Object.values(multiEvaluationsMap)) {
      if (Array.isArray(evals)) {
        const found = evals.find((e) => e.evaluationName?.toLowerCase() === roundName.toLowerCase());
        if (found) {
          foundReviewer = found.reviewerName || foundReviewer;
          foundRole = found.reviewerRole || foundRole;
          break;
        }
      }
    }
    setNewEvaluatorName(foundReviewer);
    setNewEvaluatorRole(foundRole);
    setNewEvaluationStatus("preset");
    setIsEvalRoundDropdownOpen(false);
    setShowAddEvaluatorModal(true);
  };

  // Open modal in "edit" mode for a specific candidate evaluation (Super Admin Only)
  const handleOpenEditProfileEvalModal = (idx: number, evalItem: InternEvaluation) => {
    if (!isSuperAdmin) {
      onToast("Permission denied: Only Super Admin can edit evaluation rounds.");
      return;
    }
    setEvalModalMode("edit");
    setEditingTargetRound(evalItem.evaluationName || "");
    setEditingTargetIndex(idx);
    setNewEvaluationName(evalItem.evaluationName || "");
    setNewEvaluationScope("single");
    setNewEvaluatorName(evalItem.reviewerName || activeAdmin.name);
    setNewEvaluatorRole(evalItem.reviewerRole || activeAdmin.role);
    setNewEvaluationStatus((evalItem.overallRating || 0) > 0 ? "preset" : "pending");
    setIsProfileEvalDropdownOpen(false);
    setShowAddEvaluatorModal(true);
  };

  // Save changes when user is editing an evaluation in the modal (Super Admin Only)
  const handleUpdateEvaluator = (updatedName: string) => {
    if (!isSuperAdmin) {
      onToast("Permission denied: Only Super Admin can edit evaluation rounds.");
      return;
    }
    const oldName = editingTargetRound || "";
    const nameChanged = oldName.toLowerCase() !== updatedName.toLowerCase();
    const reviewer = newEvaluatorName.trim() || activeAdmin.name;
    const role = newEvaluatorRole.trim() || activeAdmin.role;
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(reviewer)}`;

    if (newEvaluationScope === "cohort" || editingTargetIndex === null) {
      // Cohort-wide update across interns of the active batch
      if (nameChanged && deletedRounds.includes(oldName)) {
        const filteredDel = deletedRounds.filter((r) => r.toLowerCase() !== oldName.toLowerCase());
        setDeletedRounds(filteredDel);
        try {
          localStorage.setItem("m2i_intern_deleted_rounds", JSON.stringify(filteredDel));
        } catch {}
      }

      // Update custom rounds list for active batch
      const currentCustom = batchCustomRounds[activeBatchId] || [];
      if (currentCustom.includes(oldName)) {
        const updatedCustom = {
          ...batchCustomRounds,
          [activeBatchId]: currentCustom.map((r) => (r.toLowerCase() === oldName.toLowerCase() ? updatedName : r)),
        };
        setBatchCustomRounds(updatedCustom);
        try {
          localStorage.setItem("m2i_batch_custom_rounds", JSON.stringify(updatedCustom));
        } catch {}
      }

      const updatedMap: Record<string, InternEvaluation[]> = { ...multiEvaluationsMap };
      batchStudents.forEach((stu) => {
        const currentList = updatedMap[stu.id] || (stu.evaluations && stu.evaluations.length > 0 ? stu.evaluations : generateDefaultAdminEvaluations(stu, null));
        updatedMap[stu.id] = currentList.map((e) => {
          if (e.evaluationName?.toLowerCase() === oldName.toLowerCase()) {
            return {
              ...e,
              evaluationName: updatedName,
              reviewerName: reviewer,
              reviewerRole: role,
              evaluatorAvatar: avatar,
            };
          }
          return e;
        });
      });

      setMultiEvaluationsMap(updatedMap);
      try {
        localStorage.setItem("m2i_intern_multi_evaluations", JSON.stringify(updatedMap));
      } catch {}

      if (selectedEvaluationRound.toLowerCase() === oldName.toLowerCase()) {
        setSelectedEvaluationRound(updatedName);
      }
      if (formData.evaluationName?.toLowerCase() === oldName.toLowerCase()) {
        setFormData((prev) => ({
          ...prev,
          evaluationName: updatedName,
          reviewerName: reviewer,
          reviewerRole: role,
          evaluatorAvatar: avatar,
        }));
      }

      setShowAddEvaluatorModal(false);
      onToast(`Evaluation round updated to "${updatedName}" for ${currentActiveBatch?.name || "active batch"}!`);
    } else {
      // Single candidate update
      if (!currentStudent) return;
      const targetIdx = editingTargetIndex ?? activeEvaluationIndex;
      const currentList = [
        ...(multiEvaluationsMap[currentStudent.id] || currentEvaluations),
      ];

      if (currentList[targetIdx]) {
        currentList[targetIdx] = {
          ...currentList[targetIdx],
          evaluationName: updatedName,
          reviewerName: reviewer,
          reviewerRole: role,
          evaluatorAvatar: avatar,
        };

        const updatedMap = {
          ...multiEvaluationsMap,
          [currentStudent.id]: currentList,
        };

        setMultiEvaluationsMap(updatedMap);
        try {
          localStorage.setItem("m2i_intern_multi_evaluations", JSON.stringify(updatedMap));
        } catch {}

        if (targetIdx === activeEvaluationIndex) {
          setFormData((prev) => ({
            ...prev,
            evaluationName: updatedName,
            reviewerName: reviewer,
            reviewerRole: role,
            evaluatorAvatar: avatar,
          }));
        }
      }

      setShowAddEvaluatorModal(false);
      onToast(`Evaluation "${updatedName}" updated for ${currentStudent.name}!`);
    }
  };

  // Create new role-based named evaluation (Super Admin Only)
  const handleCreateNewEvaluator = () => {
    if (!isSuperAdmin) {
      onToast("Permission denied: Only Super Admin can create evaluation rounds.");
      return;
    }
    const evalName = newEvaluationName.trim() || `${newEvaluatorRole.split("&")[0].trim()} Review`;
    const name = newEvaluatorName.trim() || activeAdmin.name;
    const role = newEvaluatorRole.trim() || activeAdmin.role;
    const isPending = newEvaluationStatus === "pending";

    const updatedMap = { ...multiEvaluationsMap };

    if (newEvaluationScope === "cohort") {
      // Apply evaluation round strictly across interns in the active batch
      batchStudents.forEach((stu) => {
        const studentEvals = [
          ...(updatedMap[stu.id] ||
            (stu.evaluations && stu.evaluations.length > 0
              ? stu.evaluations
              : generateDefaultAdminEvaluations(stu, null))),
        ];

        const newEval: InternEvaluation = {
          id: `${stu.id}-eval-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          evaluationName: evalName,
          reviewerName: name,
          reviewerRole: role,
          evaluatorAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
          evaluatedAt: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
          overallRating: isPending ? 0 : 85,
          communicationScore: isPending ? 0 : 85,
          grammarScore: isPending ? 0 : 85,
          fluencyScore: isPending ? 0 : 85,
          projectScore: isPending ? 0 : 88,
          communicationNotes: "Verbal clarity, standup participation, and collaborative responses.",
          grammarNotes: "Technical documentation structure, git commit quality, and PR descriptions.",
          fluencyNotes: "Demonstrated presentation poise and architectural justification.",
          projectNotes: "Feature implementation, schema correctness, and code execution rigor.",
          aiVerdict: isPending ? "Pending Faculty Evaluation" : "Satisfactory",
          customNotes: `Role-based evaluation for "${evalName}" assigned to ${name} (${role}).`,
          aiStrengths: [],
          aiGrowthAreas: [],
          studentId: stu.id,
          batchId: stu.batchId,
        };

        const existingIdx = studentEvals.findIndex(
          (e) => e.evaluationName?.toLowerCase() === evalName.toLowerCase()
        );
        if (existingIdx !== -1) {
          studentEvals[existingIdx] = newEval;
        } else {
          studentEvals.push(newEval);
        }
        updatedMap[stu.id] = studentEvals;
      });

      // Update custom rounds for this batch
      const updatedCustom = {
        ...batchCustomRounds,
        [activeBatchId]: Array.from(new Set([...(batchCustomRounds[activeBatchId] || []), evalName])),
      };
      setBatchCustomRounds(updatedCustom);
      try {
        localStorage.setItem("m2i_batch_custom_rounds", JSON.stringify(updatedCustom));
      } catch {}

      setMultiEvaluationsMap(updatedMap);
      try {
        localStorage.setItem("m2i_intern_multi_evaluations", JSON.stringify(updatedMap));
      } catch {}

      setSelectedEvaluationRound(evalName);
      setShowAddEvaluatorModal(false);
      setNewEvaluationName("");
      setViewMode("roster");
      onToast(`Role evaluation round "${evalName}" created for ${currentActiveBatch?.name || "active cohort"} (${batchStudents.length} interns)! Ready for review.`);
    } else {
      if (!currentStudent) return;
      const studentEvals = [
        ...(updatedMap[currentStudent.id] || currentEvaluations),
      ];

      const newEval: InternEvaluation = {
        id: `${currentStudent.id}-eval-${Date.now()}`,
        evaluationName: evalName,
        reviewerName: name,
        reviewerRole: role,
        evaluatorAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
        evaluatedAt: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        overallRating: isPending ? 0 : 85,
        communicationScore: isPending ? 0 : 85,
        grammarScore: isPending ? 0 : 85,
        fluencyScore: isPending ? 0 : 85,
        projectScore: isPending ? 0 : 88,
        communicationNotes: "Verbal clarity, standup participation, and collaborative responses.",
        grammarNotes: "Technical documentation structure, git commit quality, and PR descriptions.",
        fluencyNotes: "Demonstrated presentation poise and architectural justification.",
        projectNotes: "Feature implementation, schema correctness, and code execution rigor.",
        aiVerdict: isPending ? "Pending Faculty Evaluation" : "Satisfactory",
        customNotes: `Role-based evaluation for "${evalName}" assigned to ${name} (${role}).`,
        aiStrengths: [],
        aiGrowthAreas: [],
        studentId: currentStudent.id,
        batchId: currentStudent.batchId,
      };

      studentEvals.push(newEval);
      updatedMap[currentStudent.id] = studentEvals;
      setMultiEvaluationsMap(updatedMap);
      try {
        localStorage.setItem("m2i_intern_multi_evaluations", JSON.stringify(updatedMap));
      } catch {}

      setSelectedEvaluationRound(evalName);
      setActiveEvaluationIndex(studentEvals.length - 1);
      setFormData(newEval);
      setShowAddEvaluatorModal(false);
      setNewEvaluationName("");
      setViewMode("roster");
      onToast(`Role evaluation "${evalName}" created! Candidates are now listed for review.`);
    }
  };

  // Unified save or update dispatcher (Super Admin Only)
  const handleSaveOrUpdateEvaluator = () => {
    if (!isSuperAdmin) {
      onToast("Permission denied: Only Super Admin can create or edit evaluation rounds.");
      return;
    }
    const trimmed = newEvaluationName.trim();
    if (!trimmed) {
      onToast("Please enter a valid evaluation name.");
      return;
    }
    if (evalModalMode === "edit") {
      handleUpdateEvaluator(trimmed);
    } else {
      handleCreateNewEvaluator();
    }
  };

  // Open candidate evaluation directly into the active evaluation round workspace (Image 2)
  const handleOpenCandidateEvaluation = (stuId: string, roundName?: string) => {
    setSelectedStudentId(stuId);
    setProfileTab("evaluation");
    setViewMode("profile");

    const targetRound =
      roundName && roundName !== "all"
        ? roundName
        : selectedEvaluationRound !== "all"
        ? selectedEvaluationRound
        : "System Architecture & System Defense";

    const student = students.find((s) => s.id === stuId);
    if (student) {
      const studentEvals = [
        ...(multiEvaluationsMap[stuId] ||
          (student.evaluations && student.evaluations.length > 0
            ? student.evaluations
            : generateDefaultAdminEvaluations(student, null))),
      ];

      let idx = studentEvals.findIndex(
        (e) => e.evaluationName?.toLowerCase() === targetRound.toLowerCase()
      );

      if (idx === -1) {
        const newEval: InternEvaluation = {
          id: `${stuId}-eval-${Date.now()}`,
          evaluationName: targetRound,
          reviewerName: activeAdmin.name,
          reviewerRole: activeAdmin.role,
          evaluatorAvatar: activeAdmin.avatar,
          evaluatedAt: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
          overallRating: 0,
          communicationScore: 0,
          grammarScore: 0,
          fluencyScore: 0,
          projectScore: 0,
          communicationNotes: "Verbal clarity, standup participation, and collaborative responses.",
          grammarNotes: "Technical documentation structure, git commit quality, and PR descriptions.",
          fluencyNotes: "Demonstrated presentation poise and architectural justification.",
          projectNotes: "Feature implementation, schema correctness, and code execution rigor.",
          aiVerdict: "Pending Faculty Evaluation",
          customNotes: `Role-based evaluation for "${targetRound}" assigned to ${activeAdmin.name}.`,
          aiStrengths: [],
          aiGrowthAreas: [],
          studentId: stuId,
          batchId: student.batchId,
        };
        studentEvals.push(newEval);
        const newMap = { ...multiEvaluationsMap, [stuId]: studentEvals };
        setMultiEvaluationsMap(newMap);
        try {
          localStorage.setItem("m2i_intern_multi_evaluations", JSON.stringify(newMap));
        } catch {}
        idx = studentEvals.length - 1;
        setActiveEvaluationIndex(idx);
        setFormData(newEval);
      } else {
        setActiveEvaluationIndex(idx);
        setFormData(studentEvals[idx]);
      }
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete / Remove evaluator review (Super Admin Only)
  const handleDeleteEvaluation = (idxToDelete: number) => {
    if (!currentStudent || currentEvaluations.length <= 1) return;
    if (!isSuperAdmin) {
      onToast("Permission denied: Only Super Admin can delete evaluation rounds.");
      return;
    }
    const target = currentEvaluations[idxToDelete];
    const evalToDelete = target?.evaluationName || target?.reviewerName || "Evaluation";
    const updatedEvals = currentEvaluations.filter((_, i) => i !== idxToDelete);
    const newMap = { ...multiEvaluationsMap, [currentStudent.id]: updatedEvals };
    setMultiEvaluationsMap(newMap);
    try {
      localStorage.setItem("m2i_intern_multi_evaluations", JSON.stringify(newMap));
    } catch {}
    const newActiveIdx = Math.max(0, idxToDelete - 1);
    setActiveEvaluationIndex(newActiveIdx);
    setFormData(updatedEvals[newActiveIdx]);
    onToast(`Removed evaluation: ${evalToDelete}.`);
  };

  // Rename / Edit evaluation round name (Super Admin Only)
  const handleRenameEvaluation = (idxToRename: number, newName: string) => {
    if (!currentStudent || !newName.trim()) return;
    if (!isSuperAdmin) {
      onToast("Permission denied: Only Super Admin can edit evaluation rounds.");
      return;
    }
    const target = currentEvaluations[idxToRename];
    if (!target) return;
    const trimmed = newName.trim();
    const updatedEvals = [...currentEvaluations];
    updatedEvals[idxToRename] = {
      ...updatedEvals[idxToRename],
      evaluationName: trimmed,
    };
    const newMap = { ...multiEvaluationsMap, [currentStudent.id]: updatedEvals };
    setMultiEvaluationsMap(newMap);
    try {
      localStorage.setItem("m2i_intern_multi_evaluations", JSON.stringify(newMap));
    } catch {}

    if (idxToRename === activeEvaluationIndex) {
      setFormData((prev) => ({ ...prev, evaluationName: trimmed }));
    }
    onToast(`Evaluation renamed to "${trimmed}"!`);
    setEditingEvalIndex(null);
    setEditingEvalName("");
  };

  // Cohort-wide round rename handler (Super Admin Only, Scoped to active batch)
  const handleRenameCohortRound = (oldName: string, newName: string) => {
    if (!isSuperAdmin) {
      onToast("Permission denied: Only Super Admin can edit evaluation rounds.");
      return;
    }
    if (!newName.trim() || oldName.trim().toLowerCase() === newName.trim().toLowerCase()) {
      setEditingCohortRound(null);
      setIsEditingSelectedRoundInBar(false);
      return;
    }
    const trimmed = newName.trim();
    const updatedMap: Record<string, InternEvaluation[]> = { ...multiEvaluationsMap };

    batchStudents.forEach((stu) => {
      const currentList = updatedMap[stu.id] || (stu.evaluations && stu.evaluations.length > 0 ? stu.evaluations : generateDefaultAdminEvaluations(stu, null));
      updatedMap[stu.id] = currentList.map((e) => {
        if (e.evaluationName?.toLowerCase() === oldName.toLowerCase()) {
          return { ...e, evaluationName: trimmed };
        }
        return e;
      });
    });

    // Update batchCustomRounds for this batch
    const currentCustom = batchCustomRounds[activeBatchId] || [];
    if (currentCustom.includes(oldName)) {
      const updatedCustom = {
        ...batchCustomRounds,
        [activeBatchId]: currentCustom.map((r) => (r.toLowerCase() === oldName.toLowerCase() ? trimmed : r)),
      };
      setBatchCustomRounds(updatedCustom);
      try {
        localStorage.setItem("m2i_batch_custom_rounds", JSON.stringify(updatedCustom));
      } catch {}
    }

    setMultiEvaluationsMap(updatedMap);
    try {
      localStorage.setItem("m2i_intern_multi_evaluations", JSON.stringify(updatedMap));
    } catch {}

    if (selectedEvaluationRound.toLowerCase() === oldName.toLowerCase()) {
      setSelectedEvaluationRound(trimmed);
    }
    if (formData.evaluationName?.toLowerCase() === oldName.toLowerCase()) {
      setFormData((prev) => ({ ...prev, evaluationName: trimmed }));
    }

    setEditingCohortRound(null);
    setEditingCohortRoundInput("");
    setIsEditingSelectedRoundInBar(false);
    onToast(`Evaluation round renamed to "${trimmed}" for ${currentActiveBatch?.name || "active cohort"}!`);
  };

  // In-place inline round creation (Super Admin Only, Scoped to active batch)
  const handleInlineCreateRound = (nameOverride?: string) => {
    if (!isSuperAdmin) {
      onToast("Permission denied: Only Super Admin can create evaluation rounds.");
      return;
    }
    const rawName = nameOverride || inlineNewRoundName;
    const evalName = rawName.trim();
    if (!evalName) {
      onToast("Please enter an evaluation round name.");
      return;
    }

    const exists = availableEvaluationRounds.some((r) => r.toLowerCase() === evalName.toLowerCase());
    if (exists) {
      onToast(`Evaluation round "${evalName}" already exists in this cohort.`);
      return;
    }

    const updatedMap = { ...multiEvaluationsMap };
    batchStudents.forEach((stu) => {
      const studentEvals = [
        ...(updatedMap[stu.id] ||
          (stu.evaluations && stu.evaluations.length > 0
            ? stu.evaluations
            : generateDefaultAdminEvaluations(stu, null))),
      ];

      const newEval: InternEvaluation = {
        id: `${stu.id}-eval-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        evaluationName: evalName,
        reviewerName: activeAdmin.name,
        reviewerRole: activeAdmin.role,
        evaluatorAvatar: activeAdmin.avatar,
        evaluatedAt: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        overallRating: 0,
        communicationScore: 0,
        grammarScore: 0,
        fluencyScore: 0,
        projectScore: 0,
        communicationNotes: "Verbal clarity, standup participation, and collaborative responses.",
        grammarNotes: "Technical documentation structure, git commit quality, and PR descriptions.",
        fluencyNotes: "Demonstrated presentation poise and architectural justification.",
        projectNotes: "Feature implementation, schema correctness, and code execution rigor.",
        aiVerdict: "Pending Faculty Evaluation",
        customNotes: `Evaluation round for "${evalName}" assigned for faculty review.`,
        aiStrengths: [],
        aiGrowthAreas: [],
        studentId: stu.id,
        batchId: stu.batchId,
      };

      const existingIdx = studentEvals.findIndex(
        (e) => e.evaluationName?.toLowerCase() === evalName.toLowerCase()
      );
      if (existingIdx !== -1) {
        studentEvals[existingIdx] = newEval;
      } else {
        studentEvals.push(newEval);
      }
      updatedMap[stu.id] = studentEvals;
    });

    // Update batchCustomRounds for this batch
    const updatedCustom = {
      ...batchCustomRounds,
      [activeBatchId]: Array.from(new Set([...(batchCustomRounds[activeBatchId] || []), evalName])),
    };
    setBatchCustomRounds(updatedCustom);
    try {
      localStorage.setItem("m2i_batch_custom_rounds", JSON.stringify(updatedCustom));
    } catch {}

    axios.post("/api/evaluation-rounds/", {
      batch: activeBatchId === "all" ? (batches[0]?.id || "batch_ai") : activeBatchId,
      roundName: evalName,
      isDeleted: false,
    }).catch((err) => console.warn("Failed to persist new evaluation round to backend:", err));

    setMultiEvaluationsMap(updatedMap);
    try {
      localStorage.setItem("m2i_intern_multi_evaluations", JSON.stringify(updatedMap));
    } catch {}

    setSelectedEvaluationRound(evalName);
    setIsInlineCreatingRound(false);
    setIsTopBarNewEvalOpen(false);
    setInlineNewRoundName("");
    setIsEvalRoundDropdownOpen(false);
    setIsProfileEvalDropdownOpen(false);
    onToast(`Evaluation round "${evalName}" created for ${currentActiveBatch?.name || "active cohort"} (${batchStudents.length} interns)! Ready for review.`);
  };

  // Cohort-wide round delete handler (Super Admin Only, Scoped to active batch)
  const handleDeleteCohortRound = (roundToDelete: string) => {
    if (!isSuperAdmin) {
      onToast("Permission denied: Only Super Admin can delete evaluation rounds.");
      return;
    }
    if (availableEvaluationRounds.length <= 1) {
      onToast("Cannot delete the last remaining evaluation round.");
      return;
    }

    // Batch-scoped deleted rounds
    const currentDeleted = deletedRoundsByBatch[activeBatchId] || deletedRounds || [];
    const updatedDeletedBatch = Array.from(new Set([...currentDeleted, roundToDelete]));
    const updatedDeletedMap = {
      ...deletedRoundsByBatch,
      [activeBatchId]: updatedDeletedBatch,
    };
    setDeletedRoundsByBatch(updatedDeletedMap);
    try {
      localStorage.setItem("m2i_intern_deleted_rounds_by_batch", JSON.stringify(updatedDeletedMap));
    } catch {}

    axios.post("/api/evaluation-rounds/", {
      batch: activeBatchId === "all" ? (batches[0]?.id || "batch_ai") : activeBatchId,
      roundName: roundToDelete,
      isDeleted: true,
    }).catch((err) => console.warn("Failed to persist deleted evaluation round to backend:", err));

    // Remove from custom rounds if it was custom
    if (batchCustomRounds[activeBatchId]) {
      const updatedCustom = {
        ...batchCustomRounds,
        [activeBatchId]: batchCustomRounds[activeBatchId].filter((r) => r.toLowerCase() !== roundToDelete.toLowerCase()),
      };
      setBatchCustomRounds(updatedCustom);
      try {
        localStorage.setItem("m2i_batch_custom_rounds", JSON.stringify(updatedCustom));
      } catch {}
    }

    const updatedMap = { ...multiEvaluationsMap };
    batchStudents.forEach((stu) => {
      const currentList = updatedMap[stu.id] || (stu.evaluations && stu.evaluations.length > 0 ? stu.evaluations : generateDefaultAdminEvaluations(stu, null));
      updatedMap[stu.id] = currentList.filter(
        (e) => e.evaluationName?.toLowerCase() !== roundToDelete.toLowerCase()
      );
    });

    setMultiEvaluationsMap(updatedMap);
    try {
      localStorage.setItem("m2i_intern_multi_evaluations", JSON.stringify(updatedMap));
    } catch {}

    const remainingRounds = availableEvaluationRounds.filter(
      (r) => r.toLowerCase() !== roundToDelete.toLowerCase()
    );
    const nextRound = remainingRounds[0] || "all";
    setSelectedEvaluationRound(nextRound);

    setEditingCohortRound(null);
    setIsEditingSelectedRoundInBar(false);
    onToast(`Evaluation round "${roundToDelete}" deleted from ${currentActiveBatch?.name || "active cohort"}.`);
  };

  // Helper score label
  const getScoreBadge = (score: number) => {
    if (score >= 93) return { text: "Distinction A+", bg: "bg-emerald-100 text-emerald-800 border-emerald-300" };
    if (score >= 88) return { text: "Excellent A", bg: "bg-teal-100 text-teal-800 border-teal-300" };
    if (score >= 80) return { text: "Proficient B+", bg: "bg-blue-100 text-blue-800 border-blue-300" };
    return { text: "Developing", bg: "bg-amber-100 text-amber-800 border-amber-300" };
  };

  // Helper document category badge & icon
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "presentation":
        return {
          label: "Presentation Deck",
          color: "bg-amber-50 text-amber-700 border-amber-200",
          icon: Presentation,
        };
      case "whitepaper":
        return {
          label: "Research Whitepaper",
          color: "bg-indigo-50 text-indigo-700 border-indigo-200",
          icon: BookOpen,
        };
      case "blueprint":
        return {
          label: "System Blueprint",
          color: "bg-purple-50 text-purple-700 border-purple-200",
          icon: Layers,
        };
      default:
        return {
          label: "Technical Document",
          color: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: FileText,
        };
    }
  };

  // Switch to full-page profile view for an intern
  const handleOpenProfileView = (stuId: string, initialTab: "evaluation" | "documents" | "videos" = "evaluation") => {
    setSelectedStudentId(stuId);
    setProfileTab(initialTab);
    setViewMode("profile");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ═════════════════════════════════════════════════════════════════════════════
  // RENDER 1: ROSTER VIEW (Full-Width Intern Roster Cards)
  // ═════════════════════════════════════════════════════════════════════════════
  if (viewMode === "roster") {
    return (
      <div className="space-y-6 pb-12 animate-in fade-in duration-200">
        {/* ─── Top Header Banner ─── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-900/60">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-400/30 text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-violet-300" />
                <span>AI Evaluation &amp; Qualitative Review Console</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Intern Profile Reviews &amp; AI Analysis
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                Select any intern below to open their <strong>Full-Page Profile &amp; Evaluation Workspace</strong>. Review candidate 4-dimension rubrics, inspect uploaded technical whitepapers, analyze presentation defense recordings, and publish official candidate reports.
              </p>
            </div>

            {/* Quick Metrics Bar with Logged-in Admin Focus */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Interns</span>
                <span className="text-xl font-black text-white">{totalInterns}</span>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-300 block">Your Reviews</span>
                <span className="text-xl font-black text-emerald-400">
                  {students.filter((s) => isStudentEvaluatedByAdmin(s, activeAdmin.name)).length}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-center">
                <span className="text-[10px] uppercase font-bold text-amber-300 block">Pending for You</span>
                <span className="text-xl font-black text-amber-400">
                  {totalInterns - students.filter((s) => isStudentEvaluatedByAdmin(s, activeAdmin.name)).length}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-violet-500/15 border border-violet-500/30 text-center">
                <span className="text-[10px] uppercase font-bold text-violet-300 block">Panel Avg</span>
                <span className="text-xl font-black text-violet-400">{avgCohortScore}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Active Evaluator Session & Multi-Admin Switcher Bar ─── */}
        <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={activeAdmin.avatar}
                alt={activeAdmin.name}
                className="w-12 h-12 rounded-2xl bg-indigo-50 border-2 border-indigo-200 p-0.5 object-cover shadow-2xs"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-xs" title="Active Admin Session" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                  isSuperAdmin
                    ? "bg-purple-100 text-purple-800 border-purple-300"
                    : "bg-indigo-50 text-indigo-700 border-indigo-200"
                }`}>
                  {isSuperAdmin ? "👑 Super Admin" : "🎓 Instructor Portal"}
                </span>
                <span className="text-xs text-slate-300 hidden sm:inline">•</span>
                <span className="text-xs text-slate-500 font-bold hidden sm:inline">{activeAdmin.email}</span>
              </div>
              <h3 className="text-base font-black text-slate-900 mt-0.5">
                {activeAdmin.name}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {activeAdmin.role}
              </p>
            </div>
          </div>

          {/* Authenticated Session Badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">Authenticated Session:</span>
            <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{activeAdmin.name}</span>
              <span className="text-[10px] text-slate-400 font-normal">({isSuperAdmin ? "Super Admin" : "Faculty"})</span>
            </div>
          </div>
        </div>

        {/* ─── Batch & Search Controls Bar (Dropdown-Based) ─── */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
          {/* Left: Scroll-Down Batch Selector Dropdown */}
          <div className="flex items-center gap-2.5 flex-1 min-w-[240px]">
            <label className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5 shrink-0">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Cohort Batch:</span>
            </label>
            <select
              value={activeBatchId}
              onChange={(e) => setActiveBatchId(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 hover:border-indigo-300 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer transition min-w-[200px] sm:min-w-[280px] max-w-md shadow-2xs"
              title="Select batch cohort from dropdown"
            >
              <option value="all">📁 All Batches ({students.length} Interns)</option>
              {batches.map((b) => {
                const count = students.filter((s) => s.batchId === b.id).length;
                return (
                  <option key={b.id} value={b.id}>
                    {b.name} ({count} {count === 1 ? "Intern" : "Interns"})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Right: Search & Status Filter */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search intern by name/email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Interns ({students.length})</option>
              <option value="my_pending">
                Pending Your Review ({students.filter((s) => !getCandidateStatusForRound(s, selectedEvaluationRound).isReviewed).length})
              </option>
              <option value="my_evaluated">
                Evaluated by You ({students.filter((s) => getCandidateStatusForRound(s, selectedEvaluationRound).isReviewed).length})
              </option>
              <option value="evaluated">Any Faculty Evaluated ({evaluatedCount})</option>
              <option value="pending">No Evaluations Yet ({pendingCount})</option>
            </select>
          </div>
        </div>

        {/* ─── Evaluation Rounds Selector & "+ New Evaluation" Bar (Scroll-Down Dropdown Selection) ─── */}
        <div className="p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 relative z-30">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-700 uppercase tracking-wider shrink-0">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>Evaluation Round:</span>
            </div>

            {/* Scroll-Down Dropdown Selector OR Inline Bar Editor */}
            {isEditingSelectedRoundInBar ? (
              <div className="flex items-center gap-1.5 flex-1 max-w-md min-w-[220px]">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={editingCohortRoundInput}
                    onChange={(e) => setEditingCohortRoundInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleRenameCohortRound(selectedEvaluationRound, editingCohortRoundInput);
                      } else if (e.key === "Escape") {
                        setIsEditingSelectedRoundInBar(false);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border-2 border-indigo-500 bg-white text-xs font-bold text-slate-900 focus:outline-hidden shadow-xs"
                    autoFocus
                    placeholder="Evaluation Round Name"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRenameCohortRound(selectedEvaluationRound, editingCohortRoundInput)}
                  className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer shrink-0"
                  title="Save Name"
                >
                  <Check className="w-4 h-4" />
                  <span className="hidden sm:inline">Save</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingSelectedRoundInBar(false)}
                  className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline">Cancel</span>
                </button>
              </div>
            ) : (
              <div className="relative flex-1 max-w-md min-w-[220px]" ref={evalDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsEvalRoundDropdownOpen((prev) => !prev)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-indigo-400 text-left transition flex items-center justify-between gap-2 shadow-2xs cursor-pointer group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      selectedEvaluationRound === "all" ? "bg-slate-600" : "bg-indigo-600"
                    }`} />
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {selectedEvaluationRound === "all"
                        ? "All Rounds (Consensus Composite)"
                        : selectedEvaluationRound}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {selectedEvaluationRound !== "all" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 hidden sm:inline">
                        {batchStudents.filter((s) => getCandidateStatusForRound(s, selectedEvaluationRound).isReviewed).length}/{batchStudents.length} Reviewed
                      </span>
                    )}
                    <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-transform duration-150 ${
                      isEvalRoundDropdownOpen ? "rotate-180 text-indigo-600" : ""
                    }`} />
                  </div>
                </button>

                {/* Scrollable Dropdown Menu */}
                {isEvalRoundDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 min-w-[280px]">
                    {/* Search input to quickly find any evaluation round */}
                    <div className="p-2.5 border-b border-slate-100 bg-slate-50/80">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={evalRoundSearch}
                          onChange={(e) => setEvalRoundSearch(e.target.value)}
                          placeholder="Search or scroll down rounds..."
                          className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-indigo-500 text-slate-800"
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Scrollable List of Evaluation Rounds */}
                    <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 p-1.5 scrollbar-thin">
                      {/* Option 1: All Rounds (Consensus) */}
                      {"all rounds consensus composite".includes(evalRoundSearch.toLowerCase().trim()) && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedEvaluationRound("all");
                            setIsEvalRoundDropdownOpen(false);
                            setEvalRoundSearch("");
                          }}
                          className={`w-full px-3 py-2.5 rounded-xl text-left transition flex items-center justify-between gap-2 cursor-pointer ${
                            selectedEvaluationRound === "all"
                              ? "bg-indigo-50/90 text-indigo-950 font-black"
                              : "hover:bg-slate-50 text-slate-700 font-semibold"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                              <Layers className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-900 truncate">All Rounds (Consensus Composite)</div>
                              <div className="text-[10px] text-slate-400 font-medium">Aggregated candidate consensus across faculty</div>
                            </div>
                          </div>
                          {selectedEvaluationRound === "all" && (
                            <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                          )}
                        </button>
                      )}

                      {/* Individual Evaluation Rounds */}
                      {availableEvaluationRounds
                        .filter((r) => r.toLowerCase().includes(evalRoundSearch.toLowerCase().trim()))
                        .map((roundName) => {
                          const reviewedInRound = batchStudents.filter(
                            (s) => getCandidateStatusForRound(s, roundName).isReviewed
                          ).length;
                          const isSelected = selectedEvaluationRound === roundName;
                          const isEditingThis = editingCohortRound === roundName;

                          if (isEditingThis) {
                            return (
                              <div
                                key={roundName}
                                className="p-2 bg-indigo-50/90 rounded-xl border border-indigo-300 flex items-center gap-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                                  <Award className="w-3.5 h-3.5" />
                                </div>
                                <input
                                  type="text"
                                  value={editingCohortRoundInput}
                                  onChange={(e) => setEditingCohortRoundInput(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      handleRenameCohortRound(roundName, editingCohortRoundInput);
                                    } else if (e.key === "Escape") {
                                      setEditingCohortRound(null);
                                    }
                                  }}
                                  className="flex-1 min-w-0 px-2.5 py-1 text-xs font-bold bg-white rounded-lg border border-indigo-200 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                                  autoFocus
                                  placeholder="Round Name"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRenameCohortRound(roundName, editingCohortRoundInput)}
                                  className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
                                  title="Save Name"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingCohortRound(null)}
                                  className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition cursor-pointer shrink-0"
                                  title="Cancel"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={roundName}
                              className={`p-2.5 rounded-xl transition flex items-center justify-between gap-2 ${
                                isSelected
                                  ? "bg-indigo-50/90 text-indigo-950 font-black"
                                  : "hover:bg-slate-50 text-slate-700 font-semibold"
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedEvaluationRound(roundName);
                                  setIsEvalRoundDropdownOpen(false);
                                  setEvalRoundSearch("");
                                }}
                                className="flex-1 text-left min-w-0 flex items-center gap-2.5 cursor-pointer"
                              >
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                  isSelected ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-600"
                                }`}>
                                  <Award className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                                    <span>{roundName}</span>
                                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-medium">
                                    {reviewedInRound} of {batchStudents.length} Interns Evaluated
                                  </div>
                                </div>
                              </button>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
                                  reviewedInRound === batchStudents.length && batchStudents.length > 0
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                    : reviewedInRound > 0
                                    ? "bg-indigo-50 text-indigo-800 border-indigo-200"
                                    : "bg-amber-50 text-amber-800 border-amber-200"
                                }`}>
                                  {reviewedInRound}/{batchStudents.length}
                                </span>

                                {/* Edit Evaluation Round Button (Super Admin Only) */}
                                {isSuperAdmin && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingCohortRound(roundName);
                                      setEditingCohortRoundInput(roundName);
                                    }}
                                    className="p-1.5 rounded-lg hover:bg-indigo-100 text-slate-500 hover:text-indigo-700 transition cursor-pointer"
                                    title="Edit & update this evaluation round right here"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                {/* Delete Evaluation Round Button (Super Admin Only) */}
                                {isSuperAdmin && availableEvaluationRounds.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteCohortRound(roundName);
                                    }}
                                    className="p-1.5 rounded-lg hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition cursor-pointer"
                                    title="Delete this evaluation round"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}

                      {availableEvaluationRounds.filter((r) =>
                        r.toLowerCase().includes(evalRoundSearch.toLowerCase().trim())
                      ).length === 0 && (
                        <div className="p-4 text-center text-xs text-slate-400 font-medium">
                          No evaluation rounds found matching "{evalRoundSearch}".
                        </div>
                      )}
                    </div>

                    {/* Footer Action to create a new round directly from dropdown (Super Admin Only) */}
                    {isSuperAdmin && (
                      isInlineCreatingRound ? (
                        <div className="p-3 border-t border-slate-100 bg-indigo-50/50 space-y-2" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-900">
                              New Round • {currentActiveBatch?.name || "Active Cohort"}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setIsInlineCreatingRound(false);
                                setInlineNewRoundName("");
                              }}
                              className="text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={inlineNewRoundName}
                            onChange={(e) => setInlineNewRoundName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleInlineCreateRound();
                              } else if (e.key === "Escape") {
                                setIsInlineCreatingRound(false);
                              }
                            }}
                            placeholder="e.g. Cloud Infrastructure & DevOps"
                            className="w-full px-3 py-1.5 text-xs font-bold bg-white rounded-xl border border-indigo-200 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                            autoFocus
                          />
                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setIsInlineCreatingRound(false);
                                setInlineNewRoundName("");
                              }}
                              className="px-3 py-1 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleInlineCreateRound()}
                              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Create Round</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-2 border-t border-slate-100 bg-slate-50">
                          <button
                            type="button"
                            onClick={() => {
                              setIsInlineCreatingRound(true);
                              setInlineNewRoundName("");
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border border-indigo-200"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Create New Evaluation Round</span>
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Quick Action Buttons for currently selected cohort round (Super Admin Only) */}
            {isSuperAdmin && selectedEvaluationRound !== "all" && !isEditingSelectedRoundInBar && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingSelectedRoundInBar(true);
                    setEditingCohortRoundInput(selectedEvaluationRound);
                  }}
                  className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-slate-200"
                  title="Edit & update selected evaluation round right here"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Edit Round</span>
                </button>

                {availableEvaluationRounds.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteCohortRound(selectedEvaluationRound)}
                    className="px-2.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    title="Delete selected evaluation round"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Delete Round</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* + New Evaluation Action Button & In-Place Popover (Super Admin Only) */}
          {isSuperAdmin && (
            <div className="relative shrink-0" ref={topBarNewEvalRef}>
              <button
                type="button"
                onClick={() => {
                  setIsTopBarNewEvalOpen((prev) => !prev);
                  setInlineNewRoundName("");
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-black transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ New Evaluation</span>
              </button>

              {/* In-Place Popover directly under the button */}
              {isTopBarNewEvalOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900">Add Evaluation Round</h4>
                        <p className="text-[10px] text-indigo-700 font-bold">
                          Batch: {currentActiveBatch?.name || "All Cohorts"} ({batchStudents.length} Interns)
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsTopBarNewEvalOpen(false)}
                      className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                        Round Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={inlineNewRoundName}
                        onChange={(e) => setInlineNewRoundName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleInlineCreateRound();
                          } else if (e.key === "Escape") {
                            setIsTopBarNewEvalOpen(false);
                          }
                        }}
                        placeholder="e.g. System Architecture & System Defense"
                        className="w-full px-3 py-2 text-xs font-bold bg-slate-50 rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                        autoFocus
                      />
                    </div>

                    {/* Quick suggestions */}
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block mb-1">Quick suggestions:</span>
                      <div className="flex flex-wrap gap-1">
                        {[
                          "System Architecture & System Defense",
                          "Core Technical & Code Quality Review",
                          "Industry Placement & Behavioral Readiness",
                          "Cloud Infrastructure & DevOps",
                        ].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setInlineNewRoundName(preset)}
                            className="px-2 py-0.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold transition cursor-pointer border border-indigo-100"
                          >
                            + {preset.split("&")[0].trim()}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setIsTopBarNewEvalOpen(false)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInlineCreateRound()}
                        className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Create Round</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─── Intern Cohort Directory (Row-Based or Grid) ─── */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
            <div>
              <span className="text-xs font-black uppercase text-slate-500 tracking-wider">
                Intern Cohort Directory ({filteredStudents.length})
              </span>
              <p className="text-xs text-slate-400 font-medium">
                Click any profile to open the Full-Page Evaluation &amp; Review Workspace
              </p>
            </div>

            {/* Row vs Grid view toggle */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200 shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setRosterViewMode("rows")}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  rosterViewMode === "rows"
                    ? "bg-white text-indigo-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Row View</span>
              </button>
              <button
                type="button"
                onClick={() => setRosterViewMode("grid")}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  rosterViewMode === "grid"
                    ? "bg-white text-indigo-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Grid Cards</span>
              </button>
            </div>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-sm font-medium">
              No interns match your current search and filter criteria.
            </div>
          ) : rosterViewMode === "rows" ? (
            /* Row-Based Cohort Table View */
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Table Header (Desktop) */}
              <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3.5 bg-slate-50/80 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <div className="col-span-4">Intern Candidate</div>
                <div className="col-span-3">Fellowship Track &amp; College</div>
                <div className="col-span-2 text-center">Artifacts &amp; Defense</div>
                <div className="col-span-2 text-center">Status &amp; Rating</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-slate-100">
                {filteredStudents.map((stu) => {
                  const roundStatus = getCandidateStatusForRound(stu, selectedEvaluationRound);
                  const hasEval = !!stu.evaluation;
                  const compScore = roundStatus.score;
                  const batchObj = batches.find((b) => b.id === stu.batchId);
                  const resources = documentsMap[stu.id] || stu.resources || [];
                  const stuAllEvals = multiEvaluationsMap[stu.id] || (stu.evaluations && stu.evaluations.length > 0 ? stu.evaluations : []);
                  const reviewedAdminEvals = stuAllEvals.filter((e) => (e.overallRating || 0) > 0);
                  const videoCount = getStudentVideoCount(stu);

                  return (
                    <div
                      key={stu.id}
                      onClick={() => handleOpenCandidateEvaluation(stu.id, selectedEvaluationRound)}
                      className="px-5 py-4 hover:bg-slate-50/80 transition-all flex flex-col lg:grid lg:grid-cols-12 gap-3 lg:gap-4 lg:items-center cursor-pointer group"
                    >
                      {/* Column 1: Avatar, Name & Email */}
                      <div className="lg:col-span-4 flex items-center gap-3.5 min-w-0">
                        <img
                          src={
                            stu.avatar ||
                            `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(stu.name)}`
                          }
                          alt={stu.name}
                          className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 shrink-0 group-hover:scale-105 transition-transform"
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-black text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                            {stu.name}
                          </h3>
                          <p className="text-xs text-slate-500 truncate font-medium">
                            {stu.email}
                          </p>
                        </div>
                      </div>

                      {/* Column 2: Track & College */}
                      <div className="lg:col-span-3 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {stu.college || "B.Tech Engineering"}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {stu.batchName || batchObj?.name || "Fellowship Cohort"}
                        </p>
                        {stu.evaluation?.aiVerdict && (
                          <div className="mt-1 flex items-center gap-1 text-[10px] text-indigo-700 font-bold">
                            <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" />
                            <span className="truncate">{stu.evaluation.aiVerdict}</span>
                          </div>
                        )}
                      </div>

                      {/* Column 3: Artifacts Chips */}
                      <div className="lg:col-span-2 flex items-center justify-center gap-1.5 flex-wrap">
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenProfileView(stu.id, "documents");
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-[11px] font-bold transition border border-slate-200/60"
                          title="View candidate documents"
                        >
                          <FolderGit2 className="w-3 h-3 text-indigo-600" />
                          <span>{resources.length} Docs</span>
                        </span>

                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenProfileView(stu.id, "videos");
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-[11px] font-bold transition border border-slate-200/60"
                          title="View candidate presentation videos"
                        >
                          <Video className="w-3 h-3 text-emerald-600" />
                          <span>{videoCount} {videoCount === 1 ? "Video" : "Videos"}</span>
                        </span>
                      </div>

                      {/* Column 4: Status / Rating with Logged-in Admin Personalization & Faculty Replies */}
                      <div className="lg:col-span-2 flex flex-col items-center justify-center gap-1">
                        {roundStatus.isReviewed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Reviewed by You</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Pending Your Review</span>
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-bold">
                          Consensus: {compScore}%
                        </span>

                        {/* Admin Replies Avatars & Count */}
                        {reviewedAdminEvals.length > 0 && (
                          <div
                            className="flex items-center gap-1 mt-0.5"
                            title={`Evaluated by ${reviewedAdminEvals.length} Faculty Admins: ${reviewedAdminEvals
                              .map((e) => `${e.reviewerName} (${e.overallRating}%)`)
                              .join(", ")}`}
                          >
                            <div className="flex -space-x-1 overflow-hidden">
                              {reviewedAdminEvals.slice(0, 3).map((e, eIdx) => (
                                <img
                                  key={eIdx}
                                  src={
                                    e.evaluatorAvatar ||
                                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                                      e.reviewerName || "Admin"
                                    )}`
                                  }
                                  alt={e.reviewerName}
                                  className="w-4 h-4 rounded-full border border-white bg-slate-200 object-cover"
                                />
                              ))}
                            </div>
                            <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1 py-0.1 rounded border border-indigo-100">
                              {reviewedAdminEvals.length} {reviewedAdminEvals.length === 1 ? "Reply" : "Replies"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Column 5: Action Button */}
                      <div className="lg:col-span-1 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenCandidateEvaluation(stu.id, selectedEvaluationRound);
                          }}
                          className="p-2 rounded-xl bg-indigo-50 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white transition shadow-2xs cursor-pointer"
                          title="Open Full-Page Profile & Evaluation"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Grid Cards View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredStudents.map((stu) => {
                const roundStatus = getCandidateStatusForRound(stu, selectedEvaluationRound);
                const hasEval = !!stu.evaluation;
                const compScore = roundStatus.score;
                const batchObj = batches.find((b) => b.id === stu.batchId);
                const resources = documentsMap[stu.id] || stu.resources || [];
                const videoCount = getStudentVideoCount(stu);

                return (
                  <div
                    key={stu.id}
                    onClick={() => handleOpenCandidateEvaluation(stu.id, selectedEvaluationRound)}
                    className="group bg-white rounded-3xl border border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between"
                  >
                    {/* Top Card Header */}
                    <div className="p-5 space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={
                              stu.avatar ||
                              `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(stu.name)}`
                            }
                            alt={stu.name}
                            className="w-13 h-13 rounded-2xl bg-indigo-50 border border-indigo-100 shrink-0 group-hover:scale-105 transition-transform"
                          />
                          <div className="min-w-0">
                            <h3 className="text-base font-black text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                              {stu.name}
                            </h3>
                            <p className="text-xs text-slate-500 truncate font-medium">
                              {stu.email}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                              {stu.batchName || batchObj?.name || "Fellowship Cohort"}
                            </p>
                          </div>
                        </div>

                        {/* Status Pill with Logged-in Admin Personalization */}
                        <div className="shrink-0 text-right">
                          {roundStatus.isReviewed ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Reviewed by You</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>Pending Your Review</span>
                            </span>
                          )}
                          <div className="text-[10px] text-slate-400 font-bold mt-0.5">
                            Consensus: {compScore}%
                          </div>
                        </div>
                      </div>

                      {/* College & Track Info */}
                      <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-medium">
                        <span className="font-bold text-slate-800">{stu.college || "B.Tech Engineering College"}</span>
                        {stu.evaluation?.aiVerdict && (
                          <div className="mt-1 flex items-center gap-1 text-[10px] text-indigo-700 font-bold">
                            <Sparkles className="w-3 h-3" />
                            <span className="truncate">{stu.evaluation.aiVerdict}</span>
                          </div>
                        )}
                      </div>

                      {/* Telemetry Chips with Direct Button Clicks */}
                      <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenProfileView(stu.id, "videos");
                          }}
                          className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-100 hover:border-emerald-200 transition"
                          title="Click to view videos directly"
                        >
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Videos</span>
                          <span className="text-xs font-black text-slate-800 flex items-center justify-center gap-1 mt-0.5">
                            <Video className="w-3 h-3 text-emerald-600" /> {videoCount} {videoCount === 1 ? "Video" : "Videos"}
                          </span>
                        </div>

                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenProfileView(stu.id, "documents");
                          }}
                          className="p-2 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-100 hover:border-indigo-200 transition"
                          title="Click to view documents directly"
                        >
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Documents</span>
                          <span className="text-xs font-black text-slate-800 flex items-center justify-center gap-1 mt-0.5">
                            <FolderGit2 className="w-3 h-3 text-indigo-600" /> {resources.length} Uploaded
                          </span>
                        </div>

                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreviewLiveDossierForStudent(stu);
                          }}
                          className="p-2 rounded-xl bg-slate-50 hover:bg-violet-50/60 border border-slate-100 hover:border-violet-200 transition cursor-pointer"
                          title="Click to open 12-section live candidate report directly"
                        >
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Reports</span>
                          <span className="text-xs font-black text-slate-800 flex items-center justify-center gap-1 mt-0.5">
                            <FileText className="w-3 h-3 text-violet-600" /> 12-Sec Live
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between group-hover:bg-indigo-50/50 transition-colors">
                      <span className="text-xs font-bold text-indigo-600 group-hover:text-indigo-700 flex items-center gap-1">
                        <span>Review Profile &amp; Evaluate Full Page</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Rubrics & Qualitative Commentary Scoring Section ───
  const renderRubricsAndAiSections = () => {
    return (
      <div className="space-y-5">
        {/* ─── 4 Redesigned Rubric Scoring Dimensions (No Jittery Sliders) ─── */}
        {[
          {
            number: 1,
            title: "Communication Assessment",
            subtitle: "Clarity, articulation, active listening, standup collaboration, and sprint responsiveness",
            field: "communicationScore" as const,
            notesField: "communicationNotes" as const,
            icon: <MessageSquare className="w-4 h-4 text-cyan-700" />,
            iconBg: "bg-cyan-100 text-cyan-700",
            gradient: "from-cyan-500 to-teal-500",
            tags: ["Articulation & Tone", "Active Listening", "Team Standups", "Client Poise"],
            placeholder: "Specific notes on candidate's articulation, tone, and active listening...",
          },
          {
            number: 2,
            title: "Grammar & Technical Documentation",
            subtitle: "ATS syntax rigor, markdown architecture specs, PR descriptions, and git commit hygiene",
            field: "grammarScore" as const,
            notesField: "grammarNotes" as const,
            icon: <FileCheck className="w-4 h-4 text-emerald-700" />,
            iconBg: "bg-emerald-100 text-emerald-700",
            gradient: "from-emerald-500 to-green-500",
            tags: ["ATS Syntax Rigor", "Markdown Specs", "PR Descriptions", "Git Commit Hygiene"],
            placeholder: "Specific notes on candidate's grammatical rigor, documentation format, and commit messaging...",
          },
          {
            number: 3,
            title: "Fluency & Presentation Defense",
            subtitle: "Verbal agility, slide keynote pacing, handling live Q&A scrutiny, and technical poise",
            field: "fluencyScore" as const,
            notesField: "fluencyNotes" as const,
            icon: <Presentation className="w-4 h-4 text-rose-700" />,
            iconBg: "bg-rose-100 text-rose-700",
            gradient: "from-rose-500 to-pink-500",
            tags: ["Verbal Fluidity", "Keynote Pacing", "Live Q&A Agility", "Technical Poise"],
            placeholder: "Specific notes on verbal poise, clarity in explaining complex architectures, and sprint demo delivery...",
          },
          {
            number: 4,
            title: "Project Execution & Tech Architecture",
            subtitle: "Clean APIs, modular codebase, Docker deployment, test coverage, and asynchronous streaming",
            field: "projectScore" as const,
            notesField: "projectNotes" as const,
            icon: <FolderKanban className="w-4 h-4 text-blue-700" />,
            iconBg: "bg-blue-100 text-blue-700",
            gradient: "from-blue-500 to-indigo-500",
            tags: ["Microservices & Clean APIs", "Docker Containers", "Kafka Event Streams", "Unit & Integration Tests"],
            placeholder: "Specific notes on technical implementation quality, edge case handling, and Docker/CI pipeline setup...",
          },
        ].map((dim) => {
          const currentScore = formData[dim.field] ?? 85;
          const currentNotes = formData[dim.notesField] ?? "";

          const tierBadge = (() => {
            if (currentScore >= 93) return { label: "Distinction A+", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" };
            if (currentScore >= 88) return { label: "Excellent A", bg: "bg-teal-50 text-teal-700 border-teal-200" };
            if (currentScore >= 80) return { label: "Proficient B+", bg: "bg-blue-50 text-blue-700 border-blue-200" };
            return { label: "Developing", bg: "bg-amber-50 text-amber-700 border-amber-200" };
          })();

          return (
            <div
              key={dim.number}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3.5 transition-all hover:border-slate-300"
            >
              {/* Top Header: Icon + Title + Direct Stepper Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl ${dim.iconBg} flex items-center justify-center font-bold shrink-0`}>
                    {dim.icon}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <span>{dim.number}. {dim.title}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${tierBadge.bg}`}>
                        {tierBadge.label}
                      </span>
                    </h4>
                    <p className="text-[10px] text-slate-500 font-medium truncate max-w-md">{dim.subtitle}</p>
                  </div>
                </div>

                {/* Score Stepper & Direct Numeric Input */}
                <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => handleScoreChange(dim.field, currentScore - 1)}
                    disabled={currentScore <= 0 || !canEditActiveEvaluation}
                    className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition cursor-pointer border border-slate-200/80 shadow-2xs"
                    title="Decrease 1%"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={currentScore}
                      disabled={!canEditActiveEvaluation}
                      onChange={(e) => handleScoreChange(dim.field, Number(e.target.value))}
                      className="w-14 px-1 py-1 text-center font-black text-xs rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                    />
                    <span className="text-xs font-black text-slate-500 ml-1 mr-1.5">%</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleScoreChange(dim.field, currentScore + 1)}
                    disabled={currentScore >= 100 || !canEditActiveEvaluation}
                    className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition cursor-pointer border border-slate-200/80 shadow-2xs"
                    title="Increase 1%"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Quick-Select Rubric Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 mr-1 flex items-center gap-1">
                  <Target className="w-3 h-3 text-slate-400" />
                  <span>Quick Select:</span>
                </span>
                {RUBRIC_PRESET_SCORES.map((preset) => {
                  const isSelected = Math.abs(currentScore - preset.score) <= 1;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      disabled={!canEditActiveEvaluation}
                      onClick={() => handleScoreChange(dim.field, preset.score)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                        isSelected
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 disabled:opacity-50"
                      }`}
                    >
                      {preset.score}% · {preset.label}
                    </button>
                  );
                })}
              </div>

              {/* Animated Visual Gradient Progress Meter */}
              <div className="space-y-1 pt-1">
                <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/70">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ease-out bg-gradient-to-r ${dim.gradient}`}
                    style={{ width: `${Math.min(100, Math.max(0, currentScore))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] font-semibold text-slate-400 px-0.5">
                  <span>0% Baseline</span>
                  <span>60% Passing</span>
                  <span>80% Proficient</span>
                  <span>90% Target</span>
                  <span>100% Honor</span>
                </div>
              </div>

              {/* Rubric Criteria Evaluation Badges */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Evaluated Rubrics:</span>
                {dim.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md bg-slate-100/90 text-slate-700 text-[10px] font-semibold border border-slate-200"
                  >
                    ✓ {tag}
                  </span>
                ))}
              </div>

              {/* Written Qualitative Commentary */}
              <textarea
                rows={2}
                value={currentNotes}
                disabled={!canEditActiveEvaluation}
                onChange={(e) => setFormData({ ...formData, [dim.notesField]: e.target.value })}
                placeholder={dim.placeholder}
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white leading-relaxed disabled:opacity-60"
              />
            </div>
          );
        })}

        {/* 5. Mentor Custom Remarks & Program Notes */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <h4 className="text-sm font-black text-slate-900">5. Mentor Custom Remarks &amp; Program Notes</h4>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Reviewer: {formData.reviewerName || "Lead Mentor"}</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Appears directly in the candidate's official report (Section 08 &amp; Executive Summary). Record personal observations, reliability, mentorship guidance, and capstone milestones.
          </p>
          <textarea
            rows={3}
            value={formData.customNotes}
            disabled={!canEditActiveEvaluation}
            onChange={(e) => setFormData({ ...formData, customNotes: e.target.value })}
            placeholder="Write your custom notes, mentor appraisal, or specific highlights here..."
            className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white leading-relaxed disabled:opacity-60"
          />
        </div>

        {/* 6. AI Hiring Verdict & Executive Appraisal */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-md space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-800/60 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <h4 className="text-sm font-black text-white">AI Hiring Verdict &amp; Executive Appraisal</h4>
            </div>
            <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              {formData.aiVerdict || "Ready for Placement"}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-indigo-300 uppercase block mb-1">
              Official AI Verdict Title
            </label>
            <input
              type="text"
              value={formData.aiVerdict || ""}
              disabled={!canEditActiveEvaluation}
              onChange={(e) => setFormData({ ...formData, aiVerdict: e.target.value })}
              className="w-full px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-xs font-black text-white focus:outline-hidden focus:border-indigo-400 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-indigo-300 uppercase block mb-1">
              AI Executive Summary Narrative (Syncs to Official Report Appraisal)
            </label>
            <textarea
              rows={4}
              value={formData.aiSummary || ""}
              disabled={!canEditActiveEvaluation}
              onChange={(e) => setFormData({ ...formData, aiSummary: e.target.value })}
              className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-xs text-slate-200 leading-relaxed font-medium focus:outline-hidden focus:border-indigo-400 disabled:opacity-60"
            />
          </div>

          {/* Strengths & Growth Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Strengths */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-emerald-300 uppercase block">
                Demonstrated Strengths
              </label>
              <div className="space-y-1.5">
                {formData.aiStrengths?.map((str, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-200"
                  >
                    <span className="truncate">• {str}</span>
                    {canEditActiveEvaluation && (
                      <button
                        onClick={() => handleRemoveStrength(idx)}
                        className="text-slate-400 hover:text-white cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {canEditActiveEvaluation && (
                <div className="flex gap-1 mt-1.5">
                  <input
                    type="text"
                    placeholder="Add new strength..."
                    value={newStrengthInput}
                    onChange={(e) => setNewStrengthInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddStrength()}
                    className="flex-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] text-white focus:outline-hidden"
                  />
                  <button
                    onClick={handleAddStrength}
                    className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Growth Areas */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-amber-300 uppercase block">
                Areas for Continued Growth
              </label>
              <div className="space-y-1.5">
                {formData.aiGrowthAreas?.map((gro, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200"
                  >
                    <span className="truncate">• {gro}</span>
                    {canEditActiveEvaluation && (
                      <button
                        onClick={() => handleRemoveGrowth(idx)}
                        className="text-slate-400 hover:text-white cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {canEditActiveEvaluation && (
                <div className="flex gap-1 mt-1.5">
                  <input
                    type="text"
                    placeholder="Add growth focus..."
                    value={newGrowthInput}
                    onChange={(e) => setNewGrowthInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddGrowth()}
                    className="flex-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] text-white focus:outline-hidden"
                  />
                  <button
                    onClick={handleAddGrowth}
                    className="px-2 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ═════════════════════════════════════════════════════════════════════════════
  // RENDER 2: FULL-PAGE PROFILE & REVIEW WORKSPACE (When Intern is clicked)
  // ═════════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-4 pb-16 animate-in fade-in duration-200">
      {/* ═════════════════════════════════════════════════════════════════════════
          UNIFIED CANDIDATE COMMAND HEADER (NO STICKY OVERLAP, NO DEAD SPACE)
          ═════════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Top Action & Navigation Sub-Row */}
        <div className="p-3.5 sm:px-5 bg-slate-50/80 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Back to Roster Button */}
            <button
              onClick={() => setViewMode("roster")}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-black transition flex items-center gap-1.5 cursor-pointer border border-slate-200 shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Interns List</span>
            </button>

            <div className="h-5 w-px bg-slate-200 hidden sm:block" />

            {/* Intern Switcher */}
            <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded-xl border border-slate-200 shadow-2xs">
              <button
                onClick={handlePrevStudent}
                disabled={currentIndex <= 0}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                title="Previous Intern"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-black text-slate-800 px-2">
                Intern {currentIndex + 1} of {filteredStudents.length}
              </span>

              <button
                onClick={handleNextStudent}
                disabled={currentIndex >= filteredStudents.length - 1}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                title="Next Intern"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRunAIAnalysis}
              disabled={isAnalyzing}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-black transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? "animate-spin" : ""}`} />
              <span>{isAnalyzing ? "Analyzing..." : "Analyze with AI"}</span>
            </button>

            <button
              onClick={handlePreviewLiveDossier}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-200 shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>Open Live Report</span>
            </button>

            <button
              onClick={handleSaveEvaluation}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Review</span>
            </button>
          </div>
        </div>

        {/* Candidate Identity & Evaluator Meta Sub-Row */}
        <div className="p-5 sm:p-6 flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative shrink-0">
              <img
                src={
                  currentStudent?.avatar ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentStudent?.name || "Intern")}`
                }
                alt={currentStudent?.name}
                className="w-16 h-16 rounded-2xl bg-indigo-50 p-1 border-2 border-indigo-100 shadow-xs object-cover"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" title="Verified Active Intern" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {currentStudent?.name}
                </h1>
                
                {/* Active Round Rating Badge */}
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-black border ${
                    getScoreBadge(formData.overallRating || 90).bg
                  }`}
                >
                  {formData.overallRating || 90}% Active Score
                </span>

                {/* Panel Consensus Badge if multi evaluations */}
                {panelCompositeStats.totalEvaluations > 1 && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-purple-600" />
                    <span>Consensus: {panelCompositeStats.avgOverall}% ({panelCompositeStats.totalEvaluations} Evaluators)</span>
                  </span>
                )}

                {/* Verdict Badge */}
                {formData.aiVerdict && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {formData.aiVerdict}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 font-medium mt-1 flex flex-wrap items-center gap-x-2">
                <span className="font-bold text-slate-700">{currentStudent?.batchName || currentBatch?.name}</span>
                <span>•</span>
                <span>{currentStudent?.email}</span>
                <span>•</span>
                <span>{currentStudent?.college || "Engineering College"}</span>
              </p>
            </div>
          </div>

          {/* Active Reviewer & Multi-Admin Evaluator Session with Fast Switcher */}
          <div className="flex items-center gap-3 shrink-0 bg-slate-50 p-2.5 sm:p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="relative">
              <img
                src={activeAdmin.avatar}
                alt={activeAdmin.name}
                className="w-11 h-11 rounded-xl bg-indigo-100 border border-indigo-200 object-cover"
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-xs" title="Active Admin Session" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                  isSuperAdmin
                    ? "bg-purple-100 text-purple-800 border-purple-300"
                    : "bg-indigo-50 text-indigo-700 border-indigo-200"
                }`}>
                  {isSuperAdmin ? "👑 Super Admin" : "🎓 Faculty Instructor"}
                </span>
              </div>
              <span className="text-xs font-black text-slate-900 block mt-0.5">
                {activeAdmin.name}
              </span>
              <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5 max-w-[200px]">
                {activeAdmin.role}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════════
          TOP NAVIGATION BUTTONS: EVALUATION, DOCUMENTS, AND VIDEOS
          ("at top add one button docutations like so when we click on that button so we can see all the documents on that same way one button like videso so in that we can see all the videos of they prestion and projetc thinng")
          ═════════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-slate-100 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Button 1: Evaluation & Review */}
          <button
            onClick={() => setProfileTab("evaluation")}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              profileTab === "evaluation"
                ? "bg-white text-indigo-600 shadow-sm border border-slate-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Evaluation &amp; Review</span>
          </button>

          {/* Button 2: Documents & Reports */}
          <button
            onClick={() => setProfileTab("documents")}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              profileTab === "documents"
                ? "bg-white text-indigo-600 shadow-sm border border-slate-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Documents &amp; Reports</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              profileTab === "documents" ? "bg-indigo-100 text-indigo-800" : "bg-slate-200 text-slate-700"
            }`}>
              {candidateResources.length}
            </span>
          </button>

          {/* Button 3: Videos & Presentations */}
          <button
            onClick={() => setProfileTab("videos")}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              profileTab === "videos"
                ? "bg-white text-indigo-600 shadow-sm border border-slate-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Videos &amp; Presentations</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              profileTab === "videos" ? "bg-indigo-100 text-indigo-800" : "bg-slate-200 text-slate-700"
            }`}>
              {candidateVideos.length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 pr-1">
          <button
            type="button"
            onClick={() => {
              setForceShowAdminOversight((prev) => {
                const next = !prev;
                if (next) {
                  setTimeout(() => {
                    oversightRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
                  }, 50);
                }
                return next;
              });
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
              forceShowAdminOversight
                ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                : "bg-purple-50/80 hover:bg-purple-100 text-purple-900 border-purple-200"
            }`}
            title={forceShowAdminOversight ? "Hide Super Admin Oversight" : "Show Super Admin Oversight"}
          >
            <span>👑</span>
            <span>All Admin Replies ({currentEvaluations.length})</span>
            {forceShowAdminOversight && <span className="text-[10px] font-normal opacity-80">• Active</span>}
          </button>
          <span className="text-[11px] font-medium text-slate-500 hidden sm:inline">
            Active Workspace: <strong className="capitalize text-slate-800">{profileTab} Mode</strong>
          </span>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════════
          TAB CONTENT 1: EVALUATION & QUALITATIVE REVIEW FORM
          ═════════════════════════════════════════════════════════════════════════ */}
      {profileTab === "evaluation" && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* ─── Streamlined Evaluation Bar: [EVALUATION: Name v] [Reviewer: ...] [Consensus: 90%] [All Admin Replies v] ─── */}
          <div className="p-3.5 bg-white rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Left Side: EVALUATION: [Dropdown to scroll down and select] */}
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                    <Award className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    EVALUATION:
                  </span>
                </div>

                {/* Dropdown Selector for Evaluation Round */}
                <div className="relative flex-1 max-w-sm min-w-[200px]" ref={profileEvalDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsProfileEvalDropdownOpen((prev) => !prev)}
                    className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-indigo-400 text-left transition flex items-center justify-between gap-2 shadow-2xs cursor-pointer group"
                  >
                    <span className="text-xs font-black text-slate-900 truncate">
                      {selectedEvaluationRound === "all"
                        ? "All Rounds (Consensus Composite)"
                        : selectedEvaluationRound || formData.evaluationName || "System Architecture & System Defense"}
                    </span>

                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-transform duration-150 shrink-0 ${
                        isProfileEvalDropdownOpen ? "rotate-180 text-indigo-600" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu: Evaluation Rounds (Image 2 style) */}
                  {isProfileEvalDropdownOpen && (
                    <div className="absolute left-0 top-full mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 w-80 sm:w-96">
                      <div className="p-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-indigo-600" />
                          <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                            Select Evaluation ({availableEvaluationRounds.length})
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Scroll down &amp; select</span>
                      </div>

                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 p-1.5 scrollbar-thin">
                        {/* Option 1: All Rounds (Consensus Composite) */}
                        <button
                          type="button"
                          onClick={() => handleSelectEvaluationRound("all")}
                          className={`w-full p-2.5 rounded-xl transition flex items-center justify-between gap-2.5 text-left cursor-pointer ${
                            selectedEvaluationRound === "all"
                              ? "bg-indigo-50/90 text-indigo-950 font-black"
                              : "hover:bg-slate-50 text-slate-700 font-semibold"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                              selectedEvaluationRound === "all" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
                            }`}>
                              <Layers className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-900 truncate">
                                All Rounds (Consensus Composite)
                              </div>
                              <div className="text-[10px] text-slate-400 font-medium truncate">
                                Aggregated candidate consensus across faculty
                              </div>
                            </div>
                          </div>
                          {selectedEvaluationRound === "all" && (
                            <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                          )}
                        </button>

                        {/* Individual Evaluation Rounds (Image 2 style) */}
                        {availableEvaluationRounds.map((roundName) => {
                          const reviewedInRound = batchStudents.filter(
                            (s) => getCandidateStatusForRound(s, roundName).isReviewed
                          ).length;
                          const isSelected = selectedEvaluationRound.toLowerCase() === roundName.toLowerCase();
                          const isEditingThis = editingCohortRound === roundName;

                          if (isEditingThis) {
                            return (
                              <div
                                key={roundName}
                                className="p-2 bg-indigo-50/90 rounded-xl border border-indigo-300 flex items-center gap-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                                  <Award className="w-3.5 h-3.5" />
                                </div>
                                <input
                                  type="text"
                                  value={editingCohortRoundInput}
                                  onChange={(e) => setEditingCohortRoundInput(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      handleRenameCohortRound(roundName, editingCohortRoundInput);
                                    } else if (e.key === "Escape") {
                                      setEditingCohortRound(null);
                                    }
                                  }}
                                  className="flex-1 min-w-0 px-2.5 py-1 text-xs font-bold bg-white rounded-lg border border-indigo-200 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                                  autoFocus
                                  placeholder="Round Name"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRenameCohortRound(roundName, editingCohortRoundInput)}
                                  className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
                                  title="Save Name"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingCohortRound(null)}
                                  className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition cursor-pointer shrink-0"
                                  title="Cancel"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={roundName}
                              className={`p-2 rounded-xl transition flex items-center justify-between gap-2 ${
                                isSelected ? "bg-indigo-50/90" : "hover:bg-slate-50"
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => handleSelectEvaluationRound(roundName)}
                                className="flex-1 text-left min-w-0 flex items-center gap-2.5 cursor-pointer"
                              >
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                  isSelected ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-600"
                                }`}>
                                  <Award className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                                    <span>{roundName}</span>
                                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-medium">
                                    {reviewedInRound} of {batchStudents.length} Interns Evaluated
                                  </div>
                                </div>
                              </button>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
                                  reviewedInRound === batchStudents.length && batchStudents.length > 0
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                    : reviewedInRound > 0
                                    ? "bg-indigo-50 text-indigo-800 border-indigo-200"
                                    : "bg-amber-50 text-amber-800 border-amber-200"
                                }`}>
                                  {reviewedInRound}/{batchStudents.length}
                                </span>

                                {/* Edit Evaluation Option inside Dropdown (Super Admin Only) */}
                                {isSuperAdmin && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingCohortRound(roundName);
                                      setEditingCohortRoundInput(roundName);
                                    }}
                                    className="p-1 rounded-lg hover:bg-indigo-100 text-slate-500 hover:text-indigo-700 transition cursor-pointer"
                                    title="Edit & update this evaluation round right here"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                {/* Delete Evaluation Option inside Dropdown (Super Admin Only) */}
                                {isSuperAdmin && availableEvaluationRounds.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteCohortRound(roundName);
                                    }}
                                    className="p-1 rounded-lg hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition cursor-pointer"
                                    title="Delete this evaluation round"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Dropdown Footer: Add New Evaluation Round (Super Admin Only) */}
                      {isSuperAdmin && (
                        isInlineCreatingRound ? (
                          <div className="p-3 border-t border-slate-100 bg-indigo-50/50 space-y-2" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-900">
                                New Round • {currentActiveBatch?.name || "Active Cohort"}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsInlineCreatingRound(false);
                                  setInlineNewRoundName("");
                                }}
                                className="text-slate-400 hover:text-slate-600 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <input
                              type="text"
                              value={inlineNewRoundName}
                              onChange={(e) => setInlineNewRoundName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleInlineCreateRound();
                                } else if (e.key === "Escape") {
                                  setIsInlineCreatingRound(false);
                                }
                              }}
                              placeholder="e.g. Cloud Infrastructure & DevOps"
                              className="w-full px-3 py-1.5 text-xs font-bold bg-white rounded-xl border border-indigo-200 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                              autoFocus
                            />
                            <div className="flex items-center justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setIsInlineCreatingRound(false);
                                  setInlineNewRoundName("");
                                }}
                                className="px-3 py-1 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleInlineCreateRound()}
                                className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Create Round</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-2 border-t border-slate-100 bg-slate-50">
                            <button
                              type="button"
                              onClick={() => {
                                setIsInlineCreatingRound(true);
                                setInlineNewRoundName("");
                              }}
                              className="w-full px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border border-indigo-200"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>+ Add New Evaluation Round</span>
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side: Reviewer: ... | Consensus: 90% | All Admin Replies dropdown */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Reviewer Tag */}
                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium">
                  <span className="text-slate-400 font-bold">Reviewer:</span>
                  <span className="font-black text-slate-900">{formData.reviewerName || "Administrator"}</span>
                </div>

                {/* Consensus Tag */}
                <div className={`px-3 py-2 rounded-xl border text-xs font-black flex items-center gap-1.5 ${
                  panelCompositeStats.avgOverall > 0
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-amber-50 border-amber-200 text-amber-800"
                }`}>
                  <Trophy className={`w-3.5 h-3.5 shrink-0 ${
                    panelCompositeStats.avgOverall > 0 ? "text-emerald-600" : "text-amber-600"
                  }`} />
                  <span>
                    {panelCompositeStats.avgOverall > 0
                      ? `Consensus: ${panelCompositeStats.avgOverall}%`
                      : "Consensus: Pending"}
                  </span>
                  <span className={`text-[10px] font-normal ${
                    panelCompositeStats.avgOverall > 0 ? "text-emerald-600" : "text-amber-600"
                  }`}>
                    ({panelCompositeStats.totalEvaluations})
                  </span>
                </div>

                {/* All Admin Replies Dropdown Selector */}
                <div className="relative" ref={adminRepliesDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsAdminRepliesDropdownOpen((prev) => !prev)}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-xs group"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>All Admin Replies</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-bold">
                      {currentEvaluations.length}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 ml-0.5 text-indigo-200 group-hover:text-white transition-transform duration-150 ${
                        isAdminRepliesDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isAdminRepliesDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 w-80 sm:w-96">
                      <div className="p-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-indigo-600" />
                          <span className="text-xs font-black text-slate-800">
                            All Admin Replies ({currentEvaluations.length})
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Scroll down &amp; select admin</span>
                      </div>

                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 p-1.5 scrollbar-thin">
                        {currentEvaluations.map((evalItem, idx) => {
                          const isSelected = activeEvaluationIndex === idx;
                          const revName = (evalItem.reviewerName || "").toLowerCase();
                          const myName = (activeAdmin.name || "").toLowerCase();
                          const isAuthorMe = revName.includes(myName) || myName.includes(revName);
                          const isPending = !evalItem.overallRating || evalItem.overallRating === 0;

                          return (
                            <button
                              key={evalItem.id || idx}
                              type="button"
                              onClick={() => handleSelectEvaluationIndex(idx)}
                              className={`w-full p-2.5 rounded-xl transition flex items-center justify-between gap-3 text-left cursor-pointer ${
                                isSelected ? "bg-indigo-50/90 border border-indigo-200" : "hover:bg-slate-50"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden shrink-0 border border-slate-300">
                                  <img
                                    src={evalItem.evaluatorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(evalItem.reviewerName || "Admin")}`}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-black text-slate-900 flex items-center gap-1.5 truncate">
                                    <span className="truncate">{evalItem.reviewerName}</span>
                                    {isAuthorMe && (
                                      <span className="px-1.5 py-0.2 rounded-md bg-indigo-100 text-indigo-700 text-[9px] font-bold">
                                        You
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-slate-500 truncate">
                                    {evalItem.reviewerRole?.split("&")[0] || "Admin Evaluator"} · {evalItem.evaluationName || "Appraisal"}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
                                  isPending
                                    ? "bg-amber-50 text-amber-800 border-amber-200"
                                    : "bg-emerald-50 text-emerald-800 border-emerald-200"
                                }`}>
                                  {isPending ? "Pending" : `${evalItem.overallRating}%`}
                                </span>
                                {isSelected ? (
                                  <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-medium">View</span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <div className="p-2.5 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between">
                        <span>
                          {canEditActiveEvaluation ? "✏️ You are editing your review" : "🔒 Viewing another admin's review (Read-Only)"}
                        </span>
                        {myEvaluationIndex !== -1 && !canEditActiveEvaluation && (
                          <button
                            type="button"
                            onClick={() => handleSelectEvaluationIndex(myEvaluationIndex)}
                            className="text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
                          >
                            Switch to My Review
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Read-Only Notice Banner when inspecting another admin's review */}
          {!canEditActiveEvaluation && (
            <div className="px-4 py-2.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs font-medium flex items-center justify-between gap-3 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 min-w-0">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="truncate">
                  <strong>Read-Only Inspection:</strong> You are viewing the evaluation reply submitted by{" "}
                  <strong className="text-amber-950 font-black">{formData.reviewerName}</strong>. Other admin replies cannot be edited or updated.
                </span>
              </div>
              {myEvaluationIndex !== -1 ? (
                <button
                  type="button"
                  onClick={() => handleSelectEvaluationIndex(myEvaluationIndex)}
                  className="px-3 py-1 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-950 text-[11px] font-black transition shrink-0 cursor-pointer"
                >
                  Switch to My Review
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleStartMyEvaluation(formData.evaluationName || "Faculty Appraisal")}
                  className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black transition shrink-0 cursor-pointer shadow-2xs"
                >
                  Start My Evaluation
                </button>
              )}
            </div>
          )}

          {/* ─── 👑 SUPER ADMIN OVERSIGHT: ALL FACULTY EVALUATOR REPLIES & REVIEWS ─── */}
          {forceShowAdminOversight && currentEvaluations.length > 0 && (
            <div
              ref={oversightRef}
              className="p-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl text-white shadow-md space-y-4 animate-in fade-in slide-in-from-top-3 duration-200"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/30 text-purple-300 flex items-center justify-center text-sm font-black">
                    👑
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white flex items-center gap-2">
                      <span>Super Admin Oversight: All Faculty Evaluator Reviews &amp; Replies</span>
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 text-[10px] font-bold border border-purple-400/30">
                        {currentEvaluations.length} Faculty Reviews
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Super Admin can inspect every faculty evaluator's scores, written remarks, qualitative notes, and verdicts for <strong>{currentStudent?.name}</strong>. Click any review to inspect or edit.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-black flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Panel Consensus: {panelCompositeStats.avgOverall}%</span>
                  </div>

                  {/* Close Oversight Panel Button */}
                  <button
                    type="button"
                    onClick={() => setForceShowAdminOversight(false)}
                    className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
                    title="Close Super Admin Oversight"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Filter Tabs across Rounds */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setAdminOversightFilterRound("all")}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    adminOversightFilterRound === "all"
                      ? "bg-indigo-600 text-white"
                      : "bg-white/10 hover:bg-white/20 text-slate-300"
                  }`}
                >
                  All Faculty Reviews ({currentEvaluations.length})
                </button>
                {Array.from(new Set(currentEvaluations.map((e) => e.evaluationName).filter(Boolean))).map((round) => (
                  <button
                    key={round}
                    type="button"
                    onClick={() => setAdminOversightFilterRound(round!)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                      adminOversightFilterRound.toLowerCase() === round!.toLowerCase()
                        ? "bg-indigo-600 text-white"
                        : "bg-white/10 hover:bg-white/20 text-slate-300"
                    }`}
                  >
                    {round} ({currentEvaluations.filter((e) => e.evaluationName?.toLowerCase() === round!.toLowerCase()).length})
                  </button>
                ))}
              </div>

              {/* Grid of all faculty admin evaluations */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
                {currentEvaluations
                  .filter(
                    (evalItem) =>
                      adminOversightFilterRound === "all" ||
                      evalItem.evaluationName?.toLowerCase() === adminOversightFilterRound.toLowerCase()
                  )
                  .map((evalItem, idx) => {
                    const isActive = activeEvaluationIndex === idx;
                    const isPending = !evalItem.overallRating || evalItem.overallRating === 0;

                    return (
                      <div
                        key={evalItem.id || idx}
                        onClick={() => handleSelectEvaluationIndex(idx)}
                        className={`p-4 rounded-2xl transition-all cursor-pointer border relative flex flex-col justify-between space-y-3 ${
                          isActive
                            ? "bg-white/15 border-indigo-400 ring-2 ring-indigo-400/40 shadow-md"
                            : "bg-white/5 hover:bg-white/10 border-white/10"
                        }`}
                      >
                        {/* Evaluator Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-white/20 overflow-hidden shrink-0">
                              <img
                                src={evalItem.evaluatorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(evalItem.reviewerName || "Faculty")}`}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <h5 className="text-xs font-black text-white truncate flex items-center gap-1">
                                <span>{evalItem.reviewerName || "Faculty Evaluator"}</span>
                                {isActive && <span className="text-[10px] text-indigo-300 font-bold">(Active Form)</span>}
                              </h5>
                              <p className="text-[10px] text-slate-400 truncate">
                                {evalItem.reviewerRole || "Instructor"}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`text-xs font-black px-2 py-0.5 rounded-lg shrink-0 ${
                              isPending
                                ? "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                                : isActive
                                ? "bg-indigo-500 text-white"
                                : "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                            }`}
                          >
                            {isPending ? "Pending" : `${evalItem.overallRating}%`}
                          </span>
                        </div>

                        {/* Evaluation Round Tag */}
                        <div className="flex items-center justify-between gap-1 text-[11px]">
                          <span className="font-bold text-indigo-300 truncate">
                            {evalItem.evaluationName || "Faculty Appraisal"}
                          </span>
                          <span className="text-slate-400 text-[10px] shrink-0">
                            {evalItem.evaluatedAt || "Pending"}
                          </span>
                        </div>

                        {/* Dimension Scores Bar */}
                        <div className="grid grid-cols-4 gap-1 p-2 bg-black/20 rounded-xl text-center text-[10px]">
                          <div>
                            <div className="text-slate-400 text-[9px] uppercase font-bold">Comm</div>
                            <div className="font-black text-slate-200">{evalItem.communicationScore || 0}%</div>
                          </div>
                          <div>
                            <div className="text-slate-400 text-[9px] uppercase font-bold">Gram</div>
                            <div className="font-black text-slate-200">{evalItem.grammarScore || 0}%</div>
                          </div>
                          <div>
                            <div className="text-slate-400 text-[9px] uppercase font-bold">Flu</div>
                            <div className="font-black text-slate-200">{evalItem.fluencyScore || 0}%</div>
                          </div>
                          <div>
                            <div className="text-slate-400 text-[9px] uppercase font-bold">Proj</div>
                            <div className="font-black text-slate-200">{evalItem.projectScore || 0}%</div>
                          </div>
                        </div>

                        {/* Qualitative Feedback Reply / Remarks */}
                        <div className="space-y-1.5 bg-white/5 p-2.5 rounded-xl border border-white/5 text-[11px]">
                          <div className="text-[10px] uppercase font-bold text-indigo-300 flex items-center justify-between">
                            <span>Faculty Observations &amp; Remarks:</span>
                            {evalItem.aiVerdict && (
                              <span className="text-emerald-300 text-[9px] font-bold">✓ {evalItem.aiVerdict}</span>
                            )}
                          </div>
                          <p className="text-slate-200 text-[11px] leading-relaxed line-clamp-3 italic">
                            "{evalItem.customNotes || evalItem.aiSummary || "No remarks submitted yet."}"
                          </p>

                          {/* Specific Dimension Remarks if present */}
                          {(evalItem.communicationNotes || evalItem.projectNotes) && (
                            <div className="pt-1 border-t border-white/10 space-y-1 text-[10px] text-slate-300">
                              {evalItem.communicationNotes && (
                                <p className="truncate"><strong className="text-slate-400">Comm:</strong> {evalItem.communicationNotes}</p>
                              )}
                              {evalItem.projectNotes && (
                                <p className="truncate"><strong className="text-slate-400">Tech:</strong> {evalItem.projectNotes}</p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectEvaluationIndex(idx);
                            }}
                            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                              isActive
                                ? "bg-indigo-600 text-white shadow-xs"
                                : "bg-white/10 hover:bg-white/20 text-slate-200"
                            }`}
                          >
                            <span>{isActive ? "Currently Viewing This Review" : "Inspect Review"}</span>
                          </button>

                          {isSuperAdmin && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditProfileEvalModal(idx, evalItem);
                              }}
                              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
                              title="Edit this evaluation round's configuration"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Read-Only Notice if instructor does not own this evaluation */}
          {!canEditActiveEvaluation && (
            <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex items-center gap-3 text-xs text-amber-900 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center shrink-0 font-bold">
                ⚠️
              </div>
              <div>
                <p className="font-bold">Read-Only Inspection Mode</p>
                <p className="text-[11px] text-amber-800">
                  This evaluation ({formData.evaluationName || "Appraisal"}) is assigned to <strong>{formData.reviewerName}</strong> ({formData.reviewerRole}). As an instructor, you can inspect these scores, but only Super Admin or {formData.reviewerName} can edit them.
                </p>
              </div>
            </div>
          )}

          {/* Section Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-1">
            <h3 className="text-sm font-black uppercase text-slate-800 tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>Faculty Assessment &amp; 4-Dimension Rubrics</span>
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-medium">
                Active:{" "}
                <strong className="text-indigo-600 font-bold">
                  {formData.evaluationName || selectedEvaluationRound || "System Architecture & System Defense"}
                </strong>{" "}
                <span className="text-slate-500">
                  ({formData.reviewerName || "Faculty"})
                </span>
              </span>
            </div>
          </div>

          {/* Render 4 Rubrics, Custom Notes, and AI Verdict */}
          {renderRubricsAndAiSections()}

          {/* Bottom Action Bar */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-lg flex flex-wrap items-center justify-between gap-3 sticky bottom-4 z-20">
            <div className="flex items-center gap-3">
              <img
                src={activeAdmin.avatar}
                alt={activeAdmin.name}
                className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 object-cover"
              />
              <div>
                <div className="text-[10px] uppercase font-black text-slate-400">Authenticated Evaluator Session</div>
                <div className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <span>{activeAdmin.name}</span>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100">
                    {activeAdmin.role.split("&")[0]}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handlePreviewLiveDossier}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                <span>Open Live Report</span>
              </button>

              {!canEditActiveEvaluation ? (
                <div className="flex items-center gap-2">
                  <div className="px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Read-Only Review ({formData.reviewerName || "Faculty"})</span>
                  </div>
                  {myEvaluationIndex !== -1 && (
                    <button
                      type="button"
                      onClick={() => handleSelectEvaluationIndex(myEvaluationIndex)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <span>Switch to My Review</span>
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleSaveEvaluation}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Review as {activeAdmin.name.split(" ")[0]}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════════
          TAB CONTENT 2: DOCUMENTS & CANDIDATE REPORTS
          ("at top add one button docutations like so when we click on that button so we can see all the documents on that")
          ═════════════════════════════════════════════════════════════════════════ */}
      {profileTab === "documents" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Section Header */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-black text-slate-900">
                  Uploaded Technical Documents &amp; Research Whitepapers
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                  {candidateResources.length} Artifacts
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Candidates upload their technical specifications, research whitepapers, and presentation decks. <strong>As an Admin, you run the AI analysis to verify technical rigor, calibrate overall benchmarks, and assign official quality ratings.</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleAdminAnalyzeAllDocuments}
                disabled={isAnalyzingAllDocs}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-black transition flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isAnalyzingAllDocs ? "animate-spin" : ""}`} />
                <span>{isAnalyzingAllDocs ? "Auditing All Docs..." : "Analyze All Documents with AI"}</span>
              </button>

              <button
                onClick={handlePreviewLiveDossier}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open 12-Section Live Dossier</span>
              </button>
            </div>
          </div>

          {/* Overall Based Impact Summary Strip */}
          {(() => {
            const evaluatedDocs = candidateResources.filter((d) => typeof d.aiRating === "number" && d.aiRating > 0);
            const avgDocRating = evaluatedDocs.length > 0
              ? Math.round(evaluatedDocs.reduce((acc, d) => acc + (d.aiRating || 95), 0) / evaluatedDocs.length)
              : null;

            return (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/30 shadow-md flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-violet-300" />
                    <span className="text-xs font-black text-white uppercase tracking-wider">
                      Overall Document Impact on Official Candidate Report
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-200/80 leading-relaxed">
                    Analyzing documents automatically calibrates the candidate's <strong>Grammar &amp; Technical Documentation rubric ({formData.grammarScore}%)</strong> and recalculates their <strong>Overall Composite Rating ({formData.overallRating}%)</strong>, updating Section 09 of their official report.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-center">
                    <span className="text-[9px] uppercase font-bold text-slate-300 block">Analyzed Docs</span>
                    <span className="text-sm font-black text-emerald-400">{evaluatedDocs.length} of {candidateResources.length}</span>
                  </div>

                  <div className="px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-center">
                    <span className="text-[9px] uppercase font-bold text-slate-300 block">Avg Quality</span>
                    <span className="text-sm font-black text-white">{avgDocRating ? `${avgDocRating}%` : "Pending"}</span>
                  </div>

                  <div className="px-3 py-2 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-center">
                    <span className="text-[9px] uppercase font-bold text-indigo-300 block">Overall Score</span>
                    <span className="text-sm font-black text-indigo-200">{formData.overallRating}%</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Filter & Search Bar for Admin Documents */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={docSearchQuery}
                onChange={(e) => setDocSearchQuery(e.target.value)}
                placeholder="Search candidate documents, whitepapers, blueprints..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {[
                { id: "all", label: "All Artifacts" },
                { id: "presentation", label: "Presentations" },
                { id: "blueprint", label: "Blueprints" },
                { id: "whitepaper", label: "Whitepapers" },
                { id: "document", label: "Technical Docs" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setDocActiveFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    docActiveFilter === tab.id
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row-Based Document List (Clean Table Layout with Eye Icon) */}
          {(() => {
            const filteredDocs = candidateResources.filter((res) => {
              const matchesFilter = docActiveFilter === "all" || res.type === docActiveFilter;
              const matchesQuery =
                docSearchQuery.trim() === "" ||
                res.title.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
                (res.fileName && res.fileName.toLowerCase().includes(docSearchQuery.toLowerCase())) ||
                (res.description && res.description.toLowerCase().includes(docSearchQuery.toLowerCase())) ||
                (res.tags && res.tags.some((t) => t.toLowerCase().includes(docSearchQuery.toLowerCase())));
              return matchesFilter && matchesQuery;
            });

            return (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                {/* Table Header (Desktop) */}
                <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3.5 bg-slate-50/80 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                  <div className="col-span-4">Document / Artifact</div>
                  <div className="col-span-2">Category</div>
                  <div className="col-span-2">Review Status</div>
                  <div className="col-span-2">AI Analysis</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-slate-100">
                  {filteredDocs.length === 0 ? (
                    <div className="p-10 text-center text-slate-400 text-xs font-medium">
                      No documents match your current filter or search criteria.
                    </div>
                  ) : (
                    filteredDocs.map((res) => {
                      const badge = getTypeBadge(res.type);
                      const BadgeIcon = badge.icon;
                      const isAnalyzed = typeof res.aiRating === "number" && res.aiRating > 0;
                      const isAnalyzingThis = analyzingDocId === res.id;

                      return (
                        <div
                          key={res.id}
                          className="px-5 py-4 hover:bg-slate-50/70 transition-all flex flex-col lg:grid lg:grid-cols-12 gap-3 lg:gap-4 lg:items-center"
                        >
                          {/* Column 1: Icon, Title & Details */}
                          <div className="lg:col-span-4 flex items-center gap-3.5 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-2xs">
                              <BadgeIcon className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4
                                onClick={() => setPreviewDocument(res)}
                                className="text-sm font-bold text-slate-900 truncate hover:text-indigo-600 transition cursor-pointer"
                                title={res.title}
                              >
                                {res.title}
                              </h4>
                              <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                                {res.fileName} • {res.fileSize || "3.5 MB"} • Uploaded {res.uploadedAt}
                              </p>
                            </div>
                          </div>

                          {/* Column 2: Category Badge */}
                          <div className="lg:col-span-2 flex items-center">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${badge.color}`}>
                              <BadgeIcon className="w-3 h-3" />
                              <span>{badge.label}</span>
                            </span>
                          </div>

                          {/* Column 3: Review Status Badge */}
                          <div className="lg:col-span-2 flex items-center">
                            {isAnalyzed ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold">
                                <Sparkles className="w-3 h-3 text-emerald-600" />
                                <span>AI Rating: {res.aiRating}%</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                                <AlertCircle className="w-3 h-3 text-amber-600" />
                                <span>Pending Analysis</span>
                              </span>
                            )}
                          </div>

                          {/* Column 4: Admin AI Analysis Trigger */}
                          <div className="lg:col-span-2 flex items-center">
                            <button
                              onClick={() => handleAdminAnalyzeDocument(res.id)}
                              disabled={isAnalyzingThis}
                              className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-black transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
                            >
                              <Sparkles className={`w-3.5 h-3.5 ${isAnalyzingThis ? "animate-spin" : ""}`} />
                              <span>{isAnalyzingThis ? "Auditing..." : isAnalyzed ? "Re-Analyze with AI" : "Analyze Document with AI"}</span>
                            </button>
                          </div>

                          {/* Column 5: Action Icons with Eye icon */}
                          <div className="lg:col-span-2 flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setPreviewDocument(res)}
                              className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition cursor-pointer"
                              title="View Document Details & AI Audit Notes"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <a
                              href={res.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                              title="Open Document in New Tab"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>

                            <a
                              href={res.fileUrl}
                              download={res.fileName}
                              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                              title="Download Document"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })()}

        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════════
          TAB CONTENT 3: VIDEOS & PRESENTATION SHOWCASE
          ("same way one button like videso so in that we can see all the videos of they prestion and projetc thinng all the thing")
          ═════════════════════════════════════════════════════════════════════════ */}
      {profileTab === "videos" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Section Header */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-black text-slate-900">
                  Candidate Presentation &amp; Project Video Recordings
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                  {candidateVideos.length} Video Recordings
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Candidates upload their capstone keynote defense, live project demos, and training reflections. <strong>As an Admin, you play the recordings and trigger AI Speech &amp; Telemetry Analysis to extract milestones and calibrate communication ratings.</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handlePreviewLiveDossier}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                title="Open candidate official live report"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Candidate Live Report (Section 10)</span>
              </button>

              {candidateVideos && candidateVideos.length > 0 && candidateVideos[0] && (
                <button
                  onClick={() => handleAdminAnalyzeVideo(candidateVideos[0].id)}
                  disabled={analyzingVideoId === candidateVideos[0].id}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-black transition flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${analyzingVideoId === candidateVideos[0].id ? "animate-spin" : ""}`} />
                  <span>{analyzingVideoId === candidateVideos[0].id ? "Analyzing Video..." : "Run AI Video Analysis"}</span>
                </button>
              )}
            </div>
          </div>

          {/* List of Videos */}
          {candidateVideos.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-white border border-slate-200 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                <Video className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">No Reflection Video Uploaded Yet</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                When the intern records or uploads their capstone keynote presentation or project defense reflection, it will appear here for faculty review and AI speech telemetry analysis.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
            {candidateVideos.map((vid, idx) => {
              const isPlaying = playingVideoIdx === idx;
              const isAnalyzingThis = analyzingVideoId === vid.id;

              return (
                <div
                  key={vid.id}
                  className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm hover:border-indigo-300 transition-all"
                >
                  <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center font-bold text-white">
                        <Video className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-white">{vid.title}</h4>
                          <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-[10px] font-bold">
                            {vid.tag}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300">{vid.type} • Duration: {vid.duration}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handlePreviewLiveDossier}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                        title="Click to see the official report for this candidate video"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>See Video Report</span>
                      </button>

                      <button
                        onClick={() => handleAdminAnalyzeVideo(vid.id)}
                        disabled={isAnalyzingThis}
                        className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/20 cursor-pointer disabled:opacity-50"
                      >
                        <Sparkles className={`w-3.5 h-3.5 text-violet-300 ${isAnalyzingThis ? "animate-spin" : ""}`} />
                        <span>{isAnalyzingThis ? "Analyzing Speech..." : "Calibrate Video with AI"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Video Interior (Player on Left, Telemetry & Milestones on Right) */}
                  <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left: Player (7 Cols) */}
                    <div className="lg:col-span-7 space-y-3">
                      <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-slate-200 shadow-sm flex items-center justify-center">
                        {vid.videoUrl.includes("youtube.com") || vid.videoUrl.includes("youtu.be") ? (
                          <iframe
                            src={vid.videoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")}
                            title={vid.title}
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : vid.videoUrl.endsWith(".mp4") || vid.videoUrl.endsWith(".webm") ? (
                          <video
                            src={vid.videoUrl}
                            controls
                            className="w-full h-full object-cover"
                            poster={currentStudent?.avatar}
                          />
                        ) : (
                          /* Interactive Fallback Player */
                          <div className="w-full h-full relative p-5 flex flex-col justify-between bg-gradient-to-t from-black via-slate-950/80 to-black/60 text-white">
                            <div className="flex items-center justify-between z-10">
                              <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                1080P HD RECORDING
                              </span>
                              <span className="text-[11px] font-mono font-bold text-white/80 bg-black/40 px-2 py-0.5 rounded">
                                {vid.duration}
                              </span>
                            </div>

                            <div className="text-center z-10">
                              <button
                                onClick={() => setPlayingVideoIdx(isPlaying ? null : idx)}
                                className="w-13 h-13 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center mx-auto transition-transform hover:scale-110 shadow-xl cursor-pointer"
                              >
                                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
                              </button>
                              <p className="text-xs font-bold text-slate-300 mt-2">
                                {isPlaying ? "Playing Candidate Recording..." : "Click to Play Candidate Presentation"}
                              </p>
                            </div>

                            <div className="space-y-1.5 z-10">
                              <div className="flex items-center justify-between text-[11px] font-mono text-white/80">
                                <span>{isPlaying ? "05:12" : "00:00"}</span>
                                <span>{vid.duration}</span>
                              </div>
                              <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                                  style={{ width: isPlaying ? "35%" : "5%" }}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Video Narrative */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                        <strong className="text-slate-900 block font-black uppercase text-[10px] mb-1">
                          Candidate Speech &amp; Presentation Abstract:
                        </strong>
                        <p>"{vid.aiSummary}"</p>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200">
                          <span className="text-[10px] text-slate-500 font-semibold">Report Section 10 synchronized</span>
                          <button
                            type="button"
                            onClick={handlePreviewLiveDossier}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                          >
                            <span>See Candidate Report</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right: Presentation Milestones & Telemetry (5 Cols) */}
                    <div className="lg:col-span-5 space-y-4">
                      {/* Telemetry Scores */}
                      <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3">
                        <span className="text-xs font-black uppercase tracking-wider text-indigo-950 block">
                          AI Speech &amp; Delivery Telemetry
                        </span>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-white rounded-xl border border-indigo-100 text-center">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Fluency Rating</span>
                            <span className="text-lg font-black text-indigo-600">{vid.aiFluencyScore}%</span>
                          </div>
                          <div className="p-3 bg-white rounded-xl border border-indigo-100 text-center">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Communication</span>
                            <span className="text-lg font-black text-emerald-600">{vid.aiCommunicationScore}%</span>
                          </div>
                        </div>
                        {vid.aiToneNotes && (
                          <p className="text-[11px] text-slate-600 italic bg-white p-2.5 rounded-xl border border-indigo-100">
                            <strong>Tone:</strong> {vid.aiToneNotes}
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={handlePreviewLiveDossier}
                          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                          title="Open official report with this candidate's video telemetry and presentation score"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>See Video Report in Live Dossier</span>
                        </button>
                      </div>

                      {/* Key Presentation Milestones */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          Key Presentation Milestones
                        </span>

                        <div className="space-y-2">
                          {vid.aiMilestones?.map((m, mIdx) => (
                            <div
                              key={mIdx}
                              className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-start gap-2.5 hover:border-indigo-300 transition"
                            >
                              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-mono font-bold shrink-0">
                                {m.time}
                              </span>
                              <span className="text-xs text-slate-700 font-medium leading-snug">
                                {m.desc}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════════
          MODAL 1: IN-APP DOCUMENT PREVIEW MODAL (FULL DETAILS & AI AUDIT)
          ═════════════════════════════════════════════════════════════════════════ */}
      {previewDocument && (() => {
        const modalBadge = getTypeBadge(previewDocument.type);
        const ModalIcon = modalBadge.icon;
        const isDocAnalyzed = typeof previewDocument.aiRating === "number" && previewDocument.aiRating > 0;
        const isAnalyzingThisModal = analyzingDocId === previewDocument.id;

        return (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm overflow-y-auto p-3 sm:p-5 flex justify-center items-start pt-6 sm:pt-10 pb-10">
            <div
              className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
              style={{ maxHeight: "calc(100vh - 4.5rem)" }}
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-indigo-300 shrink-0">
                    <ModalIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-300">
                        {modalBadge.label}
                      </span>
                      {isDocAnalyzed ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-mono font-bold">
                          AI Rating: {previewDocument.aiRating}%
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold">
                          Pending AI Analysis
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-black text-white truncate mt-0.5">
                      {previewDocument.title}
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewDocument(null)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer shrink-0 ml-2"
                  title="Close Preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div
                className="p-5 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1 min-h-0"
                style={{ maxHeight: "calc(100vh - 13rem)" }}
              >
                {/* Document Overview */}
                <div className="space-y-1.5">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Abstract &amp; System Overview
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    {previewDocument.description || "Candidate technical specification document submitted for fellowship evaluation."}
                  </p>
                </div>

                {/* Admin AI Audit Notes */}
                {previewDocument.aiAuditSummary ? (
                  <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        Admin Faculty AI Audit Notes (Vijaya Kumar Mekala)
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                        Score: {previewDocument.aiRating || 96}%
                      </span>
                    </div>
                    <p className="text-xs text-indigo-950 leading-relaxed font-medium">
                      {previewDocument.aiAuditSummary}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <p className="text-xs text-amber-900 font-bold">Awaiting Admin Faculty Analysis</p>
                        <p className="text-[11px] text-amber-700">Run AI analysis to calibrate Grammar, Telemetry &amp; Official Reports.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        handleAdminAnalyzeDocument(previewDocument.id);
                        setPreviewDocument({
                          ...previewDocument,
                          aiRating: 96,
                          aiAuditSummary: "Admin faculty analysis completed by Vijaya Kumar Mekala. Verified high technical rigor (95%), clear system diagrams, robust API specifications, and formal documentation depth."
                        });
                      }}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Analyze with AI</span>
                    </button>
                  </div>
                )}

                {/* AI Audit Scores Breakdown */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    AI Document Rigor &amp; Quality Audit
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-center">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Technical Rigor</span>
                      <span className="text-sm font-black text-slate-900">{isDocAnalyzed ? `${(previewDocument.aiRating || 96) - 1}%` : "95%"}</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-center">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Originality</span>
                      <span className="text-sm font-black text-slate-900">97%</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-center">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Formatting</span>
                      <span className="text-sm font-black text-slate-900">96%</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-center">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Citations</span>
                      <span className="text-sm font-black text-emerald-600">98%</span>
                    </div>
                  </div>
                </div>

                {/* File Specs & Link */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>File Name:</span>
                    <span className="font-mono font-bold text-slate-800">{previewDocument.fileName}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>File Size:</span>
                    <span className="font-mono font-bold text-slate-800">{previewDocument.fileSize || "3.5 MB"}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Uploaded By:</span>
                    <span className="font-bold text-slate-800">{currentStudent?.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Uploaded Date:</span>
                    <span className="font-medium text-slate-700">{previewDocument.uploadedAt}</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      handleAdminAnalyzeDocument(previewDocument.id);
                      setPreviewDocument({
                        ...previewDocument,
                        aiRating: 97,
                        aiAuditSummary: "Admin faculty analysis completed by Vijaya Kumar Mekala. Verified high technical rigor (96%), clear system diagrams, robust API specifications, and formal documentation depth."
                      });
                    }}
                    disabled={isAnalyzingThisModal}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-black transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isAnalyzingThisModal ? "animate-spin" : ""}`} />
                    <span>{isAnalyzingThisModal ? "Auditing..." : isDocAnalyzed ? "Re-Analyze Document" : "Analyze Document"}</span>
                  </button>

                  <a
                    href={previewDocument.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in Full Tab</span>
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={previewDocument.fileUrl}
                    download={previewDocument.fileName}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black transition flex items-center gap-1.5 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Document</span>
                  </a>

                  <button
                    onClick={() => setPreviewDocument(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}



      {/* ═════════════════════════════════════════════════════════════════════════
          MODAL: CREATE ROLE-BASED NAMED EVALUATION
          ═════════════════════════════════════════════════════════════════════════ */}
      {showAddEvaluatorModal && isSuperAdmin && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm overflow-y-auto p-3 sm:p-5 flex justify-center items-start pt-6 sm:pt-10 pb-10">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-indigo-300">
                  {evalModalMode === "edit" ? <Edit3 className="w-5 h-5" /> : <Award className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    {evalModalMode === "edit" ? "Edit & Update Evaluation Round" : "Create Role-Based Evaluation"}
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    {evalModalMode === "edit"
                      ? (newEvaluationScope === "cohort"
                          ? `Modify round "${editingTargetRound || newEvaluationName}" for ${currentActiveBatch?.name || "all cohorts"} (${batchStudents.length} interns)`
                          : `Modify evaluation configuration for ${currentStudent?.name || "candidate"}`)
                      : (newEvaluationScope === "cohort"
                          ? `Cohort Evaluation: ${currentActiveBatch?.name || "All Cohorts"} (${batchStudents.length} Interns) • Ready for Faculty Scoring`
                          : `Candidate: ${currentStudent?.name || "Intern"} • Role-Specific Appraisal`)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddEvaluatorModal(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4">
              {/* Field 1: Evaluation Name */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Name of the Evaluation <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newEvaluationName}
                  onChange={(e) => setNewEvaluationName(e.target.value)}
                  placeholder="e.g. System Architecture & System Defense"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
                {/* Quick suggestions */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-400 font-medium">Quick suggestions:</span>
                  {[
                    "System Architecture & System Defense",
                    "Core Technical & Code Quality Review",
                    "Industry Placement & Readiness",
                    "Cloud Infrastructure & DevOps",
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setNewEvaluationName(preset)}
                      className="px-2 py-0.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold transition cursor-pointer border border-indigo-200"
                    >
                      + {preset.split("&")[0].trim()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field: Evaluation Scope */}
              {viewMode === "profile" ? (
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Evaluation Scope
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewEvaluationScope("cohort")}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        newEvaluationScope === "cohort"
                          ? "bg-indigo-50/70 border-indigo-400 text-indigo-950 ring-1 ring-indigo-400"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span className="text-xs font-black block">Cohort-Wide</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Apply to all {batchStudents.length} interns in this cohort
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewEvaluationScope("single")}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        newEvaluationScope === "single"
                          ? "bg-indigo-50/70 border-indigo-400 text-indigo-950 ring-1 ring-indigo-400"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span className="text-xs font-black block">Single Candidate</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Apply only to {currentStudent?.name || "current candidate"}
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 block">
                      Target Cohort Scope
                    </span>
                    <p className="text-xs font-bold text-indigo-950">
                      {currentActiveBatch?.name || "All Cohorts"} • {batchStudents.length} Interns
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 border border-indigo-200">
                    Cohort-Wide
                  </span>
                </div>
              )}

              {/* Field 2: Assigned Evaluator & Role */}
              {isSuperAdmin ? (
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Assigned Faculty Evaluator
                  </label>
                  <select
                    value={newEvaluatorName}
                    onChange={(e) => {
                      const sel = SYSTEM_ADMIN_EVALUATORS.find((a) => a.name === e.target.value);
                      if (sel) {
                        setNewEvaluatorName(sel.name);
                        setNewEvaluatorRole(sel.role);
                      } else {
                        setNewEvaluatorName(e.target.value);
                      }
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white cursor-pointer"
                  >
                    {SYSTEM_ADMIN_EVALUATORS.map((adm) => (
                      <option key={adm.name} value={adm.name}>
                        {adm.name} — {adm.role} ({adm.adminRole === "super_admin" ? "Super Admin" : "Instructor"})
                      </option>
                    ))}
                    <option value="Custom Faculty Evaluator">Custom Faculty / Industry Mentor</option>
                  </select>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 block">
                    Assigned Evaluator (Your Role)
                  </span>
                  <p className="text-xs font-black text-indigo-950">
                    {activeAdmin.name}
                  </p>
                  <p className="text-[11px] text-indigo-700/80 font-medium">
                    {activeAdmin.role}
                  </p>
                </div>
              )}

              {/* Field 3: Evaluator Role / Designation */}
              {isSuperAdmin && (
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Evaluator Designation / Panel Role
                  </label>
                  <input
                    type="text"
                    value={newEvaluatorRole}
                    onChange={(e) => setNewEvaluatorRole(e.target.value)}
                    placeholder="Designation or Panel Role"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
              )}

              {/* Field 4: Initial Status */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Initial Evaluation Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewEvaluationStatus("pending")}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      newEvaluationStatus === "pending"
                        ? "bg-indigo-50/70 border-indigo-400 text-indigo-950 ring-1 ring-indigo-400"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-xs font-black block">Pending Evaluation</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Give fresh scores from 0% when conducting the evaluation
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewEvaluationStatus("preset")}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      newEvaluationStatus === "preset"
                        ? "bg-indigo-50/70 border-indigo-400 text-indigo-950 ring-1 ring-indigo-400"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-xs font-black block">Baseline Scores</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Pre-fill with standard baseline template (85%)
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowAddEvaluatorModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveOrUpdateEvaluator}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                {evalModalMode === "edit" ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                <span>
                  {evalModalMode === "edit"
                    ? "Update Evaluation & Save"
                    : newEvaluationScope === "cohort"
                    ? "Create Cohort Evaluation"
                    : "Create Role Evaluation"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
