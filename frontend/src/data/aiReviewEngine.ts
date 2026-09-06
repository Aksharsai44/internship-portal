import { DailyActivityLog, AIReviewResult } from "../types";

export function analyzeDailyLogWithAI(log: DailyActivityLog): AIReviewResult {
  const text = (log.description || "").trim();
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const lower = text.toLowerCase();

  // Keyword categories
  const backendTech = ["api", "backend", "database", "sql", "server", "docker", "auth", "jwt", "migration", "fastapi", "django", "node"];
  const frontendTech = ["react", "component", "css", "tailwind", "ui", "ux", "responsive", "modal", "hook", "state", "vite", "typescript"];
  const engineeringPractices = ["test", "lint", "pr", "pull request", "refactor", "git", "benchmark", "optimize", "debug", "fixed", "ci/cd"];

  const foundBackend = backendTech.filter(w => lower.includes(w));
  const foundFrontend = frontendTech.filter(w => lower.includes(w));
  const foundPractices = engineeringPractices.filter(w => lower.includes(w));
  const totalKeywords = foundBackend.length + foundFrontend.length + foundPractices.length;

  // Velocity assessment
  let velocity: AIReviewResult["velocityAssessment"] = "On Track";
  if (log.hasBlockers && log.blockerDescription) {
    velocity = "Blocked";
  } else if (wordCount > 35 && totalKeywords >= 2) {
    velocity = "Outstanding";
  } else if (wordCount < 12) {
    velocity = "Needs Acceleration";
  }

  // Base rating calculation
  let rating = 4.2;
  if (wordCount >= 30) rating += 0.3;
  if (totalKeywords >= 3) rating += 0.3;
  if (foundPractices.length > 0) rating += 0.2;
  if (log.hasBlockers) rating -= 0.2;
  if (wordCount < 15) rating -= 0.5;

  // Clamp rating between 3.2 and 5.0, rounded to 1 decimal place
  rating = Math.min(5.0, Math.max(3.2, Math.round(rating * 10) / 10));

  // Technical highlights
  const technicalHighlights: string[] = [];
  if (foundFrontend.length > 0) {
    technicalHighlights.push(`Implemented client-side interfaces leveraging modern component structures (${foundFrontend.slice(0, 3).join(", ")}).`);
  }
  if (foundBackend.length > 0) {
    technicalHighlights.push(`Integrated data conduits and service logic (${foundBackend.slice(0, 3).join(", ")}).`);
  }
  if (foundPractices.length > 0) {
    technicalHighlights.push(`Maintained rigorous code hygiene and verification protocols (${foundPractices.slice(0, 3).join(", ")}).`);
  }
  if (technicalHighlights.length === 0) {
    technicalHighlights.push("Documented operational tasks and execution sequence.");
    technicalHighlights.push("Maintained continuous progress toward sprint milestones.");
  }

  // Actionable suggestions
  const actionableSuggestions: string[] = [
    "Include direct PR numbers, commit hashes, or API payload benchmarks for measurable tracking.",
    "Tag the specific user story or Jira/linear ticket ID tied to this deliverable."
  ];
  if (wordCount < 20) {
    actionableSuggestions.unshift("Elaborate on edge cases tested, performance trade-offs considered, and error boundaries.");
  }

  // Blocker advice
  let blockerAdvice: string | undefined = undefined;
  if (log.hasBlockers && log.blockerDescription) {
    const blockerLower = log.blockerDescription.toLowerCase();
    if (blockerLower.includes("api") || blockerLower.includes("backend") || blockerLower.includes("500") || blockerLower.includes("cors")) {
      blockerAdvice = "Review network payload inspection in Chrome DevTools Network Tab and verify CORS headers or proxy configuration on the local dev server.";
    } else if (blockerLower.includes("dependency") || blockerLower.includes("npm") || blockerLower.includes("package")) {
      blockerAdvice = "Verify Node/npm version alignment against the package.json lockfile; try clearing node_modules and running a clean install.";
    } else {
      blockerAdvice = "Escalate blocker during the next sync with the technical mentor; prepare minimal reproducible snippet to expedite unblocking.";
    }
  }

  // Summary
  let summary = `Solid technical demonstration with clear sprint deliverables. The intern shows commendable ownership of their tasks.`;
  if (velocity === "Outstanding") {
    summary = `Exceptional productivity and comprehensive execution depth! Strong demonstration of technical maturity and engineering diligence.`;
  } else if (velocity === "Blocked") {
    summary = `Progress documented, but execution is impeded by an active blocker. Prompt mentor intervention is advised to sustain cohort velocity.`;
  } else if (velocity === "Needs Acceleration") {
    summary = `Task entry logged, but lacks sufficient technical detail. Encourage more granular descriptions of architectural changes and testing coverage.`;
  }

  return {
    rating,
    summary,
    velocityAssessment: velocity,
    technicalHighlights,
    blockerAdvice,
    actionableSuggestions,
    reviewedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " - " + new Date().toLocaleDateString(),
  };
}
