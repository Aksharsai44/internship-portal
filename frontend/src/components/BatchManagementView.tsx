import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Batch, Student } from "../types";
import {
  Users,
  Search,
  QrCode,
  Upload,
  UserPlus,
  Eye,
  Trash2,
  Edit2,
  Download,
  Check,
  Copy,
  ExternalLink,
  Filter,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Phone,
  Mail,
  ShieldCheck,
  Key,
  Plus,
  Calendar,
  Building2,
  Clock,
  Printer,
  AlertTriangle,
  ChevronDown,
  Info,
  CheckCircle2,
  Lock,
  Unlock,
} from "lucide-react";
import QRCode from "qrcode";
import { Minda2Logo } from "./Minda2Logo";

interface BatchManagementViewProps {
  batches: Batch[];
  selectedBatch: Batch;
  onSelectBatch: (b: Batch) => void;
  onCreateBatch?: (
    b: Partial<Batch>,
    cloneFromBatchId?: string,
    cloneAssignmentsBatchId?: string,
  ) => Batch;
  onUpdateBatch?: (
    b: Batch,
    cloneFromBatchId?: string,
    cloneAssignmentsBatchId?: string,
  ) => void;
  onDeleteBatch?: (batchId: string) => void;
  students: Student[];
  onAddStudent: (stu: Partial<Student>) => void;
  onBulkAddStudents: (stus: Partial<Student>[]) => void;
  onEditStudent: (stu: Student) => void;
  onDeleteStudent: (id: string) => void;
  onViewStudentDetails: (stu: Student) => void;
  onOpenSelfRegisterPortal: (batchId: string) => void;
  settings?: import("../types").AppSettings;
}

