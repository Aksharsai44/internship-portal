export type UserRole = "admin" | "student" | "client";

export type InternshipType = "internship_3m" | "internship_6m" | "internship_12m" | "custom";

export interface Batch {
  id: string;
  name: string;
  type: InternshipType;
  programType: string;
  durationMonths: number;
  durationLabel: string; // e.g. "3 Months", "6 Months"
  college: string;
  organization?: string;
  startDate: string;
  endDate: string;
  status: "upcoming" | "active" | "completed";
  studentCount: number;
  description: string;
  technologies?: string[]; // skill/tech tags for this cohort
  mentor?: string;
  isLocked?: boolean;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  mobile: string;
  batchId: string;
  batchName: string;
  avatar?: string;
  college?: string;
  branch?: string;
  city?: string;
  state?: string;
  password?: string;
  enrolledAt: string;
  status: "active" | "completed" | "inactive";
  scores: {
    quizScore: number;
    codingScore: number;
    liveQAScore: number;
    assignmentScore: number;
    overallAccuracy: number; // percentage
  };
  totalPoints: number;
  activeStreakDays: number;
  fastestResponseMs: number;
  attendedSessions: number;
  totalSessions: number;
  notes?: string;
  // Intern-specific fields
  skills?: string[];
  bio?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  resumeUrl?: string;
  mentor?: string;
  internshipStartDate?: string;
  internshipEndDate?: string;
  evaluation?: InternEvaluation;
  evaluations?: InternEvaluation[];
  reflectionVideo?: InternReflectionVideo;
  resources?: InternResource[];
}

export interface InternReflectionVideo {
  videoUrl: string;
  title: string;
  duration?: string;
  uploadedAt: string;
  aiMilestones?: { time: string; desc: string }[];
  aiSummary?: string;
  aiCommunicationScore?: number;
  aiFluencyScore?: number;
  aiToneNotes?: string;
}

export interface InternResource {
  id: string;
  studentId: string;
  batchId?: string;
  title: string;
  type: "presentation" | "document" | "research" | "blueprint" | "whitepaper";
  fileUrl: string;
  fileName: string;
  fileSize?: string;
  uploadedAt: string;
  description?: string;
  aiRating?: number; // 0-100%
  aiAuditSummary?: string;
  aiRigorNotes?: string;
  tags?: string[];
}

export interface InternEvaluation {
  id: string;
  studentId: string;
  batchId: string;
  reviewerName: string;
  reviewerRole?: string;
  evaluationName?: string;
  roundName?: string;
  roundNumber?: number;
  evaluatorAvatar?: string;
  evaluatedAt: string;
  // 4 Core Dimensions
  communicationScore: number; // 0-100%
  communicationNotes: string;
  grammarScore: number; // 0-100%
  grammarNotes: string;
  fluencyScore: number; // 0-100%
  fluencyNotes: string;
  projectScore: number; // 0-100%
  projectNotes: string;
  // Custom Notes / Freeform Remarks
  customNotes: string;
  // AI Synthesis Output
  aiVerdict?: string;
  aiSummary?: string;
  aiStrengths?: string[];
  aiGrowthAreas?: string[];
  overallRating?: number;
  isAIGenerated?: boolean;
}

