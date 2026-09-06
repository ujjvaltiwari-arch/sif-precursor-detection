import { useEffect, useRef, useState, Suspense } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Activity,
  Brain,
  Flame,
  Droplets,
  BarChart3,
  Target,
  Zap,
  ChevronDown,
  ArrowRight,
  Cog,
  TrendingUp,
  AlertTriangle,
  Eye,
  Gauge,
  Database,
  Clock,
  CheckCircle2,
  XCircle,
  Rocket,
  Users,
  FileText,
  Menu,
  X,
  Play,
  Settings,
  Network,
  Layers,
  ShieldCheck,
  TrendingDown,
  MapPin,
} from 'lucide-react';
import HeroScene from '../three/HeroScene';
import InteractiveNeuralVortex from '../components/InteractiveNeuralVortex';

gsap.registerPlugin(ScrollTrigger);

/* ─── Animations ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 * i, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: 0.1 * i, duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

/* ─── Pulse Dot ─── */
function PulseDot({ color = 'bg-red-400' }: { color?: string }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className={`absolute inline-flex h-full w-full rounded-full ${color} opacity-60 animate-ping`} />
      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${color}`} />
    </span>
  );
}

/* ─── AI Status Ring ─── */
function AIStatusRing() {
  const [angle, setAngle] = useState(0);
  useEffect(() => {
    let raf: number;
    const tick = () => { setAngle((a) => (a + 0.3) % 360); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      <svg viewBox="0 0 400 400" className="w-full h-full absolute inset-0" style={{ filter: 'blur(0.5px)' }}>
        <defs>
          <linearGradient id="holo1" gradientTransform={`rotate(${angle})`}>
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="holo2" gradientTransform={`rotate(${-angle * 0.7})`}>
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <circle cx="200" cy="200" r="160" fill="none" stroke="url(#holo1)" strokeWidth="0.5" />
        <circle cx="200" cy="200" r="180" fill="none" stroke="url(#holo2)" strokeWidth="0.4" />
      </svg>
    </div>
  );
}

/* ─── Section Refs ─── */
const HERO_REF = 'hero' as const;
const CHALLENGE_REF = 'challenge' as const;
const PIPELINE_REF = 'pipeline' as const;
const CAPABILITIES_REF = 'capabilities' as const;
const SIF_REF = 'sif' as const;
const DEMO_REF = 'demo' as const;
const TEAM_REF = 'team' as const;

/* ─── Landing Page ─── */
export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const challengeRef = useRef<HTMLDivElement>(null);
  const pipelineRef = useRef<HTMLDivElement>(null);
  const capabilitiesRef = useRef<HTMLDivElement>(null);
  const sifRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);
  const [demoAnalysis, setDemoAnalysis] = useState<'idle' | 'analyzing' | 'done'>('idle');
  const [riskScore, setRiskScore] = useState(0);

  const refs: Record<string, React.RefObject<HTMLDivElement | null>> = {
    [HERO_REF]: heroRef,
    [CHALLENGE_REF]: challengeRef,
    [PIPELINE_REF]: pipelineRef,
    [CAPABILITIES_REF]: capabilitiesRef,
    [SIF_REF]: sifRef,
    [DEMO_REF]: demoRef,
    [TEAM_REF]: teamRef,
  };

  const scrollTo = (refId: string) => refs[refId]?.current?.scrollIntoView({ behavior: 'smooth' });

  /* ─── GSAP Scroll Triggers ─── */
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const refs = [challengeRef, pipelineRef, capabilitiesRef, sifRef, demoRef, teamRef];

    if (prefersReduced) {
      refs.forEach((r) => { if (r.current) r.current.style.opacity = '1'; });
      return;
    }

    refs.forEach((r) => {
      if (!r.current) return;
      gsap.set(r.current, { opacity: 0, y: 30 });
      ScrollTrigger.create({
        trigger: r.current,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(r.current, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
        },
      });
    });

    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  /* ─── Demo analyze simulation ─── */
  const runDemo = () => {
    if (demoAnalysis !== 'idle') return;
    setDemoAnalysis('analyzing');
    setRiskScore(0);
    let score = 0;
    const iv = setInterval(() => {
      score += Math.random() * 8 + 2;
      if (score >= 87.3) { score = 87.3; clearInterval(iv); setDemoAnalysis('done'); }
      setRiskScore(score);
    }, 50);
  };

  /* ─── AI State ─── */
  const aiState = demoAnalysis === 'idle' ? 'idle' : demoAnalysis === 'analyzing' ? 'analyzing' : 'high-risk';

  return (
    <div className="relative bg-black text-white min-h-screen overflow-x-hidden">
      {/* ── Ambient background ── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0" style={{
          background: `radial-gradient(ellipse at 50% 30%, rgba(59,130,246,0.06) 0%, transparent 55%), radial-gradient(ellipse at 20% 70%, rgba(139,92,246,0.035) 0%, transparent 45%), radial-gradient(ellipse at 80% 50%, rgba(6,182,212,0.03) 0%, transparent 50%)`,
          transition: 'background 0.8s ease',
        }} />
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          HERO — Two Column: Left (text) + Right (3D Brain)
      ═══════════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative z-10 min-h-screen flex items-center">
        <div className="w-full max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[80vh] py-24">

            {/* ── LEFT: Text Content ── */}
            <div className="relative z-20 flex flex-col justify-center">

              {/* Headline */}
              <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1}
                className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight mb-6"
              >
                <span className="block text-white/95">AI-Powered</span>
                <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Safety Intelligence
                </span>
                <span className="block text-white/95">for Oil &amp; Gas</span>
              </motion.h1>

              {/* Description */}
              <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2}
                className="text-base sm:text-lg text-white/55 leading-relaxed max-w-lg mb-8"
              >
                Detect Safety Incident Precursors before they escalate. Real-time NLP analysis of
                field reports, shift handovers, and maintenance logs — powered by transformer models
                trained on 50+ years of Oil India incident data.
              </motion.p>

              {/* CTAs */}
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3} className="flex flex-wrap gap-4 mb-10">
                <Link to="/analyze"
                  className="group relative px-7 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_30px_rgba(34,211,238,0.2)] hover:shadow-[0_0_50px_rgba(34,211,238,0.35)] transition-all duration-300 flex items-center gap-2"
                >
                  <Brain className="w-4 h-4" />
                  Launch Analysis
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button onClick={() => scrollTo(CHALLENGE_REF)}
                  className="group px-7 py-3.5 rounded-xl font-semibold text-sm border border-white/10 text-white/70 hover:text-white hover:border-white/25 hover:bg-white/5 transition-all duration-300 flex items-center gap-2"
                >
                  Explore Platform
                  <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                </button>
              </motion.div>

              {/* Quick stats row */}
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}
                className="flex flex-wrap gap-6 sm:gap-8 text-center justify-center"
              >
                {[
                  { v: '250+', l: 'Reports Analyzed', c: 'text-cyan-400' },
                  { v: '94.7%', l: 'SIF Detection', c: 'text-blue-400' },
                  { v: '<2s', l: 'Analysis Time', c: 'text-purple-400' },
                ].map((s, i) => (
                  <div key={i}>
                    <div className={`text-xl sm:text-2xl font-black ${s.c}`}>{s.v}</div>
                    <div className="text-[11px] text-white/35 font-medium uppercase tracking-wider">{s.l}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* ── RIGHT: 3D Brain Visualization ── */}
            <motion.div variants={scaleIn} initial="hidden" animate="visible" custom={2}
              className="relative z-10 flex justify-center lg:justify-end"
            >
              <div className="relative w-full max-w-lg lg:max-w-xl aspect-square">
                {/* Live AI Status Card */}
                <div className="absolute top-4 left-4 z-30 glass rounded-lg px-3 py-2 border border-white/10">
                  <div className="flex items-center gap-2 text-[11px] font-medium text-white/60">
                    <PulseDot color={aiState === 'idle' ? 'bg-cyan-400' : aiState === 'analyzing' ? 'bg-blue-400' : 'bg-red-400'} />
                    <span className="uppercase tracking-wider">AI Status</span>
                  </div>
                  <div className="text-xs text-white/80 mt-0.5">
                    {aiState === 'idle' ? 'Standing By' : aiState === 'analyzing' ? 'Processing...' : 'Risk Detected'}
                  </div>
                </div>

                {/* Floating labels */}
                <div className="absolute top-6 right-6 z-30 glass rounded-md px-2.5 py-1.5 border border-cyan-500/10">
                  <div className="text-[10px] font-semibold text-cyan-400/70 tracking-wider uppercase">SIF Precursor</div>
                  <div className="text-[10px] text-white/30">Confidence 94.7%</div>
                </div>
                <div className="absolute bottom-20 left-4 z-30 glass rounded-md px-2.5 py-1.5 border border-red-500/10">
                  <div className="text-[10px] font-semibold text-red-400/70 tracking-wider uppercase">Risk Level</div>
                  <div className="text-[10px] text-white/30">HIGH — Immediate</div>
                </div>
                <div className="absolute bottom-6 right-8 z-30 glass rounded-md px-2.5 py-1.5 border border-purple-500/10">
                  <div className="text-[10px] font-semibold text-purple-400/70 tracking-wider uppercase">Model Active</div>
                  <div className="text-[10px] text-white/30">Transformer v2.1</div>
                </div>

                {/* Holographic ring overlay */}
                <AIStatusRing />

                {/* 3D Canvas */}
                <div className="w-full h-full">
                  <Suspense fallback={
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin" />
                        <Brain className="w-6 h-6 text-cyan-400/60 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  }>
                    <HeroScene />
                  </Suspense>
                </div>

                {/* Bottom status bar */}
                <div className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-2">
                  <div className="flex items-center gap-2 text-[10px] text-white/30">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/60 animate-pulse" />
                    <span>Neural Network Active</span>
                  </div>
                  <div className="text-[10px] text-white/30">
                    {aiState === 'idle' ? '0 ms latency' : aiState === 'analyzing' ? 'Processing...' : '< 2s response'}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 hidden sm:block">
            <button onClick={() => scrollTo(CHALLENGE_REF)}
              className="flex flex-col items-center gap-2 text-white/25 hover:text-white/50 transition-colors"
            >
              <span className="text-[10px] uppercase tracking-[0.2em] font-medium">Scroll</span>
              <ChevronDown className="w-4 h-4 animate-bounce" />
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          THE CHALLENGE
      ═══════════════════════════════════════════════════════════════ */}
      <div className="relative">
        <InteractiveNeuralVortex />
        <section ref={challengeRef} className="relative z-10 py-28 sm:py-36 overflow-hidden">
        <div className="w-full max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/20 bg-amber-500/5 mb-6">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-semibold text-amber-400 tracking-wider uppercase">The Problem</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white/95 mb-6 tracking-tight leading-tight text-center">
              SIF Precursors Hide in <span className="bg-gradient-to-r from-amber-400 to-red-400 bg-clip-text text-transparent">Plain Sight</span>
            </h2>
            <p className="text-base sm:text-lg text-white/50 leading-relaxed text-center max-w-[800px] mx-auto">
              Safety Incident Precursors are subtle signals buried in thousands of field reports, shift handovers, and maintenance logs. Manual review catches less than 12% before escalation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: FileText, t: 'Noisy Unstructured Data', d: 'Field reports arrive as free-text narratives with inconsistent terminology, abbreviations, and formatting across 50+ years of operations.', color: 'from-amber-500/10 to-orange-500/5', border: 'border-amber-500/15', ic: 'text-amber-400' },
              { icon: Clock, t: 'Delayed Detection', d: 'Average precursor-to-incident window is 72 hours. Current manual processes average 96 hours for comprehensive review.', color: 'from-red-500/10 to-rose-500/5', border: 'border-red-500/15', ic: 'text-red-400' },
              { icon: TrendingDown, t: 'Low Signal Detection', d: 'Only 11.7% of precursor signals are caught before escalation. Critical patterns are lost in noise and volume.', color: 'from-orange-500/10 to-amber-500/5', border: 'border-orange-500/15', ic: 'text-orange-400' },
            ].map((c, i) => (
              <div key={i} className={`glass rounded-2xl p-7 border ${c.border} hover:border-white/15 transition-all duration-300 group`}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <c.icon className={`w-6 h-6 ${c.ic}`} />
                </div>
                <h3 className="text-base font-bold text-white/90 mb-3">{c.t}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SIF PIPELINE
      ═══════════════════════════════════════════════════════════════ */}
      <section ref={pipelineRef} className="relative z-10 py-28 sm:py-36 overflow-hidden">
        <div className="w-full max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 mb-6">
              <Cog className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] font-semibold text-cyan-400 tracking-wider uppercase">How It Works</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white/95 mb-6 tracking-tight leading-tight text-center">
              Detection <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Pipeline</span>
            </h2>
            <p className="text-base sm:text-lg text-white/50 leading-relaxed text-center max-w-[800px] mx-auto">
              Four-stage AI pipeline transforms raw field reports into actionable safety intelligence in under 2 seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', icon: Database, t: 'Ingest', d: 'PDF/DOCX/TXT ingestion with OCR. Preserves temporal and spatial context from original reports.', color: 'from-cyan-500 to-blue-600' },
              { step: '02', icon: Brain, t: 'NLP Extract', d: 'Transformer-based NER extracts entities, actions, conditions, and temporal markers.', color: 'from-blue-500 to-indigo-600' },
              { step: '03', icon: Target, t: 'SIF Classify', d: 'Multi-label classifier identifies precursor patterns against 50+ years of incident data.', color: 'from-indigo-500 to-purple-600' },
              { step: '04', icon: Shield, t: 'Prioritize', d: 'Risk scoring with confidence intervals. Routes high-priority alerts to safety officers.', color: 'from-purple-500 to-pink-600' },
            ].map((s, i) => (
              <div key={i} className="relative glass rounded-2xl p-7 border border-white/5 hover:border-white/15 transition-all duration-300 group pt-10">
                <div className={`absolute top-3 left-4 w-8 h-8 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center text-[11px] font-black text-white shadow-lg`}>
                  {s.step}
                </div>
                <s.icon className="w-6 h-6 text-white/50 mb-3 group-hover:text-white/70 transition-colors" />
                <h3 className="text-base font-bold text-white/90 mb-3">{s.t}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CAPABILITIES
      ═══════════════════════════════════════════════════════════════ */}
      <section ref={capabilitiesRef} className="relative z-10 py-28 sm:py-36 overflow-hidden">
        <div className="w-full max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/20 bg-purple-500/5 mb-6">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-[11px] font-semibold text-purple-400 tracking-wider uppercase">Platform Capabilities</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white/95 mb-6 tracking-tight leading-tight text-center">
              Enterprise-Grade <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Intelligence</span>
            </h2>
            <p className="text-base sm:text-lg text-white/50 leading-relaxed text-center max-w-[800px] mx-auto">
              From NLP extraction to risk scoring — every component is engineered for reliability, speed, and explainability in high-stakes safety environments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Brain, t: 'Transformer NLP', d: 'Fine-tuned BERT models trained on 50+ years of Oil India incident data with domain-specific embeddings.', color: 'from-cyan-500/10 to-blue-500/5', border: 'border-cyan-500/15', ic: 'text-cyan-400' },
              { icon: Activity, t: 'Real-Time Analysis', d: '< 2 second analysis of unstructured field reports with streaming inference pipeline.', color: 'from-blue-500/10 to-indigo-500/5', border: 'border-blue-500/15', ic: 'text-blue-400' },
              { icon: Shield, t: 'SIF Classification', d: 'Multi-label precursor detection across 12 categories with calibrated confidence scores.', color: 'from-purple-500/10 to-violet-500/5', border: 'border-purple-500/15', ic: 'text-purple-400' },
              { icon: BarChart3, t: 'Risk Prioritization', d: 'Bayesian risk scoring with temporal decay and proximity weighting for urgent alerts.', color: 'from-amber-500/10 to-orange-500/5', border: 'border-amber-500/15', ic: 'text-amber-400' },
              { icon: Database, t: 'Data Pipeline', d: 'Automated PDF/DOCX/TXT ingestion with OCR, deduplication, and entity normalization.', color: 'from-green-500/10 to-emerald-500/5', border: 'border-green-500/15', ic: 'text-green-400' },
              { icon: Eye, t: 'Explainability', d: 'SHAP-based feature attribution shows which terms and patterns triggered each prediction.', color: 'from-rose-500/10 to-pink-500/5', border: 'border-rose-500/15', ic: 'text-rose-400' },
            ].map((c, i) => (
              <div key={i} className={`glass rounded-2xl p-7 border ${c.border} hover:border-white/15 transition-all duration-300 group`}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <c.icon className={`w-6 h-6 ${c.ic}`} />
                </div>
                <h3 className="text-base font-bold text-white/90 mb-3">{c.t}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SIF PRECURSOR TYPES
      ═══════════════════════════════════════════════════════════════ */}
      <section ref={sifRef} className="relative z-10 py-28 sm:py-36 overflow-hidden">
        <div className="w-full max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/20 bg-red-500/5 mb-6">
              <Flame className="w-3.5 h-3.5 text-red-400" />
              <span className="text-[11px] font-semibold text-red-400 tracking-wider uppercase">SIF Classification</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white/95 mb-6 tracking-tight leading-tight text-center">
              12 SIF <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">Precursor Categories</span>
            </h2>
            <p className="text-base sm:text-lg text-white/50 leading-relaxed text-center max-w-[800px] mx-auto">
              Our model classifies Safety Incident Precursors across 12 distinct categories based on OIL domain taxonomy.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {[
              { n: 'Well Control', icon: '⛽', c: 'border-cyan-500/15' },
              { n: 'Process Safety', icon: '🔧', c: 'border-blue-500/15' },
              { n: 'HSE Incident', icon: '⚠️', c: 'border-amber-500/15' },
              { n: 'Equipment Failure', icon: '⚙️', c: 'border-red-500/15' },
              { n: 'Environmental', icon: '🌿', c: 'border-green-500/15' },
              { n: 'Fire/Explosion', icon: '🔥', c: 'border-orange-500/15' },
              { n: 'Personnel Safety', icon: '🛡️', c: 'border-purple-500/15' },
              { n: 'Pipeline Integrity', icon: '🔩', c: 'border-indigo-500/15' },
              { n: 'Drilling Operations', icon: '🏗️', c: 'border-teal-500/15' },
              { n: 'Mechanical Integrity', icon: '🛠️', c: 'border-pink-500/15' },
              { n: 'Operational Deviation', icon: '📊', c: 'border-violet-500/15' },
              { n: 'Near Miss', icon: '🎯', c: 'border-rose-500/15' },
            ].map((s, i) => (
              <div key={i} className={`glass rounded-xl p-4 border ${s.c} hover:border-white/15 transition-all duration-300 text-center group`}>
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{s.icon}</div>
                <div className="text-[12px] font-semibold text-white/70">{s.n}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          INTERACTIVE DEMO
      ═══════════════════════════════════════════════════════════════ */}
      <section ref={demoRef} className="relative z-10 py-28 sm:py-36 overflow-hidden">
        <div className="w-full max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 mb-6">
              <Play className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] font-semibold text-cyan-400 tracking-wider uppercase">Live Demo</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white/95 mb-6 tracking-tight leading-tight text-center">
              Try the <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Analysis Engine</span>
            </h2>
            <p className="text-base sm:text-lg text-white/50 leading-relaxed text-center max-w-[800px] mx-auto">
              See how our AI analyzes a real field report and identifies SIF precursor signals in real time.
            </p>
          </div>

          <div className="max-w-[800px] mx-auto">
          <div className="glass rounded-2xl border border-white/8 p-8">
            {/* Sample report */}
            <div className="mb-6">
              <div className="text-[11px] uppercase tracking-wider text-white/30 mb-2 font-medium">Sample Report Input</div>
              <div className="bg-black/40 rounded-xl p-5 border border-white/5 text-sm text-white/60 leading-relaxed font-mono">
                <span className="text-amber-400/70">Report #2847</span> — During routine wellhead inspection at
                Digboi field, operators observed <span className="text-red-400/80 font-semibold">unusual pressure
                fluctuation</span> on Well #14-B. Pressure readings varied between 185-240 PSI over a
                30-minute window. <span className="text-orange-400/80">Minor hydrocarbon odor</span> detected
                near the valve assembly. Crew completed standard BOP check but
                <span className="text-red-400/80 font-semibold"> did not document the reading anomaly</span> in the
                shift handover log.
              </div>
            </div>

            <button onClick={runDemo}
              className={`w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                demoAnalysis === 'idle'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_30px_rgba(34,211,238,0.2)] hover:shadow-[0_0_50px_rgba(34,211,238,0.35)]'
                  : 'bg-white/5 text-white/40 cursor-not-allowed'
              }`}
            >
              {demoAnalysis === 'idle' && <><Brain className="w-4 h-4" /> Run SIF Analysis</>}
              {demoAnalysis === 'analyzing' && (
                <><div className="w-4 h-4 border-2 border-white/20 border-t-cyan-400 rounded-full animate-spin" /> Analyzing...</>
              )}
              {demoAnalysis === 'done' && <><CheckCircle2 className="w-4 h-4 text-green-400" /> Analysis Complete</>}
            </button>

            <AnimatePresence>
              {(demoAnalysis === 'analyzing' || demoAnalysis === 'done') && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mt-6 space-y-4"
                >
                  {/* Risk score bar */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1.5">
                      <span className="text-white/50 font-medium">SIF Precursor Risk Score</span>
                      <span className="text-red-400 font-bold">{riskScore.toFixed(1)}%</span>
                    </div>
                    <div className="h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-red-500"
                        animate={{ width: `${riskScore}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>
                  </div>

                  {/* Classification results */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-black/30 rounded-lg p-3 border border-red-500/15">
                      <div className="text-[10px] text-red-400/60 uppercase tracking-wider mb-1">Precursor Type</div>
                      <div className="text-sm font-bold text-red-400">Operational Deviation</div>
                      <div className="text-[11px] text-white/35 mt-1">Confidence: 87.3%</div>
                    </div>
                    <div className="bg-black/30 rounded-lg p-3 border border-amber-500/15">
                      <div className="text-[10px] text-amber-400/60 uppercase tracking-wider mb-1">Risk Level</div>
                      <div className="text-sm font-bold text-amber-400">HIGH</div>
                      <div className="text-[11px] text-white/35 mt-1">Immediate Review</div>
                    </div>
                  </div>

                  {/* Key terms */}
                  <div className="bg-black/30 rounded-lg p-4 border border-white/5">
                    <div className="text-[10px] text-white/35 uppercase tracking-wider mb-2">Key Terms Detected</div>
                    <div className="flex flex-wrap gap-2">
                      {['pressure_fluctuation', 'hydrocarbon_odor', 'documentation_gap', 'shift_handover_anomaly'].map((t) => (
                        <span key={t} className="px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-[11px] text-red-400/80 font-medium">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="bg-black/30 rounded-lg p-4 border border-cyan-500/15">
                    <div className="text-[10px] text-cyan-400/60 uppercase tracking-wider mb-1">Recommended Action</div>
                    <div className="text-sm text-white/70 leading-relaxed">
                      Escalate to HSE Lead. Schedule immediate wellhead re-inspection. Verify BOP calibration.
                      Update shift handover documentation protocol.
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          TEAM
      ═══════════════════════════════════════════════════════════════ */}
      <section ref={teamRef} className="relative z-10 py-28 sm:py-36 overflow-hidden">
        <div className="w-full max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/20 bg-purple-500/5 mb-6">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-[11px] font-semibold text-purple-400 tracking-wider uppercase">Our Team</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white/95 mb-6 tracking-tight leading-tight text-center">
              Built by <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Anveshak</span>
            </h2>
            <p className="text-base sm:text-lg text-white/50 leading-relaxed text-center max-w-[800px] mx-auto">
              A multidisciplinary team combining AI/ML engineering, oil & gas domain expertise, and full-stack development.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 max-w-[900px] mx-auto">
            {[
              { name: 'Aina Raj', role: 'Frontend Dev', init: 'AR', color: 'from-green-500 to-emerald-600' },
              { name: 'Raj Maurya', role: 'NLP Engineer', init: 'RM', color: 'from-blue-500 to-indigo-600' },
              { name: 'Mohit Rajput', role: 'Domain Expert', init: 'MR', color: 'from-purple-500 to-pink-600' },
              { name: 'Rishabh & Ashish', role: 'Backend Dev', init: 'RA', color: 'from-amber-500 to-orange-600' },
              { name: 'Ujjval Tiwari', role: 'AI/ML Lead', init: 'UT', color: 'from-cyan-500 to-blue-600' },
            ].map((m, i) => (
              <div key={i} className="glass rounded-xl p-5 border border-white/5 hover:border-white/15 transition-all duration-300 text-center group">
                <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${m.color} flex items-center justify-center mx-auto mb-3 text-lg font-black text-white group-hover:scale-110 transition-transform`}>
                  {m.init}
                </div>
                <div className="text-sm font-bold text-white/90 mb-0.5">{m.name}</div>
                <div className="text-[11px] text-white/35">{m.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      </div>
    </div>
  );
}
