import React, { useState, useEffect } from "react";
import { Student, InternResource } from "../types";
import {
  FolderGit2,
  FileText,
  Presentation,
  FileCode,
  Sparkles,
  UploadCloud,
  ExternalLink,
  Download,
  Trash2,
  CheckCircle2,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Check,
  BookOpen,
  Award,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
  Clock,
  Eye,
  X,
} from "lucide-react";

interface InternResourcesVaultViewProps {
  currentStudent: Student;
  onUpdateStudent?: (student: Student) => void;
  onNavigateToReport?: () => void;
}

export const DEFAULT_SAMPLE_RESOURCES = (_studentId: string, _batchId?: string): InternResource[] => [];

export const InternResourcesVaultView: React.FC<InternResourcesVaultViewProps> = ({
  currentStudent,
  onUpdateStudent,
  onNavigateToReport
}) => {
  const [resources, setResources] = useState<InternResource[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("m2i_intern_resources") || "{}");
      if (stored[currentStudent.id] && Array.isArray(stored[currentStudent.id])) {
        // Filter out any stale sample dummy pdfs
        return stored[currentStudent.id].filter(
          (r: InternResource) => !r.id.startsWith("res-") || !r.fileName.includes("Mind2i_")
        );
      }
    } catch {}
    if (currentStudent?.resources && currentStudent.resources.length > 0) {
      return currentStudent.resources.filter(
        (r) => !r.fileName.includes("Mind2i_Microservices_")
      );
    }
    return [];
  });

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("m2i_intern_resources") || "{}");
      if (stored[currentStudent.id] && stored[currentStudent.id].length > 0) {
        setResources(stored[currentStudent.id]);
        return;
      }
    } catch {}
    if (currentStudent?.resources && currentStudent.resources.length > 0) {
      setResources(currentStudent.resources);
    }
  }, [currentStudent.id, currentStudent.resources]);

  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [detailModalResource, setDetailModalResource] = useState<InternResource | null>(null);
  const [isAnalyzingAll, setIsAnalyzingAll] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // New Resource Form State
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<"presentation" | "document" | "whitepaper" | "blueprint">("document");
  const [newDescription, setNewDescription] = useState("");
  const [newTags, setNewTags] = useState("");
  const [newFileUrl, setNewFileUrl] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [newFileSize, setNewFileSize] = useState("");

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const persistResources = (updatedList: InternResource[]) => {
    setResources(updatedList);
    try {
      const stored = JSON.parse(localStorage.getItem("m2i_intern_resources") || "{}");
      stored[currentStudent.id] = updatedList;
      localStorage.setItem("m2i_intern_resources", JSON.stringify(stored));
    } catch (e) {
      console.error(e);
    }
    if (onUpdateStudent) {
      onUpdateStudent({ ...currentStudent, resources: updatedList });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewFileName(file.name);
    setNewFileSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);
    const reader = new FileReader();
    reader.onload = (event) => {
      setNewFileUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const tagList = newTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const newResource: InternResource = {
      id: `res-${currentStudent.id}-${Date.now()}`,
      studentId: currentStudent.id,
      batchId: currentStudent.batchId,
      title: newTitle.trim(),
      type: newType,
      fileUrl: newFileUrl || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      fileName: newFileName || `${newTitle.replace(/\s+/g, "_")}.pdf`,
      fileSize: newFileSize || "3.5 MB",
      uploadedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      description: newDescription.trim() || "Technical artifact submitted for faculty review and evaluation.",
      aiRating: undefined,
      aiAuditSummary: "Submitted by candidate. Awaiting faculty review and AI analysis by admin.",
      tags: tagList.length > 0 ? tagList : ["Mind2i", "Intern Artifact", "Submitted"]
    };

    const updated = [newResource, ...resources];
    persistResources(updated);
    setShowAddModal(false);
    setNewTitle("");
    setNewDescription("");
    setNewTags("");
    setNewFileUrl("");
    setNewFileName("");
    setNewFileSize("");
    showToast("Document submitted successfully! Awaiting faculty AI analysis by admin.");
  };

  const handleDeleteResource = (id: string) => {
    const updated = resources.filter((r) => r.id !== id);
    persistResources(updated);
    showToast("Resource removed from your vault.");
  };

  const filteredResources = resources.filter((res) => {
    const matchesType = activeFilter === "all" || res.type === activeFilter;
    const matchesSearch =
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const evaluatedDocs = resources.filter((r) => typeof r.aiRating === "number" && r.aiRating > 0);
  const avgAiRating =
    evaluatedDocs.length > 0
      ? Math.round(evaluatedDocs.reduce((acc, r) => acc + (r.aiRating || 90), 0) / evaluatedDocs.length)
      : null;

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "presentation":
        return {
          label: "Presentation Deck",
          color: "bg-amber-50 text-amber-700 border-amber-200",
          icon: Presentation
        };
      case "whitepaper":
        return {
          label: "Research Whitepaper",
          color: "bg-indigo-50 text-indigo-700 border-indigo-200",
          icon: BookOpen
        };
      case "blueprint":
        return {
          label: "System Blueprint",
          color: "bg-purple-50 text-purple-700 border-purple-200",
          icon: Layers
        };
      default:
        return {
          label: "Technical Document",
          color: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: FileText
        };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-indigo-500/40 flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{successToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-indigo-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>Intern Digital Vault &amp; Document Artifacts</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              My Technical Resources &amp; Research Whitepapers
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200/80 leading-relaxed">
              Submit your capstone presentation slide decks, technical blueprints, and research whitepapers with headings and descriptions. Once submitted, your artifacts are reviewed and analyzed by the faculty admin team and showcased with verified ratings in <span className="text-indigo-300 font-bold">Section 09</span> of your candidate report.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-5 py-3 bg-white text-slate-900 hover:bg-slate-100 rounded-2xl text-xs font-black shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-indigo-600" />
              <span>Submit New Document</span>
            </button>
          </div>
        </div>

        {/* Metric Quick Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Total Submitted Artifacts</p>
            <p className="text-xl font-black text-white mt-0.5">{resources.length}</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Faculty Verified</p>
            <p className="text-xl font-black text-emerald-400 mt-0.5">{evaluatedDocs.length}</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Average Quality Rating</p>
            <p className="text-xl font-black text-indigo-300 mt-0.5">
              {avgAiRating ? `${avgAiRating}%` : "Pending Review"}
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Official Report Sync</p>
            <p className="text-xl font-black text-white mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Section 09
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents, tags, blueprints..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: "all", label: "All Artifacts" },
            { id: "presentation", label: "Presentations" },
            { id: "blueprint", label: "Blueprints" },
            { id: "whitepaper", label: "Whitepapers" },
            { id: "document", label: "Technical Docs" }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeFilter === tab.id
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Document Rows List (Row-based design with Eye icon for full details) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Header (Desktop) */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 bg-slate-50/80 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
          <div className="col-span-5">Document / Artifact</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-2">Review Status</div>
          <div className="col-span-1">Uploaded</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-100">
          {filteredResources.map((item) => {
            const badge = getTypeBadge(item.type);
            const BadgeIcon = badge.icon;
            const isAnalyzed = typeof item.aiRating === "number" && item.aiRating > 0;

            return (
              <div
                key={item.id}
                className="px-5 py-4 hover:bg-slate-50/70 transition-all flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 md:items-center"
              >
                {/* Column 1: Icon, Title & Details */}
                <div className="md:col-span-5 flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-2xs">
                    <BadgeIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4
                      onClick={() => setDetailModalResource(item)}
                      className="text-sm font-bold text-slate-900 truncate hover:text-indigo-600 transition cursor-pointer"
                      title={item.title}
                    >
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                      {item.fileName} • {item.fileSize || "PDF"}
                    </p>
                  </div>
                </div>

                {/* Column 2: Type Badge */}
                <div className="md:col-span-2 flex items-center">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${badge.color}`}>
                    <BadgeIcon className="w-3 h-3" />
                    <span>{badge.label}</span>
                  </span>
                </div>

                {/* Column 3: Status Badge */}
                <div className="md:col-span-2 flex items-center">
                  {isAnalyzed ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      <span>Admin Verified: {item.aiRating}%</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>Pending Review</span>
                    </span>
                  )}
                </div>

                {/* Column 4: Uploaded Date */}
                <div className="md:col-span-1 text-xs text-slate-500 font-medium">
                  {item.uploadedAt}
                </div>

                {/* Column 5: Action Buttons with Eye Icon */}
                <div className="md:col-span-2 flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDetailModalResource(item)}
                    className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition cursor-pointer"
                    title="View Full Document Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                    title="Open Document in New Tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <a
                    href={item.fileUrl}
                    download={item.fileName}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                    title="Download Document"
                  >
                    <Download className="w-4 h-4" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleDeleteResource(item.id)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    title="Delete Artifact"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {filteredResources.length === 0 && (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-3">
          <FolderGit2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No resources found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query or upload your first presentation, technical document, or research whitepaper.
          </p>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Upload Document
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm overflow-y-auto p-3 sm:p-5 flex justify-center items-start pt-6 sm:pt-10 pb-10">
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-5 overflow-y-auto"
            style={{ maxHeight: "calc(100vh - 4.5rem)" }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                  Upload Artifact to Resource Vault
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateResource} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Document Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Distributed Consensus Engine Architecture Whitepaper"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Artifact Category
                  </label>
                  <select
                    value={newType}
                    onChange={(e: any) => setNewType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="document">Technical Document</option>
                    <option value="presentation">Presentation Slide Deck</option>
                    <option value="whitepaper">Research Whitepaper</option>
                    <option value="blueprint">System Blueprint / Spec</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Tags (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="FastAPI, Redis, LLM"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Abstract / Executive Summary
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Summarize key architectural decisions, empirical conclusions, and business outcomes..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Upload Document File (.pdf, .pptx, .docx, .zip)
                </label>
                <label className="block border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl p-4 text-center cursor-pointer transition bg-slate-50/50 hover:bg-indigo-50/20">
                  <input
                    type="file"
                    accept=".pdf,.pptx,.ppt,.docx,.doc,.zip,.tar.gz"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <UploadCloud className="w-6 h-6 text-indigo-500 mx-auto mb-1" />
                  <p className="text-xs font-bold text-slate-800">
                    {newFileName ? `Selected: ${newFileName} (${newFileSize})` : "Click to select or drag document file"}
                  </p>
                  <p className="text-[10px] text-slate-400">Supports PDF, PPTX, DOCX up to 50MB</p>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Submit Document for Faculty Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detailed Document Modal (Opened by clicking the Eye icon) */}
      {detailModalResource && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm overflow-y-auto p-3 sm:p-5 flex justify-center items-start pt-6 sm:pt-10 pb-10">
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-6 overflow-y-auto"
            style={{ maxHeight: "calc(100vh - 4.5rem)" }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${getTypeBadge(detailModalResource.type).color}`}>
                    {detailModalResource.type.toUpperCase()}
                  </span>
                  {typeof detailModalResource.aiRating === "number" && detailModalResource.aiRating > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      Admin Verified: {detailModalResource.aiRating}%
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                      <Clock className="w-3 h-3 text-amber-600" />
                      Submitted • Awaiting Admin Audit
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                  {detailModalResource.title}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {detailModalResource.fileName} • {detailModalResource.fileSize || "PDF"} • Uploaded {detailModalResource.uploadedAt}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDetailModalResource(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Abstract / Scope */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                Document Abstract &amp; Scope Summary
              </h4>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
                {detailModalResource.description || "No detailed description provided for this technical artifact."}
              </div>
            </div>

            {/* Tags */}
            {detailModalResource.tags && detailModalResource.tags.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Topic Tags
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {detailModalResource.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-indigo-50/70 border border-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-400 font-medium">
                Candidate submission stored in digital vault
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDetailModalResource(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  Close
                </button>
                <a
                  href={detailModalResource.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Document</span>
                </a>
                <a
                  href={detailModalResource.fileUrl}
                  download={detailModalResource.fileName}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
