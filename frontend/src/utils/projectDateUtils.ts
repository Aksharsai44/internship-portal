/**
 * projectDateUtils.ts
 * Unified date and time formatting utilities for Project Assignments,
 * ensuring consistent display across Admin and Intern views.
 */

export const formatTime12h = (timeStr?: string): string => {
  if (!timeStr) return "11:59 PM";
  const trimmed = timeStr.trim();
  if (trimmed.includes("AM") || trimmed.includes("PM")) return trimmed;
  const parts = trimmed.split(":");
  let hours = parseInt(parts[0], 10);
  const mins = parts[1] || "00";
  if (isNaN(hours)) return trimmed;
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 hour is 12 AM
  return `${hours}:${mins} ${ampm}`;
};

export const formatDateDisplay = (dateStr?: string): string => {
  if (!dateStr) return "TBD";
  try {
    const [y, m, d] = dateStr.split("-");
    if (y && m && d) {
      const date = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};

export const formatCompactSchedule = (dateStr?: string, timeStr?: string): string => {
  if (!dateStr) return "TBD";
  try {
    const [y, m, d] = dateStr.split("-");
    if (y && m && d) {
      const date = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
      const monthDay = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      return `${monthDay} • ${formatTime12h(timeStr)}`;
    }
    return `${dateStr} • ${formatTime12h(timeStr)}`;
  } catch {
    return `${dateStr} • ${formatTime12h(timeStr)}`;
  }
};

export const formatFullSchedule = (dateStr?: string, timeStr?: string): string => {
  const formattedDate = formatDateDisplay(dateStr);
  const formattedTime = formatTime12h(timeStr);
  return `${formattedDate} at ${formattedTime}`;
};

export const getProjectScheduleStatus = (
  startDate?: string,
  startTime?: string,
  deadlineDate?: string,
  deadlineTime?: string
): {
  status: "upcoming" | "active" | "due_soon" | "overdue";
  label: string;
  badgeClass: string;
} => {
  try {
    const now = Date.now();
    const startIso = startDate
      ? new Date(`${startDate}T${startTime || "00:00:00"}`).getTime()
      : 0;
    const deadlineIso = deadlineDate
      ? new Date(`${deadlineDate}T${deadlineTime || "23:59:59"}`).getTime()
      : Infinity;

    if (startIso && now < startIso) {
      return {
        status: "upcoming",
        label: `Starts ${formatCompactSchedule(startDate, startTime)}`,
        badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
      };
    }

    if (now > deadlineIso) {
      return {
        status: "overdue",
        label: `Past Deadline (${formatDateDisplay(deadlineDate)})`,
        badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
      };
    }

    // Check if within 2 days of deadline
    const twoDaysMs = 48 * 60 * 60 * 1000;
    if (deadlineIso - now <= twoDaysMs) {
      return {
        status: "due_soon",
        label: `Due Soon (${formatCompactSchedule(deadlineDate, deadlineTime)})`,
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
      };
    }

    return {
      status: "active",
      label: `Submissions Open (Due ${formatCompactSchedule(deadlineDate, deadlineTime)})`,
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  } catch {
    return {
      status: "active",
      label: "Submissions Active",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  }
};
