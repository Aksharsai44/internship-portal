import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Batch, ProjectAssignment, ProjectResource } from "../types";
import {
  X,
  FolderPlus,
  Calendar,
  Layers,
  Sparkles,
  Link as LinkIcon,
  Plus,
  Trash2,
  Lock,
  FileText,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  ArrowLeft,
  Award,
  CheckCircle2,
  Clock,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ProjectAssignmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (assignment: ProjectAssignment) => void;
  batches: Batch[];
  selectedBatch?: Batch;
  initialData?: ProjectAssignment | null;
}

export const ProjectAssignmentFormModal: React.FC<ProjectAssignmentFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  batches,
  selectedBatch,
  initialData,
}) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [cohortId, setCohortId] = useState(
    initialData?.batchId || selectedBatch?.id || (batches[0]?.id ?? "all")
  );
  const [technicalCategory, setTechnicalCategory] = useState(
    initialData?.technicalCategory || "Frontend (React, Tailwind, State)"
  );

  // Start Date & Time
  const [startDate, setStartDate] = useState(
    initialData?.startDate || new Date().toISOString().split("T")[0]
  );
  const [startTime, setStartTime] = useState(
    initialData?.startTime || "09:00"
  );

  // Deadline Date & Time
  const [deadline, setDeadline] = useState(
    initialData?.deadline || "2026-09-18"
  );
  const [deadlineTime, setDeadlineTime] = useState(
    initialData?.deadlineTime || "23:59"
  );

  const [priority, setPriority] = useState<"Low" | "Medium" | "High">(
    initialData?.priority || "High"
  );
  const [leaderboardPoints, setLeaderboardPoints] = useState<number>(
    initialData?.leaderboardPoints || 120
  );
  const [executiveSummary, setExecutiveSummary] = useState(
    initialData?.executiveSummary || ""
  );
  const [detailedInstructions, setDetailedInstructions] = useState(
    initialData?.detailedInstructions ||
      `1. Review architectural guidelines in attached documents.
2. Write modular TypeScript components with comprehensive unit test coverage.
3. Verify responsive layout on mobile, tablet, and ultra-wide viewports.
4. Submit Git repository branch and live demo preview URL.`
  );

  // Attached Documents & Resources
  const [resources, setResources] = useState<ProjectResource[]>(
    initialData?.resources || [
      {
        id: "res_default_1",
        title: "Dashboard UX Best Practices",
        url: "https://uxdesign.cc/dashboard-design-best-practices",
        type: "link",
      },
      {
        id: "res_default_2",
        title: "Motion Animation Guidelines",
        url: "https://m3.material.io/styles/motion/overview",
        type: "link",
      },
    ]
  );
  const [newResourceTitle, setNewResourceTitle] = useState("");
  const [newResourceUrl, setNewResourceUrl] = useState("");

  // Internal Mentor / Admin Scenario & Benchmark Observation (Strictly Hidden from Interns)
  const [mentorObservationBenchmark, setMentorObservationBenchmark] = useState(
    initialData?.mentorObservationBenchmark ||
      `• Our Scenario & Observation Benchmark:
1. Verify candidate handled timer teardown/WebSocket disconnects in useEffect cleanup without memory leaks.
2. Check if Recharts ResponsiveContainer is memoized to avoid redundant redraws on tick updates.
3. Confirm clean TypeScript typing for data points rather than defaulting to 'any'.
4. Verify edge cases: zero data state, single data point, and max value overflow scaling.`
  );

  const [errors, setErrors] = useState<{ title?: string; deadline?: string }>({});

  if (!isOpen) return null;

  const handleAddResource = () => {
    if (!newResourceTitle.trim() || !newResourceUrl.trim()) return;
    const newRes: ProjectResource = {
      id: `res_${Date.now()}`,
      title: newResourceTitle.trim(),
      url: newResourceUrl.trim(),
      type: newResourceUrl.endsWith(".pdf") ? "pdf" : "link",
    };
    setResources([...resources, newRes]);
    setNewResourceTitle("");
    setNewResourceUrl("");
  };

  const handleRemoveResource = (id: string) => {
    setResources(resources.filter((r) => r.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { title?: string; deadline?: string } = {};
    if (!title.trim()) newErrors.title = "Project Title is required";
    if (!deadline) newErrors.deadline = "Submission Deadline is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const targetBatch = batches.find((b) => b.id === cohortId);
    const assignment: ProjectAssignment = {
      id: initialData?.id || `proj_${Date.now()}`,
      batchId: cohortId,
      batchName: targetBatch?.name || (cohortId === "all" ? "All Cohorts" : "gen ai (1 Interns)"),
      title: title.trim(),
      technicalCategory: technicalCategory.trim() || "Full-Stack Engineering",
      startDate,
      startTime,
      deadline,
      deadlineTime,
      priority,
      leaderboardPoints: Number(leaderboardPoints) || 100,
      executiveSummary: executiveSummary.trim(),
      detailedInstructions: detailedInstructions.trim(),
      resources,
      mentorObservationBenchmark: mentorObservationBenchmark.trim(),
      createdAt: initialData?.createdAt || new Date().toISOString(),
      status: initialData?.status || "todo",
    };

    onSubmit(assignment);
    onClose();
  };

  const categoryPresets = [
    "Frontend (React, Tailwind, State)",
    "UI/UX & Design Systems",
    "AI & Algorithms (LLM/Gemini)",
    "Backend & Microservices",
    "DevOps & Containerization",
    "Full-Stack Engineering",
    "Data Engineering & Analytics",
  ];

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-[100] bg-[#f8fafc] flex flex-col h-screen w-screen overflow-hidden"
      >
        {/* TOP STICKY HEADER (Full Screen Takeover with clean padding) */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 sm:px-10 pt-5 sm:pt-6 pb-4 sm:pb-5 shrink-0 shadow-xs">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2.5 rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/70 border border-slate-200 transition cursor-pointer flex items-center gap-1.5 text-xs font-black shadow-2xs group shrink-0"
                title="Discard & Return to Projects"
              >
                <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-indigo-600 transition-colors" />
                <span>Back to Projects</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs shrink-0">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-normal">
                      {initialData ? "Edit Project Assignment" : "Project Assignment Form"}
                    </h2>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Mentor & Admin
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Specify requirements, schedule start & deadline times, rubric weights, and mentor benchmarks.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="p-2.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition cursor-pointer shadow-2xs shrink-0"
                title="Close Form"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* MAIN SCROLLABLE FORM CONTENT */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6 sm:p-10 bg-[#f8fafc]">
            <div className="max-w-5xl mx-auto space-y-6 pb-20">
              {/* SECTION 1: ESSENTIAL CLASSIFICATION & DETAILS */}
              <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-5">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>1. Core Assignment Essentials</span>
                </div>

                {/* Project Title */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                    Project Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (errors.title) setErrors({ ...errors, title: undefined });
                    }}
                    placeholder="e.g. Build Real-Time Collaborative Canvas with WebSockets"
                    className={`w-full px-4 py-3 bg-slate-50 border ${
                      errors.title ? "border-rose-400 focus:ring-rose-400" : "border-slate-200 focus:ring-indigo-500"
                    } rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:bg-white transition`}
                  />
                  {errors.title && <p className="text-xs text-rose-500 font-bold mt-1.5">{errors.title}</p>}
                </div>

                {/* Cohort & Technical Category Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                      Assign to Cohort <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={cohortId}
                        onChange={(e) => setCohortId(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                      >
                        <option value="all">All Cohorts (Broadcast to All Interns)</option>
                        {batches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name} ({b.studentCount} Interns)
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                        ▼
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5 font-medium">
                      Select cohort to enroll interns or broadcast across all batches.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                        Technical Category (Enter Manually)
                      </label>
                      <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                        Custom text supported
                      </span>
                    </div>
                    <input
                      type="text"
                      list="category-suggestions"
                      value={technicalCategory}
                      onChange={(e) => setTechnicalCategory(e.target.value)}
                      placeholder="e.g. Frontend (React, Tailwind, State)"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                    />
                    <datalist id="category-suggestions">
                      {categoryPresets.map((cat) => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>

                    {/* Quick Suggestion Chips */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {categoryPresets.slice(0, 4).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setTechnicalCategory(cat)}
                          className="px-2.5 py-1 text-[10px] font-bold bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg border border-slate-200 transition cursor-pointer"
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Priority & Leaderboard Reward Points */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                      Priority Level
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as "Low" | "Medium" | "High")}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="Low">🟢 Low Priority</option>
                      <option value="Medium">🟡 Medium Priority</option>
                      <option value="High">🔴 High Priority</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                      Leaderboard Reward Points
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="10"
                        max="500"
                        step="10"
                        value={leaderboardPoints}
                        onChange={(e) => setLeaderboardPoints(Number(e.target.value))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-black text-amber-500 pointer-events-none">
                        pts
                      </span>
                    </div>
                  </div>
                </div>

                {/* Brief Executive Summary (Paragraph Box) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                      Brief Executive Summary
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Paragraph Overview
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={executiveSummary}
                    onChange={(e) => setExecutiveSummary(e.target.value)}
                    placeholder="Provide a clear 1-2 paragraph overview of the assignment objective, real-world context, and key outcomes..."
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition leading-relaxed resize-y min-h-[85px]"
                  />
                  <p className="text-[11px] text-slate-400 mt-1 font-medium">
                    This summary appears on candidate project cards and in the intern submission view.
                  </p>
                </div>
              </div>

              {/* SECTION 2: TIMELINE & SUBMISSION SCHEDULE (START DATE/TIME + DEADLINE DATE/TIME) */}
              <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span>2. Assignment Schedule & Submission Window</span>
                  </div>
                  <span className="text-[11px] text-indigo-700 font-bold bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                    Visible to All Interns
                  </span>
                </div>

                <p className="text-xs text-slate-500 font-medium">
                  Set the start date & time when the task opens, and the final submission deadline date & time. Interns see these exact timeframes on their cards and submission portals.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                  {/* START DATE & TIME CARD */}
                  <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-indigo-900">
                        <Clock className="w-4 h-4 text-indigo-600" />
                        <span>Assignment Kickoff (Start)</span>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                        Work Begins
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* DEADLINE DATE & TIME CARD */}
                  <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-rose-950">
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                        <span>Submission Deadline</span>
                      </div>
                      <span className="text-[10px] font-bold text-rose-700 bg-white px-2 py-0.5 rounded-md border border-rose-200">
                        Final Cut-Off
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Deadline Date <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={deadline}
                          onChange={(e) => {
                            setDeadline(e.target.value);
                            if (errors.deadline) setErrors({ ...errors, deadline: undefined });
                          }}
                          className={`w-full px-3 py-2 bg-white border ${
                            errors.deadline ? "border-rose-400 focus:ring-rose-400" : "border-slate-200 focus:ring-indigo-500"
                          } rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 cursor-pointer`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Deadline Time
                        </label>
                        <input
                          type="time"
                          value={deadlineTime}
                          onChange={(e) => setDeadlineTime(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: DETAILED STEP-BY-STEP INSTRUCTIONS & DELIVERABLES */}
              <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span>3. Detailed Step-by-Step Instructions & Deliverables</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Visible to Enrolled Interns
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Provide sequential steps, architecture expectations, and exact submission checklist items.
                </p>
                <textarea
                  rows={6}
                  value={detailedInstructions}
                  onChange={(e) => setDetailedInstructions(e.target.value)}
                  placeholder="1. Review architectural guidelines...&#10;2. Implement components...&#10;3. Submit GitHub branch URL and live demo preview URL."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition leading-relaxed shadow-inner"
                />
              </div>

              {/* SECTION 4: ATTACHED SPECS & STARTER MATERIALS */}
              <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900">
                    <LinkIcon className="w-4 h-4 text-indigo-600" />
                    <span>4. Attached Specs & Starter Materials (Documents & Links)</span>
                  </div>
                  <span className="text-[11px] text-indigo-600 font-bold bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                    {resources.length} Attached
                  </span>
                </div>

                {/* Existing Resources List */}
                {resources.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {resources.map((res) => (
                      <div
                        key={res.id}
                        className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs group"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <ExternalLink className="w-4 h-4 text-indigo-500 shrink-0" />
                          <div className="truncate">
                            <span className="truncate block text-slate-800">{res.title}</span>
                            <span className="text-[10px] text-slate-400 font-normal truncate block">{res.url}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveResource(res.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer shrink-0"
                          title="Remove resource"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400 font-medium">
                    No resources attached yet. Add Figma specs, design docs, or repository links below.
                  </div>
                )}

                {/* Add New Resource Row */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-bold text-slate-700 mb-2">Attach Additional Documentation / Reference Spec</div>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                    <input
                      type="text"
                      value={newResourceTitle}
                      onChange={(e) => setNewResourceTitle(e.target.value)}
                      placeholder="Resource Title (e.g. Dashboard UX Best Practices)"
                      className="sm:col-span-5 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      type="url"
                      value={newResourceUrl}
                      onChange={(e) => setNewResourceUrl(e.target.value)}
                      placeholder="URL / Documentation Link (https://...)"
                      className="sm:col-span-5 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddResource}
                      className="sm:col-span-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Attach</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION 5: CONFIDENTIAL MENTOR SCENARIO & EVALUATION BENCHMARK */}
              <div className="p-6 sm:p-7 rounded-3xl bg-amber-50/70 border-2 border-amber-300 shadow-2xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shadow-2xs">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-amber-950">
                        5. Our Scenario & Observation Benchmark
                      </h4>
                      <p className="text-[11px] text-amber-800 font-medium">
                        Mentor & Admin Internal Grading Criteria
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-900 border border-amber-300">
                    🔒 Strictly Hidden From Interns
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-100/60 border border-amber-200 text-xs text-amber-900 leading-relaxed font-medium">
                  Document the target edge cases, architecture requirements, and evaluation rubric here. Interns will <strong>NOT</strong> see this text; they will independently write their technical observations & architecture notes during project submission, which mentors will compare against this benchmark during review.
                </div>

                <textarea
                  rows={5}
                  value={mentorObservationBenchmark}
                  onChange={(e) => setMentorObservationBenchmark(e.target.value)}
                  placeholder="• Our Scenario Benchmark:&#10;1. Verify cleanup in useEffect without leaks...&#10;2. Confirm memoization of heavy SVG charts...&#10;3. Verify strict TypeScript typings..."
                  className="w-full p-4 bg-white border border-amber-300 rounded-2xl text-xs font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed shadow-inner"
                />
              </div>
            </div>
          </main>

          {/* STICKY BOTTOM ACTION FOOTER */}
          <footer className="sticky bottom-0 z-30 bg-white border-t border-slate-200 px-6 sm:px-10 py-4 shrink-0 shadow-xs">
            <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                <span>Mentor & Admin Privileges • Start and deadline schedules will be displayed to all enrolled interns</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                >
                  Discard / Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-indigo-200" />
                  <span>{initialData ? "Update Assignment" : "Publish Project Assignment"}</span>
                </button>
              </div>
            </div>
          </footer>
        </form>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};
