import {
  Student,
  Batch,
  InternEvaluation,
  DailyActivityLog,
  ProjectSubmission,
  AttendanceRecord,
  InternResumeData,
} from "../types";

export interface AIProfileEvaluationContext {
  dailyLogs?: DailyActivityLog[];
  submissions?: ProjectSubmission[];
  attendanceRecords?: AttendanceRecord[];
  resumeData?: InternResumeData | null;
  assignmentSubmissions?: any[];
}

export function generateAIProfileEvaluation(
  student: Student,
  batch?: Batch | null,
  currentEval?: Partial<InternEvaluation>,
  dailyLogs: DailyActivityLog[] = [],
  submissions: ProjectSubmission[] = [],
  attendanceRecords: AttendanceRecord[] = [],
  resumeData?: InternResumeData | null,
  assignmentSubmissions: any[] = []
): InternEvaluation {
  // ── 1. Batch Duration & Timeline Intelligence ──
  const durationMonths =
    batch?.durationMonths ||
    (batch?.type === "internship_3m"
      ? 3
      : batch?.type === "internship_12m"
      ? 12
      : 6);
  const durationLabel = batch?.durationLabel || `${durationMonths} Months`;
  const cohortLabel = batch?.name || student.batchName || "Engineering Cohort";
  const startDateStr = batch?.startDate || student.internshipStartDate || "Start of Program";
  const endDateStr = batch?.endDate || student.internshipEndDate || "Completion Date";

  // ── 2. Real Candidate Skills ──
  const skillsList =
    student.skills && student.skills.length > 0
      ? student.skills.slice(0, 5).join(", ")
      : batch?.technologies && batch.technologies.length > 0
      ? batch.technologies.slice(0, 5).join(", ")
      : "Full-Stack Development, Git, System Design";

  const firstName = student.name ? student.name.split(" ")[0] : "Candidate";
  const reviewer =
    currentEval?.reviewerName?.trim() ||
    batch?.mentor ||
    student.mentor ||
    "Vijaya Kumar Mekala";

  // ── 3. Real Attendance Calculation ──
  const studentAttendance = attendanceRecords.filter(
    (a) => a.internId === student.id
  );
  let attendanceRate = 0;

  if (studentAttendance.length > 0) {
    const presentCount = studentAttendance.filter(
      (a) => a.status === "present" || a.status === "late"
    ).length;
    attendanceRate = Math.round((presentCount / studentAttendance.length) * 100);
  } else if (student.totalSessions > 0) {
    attendanceRate = Math.round(
      (student.attendedSessions / student.totalSessions) * 100
    );
  } else {
    // New enrollment / active standing baseline
    attendanceRate = student.status === "active" ? 100 : 0;
  }

  // ── 4. Real Daily Activity Logs Analysis ──
  const studentLogs = dailyLogs.filter((l) => l.internId === student.id);
  const totalLogsSubmitted = studentLogs.length;
  const approvedLogs = studentLogs.filter((l) => l.status === "approved").length;
  const blockersResolved = studentLogs.filter(
    (l) => l.hasBlockers && l.status === "approved"
  ).length;

  // ── 5. Real Project & Assignment Submissions Analysis ──
  const studentProjectSubs = submissions.filter((s) => s.studentId === student.id);
  const passedProjectSubs = studentProjectSubs.filter(
    (s) => s.status === "passed" || ((s as any).grade && (s as any).grade.startsWith("A"))
  ).length;
  const projectPassRate =
    studentProjectSubs.length > 0
      ? Math.round((passedProjectSubs / studentProjectSubs.length) * 100)
      : (student.scores?.codingScore || 0);

  const studentAsgSubs = assignmentSubmissions.filter(
    (s) => s.studentId === student.id || s.student === student.id
  );
  const avgAsgScore =
    studentAsgSubs.length > 0
      ? Math.round(
          studentAsgSubs.reduce((acc, s) => acc + (s.score || 0), 0) /
            studentAsgSubs.length
        )
      : (student.scores?.assignmentScore || 0);

  // ── 6. Real ATS Resume Verification ──
  const hasUploadedResume =
    resumeData &&
    resumeData.scorecard &&
    typeof resumeData.scorecard.overallScore === "number" &&
    resumeData.scorecard.overallScore > 0;
  const atsScore = hasUploadedResume ? resumeData.scorecard.overallScore : 0;
  const atsFormatScore = hasUploadedResume ? resumeData.scorecard.formattingScore : 0;

  // ── 7. Check if Candidate has Real Activity ──
  const isStudentDemo = student.isDemo || false;
  const hasRealActivity =
    isStudentDemo ||
    totalLogsSubmitted > 0 ||
    studentProjectSubs.length > 0 ||
    studentAttendance.length > 0 ||
    hasUploadedResume ||
    studentAsgSubs.length > 0 ||
    Boolean(student.attendedSessions && student.attendedSessions > 0);

  // ── 8. Calibrate 4 Core Rubric Dimensions (Real Metric-Driven) ──
  let commScore = 0;
  let grammarScore = 0;
  let fluencyScore = 0;
  let projectScore = 0;

  if (hasRealActivity) {
    const baseLiveQA = student.scores?.liveQAScore || (student.scores?.overallAccuracy ? student.scores.overallAccuracy * 0.95 : (isStudentDemo ? 86 : 0));
    const logBonus = Math.min(10, totalLogsSubmitted * 2);
    commScore = Math.min(
      99,
      Math.round(
        baseLiveQA * 0.4 +
          (totalLogsSubmitted > 0 ? (approvedLogs / totalLogsSubmitted) * 40 : (isStudentDemo ? 35 : 0)) +
          logBonus * 2
      )
    );

    const docQualityBase = student.scores?.quizScore || (student.scores?.overallAccuracy ? student.scores.overallAccuracy * 0.92 : (isStudentDemo ? 88 : 0));
    grammarScore = Math.min(
      99,
      Math.round(
        docQualityBase * 0.4 +
          (hasUploadedResume ? atsFormatScore * 0.4 : (isStudentDemo ? 30 : 0)) +
          (blockersResolved > 0 ? 15 : (isStudentDemo ? 8 : 0))
      )
    );

    fluencyScore = Math.min(
      99,
      Math.round(
        commScore * 0.6 +
          (student.activeStreakDays && student.activeStreakDays > 5 ? 40 : (isStudentDemo ? 38 : (totalLogsSubmitted > 0 ? 25 : 0)))
      )
    );

    const baseCoding = student.scores?.codingScore || (isStudentDemo ? 88 : 0);
    projectScore = Math.min(
      99,
      Math.round(
        baseCoding * 0.4 +
          projectPassRate * 0.4 +
          avgAsgScore * 0.2
      )
    );
  }

  // ── 9. Composite Index & Hiring Verdict ──
  const compositeScore = hasRealActivity
    ? Math.round((commScore + grammarScore + fluencyScore + projectScore) / 4)
    : 0;

  let aiVerdict = "Onboarding in Progress · Baseline Telemetry Pending";
  if (compositeScore >= 95) {
    aiVerdict = "Exceptional Tier-1 Hire · Ready for Senior Associate Engineer";
  } else if (compositeScore >= 90) {
    aiVerdict = "Strong Hire · Ready for Enterprise Full-Stack Role";
  } else if (compositeScore >= 80) {
    aiVerdict = "Hire · Qualified for Full-Stack Associate Placement";
  } else if (compositeScore >= 65) {
    aiVerdict = "Conditional Hire · Core Capabilities In Review";
  } else if (compositeScore > 0) {
    aiVerdict = "In Progress · Milestone Submissions Awaiting Completion";
  }

  // ── 9. Program Scope Summary (Explicitly 3 Months vs 6 Months) ──
  const programDurationText =
    durationMonths === 3
      ? "3-Month Intensive Engineering Program"
      : durationMonths === 6
      ? "6-Month Comprehensive Fellowship"
      : `${durationLabel} Engineering Program`;

  const communicationNotes =
    currentEval?.communicationNotes?.trim() ||
    (hasRealActivity
      ? `${firstName} has submitted ${totalLogsSubmitted} verified daily activity logs (${approvedLogs} mentor approved) during the ${durationLabel} program. Demonstrates lucid technical articulation in daily standup reporting, identifies architectural bottlenecks proactively, and maintains a constructive, solution-oriented tone in engineering syncs.`
      : `${firstName} is enrolled in the ${durationLabel} ${cohortLabel} program. Daily standup logs, sprint communication, and live interaction telemetry have not yet been recorded. Communication metrics will calibrate upon daily log submissions and cohort workshop participation.`);

  const grammarNotes =
    currentEval?.grammarNotes?.trim() ||
    (hasRealActivity
      ? `Demonstrates technical syntactic precision across code comments, sprint documentation, and daily milestone write-ups. Adheres to clean semantic standards for ${skillsList}${
          hasUploadedResume
            ? ` with verified ATS scorecard compliance (${atsScore}% scan index).`
            : ". Technical documentation meets production engineering readability standards."
        }`
      : `Technical documentation and syntactic precision audits will activate upon daily sprint write-ups, code comments, and initial project submissions.`);

  const fluencyNotes =
    currentEval?.fluencyNotes?.trim() ||
    (hasRealActivity
      ? `Commanding presentation delivery and technical defense. Explains trade-offs across asynchronous event processing, modular service boundaries, and state architectures with poise during sprint milestone demos.`
      : `Presentation defense and sprint demo telemetry pending upcoming sprint milestone demonstrations.`);

  const projectNotes =
    currentEval?.projectNotes?.trim() ||
    (hasRealActivity
      ? `Demonstrated hands-on competence across the ${durationLabel} curriculum (${skillsList}). Completed ${studentProjectSubs.length} tracked capstone projects and submissions with a ${projectPassRate}% verification rating, adhering to modular component design, clean schema boundaries, and lint standards.`
      : `Hands-on project execution and capstone evaluations will record upon submission of assigned cohort projects.`);

  const customNotes =
    currentEval?.customNotes?.trim() ||
    (student.notes
      ? student.notes
      : (hasRealActivity
          ? `High engineering velocity observed across the ${programDurationText} (${startDateStr} to ${endDateStr}). Maintains a dependable delivery tempo, resolves code review feedback promptly, and shows natural aptitude for production-scale team engineering.`
          : `Candidate is currently in the onboarding and orientation phase for the ${programDurationText} (${startDateStr} to ${endDateStr}). Faculty reviews and milestone evaluations are pending.`));

  const aiSummary =
    currentEval?.aiSummary?.trim() ||
    (hasRealActivity
      ? `${student.name} has completed work in the ${programDurationText} in ${cohortLabel} (${durationLabel}, ${startDateStr} – ${endDateStr}) with a composite evaluation index of ${compositeScore}%. Demonstrates practical hands-on proficiency across ${skillsList}. Maintained a ${attendanceRate}% verified attendance standing with ${totalLogsSubmitted} logged engineering sprints.`
      : `${student.name} is enrolled in the ${programDurationText} (${cohortLabel}, ${startDateStr} – ${endDateStr}). Currently awaiting initial sprint submissions, attendance records, and faculty milestone reviews to generate full performance telemetry.`);

  const aiStrengths =
    currentEval?.aiStrengths && currentEval.aiStrengths.length > 0
      ? currentEval.aiStrengths
      : (hasRealActivity
          ? [
              `Proficiency in modular application development (${skillsList})`,
              `Consistent daily activity logging (${totalLogsSubmitted} sprints submitted)`,
              `Disciplined technical documentation & prompt blocker resolution`,
              `Active attendance record (${attendanceRate}%) throughout ${durationLabel} cohort`,
            ]
          : [
              `Enrolled and assigned to cohort syllabus`,
              `Ready for initial milestone sprint and daily activity logging`,
            ]);

  const aiGrowthAreas =
    currentEval?.aiGrowthAreas && currentEval.aiGrowthAreas.length > 0
      ? currentEval.aiGrowthAreas
      : (hasRealActivity
          ? [
              `Deepen high-concurrency performance profiling and distributed telemetry`,
              `Expand automated end-to-end integration and load testing suites`,
            ]
          : [
              `Submit initial daily activity logs and sprint milestones`,
              `Engage with scheduled learning modules and coding assignments`,
            ]);

  return {
    id: currentEval?.id || `eval_${student.id}_${Date.now()}`,
    studentId: student.id,
    batchId: student.batchId || batch?.id || "batch_01",
    reviewerName: reviewer,
    evaluatedAt:
      currentEval?.evaluatedAt ||
      new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    communicationScore: currentEval?.communicationScore ?? commScore,
    communicationNotes,
    grammarScore: currentEval?.grammarScore ?? grammarScore,
    grammarNotes,
    fluencyScore: currentEval?.fluencyScore ?? fluencyScore,
    fluencyNotes,
    projectScore: currentEval?.projectScore ?? projectScore,
    projectNotes,
    customNotes,
    aiVerdict,
    aiSummary,
    aiStrengths,
    aiGrowthAreas,
    overallRating: compositeScore,
    isAIGenerated: true,
  };
}
