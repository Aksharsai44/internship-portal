import React, { useState, useEffect, useMemo } from "react";
import {
  Student,
  ShiftPattern,
  InternRosterAssignment,
  AttendanceRecord,
  PunchLogEntry,
  AttendanceDayStatus,
  LeaveRequest,
  HolidayEvent,
  AppNotification,
  isDemoStudent,
} from "../types";
import {
  Clock,
  Calendar as CalendarIcon,
  Plus,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Search,
  Timer,
  AlertCircle,
  HelpCircle,
  X,
  FileText,
  Flame,
  Zap,
} from "lucide-react";
import confetti from "canvas-confetti";

interface InternAttendanceViewProps {
  currentStudent: Student;
  shiftPatterns: ShiftPattern[];
  rosterAssignments: InternRosterAssignment[];
  attendanceRecords: AttendanceRecord[];
  punchLogs: PunchLogEntry[];
  holidays: HolidayEvent[];
  leaveRequests: LeaveRequest[];
  onUpdatePunchLogs: (logs: PunchLogEntry[]) => void;
  onUpdateAttendanceRecords: (records: AttendanceRecord[]) => void;
  onCreateLeaveRequest: (req: LeaveRequest) => void;
  onAddNotification?: (notif: Omit<AppNotification, "id" | "timestamp" | "isRead">) => void;
  onToast?: (msg: string) => void;
}

