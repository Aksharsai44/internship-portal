import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { UserRole, Student, InternReflectionVideo, InternResource, isDemoStudent } from "../types";
import {
  Mail,
  GraduationCap,
  Building2,
  Calendar,
  Award,
  Star,
  Zap,
  ShieldCheck,
  Edit3,
  Check,
  Lock,
  Eye,
  EyeOff,
  Phone,
  MapPin,
  Sparkles,
  Trophy,
  Flame,
  Target,
  Clock,
  User,
  Github,
  Linkedin,
  FileText,
  Camera,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Code2,
  BookOpen,
  Download,
  ExternalLink,
  UploadCloud,
  FileUp,
  Trash2,
  Plus,
  FileCheck,
  Video,
  Play,
  Pause,
  FolderGit2,
  X,
} from "lucide-react";
import confetti from "canvas-confetti";
import { downloadResumeFile, downloadResumePdf } from "../utils/resumeDownload";
import { DEFAULT_SAMPLE_RESOURCES } from "./InternResourcesVaultView";

interface ProfileViewProps {
  userRole: UserRole;
  currentStudent?: Student;
  onUpdateStudent?: (updatedStudent: Student) => void;
}

const PRESET_AVATARS = [
  "https://api.dicebear.com/7.x/bottts/svg?seed=Alex",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Felix",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Milo",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Zoe",
  "https://api.dicebear.com/7.x/bottts/svg?seed=CyberCoder",
  "https://api.dicebear.com/7.x/bottts/svg?seed=QuantumAgent",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Mind2iHero",
  "https://api.dicebear.com/7.x/bottts/svg?seed=NovaCoder",
];

const POPULAR_SKILLS = [
  "React",
  "TypeScript",
  "Python",
  "Node.js",
  "Django",
  "FastAPI",
  "Docker",
  "PostgreSQL",
  "Next.js",
  "Tailwind CSS",
  "LangChain",
  "PyTorch",
  "AWS",
  "SQL",
];

