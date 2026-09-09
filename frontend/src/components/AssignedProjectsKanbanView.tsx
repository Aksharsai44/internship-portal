import React, { useState, useMemo } from "react";
import {
  Batch,
  ProjectAssignment,
  ProjectSubmission,
  Student,
  UserRole,
} from "../types";
import {
  Search,
  Plus,
  Calendar,
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FolderKanban,
  LayoutGrid,
  List as ListIcon,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  SlidersHorizontal,
  FileCheck,
  Edit2,
  Trash2,
  Eye,
  Github,
  Globe,
  Award,
  Users,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ProjectAssignmentFormModal } from "./ProjectAssignmentFormModal";
import { ProjectSubmissionModal } from "./ProjectSubmissionModal";
import { ProjectReviewModal } from "./ProjectReviewModal";
import { ProjectSubmissionsRosterModal } from "./ProjectSubmissionsRosterModal";
import {
  formatCompactSchedule,
  formatDateDisplay,
  formatTime12h,
  getProjectScheduleStatus,
} from "../utils/projectDateUtils";

interface AssignedProjectsKanbanViewProps {
  userRole: UserRole;
  currentStudent?: Student;
  students: Student[];
  batches: Batch[];
  selectedBatch?: Batch;
  projects: ProjectAssignment[];
  submissions: ProjectSubmission[];
  onCreateProject: (project: ProjectAssignment) => void;
  onUpdateProject: (project: ProjectAssignment) => void;
  onDeleteProject: (projectId: string) => void;
  onSubmitWork: (submission: ProjectSubmission) => void;
  onUpdateSubmission: (submission: ProjectSubmission) => void;
  onBulkUpdateSubmissions?: (submissions: ProjectSubmission[]) => void;
}

