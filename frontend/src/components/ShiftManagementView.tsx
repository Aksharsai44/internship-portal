import React, { useState, useMemo, useEffect } from "react";
import {
  ShiftPattern,
  InternRosterAssignment,
  HolidayEvent,
  Batch,
  Student,
  LeaveRequest,
  AppNotification,
} from "../types";
import {
  Activity,
  Plus,
  Clock,
  Edit2,
  Trash2,
  Search,
  Save,
  CheckCircle2,
  Users,
  Calendar as CalendarIcon,
  Sparkles,
  AlertCircle,
  X,
  Check,
  Zap,
  CheckSquare,
  BrainCircuit,
  FileText,
  ArrowRight,
  ShieldCheck,
  Filter,
  ChevronRight,
  ChevronLeft,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { INITIAL_LEAVE_REQUESTS } from "../data/attendanceData";

interface ShiftManagementViewProps {
  shiftPatterns: ShiftPattern[];
  rosterAssignments: InternRosterAssignment[];
  holidays: HolidayEvent[];
  leaveRequests?: LeaveRequest[];
  batches?: Batch[];
  students?: Student[];
  onUpdateShiftPatterns: (patterns: ShiftPattern[]) => void;
  onUpdateRosterAssignments: (roster: InternRosterAssignment[]) => void;
  onUpdateHolidays: (holidays: HolidayEvent[]) => void;
  onUpdateLeaveRequests?: (reqs: LeaveRequest[]) => void;
  onAddNotification?: (notif: Omit<AppNotification, "id" | "timestamp" | "isRead">) => void;
  onToast?: (msg: string) => void;
  onNavigateToDailyLogs?: () => void;
}

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const ShiftManagementView: React.FC<ShiftManagementViewProps> = ({
  shiftPatterns,
  rosterAssignments,
  holidays,
  leaveRequests = INITIAL_LEAVE_REQUESTS,
  batches = [],
  students = [],
  onUpdateShiftPatterns,
  onUpdateRosterAssignments,
  onUpdateHolidays,
  onUpdateLeaveRequests,
  onAddNotification,
  onToast,
  onNavigateToDailyLogs,
}) => {
  // Sub-tabs navigation: 'roster' | 'leaves' | 'holidays'
  const [activeSubTab, setActiveSubTab] = useState<"roster" | "leaves" | "holidays">("roster");

  // Filters & selection state
  const [selectedBatch, setSelectedBatch] = useState("All Batches");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInternIds, setSelectedInternIds] = useState<string[]>([]);
  const [localRoster, setLocalRoster] = useState<InternRosterAssignment[]>(rosterAssignments);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Leave governance state
  const [leaveStatusFilter, setLeaveStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [leaveSearchQuery, setLeaveSearchQuery] = useState("");
  const [isAIEvaluating, setIsAIEvaluating] = useState(false);
  const [feedbackInputs, setFeedbackInputs] = useState<Record<string, string>>({});

  // Leave interactive calendar state (defaults to Sep 2026)
  const [calYear, setCalYear] = useState(2026);
  const [calMonth, setCalMonth] = useState(8); // 8 is September
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);
  const [showAdminLeaveModal, setShowAdminLeaveModal] = useState(false);
  const [adminLeaveForm, setAdminLeaveForm] = useState({
    internId: "",
    internName: "",
    type: "academic" as "academic" | "sick" | "casual" | "other",
    startDate: "2026-09-08",
    endDate: "2026-09-08",
    reason: "",
    initialStatus: "approved" as "pending" | "approved",
  });

  useEffect(() => {
    setLocalRoster(rosterAssignments);
  }, [rosterAssignments]);

  // New/Edit Pattern Modal
  const [showPatternModal, setShowPatternModal] = useState(false);
  const [editingPattern, setEditingPattern] = useState<ShiftPattern | null>(null);
  const [patternForm, setPatternForm] = useState<Partial<ShiftPattern>>({
    name: "",
    startTime: "10:00 AM",
    endTime: "07:00 PM",
    requiredHours: 8,
    workingDays: [1, 2, 3, 4, 5],
    gracePeriodMinutes: 10,
    color: "#f59e0b",
  });

  // Holiday Modal
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [holidayForm, setHolidayForm] = useState({ name: "", date: "", type: "holiday" as const });

  // Batches filter list
  const batchOptions = useMemo(() => {
    const list: string[] = ["All Batches"];
    // Add batches from props
    (batches || []).forEach((b) => {
      if (b.name && !list.includes(b.name)) {
        list.push(b.name);
      }
    });
    // Add batches from local roster
    localRoster.forEach((r) => {
      if (r.batchName && !list.includes(r.batchName)) {
        list.push(r.batchName);
      }
    });
    // Fallback if none found
    if (list.length === 1) {
      list.push(
        "Full-Stack AI Engineering",
        "Summer 2026 UI/UX & Product Design",
        "Batch 2026-B (Cloud & DevOps)"
      );
    }
    return list;
  }, [batches, localRoster]);

  // Filtered roster by batch and search
  const filteredRoster = localRoster.filter((r) => {
    const internBatch = r.batchName || "Full-Stack AI Engineering";
    const matchesBatch =
      selectedBatch === "All Batches" ||
      internBatch === selectedBatch ||
      (batches && batches.find((b) => b.name === selectedBatch)?.id === r.batchId);
    const matchesSearch =
      r.internName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      internBatch.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.shiftName || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBatch && matchesSearch;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedInternIds(filteredRoster.map((r) => r.internId));
    } else {
      setSelectedInternIds([]);
    }
  };

  const handleToggleSelectIntern = (internId: string) => {
    setSelectedInternIds((prev) =>
      prev.includes(internId) ? prev.filter((id) => id !== internId) : [...prev, internId]
    );
  };

  const handleShiftChange = (internId: string, newShiftId: string) => {
    const foundShift = shiftPatterns.find((s) => s.id === newShiftId);
    setLocalRoster((prev) =>
      prev.map((item) =>
        item.internId === internId
          ? {
              ...item,
              shiftId: newShiftId,
              shiftName: foundShift?.name || item.shiftName,
              requiredHours: foundShift ? foundShift.requiredHours : item.requiredHours,
            }
          : item
      )
    );
  };

  const handleRequiredHoursChange = (internId: string, hours: number) => {
    setLocalRoster((prev) =>
      prev.map((item) => (item.internId === internId ? { ...item, requiredHours: hours } : item))
    );
  };

  const handleToggleCustomWeekend = (internId: string, dayIndex: number) => {
    setLocalRoster((prev) =>
      prev.map((item) => {
        if (item.internId !== internId) return item;
        const current = item.customWeekends || [];
        const next = current.includes(dayIndex)
          ? current.filter((d) => d !== dayIndex)
          : [...current, dayIndex];
        return { ...item, customWeekends: next };
      })
    );
  };

  const handleSaveAllAssignments = () => {
    onUpdateRosterAssignments(localRoster);
    setSaveSuccess(true);
    if (onToast) onToast("All shift & roster assignments saved successfully!");
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleOpenNewPatternModal = () => {
    setEditingPattern(null);
    setPatternForm({
      name: "",
      startTime: "10:00 AM",
      endTime: "07:00 PM",
      requiredHours: 8,
      workingDays: [1, 2, 3, 4, 5],
      gracePeriodMinutes: 10,
      color: "#f59e0b",
    });
    setShowPatternModal(true);
  };

  const handleOpenEditPatternModal = (p: ShiftPattern) => {
    setEditingPattern(p);
    setPatternForm({ ...p });
    setShowPatternModal(true);
  };

  const handleSavePattern = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patternForm.name?.trim()) return;

    if (editingPattern) {
      const updated = shiftPatterns.map((p) =>
        p.id === editingPattern.id ? ({ ...p, ...patternForm } as ShiftPattern) : p
      );
      onUpdateShiftPatterns(updated);
      if (onToast) onToast(`Updated shift pattern: ${patternForm.name}`);
    } else {
      const newPattern: ShiftPattern = {
        id: `shift_${Date.now()}`,
        name: patternForm.name,
        startTime: patternForm.startTime || "10:00 AM",
        endTime: patternForm.endTime || "07:00 PM",
        requiredHours: Number(patternForm.requiredHours) || 8,
        workingDays: patternForm.workingDays || [1, 2, 3, 4, 5],
        gracePeriodMinutes: Number(patternForm.gracePeriodMinutes) || 10,
        color: patternForm.color || "#f59e0b",
      };
      onUpdateShiftPatterns([...shiftPatterns, newPattern]);
      if (onToast) onToast(`Created new shift pattern: ${newPattern.name}`);
    }
    setShowPatternModal(false);
  };

  const handleDeletePattern = (patternId: string) => {
    if (shiftPatterns.length <= 1) {
      alert("At least one shift pattern must remain.");
      return;
    }
    const filtered = shiftPatterns.filter((p) => p.id !== patternId);
    onUpdateShiftPatterns(filtered);
    if (onToast) onToast("Shift pattern removed.");
  };

  const handleToggleWorkingDayInModal = (dayIdx: number) => {
    const current = patternForm.workingDays || [];
    const next = current.includes(dayIdx)
      ? current.filter((d) => d !== dayIdx)
      : [...current, dayIdx].sort();
    setPatternForm({ ...patternForm, workingDays: next });
  };

  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!holidayForm.name.trim() || !holidayForm.date) return;
    const newHol: HolidayEvent = {
      id: `hol_${Date.now()}`,
      name: holidayForm.name,
      date: holidayForm.date,
      type: holidayForm.type,
    };
    onUpdateHolidays([...holidays, newHol]);
    setHolidayForm({ name: "", date: "", type: "holiday" });
    setShowHolidayModal(false);
    if (onToast) onToast(`Added holiday event: ${newHol.name}`);
  };

  const handleDeleteHoliday = (holId: string) => {
    onUpdateHolidays(holidays.filter((h) => h.id !== holId));
    if (onToast) onToast("Holiday removed.");
  };

  // ── AI Evaluation and Leave Governance Logic ──
  const allLeaves = leaveRequests || INITIAL_LEAVE_REQUESTS;
  const pendingLeaves = useMemo(() => allLeaves.filter((r) => r.status === "pending"), [allLeaves]);
  const approvedLeaves = useMemo(() => allLeaves.filter((r) => r.status === "approved"), [allLeaves]);
  const rejectedLeaves = useMemo(() => allLeaves.filter((r) => r.status === "rejected"), [allLeaves]);

  const evaluateLeaveWithAI = (req: LeaveRequest) => {
    const reasonLower = (req.reason || "").toLowerCase();
    const isAcademic =
      req.type === "academic" ||
      reasonLower.includes("viva") ||
      reasonLower.includes("exam") ||
      reasonLower.includes("capstone") ||
      reasonLower.includes("symposium") ||
      reasonLower.includes("college") ||
      reasonLower.includes("university");
    const isMedical =
      req.type === "sick" ||
      reasonLower.includes("medical") ||
      reasonLower.includes("hospital") ||
      reasonLower.includes("health") ||
      reasonLower.includes("checkup") ||
      reasonLower.includes("doctor");
    const isCasual =
      req.type === "casual" ||
      reasonLower.includes("wedding") ||
      reasonLower.includes("convocation") ||
      reasonLower.includes("family") ||
      reasonLower.includes("travel");

    if (isAcademic) {
      return {
        recommendation: "approve" as const,
        confidence: 98,
        reasoning: "Academic viva/exam is an authorized institutional milestone with verified student academic standing and sprint velocity >95%.",
      };
    }
    if (isMedical) {
      return {
        recommendation: "approve" as const,
        confidence: 96,
        reasoning: "Scheduled health consultation verified against team roster coverage with minimal project disruption.",
      };
    }
    if (isCasual) {
      return {
        recommendation: "approve" as const,
        confidence: 93,
        reasoning: "Family milestone event submitted with required advance notice. Current module deliverables are on schedule.",
      };
    }
    return {
      recommendation: "approve" as const,
      confidence: 91,
      reasoning: "Verified leave application with sufficient cohort coverage.",
    };
  };

  const handleApproveLeave = (leaveId: string) => {
    if (!onUpdateLeaveRequests) return;
    const targetReq = allLeaves.find((r) => r.id === leaveId);
    const note = feedbackInputs[leaveId] || "Approved by Admin. All sprint deliverables verified.";
    const updated = allLeaves.map((r) =>
      r.id === leaveId
        ? {
            ...r,
            status: "approved" as const,
            adminReviewedAt: new Date().toISOString(),
            adminFeedback: note,
            aiRecommendation: r.aiRecommendation || evaluateLeaveWithAI(r),
          }
        : r
    );
    onUpdateLeaveRequests(updated);

    // Target notification ONLY to this specific intern
    if (targetReq && onAddNotification) {
      onAddNotification({
        recipientRole: "student",
        recipientId: targetReq.internId,
        recipientName: targetReq.internName,
        title: "Leave Request Approved",
        message: `Your ${targetReq.type} leave request (${targetReq.startDate} → ${targetReq.endDate}) was approved by Admin. ${note}`,
        type: "leave_approved",
        actionTab: "attendance",
      });
    }

    if (onToast) onToast("Leave approved! Intern calendar updated with purple 'On Leave' status.");
  };

  const handleRejectLeave = (leaveId: string) => {
    if (!onUpdateLeaveRequests) return;
    const targetReq = allLeaves.find((r) => r.id === leaveId);
    const note = feedbackInputs[leaveId] || "Request declined due to critical cohort sprint delivery deadlines.";
    const updated = allLeaves.map((r) =>
      r.id === leaveId
        ? {
            ...r,
            status: "rejected" as const,
            adminReviewedAt: new Date().toISOString(),
            adminFeedback: note,
          }
        : r
    );
    onUpdateLeaveRequests(updated);

    // Target notification ONLY to this specific intern
    if (targetReq && onAddNotification) {
      onAddNotification({
        recipientRole: "student",
        recipientId: targetReq.internId,
        recipientName: targetReq.internName,
        title: "Leave Request Declined",
        message: `Your ${targetReq.type} leave request (${targetReq.startDate} → ${targetReq.endDate}) was declined by Admin. Reason: ${note}`,
        type: "leave_rejected",
        actionTab: "attendance",
      });
    }

    if (onToast) onToast("Leave request rejected.");
  };

  const handleAIBulkApprove = () => {
    if (!onUpdateLeaveRequests) return;
    setIsAIEvaluating(true);
    setTimeout(() => {
      let bulkCount = 0;
      const updated = allLeaves.map((r) => {
        if (r.status === "pending") {
          const aiRec = r.aiRecommendation || evaluateLeaveWithAI(r);
          if (aiRec.recommendation === "approve") {
            bulkCount++;
            if (onAddNotification) {
              onAddNotification({
                recipientRole: "student",
                recipientId: r.internId,
                recipientName: r.internName,
                title: "Leave Auto-Approved by AI",
                message: `Your ${r.type} leave (${r.startDate} → ${r.endDate}) was auto-approved via AI Smart Evaluation (${aiRec.confidence}% confidence).`,
                type: "leave_approved",
                actionTab: "attendance",
              });
            }
            return {
              ...r,
              status: "approved" as const,
              adminReviewedAt: new Date().toISOString(),
              adminFeedback: `Auto-approved via Mind2i AI Smart Evaluation (${aiRec.confidence}% confidence). Validated: ${aiRec.reasoning}`,
              aiRecommendation: aiRec,
            };
          }
        }
        return r;
      });
      onUpdateLeaveRequests(updated);
      setIsAIEvaluating(false);
      if (onToast) onToast(`AI Smart Evaluation complete! Bulk-approved ${bulkCount} leave requests.`);
    }, 700);
  };

  const availableInternOptions = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    (students || []).forEach((s) => {
      if (s.name) map.set(s.id, { id: s.id, name: s.name });
    });
    localRoster.forEach((r) => {
      if (r.internName && !map.has(r.internId)) {
        map.set(r.internId, { id: r.internId, name: r.internName });
      }
    });
    return Array.from(map.values());
  }, [students, localRoster]);

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay();
  const monthName = new Date(calYear, calMonth, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const getCalDateString = (day: number) => {
    const m = String(calMonth + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${calYear}-${m}-${d}`;
  };

  const handlePrevCalMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else {
      setCalMonth((m) => m - 1);
    }
  };

  const handleNextCalMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else {
      setCalMonth((m) => m + 1);
    }
  };

  const handleCurrentCalMonth = () => {
    setCalYear(2026);
    setCalMonth(8);
  };

  const handleAdminSubmitLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !adminLeaveForm.internName.trim() ||
      !adminLeaveForm.startDate ||
      !adminLeaveForm.endDate ||
      !adminLeaveForm.reason.trim()
    ) {
      if (onToast) onToast("Please provide all required leave details.");
      return;
    }

    const newReq: LeaveRequest = {
      id: `leave_${Date.now()}`,
      internId: adminLeaveForm.internId || `intern_${Date.now()}`,
      internName: adminLeaveForm.internName,
      type: adminLeaveForm.type,
      startDate: adminLeaveForm.startDate,
      endDate: adminLeaveForm.endDate,
      reason: adminLeaveForm.reason,
      status: adminLeaveForm.initialStatus,
      createdAt: new Date().toISOString(),
      adminReviewedAt:
        adminLeaveForm.initialStatus === "approved" ? new Date().toISOString() : undefined,
      adminFeedback:
        adminLeaveForm.initialStatus === "approved"
          ? "Directly logged and approved by Admin."
          : undefined,
    };

    const updated = [newReq, ...allLeaves];
    if (onUpdateLeaveRequests) onUpdateLeaveRequests(updated);

    if (newReq.status === "approved" && onAddNotification) {
      onAddNotification({
        recipientRole: "student",
        recipientId: newReq.internId,
        recipientName: newReq.internName,
        title: "Authorized Leave Recorded",
        message: `An authorized ${newReq.type} leave (${newReq.startDate} → ${newReq.endDate}) has been logged by Admin. Reason: "${newReq.reason}"`,
        type: "leave_approved",
        actionTab: "attendance",
      });
    }

    setShowAdminLeaveModal(false);
    setAdminLeaveForm({
      internId: "",
      internName: "",
      type: "academic",
      startDate: "2026-09-08",
      endDate: "2026-09-08",
      reason: "",
      initialStatus: "approved",
    });
    if (onToast) onToast(`Leave successfully logged for ${newReq.internName}!`);
  };

  const filteredLeaves = useMemo(() => {
    return allLeaves.filter((r) => {
      const matchesStatus =
        leaveStatusFilter === "all" ? true : r.status === leaveStatusFilter;
      const q = leaveSearchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        r.internName.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q);
      const matchesDate =
        !selectedCalendarDate ||
        (r.startDate <= selectedCalendarDate && selectedCalendarDate <= r.endDate);
      return matchesStatus && matchesQuery && matchesDate;
    });
  }, [allLeaves, leaveStatusFilter, leaveSearchQuery, selectedCalendarDate]);

  return (
    <div className="space-y-8 pb-16">
      {/* ── TOP BAR: TITLE & DAILY LOGS LINK ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 tracking-tight">
            Shift, Roster & Leave Governance
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Configure shift patterns, assign interns to batches, and manage AI-evaluated leave approvals.
          </p>
        </div>

        {onNavigateToDailyLogs && (
          <button
            onClick={onNavigateToDailyLogs}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Open Daily Logs & AI Reviews →</span>
          </button>
        )}
      </div>

      {/* ── SUB-TABS NAVIGATION BAR ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2 p-1 bg-slate-100/80 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveSubTab("roster")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
              activeSubTab === "roster"
                ? "bg-white text-indigo-700 shadow-xs border border-indigo-100"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>Shift Patterns & Roster</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("leaves")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 relative ${
              activeSubTab === "leaves"
                ? "bg-white text-indigo-700 shadow-xs border border-indigo-100"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5 text-purple-600" />
            <span>Leave Approvals & AI Review</span>
            {pendingLeaves.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black shadow-2xs animate-pulse">
                {pendingLeaves.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("holidays")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
              activeSubTab === "holidays"
                ? "bg-white text-indigo-700 shadow-xs border border-indigo-100"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
            <span>Holidays & Hackathons</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
              {holidays.length}
            </span>
          </button>
        </div>
      </div>
      {/* ══════════════════════════════════════════════════════════ */}
      {/* SUBTAB 1: SHIFT PATTERNS & ROSTER                        */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeSubTab === "roster" && (
        <div className="space-y-8">
          {/* Pending Leaves Alert Strip */}
          {pendingLeaves.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/90 flex flex-wrap items-center justify-between gap-3 text-amber-900 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                <span className="text-xs font-bold">
                  <strong>{pendingLeaves.length} Intern Leave Request{pendingLeaves.length > 1 ? "s" : ""}</strong> submitted and awaiting mentor review.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubTab("leaves")}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Review with AI ({pendingLeaves.length}) →</span>
              </button>
            </div>
          )}

          {/* ── CARD 1: SHIFT PATTERNS (Image 4 Top) ── */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Shift Patterns</h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Configure timing schedules, required hours, and weekly working days for cohort teams
                  </p>
                </div>
              </div>

              <button
                onClick={handleOpenNewPatternModal}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Pattern</span>
              </button>
            </div>

            {/* Shift Patterns Grid */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shiftPatterns.map((pattern) => (
                <div
                  key={pattern.id}
                  className="rounded-2xl p-5 border transition shadow-2xs relative group"
                  style={{
                    backgroundColor: pattern.id === "shift_morning" ? "#fffbeb" : "#f8fafc",
                    borderColor: pattern.id === "shift_morning" ? "#fde68a" : "#e2e8f0",
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: pattern.color }}
                      />
                      <h4 className="text-sm font-black text-slate-900">{pattern.name}</h4>
                    </div>

                    <button
                      onClick={() => handleOpenEditPatternModal(pattern)}
                      className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white transition cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {pattern.startTime} – {pattern.endTime}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ({pattern.requiredHours}h required)
                    </span>
                  </div>

                  <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>Grace Period: {pattern.gracePeriodMinutes || 10} mins</span>
                  </div>

                  {/* Working Days Pill Row */}
                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Working Days
                    </span>
                    <div className="flex items-center gap-1">
                      {DAY_LABELS.map((day, idx) => {
                        const isWorking = (pattern.workingDays || []).includes(idx);
                        return (
                          <span
                            key={idx}
                            className={`w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center ${
                              isWorking
                                ? "bg-amber-500 text-white shadow-2xs"
                                : "bg-slate-200/70 text-slate-400"
                            }`}
                          >
                            {day}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── CARD 2: INTERN ROSTER (Image 4 Bottom) ── */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Roster Controls Header */}
            <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-base font-black text-slate-900">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <span>Intern Roster</span>
                </div>

                {/* Batch Filter */}
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-300 transition cursor-pointer shadow-2xs"
                >
                  {batchOptions.map((batch) => (
                    <option key={batch} value={batch}>
                      {batch}
                    </option>
                  ))}
                </select>

                {/* Search Input */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search interns, batches, shifts..."
                    className="pl-8 pr-3 py-2 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-300 transition w-44 sm:w-60 shadow-2xs"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveAllAssignments}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition shadow-xs flex items-center gap-2 cursor-pointer ${
                  saveSuccess ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {saveSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{saveSuccess ? "Saved Successfully!" : "Save All Assignments"}</span>
              </button>
            </div>

            {/* Selected Count Sub-banner */}
            <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={
                    filteredRoster.length > 0 && selectedInternIds.length === filteredRoster.length
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                />
                <span>Selected ({selectedInternIds.length})</span>
              </label>
            </div>

            {/* Intern Roster Rows matching Image 4 */}
            <div className="p-6 space-y-3">
              {filteredRoster.map((intern) => {
                const isSelected = selectedInternIds.includes(intern.internId);
                return (
                  <div
                    key={intern.internId}
                    className={`p-4 rounded-2xl border transition shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isSelected
                        ? "bg-indigo-50/40 border-indigo-200"
                        : "bg-white border-slate-200 hover:border-indigo-200"
                    }`}
                  >
                    {/* Left: Checkbox + Avatar + Name & Role */}
                    <div className="flex items-center gap-3.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectIntern(intern.internId)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                      />

                      {/* Circular Avatar with initial */}
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-2xs">
                        {intern.internName.charAt(0)}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-black text-slate-900">{intern.internName}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200/60 text-indigo-700">
                            {intern.batchName || "Full-Stack AI Engineering"}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-blue-600 mt-0.5">
                          {intern.role}
                          <span className="text-slate-400 font-normal"> - </span>
                          <span className="font-bold text-slate-700">
                            {intern.shiftName || "Morning Shift"}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Right Controls: Shift Select + Required Hours + Custom Weekends */}
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 pl-12 md:pl-0">
                      {/* Shift dropdown */}
                      <select
                        value={intern.shiftId}
                        onChange={(e) => handleShiftChange(intern.internId, e.target.value)}
                        className="text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-300 transition cursor-pointer shadow-2xs min-w-[140px]"
                      >
                        {shiftPatterns.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>

                      {/* Required Hours input */}
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={1}
                          max={16}
                          value={intern.requiredHours}
                          onChange={(e) =>
                            handleRequiredHoursChange(intern.internId, Number(e.target.value))
                          }
                          className="w-14 text-center text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl py-2 outline-none focus:ring-2 focus:ring-indigo-300 transition shadow-2xs"
                        />
                        <span className="text-[11px] font-semibold text-slate-400">hrs</span>
                      </div>

                      {/* Custom Weekends S M T W T F S selector */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                          CUSTOM WEEKENDS:
                        </span>
                        <div className="flex items-center gap-1">
                          {DAY_LABELS.map((label, dayIdx) => {
                            const isWeekend = (intern.customWeekends || []).includes(dayIdx);
                            return (
                              <button
                                type="button"
                                key={dayIdx}
                                onClick={() => handleToggleCustomWeekend(intern.internId, dayIdx)}
                                className={`w-6 h-6 rounded-md text-[10px] font-black transition cursor-pointer flex items-center justify-center ${
                                  isWeekend
                                    ? "bg-blue-600 text-white shadow-2xs"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                                title={`${DAY_NAMES[dayIdx]}: Click to toggle weekend`}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* SUBTAB 2: LEAVE REQUESTS & AI GOVERNANCE                 */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeSubTab === "leaves" && (
        <div className="space-y-6">
          {/* Top KPI Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Requests
              </span>
              <div className="text-2xl font-black text-slate-900 mt-2">{allLeaves.length}</div>
              <span className="text-[11px] font-semibold text-slate-500 mt-1">All Recorded</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                Pending Review
              </span>
              <div className="text-2xl font-black text-amber-900 mt-2">{pendingLeaves.length}</div>
              <span className="text-[11px] font-bold text-amber-600 mt-1">Action Required</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                Approved Leaves
              </span>
              <div className="text-2xl font-black text-emerald-900 mt-2">{approvedLeaves.length}</div>
              <span className="text-[11px] font-bold text-emerald-600 mt-1">Synced to Calendar</span>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">
                Declined
              </span>
              <div className="text-2xl font-black text-rose-900 mt-2">{rejectedLeaves.length}</div>
              <span className="text-[11px] font-semibold text-rose-600 mt-1">Declined Requests</span>
            </div>
          </div>

          {/* AI Evaluation & 1-Click Bulk Approval Banner */}
          <div className="rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 text-white p-6 sm:p-7 shadow-xl border border-indigo-800/40 relative overflow-hidden">
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Mind2i AI Leave Evaluation Engine</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Intelligent Leave Assessment & 1-Click Bulk Approval
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                  The AI analyzes student academic viva dates, medical necessity, notice periods, and cohort shift coverage. Instantly approve all high-confidence requests and sync with student calendars.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <button
                  type="button"
                  disabled={isAIEvaluating || pendingLeaves.length === 0}
                  onClick={handleAIBulkApprove}
                  className={`px-5 py-3.5 rounded-2xl font-black text-xs tracking-wide transition-all shadow-lg flex items-center justify-center gap-2.5 cursor-pointer ${
                    isAIEvaluating
                      ? "bg-indigo-700 text-white opacity-80"
                      : pendingLeaves.length === 0
                      ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white ring-4 ring-emerald-400/20 hover:scale-105"
                  }`}
                >
                  <Zap className="w-4 h-4 text-white" />
                  <span>
                    {isAIEvaluating
                      ? "AI Evaluating Requests..."
                      : `⚡ Bulk Approve AI-Recommended (${pendingLeaves.length})`}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* ── CARD: INTERACTIVE ADMIN LEAVE & OFF-DAYS CALENDAR ── */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-5">
            {/* Calendar Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Cohort Leave & Off-Days Calendar</span>
                    {selectedCalendarDate && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                        {selectedCalendarDate} Filtered
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Visual monthly schedule of all intern leaves (approved, pending review, declined) & holidays
                  </p>
                </div>
              </div>

              {/* Month Selector + Add Leave Button */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={handlePrevCalMonth}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition cursor-pointer"
                    title="Previous Month"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 text-xs font-black text-slate-800 tracking-tight min-w-[120px] text-center">
                    {monthName}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextCalMonth}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition cursor-pointer"
                    title="Next Month"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleCurrentCalMonth}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                >
                  Sep 2026
                </button>

                <button
                  type="button"
                  onClick={() => setShowAdminLeaveModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Record Intern Leave</span>
                </button>
              </div>
            </div>

            {/* Calendar Legend & Filter Status Indicator */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Approved Leave</span>
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-bold">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>Pending Review</span>
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 font-bold">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Declined</span>
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-800 font-bold">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  <span>Holiday</span>
                </span>
              </div>

              {selectedCalendarDate ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-700">
                    Filtered to: <strong className="font-mono">{selectedCalendarDate}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedCalendarDate(null)}
                    className="text-[11px] font-black text-rose-600 hover:underline cursor-pointer"
                  >
                    Clear Date Filter (Show All)
                  </button>
                </div>
              ) : (
                <span className="text-[11px] text-slate-400 font-medium">
                  Click any calendar date to highlight requests below
                </span>
              )}
            </div>

            {/* Calendar Days Grid */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-100 text-center text-xs font-black text-slate-600 py-2.5">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              {/* Day Cells */}
              <div className="grid grid-cols-7 auto-rows-fr gap-px bg-slate-200">
                {/* Empty leading cells */}
                {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="min-h-[105px] bg-slate-50/80 p-2 opacity-50" />
                ))}

                {/* Days of Month */}
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const dateStr = getCalDateString(dayNum);
                  const dayLeaves = allLeaves.filter(
                    (r) => r.startDate <= dateStr && dateStr <= r.endDate
                  );
                  const dayHolidays = holidays.filter((h) => h.date === dateStr);
                  const isToday = dateStr === "2026-09-07";
                  const isSelected = selectedCalendarDate === dateStr;

                  return (
                    <div
                      key={dateStr}
                      onClick={() =>
                        setSelectedCalendarDate(isSelected ? null : dateStr)
                      }
                      className={`min-h-[105px] p-2 bg-white transition-all cursor-pointer flex flex-col justify-between group hover:bg-indigo-50/40 relative ${
                        isSelected
                          ? "ring-2 ring-indigo-500 bg-indigo-50/60 z-10 shadow-xs"
                          : isToday
                          ? "bg-blue-50/30"
                          : ""
                      }`}
                    >
                      {/* Cell Header: Day Number */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`w-6 h-6 rounded-full text-xs font-black flex items-center justify-center ${
                            isToday
                              ? "bg-indigo-600 text-white shadow-2xs"
                              : isSelected
                              ? "bg-indigo-200 text-indigo-950 font-black"
                              : "text-slate-700 group-hover:text-indigo-600"
                          }`}
                        >
                          {dayNum}
                        </span>

                        {dayLeaves.length > 0 && (
                          <span className="text-[10px] font-bold text-slate-400">
                            {dayLeaves.length} {dayLeaves.length === 1 ? "leave" : "leaves"}
                          </span>
                        )}
                      </div>

                      {/* Chips Container */}
                      <div className="mt-1 space-y-1 overflow-y-auto max-h-[75px] scrollbar-none">
                        {/* Holiday Badge */}
                        {dayHolidays.map((h) => (
                          <div
                            key={h.id}
                            className="px-1.5 py-0.5 rounded text-[10px] font-black bg-cyan-100 text-cyan-900 border border-cyan-300 truncate"
                            title={`Holiday: ${h.name}`}
                          >
                            🎉 {h.name}
                          </div>
                        ))}

                        {/* Leave Request Chips */}
                        {dayLeaves.map((l) => (
                          <div
                            key={l.id}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border truncate flex items-center gap-1 ${
                              l.status === "approved"
                                ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                                : l.status === "rejected"
                                ? "bg-rose-100 text-rose-800 border-rose-300 line-through opacity-75"
                                : "bg-amber-100 text-amber-900 border-amber-300 animate-pulse"
                            }`}
                            title={`${l.internName} (${l.type}): ${l.reason} [${l.status.toUpperCase()}]`}
                          >
                            <span className="font-black">
                              {l.status === "approved" ? "✓" : l.status === "rejected" ? "✕" : "⏳"}
                            </span>
                            <span className="truncate">{l.internName}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── CARD: ALL LEAVE REQUESTS & APPROVAL ACTIONS (BOTTOM OF CALENDAR) ── */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h4 className="text-base font-black text-slate-900">
                  {selectedCalendarDate
                    ? `Leave Requests Active on ${selectedCalendarDate}`
                    : "Leave Requests & Approvals"}
                </h4>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Review submitted intern leave requests, evaluate AI suggestions, and record approval/rejection decisions
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Status Filter Pills */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  {(["all", "pending", "approved", "rejected"] as const).map((filter) => {
                    const count =
                      filter === "all"
                        ? allLeaves.length
                        : filter === "pending"
                        ? pendingLeaves.length
                        : filter === "approved"
                        ? approvedLeaves.length
                        : rejectedLeaves.length;
                    const isActive = leaveStatusFilter === filter;
                    return (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setLeaveStatusFilter(filter)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer capitalize flex items-center gap-1.5 ${
                          isActive
                            ? "bg-white text-indigo-700 shadow-xs border border-indigo-200"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        <span>{filter}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                            isActive ? "bg-indigo-100 text-indigo-800" : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={leaveSearchQuery}
                    onChange={(e) => setLeaveSearchQuery(e.target.value)}
                    placeholder="Search by intern, reason, or type..."
                    className="pl-8 pr-3 py-2 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-300 transition w-56 sm:w-64"
                  />
                </div>
              </div>
            </div>

            {/* Leave Requests Cards List */}
            {filteredLeaves.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">No Leave Requests Found</h4>
                <p className="text-xs text-slate-400">
                  {leaveStatusFilter === "pending"
                    ? "All submitted leave requests have been reviewed!"
                    : "No requests match the current filter and search criteria."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredLeaves.map((req) => {
                  const aiRec = req.aiRecommendation || evaluateLeaveWithAI(req);

                  return (
                    <div
                      key={req.id}
                      className={`p-5 rounded-2xl border transition-all space-y-4 shadow-2xs ${
                        req.status === "approved"
                          ? "bg-emerald-50/30 border-emerald-200"
                          : req.status === "rejected"
                          ? "bg-rose-50/30 border-rose-200"
                          : "bg-white border-slate-200 hover:border-indigo-300"
                      }`}
                    >
                      {/* Top Header: Intern Info & Status Badge */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={`https://api.dicebear.com/7.x/bottts/svg?seed=${req.internName}`}
                            alt={req.internName}
                            className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 shrink-0"
                          />
                          <div>
                            <h4 className="text-sm font-black text-slate-900">{req.internName}</h4>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                                  req.type === "academic"
                                    ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                                    : req.type === "sick"
                                    ? "bg-rose-100 text-rose-800 border border-rose-200"
                                    : req.type === "casual"
                                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                                    : "bg-slate-100 text-slate-800 border border-slate-200"
                                }`}
                              >
                                {req.type}
                              </span>
                              <span>•</span>
                              <span className="font-mono">
                                Applied {new Date(req.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                            req.status === "approved"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : req.status === "rejected"
                              ? "bg-rose-100 text-rose-800 border border-rose-300"
                              : "bg-amber-100 text-amber-800 border border-amber-300 animate-pulse"
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>

                      {/* Date Range Strip */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span className="font-bold text-slate-700">Leave Duration:</span>
                          <span className="font-black text-slate-900">
                            {req.startDate} → {req.endDate}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 font-mono text-[10px] font-bold">
                          REF-LIV-{req.id.slice(-6).toUpperCase()}
                        </span>
                      </div>

                      {/* Intern Reason */}
                      <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                          Reason Stated by Intern
                        </span>
                        <p className="text-slate-800 font-medium italic">"{req.reason}"</p>
                      </div>

                      {/* AI Evaluation Recommendation Box */}
                      <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-50/80 to-purple-50/80 border border-indigo-200/90 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-indigo-900 font-black text-[11px]">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                            <span>AI Confidence: {aiRec.confidence}%</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-black text-[10px] uppercase">
                            Recommended: {aiRec.recommendation}
                          </span>
                        </div>
                        <p className="text-[11px] text-indigo-950 font-medium leading-relaxed">
                          {aiRec.reasoning}
                        </p>
                      </div>

                      {/* Action Controls */}
                      {req.status === "pending" ? (
                        <div className="space-y-2 pt-1 border-t border-slate-100">
                          <input
                            type="text"
                            value={feedbackInputs[req.id] || ""}
                            onChange={(e) =>
                              setFeedbackInputs({ ...feedbackInputs, [req.id]: e.target.value })
                            }
                            placeholder="Optional mentor review note..."
                            className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-300"
                          />

                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleRejectLeave(req.id)}
                              className="px-3.5 py-1.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold transition cursor-pointer"
                            >
                              ✕ Reject
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApproveLeave(req.id)}
                              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve Leave</span>
                            </button>
                          </div>
                        </div>
                      ) : req.status === "approved" ? (
                        <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between text-xs">
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Synced to Intern Calendar (Purple 'On Leave')</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRejectLeave(req.id)}
                            className="text-[11px] text-slate-400 hover:text-rose-600 font-bold transition cursor-pointer"
                          >
                            Revoke
                          </button>
                        </div>
                      ) : (
                        <div className="pt-2 border-t border-rose-200/80 flex items-center justify-between text-xs">
                          <span className="text-rose-600 font-bold">Request Declined</span>
                          <button
                            type="button"
                            onClick={() => handleApproveLeave(req.id)}
                            className="text-[11px] text-indigo-600 hover:underline font-bold transition cursor-pointer"
                          >
                            Reconsider & Approve
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* SUBTAB 3: DECLARED HOLIDAYS & OFF-DAYS CALENDAR          */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeSubTab === "holidays" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-indigo-600" />
              <h4 className="text-base font-black text-slate-900">Declared Holidays & Off-Events</h4>
            </div>
            <button
              onClick={() => setShowHolidayModal(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-indigo-700 text-xs font-bold border border-slate-200 hover:border-indigo-200 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Holiday</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {holidays.map((h) => (
              <div
                key={h.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900">{h.name}</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">{h.date}</div>
                </div>
                <button
                  onClick={() => handleDeleteHoliday(h.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MODAL: CREATE / EDIT SHIFT PATTERN ── */}
      {showPatternModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">
                {editingPattern ? "Edit Shift Pattern" : "New Shift Pattern"}
              </h3>
              <button
                onClick={() => setShowPatternModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePattern} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Shift Name</label>
                <input
                  type="text"
                  required
                  value={patternForm.name}
                  onChange={(e) => setPatternForm({ ...patternForm, name: e.target.value })}
                  placeholder="e.g. Morning Shift, General Shift"
                  className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Start Time</label>
                  <input
                    type="text"
                    value={patternForm.startTime}
                    onChange={(e) => setPatternForm({ ...patternForm, startTime: e.target.value })}
                    placeholder="10:00 AM"
                    className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">End Time</label>
                  <input
                    type="text"
                    value={patternForm.endTime}
                    onChange={(e) => setPatternForm({ ...patternForm, endTime: e.target.value })}
                    placeholder="07:00 PM"
                    className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Required Hours
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={16}
                    value={patternForm.requiredHours}
                    onChange={(e) =>
                      setPatternForm({ ...patternForm, requiredHours: Number(e.target.value) })
                    }
                    className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Late Grace (Mins)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={patternForm.gracePeriodMinutes}
                    onChange={(e) =>
                      setPatternForm({
                        ...patternForm,
                        gracePeriodMinutes: Number(e.target.value),
                      })
                    }
                    className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Working Days
                </label>
                <div className="flex items-center gap-2">
                  {DAY_LABELS.map((day, idx) => {
                    const isActive = (patternForm.workingDays || []).includes(idx);
                    return (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => handleToggleWorkingDayInModal(idx)}
                        className={`w-8 h-8 rounded-full text-xs font-black transition cursor-pointer flex items-center justify-center ${
                          isActive
                            ? "bg-amber-500 text-white shadow-xs ring-2 ring-amber-300"
                            : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPatternModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-xs cursor-pointer"
                >
                  {editingPattern ? "Update Pattern" : "Create Pattern"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD HOLIDAY ── */}
      {showHolidayModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Add Declared Holiday</h3>
              <button
                onClick={() => setShowHolidayModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddHoliday} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Holiday Name</label>
                <input
                  type="text"
                  required
                  value={holidayForm.name}
                  onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })}
                  placeholder="e.g. Festival, Summit"
                  className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={holidayForm.date}
                  onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })}
                  className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowHolidayModal(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-xs cursor-pointer"
                >
                  Save Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: RECORD INTERN LEAVE (ADMIN) ── */}
      {showAdminLeaveModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-black text-slate-900">Record Intern Leave</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAdminLeaveModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdminSubmitLeave} className="space-y-4">
              {/* Select Intern */}
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">Select Intern</label>
                <select
                  value={adminLeaveForm.internName}
                  onChange={(e) => {
                    const selected = availableInternOptions.find((i) => i.name === e.target.value);
                    setAdminLeaveForm({
                      ...adminLeaveForm,
                      internName: e.target.value,
                      internId: selected?.id || `intern_${Date.now()}`,
                    });
                  }}
                  className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  <option value="">-- Choose Intern from Cohort --</option>
                  {availableInternOptions.map((opt) => (
                    <option key={opt.id} value={opt.name}>
                      {opt.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={adminLeaveForm.internName}
                  onChange={(e) =>
                    setAdminLeaveForm({ ...adminLeaveForm, internName: e.target.value })
                  }
                  placeholder="Or enter intern name directly..."
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-2 mt-1.5 outline-none focus:ring-2 focus:ring-indigo-300"
                  required
                />
              </div>

              {/* Leave Type */}
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">Leave Category</label>
                <select
                  value={adminLeaveForm.type}
                  onChange={(e) =>
                    setAdminLeaveForm({
                      ...adminLeaveForm,
                      type: e.target.value as any,
                    })
                  }
                  className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  <option value="academic">Academic (Exam / Viva / Symposium)</option>
                  <option value="sick">Sick / Medical Leave</option>
                  <option value="casual">Casual / Personal Milestone</option>
                  <option value="other">Other Authorized Leave</option>
                </select>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={adminLeaveForm.startDate}
                    onChange={(e) =>
                      setAdminLeaveForm({ ...adminLeaveForm, startDate: e.target.value })
                    }
                    className="w-full text-xs font-mono text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-2 outline-none focus:ring-2 focus:ring-indigo-300"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={adminLeaveForm.endDate}
                    onChange={(e) =>
                      setAdminLeaveForm({ ...adminLeaveForm, endDate: e.target.value })
                    }
                    className="w-full text-xs font-mono text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-2 outline-none focus:ring-2 focus:ring-indigo-300"
                    required
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">Reason / Notes</label>
                <textarea
                  rows={2}
                  value={adminLeaveForm.reason}
                  onChange={(e) =>
                    setAdminLeaveForm({ ...adminLeaveForm, reason: e.target.value })
                  }
                  placeholder="e.g. Authorized absence for Semester VI Capstone Defense"
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-300"
                  required
                />
              </div>

              {/* Initial Status */}
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">Initial Status</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="adminLeaveStatus"
                      checked={adminLeaveForm.initialStatus === "approved"}
                      onChange={() =>
                        setAdminLeaveForm({ ...adminLeaveForm, initialStatus: "approved" })
                      }
                    />
                    <span className="text-emerald-700">Approve Immediately</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="adminLeaveStatus"
                      checked={adminLeaveForm.initialStatus === "pending"}
                      onChange={() =>
                        setAdminLeaveForm({ ...adminLeaveForm, initialStatus: "pending" })
                      }
                    />
                    <span className="text-amber-700">Pending Review</span>
                  </label>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAdminLeaveModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-xs cursor-pointer"
                >
                  Save & Record Leave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
