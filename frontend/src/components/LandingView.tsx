import React, { useState, useEffect } from 'react';
import {
  ArrowRight, Code2, Terminal, Trophy, Users,
  Zap, BarChart3, Award, ShieldCheck, Monitor, Layers,
  CheckCircle2, Star, ChevronRight, ChevronDown, Sparkles, Play,
  GraduationCap, Brain, Cpu, Globe, Building2,
  Calendar, Flame, Filter, Check, Briefcase, Clock,
  Laptop, RefreshCw
} from 'lucide-react';
import { Minda2Logo } from './Minda2Logo';

interface LandingViewProps {
  onLoginClick: () => void;
}

const LandingView: React.FC<LandingViewProps> = ({ onLoginClick }) => {
  const [scrollY, setScrollY] = useState(0);
  const [heroTab, setHeroTab] = useState<'ide' | 'leaderboard' | 'client'>('ide');
  const [isIdeRunning, setIsIdeRunning] = useState(false);
  const [ideRunComplete, setIdeRunComplete] = useState(true);
  const [selectedRole, setSelectedRole] = useState<'intern' | 'client' | 'admin'>('intern');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [demoInterviewRequested, setDemoInterviewRequested] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleRunCode = () => {
    setIsIdeRunning(true);
    setIdeRunComplete(false);
    setTimeout(() => {
      setIsIdeRunning(false);
      setIdeRunComplete(true);
    }, 900);
  };

  const stats = [
    { value: "3 - 6 Mo", label: "Structured Tracks", highlight: "Full Immersion" },
    { value: "500+", label: "Interns Mentored", highlight: "Top 5% Selection" },
    { value: "96%", label: "Placement Rate", highlight: "Tech & AI Roles" },
    { value: "50+", label: "Hiring Clients", highlight: "Direct Interviewing" },
  ];

  const tracks = [
    {
      badge: "Track 01",
      title: "Agentic AI & LLM Systems",
      duration: "3 - 6 Months",
      description: "Build autonomous multi-agent swarms, RAG pipelines, and production vector architectures with CrewAI, LangChain, and modern model APIs.",
      skills: ["Autonomous Agents", "CrewAI", "Vector DBs", "RAG Systems", "Prompt Architecture", "FastAPI"],
      iconBg: "bg-sky-50 text-sky-600 border border-sky-200/80",
      border: "border-slate-200/90 hover:border-sky-300 hover:shadow-sky-500/10",
      accent: "text-sky-600",
      badgeColor: "bg-sky-50 text-sky-700 border-sky-200",
      icon: Brain,
    },
    {
      badge: "Track 02",
      title: "Full-Stack Cloud Engineering",
      duration: "3 - 6 Months",
      description: "Architect distributed enterprise systems with React 19, TypeScript, scalable Python/Node backends, and containerized Docker services.",
      skills: ["React 19 & TypeScript", "Python / Node.js", "PostgreSQL", "Docker", "REST & GraphQL", "CI/CD"],
      iconBg: "bg-indigo-50 text-indigo-600 border border-indigo-200/80",
      border: "border-slate-200/90 hover:border-indigo-300 hover:shadow-indigo-500/10",
      accent: "text-indigo-600",
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
      icon: Monitor,
    },
    {
      badge: "Track 03",
      title: "Data & Systems Architecture",
      duration: "3 - 6 Months",
      description: "Master high-throughput data processing, caching tiers, cloud infrastructure observability, and production microservice design.",
      skills: ["Distributed DBs", "Redis Cache", "System Design", "Cloud Infrastructure", "Telemetry", "Kubernetes"],
      iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-200/80",
      border: "border-slate-200/90 hover:border-emerald-300 hover:shadow-emerald-500/10",
      accent: "text-emerald-600",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: Cpu,
    },
  ];

  const roadmapSteps = [
    {
      step: "01",
      phase: "Phase 1: Onboarding & Track Selection",
      title: "Diagnostic Assessment & Cohort Placement",
      description: "Interns undergo baseline skill mapping across algorithms, system architecture, and modern coding workflows to place into 3 or 6-month specialized tracks.",
      tags: ["Skill Diagnostics", "Cohort Onboarding", "Dedicated Mentor Assigned"],
    },
    {
      step: "02",
      phase: "Phase 2: In-Browser Hands-On Building",
      title: "Cloud IDE Challenges & Production PRs",
      description: "Write production-grade code in the embedded multi-language IDE. Automated compiler evaluations and mentor PR reviews ensure rigorous real-world mastery.",
      tags: ["In-Browser IDE", "Automated Unit Tests", "Peer Code Reviews"],
    },
    {
      step: "03",
      phase: "Phase 3: Live Benchmark & Leaderboard",
      title: "Transparent Scoring & Verified Telemetry",
      description: "Every milestone, speed benchmark, and assignment accuracy score feeds the live cohort leaderboard. Interns earn badges and showcase transparent competence.",
      tags: ["Live Ranking", "Milestone Badges", "Verified Telemetry"],
    },
    {
      step: "04",
      phase: "Phase 4: Direct Client Discovery & Placement",
      title: "Hiring Partners Shortlist & Schedule Interviews",
      description: "Corporate hiring clients log into their dedicated portal to inspect ranked profiles, review verified code submissions, and book direct technical interviews in 1 click.",
      tags: ["Direct Partner Access", "1-Click Scheduling", "Full-Time Placement"],
    },
  ];

  const roleDetails = {
    intern: {
      title: "For Interns & Technical Candidates",
      subtitle: "Graduate from tutorials to writing real production systems with verified proof of work.",
      points: [
        {
          title: "In-Browser Cloud IDE & Compiler",
          desc: "Code in Python, JavaScript, TypeScript, and C++ with immediate test case execution, debugging, and execution metrics.",
        },
        {
          title: "Gamified Telemetry & Leaderboard",
          desc: "Rise through the cohort ranks based on code quality, assignment test passes, and milestone speed.",
        },
        {
          title: "Direct Corporate Interview Requests",
          desc: "Bypass cold resumes. Hiring clients review your verified code projects and invite you to interviews directly.",
        },
        {
          title: "Official Verified Certificate & Credential",
          desc: "Receive cryptographically verifiable certificate templates authenticated by MIND2I mentors and directors.",
        },
      ],
      badgeText: "Intern Experience",
      statNumber: "4.9/5",
      statLabel: "Intern Cohort Satisfaction",
    },
    client: {
      title: "For Hiring Partners & Corporate Clients",
      subtitle: "Access pre-vetted, top-tier technical talent with zero guesswork and transparent telemetry.",
      points: [
        {
          title: "Live Cohort Leaderboards & Telemetry",
          desc: "Evaluate candidates ranked by real algorithmic problem solving, clean code architecture, and project accuracy.",
        },
        {
          title: "Candidate Code Review & Portfolios",
          desc: "Inspect actual source code submissions and automated unit test results before booking an interview.",
        },
        {
          title: "1-Click Direct Interview Booking",
          desc: "Schedule technical rounds with shortlisted interns through integrated calendar scheduling tools.",
        },
        {
          title: "Custom Skill Filters & Stack Matching",
          desc: "Filter candidates by AI/LLM experience, React/TypeScript proficiency, Python backend expertise, and cohort batch.",
        },
      ],
      badgeText: "Hiring Partner Portal",
      statNumber: "75%",
      statLabel: "Reduction in Time-to-Hire",
    },
    admin: {
      title: "For Admins & Technical Mentors",
      subtitle: "Comprehensive cohort orchestration, automated grading, and enterprise telemetry in one dashboard.",
      points: [
        {
          title: "Multi-Cohort Lifecycle Management",
          desc: "Manage concurrent 3-month and 6-month batches, assign mentors, and monitor student attendance and progress.",
        },
        {
          title: "Automated Assignment & Test Case Engine",
          desc: "Publish coding tasks with hidden unit test suites, timeout thresholds, and automated scoring pipelines.",
        },
        {
          title: "Client Access & Candidate Permissions",
          desc: "Invite hiring partners, assign cohort visibility, and track corporate interview pipelines and placement rates.",
        },
        {
          title: "Live Q&A & Community Mentorship Hub",
          desc: "Host live technical breakout rooms, answer intern questions in real time, and broadcast milestone updates.",
        },
      ],
      badgeText: "Admin Command Center",
      statNumber: "100%",
      statLabel: "Automated Grading & Tracking",
    },
  };

  const faqs = [
    {
      q: "What makes MIND2I different from traditional bootcamps or training programs?",
      a: "MIND2I combines an in-browser multi-language development IDE, automated code evaluation test cases, and a transparent live leaderboard with a dedicated corporate hiring portal. Instead of speculative resumes, hiring clients evaluate candidates based on verified execution data, code architecture, and milestone consistency.",
    },
    {
      q: "How does the corporate client portal work for hiring partners?",
      a: "Hiring partners receive direct portal access where they can explore active 3-month and 6-month cohorts. Partners filter candidates by tech stack (Agentic AI, Full-Stack, Cloud), view actual submitted code with automated pass rates, shortlist top performers, and book technical interviews directly through the platform.",
    },
    {
      q: "What technologies and stacks are covered during the internship?",
      a: "The core curriculum focuses on high-demand modern engineering: Agentic AI swarms (CrewAI, LangChain, vector databases, RAG architecture), Full-Stack development (React 19, TypeScript, Python FastAPI, Node.js), and Cloud Infrastructure (PostgreSQL, Docker containers, CI/CD, distributed architecture).",
    },
    {
      q: "Are the internship certificates officially verified?",
      a: "Yes. Every completed internship issues an authenticated MIND2I certificate equipped with verifiable milestone criteria, cohort track identification, and mentor credentials suitable for LinkedIn and employer validation.",
    },
    {
      q: "How can university departments or organizations partner with MIND2I?",
      a: "Admins can onboard entire student batches via CSV or QR registration, designate faculty mentors, configure custom curriculum modules, and connect graduating cohorts directly to our corporate partner hiring network.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-sky-500 selection:text-white flex flex-col overflow-x-hidden">

      {/* ================= BACKGROUND GLOWS & LIGHT TECH GRID ================= */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Soft Modern Tech Grid */}
        <div
          className="absolute inset-0 opacity-[0.55]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(226, 232, 240, 0.7) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(226, 232, 240, 0.7) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 25%, black 40%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 25%, black 40%, transparent 100%)',
          }}
        />

        {/* Luminous Soft Aurora Orbs (Pure Light Accent) */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[950px] h-[550px] bg-gradient-to-b from-sky-300/25 via-indigo-200/20 to-transparent rounded-full blur-[120px]" />
        <div className="absolute top-[28%] -left-36 w-[550px] h-[550px] bg-emerald-200/20 rounded-full blur-[130px]" />
        <div className="absolute top-[35%] -right-36 w-[600px] h-[600px] bg-purple-200/20 rounded-full blur-[140px]" />
        <div className="absolute bottom-[10%] left-1/3 w-[700px] h-[450px] bg-cyan-200/20 rounded-full blur-[140px]" />
      </div>

      {/* ================= TOP NAVBAR ================= */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrollY > 20
            ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-md shadow-slate-200/40'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Cohort Status */}
          <div className="flex items-center gap-4">
            <Minda2Logo size="md" showTagline={false} />
            <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
              <span>Cohorts 2026 Live</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/80 p-2 rounded-full border border-slate-200/90 backdrop-blur-md shadow-xs">
            <a
              href="#ecosystem"
              className="px-5 py-2.5 rounded-full text-sm lg:text-base font-black text-slate-700 hover:text-slate-950 hover:bg-white transition-all shadow-2xs hover:shadow-xs"
            >
              Live Simulator
            </a>
            <a
              href="#tracks"
              className="px-5 py-2.5 rounded-full text-sm lg:text-base font-black text-slate-700 hover:text-slate-950 hover:bg-white transition-all hover:bg-white shadow-2xs hover:shadow-xs"
            >
              Tracks
            </a>
            <a
              href="#roles"
              className="px-5 py-2.5 rounded-full text-sm lg:text-base font-black text-slate-700 hover:text-slate-950 hover:bg-white transition-all hover:bg-white shadow-2xs hover:shadow-xs"
            >
              For Roles
            </a>
            <a
              href="#roadmap"
              className="px-5 py-2.5 rounded-full text-sm lg:text-base font-black text-slate-700 hover:text-slate-950 hover:bg-white transition-all hover:bg-white shadow-2xs hover:shadow-xs"
            >
              Roadmap
            </a>
            <a
              href="#faq"
              className="px-5 py-2.5 rounded-full text-sm lg:text-base font-black text-slate-700 hover:text-slate-950 hover:bg-white transition-all hover:bg-white shadow-2xs hover:shadow-xs"
            >
              FAQ
            </a>
          </nav>

          {/* Login / Action Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={onLoginClick}
              className="relative group px-6 py-2.5 rounded-xl font-black text-sm sm:text-base text-white bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-600 hover:to-indigo-700 shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <span>Sign In to Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-white/15 translate-y-full group-hover:translate-y-0 transition-transform duration-200" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200/70"
              aria-label="Toggle menu"
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <span className={`h-0.5 w-full bg-current transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                <span className={`h-0.5 w-full bg-current transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`h-0.5 w-full bg-current transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-2 shadow-lg">
            <a
              href="#ecosystem"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-base text-slate-800 hover:bg-slate-100 font-extrabold"
            >
              Live Simulator
            </a>
            <a
              href="#tracks"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-base text-slate-800 hover:bg-slate-100 font-extrabold"
            >
              Curriculum Tracks
            </a>
            <a
              href="#roles"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-base text-slate-800 hover:bg-slate-100 font-extrabold"
            >
              Role Benefits
            </a>
            <a
              href="#roadmap"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-base text-slate-800 hover:bg-slate-100 font-extrabold"
            >
              Cohort Roadmap
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-base text-slate-800 hover:bg-slate-100 font-extrabold"
            >
              FAQ
            </a>
          </div>
        )}
      </header>

      {/* ================= HERO SECTION ================= */}
      <section className="relative z-10 pt-8 pb-14 md:pt-12 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Main Headline & Badge */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-50 border border-sky-200/90 text-sky-700 text-[11px] font-black uppercase tracking-wider mb-4 shadow-xs backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
              <span>AI-Engineered Technical Internship Platform</span>
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <span className="text-slate-600 font-bold">Hiring Pipeline</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-black tracking-tight text-slate-900 leading-[1.2] mb-4">
              Where Technical Interns Build Real Systems &{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600">
                Hiring Teams Hire Top 1%
              </span>
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-slate-600 font-normal max-w-2xl mx-auto leading-relaxed mb-6">
              The unified portal for 3 to 6-month intensive technical internships. Complete hands-on coding challenges in an in-browser cloud IDE, scale live cohort leaderboards, and connect directly with verified corporate hiring partners.
            </p>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
              <button
                onClick={onLoginClick}
                className="px-6 py-3 rounded-xl font-black text-xs sm:text-sm text-white bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/15 hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Enter Portal & Login</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <a
                href="#ecosystem"
                className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 shadow-xs transition-all duration-200 flex items-center gap-2"
              >
                <Laptop className="w-3.5 h-3.5 text-sky-600" />
                <span>Explore Live Simulator</span>
              </a>
            </div>

            {/* Live KPI Metric Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-sky-300 transition-all text-center group"
                >
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 group-hover:text-sky-600 transition-colors">
                    {stat.value}
                  </div>
                  <div className="text-xs font-bold text-slate-600 mt-1">{stat.label}</div>
                  <div className="text-[10px] font-bold text-sky-600 uppercase tracking-wider mt-0.5">
                    {stat.highlight}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ================= INTERACTIVE HERO PLATFORM SIMULATOR ================= */}
          <div id="ecosystem" className="max-w-5xl mx-auto">
            <div className="relative rounded-3xl p-1.5 bg-gradient-to-b from-sky-400/30 via-indigo-300/20 to-slate-200/60 shadow-2xl shadow-slate-300/60">
              <div className="rounded-[22px] bg-white border border-slate-200 overflow-hidden shadow-sm">
                
                {/* Simulator Window Header Bar */}
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="text-xs font-mono font-bold text-slate-500 ml-2 select-none">
                      mind2i-cloud-platform // interactive-preview
                    </span>
                  </div>

                  {/* Simulator Tab Switches */}
                  <div className="flex items-center bg-slate-200/70 p-1 rounded-xl border border-slate-300/60">
                    <button
                      onClick={() => setHeroTab('ide')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        heroTab === 'ide'
                          ? 'bg-white text-sky-700 shadow-sm border border-slate-200'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>Cloud IDE</span>
                    </button>
                    <button
                      onClick={() => setHeroTab('leaderboard')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        heroTab === 'leaderboard'
                          ? 'bg-white text-amber-700 shadow-sm border border-slate-200'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Trophy className="w-3.5 h-3.5" />
                      <span>Live Leaderboard</span>
                    </button>
                    <button
                      onClick={() => setHeroTab('client')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        heroTab === 'client'
                          ? 'bg-white text-emerald-700 shadow-sm border border-slate-200'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Client Portal</span>
                    </button>
                  </div>
                </div>

                {/* Tab Content 1: Cloud IDE Preview */}
                {heroTab === 'ide' && (
                  <div className="p-4 sm:p-6 bg-slate-50/50 font-mono text-xs sm:text-sm">
                    {/* IDE Sub-header */}
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 text-xs">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Terminal className="w-4 h-4 text-sky-600" />
                        <span className="text-sky-700 font-bold">agent_executor.py</span>
                        <span className="text-slate-500">• Python 3.12 (Virtual Sandbox)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="hidden sm:inline-flex items-center gap-1.5 text-slate-600 font-medium">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          <span>42ms latency</span>
                        </span>
                        <button
                          onClick={handleRunCode}
                          disabled={isIdeRunning}
                          className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 shadow-sm"
                        >
                          {isIdeRunning ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Compiling...</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-white" />
                              <span>Execute & Run</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Code Editor Body */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                      {/* Left Code Area (Crisp Dark VS-Style Editor Box) */}
                      <div className="lg:col-span-8 bg-slate-950 p-4 rounded-xl border border-slate-800 leading-relaxed overflow-x-auto text-slate-200 select-none shadow-inner">
                        <p><span className="text-purple-400 font-bold">from</span> <span className="text-cyan-300">mind2i.agents</span> <span className="text-purple-400 font-bold">import</span> AutonomousPipeline, VectorRouter</p>
                        <p><span className="text-purple-400 font-bold">import</span> <span className="text-cyan-300">asyncio</span>, <span className="text-cyan-300">typing</span></p>
                        <p className="text-slate-500 my-1"># Assignment Task: Implement production RAG router with retry telemetry</p>
                        <p><span className="text-blue-400 font-bold">class</span> <span className="text-emerald-300 font-bold">InternTelemetryAgent</span>(AutonomousPipeline):</p>
                        <p className="pl-4"><span className="text-blue-400 font-bold">async def</span> <span className="text-amber-300 font-bold">execute_rag_pipeline</span>(<span className="text-purple-300">self</span>, query: <span className="text-cyan-300">str</span>) -&gt; <span className="text-cyan-300">dict</span>:</p>
                        <p className="pl-8 text-slate-400">router = VectorRouter(vector_store=<span className="text-emerald-400">"pgvector"</span>, top_k=5)</p>
                        <p className="pl-8 text-slate-400">context = <span className="text-purple-400 font-bold">await</span> router.retrieve(query)</p>
                        <p className="pl-8"><span className="text-purple-400 font-bold">return</span> &#123;<span className="text-emerald-400">"status"</span>: <span className="text-emerald-400">"SUCCESS"</span>, <span className="text-emerald-400">"accuracy"</span>: 0.985, <span className="text-emerald-400">"tokens"</span>: 240&#125;</p>
                      </div>

                      {/* Right Test Cases & Output Area */}
                      <div className="lg:col-span-4 flex flex-col justify-between gap-3">
                        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-2">
                            <span>Automated Unit Tests</span>
                            <span className="text-emerald-600 font-black">4/4 Passed</span>
                          </div>
                          <div className="space-y-1.5 text-[11px]">
                            <div className="flex items-center justify-between p-1.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                              <span>✓ Test 1: Vector router init</span>
                              <span className="font-mono text-emerald-700">12ms</span>
                            </div>
                            <div className="flex items-center justify-between p-1.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                              <span>✓ Test 2: RAG contextual retrieval</span>
                              <span className="font-mono text-emerald-700">18ms</span>
                            </div>
                            <div className="flex items-center justify-between p-1.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                              <span>✓ Test 3: Token budget check</span>
                              <span className="font-mono text-emerald-700">9ms</span>
                            </div>
                            <div className="flex items-center justify-between p-1.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                              <span>✓ Test 4: Concurrency stress</span>
                              <span className="font-mono text-emerald-700">22ms</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] shadow-sm">
                          <div className="text-slate-400 font-bold mb-1">Terminal Output:</div>
                          {ideRunComplete ? (
                            <div className="text-emerald-400 space-y-0.5 font-medium">
                              <p>&gt; Build passed (Exit Code 0)</p>
                              <p>&gt; Assignment score: +150 XP awarded to Leaderboard</p>
                            </div>
                          ) : (
                            <div className="text-amber-300 flex items-center gap-2">
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              <span>Running sandbox compiler...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab Content 2: Live Leaderboard Preview */}
                {heroTab === 'leaderboard' && (
                  <div className="p-4 sm:p-6 bg-white">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                      <div>
                        <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-amber-500" />
                          <span>Cohort Alpha // Live Intern Rankings</span>
                        </div>
                        <div className="text-xs text-slate-500">Updated in real-time based on test cases and project milestones</div>
                      </div>
                      <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                        <Flame className="w-3.5 h-3.5 text-amber-500" />
                        <span>Active Competition</span>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      {[
                        { rank: "01", name: "Aarav Sharma", track: "Agentic AI Track", score: "985 XP", streak: "14d streak", badge: "Agent Architect", color: "bg-amber-50/70 border-amber-200 text-amber-900" },
                        { rank: "02", name: "Priya Patel", track: "Full-Stack Track", score: "960 XP", streak: "12d streak", badge: "Systems Virtuoso", color: "bg-slate-50 border-slate-200 text-slate-900" },
                        { rank: "03", name: "Rohan Mehta", track: "Cloud Architecture", score: "945 XP", streak: "11d streak", badge: "Docker Specialist", color: "bg-orange-50/60 border-orange-200 text-orange-950" },
                        { rank: "04", name: "Ananya Iyer", track: "Agentic AI Track", score: "920 XP", streak: "9d streak", badge: "Prompt Engineer", color: "bg-white border-slate-200 text-slate-900" },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className={`p-3 sm:p-4 rounded-xl ${item.color} border flex items-center justify-between gap-4 transition-all shadow-2xs hover:shadow-xs`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-sm sm:text-base font-black text-slate-400 w-6">
                              #{item.rank}
                            </span>
                            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center font-black text-slate-800 text-xs border border-slate-200 shadow-2xs">
                              {item.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                {item.name}
                                <span className="hidden sm:inline text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold border border-slate-200">
                                  {item.badge}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500">{item.track}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-right">
                            <div className="hidden sm:block text-xs font-mono text-emerald-600 font-bold">
                              {item.streak}
                            </div>
                            <div className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs sm:text-sm font-black text-cyan-300 shadow-xs">
                              {item.score}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab Content 3: Client Hiring Portal Preview */}
                {heroTab === 'client' && (
                  <div className="p-4 sm:p-6 bg-white">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                      <div>
                        <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-emerald-600" />
                          <span>Hiring Partner Portal // Talent Discovery</span>
                        </div>
                        <div className="text-xs text-slate-500">Direct scouting for verified technical interns ready for interviews</div>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                        12 Verified Candidates Ready
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center font-black text-white text-base shadow-md">
                          AS
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-slate-900">Aarav Sharma</span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                              Rank #1
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">Specialization: Agentic AI & Autonomous Swarms (6-Mo Cohort)</p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {["CrewAI", "LangChain", "FastAPI", "Docker", "pgvector"].map((skill, sIdx) => (
                              <span key={sIdx} className="px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 text-[10px] font-mono font-medium shadow-2xs">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-end gap-2 w-full md:w-auto">
                        <div className="text-right hidden sm:block">
                          <div className="text-xs font-mono text-emerald-700 font-bold">100% Test Pass Rate</div>
                          <div className="text-[11px] text-slate-500">4 Projects Code-Reviewed</div>
                        </div>
                        <button
                          onClick={() => setDemoInterviewRequested(true)}
                          className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            demoInterviewRequested
                              ? 'bg-emerald-600 text-white shadow-md'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-md shadow-emerald-600/20'
                          }`}
                        >
                          {demoInterviewRequested ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-white" />
                              <span>Interview Requested!</span>
                            </>
                          ) : (
                            <>
                              <Calendar className="w-4 h-4" />
                              <span>Schedule Tech Interview</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Simulator Footer Bar */}
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Real-time Cohort WebSocket: Connected</span>
                  </span>
                  <button
                    onClick={onLoginClick}
                    className="text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open full workspace</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ================= TECH TRACKS & CURRICULUM ================= */}
      <section id="tracks" className="relative z-10 py-20 border-t border-slate-200/80 bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-4">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Specialized Internship Curriculum</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
              Engineered for Production Reality
            </h2>
            <p className="text-slate-600 font-normal text-base sm:text-lg">
              3 to 6 months of rigorous technical immersion designed to transform interns into autonomous, industry-ready software engineers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tracks.map((track, i) => {
              const Icon = track.icon;
              return (
                <div
                  key={i}
                  className={`relative p-8 rounded-3xl bg-white border ${track.border} shadow-lg shadow-slate-100/80 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group overflow-hidden`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className={`w-12 h-12 rounded-2xl ${track.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="text-right">
                        <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-mono font-bold text-slate-700">
                          {track.duration}
                        </span>
                      </div>
                    </div>

                    <div className={`text-xs font-mono font-bold uppercase tracking-wider mb-1 ${track.accent}`}>
                      {track.badge}
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight">
                      {track.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed mb-6 font-normal">
                      {track.description}
                    </p>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                      Mastered Competencies:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {track.skills.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/80 text-xs font-mono text-slate-700 font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tech Stack Marquee Pill Bar */}
          <div className="mt-14 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm text-center">
            <div className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider mb-4">
              Integrated Engineering Technologies & Toolchains
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {[
                "Python 3.12", "TypeScript", "React 19", "FastAPI", "Node.js",
                "LangChain", "CrewAI", "pgvector", "Docker", "PostgreSQL",
                "Redis", "TailwindCSS", "REST APIs", "Automated Compilers", "GitHub Workflows"
              ].map((tech, idx) => (
                <span
                  key={idx}
                  className="px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:border-sky-300 transition-all shadow-2xs"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ================= ROLE PERSPECTIVE SWITCHER ================= */}
      <section id="roles" className="relative z-10 py-20 border-t border-slate-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold uppercase tracking-wider mb-4">
              <Users className="w-3.5 h-3.5 text-sky-600" />
              <span>Tailored Platform Experience</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
              Designed for Every Stakeholder
            </h2>
            <p className="text-slate-600 font-normal text-base sm:text-lg">
              Whether you are an aspiring engineer, a corporate talent partner, or an academic mentor — MIND2I delivers an unfair advantage.
            </p>
          </div>

          {/* Role Tabs */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 border border-slate-200 shadow-inner">
              {[
                { id: 'intern', label: 'For Interns & Students', icon: GraduationCap },
                { id: 'client', label: 'For Hiring Clients', icon: Building2 },
                { id: 'admin', label: 'For Admins & Mentors', icon: ShieldCheck },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = selectedRole === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedRole(tab.id as any)}
                    className={`px-4 sm:px-6 py-3 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer ${
                      active
                        ? 'bg-white text-slate-900 shadow-md border border-slate-200/80'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Role Showcase Card */}
          {(() => {
            const role = roleDetails[selectedRole];
            return (
              <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/90 shadow-xl shadow-slate-100">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  
                  {/* Left Role Pitch */}
                  <div className="lg:col-span-7">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-mono font-bold uppercase tracking-wider mb-4 border border-sky-200">
                      {role.badgeText}
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 tracking-tight">
                      {role.title}
                    </h3>
                    <p className="text-slate-600 text-base leading-relaxed mb-8">
                      {role.subtitle}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {role.points.map((pt, pIdx) => (
                        <div key={pIdx} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-1.5">
                            <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                            <span>{pt.title}</span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">{pt.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Impact Highlight */}
                  <div className="lg:col-span-5 flex flex-col justify-center items-center text-center p-8 rounded-2xl bg-gradient-to-br from-sky-50 via-indigo-50/50 to-white border border-slate-200 shadow-sm">
                    <div className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600 mb-2">
                      {role.statNumber}
                    </div>
                    <div className="text-sm font-bold text-slate-700 mb-6">{role.statLabel}</div>
                    
                    <button
                      onClick={onLoginClick}
                      className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-slate-900 hover:bg-slate-800 transition shadow-lg shadow-slate-900/15 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Access {role.badgeText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </div>
            );
          })()}

        </div>
      </section>

      {/* ================= COHORT ROADMAP ================= */}
      <section id="roadmap" className="relative z-10 py-20 border-t border-slate-200/80 bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-4">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span>4-Phase Acceleration Architecture</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
              How Interns Move From Onboarding to Placement
            </h2>
            <p className="text-slate-600 font-normal text-base sm:text-lg">
              A transparent, outcome-oriented pipeline that guarantees real-world technical mastery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roadmapSteps.map((step, i) => (
              <div
                key={i}
                className="relative p-6 rounded-3xl bg-white border border-slate-200 shadow-md shadow-slate-100 flex flex-col justify-between hover:shadow-lg hover:border-sky-300 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl font-black font-mono text-slate-200 group-hover:text-sky-300 transition-colors">
                      {step.step}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      STEP {step.step}
                    </span>
                  </div>

                  <div className="text-xs font-mono font-bold text-sky-600 uppercase tracking-wider mb-1">
                    {step.phase}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-6">
                    {step.description}
                  </p>
                </div>

                <div className="space-y-1.5 pt-4 border-t border-slate-100">
                  {step.tags.map((tag, tIdx) => (
                    <div key={tIdx} className="flex items-center gap-2 text-[11px] text-slate-700 font-medium">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{tag}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ================= FAQ SECTION ================= */}
      <section id="faq" className="relative z-10 py-20 border-t border-slate-200/80 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold uppercase tracking-wider mb-4">
              <Globe className="w-3.5 h-3.5 text-sky-600" />
              <span>Frequently Asked Questions</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
              Everything You Need to Know
            </h2>
            <p className="text-slate-600 font-normal text-sm sm:text-base">
              Got questions about our cohort formats, client hiring pipeline, or in-browser evaluation?
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-slate-50/70 border border-slate-200 overflow-hidden transition-all shadow-2xs"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-100/50"
                  >
                    <span className="text-base font-bold text-slate-900 leading-snug">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-500 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-sky-600' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-200/60 bg-white">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ================= FINAL CALL TO ACTION ================= */}
      <section className="relative z-10 py-20 border-t border-slate-200/80 bg-slate-50/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="relative rounded-3xl p-10 sm:p-14 bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 text-white shadow-2xl shadow-indigo-500/20 overflow-hidden">
            <div className="relative z-10 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white text-xs font-mono font-bold uppercase tracking-wider mb-6">
                Ready to Launch
              </div>

              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-6">
                Step Into the Future of Technical Internships
              </h2>

              <p className="text-white/90 text-base sm:text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
                Log into your dashboard to access active cohorts, code submissions, live leaderboards, and corporate candidate scouting.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={onLoginClick}
                  className="px-8 py-4 rounded-2xl font-black text-base text-slate-950 bg-white hover:bg-slate-100 shadow-xl shadow-black/10 hover:-translate-y-0.5 transition-all flex items-center gap-2.5 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="#tracks"
                  className="px-7 py-4 rounded-2xl font-bold text-base text-white bg-white/15 hover:bg-white/25 border border-white/25 transition-all"
                >
                  Explore Curriculum Tracks
                </a>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="relative z-10 bg-slate-50 border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-200">
            <div className="flex items-center gap-4">
              <Minda2Logo size="md" showTagline={false} />
              <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">
                Internship Management & Client Pipeline Platform
              </span>
            </div>

            <div className="flex items-center gap-6 text-xs text-slate-600 font-bold">
              <a href="#ecosystem" className="hover:text-sky-600 transition-colors">Simulator</a>
              <a href="#tracks" className="hover:text-sky-600 transition-colors">Tracks</a>
              <a href="#roles" className="hover:text-sky-600 transition-colors">Roles</a>
              <a href="#roadmap" className="hover:text-sky-600 transition-colors">Roadmap</a>
              <a href="#faq" className="hover:text-sky-600 transition-colors">FAQ</a>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>All Systems Operational • Platform v2.4</span>
            </div>

            <p>
              &copy; {new Date().getFullYear()} MIND2I. All rights reserved. Built for high-performance engineering cohorts.
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default LandingView;
