import React, { useState, useMemo } from "react";
import { AppNotification, UserRole } from "../types";
import {
  Bell,
  Check,
  CheckCircle2,
  X,
  Clock,
  Calendar,
  Library,
  Code2,
  Sparkles,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onClearNotification?: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onNotificationClick: (notif: AppNotification) => void;
  userRole: UserRole;
  userName?: string;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onClearNotification,
  onMarkAllAsRead,
  onClearAll,
  onNotificationClick,
  userRole,
  userName = "User",
}) => {
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const displayedNotifications = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((n) => !n.isRead);
    }
    return notifications;
  }, [notifications, filter]);

  const getRelativeTime = (timestamp: string) => {
    try {
      if (!timestamp) return "Just now";
      const now = Date.now();
      const notifTime = new Date(timestamp).getTime();
      if (isNaN(notifTime)) return "Recently";
      const diffSeconds = Math.max(0, Math.floor((now - notifTime) / 1000));

      if (diffSeconds < 60) return "Just now";
      const diffMinutes = Math.floor(diffSeconds / 60);
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return "Recently";
    }
  };

  const getNotificationIcon = (type: AppNotification["type"]) => {
    switch (type) {
      case "leave_approved":
        return (
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        );
      case "leave_rejected":
        return (
          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
            <X className="w-4 h-4" />
          </div>
        );
      case "leave_requested":
        return (
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
            <Clock className="w-4 h-4" />
          </div>
        );
      case "interview":
        return (
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 border border-purple-200">
            <Calendar className="w-4 h-4" />
          </div>
        );
      case "resource":
        return (
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
            <Library className="w-4 h-4" />
          </div>
        );
      case "assignment":
        return (
          <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 border border-teal-200">
            <Code2 className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-200">
            <Sparkles className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="absolute right-0 top-12 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl shadow-slate-300/60 border border-slate-200 overflow-hidden z-50 flex flex-col max-h-[550px]"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black">
                        {unreadCount} new
                      </span>
                    )}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {userRole === "admin"
                      ? "Admin Governance Feed"
                      : userRole === "student"
                      ? `Targeted Alerts for ${userName}`
                      : `Company Feed • ${userName}`}
                  </p>
                </div>
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={onMarkAllAsRead}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50/70 hover:bg-indigo-100 transition cursor-pointer"
                  title="Mark all as read & clear"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark read</span>
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 mt-3 pt-2 border-t border-slate-200/60">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filter === "all"
                    ? "bg-white text-indigo-700 shadow-2xs border border-indigo-100 font-black"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter("unread")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  filter === "unread"
                    ? "bg-white text-indigo-700 shadow-2xs border border-indigo-100 font-black"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>Unread</span>
                {unreadCount > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                )}
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1 divide-y divide-slate-100 p-1">
            {displayedNotifications.length === 0 ? (
              <div className="py-12 px-6 text-center space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <h5 className="text-xs font-bold text-slate-700">All caught up!</h5>
                <p className="text-[11px] text-slate-400">
                  {filter === "unread"
                    ? "No unread notifications for your account."
                    : "No notifications available at this time."}
                </p>
              </div>
            ) : (
              displayedNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => onNotificationClick(notif)}
                  className={`p-3.5 rounded-2xl transition cursor-pointer flex items-start gap-3 hover:bg-slate-50 group ${
                    !notif.isRead ? "bg-indigo-50/30" : "bg-white"
                  }`}
                >
                  {getNotificationIcon(notif.type)}

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <h5
                        className={`text-xs tracking-tight truncate ${
                          !notif.isRead ? "font-black text-slate-900" : "font-bold text-slate-800"
                        }`}
                      >
                        {notif.title}
                      </h5>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] text-slate-400 font-medium">
                          {getRelativeTime(notif.timestamp)}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onClearNotification) {
                              onClearNotification(notif.id);
                            } else {
                              onMarkAsRead(notif.id);
                            }
                          }}
                          className="w-5 h-5 rounded-md flex items-center justify-center text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Dismiss notification"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-snug line-clamp-2 font-medium">
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between pt-1.5">
                      {notif.actionTab ? (
                        <span className="text-[10px] font-bold text-indigo-600 group-hover:underline flex items-center gap-1">
                          <span>View Details</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      ) : (
                        <span />
                      )}

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsRead(notif.id);
                          }}
                          className="px-2 py-0.5 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                          title="Mark read & clear"
                        >
                          <Check className="w-3 h-3" />
                          <span>Clear</span>
                        </button>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-indigo-200" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
              <span className="text-[10px] text-slate-400 font-semibold pl-2">
                Real-time role notification sync
              </span>
              <button
                type="button"
                onClick={onClearAll}
                className="text-[10px] font-bold text-slate-400 hover:text-rose-600 transition p-1 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear All</span>
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