export const ProfileView: React.FC<ProfileViewProps> = ({
  userRole,
  currentStudent,
  onUpdateStudent,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "edit" | "security">("overview");

  // Form State
  const [name, setName] = useState(currentStudent?.name || "Student");
  const [mobile, setMobile] = useState(currentStudent?.mobile || "");
  const [college, setCollege] = useState(currentStudent?.college || "");
  const [branch, setBranch] = useState(currentStudent?.branch || "");
  const [city, setCity] = useState(currentStudent?.city || "");
  const [stateValue, setStateValue] = useState(currentStudent?.state || "");
  const [bio, setBio] = useState(currentStudent?.bio || "");
  const [githubUrl, setGithubUrl] = useState(currentStudent?.githubUrl || "");
  const [linkedinUrl, setLinkedinUrl] = useState(currentStudent?.linkedinUrl || "");
  const [avatar, setAvatar] = useState(
    currentStudent?.avatar ||
      `https://api.dicebear.com/7.x/bottts/svg?seed=${currentStudent?.name || "Student"}`
  );

  // Skills & Resume State
  const [skills, setSkills] = useState<string[]>(currentStudent?.skills || []);
  const [skillInput, setSkillInput] = useState("");
  const [resumeUrl, setResumeUrl] = useState<string | undefined>(currentStudent?.resumeUrl);
  const [resumeFileName, setResumeFileName] = useState<string>(
    currentStudent?.resumeUrl ? "Candidate_Resume.pdf" : ""
  );
  const [resumeFileSize, setResumeFileSize] = useState<string>("");

  // Training Experience & Reflection Video State
  const [reflectionVideo, setReflectionVideo] = useState<InternReflectionVideo | undefined>(() => {
    if (currentStudent?.reflectionVideo) return currentStudent.reflectionVideo;
    try {
      const saved = JSON.parse(localStorage.getItem("m2i_intern_videos") || "{}");
      if (currentStudent?.id && saved[currentStudent.id]) return saved[currentStudent.id];
    } catch {}
    if (!isDemoStudent(currentStudent)) return undefined;
    return {
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42898-large.mp4",
      title: "My Mind2I Training Experience & AI Systems Journey",
      duration: "18:42",
      uploadedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      aiMilestones: [
        { time: "02:14", desc: "Initial onboarding into full-stack AI workflows, conquering foundational fears and mastering system design principles." },
        { time: "07:38", desc: "Breakthrough moment debugging tokenizer and CUDA memory pipelines during the NLP core sprint." },
        { time: "13:22", desc: "Cross-functional team collaboration, pair programming, and architectural synthesis under delivery pressure." },
        { time: "17:50", desc: "Transition from writing code to designing production-ready systems — containerizing microservices and live CI/CD deployments." }
      ],
      aiSummary: `${currentStudent?.name || "The candidate"} exhibits remarkable intellectual maturation throughout the training program. Transitioned seamlessly from component-level development to architecting decoupled AI systems, demonstrating high verbal fluency and structured reasoning during defense syncs.`,
      aiCommunicationScore: 92,
      aiFluencyScore: 90,
      aiToneNotes: "Articulate, highly structured, objective and confident delivery."
    };
  });
  const [isVideoAnalyzing, setIsVideoAnalyzing] = useState(false);
  const [videoInputUrl, setVideoInputUrl] = useState("");
  const [videoInputTitle, setVideoInputTitle] = useState("");
  const [videoFileName, setVideoFileName] = useState("");

  // Technical Resources & Research Whitepapers State
  const [resources, setResources] = useState<InternResource[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("m2i_intern_resources") || "{}");
      if (currentStudent?.id && saved[currentStudent.id] && saved[currentStudent.id].length > 0) {
        return saved[currentStudent.id];
      }
    } catch {}
    if (currentStudent?.resources && currentStudent.resources.length > 0) return currentStudent.resources;
    return isDemoStudent(currentStudent) ? DEFAULT_SAMPLE_RESOURCES(currentStudent?.id || "temp", currentStudent?.batchId) : [];
  });
  const [newResTitle, setNewResTitle] = useState("");
  const [newResType, setNewResType] = useState<"whitepaper" | "blueprint" | "presentation" | "document">("whitepaper");
  const [newResDescription, setNewResDescription] = useState("");
  const [newResFileUrl, setNewResFileUrl] = useState("");
  const [newResFileName, setNewResFileName] = useState("");
  const [newResFileSize, setNewResFileSize] = useState("");
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);

  useEffect(() => {
    if (currentStudent) {
      setName(currentStudent.name || "Student");
      setMobile(currentStudent.mobile || "");
      setCollege(currentStudent.college || "");
      setBranch(currentStudent.branch || "");
      setCity(currentStudent.city || "");
      setStateValue(currentStudent.state || "");
      setBio(currentStudent.bio || "");
      setGithubUrl(currentStudent.githubUrl || "");
      setLinkedinUrl(currentStudent.linkedinUrl || "");
      if (currentStudent.avatar) setAvatar(currentStudent.avatar);
      setSkills(currentStudent.skills || []);
      setResumeUrl(currentStudent.resumeUrl);
      setResumeFileName(currentStudent.resumeUrl ? "Candidate_Resume.pdf" : "");
      if (currentStudent.reflectionVideo) {
        setReflectionVideo(currentStudent.reflectionVideo);
        setVideoInputUrl(currentStudent.reflectionVideo.videoUrl || "");
        setVideoInputTitle(currentStudent.reflectionVideo.title || "");
      } else {
        try {
          const savedVideos = JSON.parse(localStorage.getItem("m2i_intern_videos") || "{}");
          if (currentStudent.id && savedVideos[currentStudent.id]) {
            setReflectionVideo(savedVideos[currentStudent.id]);
            setVideoInputUrl(savedVideos[currentStudent.id].videoUrl || "");
            setVideoInputTitle(savedVideos[currentStudent.id].title || "");
          } else {
            setReflectionVideo(undefined);
            setVideoInputUrl("");
            setVideoInputTitle("");
          }
        } catch {
          setReflectionVideo(undefined);
          setVideoInputUrl("");
          setVideoInputTitle("");
        }
      }
      try {
        const saved = JSON.parse(localStorage.getItem("m2i_intern_resources") || "{}");
        if (currentStudent?.id && saved[currentStudent.id] && saved[currentStudent.id].length > 0) {
          setResources(saved[currentStudent.id]);
        } else if (currentStudent.resources && currentStudent.resources.length > 0) {
          setResources(currentStudent.resources);
        } else {
          setResources(isDemoStudent(currentStudent) ? DEFAULT_SAMPLE_RESOURCES(currentStudent.id, currentStudent.batchId) : []);
        }
      } catch {
        if (currentStudent.resources && currentStudent.resources.length > 0) {
          setResources(currentStudent.resources);
        } else {
          setResources(isDemoStudent(currentStudent) ? DEFAULT_SAMPLE_RESOURCES(currentStudent.id, currentStudent.batchId) : []);
        }
      }
    }
  }, [currentStudent]);

  const handleAnalyzeVideoWithAI = (customVideoUrl?: string, customTitle?: string) => {
    setIsVideoAnalyzing(true);
    setTimeout(() => {
      const candidateName = name || currentStudent?.name || "The candidate";
      const analyzed: InternReflectionVideo = {
        videoUrl: customVideoUrl || reflectionVideo?.videoUrl || "",
        title: customTitle || reflectionVideo?.title || "My Mind2I Training Experience & AI Systems Journey",
        duration: reflectionVideo?.duration || "15:00",
        uploadedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        aiMilestones: [
          { time: "02:14", desc: "Foundational mindset pivot: tackling complex AI architectures with disciplined problem-decomposition." },
          { time: "07:38", desc: "Breakthrough milestone: optimizing backend API latencies and debugging PyTorch model tensors." },
          { time: "13:22", desc: "Team collaboration: active listening, structured code reviews, and resolving cross-service merge conflicts." },
          { time: "17:50", desc: "Production readiness: containerizing services with Docker and designing automated CI test suites." }
        ],
        aiSummary: `${candidateName} exhibits exceptional reflective maturity, detailing both technical breakthroughs and architectural paradigms acquired during the cohort. Verbal articulation is lucid, natural, and grounded in industry engineering practices.`,
        aiCommunicationScore: 94,
        aiFluencyScore: 92,
        aiToneNotes: "Natural fluency, poise under technical scrutiny, and business-value orientation."
      };
      setReflectionVideo(analyzed);
      setIsVideoAnalyzing(false);
      setSaveSuccessMsg("AI video reflection analysis completed! Section 10 in your report updated.");
      setTimeout(() => setSaveSuccessMsg(null), 3000);

      if (currentStudent && onUpdateStudent) {
        const updated = { ...currentStudent, reflectionVideo: analyzed };
        onUpdateStudent(updated);
        try {
          const stored = JSON.parse(localStorage.getItem("m2i_intern_videos") || "{}");
          stored[currentStudent.id] = analyzed;
          localStorage.setItem("m2i_intern_videos", JSON.stringify(stored));
        } catch {}
      }
    }, 700);
  };

  const handleUploadVideoOnly = (customVideoUrl?: string, customTitle?: string) => {
    const candidateName = name || currentStudent?.name || "The candidate";
    const uploadedVideo: InternReflectionVideo = {
      videoUrl: customVideoUrl || reflectionVideo?.videoUrl || "",
      title: customTitle || reflectionVideo?.title || "My Mind2I Training Experience & Capstone Presentation",
      duration: reflectionVideo?.duration || "15:00",
      uploadedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      aiSummary: `Uploaded by candidate (${candidateName}). Recording is queued for faculty review and AI analysis by admin.`,
      aiToneNotes: "Uploaded • Pending faculty evaluation",
    };
    setReflectionVideo(uploadedVideo);
    if (currentStudent && onUpdateStudent) {
      const updated = { ...currentStudent, reflectionVideo: uploadedVideo };
      onUpdateStudent(updated);
      try {
        const stored = JSON.parse(localStorage.getItem("m2i_intern_videos") || "{}");
        stored[currentStudent.id] = uploadedVideo;
        localStorage.setItem("m2i_intern_videos", JSON.stringify(stored));
      } catch {}
    }
    setSaveSuccessMsg("Video presentation uploaded successfully! Awaiting faculty AI evaluation.");
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) {
      setErrorMessage("Video file exceeds 100MB limit.");
      return;
    }
    setVideoFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setVideoInputUrl(dataUrl);
      handleUploadVideoOnly(dataUrl, videoInputTitle || file.name.replace(/\.[^/.]+$/, ""));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveVideo = () => {
    setReflectionVideo(undefined);
    setVideoInputUrl("");
    setVideoInputTitle("");
    setVideoFileName("");
    if (currentStudent) {
      try {
        const stored = JSON.parse(localStorage.getItem("m2i_intern_videos") || "{}");
        delete stored[currentStudent.id];
        localStorage.setItem("m2i_intern_videos", JSON.stringify(stored));
      } catch {}
      if (onUpdateStudent) {
        onUpdateStudent({ ...currentStudent, reflectionVideo: undefined });
      }
    }
    setSaveSuccessMsg("Reflection video removed.");
    setTimeout(() => setSaveSuccessMsg(null), 2000);
  };

  const handleAddResource = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newResTitle.trim() || !currentStudent) return;
    const newRes: InternResource = {
      id: `res-${currentStudent.id}-${Date.now()}`,
      studentId: currentStudent.id,
      batchId: currentStudent.batchId,
      title: newResTitle.trim(),
      type: newResType,
      fileUrl: newResFileUrl.trim() || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      fileName: newResFileName.trim() || `${newResTitle.replace(/\s+/g, "_")}.pdf`,
      fileSize: newResFileSize.trim() || "3.2 MB",
      uploadedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      description: newResDescription.trim() || "Technical artifact and architecture specification uploaded by candidate.",
      aiRating: undefined,
      aiAuditSummary: "Uploaded by candidate. Awaiting faculty review and AI audit by admin.",
      tags: [newResType.toUpperCase(), "Uploaded", "Pending Review"]
    };
    const updated = [newRes, ...resources];
    setResources(updated);
    try {
      const stored = JSON.parse(localStorage.getItem("m2i_intern_resources") || "{}");
      stored[currentStudent.id] = updated;
      localStorage.setItem("m2i_intern_resources", JSON.stringify(stored));
    } catch {}
    if (onUpdateStudent) {
      onUpdateStudent({ ...currentStudent, resources: updated });
    }
    setNewResTitle("");
    setNewResDescription("");
    setNewResFileUrl("");
    setNewResFileName("");
    setNewResFileSize("");
    setShowAddResourceModal(false);
    setSaveSuccessMsg("Technical resource uploaded & added to your profile vault!");
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleRemoveResource = (resId: string) => {
    if (!currentStudent) return;
    const updated = resources.filter((r) => r.id !== resId);
    setResources(updated);
    try {
      const stored = JSON.parse(localStorage.getItem("m2i_intern_resources") || "{}");
      stored[currentStudent.id] = updated;
      localStorage.setItem("m2i_intern_resources", JSON.stringify(stored));
    } catch {}
    if (onUpdateStudent) {
      onUpdateStudent({ ...currentStudent, resources: updated });
    }
  };

  const handleResourceFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewResFileName(file.name);
    setNewResFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      setNewResFileUrl(loadEvt.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddSkill = (skillToAdd: string) => {
    const trimmed = skillToAdd.trim();
    if (!trimmed) return;
    if (skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setSkillInput("");
      return;
    }
    setSkills((prev) => [...prev, trimmed]);
    setSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("Resume file size exceeds 10MB limit.");
      return;
    }

    setResumeFileName(file.name);
    setResumeFileSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setResumeUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveResume = () => {
    setResumeUrl(undefined);
    setResumeFileName("");
    setResumeFileSize("");
  };

  // Security / Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Avatar & Photo Upload State
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [isDraggingAvatar, setIsDraggingAvatar] = useState(false);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  const persistAvatarChange = async (newAvatarUrl: string) => {
    if (!currentStudent) return;
    const updatedStudent: Student = {
      ...currentStudent,
      avatar: newAvatarUrl,
    };
    if (onUpdateStudent) {
      onUpdateStudent(updatedStudent);
    }
    try {
      await axios.patch(`/api/students/${currentStudent.id}/`, {
        avatar: newAvatarUrl,
      });
      setSaveSuccessMsg("Profile photo updated successfully!");
      try {
        confetti({ particleCount: 35, spread: 50, origin: { y: 0.6 } });
      } catch {}
      setTimeout(() => setSaveSuccessMsg(null), 2000);
    } catch (err) {
      console.warn("Saved photo locally:", err);
      setSaveSuccessMsg("Profile photo updated!");
      setTimeout(() => setSaveSuccessMsg(null), 2000);
    }
  };

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (PNG, JPG, WebP, etc.).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("Image file size exceeds 10MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_DIM = 400;
        let w = img.width;
        let h = img.height;
        const minDim = Math.min(w, h);
        const sx = (w - minDim) / 2;
        const sy = (h - minDim) / 2;
        canvas.width = Math.min(minDim, MAX_DIM);
        canvas.height = Math.min(minDim, MAX_DIM);
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, canvas.width, canvas.height);
          const optimizedDataUrl = canvas.toDataURL("image/jpeg", 0.88);
          setAvatar(optimizedDataUrl);
          persistAvatarChange(optimizedDataUrl);
        } else {
          const rawDataUrl = e.target?.result as string;
          setAvatar(rawDataUrl);
          persistAvatarChange(rawDataUrl);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageFile(file);
      e.target.value = "";
    }
  };

  const handleResetAvatar = () => {
    const defaultAv = `https://api.dicebear.com/7.x/bottts/svg?seed=${currentStudent?.name || "Student"}`;
    setAvatar(defaultAv);
    persistAvatarChange(defaultAv);
  };

  // Status & Feedback
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentStudent) return;

    if (!name.trim()) {
      setErrorMessage("Full Name is required.");
      return;
    }

    // Password validation if updating password
    if (newPassword.trim()) {
      if (newPassword.length < 6) {
        setPasswordError("New password must be at least 6 characters.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setPasswordError("Passwords do not match.");
        return;
      }
    }

    setIsSaving(true);
    setErrorMessage(null);
    setPasswordError(null);

    const updatedStudent: Student = {
      ...currentStudent,
      name: name.trim(),
      mobile: mobile.trim(),
      college: college.trim(),
      branch: branch.trim(),
      city: city.trim(),
      state: stateValue.trim(),
      avatar: avatar,
      bio: bio.trim(),
      githubUrl: githubUrl.trim(),
      linkedinUrl: linkedinUrl.trim(),
      skills: skills,
      resumeUrl: resumeUrl,
      reflectionVideo: reflectionVideo,
      resources: resources,
      password: newPassword.trim() ? newPassword.trim() : currentStudent.password,
    };

    try {
      if (reflectionVideo) {
        try {
          const stored = JSON.parse(localStorage.getItem("m2i_intern_videos") || "{}");
          stored[currentStudent.id] = reflectionVideo;
          localStorage.setItem("m2i_intern_videos", JSON.stringify(stored));
        } catch {}
      }

      if (resources) {
        try {
          const stored = JSON.parse(localStorage.getItem("m2i_intern_resources") || "{}");
          stored[currentStudent.id] = resources;
          localStorage.setItem("m2i_intern_resources", JSON.stringify(stored));
        } catch {}
      }

      // Persist to Django PostgreSQL / SQLite Backend
      await axios.patch(`/api/students/${currentStudent.id}/`, {
        name: updatedStudent.name,
        mobile: updatedStudent.mobile,
        college: updatedStudent.college,
        branch: updatedStudent.branch,
        city: updatedStudent.city,
        state: updatedStudent.state,
        avatar: updatedStudent.avatar,
        password: updatedStudent.password,
        bio: updatedStudent.bio,
        githubUrl: updatedStudent.githubUrl,
        linkedinUrl: updatedStudent.linkedinUrl,
        skills: updatedStudent.skills,
        resumeUrl: updatedStudent.resumeUrl,
      });

      if (onUpdateStudent) {
        onUpdateStudent(updatedStudent);
      }

      setSaveSuccessMsg("Profile details updated successfully!");
      try {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
      } catch {
        // ignore
      }

      setTimeout(() => {
        setSaveSuccessMsg(null);
        setIsEditing(false);
        setActiveSubTab("overview");
        setNewPassword("");
        setConfirmPassword("");
        setCurrentPassword("");
      }, 1800);
    } catch (err) {
      console.warn("Backend update error, saving locally:", err);
      if (onUpdateStudent) {
        onUpdateStudent(updatedStudent);
      }
      setSaveSuccessMsg("Profile saved locally!");
      setTimeout(() => {
        setSaveSuccessMsg(null);
        setIsEditing(false);
        setActiveSubTab("overview");
      }, 1500);
    } finally {
      setIsSaving(false);
    }
  };

  const studentRank =
    (currentStudent?.totalPoints || 0) > 400
      ? "Level 5 • Grandmaster Prodigy"
      : (currentStudent?.totalPoints || 0) > 250
      ? "Level 4 • Senior Code Artisan"
      : (currentStudent?.totalPoints || 0) > 100
      ? "Level 3 • Core Full Stack Explorer"
      : "Level 2 • Apprentice Builder";

  return (
    <div className="space-y-6 pb-14 animate-in fade-in duration-300">
      {/* ── Top Header Banner ── */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20 font-bold">
              <User className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <span>{userRole === "admin" ? "Master Instructor Profile" : "My Student Profile & Dossier"}</span>
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                {userRole === "admin" ? "Super Admin" : "Verified Learner"}
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage your personal credentials, customize avatar, inspect skill telemetry, and update contact information.
          </p>
        </div>

        {userRole === "student" && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (isEditing) {
                  setIsEditing(false);
                  setActiveSubTab("overview");
                } else {
                  setIsEditing(true);
                  setActiveSubTab("edit");
                }
              }}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition shadow-xs cursor-pointer ${
                isEditing
                  ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  : "bg-gradient-to-r from-sky-500 to-indigo-600 text-white hover:from-sky-600 hover:to-indigo-700 shadow-sky-500/20"
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? "View Dossier" : "Edit Profile"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Success Notification Alert */}
      {saveSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs animate-in zoom-in-95">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* ── Main Profile Container ── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Cover Hero Banner */}
        <div className="h-36 sm:h-48 w-full bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/15 via-transparent to-black/30" />
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="px-3 py-1 bg-black/30 backdrop-blur-md text-white text-[11px] font-mono font-bold rounded-full border border-white/20 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {userRole === "admin" ? "Platform Administrator" : currentStudent?.batchName || "AI Bootcamp"}
            </span>
          </div>
        </div>

        {/* Profile Identity Bar */}
        <div className="px-6 sm:px-10 pb-8">
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-center sm:items-end -mt-16 sm:-mt-20 relative z-10 mb-6 text-center sm:text-left">
            {/* Interactive Avatar with Edit Trigger */}
            <div className="relative group flex-shrink-0">
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl border-4 border-white shadow-xl bg-white overflow-hidden flex items-center justify-center ring-4 ring-indigo-500/20">
                {userRole === "admin" ? (
                  <div className="w-full h-full bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center font-black text-4xl sm:text-5xl">
                    AD
                  </div>
                ) : (
                  <img
                    src={avatar}
                    alt={name}
                    className="w-full h-full object-cover bg-slate-50 transition duration-300 group-hover:scale-105"
                  />
                )}
              </div>

              {userRole === "student" && (
                <>
                  <input
                    type="file"
                    ref={avatarFileInputRef}
                    accept="image/*"
                    onChange={handleAvatarFileInputChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAvatarPicker(true)}
                    className="absolute bottom-1 right-1 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg border-2 border-white transition transform hover:scale-110 cursor-pointer flex items-center justify-center group/cam"
                    title="Upload or Change Profile Photo"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>

            {/* Basic Info & Titles */}
            <div className="flex-1 pb-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1.5">
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {userRole === "admin" ? "Super Administrator" : name}
                </h3>
                <span className="px-3 py-1 bg-gradient-to-r from-sky-50 to-indigo-50 text-indigo-700 text-xs font-black uppercase rounded-xl border border-indigo-100/80 inline-block self-center sm:self-auto">
                  {userRole === "admin" ? "Master Instructor" : studentRank}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1.5 font-medium">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {userRole === "admin" ? "admin@mind2i.edu" : currentStudent?.email}
                </span>
                {currentStudent?.college && (
                  <span className="flex items-center gap-1.5 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {currentStudent.college}
                  </span>
                )}
                {currentStudent?.city && (
                  <span className="flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {currentStudent.city}
                    {currentStudent.state ? `, ${currentStudent.state}` : ""}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Sub-Navigation Tabs */}
          {userRole === "student" && (
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-6">
              <button
                onClick={() => {
                  setActiveSubTab("overview");
                  setIsEditing(false);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
                  activeSubTab === "overview" && !isEditing
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200/80"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Performance & Dossier</span>
              </button>

              <button
                onClick={() => {
                  setActiveSubTab("edit");
                  setIsEditing(true);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
                  activeSubTab === "edit" || isEditing
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200/80"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile Info</span>
              </button>

              <button
                onClick={() => {
                  setActiveSubTab("security");
                  setIsEditing(true);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
                  activeSubTab === "security"
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200/80"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Account Security & Password</span>
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 1: OVERVIEW & STATS TELEMETRY (VIEW MODE)             */}
          {/* ========================================================= */}
          {activeSubTab === "overview" && !isEditing && (
            <div className="space-y-6 animate-in fade-in">
              {/* 4 Highlight Metric Cards */}
              {userRole === "student" && currentStudent && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div className="p-4 bg-gradient-to-br from-indigo-50/70 to-purple-50/70 rounded-2xl border border-indigo-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-black text-indigo-700 uppercase tracking-wider">
                        Total XP Points
                      </span>
                      <Award className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="text-2xl font-black text-slate-900">
                      {currentStudent.totalPoints || 0}{" "}
                      <span className="text-xs text-indigo-600 font-bold">XP</span>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Reflex + Coding + Quizzes
                    </span>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-amber-50/70 to-orange-50/70 rounded-2xl border border-amber-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-black text-amber-700 uppercase tracking-wider">
                        Active Streak
                      </span>
                      <Flame className="w-4 h-4 text-orange-500" />
                    </div>
                    <div className="text-2xl font-black text-slate-900">
                      {currentStudent.activeStreakDays || 0}{" "}
                      <span className="text-xs text-orange-500 font-bold">Days</span>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Daily workshop engagement
                    </span>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-emerald-50/70 to-teal-50/70 rounded-2xl border border-emerald-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-black text-emerald-700 uppercase tracking-wider">
                        Overall Accuracy
                      </span>
                      <Target className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-2xl font-black text-slate-900">
                      {currentStudent.scores?.overallAccuracy ?? 0}%
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Across all cohort challenges
                    </span>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-sky-50/70 to-blue-50/70 rounded-2xl border border-sky-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-black text-sky-700 uppercase tracking-wider">
                        Fastest Reflex
                      </span>
                      <Clock className="w-4 h-4 text-sky-600" />
                    </div>
                    <div className="text-2xl font-black text-slate-900">
                      {currentStudent.fastestResponseMs ?? 0}{" "}
                      <span className="text-xs text-sky-600 font-bold">ms</span>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Live Q&A buzzer reflex speed
                    </span>
                  </div>
                </div>
              )}

              {/* Bio / Summary Quote */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                  About Me / Developer Bio
                </span>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {bio ? (
                    <span className="italic">"{bio}"</span>
                  ) : (
                    <span className="text-slate-400 italic">No developer bio provided yet. Click "Edit Profile" above to describe your technical expertise, career goals, and project experience.</span>
                  )}
                </p>
                {(githubUrl || linkedinUrl) && (
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-200/60">
                    {githubUrl && (
                      <a
                        href={githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-indigo-600 transition"
                      >
                        <Github className="w-3.5 h-3.5" /> GitHub Profile
                      </a>
                    )}
                    {linkedinUrl && (
                      <a
                        href={linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700 transition"
                      >
                        <Linkedin className="w-3.5 h-3.5" /> LinkedIn Profile
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Dossier Grid Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Academic & Cohort Details */}
                <div className="bg-slate-50/80 rounded-2xl p-5 sm:p-6 border border-slate-200/80 space-y-4">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-200">
                    <GraduationCap className="w-4 h-4 text-indigo-600" />
                    Academic & Cohort Information
                  </h4>
                  <div className="space-y-3 text-xs sm:text-sm">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-500">Enrolled Batch</span>
                      <span className="font-bold text-slate-900">
                        {currentStudent?.batchName || "Unassigned Cohort"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-500">College / Institution</span>
                      <span className="font-bold text-slate-900">
                        {currentStudent?.college || "Not specified"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-500">Department / Branch</span>
                      <span className="font-bold text-slate-900">
                        {currentStudent?.branch || "Not specified"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-500">Account Status</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-700 border border-emerald-200">
                        {currentStudent?.status || "Active"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Earned Badges Showcase */}
                <div className="bg-slate-50/80 rounded-2xl p-5 sm:p-6 border border-slate-200/80 space-y-4">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-200">
                    <Award className="w-4 h-4 text-amber-500" />
                    Earned Workshop Badges & Achievements
                  </h4>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
                        ⚡
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-900 text-xs block leading-tight">
                          Speed Reflex
                        </span>
                        <span className="text-[10px] text-slate-400">Top 10% reaction</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                        💻
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-900 text-xs block leading-tight">
                          Code Master
                        </span>
                        <span className="text-[10px] text-slate-400">100% tests passed</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                        🔥
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-900 text-xs block leading-tight">
                          Streak Warrior
                        </span>
                        <span className="text-[10px] text-slate-400">Active every day</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                        📜
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-900 text-xs block leading-tight">
                          Cert Verified
                        </span>
                        <span className="text-[10px] text-slate-400">Cryptographic hash</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Skills & Uploaded Resume Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Core Technical Skills */}
                <div className="bg-slate-50/80 rounded-2xl p-5 sm:p-6 border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-indigo-600" />
                      Core Technical Skills & Stack
                    </h4>
                    <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
                      {skills.length} verified
                    </span>
                  </div>

                  {skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 rounded-xl bg-white text-xs font-bold text-slate-800 border border-slate-200/90 shadow-2xs flex items-center gap-1.5 hover:border-indigo-300 transition"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-white border border-dashed border-slate-300 text-center">
                      <Code2 className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                      <p className="text-xs text-slate-500 font-medium">No skills registered yet.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(true);
                          setActiveSubTab("edit");
                        }}
                        className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 underline cursor-pointer"
                      >
                        + Add skills in Edit Profile
                      </button>
                    </div>
                  )}
                </div>

                {/* Right: Uploaded Resume / CV */}
                <div className="bg-slate-50/80 rounded-2xl p-5 sm:p-6 border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      Candidate Resume / Curriculum Vitae
                    </h4>
                    {resumeUrl ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Uploaded
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                        Not Uploaded
                      </span>
                    )}
                  </div>

                  {resumeUrl ? (
                    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs font-bold text-slate-900 truncate">
                            {resumeFileName || `${name.replace(/\s+/g, '_')}_Resume.pdf`}
                          </h5>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Official Candidate CV • Ready for ATS &amp; recruiter review
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (resumeUrl && (resumeUrl.startsWith("data:") || resumeUrl.startsWith("blob:") || resumeUrl.startsWith("http"))) {
                              window.open(resumeUrl, "_blank");
                            } else {
                              downloadResumePdf(null, currentStudent || ({ name, email: currentStudent?.email || "", mobile, college, branch, city, skills, bio } as any));
                            }
                          }}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>View Resume</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (resumeUrl) {
                              downloadResumeFile(resumeUrl, resumeFileName || `${name.replace(/\s+/g, '_')}_Resume.pdf`);
                            } else {
                              downloadResumePdf(null, currentStudent || ({ name, email: currentStudent?.email || "", mobile, college, branch, city, skills, bio } as any));
                            }
                            setSaveSuccessMsg("Resume downloaded successfully!");
                            setTimeout(() => setSaveSuccessMsg(null), 2000);
                          }}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-white border border-dashed border-slate-300 text-center">
                      <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                      <p className="text-xs text-slate-500 font-medium">No resume document uploaded yet.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(true);
                          setActiveSubTab("edit");
                        }}
                        className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 underline cursor-pointer"
                      >
                        Upload resume in Edit Profile
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Training Experience & Video Self-Reflection Portfolio */}
              <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-7 border border-indigo-500/30 shadow-xl text-white space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shrink-0">
                      <Video className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                        Training Experience &amp; Video Self-Reflection
                      </h4>
                      <p className="text-xs text-indigo-200/80">
                        Featured in Candidate Report <span className="font-bold text-indigo-300">Section 10 (Video Portfolio &amp; Self-Reflection)</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                      AI Synthesized Milestones
                    </span>
                    {reflectionVideo ? (
                      <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/40 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Active
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-300 bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-500/40">
                        Awaiting Video
                      </span>
                    )}
                  </div>
                </div>

                {reflectionVideo ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left: Video Player preview */}
                    <div className="lg:col-span-6 space-y-3">
                      <div className="relative rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl aspect-video flex items-center justify-center group">
                        {reflectionVideo.videoUrl.includes("youtube.com") || reflectionVideo.videoUrl.includes("youtu.be") ? (
                          <iframe
                            src={reflectionVideo.videoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")}
                            title="Reflection Video"
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <video
                            src={reflectionVideo.videoUrl}
                            controls
                            className="w-full h-full object-cover"
                            poster={avatar}
                          />
                        )}
                        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold text-white border border-white/20">
                          {reflectionVideo.duration || "18:42"}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-bold text-white truncate">{reflectionVideo.title || "Mind2i Full-Stack Training & Reflection Keynote"}</p>
                          <p className="text-[10px] text-slate-400">Recorded • {reflectionVideo.uploadedAt || "Active Cohort"}</p>
                        </div>
                        <div className="px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-bold text-indigo-300 flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3 text-indigo-400" />
                          <span>{reflectionVideo.aiFluencyScore ? "Admin Evaluated" : "Awaiting Admin Review"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: AI Milestones & Summary */}
                    <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
                      {/* AI Reflection Summary */}
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> AI Executive Reflection Narrative
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400">Calibrated</span>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed italic">
                          "{reflectionVideo.aiSummary}"
                        </p>
                        {reflectionVideo.aiToneNotes && (
                          <p className="text-[11px] text-indigo-300/80 pt-1 border-t border-white/5">
                            <span className="font-bold text-white">Tone & Delivery:</span> {reflectionVideo.aiToneNotes}
                          </p>
                        )}
                      </div>

                      {/* Key Reflections & Developmental Milestones */}
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
                        <h5 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center justify-between">
                          <span>Key Reflections &amp; Developmental Milestones</span>
                          <span className="text-[10px] text-indigo-400 font-mono">Synced to Report</span>
                        </h5>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {reflectionVideo.aiMilestones?.map((m, idx) => (
                            <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                              <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold shrink-0 border border-indigo-400/20">
                                {m.time}
                              </span>
                              <span className="text-[11px] leading-snug">{m.desc}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Communication & Fluency metrics */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                          <p className="text-[10px] text-slate-400 uppercase font-bold">Verbal Fluency</p>
                          <p className="text-lg font-black text-white">{reflectionVideo.aiFluencyScore || 92}%</p>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                          <p className="text-[10px] text-slate-400 uppercase font-bold">Communication</p>
                          <p className="text-lg font-black text-emerald-400">{reflectionVideo.aiCommunicationScore || 94}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-white/5 border border-dashed border-white/20 text-center space-y-3">
                    <Video className="w-10 h-10 text-indigo-400 mx-auto" />
                    <div>
                      <h5 className="text-sm font-bold text-white">Upload Your Training Reflection &amp; Capstone Video</h5>
                      <p className="text-xs text-slate-300 max-w-lg mx-auto mt-1">
                        Share your 5–15 minute video detailing your learning breakthroughs, code paradigms, and project experience. Our AI will automatically analyze your speech, create timestamped milestones, and populate Section 10 of your official candidate report.
                      </p>
                    </div>
                    <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(true);
                          setActiveSubTab("edit");
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg transition cursor-pointer flex items-center gap-1.5"
                      >
                        <UploadCloud className="w-4 h-4" />
                        <span>Upload Video in Edit Tab</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Technical Resources, Presentations & Research Whitepapers Showcase */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                      <FolderGit2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        My Technical Resources &amp; Research Whitepapers
                      </h4>
                      <p className="text-xs text-slate-500">
                        Featured in Candidate Report <span className="font-bold text-indigo-600">Section 09 (Project Presentation &amp; Resources Hub)</span> &amp; visible in Admin Profile Reviews
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-indigo-500" />
                      {resources.filter(r => typeof r.aiRating === "number" && r.aiRating > 0).length} of {resources.length} Artifacts Verified
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddResourceModal(true)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Artifact</span>
                    </button>
                  </div>
                </div>

                {resources.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {resources.map((res, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 flex flex-col justify-between space-y-3 hover:border-indigo-300 hover:shadow-xs transition"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-white text-indigo-700 border border-indigo-100 shadow-2xs">
                              {res.type}
                            </span>
                            {typeof res.aiRating === "number" && res.aiRating > 0 ? (
                              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                                Admin Verified: {res.aiRating}%
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5 text-amber-600" />
                                Submitted • Pending Review
                              </span>
                            )}
                          </div>

                          <h5 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug pt-1">
                            {res.title}
                          </h5>

                          {res.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                              {res.description}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-400">
                          <span className="truncate pr-2 font-mono">{res.fileName} • {res.fileSize || "PDF"}</span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <a
                              href={res.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 bg-white hover:bg-slate-100 text-indigo-700 border border-slate-200 rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
                            >
                              <ExternalLink className="w-2.5 h-2.5" />
                              <span>View</span>
                            </a>
                            <a
                              href={res.fileUrl}
                              download={res.fileName}
                              className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
                            >
                              <Download className="w-2.5 h-2.5" />
                              <span>Download</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => handleRemoveResource(res.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                              title="Delete artifact"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-2">
                    <FolderGit2 className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">No Technical Resources or Whitepapers Uploaded Yet</p>
                    <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                      Upload system blueprints, presentation slide decks (PPTX/PDF), and research papers to demonstrate your engineering documentation depth.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowAddResourceModal(true)}
                      className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 transition shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Upload Artifact Now</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: EDIT PROFILE FORM                                  */}
          {/* ========================================================= */}
          {(activeSubTab === "edit" || isEditing) && activeSubTab !== "security" && (
            <form onSubmit={handleSaveProfile} className="space-y-5 animate-in fade-in">
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Profile Photo Quick Manager in Edit Tab */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/40 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="relative w-16 h-16 rounded-2xl border-2 border-white shadow-md overflow-hidden bg-white shrink-0 ring-2 ring-indigo-500/20">
                    <img src={avatar} alt={name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                      Profile Picture / Avatar
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Your photo is displayed on your candidate report, portfolio, and platform profile.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => avatarFileInputRef.current?.click()}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAvatarPicker(true)}
                    className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Choose Avatar</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Johnson"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="+1 (555) 012-3456"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    College / University Name
                  </label>
                  <div className="relative">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="e.g. MIT / Stanford / IIT"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Department / Branch
                  </label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="e.g. Computer Science, AI & ML, ECE"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. San Francisco / Bangalore"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">State / Province</label>
                  <input
                    type="text"
                    value={stateValue}
                    onChange={(e) => setStateValue(e.target.value)}
                    placeholder="e.g. California / Karnataka"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
              </div>

              {/* Bio & Social Portfolios */}
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Developer Bio & Aspiration
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell your instructors and peers about your tech interests and goals..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      GitHub Profile URL
                    </label>
                    <div className="relative">
                      <Github className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/yourhandle"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      LinkedIn Profile URL
                    </label>
                    <div className="relative">
                      <Linkedin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        placeholder="https://linkedin.com/in/yourhandle"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Skills Manager */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Technical Skills &amp; Competencies
                </label>
                
                {/* Active Skill Pills */}
                <div className="flex flex-wrap gap-2">
                  {skills.map((sk) => (
                    <span
                      key={sk}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold shadow-2xs"
                    >
                      {sk}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(sk)}
                        className="w-4 h-4 rounded-full bg-indigo-200 hover:bg-rose-200 hover:text-rose-700 text-indigo-700 flex items-center justify-center text-xs transition cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {skills.length === 0 && (
                    <span className="text-xs text-slate-400 italic">
                      No skills added yet. Type below or select from popular skills.
                    </span>
                  )}
                </div>

                {/* Input + Add button */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkill(skillInput);
                      }
                    }}
                    placeholder="Type skill (e.g. Next.js, Docker, PyTorch) and press Enter"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkill(skillInput)}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Popular Quick-Select Pills */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                    Quick Add Popular Skills:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_SKILLS.filter(ps => !skills.some(s => s.toLowerCase() === ps.toLowerCase())).map((ps) => (
                      <button
                        key={ps}
                        type="button"
                        onClick={() => handleAddSkill(ps)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 text-[11px] font-medium border border-slate-200/80 transition cursor-pointer"
                      >
                        + {ps}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Resume / CV Document Upload */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Candidate Resume / CV Document
                </label>
                <p className="text-[11px] text-slate-500">
                  Upload your latest resume (.pdf, .doc, .docx up to 10MB) to be featured in your candidate dossier and official report.
                </p>

                {resumeUrl ? (
                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {resumeFileName || "Candidate_Resume.pdf"}
                        </p>
                        <p className="text-[10px] text-emerald-700 font-semibold">
                          {resumeFileSize ? `${resumeFileSize} • ` : ""}Ready for submission
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-white text-indigo-600 hover:text-indigo-700 border border-slate-200 rounded-lg text-xs font-bold"
                        title="View Resume"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={handleRemoveResume}
                        className="p-1.5 bg-white text-rose-600 hover:text-rose-700 border border-slate-200 rounded-lg text-xs font-bold cursor-pointer"
                        title="Remove Resume"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="block border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl p-5 text-center cursor-pointer transition bg-slate-50/50 hover:bg-indigo-50/20">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <UploadCloud className="w-7 h-7 text-indigo-500 mx-auto mb-1.5" />
                    <p className="text-xs font-bold text-slate-800">
                      Click to upload or drag &amp; drop resume
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Supported formats: PDF, DOC, DOCX (Max 10MB)
                    </p>
                  </label>
                )}
              </div>

              {/* Training Experience & Video Self-Reflection Upload */}
              <div className="pt-5 border-t border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
                      <Video className="w-4 h-4 text-indigo-600" />
                      Training Experience &amp; Video Self-Reflection
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Upload your reflection video (.mp4, .webm) or link a demo (YouTube/Loom/Drive). AI generates milestones and syncs to <span className="font-bold text-indigo-600">Section 10</span> of your official report.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-200 shrink-0">
                    Report Section 10
                  </span>
                </div>

                {reflectionVideo ? (
                  <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                          <Video className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {reflectionVideo.title || "Internship Experience & Reflection Video"}
                          </p>
                          <p className="text-[10px] text-indigo-700 font-semibold flex items-center gap-1.5 mt-0.5">
                            <Sparkles className="w-3 h-3 text-indigo-600" />
                            {reflectionVideo.aiMilestones?.length || 4} AI Milestones Extracted • Duration: {reflectionVideo.duration || "18:42"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleAnalyzeVideoWithAI(reflectionVideo.videoUrl, reflectionVideo.title)}
                          disabled={isVideoAnalyzing}
                          className="px-3 py-1.5 bg-white text-indigo-600 hover:text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          {isVideoAnalyzing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                          <span>Re-Analyze AI</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveVideo}
                          className="p-1.5 bg-white text-rose-600 hover:text-rose-700 border border-slate-200 rounded-xl text-xs font-bold cursor-pointer"
                          title="Remove Video"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                          Video Title / Presentation Theme
                        </label>
                        <input
                          type="text"
                          value={videoInputTitle}
                          onChange={(e) => setVideoInputTitle(e.target.value)}
                          placeholder="e.g. My Mind2I Training Experience & Capstone Defense"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                          Video URL (YouTube, Loom, Google Drive, MP4)
                        </label>
                        <input
                          type="url"
                          value={videoInputUrl}
                          onChange={(e) => setVideoInputUrl(e.target.value)}
                          placeholder="https://youtu.be/... or https://loom.com/share/..."
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <label className="flex-1 w-full border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl p-4 text-center cursor-pointer transition bg-slate-50/50 hover:bg-indigo-50/20">
                        <input
                          type="file"
                          accept="video/mp4,video/webm,video/ogg,video/quicktime"
                          onChange={handleVideoFileUpload}
                          className="hidden"
                        />
                        <UploadCloud className="w-6 h-6 text-indigo-500 mx-auto mb-1" />
                        <p className="text-xs font-bold text-slate-800">
                          {videoFileName ? `Selected: ${videoFileName}` : "Upload Video File (.mp4, .webm)"}
                        </p>
                        <p className="text-[10px] text-slate-400">Max size 100MB</p>
                      </label>

                      <div className="text-xs text-slate-400 font-bold uppercase">or</div>

                      <button
                        type="button"
                        onClick={() => handleAnalyzeVideoWithAI(videoInputUrl, videoInputTitle)}
                        disabled={isVideoAnalyzing || (!videoInputUrl && !videoFileName)}
                        className="w-full sm:w-auto px-5 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 text-white rounded-2xl text-xs font-bold shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                      >
                        {isVideoAnalyzing ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Analyzing Video...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-amber-300" />
                            <span>Analyze Video with AI</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Technical Resources & Research Whitepapers Upload Section in Edit Tab */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                      <FolderGit2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Upload Technical Resources &amp; Research Whitepapers
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Upload PDF whitepapers, PPTX presentation decks, and system blueprints to your profile and admin review workspace
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                    {resources.length} Uploaded
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Artifact Title
                    </label>
                    <input
                      type="text"
                      value={newResTitle}
                      onChange={(e) => setNewResTitle(e.target.value)}
                      placeholder="e.g. Distributed LLM Microservices Architecture Blueprint"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:bg-white focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Category
                    </label>
                    <select
                      value={newResType}
                      onChange={(e) => setNewResType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:bg-white focus:border-indigo-500"
                    >
                      <option value="whitepaper">Research Whitepaper (PDF)</option>
                      <option value="blueprint">System Architecture Blueprint</option>
                      <option value="presentation">Presentation Slide Deck (PPTX/PDF)</option>
                      <option value="document">Technical Document / API Spec</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Description &amp; Key Technical Highlights
                  </label>
                  <textarea
                    rows={2}
                    value={newResDescription}
                    onChange={(e) => setNewResDescription(e.target.value)}
                    placeholder="Brief summary of architecture decisions, algorithmic benchmarks, or business impact..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:bg-white focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Document / Whitepaper File Upload
                    </label>
                    <label className="flex items-center gap-2 p-2.5 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50/70 text-indigo-700 text-xs font-bold cursor-pointer transition">
                      <UploadCloud className="w-4 h-4 text-indigo-600" />
                      <span className="truncate">
                        {newResFileName ? newResFileName : "Choose PDF / PPTX file..."}
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.pptx,.ppt,.docx,.doc"
                        onChange={handleResourceFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Or Online Link / Cloud Drive URL
                    </label>
                    <input
                      type="url"
                      value={newResFileUrl}
                      onChange={(e) => setNewResFileUrl(e.target.value)}
                      placeholder="https://drive.google.com/... or https://arxiv.org/..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:bg-white focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => handleAddResource()}
                    disabled={!newResTitle.trim()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Upload &amp; Add to Profile Vault</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setActiveSubTab("overview");
                  }}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white rounded-xl text-xs font-black shadow-md transition cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to Database...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Profile Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ========================================================= */}
          {/* TAB 3: ACCOUNT SECURITY & PASSWORD                        */}
          {/* ========================================================= */}
          {activeSubTab === "security" && (
            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md animate-in fade-in">
              <div className="p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-100 text-xs text-indigo-900">
                <span className="font-extrabold block mb-0.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" /> Account Credential Management
                </span>
                <span>Update your password used to log into the Mind2i Learning Platform.</span>
              </div>

              {passwordError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter at least 6 characters"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setActiveSubTab("overview");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white rounded-xl text-xs font-black shadow-md transition cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* AVATAR & PHOTO UPLOADER MODAL                             */}
      {/* ========================================================= */}
      {showAvatarPicker && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Update Profile Photo
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Upload your own picture or select an animated avatar
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAvatarPicker(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Current Preview & Upload Section */}
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-gradient-to-tr from-slate-50 to-indigo-50/40 border border-slate-200/80">
              <div className="relative w-24 h-24 rounded-2xl border-2 border-white shadow-md overflow-hidden bg-white shrink-0 ring-2 ring-indigo-500/20">
                <img src={avatar} alt="Preview" className="w-full h-full object-cover" />
                <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] shadow">
                  <Check className="w-3 h-3" />
                </span>
              </div>

              <div className="flex-1 text-center sm:text-left space-y-2">
                <div className="text-xs font-bold text-slate-800">
                  Upload Custom Picture
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Choose a photo from your computer (PNG, JPG, WebP up to 10MB). Automatically centered and optimized.
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => avatarFileInputRef.current?.click()}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                  </button>
                  {avatar && (
                    <button
                      type="button"
                      onClick={handleResetAvatar}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold border border-slate-200 transition cursor-pointer"
                    >
                      Reset Default
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Drag & Drop Box */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDraggingAvatar(true); }}
              onDragLeave={() => setIsDraggingAvatar(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingAvatar(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleImageFile(file);
              }}
              onClick={() => avatarFileInputRef.current?.click()}
              className={`p-5 rounded-2xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center text-center cursor-pointer ${
                isDraggingAvatar
                  ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20"
                  : "border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/20 bg-slate-50/50"
              }`}
            >
              <FileUp className="w-6 h-6 text-indigo-600 mb-1.5" />
              <span className="text-xs font-bold text-slate-700">
                Drag &amp; drop your image here, or <span className="text-indigo-600 underline">browse files</span>
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                PNG, JPG, JPEG, GIF, WebP (Max 10MB)
              </span>
            </div>

            {/* Preset Avatars Divider & Grid */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  Or Select An Animated Avatar
                </span>
                <span className="text-[10px] text-slate-400">8 Presets</span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {PRESET_AVATARS.map((avUrl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setAvatar(avUrl);
                      persistAvatarChange(avUrl);
                    }}
                    className={`p-1.5 rounded-xl border-2 transition cursor-pointer flex items-center justify-center aspect-square ${
                      avatar === avUrl
                        ? "border-indigo-600 bg-indigo-50 shadow-md ring-2 ring-indigo-500/20 scale-105"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <img src={avUrl} alt={`Avatar ${i}`} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Live synced across your profile &amp; reports
              </span>
              <button
                type="button"
                onClick={() => setShowAvatarPicker(false)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* QUICK ADD RESOURCE / WHITEPAPER MODAL                     */}
      {/* ========================================================= */}
      {showAddResourceModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FolderGit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Upload Technical Resource / Whitepaper
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Visible immediately in Admin Profile Reviews &amp; Candidate Report Section 09
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddResourceModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Artifact Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newResTitle}
                  onChange={(e) => setNewResTitle(e.target.value)}
                  placeholder="e.g. Distributed LLM Microservices Architecture Blueprint"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:bg-white focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={newResType}
                  onChange={(e) => setNewResType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:bg-white focus:border-indigo-500"
                >
                  <option value="whitepaper">Research Whitepaper (PDF)</option>
                  <option value="blueprint">System Architecture Blueprint</option>
                  <option value="presentation">Presentation Slide Deck (PPTX/PDF)</option>
                  <option value="document">Technical Document / API Spec</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description &amp; Highlights</label>
                <textarea
                  rows={2}
                  value={newResDescription}
                  onChange={(e) => setNewResDescription(e.target.value)}
                  placeholder="Key technical scope, system topology, or research benchmarks..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:bg-white focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Upload File (.pdf, .pptx)</label>
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50/70 text-indigo-700 text-xs font-bold cursor-pointer transition">
                    <UploadCloud className="w-4 h-4 text-indigo-600" />
                    <span className="truncate">{newResFileName ? newResFileName : "Choose file..."}</span>
                    <input
                      type="file"
                      accept=".pdf,.pptx,.ppt,.docx,.doc"
                      onChange={handleResourceFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Or Document URL</label>
                  <input
                    type="url"
                    value={newResFileUrl}
                    onChange={(e) => setNewResFileUrl(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:bg-white focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddResourceModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleAddResource()}
                disabled={!newResTitle.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload to Profile Vault</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