export interface ClientUser {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  password?: string;
  phone?: string;
  industry?: string;
  logo?: string;
  assignedBatches: string[]; // batch IDs
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface InterviewRequest {
  id: string;
  clientId: string;
  clientName?: string;
  internId: string;
  internName?: string;
  batchId: string;
  batchName?: string;
  status: "pending" | "approved" | "scheduled" | "completed" | "rejected";
  requestedDate?: string;
  scheduledDate?: string;
  interviewType: "virtual" | "in_person" | "phone";
  notes: string;
  adminNotes: string;
  meetingLink?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type TagQuestionType = "mcq" | "true_false" | "poll" | "short_answer";

export interface LearnHubTagQuestion {
  id?: string;
  type?: TagQuestionType; // default to "mcq"
  question: string;
  A?: string;
  B?: string;
  C?: string;
  D?: string;
  correct?: "A" | "B" | "C" | "D" | "True" | "False" | string;
  explanation?: string;
  pollOptions?: string[];
  pollVotes?: number[];
  sampleAnswer?: string;
}

export interface LearnHubTag {
  id: string;
  term: string;
  cssClass: "llm" | "api" | "nexos" | "crewai" | "tag1" | "tag2" | "tag3" | string;
  icon: string;
  type: string;
  definition: string;
  questions: LearnHubTagQuestion[];
}

export interface LearnHubParagraph {
  textBefore: string;
  highlight?: LearnHubTag;
  textAfter: string;
}

export interface BottomTag {
  tag: string;
  title: string;
  icon: string;
  cssClass: string;
  definition: string;
  questionsCount: number;
}

export interface LearnHubSlide {
  id: string;
  slideNumber: number;
  title: string;
  subtitle?: string;
  badge?: string;
  paragraphs: LearnHubParagraph[];
  bottomTags?: BottomTag[];
  notes?: string;
  tagsLocked?: boolean;
}

export interface LearnHubSourceFile {
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
  slideCount?: number;
  previewUrl?: string;
}

export interface LearnHubModule {
  id: string;
  batchId: string;
  badge: string;
  title: string;
  subtitle: string;
  sourceFile?: LearnHubSourceFile; // Legacy single file
  sourceFiles?: LearnHubSourceFile[]; // New multi-file support
  slides?: LearnHubSlide[];
  paragraphs: LearnHubParagraph[];
  bottomTags: BottomTag[];
  isPublished: boolean;
  createdAt: string;
}

export type QuestionType = "mcq" | "true_false" | "fill_blank" | "poll" | "essay" | "coding";

export interface TestCase {
  input: string;
  expectedOutput: string;
  explanation?: string;
  isHidden?: boolean;
}

export type SupportedLanguage =
  | "python"
  | "javascript"
  | "typescript"
  | "java"
  | "cpp"
  | "c"
  | "csharp"
  | "go"
  | "rust"
  | "php"
  | "ruby"
  | "swift"
  | "kotlin"
  | "dart"
  | "scala"
  | "sql"
  | "bash"
  | "r"
  | string;

export interface AssignmentQuestion {
  id: string;
  type: QuestionType;
  question: string;
  title?: string;
  description?: string;
  inputFormat?: string;
  outputFormat?: string;
  constraints?: string;
  sampleInput?: string;
  sampleOutput?: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  points: number;
  language?: SupportedLanguage;
  starterCode?: string;
  starterCodes?: Record<string, string>;
  solutionCode?: string;
  testCases?: TestCase[];
}

export interface StudentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  answers: Record<string, string>; // questionId -> answer
  codeSubmissions?: Record<string, { code: string; testResults?: any[] }>;
  score: number;
  maxScore: number;
  feedback?: string;
  autoGraded: boolean;
}

export interface Assignment {
  id: string;
  batchId: string;
  title: string;
  description: string;
  type: "quiz" | "coding" | "mixed" | "poll_survey";
  durationMinutes: number;
  totalPoints: number;
  isPublished: boolean;
  isLocked?: boolean;
  deadline: string;
  questions: AssignmentQuestion[];
}

export interface ProjectResource {
  id: string;
  title: string;
  url: string;
  type?: "link" | "pdf" | "doc" | "repo" | "figma";
}

export interface ProjectAssignment {
  id: string;
  batchId: string;
  batchName?: string;
  title: string;
  technicalCategory: string;
  startDate?: string;
  startTime?: string;
  deadline: string;
  deadlineTime?: string;
  priority: "Low" | "Medium" | "High";
  leaderboardPoints: number;
  executiveSummary: string;
  detailedInstructions: string;
  resources: ProjectResource[];
  mentorObservationBenchmark: string; // Internal Mentor/Admin Scenario & Benchmark (Hidden from interns)
  createdAt: string;
  createdBy?: string;
  status: "todo" | "in_progress" | "completed";
}

export interface ProjectSubmission {
  id: string;
  projectId: string;
  studentId: string;
  studentName: string;
  batchId: string;
  submittedAt: string;
  githubRepoUrl: string;
  liveDemoUrl: string;
  fileName?: string;
  fileSize?: string;
  demoVideoUrl?: string;
  demoVideoName?: string;
  submissionNotes: string; // Intern's observation writeup & architecture remarks
  status: "pending" | "passed" | "needs_revision";
  gradePoints?: number;
  mentorFeedback?: string;
}

export interface LiveQAResponse {
  studentId: string;
  studentName: string;
  avatar?: string;
  answer: string;
  timestamp: number;
  responseTimeMs: number;
  isCorrect?: boolean;
  submittedAt?: string;
}

export interface LiveQuestion {
  id: string;
  batchId: string;
  question: string;
  type: "mcq" | "poll" | "true_false" | "open";
  options: string[];
  correctAnswer?: string;
  isActive: boolean;
  isClosed: boolean;
  isLocked?: boolean;
  createdAt: string;
  responses: LiveQAResponse[];
  timeLimitSeconds?: number;
  points?: number;
  explanation?: string;
  category?: string;
  quizTitle?: string;
  askedByStudentId?: string;
  askedByStudentName?: string;
  upvotes?: number;
  answerByInstructor?: string;
  isAnswered?: boolean;
}

export interface CertificateTemplate {
  id: string;
  batchId: string;
  title: string;
  subtitle: string;
  issuerName: string;
  signatories: { id: string; name: string; title: string }[];
  descriptionText: string;
  isUnlocked: boolean;
  templateStyle?: "modern" | "classic" | "cyber";
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: "super_admin" | "instructor" | "ta";
  assignedBatches?: string[];
  permissions: string[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SessionChapter {
  time: string; // e.g. "00:00", "15:20"
  title: string;
  description: string;
}

export interface SessionSummary {
  title: string;
  duration: string;
  overview: string;
  keyHighlights: string[];
  keyConcepts?: string[];
  actionItems: string[];
  chapters?: SessionChapter[];
  attendanceCount?: number;
  avgEngagementScore?: number;
}

export interface ScheduledMeeting {
  id: string;
  batchId?: string;
  batchName?: string;
  title: string;
  agenda?: string;
  instructorName?: string;
  scheduledDate: string;
  scheduledTime: string;
  meetingLink: string;
  meetingId?: string;
  passcode?: string;
  status: "scheduled" | "live" | "ended";
  recordingUrl?: string;
  isRecordingUnlocked?: boolean;
  isPublished?: boolean;
  orderIndex?: number;
  summary?: SessionSummary;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppSettings {
  enableCodingIDE: boolean;
  enableQuiz: boolean;
  enableLearnHub: boolean;
  enableCertificate: boolean;
  enableMyReport: boolean;
  enableLiveQA: boolean;
  enableLeaderboard?: boolean;
  enablePeerReview?: boolean;
  enableTelemetryAnalytics?: boolean;
  enableClientPortal?: boolean;
  apiKeySet: boolean;
  defaultStudentPassword?: string;
  defaultClientPassword?: string;
  adminUsers: AdminUser[];
}

// ── Attendance, Shift Management & Time Clock Types ──

export interface ShiftPattern {
  id: string;
  name: string; // e.g. "Morning Shift"
  startTime: string; // e.g. "10:00 AM"
  endTime: string; // e.g. "07:00 PM"
  requiredHours: number; // e.g. 8
  workingDays: number[]; // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat (e.g. [1, 2, 3, 4, 5])
  gracePeriodMinutes: number; // e.g. 10 mins before flagged as late
  color?: string;
  isDefault?: boolean;
}

export interface InternRosterAssignment {
  internId: string;
  internName: string;
  avatar?: string;
  role: string;
  department: string;
  batchId?: string;
  batchName?: string;
  shiftId: string;
  shiftName?: string;
  requiredHours: number;
  customWeekends: number[]; // 0=Sun, 6=Sat, etc.
}

export type AttendanceDayStatus =
  | "present"
  | "absent"
  | "on_leave"
  | "half_day"
  | "week_off"
  | "holiday"
  | "late"
  | "punch_error"
  | "scheduled";

export interface PunchLogEntry {
  id: string;
  internId: string;
  internName?: string;
  date: string; // "YYYY-MM-DD"
  type: "clock_in" | "clock_out";
  timestamp: string; // ISO string
  formattedTime: string; // e.g. "10:00:50 AM - 9/4/2026"
  totalWorkedFormatted?: string; // e.g. "Total Worked: 24:26:21"
  totalWorkedSeconds?: number;
  isPunchError?: boolean;
}

export interface AttendanceRecord {
  id: string;
  internId: string;
  internName?: string;
  date: string; // "YYYY-MM-DD"
  status: AttendanceDayStatus;
  clockInTime?: string; // e.g. "10:02:15 AM"
  clockOutTime?: string; // e.g. "07:15:30 PM"
  hoursWorked: number; // e.g. 8.2
  requiredHours: number; // e.g. 8.0
  shiftId: string;
  shiftName: string;
  isLate?: boolean;
  isPunchError?: boolean;
  notes?: string;
}

export interface AIReviewResult {
  rating: number; // e.g. 4.8 / 5.0
  summary: string;
  velocityAssessment: "Outstanding" | "On Track" | "Needs Acceleration" | "Blocked";
  technicalHighlights: string[];
  blockerAdvice?: string;
  actionableSuggestions: string[];
  reviewedAt: string;
}

export interface DailyActivityLog {
  id: string;
  internId: string;
  internName: string;
  batchId?: string;
  batchName?: string;
  logType: "Daily Achievement" | "Weekly Sprint Contribution" | "Monthly Milestone" | string;
  projectTag?: string; // Optional (removed from input form per user request)
  description: string;
  date: string; // e.g. "9/3/2026" or "2026-09-03"
  createdAt: string;
  hasBlockers: boolean;
  blockerDescription?: string;

  // Review & Rating additions:
  status?: "pending" | "reviewed" | "approved" | "needs_revision";
  adminFeedback?: string;
  adminRating?: number; // 1 to 5
  adminReviewedAt?: string;
  adminReviewerName?: string;
  aiReview?: AIReviewResult;
}

export interface HolidayEvent {
  id: string;
  name: string;
  date: string; // "YYYY-MM-DD"
  type: "holiday" | "event";
}

export interface LeaveRequest {
  id: string;
  internId: string;
  internName: string;
  startDate: string;
  endDate: string;
  reason: string;
  type: "casual" | "sick" | "academic" | "other";
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  adminReviewedAt?: string;
  adminFeedback?: string;
  aiRecommendation?: {
    recommendation: "approve" | "verify" | "reject";
    confidence: number;
    reasoning: string;
  };
}

// ─── AI Resume Builder & ATS Scanner Types ───
export interface ResumeBulletFix {
  id: string;
  category: string;
  scopeTag: string; // e.g. "ADD IMPACT METRIC"
  originalText: string;
  suggestedText: string;
  impactReason: string;
  applied: boolean;
}

export interface ATSScanScorecard {
  overallScore: number; // e.g. 87
  targetRole: string; // e.g. "Generative AI & LLM"
  grade: string; // e.g. "Grade A • Highly Optimized"
  lastScannedFileName: string; // e.g. "Akshar_Sai_Miryala_Resume_2026.pdf"
  lastScannedDate: string;
  keywordMatchRate: number; // e.g. 80
  matchedSkills: string[];
  missingSkills: string[];
  quantifiedMetricsScore: number; // e.g. 88
  quantifiedMetricsDetail: string;
  formattingScore: number; // e.g. 96
  formattingDetail: string;
  grammarScore: number; // e.g. 88
  grammarDetail: string;
  bulletFixes: ResumeBulletFix[];
  verificationChecklist: {
    id: string;
    label: string;
    passed: boolean;
  }[];
  executiveSummary: string;
}

export interface InternResumeEducation {
  id: string;
  degree: string;
  institution: string;
  period: string;
  grade?: string;
  highlights?: string;
}

export interface InternResumeExperience {
  id: string;
  title: string;
  company: string;
  period: string;
  location?: string;
  bullets: string[];
}

export interface InternResumeData {
  internId: string;
  internName: string;
  email: string;
  mobile: string;
  location: string;
  githubUrl: string;
  linkedinUrl: string;
  targetRole: string;
  professionalSummary: string;
  education: InternResumeEducation[];
  experience: InternResumeExperience[];
  skills: string[];
  certifications: string[];
  projects?: Array<{ name: string; tech: string; desc: string }>;
  scorecard: ATSScanScorecard;
  isSyncedToClientPortal: boolean;
  lastSyncedAt?: string;
}

export type NotificationType =
  | "leave_approved"
  | "leave_rejected"
  | "leave_requested"
  | "interview"
  | "assignment"
  | "resource"
  | "general";

export interface AppNotification {
  id: string;
  recipientRole: "admin" | "student" | "client" | "all";
  recipientId?: string;
  recipientName?: string;
  recipientEmail?: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  isRead: boolean;
  actionTab?: string;
}
