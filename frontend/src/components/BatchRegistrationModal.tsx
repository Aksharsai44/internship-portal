import React, { useState, useEffect } from "react";
import { Batch, Student } from "../types";
import {
  QrCode,
  CheckCircle2,
  Lock,
  User,
  Mail,
  Phone,
  Building2,
  Sparkles,
  ArrowRight,
  Key,
  FileText,
  Upload,
  FileCheck,
  Github,
  Linkedin,
  Globe,
  Plus,
  Trash2,
} from "lucide-react";
import confetti from "canvas-confetti";

const POPULAR_SKILLS = [
  "Python",
  "React",
  "TypeScript",
  "FastAPI",
  "Docker",
  "Machine Learning",
  "AI Agents",
  "SQL",
  "Node.js",
  "Git",
];

interface BatchRegistrationModalProps {
  batch: Batch;
  existingStudents: Student[];
  onRegisterStudent: (newStudent: Partial<Student>) => void;
  onAutoLogin?: (newStudent: Partial<Student>) => void;
  onClose: () => void;
}

export const BatchRegistrationModal: React.FC<BatchRegistrationModalProps> = ({
  batch,
  existingStudents,
  onRegisterStudent,
  onAutoLogin,
  onClose,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [college, setCollege] = useState(batch.college);
  const [branch, setBranch] = useState("");
  const [city, setCity] = useState("");
  const [stateValue, setStateValue] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [savedNewStudent, setSavedNewStudent] = useState<Partial<Student> | null>(null);

  // New Fields: Resume, Skills, Social Links
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [resumeFileSize, setResumeFileSize] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  useEffect(() => {
    if (batch) {
      setCollege(batch.college || "");
    }
  }, [batch?.id, batch?.college]);

  const handleEmailBlur = () => {
    if (!email.trim()) return;
    const found = existingStudents.find(
      (s) => s.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (found) {
      setIsExistingUser(true);
      setName(found.name);
      setMobile(found.mobile);
      setCollege(found.college || "");
      setBranch(found.branch || "");
      setCity(found.city || "");
      setStateValue(found.state || "");
      setSkills(found.skills || []);
      setResumeUrl(found.resumeUrl || "");
      if (found.resumeUrl) {
        setResumeFileName("Saved_Resume.pdf");
      }
      setGithubUrl(found.githubUrl || "");
      setLinkedinUrl(found.linkedinUrl || "");
    } else {
      setIsExistingUser(false);
    }
  };

  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    if (!skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
    }
    setSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  const handleResumeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("Resume file size should be less than 10MB.");
      return;
    }

    setResumeFileName(file.name);
    setResumeFileSize((file.size / 1024).toFixed(0) + " KB");

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setResumeUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (batch.isLocked) {
      setErrorMsg("Registration for this cohort has been closed.");
      return;
    }

    if (!isExistingUser && password && password !== confirmPassword) {
      setErrorMsg("Passwords do not match!");
      return;
    }

    const newStudentData: Partial<Student> = {
      name,
      email,
      mobile,
      college,
      branch,
      city,
      state: stateValue,
      password: !isExistingUser ? password : undefined,
      batchId: batch.id,
      batchName: batch.name,
      status: "active",
      enrolledAt: new Date().toISOString(),
      skills,
      resumeUrl,
      githubUrl,
      linkedinUrl,
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

    onRegisterStudent(newStudentData);
    setSavedNewStudent(newStudentData);
    setRegistrationSuccess(true);
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-100 my-auto animate-in fade-in max-h-[92vh] overflow-y-auto">
        {/* Pinned Header */}
        <div className="flex items-center justify-between pb-3 mb-2.5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2 text-indigo-600 font-black text-xs sm:text-sm">
            <QrCode className="w-4 h-4" />
            <span>MIND2I Self-Registration</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {batch.isLocked ? (
          <div className="text-center py-7 px-2 space-y-4 my-auto">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-rose-200">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-black uppercase tracking-wider mb-2.5 border border-rose-200">
                <Lock className="w-3 h-3" />
                <span>Cohort Locked</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Registration Has Been Closed</h3>
              <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
                Registration for <strong>{batch.name}</strong> has been closed by the program administration. New intern enrollments are no longer being accepted for this cohort.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5 text-left max-w-sm mx-auto">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Institution / Org:</span>
                <span className="font-bold text-slate-800 truncate max-w-[180px]">{batch.college || "MIND2I Technical"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Program Track:</span>
                <span className="font-bold text-slate-800">{batch.durationLabel} ({batch.programType})</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Schedule:</span>
                <span className="font-bold text-slate-800">{batch.startDate} → {batch.endDate}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                <span className="text-slate-400 font-medium">Enrollment Status:</span>
                <span className="font-black text-rose-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Closed
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : registrationSuccess ? (
          <div className="text-center py-6 space-y-4 my-auto">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Registration Complete!</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              You are officially registered in <strong>{batch.name}</strong>. You can now access all workshop assignments, Learn Hub modules, and live polls.
            </p>
            <button
              onClick={() => {
                if (onAutoLogin && savedNewStudent) {
                  onAutoLogin(savedNewStudent);
                } else {
                  onClose();
                }
              }}
              className="px-5 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              Continue to Student Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="p-2.5 bg-indigo-50/70 rounded-xl border border-indigo-100 text-xs flex items-center justify-between">
              <span className="font-bold text-indigo-900 text-[11px]">Enrolling into:</span>
              <span className="text-indigo-700 font-semibold text-[11px] truncate max-w-[260px]">{batch.name} • {batch.college}</span>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-700 font-semibold">
                {errorMsg}
              </div>
            )}

            {isExistingUser && (
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-800 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Account recognized! Adding this batch to your profile.
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5">
                  Email Address (Username) *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={handleEmailBlur}
                  placeholder="you@university.edu"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Johnson"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5">
                  Mobile Number *
                </label>
                <input
                  type="text"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+1 (555) 012-3456"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5">
                  College Name
                </label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5">
                  Branch
                </label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="CSE, AI/ML, ECE"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5">
                    State
                  </label>
                  <input
                    type="text"
                    value={stateValue}
                    onChange={(e) => setStateValue(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* ── Resume Upload Section ── */}
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    Upload Your Resume (PDF / Word)
                  </span>
                  <span className="text-[9px] text-slate-400 font-normal">Displayed in candidate dossier</span>
                </label>
                {resumeFileName ? (
                  <div className="flex items-center justify-between p-2.5 bg-indigo-50/70 border border-indigo-200 rounded-xl">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0 font-bold">
                        <FileCheck className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{resumeFileName}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{resumeFileSize || "Resume Document"}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setResumeUrl("");
                        setResumeFileName("");
                        setResumeFileSize("");
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition text-xs cursor-pointer"
                      title="Remove file"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 p-3 bg-slate-50 border border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/20 rounded-xl cursor-pointer transition group">
                    <Upload className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition" />
                    <span className="text-xs font-semibold text-slate-600 group-hover:text-indigo-700">
                      Click to choose resume (.pdf, .docx, .doc)
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* ── Key Technical Skills ── */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Key Skills & Technical Stack
                  </span>
                  <span className="text-[9px] text-slate-400 font-normal">Type and press Enter or pick below</span>
                </label>

                {/* Skill input */}
                <div className="flex gap-1.5">
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
                    placeholder="e.g. Python, React, Docker..."
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkill(skillInput)}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {/* Selected Skills Chips */}
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {skills.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-bold border border-indigo-200"
                      >
                        {s}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(s)}
                          className="hover:text-rose-600 ml-0.5 text-[10px] font-bold cursor-pointer"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Quick select suggestions */}
                <div className="flex flex-wrap items-center gap-1 pt-0.5">
                  <span className="text-[10px] text-slate-400 font-medium mr-0.5">Popular:</span>
                  {POPULAR_SKILLS.filter((s) => !skills.includes(s)).slice(0, 7).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleAddSkill(s)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-md text-[10px] font-medium transition cursor-pointer border border-slate-200/60"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Social Profiles ── */}
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5 flex items-center gap-1">
                  <Github className="w-3 h-3 text-slate-700" /> GitHub Profile
                </label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5 flex items-center gap-1">
                  <Linkedin className="w-3 h-3 text-sky-600" /> LinkedIn Profile
                </label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {!isExistingUser && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5">
                      Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Fixed Footer */}
            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-end gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
              >
                Register & Enroll Now
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
