import React, { useState, useMemo } from "react";
import { Batch, Student, ClientUser, InterviewRequest } from "../types";
import {
  Trophy,
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  Star,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Code2,
  Briefcase,
  Mail,
  TrendingUp,
  Award,
  Users,
  Eye,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ClientLeaderboardViewProps {
  clientUser: ClientUser;
  batches: Batch[];
  students: Student[];
  interviewRequests: InterviewRequest[];
  shortlistedIds?: string[];
  onToggleShortlist?: (internId: string) => void;
  onRequestInterview: (intern: Student) => void;
  onViewIntern: (intern: Student) => void;
}

export function ClientLeaderboardView({
  clientUser,
  batches,
  students,
  interviewRequests,
  shortlistedIds = [],
  onToggleShortlist,
  onRequestInterview,
  onViewIntern,
}: ClientLeaderboardViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"points" | "accuracy" | "name">("points");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [skillFilter, setSkillFilter] = useState<string>("");
  const [expandedIntern, setExpandedIntern] = useState<string | null>(null);

  const assignedBatches = useMemo(
    () =>
      batches.filter(
        (b) =>
          (clientUser.assignedBatches || []).includes(b.id) ||
          (clientUser.assignedBatches || []).includes("all")
      ),
    [batches, clientUser.assignedBatches]
  );

  const allSkills = useMemo(() => {
    const skills = new Set<string>();
    students.forEach((s) => {
      if (s.skills) s.skills.forEach((sk) => skills.add(sk));
    });
    return Array.from(skills).sort();
  }, [students]);

  const filteredInterns = useMemo(() => {
    let list = students.filter((s) =>
      assignedBatches.some((b) => b.id === s.batchId)
    );

    if (selectedBatchId !== "all") {
      list = list.filter((s) => s.batchId === selectedBatchId);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          (s.skills && s.skills.some((sk) => sk.toLowerCase().includes(q)))
      );
    }

    if (skillFilter) {
      list = list.filter(
        (s) => s.skills && s.skills.some((sk) => sk.toLowerCase() === skillFilter.toLowerCase())
      );
    }

    list.sort((a, b) => {
      let va: number | string, vb: number | string;
      if (sortBy === "points") { va = a.totalPoints; vb = b.totalPoints; }
      else if (sortBy === "accuracy") { va = a.scores?.overallAccuracy || 0; vb = b.scores?.overallAccuracy || 0; }
      else { va = a.name.toLowerCase(); vb = b.name.toLowerCase(); }

      if (typeof va === "string") {
        return sortDir === "asc" ? va.localeCompare(vb as string) : (vb as string).localeCompare(va);
      }
      return sortDir === "asc" ? (va as number) - (vb as number) : (vb as number) - (va as number);
    });

    return list;
  }, [students, assignedBatches, selectedBatchId, searchQuery, skillFilter, sortBy, sortDir]);

  const hasRequestedInterview = (internId: string) =>
    interviewRequests.some(
      (r) => r.clientId === clientUser.id && r.internId === internId && !["rejected", "completed"].includes(r.status)
    );

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            Intern Leaderboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {filteredInterns.length} intern{filteredInterns.length !== 1 ? "s" : ""} across {assignedBatches.length} cohort{assignedBatches.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400"
            />
          </div>

          {/* Batch Filter */}
          <select
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
          >
            <option value="all">All Cohorts</option>
            {assignedBatches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          {/* Skill Filter */}
          {allSkills.length > 0 && (
            <select
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            >
              <option value="">All Skills</option>
              {allSkills.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}

          {/* Sort */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 focus:outline-none"
            >
              <option value="points">Points</option>
              <option value="accuracy">Accuracy</option>
              <option value="name">Name</option>
            </select>
            <button
              onClick={() => setSortDir((d) => d === "asc" ? "desc" : "asc")}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition"
            >
              <ArrowUpDown className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Leaderboard List */}
      {filteredInterns.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
          <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-black text-slate-500">No interns found</h3>
          <p className="text-sm text-slate-400 mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInterns.map((intern, index) => {
            const rank = index + 1;
            const isExpanded = expandedIntern === intern.id;
            const alreadyRequested = hasRequestedInterview(intern.id);
            const batchObj = batches.find((b) => b.id === intern.batchId);

            return (
              <motion.div
                key={intern.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`bg-white rounded-2xl border transition-all duration-200 ${
                  isExpanded ? "border-teal-200 shadow-lg shadow-teal-500/5" : "border-slate-100 hover:border-teal-100 hover:shadow-md"
                }`}
              >
                {/* Main Row */}
                <div
                  className="p-4 sm:p-5 flex items-center gap-4 cursor-pointer"
                  onClick={() => setExpandedIntern(isExpanded ? null : intern.id)}
                >
                  {/* Rank */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 ${
                    rank === 1 ? "bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-md shadow-amber-500/20" :
                    rank === 2 ? "bg-gradient-to-br from-slate-300 to-slate-400 text-white" :
                    rank === 3 ? "bg-gradient-to-br from-orange-400 to-amber-500 text-white" :
                    "bg-slate-100 text-slate-500"
                  }`}>
                    {rank <= 3 ? getRankBadge(rank) : rank}
                  </div>

                  {/* Avatar */}
                  <img
                    src={intern.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(intern.name)}`}
                    alt={intern.name}
                    className="w-11 h-11 rounded-xl object-cover border-2 border-slate-100 flex-shrink-0"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-black text-slate-800 text-sm">{intern.name}</h3>
                      {batchObj && (
                        <span className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded-lg text-[10px] font-bold">{batchObj.name}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {intern.skills && intern.skills.slice(0, 3).map((sk) => (
                        <span key={sk} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold">{sk}</span>
                      ))}
                      {intern.skills && intern.skills.length > 3 && (
                        <span className="text-[10px] text-slate-400 font-bold">+{intern.skills.length - 3}</span>
                      )}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-lg font-black text-slate-800">{intern.totalPoints}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Points</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-teal-600">{intern.scores?.overallAccuracy || 0}%</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Accuracy</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {onToggleShortlist && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleShortlist(intern.id);
                        }}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${
                          shortlistedIds.includes(intern.id)
                            ? "bg-amber-50 border-amber-300 text-amber-500 shadow-xs"
                            : "bg-slate-50 border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-200"
                        }`}
                        title={shortlistedIds.includes(intern.id) ? "Remove from Shortlist" : "Add to Shortlist Pipeline"}
                      >
                        {shortlistedIds.includes(intern.id) ? (
                          <BookmarkCheck className="w-4 h-4 fill-amber-500" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                    )}

                    {alreadyRequested ? (
                      <span className="px-3 py-2 bg-slate-100 text-slate-500 rounded-xl text-xs font-bold">
                        Requested
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRequestInterview(intern);
                        }}
                        className="px-3 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl text-xs font-black hover:shadow-md hover:shadow-teal-500/20 transition-all cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5 inline mr-1" />
                        Interview
                      </button>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Detail */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-2 border-t border-slate-100">
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Bio</div>
                            <p className="text-xs text-slate-600">{intern.bio || "No bio provided"}</p>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Score Breakdown</div>
                            <div className="space-y-1">
                              {[
                                { label: "Quiz", val: intern.scores?.quizScore || 0 },
                                { label: "Coding", val: intern.scores?.codingScore || 0 },
                                { label: "Assignment", val: intern.scores?.assignmentScore || 0 },
                              ].map((s) => (
                                <div key={s.label} className="flex items-center justify-between">
                                  <span className="text-[10px] text-slate-500">{s.label}</span>
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                      <div className="h-full bg-teal-500 rounded-full" style={{ width: `${Math.min(s.val, 100)}%` }} />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-600">{s.val}%</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Skills</div>
                            <div className="flex flex-wrap gap-1">
                              {(intern.skills || []).map((sk) => (
                                <span key={sk} className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded-lg text-[10px] font-bold">{sk}</span>
                              ))}
                              {(!intern.skills || intern.skills.length === 0) && (
                                <span className="text-[10px] text-slate-400">No skills listed</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Links</div>
                            <div className="space-y-1">
                              {intern.githubUrl && (
                                <a href={intern.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-bold">
                                  <Code2 className="w-3 h-3" /> GitHub <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                              {intern.linkedinUrl && (
                                <a href={intern.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-bold">
                                  <Briefcase className="w-3 h-3" /> LinkedIn <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                              {!intern.githubUrl && !intern.linkedinUrl && (
                                <span className="text-[10px] text-slate-400">No links available</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
