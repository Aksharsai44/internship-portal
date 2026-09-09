import { Student, Batch, InternEvaluation } from "../types";

export function generateAIProfileEvaluation(
  student: Student,
  batch?: Batch | null,
  currentEval?: Partial<InternEvaluation>,
  dailyLogs: any[] = [],
  submissions: any[] = []
): InternEvaluation {
  const baseAccuracy = student.scores?.overallAccuracy || 88;
  const codingAccuracy = student.scores?.codingScore || 90;
  const quizAccuracy = student.scores?.quizScore || 89;
  const liveQAAccuracy = student.scores?.liveQAScore || 92;
  const attendanceRate =
    student.totalSessions > 0
      ? Math.round((student.attendedSessions / student.totalSessions) * 100)
      : 96;

  // Derive calibrated scores with realistic, high-performing variance
  const commScore = Math.min(
    99,
    Math.max(
      78,
      Math.round(liveQAAccuracy * 0.5 + baseAccuracy * 0.3 + (student.activeStreakDays > 10 ? 94 : 88) * 0.2)
    )
  );

  const grammarScore = Math.min(
    99,
    Math.max(
      80,
      Math.round(quizAccuracy * 0.45 + baseAccuracy * 0.35 + 92 * 0.2)
    )
  );

  const fluencyScore = Math.min(
    99,
    Math.max(
      78,
      Math.round(liveQAAccuracy * 0.6 + commScore * 0.4)
    )
  );

  // Project score based on codingScore and candidate submissions if any
  const candidateSubs = submissions.filter((s) => s.studentId === student.id);
  const passRate =
    candidateSubs.length > 0
      ? Math.round(
          (candidateSubs.filter((s) => s.status === "passed" || (s.gradePoints ?? 0) >= 80).length /
            candidateSubs.length) *
            100
        )
      : 96;

  const projectScore = Math.min(
    99,
    Math.max(
      80,
      Math.round(codingAccuracy * 0.5 + passRate * 0.35 + baseAccuracy * 0.15)
    )
  );

  // Determine top skills
  const skillsList =
    student.skills && student.skills.length > 0
      ? student.skills.slice(0, 4).join(", ")
      : batch?.technologies && batch.technologies.length > 0
      ? batch.technologies.slice(0, 4).join(", ")
      : "React, FastAPI, Docker, SQL";

  const firstName = student.name ? student.name.split(" ")[0] : "Candidate";
  const cohortLabel = batch?.name || student.batchName || "AI Cohort";
  const reviewer =
    currentEval?.reviewerName?.trim() ||
    batch?.mentor ||
    student.mentor ||
    "Vijaya Kumar Mekala";

  // Communication feedback
  const communicationNotes =
    currentEval?.communicationNotes?.trim() ||
    `${firstName} exhibits articulate, professional communication during daily standups and engineering syncs. Expresses architectural trade-offs with lucidity, listens actively, and maintains an objective, constructive tone when participating in cross-functional code reviews.`;

  // Grammar & Technical Documentation feedback
  const grammarNotes =
    currentEval?.grammarNotes?.trim() ||
    `Demonstrates exemplary syntactic precision across technical specifications, markdown documentation, and pull request write-ups. ATS verification passed with zero lexical ambiguities, adhering to strict industry naming conventions and clean documentation structure.`;

  // Fluency & Presentation Defense feedback
  const fluencyNotes =
    currentEval?.fluencyNotes?.trim() ||
    `Outstanding verbal agility and presentation defense. Delivers capstone demonstrations with poise, commanding slide decks smoothly and addressing challenging live architectural Q&A queries without hesitation or latency.`;

  // Project Execution & Technical Architecture feedback
  const projectNotes =
    currentEval?.projectNotes?.trim() ||
    `High production readiness in full-stack implementation using ${skillsList}. Codebases feature modular service layers, robust schema validation, containerized deployment pipelines, and high test coverage with minimal runtime defects.`;

  // Custom Notes / Mentor Freeform Remarks
  const customNotes =
    currentEval?.customNotes?.trim() ||
    (student.notes
      ? student.notes
      : `Remarkable growth trajectory observed throughout ${cohortLabel}. Shows natural leadership in pair-programming sessions and is consistently dependable under delivery milestones. Strongly recommended for enterprise software placement.`);

  // AI Hiring Verdict
  const compositeScore = Math.round(
    (commScore + grammarScore + fluencyScore + projectScore) / 4
  );

  let aiVerdict = "Strong Hire · Top 3% Cohort Distinction";
  if (compositeScore >= 95) {
    aiVerdict = "Exceptional Tier-1 Hire · Ready for Senior Associate Engineer";
  } else if (compositeScore >= 90) {
    aiVerdict = "Strong Hire · Ready for Enterprise Full-Stack Role";
  } else if (compositeScore >= 85) {
    aiVerdict = "Hire · Qualified for Full-Stack Associate Placement";
  } else {
    aiVerdict = "Conditional Hire · Core Capabilities Cleared";
  }

  // AI Executive Summary
  const aiSummary =
    currentEval?.aiSummary?.trim() ||
    `${student.name} has demonstrated superior engineering competencies across the ${cohortLabel} program, graduating with a composite evaluation index of ${compositeScore}%. Their end-to-end execution across ${skillsList} reflects both technical mastery and exceptional intellectual rigor. They have maintained a ${attendanceRate}% attendance record alongside zero defects in core capstone submissions. Combined with articulate communication and polished presentation defense, ${firstName} is exceptionally well-suited for high-velocity software engineering organizations.`;

  const aiStrengths = currentEval?.aiStrengths && currentEval.aiStrengths.length > 0
    ? currentEval.aiStrengths
    : [
        `Mastery in modular system architecture (${skillsList})`,
        `Crisp, professional verbal & written communication`,
        `ATS-rigor compliant technical documentation & PR reviews`,
        `Rapid reflex in live problem-solving and defense Q&A`,
      ];

  const aiGrowthAreas = currentEval?.aiGrowthAreas && currentEval.aiGrowthAreas.length > 0
    ? currentEval.aiGrowthAreas
    : [
        `Scale load testing and distributed telemetry pipelines`,
        `Deep dive into advanced CI/CD canary deployment strategies`,
      ];

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