export const AssignedProjectsKanbanView: React.FC<AssignedProjectsKanbanViewProps> = ({
  userRole,
  currentStudent,
  students,
  batches,
  selectedBatch,
  projects,
  submissions,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
  onSubmitWork,
  onUpdateSubmission,
  onBulkUpdateSubmissions,
}) => {
  const [selectedTrack, setSelectedTrack] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectAssignment | null>(null);
  const [submittingProject, setSubmittingProject] = useState<ProjectAssignment | null>(null);
  const [selectedProjectForRoster, setSelectedProjectForRoster] = useState<ProjectAssignment | null>(null);
  const [reviewingItem, setReviewingItem] = useState<{
    project: ProjectAssignment;
    submission: ProjectSubmission;
  } | null>(null);

  // Extract unique technical categories for Track filter dropdown
  const availableTracks = useMemo(() => {
    const tracks = new Set<string>();
    projects.forEach((p) => {
      if (p.technicalCategory) tracks.add(p.technicalCategory);
    });
    return Array.from(tracks);
  }, [projects]);

  // Filter projects based on batch, track, and search
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Cohort check
      if (
        selectedBatch?.id &&
        selectedBatch.id !== "all" &&
        p.batchId &&
        p.batchId !== selectedBatch.id
      ) {
        return false;
      }

      // Track check
      if (selectedTrack !== "all" && p.technicalCategory !== selectedTrack) {
        return false;
      }

      // Search check
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(query);
        const matchesCat = p.technicalCategory.toLowerCase().includes(query);
        const matchesSummary = p.executiveSummary.toLowerCase().includes(query);
        if (!matchesTitle && !matchesCat && !matchesSummary) return false;
      }

      return true;
    });
  }, [projects, selectedBatch?.id, selectedTrack, searchQuery]);

  const getSubmissionForProject = (projectId: string) => {
    return (
      submissions.find(
        (s) =>
          s.projectId === projectId &&
          (userRole === "student" ? s.studentId === currentStudent?.id : true)
      ) || null
    );
  };

  const renderPriorityBadge = (priority: "Low" | "Medium" | "High") => {
    if (priority === "High") {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 border border-rose-200">
          HIGH
        </span>
      );
    }
    if (priority === "Medium") {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200">
          MEDIUM
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider text-slate-600 bg-slate-100 border border-slate-200">
        LOW
      </span>
    );
  };

  const renderStatusBadge = (submission: ProjectSubmission | null) => {
    if (!submission) return null;
    if (submission.status === "passed") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
          <span>✓ Passed</span>
        </span>
      );
    }
    if (submission.status === "needs_revision") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200">
          <span>Needs Revision</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200">
        <span>Pending</span>
      </span>
    );
  };

  // Render a Single Card (Exact Replica of Image 2)
  const renderCard = (project: ProjectAssignment) => {
    const submission = getSubmissionForProject(project.id);
    const isReviewedAndPassed =
      submission?.status === "passed" ||
      Boolean(submission?.mentorFeedback && submission?.status !== "needs_revision");
    const scheduleStatus = getProjectScheduleStatus(
      project.startDate,
      project.startTime,
      project.deadline,
      project.deadlineTime
    );

    return (
      <motion.div
        layout
        key={project.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group relative"
      >
        {/* Top Badges & Points Row */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              {renderPriorityBadge(project.priority)}
              <span className="px-2 py-0.5 rounded text-[10px] font-bold text-slate-600 bg-slate-100/80 border border-slate-200 truncate max-w-[130px]">
                {project.technicalCategory}
              </span>
            </div>
            <span className="text-amber-500 font-black text-xs shrink-0 tracking-tight">
              +{project.leaderboardPoints} pts
            </span>
          </div>

          {/* Title */}
          <h4
            onClick={() => {
              if (userRole === "admin") {
                setSelectedProjectForRoster(project);
              } else {
                setSubmittingProject(project);
              }
            }}
            className="text-sm font-black text-slate-900 tracking-tight hover:text-indigo-600 transition cursor-pointer line-clamp-2 leading-snug mb-2"
          >
            {project.title}
          </h4>

          {/* Brief Summary Snippet */}
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal mb-3">
            {project.executiveSummary || project.detailedInstructions}
          </p>

          {/* ADMIN SUBMISSION STATS STRIP (Requested: Submitted, Not Submitted, In-time) */}
          {userRole === "admin" && (() => {
            const projSubs = submissions.filter((s) => s.projectId === project.id);
            const totalAssigned = Math.max(students.length || 6, projSubs.length);
            const subCount = projSubs.length;
            const notSubCount = Math.max(0, totalAssigned - subCount);
            const onTimeSubs = projSubs.filter((s) => {
              try {
                const deadlineStr = project.deadlineTime
                  ? `${project.deadline}T${project.deadlineTime}`
                  : `${project.deadline}T23:59:59`;
                return new Date(s.submittedAt).getTime() <= new Date(deadlineStr).getTime();
              } catch {
                return true;
              }
            }).length;
            const pendingRev = projSubs.filter((s) => s.status === "pending").length;

            return (
              <div className="mb-3 p-2.5 rounded-xl bg-slate-50/90 border border-slate-200">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                  <span className="flex items-center gap-1 text-indigo-700">
                    <Users className="w-3 h-3" />
                    <span>Deliverables</span>
                  </span>
                  <span className="text-slate-800 font-mono text-[10px] font-black">
                    {subCount} / {totalAssigned} Submitted
                  </span>
                </div>

                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-1.5">
                  <div
                    className="bg-indigo-600 h-full rounded-full"
                    style={{ width: `${Math.min(100, Math.round((subCount / totalAssigned) * 100))}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-1 text-[9.5px] text-center font-bold">
                  <span className="py-0.5 px-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    {onTimeSubs} In-Time
                  </span>
                  <span className="py-0.5 px-1 rounded bg-rose-50 text-rose-700 border border-rose-200/60">
                    {notSubCount} Missing
                  </span>
                  <span className="py-0.5 px-1 rounded bg-amber-50 text-amber-700 border border-amber-200/60">
                    {pendingRev} To Grade
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedProjectForRoster(project)}
                  className="w-full mt-2 py-1 px-2.5 rounded-lg text-[11px] font-black text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Check All & Review ({subCount})</span>
                  <ChevronRight className="w-3 h-3 text-indigo-400" />
                </button>
              </div>
            );
          })()}

          {/* INTERN FEEDBACK CALLOUT (If Mentor has reviewed) */}
          {userRole === "student" && submission && submission.mentorFeedback && (
            <div className="mb-3 p-2 rounded-xl bg-amber-50/70 border border-amber-200 text-[11px]">
              <div className="flex items-center gap-1 font-bold text-amber-900 mb-0.5">
                <Award className="w-3 h-3 text-amber-600" />
                <span>Mentor Review:</span>
              </div>
              <p className="text-slate-700 italic line-clamp-2">
                "{submission.mentorFeedback}"
              </p>
            </div>
          )}
        </div>

        {/* Card Footer: Schedule & Status / Action */}
        <div>
          {/* Schedule Strip (Start Date/Time & Deadline Date/Time) */}
          <div className="pt-3 border-t border-slate-100 mb-3 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-medium">
              <div className="flex items-center gap-1.5 text-slate-500 truncate mr-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="truncate">Start: <strong className="text-slate-700">{formatCompactSchedule(project.startDate || "2026-09-08", project.startTime || "09:00")}</strong></span>
              </div>
              <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold border shrink-0 ${scheduleStatus.badgeClass}`}>
                {scheduleStatus.status === "due_soon" ? "Due Soon" : scheduleStatus.status === "overdue" ? "Past Due" : "Active"}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] font-medium">
              <div className="flex items-center gap-1.5 text-slate-500 truncate">
                <Clock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span className="truncate">Due: <strong className="text-slate-700">{formatCompactSchedule(project.deadline, project.deadlineTime || "23:59")}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            {userRole === "admin" ? (
              <div className="flex items-center justify-between w-full gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditingProject(project)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                    title="Edit Project Assignment"
                  >
                    <Edit2 className="w-3 h-3 text-slate-500" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Delete project "${project.title}"?`)) {
                        onDeleteProject(project.id);
                      }
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition cursor-pointer"
                    title="Delete Project Assignment"
                  >
                    <Trash2 className="w-3 h-3 text-rose-500" />
                    <span>Delete</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedProjectForRoster(project)}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition cursor-pointer shadow-2xs"
                  title="Check Deliverables & Review"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Submissions ({submissions.filter((s) => s.projectId === project.id).length})</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full gap-2">
                {submission ? (
                  <div
                    onClick={() => setSubmittingProject(project)}
                    className="cursor-pointer flex items-center gap-1.5"
                  >
                    {renderStatusBadge(submission)}
                    {submission.gradePoints !== undefined && (
                      <span className="text-[11px] font-black text-slate-800">
                        {submission.gradePoints} / {project.leaderboardPoints} pts
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-[11px] font-medium text-slate-400">Not Submitted</span>
                )}

                {/* Intern Action Button: Once reviewed and passed, show View Submission instead of Update Work */}
                {!submission ? (
                  <button
                    type="button"
                    onClick={() => setSubmittingProject(project)}
                    className="px-3.5 py-1 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center gap-1 cursor-pointer transition shadow-2xs"
                  >
                    <span>Submit Work</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : isReviewedAndPassed ? (
                  <button
                    type="button"
                    onClick={() => setSubmittingProject(project)}
                    className="px-3 py-1 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center gap-1.5 cursor-pointer transition shadow-2xs"
                    title="View Approved Submission & Mentor Review"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    <span>View Submission</span>
                  </button>
                ) : submission.status === "needs_revision" ? (
                  <button
                    type="button"
                    onClick={() => setSubmittingProject(project)}
                    className="px-3 py-1 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 flex items-center gap-1 cursor-pointer transition shadow-2xs"
                    title="Mentor requested revisions - resubmit deliverable"
                  >
                    <span>Resubmit Revision</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSubmittingProject(project)}
                    className="px-3 py-1 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-700 bg-slate-100 hover:bg-indigo-50 border border-slate-200 flex items-center gap-1 cursor-pointer transition"
                  >
                    <span>View / Edit</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* TOP HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Assigned Projects
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Overview of all added project assignments, intern deliverables, and mentor reviews.
          </p>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Track Filter Dropdown */}
          <div className="relative">
            <select
              value={selectedTrack}
              onChange={(e) => setSelectedTrack(e.target.value)}
              className="pl-3.5 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer shadow-2xs"
            >
              <option value="all">All Tracks ({projects.length})</option>
              {availableTracks.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400 text-xs">
              ▼
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assignments..."
              className="pl-8 pr-3.5 py-2 w-48 sm:w-56 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs transition"
            />
          </div>

          {/* View Toggle (Cards Grid / Table List) */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                viewMode === "grid"
                  ? "bg-white text-indigo-600 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Cards Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                viewMode === "list"
                  ? "bg-white text-indigo-600 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Table View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Admin Create Project Button */}
          {userRole === "admin" && (
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-sm cursor-pointer ml-1"
            >
              <Plus className="w-4 h-4" />
              <span>New Project Assignment</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Stats Capsules */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <FolderKanban className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Projects</div>
            <div className="text-base font-black text-slate-900 leading-tight">{projects.length}</div>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Deliverables Submitted</div>
            <div className="text-base font-black text-slate-900 leading-tight">{submissions.length}</div>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Awaiting Review</div>
            <div className="text-base font-black text-amber-600 leading-tight">
              {submissions.filter((s) => s.status === "pending").length}
            </div>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Graded & Passed</div>
            <div className="text-base font-black text-emerald-600 leading-tight">
              {submissions.filter((s) => s.status === "passed").length}
            </div>
          </div>
        </div>
      </div>

      {/* VIEW 1: PROJECTS GRID VIEW */}
      {viewMode === "grid" ? (
        filteredProjects.length === 0 ? (
          <div className="py-16 text-center rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 bg-white space-y-2">
            <LayoutGrid className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="text-sm font-bold text-slate-700">No project assignments found</div>
            <p className="text-xs text-slate-400">
              {searchQuery || selectedTrack !== "all"
                ? "Try adjusting your search query or track filter."
                : userRole === "admin"
                ? "Click 'New Project Assignment' above to create and assign your first cohort project."
                : "No projects have been assigned to your track yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map(renderCard)}
          </div>
        )
      ) : (
        /* VIEW 2: LIST / TABLE VIEW MODE */
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-600">
                <th className="py-3 px-5">Assignment Name</th>
                <th className="py-3 px-4">Track / Category</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Points</th>
                <th className="py-3 px-3">Timeline & Schedule</th>
                <th className="py-3 px-3">Deliverables & Reviews</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredProjects.map((project) => {
                const sub = getSubmissionForProject(project.id);
                return (
                  <tr key={project.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-5 font-bold text-slate-900">
                      <div>{project.title}</div>
                      <div className="text-[11px] text-slate-400 font-normal line-clamp-1">
                        {project.executiveSummary}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px]">
                        {project.technicalCategory}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">{renderPriorityBadge(project.priority)}</td>
                    <td className="py-3.5 px-3 font-black text-amber-500">
                      +{project.leaderboardPoints}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="text-xs font-bold text-slate-800 flex items-center gap-1 whitespace-nowrap">
                        <Clock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>Due: {formatCompactSchedule(project.deadline, project.deadlineTime || "23:59")}</span>
                      </div>
                      <div className="text-[10.5px] text-slate-400 font-medium mt-0.5 flex items-center gap-1 whitespace-nowrap">
                        <Calendar className="w-3 h-3 text-indigo-400 shrink-0" />
                        <span>Start: {formatCompactSchedule(project.startDate || "2026-09-08", project.startTime || "09:00")}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      {userRole === "admin" ? (() => {
                        const projSubs = submissions.filter((s) => s.projectId === project.id);
                        const totalAssigned = Math.max(students.length || 6, projSubs.length);
                        const pendingRev = projSubs.filter((s) => s.status === "pending").length;
                        return (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-black text-slate-800 text-xs">
                              {projSubs.length} / {totalAssigned} Submitted
                            </span>
                            {pendingRev > 0 ? (
                              <span className="text-[10px] font-bold text-amber-600">
                                • {pendingRev} Awaiting Review
                              </span>
                            ) : projSubs.length > 0 ? (
                              <span className="text-[10px] font-bold text-emerald-600">
                                ✓ All Graded
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium text-slate-400">
                                0 Submissions
                              </span>
                            )}
                          </div>
                        );
                      })() : (
                        sub ? renderStatusBadge(sub) : <span className="text-slate-400 font-medium text-xs">Not Submitted</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      {userRole === "admin" ? (
                        <div className="inline-flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedProjectForRoster(project)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition cursor-pointer"
                            title="Check Deliverables & Review"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>
                              Submissions (
                              {submissions.filter((s) => s.projectId === project.id).length}
                              )
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingProject(project)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                            title="Edit Assignment"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Delete project "${project.title}"?`)) {
                                onDeleteProject(project.id);
                              }
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition cursor-pointer"
                            title="Delete Assignment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-end gap-2">
                          {!sub ? (
                            <button
                              type="button"
                              onClick={() => setSubmittingProject(project)}
                              className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-2xs cursor-pointer"
                            >
                              Submit Work
                            </button>
                          ) : sub.status === "passed" || (sub.mentorFeedback && sub.status !== "needs_revision") ? (
                            <button
                              type="button"
                              onClick={() => setSubmittingProject(project)}
                              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer flex items-center gap-1.5"
                              title="View Approved Submission & Mentor Review"
                            >
                              <Eye className="w-3.5 h-3.5 text-emerald-600" />
                              <span>View Submission</span>
                            </button>
                          ) : sub.status === "needs_revision" ? (
                            <button
                              type="button"
                              onClick={() => setSubmittingProject(project)}
                              className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition shadow-2xs cursor-pointer"
                              title="Mentor requested revisions - resubmit deliverable"
                            >
                              Resubmit Revision
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSubmittingProject(project)}
                              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition cursor-pointer"
                            >
                              View / Edit
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL 1: Create Project (Admin) */}
      {isCreateModalOpen && (
        <ProjectAssignmentFormModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={onCreateProject}
          batches={batches}
          selectedBatch={selectedBatch}
        />
      )}

      {/* MODAL 2: Edit Project (Admin) */}
      {editingProject && (
        <ProjectAssignmentFormModal
          isOpen={!!editingProject}
          onClose={() => setEditingProject(null)}
          onSubmit={(updated) => {
            onUpdateProject(updated);
            setEditingProject(null);
          }}
          batches={batches}
          selectedBatch={selectedBatch}
          initialData={editingProject}
        />
      )}

      {/* MODAL 3: Intern Submission Modal */}
      {submittingProject && (
        <ProjectSubmissionModal
          isOpen={!!submittingProject}
          onClose={() => setSubmittingProject(null)}
          project={submittingProject}
          currentStudent={currentStudent}
          existingSubmission={getSubmissionForProject(submittingProject.id)}
          onSubmit={onSubmitWork}
        />
      )}

      {/* MODAL 4: Admin Benchmark Review Modal */}
      {reviewingItem && (
        <ProjectReviewModal
          isOpen={!!reviewingItem}
          onClose={() => setReviewingItem(null)}
          project={reviewingItem.project}
          submission={reviewingItem.submission}
          onSaveReview={onUpdateSubmission}
        />
      )}

      {/* MODAL 5: Admin Particular Project Submissions Roster & Analytics */}
      {selectedProjectForRoster && (
        <ProjectSubmissionsRosterModal
          isOpen={!!selectedProjectForRoster}
          onClose={() => setSelectedProjectForRoster(null)}
          project={selectedProjectForRoster}
          submissions={submissions}
          students={students}
          onSaveReview={onUpdateSubmission}
          onBulkUpdateSubmissions={onBulkUpdateSubmissions}
        />
      )}
    </div>
  );
};
