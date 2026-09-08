export type ScoreColorCategory = "green" | "yellow" | "orange" | "red";

export interface ScoreColorTheme {
  score: number;
  category: ScoreColorCategory;
  tierLabel: string;
  hexColor: string;
  // Dark Background (for slate-900 dossier banners)
  darkBgClass: string;
  darkBorderClass: string;
  darkTextClass: string;
  darkBadgeClass: string;
  darkGlowStyle: string;
  // Light Background (for white cards and print)
  lightBgClass: string;
  lightBorderClass: string;
  lightTextClass: string;
  lightBadgeClass: string;
  // Print Classes
  printClass: string;
  printTextClass: string;
  printBadgeClass: string;
}

/**
 * Returns dynamic color tokens (green, yellow, orange, red) based on cumulative score percentage
 * - Score >= 85%: Green (Distinction / Top Tier)
 * - 70% <= Score < 85%: Yellow (Proficient / Good)
 * - 50% <= Score < 70%: Orange (Satisfactory / Average)
 * - Score < 50%: Red (Needs Improvement / Critical)
 */
export function getScoreColorTheme(score: number): ScoreColorTheme {
  const clampedScore = Math.min(100, Math.max(0, Math.round(score)));

  if (clampedScore >= 85) {
    return {
      score: clampedScore,
      category: "green",
      tierLabel: "Distinction A+",
      hexColor: "#10b981", // emerald-500
      darkBgClass: "bg-emerald-500/15",
      darkBorderClass: "border-emerald-500/40",
      darkTextClass: "text-emerald-400",
      darkBadgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-400/50",
      darkGlowStyle: "0 8px 24px -4px rgba(16, 185, 129, 0.25)",
      lightBgClass: "bg-emerald-50/90",
      lightBorderClass: "border-emerald-300",
      lightTextClass: "text-emerald-700",
      lightBadgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
      printClass: "print:bg-emerald-50 print:border-emerald-300",
      printTextClass: "print:text-emerald-800",
      printBadgeClass: "print:bg-emerald-100 print:text-emerald-900 print:border-emerald-300",
    };
  }

  if (clampedScore >= 70) {
    return {
      score: clampedScore,
      category: "yellow",
      tierLabel: "Proficient B+",
      hexColor: "#eab308", // yellow-500
      darkBgClass: "bg-yellow-500/15",
      darkBorderClass: "border-yellow-500/40",
      darkTextClass: "text-yellow-300",
      darkBadgeClass: "bg-yellow-500/20 text-yellow-200 border-yellow-400/50",
      darkGlowStyle: "0 8px 24px -4px rgba(234, 179, 8, 0.25)",
      lightBgClass: "bg-yellow-50/90",
      lightBorderClass: "border-yellow-300",
      lightTextClass: "text-yellow-700",
      lightBadgeClass: "bg-yellow-100 text-yellow-800 border-yellow-300",
      printClass: "print:bg-yellow-50 print:border-yellow-300",
      printTextClass: "print:text-yellow-800",
      printBadgeClass: "print:bg-yellow-100 print:text-yellow-900 print:border-yellow-300",
    };
  }

  if (clampedScore >= 50) {
    return {
      score: clampedScore,
      category: "orange",
      tierLabel: "Satisfactory C",
      hexColor: "#f97316", // orange-500
      darkBgClass: "bg-orange-500/15",
      darkBorderClass: "border-orange-500/40",
      darkTextClass: "text-orange-400",
      darkBadgeClass: "bg-orange-500/20 text-orange-200 border-orange-400/50",
      darkGlowStyle: "0 8px 24px -4px rgba(249, 115, 22, 0.25)",
      lightBgClass: "bg-orange-50/90",
      lightBorderClass: "border-orange-300",
      lightTextClass: "text-orange-700",
      lightBadgeClass: "bg-orange-100 text-orange-800 border-orange-300",
      printClass: "print:bg-orange-50 print:border-orange-300",
      printTextClass: "print:text-orange-800",
      printBadgeClass: "print:bg-orange-100 print:text-orange-900 print:border-orange-300",
    };
  }

  return {
    score: clampedScore,
    category: "red",
    tierLabel: "Needs Improvement",
    hexColor: "#ef4444", // red-500
    darkBgClass: "bg-rose-500/15",
    darkBorderClass: "border-rose-500/40",
    darkTextClass: "text-rose-400",
    darkBadgeClass: "bg-rose-500/20 text-rose-200 border-rose-400/50",
    darkGlowStyle: "0 8px 24px -4px rgba(239, 68, 68, 0.25)",
    lightBgClass: "bg-rose-50/90",
    lightBorderClass: "border-rose-300",
    lightTextClass: "text-rose-700",
    lightBadgeClass: "bg-rose-100 text-rose-800 border-rose-300",
    printClass: "print:bg-rose-50 print:border-rose-300",
    printTextClass: "print:text-rose-800",
    printBadgeClass: "print:bg-rose-100 print:text-rose-900 print:border-rose-300",
  };
}
