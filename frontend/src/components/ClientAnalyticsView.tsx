import React, { useState, useMemo } from "react";
import { Student, Batch, InterviewRequest, ClientUser } from "../types";
import {
  BarChart3,
  FileText,
  Printer,
  Download,
  Award,
  TrendingUp,
  Cpu,
  Layers,
  Users,
  CheckCircle2,
  Code2,
  Sparkles,
  Search,
  ChevronDown,
} from "lucide-react";
import { motion } from "motion/react";

interface ClientAnalyticsViewProps {
  clientUser: ClientUser;
  batches: Batch[];
  students: Student[];
  interviewRequests: InterviewRequest[];
  onViewIntern: (intern: Student) => void;
  onRequestInterview: (intern: Student) => void;
}

export function ClientAnalyticsView({
  clientUser,
  batches,
  students,
  interviewRequests,
  onViewIntern,
  onRequestInterview,
}: ClientAnalyticsViewProps) {
  const [selectedBatchId, setSelectedBatchId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const assignedBatches = useMemo(
    () =>
      batches.filter(
        (b) =>
          (clientUser.assignedBatches || []).includes(b.id) ||
          (clientUser.assignedBatches || []).includes("all")
      ),
    [batches, clientUser.assignedBatches]
  );

  const cohortStudents = useMemo(() => {
    const assignedIds = new Set(assignedBatches.map((b) => b.id));
    return students.filter((s) => {
      const inAssigned =
        assignedIds.has(s.batchId) || (clientUser.assignedBatches || []).includes("all");
      if (!inAssigned) return false;
      if (selectedBatchId !== "all" && s.batchId !== selectedBatchId) return false;
      return true;
    });
  }, [students, assignedBatches, selectedBatchId, clientUser.assignedBatches]);

  // Skill frequency across cohort
  const skillFrequency = useMemo(() => {
    const counts: Record<string, number> = {};
    cohortStudents.forEach((s) => {
      (s.skills || []).forEach((sk) => {
        counts[sk] = (counts[sk] || 0) + 1;
      });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [cohortStudents]);

  // Performance metrics
  const avgAccuracy =
    cohortStudents.length > 0
      ? (
          cohortStudents.reduce(
            (acc, s) => acc + (s.scores?.overallAccuracy || 0),
            0
          ) / cohortStudents.length
        ).toFixed(1)
      : "0";

  const avgCoding =
    cohortStudents.length > 0
      ? (
          cohortStudents.reduce(
            (acc, s) => acc + (s.scores?.codingScore || 0),
            0
          ) / cohortStudents.length
        ).toFixed(1)
      : "0";

  const topTierCount = cohortStudents.filter(
    (s) => (s.scores?.overallAccuracy || 0) >= 90
  ).length;

  const filteredDossier = cohortStudents.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.college || "").toLowerCase().includes(q) ||
      (s.skills || []).some((sk) => sk.toLowerCase().includes(q))
    );
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black uppercase tracking-wider mb-2">
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>Talent Dossier & Telemetry</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
              Audited
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            Analytics & Reports
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Deep-dive competency distribution and audited performance dossier for hiring decisions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 shadow-2xs"
          >
            <option value="all">All Cohorts ({assignedBatches.length})</option>
            {assignedBatches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Print Dossier</span>
          </button>
        </div>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">Candidate Pool</span>
            <Users className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{cohortStudents.length}</div>
          <div className="text-xs text-teal-600 font-bold">Verified Technical Interns</div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">Avg Accuracy</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{avgAccuracy}%</div>
          <div className="text-xs text-emerald-600 font-bold">Across all technical exams</div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">Avg Coding Score</span>
            <Code2 className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{avgCoding}%</div>
          <div className="text-xs text-indigo-600 font-bold">Algorithm & IDE test pass rate</div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">Top Tier Talent</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{topTierCount}</div>
          <div className="text-xs text-amber-600 font-bold">&gt; 90% Overall Benchmark</div>
        </div>
      </div>

      {/* Skill Competency Distribution */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-black text-slate-900">Skill Competency Distribution</h3>
            <p className="text-xs text-slate-500">Number of interns certified in each core technology</p>
          </div>
          <Cpu className="w-5 h-5 text-teal-500" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {skillFrequency.slice(0, 12).map(([skill, count]) => {
            const percentage = Math.round((count / (cohortStudents.length || 1)) * 100);
            return (
              <div key={skill} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                <div className="text-xs font-black text-slate-800 truncate">{skill}</div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{count} interns</span>
                  <span className="font-bold text-teal-600">{percentage}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Audited Intern Dossier Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-slate-900">Audited Candidate Dossier</h3>
            <p className="text-xs text-slate-500">Comprehensive score report with live interview status</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search dossier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-6">Candidate</th>
                <th className="py-3.5 px-4">Cohort</th>
                <th className="py-3.5 px-3 text-center">Coding</th>
                <th className="py-3.5 px-3 text-center">Quiz</th>
                <th className="py-3.5 px-3 text-center">Live Q&A</th>
                <th className="py-3.5 px-3 text-center">Accuracy</th>
                <th className="py-3.5 px-4 text-center">Total Points</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredDossier.map((intern) => {
                const req = interviewRequests.find(
                  (r) => r.internId === intern.id && r.clientId === clientUser.id
                );

                return (
                  <tr key={intern.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            intern.avatar ||
                            `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                              intern.name
                            )}`
                          }
                          alt={intern.name}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-black text-slate-900">{intern.name}</div>
                          <div className="text-[10px] text-slate-400">{intern.college}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {intern.batchName}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-800">
                      {intern.scores?.codingScore || 0}%
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-800">
                      {intern.scores?.quizScore || 0}%
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-800">
                      {intern.scores?.liveQAScore || 0}%
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-black border border-emerald-200">
                        {intern.scores?.overallAccuracy || 0}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-black text-slate-900">
                      {intern.totalPoints}
                    </td>
                    <td className="py-3 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onViewIntern(intern)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition cursor-pointer"
                        >
                          Profile
                        </button>
                        {req ? (
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-teal-50 text-teal-700 border border-teal-200">
                            {req.status}
                          </span>
                        ) : (
                          <button
                            onClick={() => onRequestInterview(intern)}
                            className="px-3 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg text-[11px] font-bold hover:shadow-sm transition cursor-pointer"
                          >
                            Interview
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
