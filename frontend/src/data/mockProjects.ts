import { ProjectAssignment, ProjectSubmission } from "../types";

export const INITIAL_PROJECT_ASSIGNMENTS: ProjectAssignment[] = [
  {
    id: "proj_01",
    batchId: "all",
    batchName: "Summer 2026 UI/UX & Product Design",
    title: "Implement Interactive Data Visualization Dashboard",
    technicalCategory: "Frontend (React, Tailwind, State)",
    deadline: "2026-09-12",
    startDate: "2026-09-01",
    startTime: "09:00",
    deadlineTime: "23:59",
    priority: "Medium",
    leaderboardPoints: 100,
    executiveSummary:
      "Create an accessible, responsive dashboard view featuring real-time data streaming simulation, filter controls, and CSS charts.",
    detailedInstructions: `1. Connect mock streaming WebSocket or timer-based state.
2. Implement Recharts / SVG visualizers for metrics over time.
3. Include a CSV download feature with clean header mapping.
4. Ensure responsive breakdown on tablet and mobile viewports.
5. Verify keyboard navigation across all interactive widgets.`,
    resources: [
      {
        id: "res-1",
        title: "Dashboard UX Best Practices",
        url: "https://uxdesign.cc/dashboard-design-best-practices",
        type: "link",
      },
      {
        id: "res-2",
        title: "Motion Animation Guidelines",
        url: "https://m3.material.io/styles/motion/overview",
        type: "link",
      },
    ],
    mentorObservationBenchmark: `• Internal Scenario Benchmark:
1. Verify candidate handled timer teardown/WebSocket disconnects in useEffect cleanup without memory leaks.
2. Check if Recharts ResponsiveContainer is memoized to avoid redundant redraws on tick updates.
3. Confirm clean TypeScript typing for data points rather than defaulting to 'any'.
4. Verify edge cases: zero data state, single data point, and max value overflow scaling.`,
    createdAt: "2026-08-20T10:00:00Z",
    createdBy: "Dr. Emeka Nwosu",
    status: "todo",
  },
  {
    id: "proj_02",
    batchId: "all",
    batchName: "Summer 2026 UI/UX & Product Design",
    title: "Build Enterprise Design System & Figma Token Bridge",
    technicalCategory: "UI/UX",
    deadline: "2026-09-08",
    startDate: "2026-09-02",
    startTime: "10:00",
    deadlineTime: "18:00",
    priority: "High",
    leaderboardPoints: 120,
    executiveSummary:
      "Construct a synchronized color and typography token architecture using CSS custom properties with WCAG AA contrast compliance.",
    detailedInstructions: `1. Map Figma variable collections into CSS tokens.
2. Support light and dark theme switching without flashes of unstyled content (FOUC).
3. Verify color contrast ratios meet WCAG AA standards (4.5:1 text, 3:1 graphical).
4. Create interactive component documentation with copyable CSS variables.`,
    resources: [
      {
        id: "res-3",
        title: "Figma Tokens Architecture Spec",
        url: "https://tokens.studio/documentation",
        type: "doc",
      },
      {
        id: "res-4",
        title: "WCAG 2.1 Contrast Testing Guide",
        url: "https://webaim.org/resources/contrastchecker",
        type: "link",
      },
    ],
    mentorObservationBenchmark: `• Internal Scenario Benchmark:
1. Ensure CSS variables are declared on :root with fallbacks.
2. Semantic tokens (--color-bg-primary) must be abstracted from primitive color ramps (--color-indigo-600).
3. Theme toggle should persist to localStorage and sync with OS prefers-color-scheme.
4. Screen reader announcements must trigger when theme mode changes.`,
    createdAt: "2026-08-15T09:30:00Z",
    createdBy: "Sarah Kimani",
    status: "in_progress",
  },
  {
    id: "proj_03",
    batchId: "all",
    batchName: "Full-Stack AI Engineering",
    title: "Containerized Microservice & API Rate Limiting",
    technicalCategory: "DevOps",
    deadline: "2026-09-06",
    startDate: "2026-09-01",
    startTime: "09:30",
    deadlineTime: "23:59",
    priority: "High",
    leaderboardPoints: 150,
    executiveSummary:
      "Build a containerized REST API with Redis token-bucket rate limiting and automated GitHub Actions CI pipeline.",
    detailedInstructions: `1. Configure multi-stage Dockerfile optimizing bundle under 150MB.
2. Implement Redis token-bucket algorithm limiting clients to 60 req/min with 429 response.
3. Write GitHub Actions workflow running automated unit and integration tests.
4. Expose Prometheus /metrics endpoint for telemetry tracking.`,
    resources: [
      {
        id: "res-5",
        title: "Redis Token Bucket Algorithm Paper",
        url: "https://redis.io/glossary/rate-limiting",
        type: "pdf",
      },
      {
        id: "res-6",
        title: "GitHub Actions CI Starter Workflow",
        url: "https://docs.github.com/actions",
        type: "repo",
      },
    ],
    mentorObservationBenchmark: `• Internal Scenario Benchmark:
1. Redis connection failures must fall back to in-memory rate limiting or bypass gracefully without 500 error.
2. Non-root user must be specified in the final Docker production layer.
3. Docker image size must be validated under 150MB.
4. Rate limit response must include standard headers (X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After).`,
    createdAt: "2026-08-12T14:00:00Z",
    createdBy: "James Okafor",
    status: "in_progress",
  },
  {
    id: "proj_04",
    batchId: "all",
    batchName: "Full-Stack AI Engineering",
    title: "AI Summary Extraction Pipeline with Gemini SDK",
    technicalCategory: "AI & Algorithms",
    deadline: "2026-08-30",
    startDate: "2026-08-20",
    startTime: "09:00",
    deadlineTime: "17:00",
    priority: "Medium",
    leaderboardPoints: 110,
    executiveSummary:
      "Integrate the @google/genai SDK to parse lengthy PDF reports and return structured JSON key takeaways and action points.",
    detailedInstructions: `1. Extract text cleanly from uploaded PDF documents using pdfjs-dist.
2. Stream responses from Gemini 2.5 Flash using structured JSON output schema.
3. Implement exponential backoff for API quota 429 retries.
4. Generate confidence scores and verification citations for extracted bullets.`,
    resources: [
      {
        id: "res-7",
        title: "Gemini Structured Output SDK Guide",
        url: "https://ai.google.dev/gemini-api/docs/structured-outputs",
        type: "doc",
      },
    ],
    mentorObservationBenchmark: `• Internal Scenario Benchmark:
1. Prompt template must sanitize user inputs against prompt injection payloads.
2. Documents exceeding context window must be chunked with map-reduce summarization.
3. Exponential backoff must include random jitter to prevent thundering herd.`,
    createdAt: "2026-08-01T11:00:00Z",
    createdBy: "Dr. Emeka Nwosu",
    status: "completed",
  },
  {
    id: "proj_05",
    batchId: "all",
    batchName: "Summer 2026 UI/UX & Product Design",
    title: "Accessibility Audit & Screen Reader Polish",
    technicalCategory: "UI/UX",
    deadline: "2026-08-26",
    startDate: "2026-08-15",
    startTime: "11:00",
    deadlineTime: "23:59",
    priority: "Low",
    leaderboardPoints: 90,
    executiveSummary:
      "Perform a comprehensive WCAG audit on the main onboarding journey and fix keyboard navigation and ARIA landmarks.",
    detailedInstructions: `1. Test keyboard tab navigation through all interactive modal dialogs.
2. Add aria-live regions for dynamic state updates and asynchronous notifications.
3. Provide skip-to-content anchor links at page top.
4. Document audit findings using axe-core and Lighthouse scoring reports.`,
    resources: [
      {
        id: "res-8",
        title: "W3C WAI-ARIA Authoring Practices Guide",
        url: "https://www.w3.org/WAI/ARIA/apg",
        type: "link",
      },
    ],
    mentorObservationBenchmark: `• Internal Scenario Benchmark:
1. Modal must implement active focus trap (Tab key cannot escape into backdrop).
2. Escape key must dismiss modal and return focus to triggering element.
3. Form error messages must have aria-describedby linked to the input ID.`,
    createdAt: "2026-07-28T09:00:00Z",
    createdBy: "Sarah Kimani",
    status: "completed",
  },
];

