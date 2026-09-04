import React, { useState, useMemo } from "react";
import { Batch, Student, ClientUser, InterviewRequest } from "../types";
import {
  Users,
  TrendingUp,
  Calendar,
  Building2,
  Trophy,
  Eye,
  ArrowUpRight,
  Clock,
  Briefcase,
  ChevronRight,
  BarChart3,
  Star,
  CalendarCheck,
  Filter,
} from "lucide-react";
import { motion } from "motion/react";

interface ClientDashboardViewProps {
  clientUser: ClientUser;
  batches: Batch[];
  students: Student[];
  interviewRequests: InterviewRequest[];
  onNavigateTab: (tab: string) => void;
  onSelectBatch: (batch: Batch) => void;
}

export function ClientDashboardView({
  clientUser,
  batches,
  students,
  interviewRequests,
  onNavigateTab,
  onSelectBatch,
}: ClientDashboardViewProps) {
  const assignedBatches = useMemo(
    () =>
      batches.filter(
        (b) =>
          (clientUser.assignedBatches || []).includes(b.id) ||
          (clientUser.assignedBatches || []).includes("all")
      ),
    [batches, clientUser.assignedBatches]
  );

  const assignedInterns = useMemo(
    () =>
      students.filter((s) =>
        assignedBatches.some((b) => b.id === s.batchId)
      ),
    [students, assignedBatches]
  );

  const myRequests = useMemo(
    () => interviewRequests.filter((r) => r.clientId === clientUser.id),
    [interviewRequests, clientUser.id]
  );

  const pendingRequests = myRequests.filter((r) => r.status === "pending");
  const scheduledRequests = myRequests.filter((r) => r.status === "scheduled");
  const completedRequests = myRequests.filter((r) => r.status === "completed");

  const avgScore = assignedInterns.length > 0
    ? Math.round(assignedInterns.reduce((sum, s) => sum + (s.scores?.overallAccuracy || 0), 0) / assignedInterns.length)
    : 0;

  const topInterns = [...assignedInterns]
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-8 text-white"
      >
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-5 h-5 text-emerald-200" />
            <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">{clientUser.industry || "Client Portal"}</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-1">
            Welcome, {clientUser.contactPerson}
          </h1>
          <p className="text-emerald-100 text-sm font-medium">
            {clientUser.companyName} • {assignedBatches.length} Assigned Cohort{assignedBatches.length !== 1 ? "s" : ""}
          </p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Interns", value: assignedInterns.length, icon: Users, color: "from-sky-500 to-blue-600", bg: "bg-sky-50" },
          { label: "Avg Performance", value: `${avgScore}%`, icon: TrendingUp, color: "from-emerald-500 to-teal-600", bg: "bg-emerald-50" },
          { label: "Pending Interviews", value: pendingRequests.length, icon: Clock, color: "from-amber-500 to-orange-600", bg: "bg-amber-50" },
          { label: "Scheduled", value: scheduledRequests.length, icon: CalendarCheck, color: "from-violet-500 to-purple-600", bg: "bg-violet-50" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`${stat.bg} rounded-2xl p-5 border border-slate-100`}
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-black text-slate-800">{stat.value}</div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Assigned Cohorts */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-800">Assigned Cohorts</h2>
            <button
              onClick={() => onNavigateTab("leaderboard")}
              className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              View Leaderboard <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {assignedBatches.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-500">No cohorts assigned yet</p>
              <p className="text-xs text-slate-400 mt-1">Your admin will assign intern cohorts to you</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignedBatches.map((batch, i) => {
                const batchInterns = students.filter((s) => s.batchId === batch.id);
                const batchAvg = batchInterns.length > 0
                  ? Math.round(batchInterns.reduce((s, i) => s + (i.scores?.overallAccuracy || 0), 0) / batchInterns.length)
                  : 0;

                return (
                  <motion.div
                    key={batch.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => {
                      onSelectBatch(batch);
                      onNavigateTab("leaderboard");
                    }}
                    className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:border-teal-200 transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                            batch.status === "active" ? "bg-emerald-100 text-emerald-700" :
                            batch.status === "completed" ? "bg-slate-100 text-slate-600" :
                            "bg-amber-100 text-amber-700"
                          }`}>
                            {batch.status}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">{batch.durationLabel}</span>
                        </div>
                        <h3 className="font-black text-slate-800 truncate">{batch.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {batchInterns.length} Intern{batchInterns.length !== 1 ? "s" : ""} • Avg Score: {batchAvg}%
                        </p>
                        {batch.technologies && batch.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {batch.technologies.slice(0, 4).map((t) => (
                              <span key={t} className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded-lg text-[10px] font-bold">{t}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-teal-500 transition-colors flex-shrink-0" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Top Performing Interns */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                Top Interns
              </h3>
            </div>
            {topInterns.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No intern data yet</p>
            ) : (
              <div className="space-y-3">
                {topInterns.map((intern, i) => (
                  <div key={intern.id} className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                      i === 0 ? "bg-amber-100 text-amber-700" :
                      i === 1 ? "bg-slate-100 text-slate-600" :
                      i === 2 ? "bg-orange-100 text-orange-700" :
                      "bg-slate-50 text-slate-500"
                    }`}>
                      {i + 1}
                    </div>
                    <img
                      src={intern.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(intern.name)}`}
                      alt={intern.name}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-800 truncate">{intern.name}</div>
                      <div className="text-[10px] text-slate-400">{intern.totalPoints} pts</div>
                    </div>
                    <div className="text-xs font-black text-teal-600">{intern.scores?.overallAccuracy || 0}%</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Interview Requests */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-violet-500" />
                Recent Requests
              </h3>
              <button
                onClick={() => onNavigateTab("interviews")}
                className="text-[10px] font-bold text-teal-600 hover:text-teal-700"
              >
                View All
              </button>
            </div>
            {myRequests.length === 0 ? (
              <div className="text-center py-4">
                <Calendar className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No interview requests yet</p>
                <button
                  onClick={() => onNavigateTab("leaderboard")}
                  className="mt-2 text-[10px] font-bold text-teal-600 hover:text-teal-700"
                >
                  Browse Interns →
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {myRequests.slice(0, 4).map((req) => (
                  <div key={req.id} className="flex items-center gap-3 p-2 rounded-xl bg-slate-50">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      req.status === "pending" ? "bg-amber-400" :
                      req.status === "approved" ? "bg-emerald-400" :
                      req.status === "scheduled" ? "bg-blue-400" :
                      req.status === "completed" ? "bg-slate-400" :
                      "bg-red-400"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-700 truncate">{req.internName || "Intern"}</div>
                      <div className="text-[10px] text-slate-400 capitalize">{req.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