export const BatchManagementView: React.FC<BatchManagementViewProps> = ({
  batches,
  selectedBatch,
  onSelectBatch,
  onCreateBatch,
  onUpdateBatch,
  onDeleteBatch,
  students,
  onAddStudent,
  onBulkAddStudents,
  onEditStudent,
  onDeleteStudent,
  onViewStudentDetails,
  onOpenSelfRegisterPortal,
  settings,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);

  // Batch CRUD Modals
  const [showCreateBatchModal, setShowCreateBatchModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [deletingBatch, setDeletingBatch] = useState<Batch | null>(null);

  // Create Batch Form State
  const [newBatchName, setNewBatchName] = useState("");
  const [newBatchType, setNewBatchType] = useState<string>("internship_3m");
  const [newBatchCollege, setNewBatchCollege] = useState("");
  const [newBatchDuration, setNewBatchDuration] = useState("3 Months");
  const [newBatchStartDate, setNewBatchStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [newBatchEndDate, setNewBatchEndDate] = useState(
    new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
  );
  const [newBatchStatus, setNewBatchStatus] = useState<
    "active" | "completed" | "upcoming"
  >("active");
  const [newBatchDescription, setNewBatchDescription] = useState("");
  const [newBatchZoomLink, setNewBatchZoomLink] = useState("");
  const [newBatchCloneId, setNewBatchCloneId] = useState<string>("none");
  const [newBatchAssignmentsCloneId, setNewBatchAssignmentsCloneId] =
    useState<string>("none");
  const [editBatchCloneId, setEditBatchCloneId] = useState<string>("none");
  const [editBatchAssignmentsCloneId, setEditBatchAssignmentsCloneId] =
    useState<string>("none");

  // QR Modal State (can be opened for any batch)
  const [qrModalBatch, setQrModalBatch] = useState<Batch | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState(false);

  // Manual Add Student form state
  const [manualName, setManualName] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [manualMobile, setManualMobile] = useState("");
  const [manualCollege, setManualCollege] = useState(selectedBatch.college);
  const [manualBranch, setManualBranch] = useState("");
  const [manualCity, setManualCity] = useState("");
  const [manualState, setManualState] = useState("");
  const [manualPassword, setManualPassword] = useState(settings?.defaultStudentPassword || "");

  // Edit Student modal state
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // CSV parse state
  const [csvContent, setCsvContent] = useState("");
  const [parsedCsvCount, setParsedCsvCount] = useState<number | null>(null);

  // Network Host for Mobile QR Scanning
  const [networkHost, setNetworkHost] = useState<string>("");
  const [hostMode, setHostMode] = useState<"network" | "localhost" | "custom">("network");
  const [customHostInput, setCustomHostInput] = useState<string>("");

  // Fetch local network IP for mobile scanning
  useEffect(() => {
    axios.get("/api/network-info")
      .then((res) => {
        if (res.data && res.data.localIp) {
          setNetworkHost(`${res.data.localIp}:${res.data.port || 3000}`);
        }
      })
      .catch(() => {
        if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
          setNetworkHost(window.location.host);
        } else {
          setNetworkHost("192.168.1.18:3000");
        }
      });
  }, []);

  const isProductionDomain =
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1";

  const getEffectiveRegistrationUrl = (batchId: string) => {
    const protocol = window.location.protocol || "http:";
    
    // In Production Deployment (e.g. https://yourdomain.com):
    if (isProductionDomain) {
      return `${protocol}//${window.location.host}/?register=1&batch=${batchId}`;
    }

    // In Local Development:
    let targetHost = networkHost || "192.168.1.18:3000";
    if (hostMode === "localhost") {
      targetHost = window.location.host || "localhost:3000";
    } else if (hostMode === "custom" && customHostInput.trim()) {
      targetHost = customHostInput.trim();
    }
    return `${protocol}//${targetHost}/?register=1&batch=${batchId}`;
  };

  // Print Ref for QR flyer
  const printFlyerRef = useRef<HTMLDivElement>(null);

  // Generate QR Code whenever qrModalBatch, hostMode, or networkHost changes
  useEffect(() => {
    const targetBatch = qrModalBatch || selectedBatch;
    if (!targetBatch) return;

    const registrationUrl = getEffectiveRegistrationUrl(targetBatch.id);
    QRCode.toDataURL(registrationUrl, {
      width: 320,
      margin: 2,
      color: { dark: "#0284c7", light: "#ffffff" },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("QR Code generation error:", err));
  }, [qrModalBatch, selectedBatch, hostMode, networkHost, customHostInput]);

  const batchStudents = students.filter((s) => s.batchId === selectedBatch.id);
  const filteredStudents = batchStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.mobile.includes(searchQuery),
  );

  // Handlers for Batch Creation
  const handleOpenCreateBatch = () => {
    setNewBatchName("");
    setNewBatchType("internship_3m");
    setNewBatchCollege("");
    setNewBatchDuration("3 Months");
    setNewBatchStartDate(new Date().toISOString().split("T")[0]);
    setNewBatchEndDate(
      new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
    );
    setNewBatchStatus("active");
    setNewBatchDescription("3-Month Intensive Technical Internship Cohort.");
    setNewBatchZoomLink("");
    setNewBatchCloneId("none");
    setNewBatchAssignmentsCloneId("none");
    setShowCreateBatchModal(true);
  };

  const handleCreateBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchName.trim() || !newBatchCollege.trim()) return;

    if (onCreateBatch) {
      const zoomCfg = newBatchZoomLink.trim()
        ? {
            ...(settings?.zoomConfig || {
              topic: `${newBatchName.trim()} Live Masterclass`,
              instructorName: settings?.zoomConfig?.instructorName || "",
              meetingId: "",
              passcode: "",
              scheduledDate: "Today",
              scheduledTime: "10:00 AM - 01:00 PM",
              status: "live" as const,
              recordingUrl: "",
              isRecordingUnlocked: true,
            }),
            meetingLink: newBatchZoomLink.trim(),
            topic: `${newBatchName.trim()} Live Masterclass`,
          }
        : undefined;

      const created = onCreateBatch(
        {
          name: newBatchName.trim(),
          type: newBatchType,
          college: newBatchCollege.trim(),
          durationLabel: newBatchDuration,
          startDate: newBatchStartDate,
          endDate: newBatchEndDate,
          status: newBatchStatus,
          description: newBatchDescription,
          zoomLink: newBatchZoomLink.trim() || undefined,
          zoomConfig: zoomCfg,
          registrationCode: `M2I-${Math.floor(1000 + Math.random() * 9000)}`,
        },
        newBatchCloneId !== "none" ? newBatchCloneId : undefined,
        newBatchAssignmentsCloneId !== "none"
          ? newBatchAssignmentsCloneId
          : undefined,
      );

      setShowCreateBatchModal(false);
      // Automatically open QR modal for the newly created batch!
      if (created) {
        setQrModalBatch(created);
      }
    }
  };

  // Handlers for Batch Update
  const handleUpdateBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBatch || !editingBatch.name.trim()) return;

    if (onUpdateBatch) {
      onUpdateBatch(
        editingBatch,
        editBatchCloneId !== "none" ? editBatchCloneId : undefined,
        editBatchAssignmentsCloneId !== "none"
          ? editBatchAssignmentsCloneId
          : undefined,
      );
    }
    setEditingBatch(null);
  };

  // Handlers for Batch Deletion
  const handleConfirmDeleteBatch = () => {
    if (!deletingBatch) return;

    if (onDeleteBatch) {
      onDeleteBatch(deletingBatch.id);
    }
    setDeletingBatch(null);
  };

  const handleToggleLockBatch = (b: Batch) => {
    const updated: Batch = { ...b, isLocked: !b.isLocked };
    if (onUpdateBatch) {
      onUpdateBatch(updated);
    }
  };

  // Handlers for Student Registration
  const handleManualAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || !manualEmail.trim()) return;

    if (selectedBatch.isLocked) {
      alert(`Cohort "${selectedBatch.name}" is locked. Adding interns is currently disabled.`);
      return;
    }

    onAddStudent({
      name: manualName,
      email: manualEmail,
      mobile: manualMobile || "+1 (555) 000-0000",
      college: manualCollege || selectedBatch.college,
      branch: manualBranch,
      city: manualCity,
      state: manualState,
      password: settings?.defaultStudentPassword || "student123",
      batchId: selectedBatch.id,
      batchName: selectedBatch.name,
      status: "active",
      enrolledAt: new Date().toISOString(),
      scores: {
        quizScore: 0,
        codingScore: 0,
        liveQAScore: 0,
        assignmentScore: 0,
        overallAccuracy: 0.0,
      },
      totalPoints: 0,
      activeStreakDays: 0,
      fastestResponseMs: 0,
      attendedSessions: 0,
      totalSessions: 0,
    });

    setShowAddStudentModal(false);
    setManualName("");
    setManualEmail("");
    setManualMobile("");
    setManualCollege(selectedBatch.college);
    setManualBranch("");
    setManualCity("");
    setManualState("");
    setManualPassword(settings?.defaultStudentPassword || "");
    setShowAddStudentModal(false);
  };

  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setCsvContent(text);
      const lines = text.split("\n").filter((l) => l.trim().length > 0);
      const rows = lines.slice(1);
      setParsedCsvCount(rows.length);
    };
    reader.readAsText(file);
  };

  const handleProcessCsvSubmit = () => {
    if (!csvContent) return;

    if (selectedBatch.isLocked) {
      alert(`Cohort "${selectedBatch.name}" is locked. Adding interns is currently disabled.`);
      return;
    }

    const lines = csvContent.split("\n").filter((l) => l.trim().length > 0);
    const rows = lines.slice(1);

    const parsedList: Partial<Student>[] = rows.map((line, idx) => {
      const [name, email, mobile, college, branch, city, state, password] = line
        .split(",")
        .map((c) => c?.trim().replace(/^"|"$/g, ""));
      return {
        name: name || `Student ${idx + 1}`,
        email: email || `student${idx + 1}@mind2i.edu`,
        mobile: mobile || "+1 (555) 012-3456",
        college: college || selectedBatch.college,
        branch: branch || "",
        city: city || "",
        state: state || "",
        password: password || settings?.defaultStudentPassword || "mind2i@2026",
        batchId: selectedBatch.id,
        batchName: selectedBatch.name,
        status: "active",
        enrolledAt: new Date().toISOString(),
        scores: {
          quizScore: 0,
          codingScore: 0,
          liveQAScore: 0,
          assignmentScore: 0,
          overallAccuracy: 0.0,
        },
        totalPoints: 0,
        activeStreakDays: 0,
        fastestResponseMs: 0,
        attendedSessions: 0,
        totalSessions: 0,
      };
    });

    onBulkAddStudents(parsedList);
    setShowCsvModal(false);
    setCsvContent("");
    setParsedCsvCount(null);
  };

  const handleCopyLink = (batchId: string) => {
    const registrationUrl = getEffectiveRegistrationUrl(batchId);
    navigator.clipboard.writeText(registrationUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadQrImage = (batch: Batch) => {
    if (!qrDataUrl) return;
    const downloadLink = document.createElement("a");
    downloadLink.href = qrDataUrl;
    downloadLink.download = `${batch.name.replace(/\s+/g, "_")}_Registration_QR.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handlePrintFlyer = () => {
    window.print();
  };

  const handleExportRosterCsv = () => {
    const headers =
      "Name,Mobile Number,Batch Name,Email ID,Accuracy,Points,Status\n";
    const rows = batchStudents
      .map(
        (s) =>
          `"${s.name}","${s.mobile}","${s.batchName}","${s.email}",${s.scores?.overallAccuracy ?? 0}%,${s.totalPoints ?? 0},"${s.status}"`,
      )
      .join("\n");
    const blob = new Blob([headers + rows], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${selectedBatch.name.replace(/\s+/g, "_")}_Roster.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentQrBatch = qrModalBatch || selectedBatch;

  return (
    <div className="space-y-6 pb-12">
      {/* ========================================================================= */}
      {/* 1. TOP BATCHES BAR & CREATE BATCH BUTTON                                  */}
      {/* ========================================================================= */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-sky-50 text-sky-600 rounded-lg">
              <Users className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-black text-slate-900">
              Batches & Cohorts Management
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Add, update, delete batches and generate live student registration
            QR codes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setQrModalBatch(selectedBatch)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs border border-sky-200 shadow-xs transition cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>Batch QR Code</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateBatch}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Batch</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. BATCH CARDS GRID (WITH UPDATE, DELETE, QR, AND SELECT CONTROLS)         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {batches.map((b) => {
          const isSelected = b.id === selectedBatch.id;
          const studentCount = students.filter(
            (s) => s.batchId === b.id,
          ).length;

          return (
            <div
              key={b.id}
              className={`p-5 rounded-3xl border transition flex flex-col justify-between relative group ${
                isSelected
                  ? "bg-sky-50/70 border-sky-400 ring-2 ring-sky-400/30 shadow-md"
                  : "bg-white border-slate-200/80 hover:border-sky-200 shadow-xs"
              }`}
            >
              <div>
                {/* Header Tags & Action Shortcuts */}
                <div className="flex items-center justify-between mb-2.5 gap-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border flex items-center gap-1 shrink-0 ${
                        b.type === "workshop"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-sky-50 text-sky-700 border-sky-200"
                      }`}
                    >
                      <span>{b.type === "workshop" ? "⚡" : "🚀"}</span>
                      <span>{b.type}</span>
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 truncate">
                      {b.durationLabel}
                    </span>
                  </div>

                  {/* Batch Card Actions (QR, Lock, Edit, Delete) */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectBatch(b);
                        setQrModalBatch(b);
                      }}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-sky-100 text-slate-600 hover:text-sky-700 transition shrink-0"
                      title="View & Download QR Code"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleLockBatch(b);
                      }}
                      className={`p-1.5 rounded-lg transition shrink-0 ${
                        b.isLocked
                          ? "bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 shadow-2xs"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900"
                      }`}
                      title={
                        b.isLocked
                          ? "Batch is Locked (Registration closed) - Click to Unlock"
                          : "Lock Batch (Close registration & intern additions)"
                      }
                    >
                      {b.isLocked ? (
                        <Lock className="w-3.5 h-3.5 text-rose-600" />
                      ) : (
                        <Unlock className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingBatch(b);
                        setEditBatchCloneId("none");
                        setEditBatchAssignmentsCloneId("none");
                      }}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition shrink-0"
                      title="Update / Edit Batch Details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingBatch(b);
                      }}
                      disabled={batches.length <= 1}
                      className={`p-1.5 rounded-lg transition shrink-0 ${
                        batches.length <= 1
                          ? "opacity-30 cursor-not-allowed bg-slate-100 text-slate-400"
                          : "bg-rose-50 hover:bg-rose-100 text-rose-600"
                      }`}
                      title={
                        batches.length <= 1
                          ? "Cannot delete the only batch"
                          : "Delete Batch"
                      }
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Batch Name & College */}
                <h4 className="font-black text-slate-900 text-base mb-1 leading-snug">
                  {b.name}
                </h4>
                <p className="text-xs text-slate-500 font-medium mb-3 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{b.college}</span>
                </p>

                {/* Date & Registration Code Info */}
                <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 text-[11px] text-slate-600 space-y-1 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Dates:</span>
                    <span className="font-bold text-slate-700">
                      {b.startDate} → {b.endDate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">
                      Registration:
                    </span>
                    {b.isLocked ? (
                      <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-[10px] flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5 text-rose-600" /> Closed
                      </span>
                    ) : (
                      <span className="font-mono font-black text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100">
                        {b.registrationCode || `M2I-${b.id.slice(0, 4)}`}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Card Footer: Count & Active Selector */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 pt-3 border-t border-slate-200/60">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-sky-600" />
                  <span>{studentCount} Students</span>
                  {b.isLocked && (
                    <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-200 flex items-center gap-0.5 ml-1">
                      <Lock className="w-2.5 h-2.5" /> Closed
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onSelectBatch(b)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isSelected
                      ? "bg-sky-600 text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  {isSelected ? "● Active Batch" : "Select Batch"}
                </button>
              </div>
            </div>
          );
        })}

        {/* Quick Add Batch Card */}
        <div
          onClick={handleOpenCreateBatch}
          className="p-6 rounded-3xl border-2 border-dashed border-slate-200 hover:border-sky-400 hover:bg-sky-50/30 transition cursor-pointer flex flex-col items-center justify-center text-center min-h-[220px] group"
        >
          <div className="w-12 h-12 rounded-2xl bg-sky-50 group-hover:bg-sky-100 text-sky-600 flex items-center justify-center mb-3 transition shadow-xs">
            <Plus className="w-6 h-6" />
          </div>
          <h4 className="font-black text-slate-800 text-sm mb-1">
            Create Another Batch
          </h4>
          <p className="text-xs text-slate-400 max-w-[200px]">
            Set up a workshop or bootcamp with customized dates, duration, and
            self-registration QR.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. ROSTER PANEL FOR SELECTED BATCH                                        */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-5">
        {/* Roster Header with Search Bar and Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <span>{selectedBatch.name}</span>
              <span className="text-xs font-bold text-slate-400">
                ({filteredStudents.length} members enrolled)
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Default credentials: Username = Student Email | Default Passcode ={" "}
              <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sky-700 font-mono font-bold">
                mind2i@2026
              </code>
            </p>
          </div>

          {/* Action Buttons & Search */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search name, mobile, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:bg-white w-48 sm:w-64"
              />
            </div>

            {/* QR Code Button */}
            <button
              onClick={() => setQrModalBatch(selectedBatch)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl text-xs font-bold transition border border-sky-200 cursor-pointer"
              title="Generate QR code for live student batch self-registration"
            >
              <QrCode className="w-4 h-4" />
              <span>Batch QR Code</span>
            </button>

            {/* Upload CSV */}
            <button
              disabled={selectedBatch.isLocked}
              onClick={() => {
                if (selectedBatch.isLocked) return;
                setShowCsvModal(true);
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
                selectedBatch.isLocked
                  ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 cursor-pointer"
              }`}
              title={selectedBatch.isLocked ? "Cannot upload CSV: Cohort is locked" : "Upload CSV"}
            >
              <Upload className="w-4 h-4" />
              <span>Upload CSV</span>
            </button>

            {/* Manual Add User */}
            <button
              disabled={selectedBatch.isLocked}
              onClick={() => {
                if (selectedBatch.isLocked) return;
                setShowAddStudentModal(true);
              }}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                selectedBatch.isLocked
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed opacity-60"
                  : "bg-sky-500 hover:bg-sky-600 text-white cursor-pointer"
              }`}
              title={selectedBatch.isLocked ? "Cannot add student: Cohort is locked" : "Add Student"}
            >
              {selectedBatch.isLocked ? <Lock className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              <span>{selectedBatch.isLocked ? "Batch Locked" : "Add Student"}</span>
            </button>

            {/* Download Roster CSV */}
            <button
              onClick={handleExportRosterCsv}
              className="p-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition cursor-pointer"
              title="Export roster to CSV"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Lock Warning Banner */}
        {selectedBatch.isLocked && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-700 animate-in fade-in">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-black text-rose-900">Cohort Locked — Registration & Student Additions Disabled</p>
                <p className="text-[11px] text-rose-600 font-medium">
                  This batch is locked. Intern self-registration and manual intern additions are closed. Click Unlock to re-open registration.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggleLockBatch(selectedBatch)}
              className="px-3.5 py-1.5 bg-white hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer flex items-center justify-center gap-1.5 flex-shrink-0"
            >
              <Unlock className="w-3.5 h-3.5 text-rose-600" />
              <span>Unlock Batch</span>
            </button>
          </div>
        )}

        {/* Student Roster Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">College</th>
                <th className="py-3 px-4 text-center">Accuracy</th>
                <th className="py-3 px-4 text-center">Points</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-slate-400 font-medium"
                  >
                    No students found in this batch matching your search.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((stu) => (
                  <tr key={stu.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            stu.avatar ||
                            `https://api.dicebear.com/7.x/bottts/svg?seed=${stu.name}`
                          }
                          alt={stu.name}
                          className="w-8 h-8 rounded-xl object-cover border border-slate-200 shadow-xs"
                        />
                        <div>
                          <div className="font-extrabold text-slate-900">
                            {stu.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            ID: {stu.id.slice(0, 8)}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-700 font-medium text-xs">
                        {stu.email}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {stu.mobile}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600 text-xs font-medium">
                      {stu.college || selectedBatch.college}
                    </td>

                    <td className="py-3 px-4 text-center font-extrabold">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          (stu.scores?.overallAccuracy ?? 0) >= 80
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : (stu.scores?.overallAccuracy ?? 0) >= 60
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {stu.scores?.overallAccuracy ?? 0}%
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center font-extrabold text-slate-900">
                      {stu.totalPoints}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {stu.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewStudentDetails(stu)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                          title="View 360° Profile & Telemetry"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setEditingStudent(stu)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                          title="Edit Student"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                `Are you sure you want to remove ${stu.name}?`,
                              )
                            ) {
                              onDeleteStudent(stu.id);
                            }
                          }}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                          title="Remove Student from Batch"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MODAL: CREATE NEW BATCH                                                */}
      {/* ========================================================================= */}
      {showCreateBatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col overflow-hidden animate-in fade-in">
          <div className="bg-white w-full h-full p-6 sm:p-8 shadow-xl flex flex-col overflow-y-auto">
            <div className="max-w-3xl mx-auto w-full py-4">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-sky-600 font-black text-lg">
                  <Plus className="w-5 h-5" />
                  <span>Create New Batch</span>
                </div>
                <button
                  onClick={() => setShowCreateBatchModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateBatchSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Batch Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newBatchName}
                    onChange={(e) => setNewBatchName(e.target.value)}
                    placeholder="e.g. Generative AI & Full-Stack Workshop 2026"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Internship Cohort Track *
                    </label>
                    <select
                      value={newBatchType}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewBatchType(val);
                        if (val === "internship_3m") setNewBatchDuration("3 Months");
                        else if (val === "internship_6m") setNewBatchDuration("6 Months");
                        else if (val === "internship_12m") setNewBatchDuration("12 Months");
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 bg-white"
                    >
                      <option value="internship_3m">
                        🌟 3 Months Technical Internship
                      </option>
                      <option value="internship_6m">
                        🚀 6 Months Comprehensive Internship
                      </option>
                      <option value="internship_12m">
                        🏆 12 Months Fellowship / Long-Term
                      </option>
                      <option value="custom">
                        ✨ Custom Duration Cohort
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Duration Label *
                    </label>
                    <input
                      type="text"
                      required
                      value={newBatchDuration}
                      onChange={(e) => setNewBatchDuration(e.target.value)}
                      placeholder="e.g. 3 Months or 6 Months"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    College / Institution Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newBatchCollege}
                    onChange={(e) => setNewBatchCollege(e.target.value)}
                    placeholder="e.g. Stanford University or MIT"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={newBatchStartDate}
                      onChange={(e) => setNewBatchStartDate(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={newBatchEndDate}
                      onChange={(e) => setNewBatchEndDate(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Batch Description
                  </label>
                  <textarea
                    rows={2}
                    value={newBatchDescription}
                    onChange={(e) => setNewBatchDescription(e.target.value)}
                    placeholder="Course goals, agenda, syllabus outline..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
                    <span>Zoom Meeting Link / URL (Optional)</span>
                    <span className="text-[10px] text-sky-600 font-bold lowercase">e.g. https://zoom.us/j/...</span>
                  </label>
                  <input
                    type="url"
                    value={newBatchZoomLink}
                    onChange={(e) => setNewBatchZoomLink(e.target.value)}
                    placeholder="https://zoom.us/j/84920491928?pwd=..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 font-mono text-xs"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Enrolled students in this batch will see this Zoom link on their dashboard to join live classes.
                  </p>
                </div>

                <div className="p-3 bg-sky-50 rounded-2xl border border-sky-100 text-xs text-sky-900 flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-sky-600 flex-shrink-0" />
                  <span>
                    A unique student self-registration QR code & link will be
                    generated automatically.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Copy className="w-3.5 h-3.5" /> Copy Learn Hub Content From
                  </label>
                  <div className="relative">
                    <select
                      value={newBatchCloneId}
                      onChange={(e) => setNewBatchCloneId(e.target.value)}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 transition shadow-sm cursor-pointer"
                    >
                      <option value="none">
                        Do Not Copy Content (Empty Learn Hub)
                      </option>
                      {batches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} - {b.programType}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 font-medium leading-relaxed">
                    Clones Learn Hub modules, text content, and files into the
                    new batch. User progress and analytics will NOT be copied.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1 mt-6">
                    <Copy className="w-3.5 h-3.5" /> Clone Assignments From
                  </label>
                  <div className="relative">
                    <select
                      value={newBatchAssignmentsCloneId}
                      onChange={(e) =>
                        setNewBatchAssignmentsCloneId(e.target.value)
                      }
                      className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 transition shadow-sm cursor-pointer"
                    >
                      <option value="none">Do Not Clone Assignments</option>
                      {batches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} - {b.programType}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 font-medium leading-relaxed">
                    Clones all assignments and quizzes. Submissions and grading
                    will NOT be copied.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateBatchModal(false)}
                    className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-500/20 transition cursor-pointer"
                  >
                    Create & Launch Batch
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: UPDATE / EDIT EXISTING BATCH                                     */}
      {/* ========================================================================= */}
      {editingBatch && (
        <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col overflow-hidden animate-in fade-in">
          <div className="bg-white w-full h-full p-6 sm:p-8 shadow-xl flex flex-col overflow-y-auto">
            <div className="max-w-3xl mx-auto w-full py-4">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-900 font-black text-lg">
                  <Edit2 className="w-5 h-5 text-sky-600" />
                  <span>Update Batch Details</span>
                </div>
                <button
                  onClick={() => setEditingBatch(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateBatchSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Batch Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingBatch.name}
                    onChange={(e) =>
                      setEditingBatch({ ...editingBatch, name: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Event Type
                    </label>
                    <select
                      value={editingBatch.type}
                      onChange={(e) =>
                        setEditingBatch({
                          ...editingBatch,
                          type: e.target.value as "workshop" | "bootcamp",
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 bg-white"
                    >
                      <option value="workshop">⚡ Workshop</option>
                      <option value="bootcamp">🚀 Bootcamp</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Duration Label
                    </label>
                    <input
                      type="text"
                      value={editingBatch.durationLabel}
                      onChange={(e) =>
                        setEditingBatch({
                          ...editingBatch,
                          durationLabel: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    College / Institution Name
                  </label>
                  <input
                    type="text"
                    value={editingBatch.college}
                    onChange={(e) =>
                      setEditingBatch({
                        ...editingBatch,
                        college: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={editingBatch.startDate}
                      onChange={(e) =>
                        setEditingBatch({
                          ...editingBatch,
                          startDate: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={editingBatch.endDate}
                      onChange={(e) =>
                        setEditingBatch({
                          ...editingBatch,
                          endDate: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Batch Status
                  </label>
                  <select
                    value={editingBatch.status}
                    onChange={(e) =>
                      setEditingBatch({
                        ...editingBatch,
                        status: e.target.value as
                          "upcoming" | "active" | "completed",
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 bg-white"
                  >
                    <option value="active">Active (Ongoing)</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed / Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={editingBatch.description}
                    onChange={(e) =>
                      setEditingBatch({
                        ...editingBatch,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
                    <span>Zoom Meeting Link / URL (Optional)</span>
                    <span className="text-[10px] text-sky-600 font-bold lowercase">e.g. https://zoom.us/j/...</span>
                  </label>
                  <input
                    type="url"
                    value={editingBatch.zoomLink || editingBatch.zoomConfig?.meetingLink || ""}
                    onChange={(e) => {
                      const link = e.target.value;
                      const existingCfg = editingBatch.zoomConfig || settings?.zoomConfig || {
                        topic: `${editingBatch.name} Live Masterclass`,
                        instructorName: settings?.zoomConfig?.instructorName || "",
                        meetingId: "",
                        passcode: "",
                        scheduledDate: "Today",
                        scheduledTime: "10:00 AM - 01:00 PM",
                        status: "live" as const,
                        recordingUrl: "",
                        isRecordingUnlocked: true,
                      };
                      setEditingBatch({
                        ...editingBatch,
                        zoomLink: link,
                        zoomConfig: {
                          ...existingCfg,
                          meetingLink: link,
                        },
                      });
                    }}
                    placeholder="https://zoom.us/j/84920491928?pwd=..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 font-mono text-xs"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Enrolled students in this batch will see this Zoom link on their dashboard to join live classes.
                  </p>
                </div>

                {/* Batch Locked Toggle */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg ${editingBatch.isLocked ? "bg-rose-100 text-rose-600" : "bg-slate-200 text-slate-500"}`}>
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Lock Cohort Registration</span>
                      <span className="text-[10px] text-slate-500">
                        When locked, student self-registration and manual intern additions are closed.
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!editingBatch.isLocked}
                    onChange={(e) => setEditingBatch({ ...editingBatch, isLocked: e.target.checked })}
                    className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1 mt-6">
                    <Copy className="w-3.5 h-3.5" /> Clone Additional Content
                    From
                  </label>
                  <div className="relative">
                    <select
                      value={editBatchCloneId}
                      onChange={(e) => setEditBatchCloneId(e.target.value)}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 transition shadow-sm cursor-pointer"
                    >
                      <option value="none">
                        Do Not Clone Additional Content
                      </option>
                      {batches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} - {b.programType}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 font-medium leading-relaxed">
                    Select a batch to clone its Learn Hub modules into this
                    batch. This adds to existing content.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1 mt-6">
                    <Copy className="w-3.5 h-3.5" /> Clone Assignments From
                  </label>
                  <div className="relative">
                    <select
                      value={editBatchAssignmentsCloneId}
                      onChange={(e) =>
                        setEditBatchAssignmentsCloneId(e.target.value)
                      }
                      className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 transition shadow-sm cursor-pointer"
                    >
                      <option value="none">Do Not Clone Assignments</option>
                      {batches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} - {b.programType}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 font-medium leading-relaxed">
                    Select a batch to clone its assignments into this batch.
                    This adds to existing assignments.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditingBatch(null)}
                    className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-500/20 transition cursor-pointer"
                  >
                    Save Batch Updates
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL: DELETE BATCH CONFIRMATION                                       */}
      {/* ========================================================================= */}
      {deletingBatch && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 text-center animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3 border border-rose-100">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="font-black text-slate-900 text-lg mb-1">
              Delete This Batch?
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Are you sure you want to delete{" "}
              <strong className="text-slate-800">{deletingBatch.name}</strong>?
            </p>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 mb-5 text-left space-y-1">
              <div className="flex justify-between">
                <span>College:</span>
                <strong className="text-slate-800">
                  {deletingBatch.college}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Enrolled Students:</span>
                <strong className="text-rose-600">
                  {
                    students.filter((s) => s.batchId === deletingBatch.id)
                      .length
                  }{" "}
                  Students
                </strong>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingBatch(null)}
                className="w-1/2 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteBatch}
                className="w-1/2 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MODAL: FULL QR CODE & SELF-REGISTRATION FLYER (FOR ALL BATCHES)        */}
      {/* ========================================================================= */}
      {qrModalBatch && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div
            ref={printFlyerRef}
            className="bg-white rounded-2xl max-w-[340px] w-full p-3 sm:p-3.5 shadow-2xl border border-slate-100 text-center my-auto animate-in fade-in"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100 print:hidden">
              <div className="flex items-center gap-1 text-sky-600 font-black text-xs sm:text-sm">
                <QrCode className="w-3.5 h-3.5" />
                <span>Student Registration QR</span>
              </div>
              <button
                onClick={() => setQrModalBatch(null)}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Content Body */}
            <div className="space-y-1.5">
              {/* Flyer Content Header */}
              <div>
                <div className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-[8px] font-black uppercase mb-0.5">
                  <span>
                    {currentQrBatch.type === "workshop"
                      ? "⚡ Workshop"
                      : "🚀 Bootcamp"}
                  </span>
                  <span>•</span>
                  <span>{currentQrBatch.durationLabel}</span>
                </div>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                  {currentQrBatch.name}
                </h3>
                <p className="text-[10px] text-slate-500 font-medium">
                  {currentQrBatch.college}
                </p>
              </div>

              {/* Rendered QR Code */}
              <div className="p-1.5 bg-gradient-to-b from-sky-50 to-white rounded-xl border border-sky-200 inline-block shadow-2xs">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`${currentQrBatch.name} QR Code`}
                    className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-md"
                  />
                ) : (
                  <div className="w-24 h-24 flex items-center justify-center text-slate-400 font-medium text-[9px]">
                    Generating QR...
                  </div>
                )}
                <div className="mt-0.5 text-[8px] font-black text-sky-800 tracking-wider">
                  SCAN TO REGISTER INSTANTLY
                </div>
              </div>

              {/* Quick Registration Code Badge */}
              <div className="flex items-center justify-center gap-1 text-[10px]">
                <span className="text-slate-500 font-medium">
                  Passcode:
                </span>
                <span className="font-mono font-black text-[11px] text-sky-800 bg-sky-100 px-1.5 py-0.2 rounded border border-sky-200">
                  {currentQrBatch.registrationCode ||
                    `M2I-${currentQrBatch.id.slice(0, 4)}`}
                </span>
              </div>

              {currentQrBatch.isLocked && (
                <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-center text-[10px] font-bold flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 flex-shrink-0 text-rose-600" />
                  <span>Registration is currently closed (Cohort Locked)</span>
                </div>
              )}

              {/* Host Target Selector for Mobile vs Localhost */}
              <div className="p-1 bg-slate-50 rounded-lg border border-slate-200 text-[9px] text-left">
                <div className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => setHostMode("network")}
                    className={`py-1 px-1 rounded-md font-bold text-[9px] transition flex items-center justify-center gap-1 cursor-pointer ${
                      hostMode === "network"
                        ? "bg-indigo-600 text-white shadow-2xs"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <span>📱 Wi-Fi</span>
                    <span className="text-[7.5px] opacity-80 font-mono">({networkHost || "192.168.1.18"})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHostMode("localhost")}
                    className={`py-1 px-1 rounded-md font-bold text-[9px] transition flex items-center justify-center gap-1 cursor-pointer ${
                      hostMode === "localhost"
                        ? "bg-indigo-600 text-white shadow-2xs"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <span>💻 Localhost</span>
                  </button>
                </div>
              </div>

              {/* Copy Registration Link */}
              <div className="p-1 bg-slate-50 rounded-lg border border-slate-200 text-[9px] font-mono text-slate-600 flex items-center justify-between gap-1 print:hidden">
                <span className="truncate text-[9px]">
                  {getEffectiveRegistrationUrl(currentQrBatch.id)}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyLink(currentQrBatch.id)}
                  className="px-1.5 py-0.5 bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-700 font-sans font-bold text-[9px] flex items-center gap-0.5 shadow-2xs transition cursor-pointer flex-shrink-0"
                >
                  {copiedLink ? (
                    <Check className="w-2 h-2 text-emerald-600" />
                  ) : (
                    <Copy className="w-2 h-2" />
                  )}
                  <span>{copiedLink ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* Fixed Action Bar Footer */}
            <div className="grid grid-cols-3 gap-1 pt-1.5 mt-1 border-t border-slate-100 flex-shrink-0 print:hidden">
              <button
                type="button"
                onClick={() => handleDownloadQrImage(currentQrBatch)}
                className="py-1 px-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] font-bold transition flex items-center justify-center gap-0.5 cursor-pointer"
              >
                <Download className="w-2.5 h-2.5" />
                <span>Save</span>
              </button>

              <button
                type="button"
                onClick={handlePrintFlyer}
                className="py-1 px-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] font-bold transition flex items-center justify-center gap-0.5 cursor-pointer"
              >
                <Printer className="w-2.5 h-2.5" />
                <span>Print</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setQrModalBatch(null);
                  onOpenSelfRegisterPortal(currentQrBatch.id);
                }}
                className="py-1 px-1 bg-sky-500 hover:bg-sky-600 text-white rounded-md text-[10px] font-bold shadow-xs shadow-sky-500/20 transition flex items-center justify-center gap-0.5 cursor-pointer"
              >
                <ExternalLink className="w-2.5 h-2.5" />
                <span>Preview</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. MANUAL ADD STUDENT MODAL                               */}
      {/* ========================================================= */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-5 shadow-2xl border border-slate-100 my-auto animate-in fade-in">
            {/* Pinned Header */}
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100 flex-shrink-0">
              <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-sky-600" />
                <span>Add Student Manually</span>
              </h3>
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* 2-Column Compact Grid Form */}
            <form onSubmit={handleManualAddSubmit} className="space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="e.g. Alex Johnson"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5">
                    Email ID (Username) *
                  </label>
                  <input
                    type="email"
                    required
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    placeholder="alex@university.edu"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    value={manualMobile}
                    onChange={(e) => setManualMobile(e.target.value)}
                    placeholder="+1 (555) 012-3456"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5">
                    College Name
                  </label>
                  <input
                    type="text"
                    value={manualCollege}
                    onChange={(e) => setManualCollege(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5">
                    Branch
                  </label>
                  <input
                    type="text"
                    value={manualBranch}
                    onChange={(e) => setManualBranch(e.target.value)}
                    placeholder="CSE, ECE, AI/ML"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5">
                      City
                    </label>
                    <input
                      type="text"
                      value={manualCity}
                      onChange={(e) => setManualCity(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5">
                      State
                    </label>
                    <input
                      type="text"
                      value={manualState}
                      onChange={(e) => setManualState(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>

              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-700 font-bold block text-[10px]">Auto-Assigned Password:</span>
                  <span className="text-[9px] text-slate-400">System Default Setting</span>
                </div>
                <span className="font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-[11px] shadow-2xs">
                  {settings?.defaultStudentPassword || "student123"}
                </span>
              </div>

              {/* Fixed Footer */}
              <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-slate-100 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
                >
                  Save & Enroll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 9. CSV BULK UPLOAD MODAL                                  */}
      {/* ========================================================= */}
      {showCsvModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col my-auto animate-in fade-in">
            {/* Pinned Header */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-2 text-sky-600 font-black text-base sm:text-lg">
                <FileSpreadsheet className="w-5 h-5" />
                <span>Bulk Add Students via CSV</span>
              </div>
              <button
                onClick={() => setShowCsvModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="overflow-y-auto pr-1 flex-1 space-y-3 py-1">
              <p className="text-xs text-slate-500">
                Upload a standard CSV file with headers:{" "}
                <code className="bg-slate-100 px-1 py-0.5 rounded text-sky-700 font-mono font-bold">
                  Name, Email, Mobile, College, Branch, City, State, Default Password
                </code>
                . If Default Password is not provided, the system default setting will be used.
              </p>

              <div className="p-5 border-2 border-dashed border-slate-200 hover:border-sky-400 rounded-2xl text-center bg-slate-50/50 transition">
                <Upload className="w-7 h-7 text-sky-500 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-slate-700 mb-1">
                  Choose CSV File or drag and drop
                </p>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleCsvFileUpload}
                  className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 cursor-pointer"
                />
              </div>

              {parsedCsvCount !== null && (
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Parsed {parsedCsvCount} students ready for batch enrollment.</span>
                </div>
              )}
            </div>

            {/* Fixed Footer */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 flex-shrink-0 mt-2">
              <button
                type="button"
                onClick={() => setShowCsvModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={!csvContent}
                onClick={handleProcessCsvSubmit}
                className="px-5 py-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
              >
                Import & Enroll All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 10. EDIT STUDENT MODAL                                     */}
      {/* ========================================================= */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col my-auto animate-in fade-in">
            {/* Pinned Header */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 flex-shrink-0">
              <h3 className="font-black text-slate-900 text-base sm:text-lg">
                Edit Student Profile
              </h3>
              <button
                onClick={() => setEditingStudent(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="overflow-y-auto pr-1 flex-1 space-y-3 py-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={editingStudent.name}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Email ID *
                </label>
                <input
                  type="email"
                  value={editingStudent.email}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      email: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Mobile Number
                </label>
                <input
                  type="text"
                  value={editingStudent.mobile}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      mobile: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  College Name
                </label>
                <input
                  type="text"
                  value={editingStudent.college || ""}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      college: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Branch
                </label>
                <input
                  type="text"
                  value={editingStudent.branch || ""}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      branch: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={editingStudent.city || ""}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        city: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={editingStudent.state || ""}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        state: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Password
                </label>
                <input
                  type="text"
                  value={editingStudent.password || ""}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      password: e.target.value,
                    })
                  }
                  placeholder="Leave blank to keep unchanged"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 flex-shrink-0 mt-2">
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onEditStudent(editingStudent);
                  setEditingStudent(null);
                }}
                className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