export const INITIAL_PROJECT_SUBMISSIONS: ProjectSubmission[] = [
  // Project 01: Implement Interactive Data Visualization Dashboard (Deadline: 2026-09-12)
  {
    id: "sub_101",
    projectId: "proj_01",
    studentId: "student_01",
    studentName: "Alex Rivera",
    batchId: "batch-01",
    submittedAt: "2026-09-10T14:30:00Z", // On-time
    githubRepoUrl: "https://github.com/alexrivera-ux/realtime-viz-dashboard",
    liveDemoUrl: "https://alex-viz-demo.vercel.app",
    fileName: "dashboard-analytics-bundle.zip",
    fileSize: "18.5 MB",
    submissionNotes:
      "Engineered responsive SVG area and bar charts with WebSocket streaming simulator. Teardown logic handled cleanly in useEffect hook to prevent memory leaks during rapid updates.",
    status: "pending",
  },
  {
    id: "sub_102",
    projectId: "proj_01",
    studentId: "stu_02",
    studentName: "Priya Sharma",
    batchId: "batch-01",
    submittedAt: "2026-09-11T09:15:00Z", // On-time
    githubRepoUrl: "https://github.com/priyasharma/metrics-visualizer",
    liveDemoUrl: "https://priya-metrics.vercel.app",
    fileName: "priya-viz-dist.tar.gz",
    fileSize: "12.1 MB",
    submissionNotes:
      "Created modular Recharts widgets with strict TypeScript interfaces. CSV export handles nested key mapping with zero formatting glitches.",
    status: "passed",
    gradePoints: 100,
    mentorFeedback:
      "Exceptional component modularity. Strict typing and clean cleanup hooks meet our highest production standards.",
  },
  {
    id: "sub_103",
    projectId: "proj_01",
    studentId: "stu_03",
    studentName: "Marcus Chen",
    batchId: "batch-01",
    submittedAt: "2026-09-13T10:00:00Z", // Late (Deadline was 2026-09-12)
    githubRepoUrl: "https://github.com/marcuschen/stream-viz-app",
    liveDemoUrl: "https://marcus-charts.vercel.app",
    fileName: "marcus-deliverables.zip",
    fileSize: "9.8 MB",
    submissionNotes:
      "Added timer-based tick controls and CSV export. Submitted 1 day late due to local Docker test environment troubleshooting.",
    status: "needs_revision",
    gradePoints: 75,
    mentorFeedback:
      "Good chart visuals, but ResponsiveContainer triggers redraws on tick. Please memoize and handle window resize listener teardown.",
  },

  // Project 02: Build Enterprise Design System & Figma Token Bridge (Deadline: 2026-09-08)
  {
    id: "sub_01",
    projectId: "proj_02",
    studentId: "student_01",
    studentName: "Alex Rivera",
    batchId: "batch-01",
    submittedAt: "2026-09-02T16:20:00Z", // On-time
    githubRepoUrl: "https://github.com/alexrivera-ux/corporate-token",
    liveDemoUrl: "https://alex-tokens-preview.vercel.app",
    fileName: "design-system-tokens-bundle.zip",
    fileSize: "14.2 MB",
    submissionNotes:
      "Implemented the full WCAG AA token contrast system with automated theme variables. Verified on Chrome, Firefox, and Safari. Documented all 48 semantic color tokens with copyable CSS snippets.",
    status: "pending",
  },
  {
    id: "sub_202",
    projectId: "proj_02",
    studentId: "stu_04",
    studentName: "Sophia Rodriguez",
    batchId: "batch-01",
    submittedAt: "2026-09-05T11:20:00Z", // On-time
    githubRepoUrl: "https://github.com/sophiarodriguez/figma-token-engine",
    liveDemoUrl: "https://sophia-tokens.vercel.app",
    fileName: "token-bridge-package.zip",
    fileSize: "11.4 MB",
    submissionNotes:
      "Extracted tokens directly via Figma REST API into custom CSS properties. Contrast checker built with WCAG AA compliance.",
    status: "passed",
    gradePoints: 120,
    mentorFeedback:
      "Stunning design system architecture! The automatic theme switcher with localStorage persistence is flawless.",
  },

  // Project 03: Containerized Microservice & API Rate Limiting (Deadline: 2026-09-06)
  {
    id: "sub_301",
    projectId: "proj_03",
    studentId: "student_01",
    studentName: "Alex Rivera",
    batchId: "batch-01",
    submittedAt: "2026-09-04T18:00:00Z", // On-time
    githubRepoUrl: "https://github.com/alexrivera-ux/redis-rate-limiter",
    liveDemoUrl: "https://alex-ratelimiter.up.railway.app",
    fileName: "microservice-deliverable.tar.gz",
    fileSize: "6.7 MB",
    submissionNotes:
      "Multi-stage Dockerfile built under 128MB. Redis token bucket algorithm enforces 60 req/min with standard Retry-After and X-RateLimit headers.",
    status: "passed",
    gradePoints: 150,
    mentorFeedback:
      "Great Docker optimization and fallback logic when Redis drops. Passed all container security checks.",
  },
  {
    id: "sub_302",
    projectId: "proj_03",
    studentId: "stu_03",
    studentName: "Marcus Chen",
    batchId: "batch-01",
    submittedAt: "2026-09-05T19:30:00Z", // On-time
    githubRepoUrl: "https://github.com/marcuschen/rate-limited-api",
    liveDemoUrl: "https://marcus-api.fly.dev",
    fileName: "docker-ci-pipeline.zip",
    fileSize: "15.0 MB",
    submissionNotes:
      "Configured GitHub Actions CI pipeline running unit tests on pull requests. Prometheus /metrics endpoint is exposed for scraping.",
    status: "pending",
  },

  // Project 04: AI Summary Extraction Pipeline with Gemini SDK (Deadline: 2026-08-30)
  {
    id: "sub_02",
    projectId: "proj_04",
    studentId: "student_01",
    studentName: "Alex Rivera",
    batchId: "batch-01",
    submittedAt: "2026-08-29T14:10:00Z", // On-time
    githubRepoUrl: "https://github.com/alexrivera-ux/gemini-pdf-summary",
    liveDemoUrl: "https://gemini-pdf-extractor.vercel.app",
    fileName: "gemini-pipeline-deliverable.tar.gz",
    fileSize: "8.6 MB",
    submissionNotes:
      "Successfully integrated Gemini Flash 2.5 with JSON schema enforcement. Handled PDF chunking for documents up to 60 pages with retry backoff.",
    status: "passed",
    gradePoints: 110,
    mentorFeedback:
      "Outstanding implementation! Clean schema validation and impressive token efficiency. Passed all benchmark scenarios.",
  },
  {
    id: "sub_402",
    projectId: "proj_04",
    studentId: "stu_04",
    studentName: "Sophia Rodriguez",
    batchId: "batch-01",
    submittedAt: "2026-08-30T16:45:00Z", // On-time
    githubRepoUrl: "https://github.com/sophiarodriguez/llm-summary-engine",
    liveDemoUrl: "https://sophia-gemini.vercel.app",
    fileName: "gemini-summary-build.zip",
    fileSize: "7.9 MB",
    submissionNotes:
      "Implemented exponential backoff with jitter. Extracted citations mapped back to page numbers in the source PDF.",
    status: "passed",
    gradePoints: 110,
    mentorFeedback:
      "Perfect error resilience and prompt injection sanitization. Exceeded benchmark expectations!",
  },

  // Project 05: Accessibility Audit & Screen Reader Polish (Deadline: 2026-08-26)
  {
    id: "sub_03",
    projectId: "proj_05",
    studentId: "student_01",
    studentName: "Alex Rivera",
    batchId: "batch-01",
    submittedAt: "2026-08-25T11:45:00Z", // On-time
    githubRepoUrl: "https://github.com/alexrivera-ux/wcag-audit-suite",
    liveDemoUrl: "https://audit-preview.vercel.app",
    fileName: "axe-audit-results.pdf",
    fileSize: "3.1 MB",
    submissionNotes:
      "Fixed 18 accessibility violations across navigation and modals. Lighthouse accessibility score improved from 72 to 98.",
    status: "needs_revision",
    gradePoints: 65,
    mentorFeedback:
      "Great start, but modal focus trap is incomplete when navigating backwards with Shift+Tab. Please fix and resubmit.",
  },
  {
    id: "sub_502",
    projectId: "proj_05",
    studentId: "stu_02",
    studentName: "Priya Sharma",
    batchId: "batch-01",
    submittedAt: "2026-08-26T15:00:00Z", // On-time
    githubRepoUrl: "https://github.com/priyasharma/a11y-audit-suite",
    liveDemoUrl: "https://priya-a11y.vercel.app",
    fileName: "accessibility-report-v2.pdf",
    fileSize: "4.2 MB",
    submissionNotes:
      "Added aria-live regions for asynchronous state notifications and skip-to-content links. Resolved focus trap edge cases.",
    status: "passed",
    gradePoints: 90,
    mentorFeedback:
      "Thorough and rigorous audit. Focus restoration on modal close works reliably across all browser engines.",
  },
];
