import React from "react";
import { Batch, Student } from "../types";
import {
  Users,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  Code2,
  CheckCircle2,
  GraduationCap,
  Award,
  ChevronRight,
  TrendingUp,
  Cpu,
} from "lucide-react";
import { motion } from "motion/react";

interface ClientCohortsViewProps {
  batches: Batch[];
  students: Student[];
  assignedBatches: string[];
  onSelectCohortForLeaderboard: (batchId: string) => void;
  onSelectCohortForAnalytics: (batchId: string) => void;
}

export function ClientCohortsView({
  batches,
  students,
  assignedBatches,
  onSelectCohortForLeaderboard,
  onSelectCohortForAnalytics,
}: ClientCohortsViewProps) {
  const visibleBatches = batches.filter(
    (b) => assignedBatches.includes(b.id) || assignedBatches.includes("all")
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-xs font-black uppercase tracking-wider mb-2">
            <Layers className="w-3.5 h-3.5 text-violet-600" />
            <span>Assigned Technical Programs</span>
            <span className="px-2 py-0.5 rounded-full bg-violet-600 text-white text-[10px] font-bold">
              {visibleBatches.length} Active Tracks
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            Cohorts & Batches
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Explore 3-month and 6-month talent tracks assigned to your organization.
          </p>
        </div>
      </div>

      {/* Cohort Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {visibleBatches.map((batch, idx) => {
          const batchStudents = students.filter((s) => s.batchId === batch.id);
          const avgScore =
            batchStudents.length > 0
              ? (
                  batchStudents.reduce(
                    (acc, s) => acc + (s.scores?.overallAccuracy || 0),
                    0
                  ) / batchStudents.length
                ).toFixed(1)
              : "0";

          const topPerformer = [...batchStudents].sort(
            (a, b) => (b.totalPoints || 0) - (a.totalPoints || 0)
          )[0];

          return (
            <motion.div
              key={batch.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-xl hover:border-teal-300 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Duration & Status Pill */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="px-3 py-1 rounded-xl text-xs font-black bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-700 border border-teal-200 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-teal-600" />
                    {batch.durationLabel || `${batch.durationMonths || 3} Months`}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Active Cohort
                  </span>
                </div>

                {/* Cohort Name */}
                <h3 className="text-lg font-black text-slate-900 group-hover:text-teal-600 transition-colors leading-snug mb-2">
                  {batch.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium line-clamp-2 mb-4">
                  {batch.description || "Hands-on engineering cohort delivering production-level architectures."}
                </p>

                {/* Institution & Mentor */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 mb-4 text-xs">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="font-semibold text-slate-400">Campus:</span>
                    <span className="font-bold text-slate-700 truncate max-w-[180px]">{batch.college || "MIND2I Tech Lab"}</span>
                  </div>
                  {batch.mentor && (
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="font-semibold text-slate-400">Lead Mentor:</span>
                      <span className="font-bold text-slate-700 truncate max-w-[180px]">
                        {batch.mentor.includes("Sharma") || batch.mentor.includes("Nwosu")
                          ? "Vijaya Kumar Mekala"
                          : batch.mentor}
                      </span>
                    </div>
                  )}
                </div>

                {/* Tech Stack Pills */}
                {batch.technologies && batch.technologies.length > 0 && (
                  <div className="mb-4">
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                      Core Technology Stack
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {batch.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 rounded-lg text-[10px] font-extrabold transition-colors"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-3 py-3 border-t border-slate-100 my-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-black text-xs">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-800">{batchStudents.length} Interns</div>
                      <div className="text-[10px] text-slate-400 font-bold">Enrolled Talent</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xs">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-800">{avgScore}%</div>
                      <div className="text-[10px] text-slate-400 font-bold">Avg Accuracy</div>
                    </div>
                  </div>
                </div>

                {/* Top Performer Snippet */}
                {topPerformer && (
                  <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/60 flex items-center justify-between text-xs mt-1">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-500" />
                      <span className="text-[11px] text-amber-900 font-bold">Top: {topPerformer.name}</span>
                    </div>
                    <span className="font-mono text-[10px] font-black text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md">
                      {topPerformer.totalPoints} pts
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-2 mt-4">
                <button
                  onClick={() => onSelectCohortForLeaderboard(batch.id)}
                  className="flex-1 py-2.5 px-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-xl text-xs font-black shadow-md shadow-teal-500/15 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Leaderboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onSelectCohortForAnalytics(batch.id)}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  title="View Cohort Dossier Analytics"
                >
                  <Cpu className="w-3.5 h-3.5 text-slate-500" />
                  <span>Dossier</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