export const InternAttendanceView: React.FC<InternAttendanceViewProps> = ({
  currentStudent,
  shiftPatterns,
  rosterAssignments,
  attendanceRecords,
  punchLogs,
  holidays,
  leaveRequests,
  onUpdatePunchLogs,
  onUpdateAttendanceRecords,
  onCreateLeaveRequest,
  onAddNotification,
  onToast,
}) => {
  // ── Live Clock State ──
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Format Time & Date strings
  const formattedTimeStr = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const formattedDateStr = currentTime.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Current Intern's assigned shift
  const studentAssignment = rosterAssignments.find((r) => r.internId === currentStudent.id);
  const studentShift =
    shiftPatterns.find((s) => s.id === studentAssignment?.shiftId) || shiftPatterns[0];

  // Intern's punch logs (filtered for this student)
  const isDemo = isDemoStudent(currentStudent);
  const studentPunchLogs = punchLogs.filter(
    (p) => p.internId === currentStudent.id || (isDemo && !p.internId)
  );

  // Determine current punch status
  const latestPunch = studentPunchLogs[0];
  const isClockedIn = latestPunch && latestPunch.type === "clock_in";

  // Working time elapsed since clock-in
  const [elapsedWorkingSeconds, setElapsedWorkingSeconds] = useState(0);

  useEffect(() => {
    if (!isClockedIn || !latestPunch) {
      setElapsedWorkingSeconds(0);
      return;
    }
    const startTime = new Date(latestPunch.timestamp).getTime();
    const updateElapsed = () => {
      const now = Date.now();
      const diffSecs = Math.max(0, Math.floor((now - startTime) / 1000));
      setElapsedWorkingSeconds(diffSecs);
    };
    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [isClockedIn, latestPunch]);

  const formatElapsed = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // ── Swipe Button State ──
  const [isSwiping, setIsSwiping] = useState(false);

  const handleExecuteSwipe = () => {
    setIsSwiping(true);
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const timeFormatted = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    const dateFormatted = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;

    if (!isClockedIn) {
      // Clock In
      const newEntry: PunchLogEntry = {
        id: `punch_${Date.now()}`,
        internId: currentStudent.id,
        internName: currentStudent.name,
        date: todayStr,
        type: "clock_in",
        timestamp: now.toISOString(),
        formattedTime: `${timeFormatted} - ${dateFormatted}`,
      };
      onUpdatePunchLogs([newEntry, ...punchLogs]);

      // Check if arrival is late (>10m after shift start e.g. 10:10 AM)
      const shiftStartHour = 10;
      const shiftStartMinute = 10;
      const isLate =
        now.getHours() > shiftStartHour ||
        (now.getHours() === shiftStartHour && now.getMinutes() > shiftStartMinute);

      // Upsert today's attendance record
      const updatedAttendance = [...attendanceRecords];
      const existingIdx = updatedAttendance.findIndex(
        (a) => a.date === todayStr && a.internId === currentStudent.id
      );
      const newRecord: AttendanceRecord = {
        id: `att_${todayStr}_${currentStudent.id}`,
        internId: currentStudent.id,
        internName: currentStudent.name,
        date: todayStr,
        status: isLate ? "late" : "present",
        clockInTime: timeFormatted,
        hoursWorked: 0,
        requiredHours: studentAssignment?.requiredHours || 8,
        shiftId: studentShift.id,
        shiftName: studentShift.name,
        isLate,
        notes: isLate ? "Clocked in late past grace threshold." : "Active shift in progress.",
      };

      if (existingIdx >= 0) {
        updatedAttendance[existingIdx] = { ...updatedAttendance[existingIdx], ...newRecord };
      } else {
        updatedAttendance.push(newRecord);
      }
      onUpdateAttendanceRecords(updatedAttendance);

      try {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      } catch {}

      if (onToast) onToast(`Successfully Clocked In at ${timeFormatted}`);
    } else {
      // Clock Out
      const startTime = new Date(latestPunch.timestamp).getTime();
      const workedSecs = Math.max(0, Math.floor((now.getTime() - startTime) / 1000));
      const workedHrs = (workedSecs / 3600).toFixed(1);
      const formattedTotal = `Total Worked: ${formatElapsed(workedSecs)}`;

      const newEntry: PunchLogEntry = {
        id: `punch_${Date.now()}`,
        internId: currentStudent.id,
        internName: currentStudent.name,
        date: todayStr,
        type: "clock_out",
        timestamp: now.toISOString(),
        formattedTime: `${timeFormatted} - ${dateFormatted}`,
        totalWorkedFormatted: formattedTotal,
        totalWorkedSeconds: workedSecs,
      };
      onUpdatePunchLogs([newEntry, ...punchLogs]);

      // Update today's attendance record
      const updatedAttendance = [...attendanceRecords];
      const existingIdx = updatedAttendance.findIndex(
        (a) => a.date === todayStr && a.internId === currentStudent.id
      );
      if (existingIdx >= 0) {
        updatedAttendance[existingIdx] = {
          ...updatedAttendance[existingIdx],
          clockOutTime: timeFormatted,
          hoursWorked: Number(workedHrs),
          status: "present",
          isPunchError: false,
          notes: `Completed shift: ${formattedTotal}`,
        };
      } else {
        updatedAttendance.push({
          id: `att_${todayStr}_${currentStudent.id}`,
          internId: currentStudent.id,
          internName: currentStudent.name,
          date: todayStr,
          status: "present",
          clockInTime: latestPunch.formattedTime.split(" - ")[0],
          clockOutTime: timeFormatted,
          hoursWorked: Number(workedHrs),
          requiredHours: studentAssignment?.requiredHours || 8,
          shiftId: studentShift.id,
          shiftName: studentShift.name,
          notes: `Completed shift: ${formattedTotal}`,
        });
      }
      onUpdateAttendanceRecords(updatedAttendance);

      if (onToast) onToast(`Clocked Out successfully! ${formattedTotal}`);
    }

    setTimeout(() => setIsSwiping(false), 600);
  };

  // ── Month & Calendar State ──
  const [selectedMonth, setSelectedMonth] = useState(8); // 8 = September (0-indexed)
  const [selectedYear, setSelectedYear] = useState(2026);
  const [inspectedDayRecord, setInspectedDayRecord] = useState<{
    dateStr: string;
    dayNum: number;
    status: AttendanceDayStatus | "today";
    record?: AttendanceRecord;
    holiday?: HolidayEvent;
    leaveRequest?: LeaveRequest;
  } | null>(null);

  // Leave Modal
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    startDate: "2026-09-21",
    endDate: "2026-09-22",
    reason: "",
    type: "casual" as const,
  });

  // Leaves Search & Filtering
  const [leaveSearchQuery, setLeaveSearchQuery] = useState("");

  const studentLeaveRequests = useMemo(() => {
    return leaveRequests.filter(
      (r) => r.internId === currentStudent.id || r.internName === currentStudent.name
    );
  }, [leaveRequests, currentStudent]);

  const filteredStudentLeaves = useMemo(() => {
    return studentLeaveRequests.filter((l) => {
      if (!leaveSearchQuery.trim()) return true;
      const q = leaveSearchQuery.toLowerCase();
      return (
        l.reason.toLowerCase().includes(q) ||
        l.type.toLowerCase().includes(q) ||
        l.status.toLowerCase().includes(q) ||
        l.startDate.includes(q) ||
        l.endDate.includes(q)
      );
    });
  }, [studentLeaveRequests, leaveSearchQuery]);

  // Month Calendar Calculations (September 2026)
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDayWeekday = new Date(selectedYear, selectedMonth, 1).getDay(); // 0 = Sun

  const calendarCells = [];
  // Leading empty cells
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarCells.push(null);
  }
  // Days 1..daysInMonth
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  const getDayStatus = (
    dayNum: number
  ): {
    status: AttendanceDayStatus | "today";
    record?: AttendanceRecord;
    holiday?: HolidayEvent;
    leaveRequest?: LeaveRequest;
  } => {
    const dateStr = `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, "0")}-${dayNum
      .toString()
      .padStart(2, "0")}`;

    // 1. Check holiday / company announcements first
    const hol = holidays.find((h) => h.date === dateStr);
    if (hol) return { status: "holiday", holiday: hol };

    // 2. Check approved leave requests for this student (Receipt synchronization)
    const approvedLeave = leaveRequests.find(
      (req) =>
        req.status === "approved" &&
        (req.internId === currentStudent.id ||
          (req.internName && currentStudent.name && req.internName.toLowerCase().trim() === currentStudent.name.toLowerCase().trim())) &&
        dateStr >= req.startDate &&
        dateStr <= req.endDate
    );
    if (approvedLeave) {
      return { status: "on_leave", leaveRequest: approvedLeave };
    }

    // 3. Check recorded attendance (match strictly by internId or internName)
    const rec = attendanceRecords.find(
      (a) =>
        a.date === dateStr &&
        (a.internId === currentStudent.id ||
          (a.internName && currentStudent.name && a.internName.toLowerCase().trim() === currentStudent.name.toLowerCase().trim()))
    );
    if (rec) return { status: rec.status, record: rec };

    // 4. Today Check
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;
    if (dateStr === todayStr) {
      if (isClockedIn) {
        return { status: "present" };
      }
      return { status: "today" };
    }

    // 5. Weekday / Custom Weekend / Shift Working Days Check
    const dayOfWeek = new Date(selectedYear, selectedMonth, dayNum).getDay();
    const customWeekends = studentAssignment?.customWeekends || [0, 6];
    const isShiftWorkingDay = studentShift?.workingDays
      ? studentShift.workingDays.includes(dayOfWeek)
      : !customWeekends.includes(dayOfWeek);

    if (customWeekends.includes(dayOfWeek) || !isShiftWorkingDay) {
      return { status: "week_off" };
    }

    // 6. Check enrollment date
    const studentStartDate = currentStudent.internshipStartDate || currentStudent.enrolledAt;
    if (studentStartDate) {
      const enrollmentDateStr = studentStartDate.split("T")[0];
      if (dateStr < enrollmentDateStr) {
        return { status: "scheduled" };
      }
    }

    // 7. If date is in the past (before today) and no record -> absent
    if (dateStr < todayStr) {
      return { status: "absent" };
    }

    // 8. Otherwise (future scheduled workday) -> scheduled
    return { status: "scheduled" };
  };

  const handleDayClick = (dayNum: number) => {
    const dateStr = `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, "0")}-${dayNum
      .toString()
      .padStart(2, "0")}`;
    const dayData = getDayStatus(dayNum);
    setInspectedDayRecord({
      dateStr,
      dayNum,
      status: dayData.status,
      record: dayData.record,
      holiday: dayData.holiday,
      leaveRequest: dayData.leaveRequest,
    });
  };

  const handleSubmitLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason.trim()) return;

    const newReq: LeaveRequest = {
      id: `leave_${Date.now()}`,
      internId: currentStudent.id,
      internName: currentStudent.name,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      reason: leaveForm.reason,
      type: leaveForm.type,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    onCreateLeaveRequest(newReq);

    if (onAddNotification) {
      onAddNotification({
        recipientRole: "admin",
        title: "New Leave Application",
        message: `${currentStudent.name || "Intern"} applied for ${leaveForm.type} leave (${leaveForm.startDate} → ${leaveForm.endDate}). Reason: "${leaveForm.reason}"`,
        type: "leave_requested",
        actionTab: "shifts",
      });
    }

    setShowLeaveModal(false);
    if (onToast) onToast("Leave request submitted successfully for mentor approval.");
  };

  return (
    <div className="space-y-6 pb-16">
      {/* ── TOP TWO COLUMNS: TIME CLOCK (LEFT) & ATTENDANCE CALENDAR (RIGHT) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ══════════════════════════════════════════════════════════ */}
        {/* LEFT COLUMN: LIVE TIME CLOCK & SWIPE PUNCH CONTROLS       */}
        {/* (Matches Image 1 Left Side & Image 2 Left Side)            */}
        {/* ══════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Top Blue Header Banner (Image 1 Left) */}
            <div className="bg-gradient-to-b from-[#0284c7] to-[#0ea5e9] text-white p-6 sm:p-7 text-center relative overflow-hidden">
              {/* Date Header */}
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-sky-100 mb-2">
                <Clock className="w-3.5 h-3.5 text-sky-200" />
                <span>{formattedDateStr}</span>
              </div>

              {/* Massive Live Digital Clock Display */}
              <div className="text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-xs my-2 font-mono">
                {formattedTimeStr}
              </div>

              {/* Shift info subtitle */}
              <p className="text-xs font-bold text-sky-100 mt-1">
                Shift: {studentShift.name} ({studentAssignment?.requiredHours || studentShift.requiredHours} hrs required)
              </p>

              {/* Status Pill matching Image 1 */}
              <div className="mt-3 flex items-center justify-center">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-2xs ${
                    isClockedIn
                      ? "bg-emerald-500/90 text-white ring-2 ring-emerald-300 animate-pulse"
                      : "bg-white/20 text-white backdrop-blur-xs"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isClockedIn ? "bg-white" : "bg-sky-200"
                    }`}
                  />
                  <span>
                    {isClockedIn
                      ? `Clocked In (${formatElapsed(elapsedWorkingSeconds)})`
                      : "Not Clocked In"}
                  </span>
                </span>
              </div>
            </div>

            {/* Bottom Controls Container */}
            <div className="p-6 space-y-4">
              {/* Green SWIPE TO CLOCK IN / OUT Button (Image 1 Left) */}
              <button
                type="button"
                onClick={handleExecuteSwipe}
                disabled={isSwiping}
                className={`w-full py-4 px-5 rounded-2xl font-black text-sm text-white tracking-wide uppercase shadow-md flex items-center justify-center gap-3 transition-all cursor-pointer relative overflow-hidden group ${
                  isClockedIn
                    ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 ring-4 ring-amber-100"
                    : "bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#059669] hover:to-[#047857] ring-4 ring-emerald-100"
                }`}
              >
                {/* Chevron icon box */}
                <span className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white font-black text-base transition-transform group-hover:translate-x-1 shrink-0">
                  »
                </span>
                <span>{isClockedIn ? "SWIPE TO CLOCK OUT" : "SWIPE TO CLOCK IN"}</span>
              </button>

              {/* Punch Error Alert Warning Box (Image 1 Left) */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 text-amber-900 text-xs flex items-start gap-3 leading-relaxed">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-black text-amber-950">Punch Error Alert:</strong> If you
                  forget to swipe out or arrive late (&gt;10m), it will be flagged as a punch error.
                  Contact HR to correct.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* RIGHT COLUMN: ATTENDANCE MONTHLY CALENDAR                  */}
        {/* (Matches Image 1 Right Side)                               */}
        {/* ══════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          {/* Header with Title, Month Dropdown, Year Dropdown, + Leave Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <CalendarIcon className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Attendance</h3>
            </div>

            <div className="flex items-center gap-2">
              {/* Month Selector */}
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-blue-300 transition cursor-pointer"
              >
                <option value={8}>Sep</option>
                <option value={9}>Oct</option>
                <option value={10}>Nov</option>
                <option value={11}>Dec</option>
              </select>

              {/* Year Selector */}
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-blue-300 transition cursor-pointer"
              >
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>

              {/* + Leave Button */}
              <button
                onClick={() => setShowLeaveModal(true)}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Leave</span>
              </button>
            </div>
          </div>

          {/* ── ADMIN SHIFT & ANNOUNCEMENTS BANNER ── */}
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 border border-blue-200/90 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-600 text-white font-black text-[11px] shadow-2xs">
                  {studentShift.name}
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {studentShift.startTime} – {studentShift.endTime}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  ({studentAssignment?.requiredHours || studentShift.requiredHours} hrs req · {studentShift.gracePeriodMinutes || 10}m grace window)
                </span>
              </div>
              <div className="text-[11px] font-bold text-indigo-700 bg-white/90 px-2.5 py-0.5 rounded-full border border-indigo-200 shadow-2xs">
                Working Days: Mon – Fri (Sun & Sat Off)
              </div>
            </div>

            {/* Admin Announcements & Company Holidays */}
            {holidays.length > 0 && (
              <div className="pt-2 border-t border-blue-200/70 flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-indigo-950 uppercase tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                  Announcements:
                </span>
                {holidays.map((h) => (
                  <span
                    key={h.id}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold border shadow-2xs ${
                      h.type === "holiday"
                        ? "bg-cyan-100 text-cyan-950 border-cyan-300"
                        : "bg-indigo-100 text-indigo-950 border-indigo-300"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-600" />
                    <span>{h.name}</span>
                    <span className="text-[10px] font-mono opacity-80">({h.date})</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Month Label Header */}
          <div className="text-center font-black text-sm text-slate-800">
            September {selectedYear}
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
          <div className="grid grid-cols-7 gap-2">
            {calendarCells.map((dayNum, index) => {
              if (!dayNum) {
                return <div key={`empty_${index}`} className="h-12 sm:h-14" />;
              }

              const { status, holiday, leaveRequest } = getDayStatus(dayNum);
              const isToday = dayNum === 6 && selectedMonth === 8 && selectedYear === 2026;

              return (
                <button
                  key={`day_${dayNum}`}
                  type="button"
                  onClick={() => handleDayClick(dayNum)}
                  className={`h-12 sm:h-14 rounded-2xl flex flex-col items-center justify-center relative transition-all cursor-pointer hover:shadow-md hover:scale-105 ${
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
                      ? "border-2 border-purple-500 bg-purple-100/90 text-purple-950 font-black shadow-2xs ring-2 ring-purple-200"
                      : status === "half_day"
                      ? "border-2 border-yellow-500 bg-yellow-100/80 text-yellow-950 font-black shadow-2xs"
                      : status === "scheduled"
                      ? "border-2 border-slate-200 bg-white text-slate-700 font-bold hover:border-blue-400 hover:bg-blue-50/20 shadow-2xs"
                      : "border border-slate-200 bg-slate-100/80 text-slate-500 font-semibold"
                  }`}
                  title={`Day ${dayNum}: ${status.replace("_", " ").toUpperCase()}${holiday ? ` - ${holiday.name}` : ""}${leaveRequest ? ` - Approved Leave: ${leaveRequest.reason}` : ""}`}
                >
                  <span className="text-xs font-black">{dayNum}</span>

                  {/* Status Indicator Icon / Badge */}
                  <div className="mt-0.5 flex items-center justify-center">
                    {isToday ? (
                      <span className="w-2 h-2 rounded-full border border-blue-600 bg-white shadow-2xs" />
                    ) : status === "present" ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-emerald-200" />
                    ) : status === "late" ? (
                      <span className="w-3.5 h-3.5 rounded bg-amber-500 text-white text-[8px] font-black flex items-center justify-center shadow-2xs">
                        L
                      </span>
                    ) : status === "punch_error" ? (
                      <span className="w-3.5 h-3.5 rounded bg-rose-600 text-white text-[8px] font-black flex items-center justify-center shadow-2xs animate-pulse">
                        !
                      </span>
                    ) : status === "absent" ? (
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                    ) : status === "holiday" ? (
                      <span className="w-3.5 h-3.5 rounded bg-cyan-600 text-white text-[8px] font-black flex items-center justify-center shadow-2xs">
                        H
                      </span>
                    ) : status === "on_leave" ? (
                      <span className="w-2 h-2 rounded-full bg-purple-600 ring-2 ring-purple-200" />
                    ) : status === "half_day" ? (
                      <span className="w-2 h-2 rounded-full bg-amber-400 ring-2 ring-amber-200" />
                    ) : status === "scheduled" ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-400" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Complete Legend with Bright Indicators matching Image 1 */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-2 text-[11px] font-bold text-slate-700">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-300 text-blue-800">
              <span className="w-2 h-2 rounded-full border border-blue-600 bg-white" /> Today
            </span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-600" /> Present
            </span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-50 border border-rose-300 text-rose-800">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Absent
            </span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-purple-50 border border-purple-300 text-purple-800">
              <span className="w-2 h-2 rounded-full bg-purple-600" /> On leave
            </span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-yellow-50 border border-yellow-300 text-yellow-800">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Half Day
            </span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-slate-400" /> Week Off
            </span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-cyan-50 border border-cyan-300 text-cyan-900">
              <span className="w-3 h-3 rounded bg-cyan-600 text-white text-[7px] flex items-center justify-center font-black">
                H
              </span>{" "}
              Holiday
            </span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-300 text-amber-900">
              <span className="w-3 h-3 rounded bg-amber-500 text-white text-[7px] flex items-center justify-center font-black">
                L
              </span>{" "}
              Late
            </span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-50 border border-rose-300 text-rose-900">
              <span className="w-3 h-3 rounded bg-rose-600 text-white text-[7px] flex items-center justify-center font-black">
                !
              </span>{" "}
              Punch Error
            </span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white border border-slate-300 text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" /> Scheduled
            </span>
          </div>
        </div>
      </div>

      {/* ── CARD 3: LEAVES (Replaced Activity Log per user request) ── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-black text-slate-900">Leaves</h4>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              {filteredStudentLeaves.length} {filteredStudentLeaves.length === 1 ? "application" : "applications"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={leaveSearchQuery}
                onChange={(e) => setLeaveSearchQuery(e.target.value)}
                placeholder="Search leaves (e.g. casual, medical, date)..."
                className="pl-8 pr-3 py-2 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-300 transition w-52 sm:w-64"
              />
            </div>

            {/* Apply for Leave Button */}
            <button
              type="button"
              onClick={() => setShowLeaveModal(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Apply for Leave</span>
            </button>
          </div>
        </div>

        {/* Leave Requests Cards List */}
        <div className="space-y-3">
          {filteredStudentLeaves.map((req) => (
            <div
              key={req.id}
              className={`p-4 rounded-2xl border transition space-y-2.5 ${
                req.status === "approved"
                  ? "bg-emerald-50/40 border-emerald-200"
                  : req.status === "rejected"
                  ? "bg-rose-50/40 border-rose-200"
                  : "bg-amber-50/40 border-amber-200"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* Status Badge */}
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1 ${
                      req.status === "approved"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : req.status === "rejected"
                        ? "bg-rose-100 text-rose-800 border border-rose-300"
                        : "bg-amber-100 text-amber-800 border border-amber-300"
                    }`}
                  >
                    {req.status === "approved" ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    ) : req.status === "rejected" ? (
                      <X className="w-3 h-3 text-rose-600" />
                    ) : (
                      <Clock className="w-3 h-3 text-amber-600" />
                    )}
                    <span>{req.status === "approved" ? "Approved" : req.status === "rejected" ? "Rejected" : "Pending Review"}</span>
                  </span>

                  {/* Type Pill */}
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-white text-slate-700 border border-slate-200 capitalize">
                    {req.type} Leave
                  </span>

                  {/* Date Range */}
                  <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1">
                    <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
                    <span>{req.startDate} → {req.endDate}</span>
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 font-mono">
                  Applied {new Date(req.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </div>
              </div>

              {/* Reason */}
              <div className="text-xs text-slate-700 leading-relaxed font-medium bg-white/80 p-2.5 rounded-xl border border-slate-200/80">
                <strong className="text-slate-900">Reason:</strong> {req.reason}
              </div>

              {/* Admin Feedback note if reviewed */}
              {req.adminFeedback && (
                <div className="text-xs text-slate-800 p-2.5 rounded-xl bg-slate-100/90 border border-slate-200 flex items-start gap-2">
                  <span className="font-bold text-slate-900 shrink-0">Mentor Review Note:</span>
                  <span className="italic text-slate-700">{req.adminFeedback}</span>
                </div>
              )}
            </div>
          ))}

          {filteredStudentLeaves.length === 0 && (
            <div className="p-8 text-center space-y-2">
              <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-medium text-slate-500">
                {leaveSearchQuery
                  ? "No leave applications match your search."
                  : "No leave applications submitted yet. Click 'Apply for Leave' to submit a request."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── MODAL: DAY TELEMETRY INSPECTION & LEAVE APPROVAL RECEIPT ── */}
      {inspectedDayRecord && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-black text-slate-900">
                  {inspectedDayRecord.leaveRequest
                    ? "Official Leave Approval Receipt"
                    : `Day Details: ${inspectedDayRecord.dateStr}`}
                </h3>
              </div>
              <button
                onClick={() => setInspectedDayRecord(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1. If this day is an APPROVED LEAVE (Receipt presentation) */}
            {inspectedDayRecord.leaveRequest ? (
              <div className="space-y-4 text-xs">
                {/* Receipt Verified Header Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 border border-purple-200/90 flex items-start gap-3 shadow-2xs">
                  <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-purple-950 uppercase tracking-wide">
                        Approved Leave Receipt
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-purple-200/80 text-purple-900 font-mono text-[10px] font-bold">
                        REF-LIV-{inspectedDayRecord.leaveRequest.id.slice(-6).toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] text-purple-800 font-medium">
                      This scheduled absence was verified and approved by the administrative authority.
                    </p>
                  </div>
                </div>

                {/* Receipt Details Grid */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold">Intern Name</span>
                    <span className="font-black text-slate-900">{currentStudent.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold">Leave Classification</span>
                    <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-black uppercase bg-purple-100 text-purple-900 border border-purple-300">
                      {inspectedDayRecord.leaveRequest.type} Leave
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold">Approved Range</span>
                    <span className="font-black text-slate-900">
                      {inspectedDayRecord.leaveRequest.startDate} → {inspectedDayRecord.leaveRequest.endDate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold">Approval Status</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Approved by Admin
                    </span>
                  </div>
                  {inspectedDayRecord.leaveRequest.adminReviewedAt && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Reviewed Timestamp</span>
                      <span className="font-mono text-slate-600">
                        {new Date(inspectedDayRecord.leaveRequest.adminReviewedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Stated Reason */}
                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                    Intern's Stated Reason
                  </span>
                  <p className="text-slate-800 font-medium italic">
                    "{inspectedDayRecord.leaveRequest.reason}"
                  </p>
                </div>

                {/* Admin Feedback (if present) */}
                {inspectedDayRecord.leaveRequest.adminFeedback && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider block">
                      Mentor / Admin Note
                    </span>
                    <p className="text-emerald-950 font-medium">
                      {inspectedDayRecord.leaveRequest.adminFeedback}
                    </p>
                  </div>
                )}

                {/* AI Validation Recommendation (if present) */}
                {inspectedDayRecord.leaveRequest.aiRecommendation && (
                  <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 flex items-start gap-2.5">
                    <Zap className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-black text-indigo-900 uppercase tracking-wider block">
                        AI Compliance Check: {inspectedDayRecord.leaveRequest.aiRecommendation.confidence}% Confidence
                      </span>
                      <p className="text-[11px] text-indigo-950 font-medium mt-0.5">
                        {inspectedDayRecord.leaveRequest.aiRecommendation.reasoning}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : inspectedDayRecord.status === "scheduled" ? (
              /* 2. If this day is an UPCOMING SCHEDULED WORKING DAY */
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-black text-blue-950 text-xs">Upcoming Working Day</h4>
                    <p className="text-blue-800 text-[11px] mt-0.5">
                      This date is scheduled in accordance with your assigned roster and shift pattern.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold">Assigned Shift</span>
                    <span className="font-black text-slate-900">{studentShift.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold">Shift Timings</span>
                    <span className="font-black text-blue-700 font-mono">
                      {studentShift.startTime} – {studentShift.endTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold">Required Daily Hours</span>
                    <span className="font-black text-slate-900">
                      {studentAssignment?.requiredHours || studentShift.requiredHours} Hours
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold">Grace Period</span>
                    <span className="font-bold text-amber-700">
                      {studentShift.gracePeriodMinutes || 10} Minutes
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-[11px]">
                  <strong>Punch Rule:</strong> Ensure you swipe in before{" "}
                  {studentShift.startTime} (+{studentShift.gracePeriodMinutes || 10}m grace) and complete at least{" "}
                  {studentAssignment?.requiredHours || studentShift.requiredHours} hours before swiping out to earn full attendance.
                </div>
              </div>
            ) : (
              /* 3. Regular Past / Recorded Attendance Day */
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold">Attendance Status</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase bg-blue-50 text-blue-700 border border-blue-200">
                    {inspectedDayRecord.status.replace("_", " ")}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold">Assigned Shift</span>
                  <span className="font-bold text-slate-800">{studentShift.name}</span>
                </div>

                {inspectedDayRecord.record?.clockInTime && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold">Swipe In Punch</span>
                    <span className="font-mono font-bold text-emerald-600">
                      {inspectedDayRecord.record.clockInTime}
                    </span>
                  </div>
                )}

                {inspectedDayRecord.record?.clockOutTime ? (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold">Swipe Out Punch</span>
                    <span className="font-mono font-bold text-rose-600">
                      {inspectedDayRecord.record.clockOutTime}
                    </span>
                  </div>
                ) : inspectedDayRecord.status === "punch_error" ? (
                  <div className="flex items-center justify-between">
                    <span className="text-rose-600 font-bold">Swipe Out Punch</span>
                    <span className="font-bold text-rose-600">MISSING (Punch Error / Not Present)</span>
                  </div>
                ) : null}

                {inspectedDayRecord.record?.hoursWorked !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold">Hours Worked</span>
                    <span className="font-black text-slate-900">
                      {inspectedDayRecord.record.hoursWorked}h / {studentShift.requiredHours}h required
                    </span>
                  </div>
                )}

                {inspectedDayRecord.holiday && (
                  <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-900 font-medium">
                    <strong>Holiday:</strong> {inspectedDayRecord.holiday.name}
                  </div>
                )}

                {inspectedDayRecord.record?.notes && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
                    {inspectedDayRecord.record.notes}
                  </div>
                )}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setInspectedDayRecord(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: LEAVE APPLICATION ── */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Apply for Leave</h3>
              <button
                onClick={() => setShowLeaveModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitLeave} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Leave Type</label>
                <select
                  value={leaveForm.type}
                  onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value as any })}
                  className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <option value="casual">Casual Leave</option>
                  <option value="sick">Medical / Sick Leave</option>
                  <option value="academic">Academic / Exam Leave</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Reason for Absence
                </label>
                <textarea
                  required
                  rows={3}
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  placeholder="Provide brief context for mentor and HR review..."
                  className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-xs cursor-pointer"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
