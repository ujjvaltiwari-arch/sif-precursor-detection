import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileSearch, Loader2, Upload, Shield, AlertTriangle,
  CheckCircle2, Lightbulb, Flag, MessageSquareWarning, AlertOctagon,
  Play, Zap, Clock, Beaker, ChevronDown,
} from 'lucide-react';
import { analyzeApi } from '../services/api';
import type { AnalysisResult } from '../types';

const riskColors = {
  HIGH: { bg: 'bg-danger-500/10', border: 'border-danger-500/25', text: 'text-danger-500', dot: 'bg-danger-500' },
  MEDIUM: { bg: 'bg-warn-500/10', border: 'border-warn-500/25', text: 'text-warn-500', dot: 'bg-warn-500' },
  LOW: { bg: 'bg-success-500/10', border: 'border-success-500/25', text: 'text-success-500', dot: 'bg-success-500' },
};

const reportTypes = [
  { value: 'unsafe_act', label: 'Unsafe Act' },
  { value: 'unsafe_condition', label: 'Unsafe Condition' },
  { value: 'near_miss', label: 'Near Miss' },
];

const demoReports = [
  {
    id: 'high-1',
    title: 'H2S Gas Release — Wellhead Area',
    risk: 'HIGH',
    icon: AlertOctagon,
    color: 'text-danger-500',
    bg: 'bg-danger-500/5',
    border: 'border-danger-500/15',
    text: 'H2S gas leak detected in wellhead area during drilling operations. Workers were exposed to toxic gas for approximately 15 minutes before evacuation. Gas monitoring equipment was not calibrated. Emergency shutdown procedures were not followed. Three workers reported dizziness and nausea.',
    type: 'unsafe_condition',
    site: 'Digboi',
    department: 'Drilling',
  },
  {
    id: 'high-2',
    title: 'Confined Space — No Isolation',
    risk: 'HIGH',
    icon: AlertOctagon,
    color: 'text-danger-500',
    bg: 'bg-danger-500/5',
    border: 'border-danger-500/15',
    text: 'Worker entered confined space without proper gas testing and isolation. No LOTO procedures were followed. PPE was not worn. Supervisor was not present. Worker lost consciousness due to oxygen deficiency. Rescue team extracted worker after 8 minutes.',
    type: 'unsafe_act',
    site: 'Nazira Oil Field',
    department: 'Maintenance',
  },
  {
    id: 'medium-1',
    title: 'Equipment Vibration Anomaly',
    risk: 'MEDIUM',
    icon: AlertTriangle,
    color: 'text-warn-500',
    bg: 'bg-warn-500/5',
    border: 'border-warn-500/15',
    text: 'Abnormal vibration detected on compressor unit C-4 during routine operation. Vibration levels exceeded normal thresholds by 40%. Maintenance team notified. Equipment continued operating pending inspection. No immediate injury reported.',
    type: 'unsafe_condition',
    site: 'Margherita',
    department: 'Maintenance',
  },
  {
    id: 'low-1',
    title: 'Routine Safety Inspection',
    risk: 'LOW',
    icon: CheckCircle2,
    color: 'text-success-500',
    bg: 'bg-success-500/5',
    border: 'border-success-500/15',
    text: 'Quarterly safety inspection completed for Drilling Unit D-12. All fire extinguishers are within expiry date. Emergency exits are clear. PPE stations are stocked. Minor findings: two light bulbs need replacement in the break room.',
    type: 'near_miss',
    site: 'Duliajan',
    department: 'Drilling',
  },
];

export default function AnalyzePage() {
  const [text, setText] = useState('');
  const [reportType, setReportType] = useState('unsafe_act');
  const [site, setSite] = useState('');
  const [department, setDepartment] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoMode, setDemoMode] = useState(false);
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [fileError, setFileError] = useState('');
  const [typeOpen, setTypeOpen] = useState(false);
  const typeRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (typeRef.current && !typeRef.current.contains(e.target as Node)) setTypeOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    setActiveDemo(null);
    try {
      const res = await analyzeApi.submit({
        report_text: text,
        report_type: reportType,
        ...(site && { site }),
        ...(department && { department }),
      });
      setResult(res.data);
      setDemoMode(false);
    } catch {
      setDemoMode(true);
      setResult(getDemoResult(text, reportType));
    } finally {
      setLoading(false);
    }
  };

  const loadDemo = (demo: typeof demoReports[0]) => {
    setText(demo.text);
    setReportType(demo.type);
    setSite(demo.site);
    setDepartment(demo.department);
    setActiveDemo(demo.id);
    setResult(null);
    setDemoMode(false);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileError('');
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setFileError(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum allowed size is 10MB.`);
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setText(ev.target?.result as string);
    reader.readAsText(file);
  };

  const r = result?.analysis;
  const rc = r ? riskColors[r.risk_level] : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-4">
          <Shield className="w-3.5 h-3.5" />
          AI-Powered Analysis
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Analyze Safety Report</h1>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Submit a safety report for AI-powered SIF precursor detection
        </p>
      </motion.div>

      {/* Demo Reports */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="flex items-center gap-2 mb-3">
          <Play className="w-3.5 h-3.5 text-brand-400" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quick Demo — Click a preset</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {demoReports.map((demo) => (
            <button
              key={demo.id}
              onClick={() => loadDemo(demo)}
              className={`p-3 rounded-xl border text-left transition-all duration-200 hover:-translate-y-0.5 ${
                activeDemo === demo.id
                  ? `${demo.bg} ${demo.border} ring-1 ring-white/10`
                  : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <demo.icon className={`w-3.5 h-3.5 ${demo.color}`} />
                <span className={`text-[10px] font-bold ${demo.color} uppercase tracking-wider`}>{demo.risk}</span>
              </div>
              <div className="text-xs font-semibold text-white/80 leading-tight">{demo.title}</div>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2 px-1">
          <div className="w-1.5 h-1.5 rounded-full bg-warn-500" />
          <span className="text-[10px] text-warn-500/70 font-medium">Synthetic demo data — not real OIL incident data</span>
        </div>
      </motion.div>

      {/* Input Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-6 gradient-border">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"Paste or type the safety report text here...\n\nOr click a demo preset above to auto-fill."}
          rows={5}
          className="w-full p-4 rounded-xl bg-white/[0.03] border border-white/5 text-white placeholder:text-slate-600 resize-y text-sm leading-relaxed focus:outline-none focus:border-brand-500/30 transition-all font-[inherit]"
        />
        <div className="flex flex-col sm:flex-row gap-3 mt-4 items-start sm:items-end">
          <div className="flex gap-3 flex-wrap">
            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1">Type</label>
              <div ref={typeRef} className="relative">
                <button
                  type="button"
                  onClick={() => setTypeOpen(!typeOpen)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/5 text-white text-xs text-left flex items-center justify-between gap-2 hover:border-white/10 transition-all"
                >
                  <span>{reportTypes.find((t) => t.value === reportType)?.label}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${typeOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {typeOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 right-0 mt-1 rounded-xl bg-slate-900 border border-white/10 shadow-xl shadow-black/50 z-50 overflow-hidden"
                    >
                      {reportTypes.map((t) => (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => { setReportType(t.value); setTypeOpen(false); }}
                          className={`w-full px-3 py-2 text-xs text-left transition-colors ${
                            reportType === t.value
                              ? 'bg-brand-500/20 text-brand-400 font-semibold'
                              : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1">Site</label>
              <input
                value={site}
                onChange={(e) => setSite(e.target.value)}
                placeholder="e.g. Digboi"
                className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/5 text-white text-xs focus:outline-none focus:border-brand-500/30 transition-all w-28"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1">Department</label>
              <input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Drilling"
                className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/5 text-white text-xs focus:outline-none focus:border-brand-500/30 transition-all w-28"
              />
            </div>
          </div>
          <input ref={fileRef} type="file" accept=".txt,.csv,.pdf,.doc,.docx" className="hidden" onChange={handleFile} />
          <button
            onClick={() => fileRef.current?.click()}
            className="btn-3d btn-3d-secondary py-2 px-4 text-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload
          </button>
          {fileError && (
            <span className="text-danger-500 text-[11px] font-medium">{fileError}</span>
          )}
          <button
            onClick={handleSubmit}
            disabled={loading || !text.trim()}
            className="btn-3d btn-3d-primary py-2 px-6 text-xs ml-auto w-full sm:w-auto disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing...</>
            ) : (
              <><FileSearch className="w-3.5 h-3.5" /> Analyze Report</>
            )}
          </button>
        </div>
      </motion.div>

      {/* Demo Mode Banner */}
      {demoMode && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 py-2.5 rounded-lg bg-warn-500/10 border border-warn-500/20 text-warn-500 text-xs font-semibold flex items-center gap-2">
          <Zap className="w-3.5 h-3.5" />
          DEMO MODE — Backend offline. Showing deterministic analysis on synthetic data.
        </motion.div>
      )}

      {error && (
        <div className="px-4 py-2 rounded-lg bg-danger-500/10 border border-danger-500/20 text-danger-500 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && r && rc && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
            {/* Synthetic Badge */}
            {demoMode && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-warn-500/5 border border-warn-500/10 w-fit">
                <Beaker className="w-3 h-3 text-warn-500" />
                <span className="text-[10px] font-bold text-warn-500/80 uppercase tracking-wider">Synthetic Data</span>
              </div>
            )}

            {/* Risk Banner */}
            <div className={`glass p-5 flex items-center gap-5 ${rc.bg} border ${rc.border} gradient-border`}>
              <div className={`w-14 h-14 rounded-2xl ${rc.bg} flex items-center justify-center shrink-0`}>
                {r.risk_level === 'HIGH' ? <AlertOctagon className={`w-7 h-7 ${rc.text}`} /> :
                 r.risk_level === 'MEDIUM' ? <AlertTriangle className={`w-7 h-7 ${rc.text}`} /> :
                 <CheckCircle2 className={`w-7 h-7 ${rc.text}`} />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`text-2xl font-bold ${rc.text}`}>{r.risk_level} RISK</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-danger-500/15 text-danger-500 text-xs font-bold border border-danger-500/20">
                    SIF PRECURSOR
                  </span>
                </div>
                <div className="text-slate-400 text-sm mt-1">
                  Confidence: <strong className="text-white">{(r.confidence_score * 100).toFixed(1)}%</strong>
                  <span className="mx-2 text-slate-600">|</span>
                  Review Priority: <strong className="text-white">{r.review_priority}</strong>
                </div>
              </div>
            </div>

            {/* Explanation + Precursors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="glass p-5 gradient-border">
                <h3 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  <Lightbulb className="w-3.5 h-3.5 text-warn-400" /> AI Explanation
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">{r.explanation}</p>
              </div>
              <div className="glass p-5 gradient-border">
                <h3 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  <Flag className="w-3.5 h-3.5 text-brand-400" /> Detected SIF Precursors
                </h3>
                <div className="space-y-3">
                  {r.detected_precursors.map((p, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-white text-sm font-medium">{p.name}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-danger-500 to-warn-500" style={{ width: `${p.confidence * 100}%` }} />
                        </div>
                        <span className="text-slate-500 text-xs font-semibold w-9 text-right">{(p.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Controls + Evidence */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="glass p-5 gradient-border">
                <h3 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  <AlertTriangle className="w-3.5 h-3.5 text-danger-400" /> Missing / Weak Controls
                </h3>
                <div className="space-y-2">
                  {r.missing_controls.length > 0 ? r.missing_controls.map((c, i) => (
                    <div key={i} className="p-3 rounded-lg bg-danger-500/5 border-l-[3px] border-danger-500">
                      <div className="text-white text-sm font-medium">{c.control}</div>
                      <div className="text-slate-500 text-xs mt-0.5">{c.category}</div>
                    </div>
                  )) : <p className="text-slate-500 text-sm">No missing controls detected.</p>}
                </div>
              </div>
              <div className="glass p-5 gradient-border">
                <h3 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  <MessageSquareWarning className="w-3.5 h-3.5 text-brand-400" /> Key Evidence Phrases
                </h3>
                <div className="flex flex-wrap gap-2">
                  {r.important_phrases.map((p, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-lg bg-brand-500/10 text-brand-400 text-xs font-medium border border-brand-500/15">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="p-4 rounded-xl bg-warn-500/5 border-l-[3px] border-warn-500">
              <span className="text-warn-500 text-xs leading-relaxed">
                <strong>Disclaimer:</strong> This AI-generated analysis supports but does not replace human safety judgment. Final safety decisions must be made by qualified personnel. {demoMode && 'This analysis was performed on synthetic demo data.'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getDemoResult(text: string, reportType: string): AnalysisResult {
  const lower = text.toLowerCase();
  const hasUnguarded = lower.includes('unguarded') || lower.includes('moving');
  const hasIsolation = lower.includes('isolation') || lower.includes('lockout') || lower.includes('tagout') || lower.includes('loto');
  const hasConfined = lower.includes('confined') || lower.includes('entry');
  const hasFall = lower.includes('fall') || lower.includes('height') || lower.includes('elevated');
  const hasStruck = lower.includes('struck') || lower.includes('hit') || lower.includes('impact');
  const hasGas = lower.includes('h2s') || lower.includes('gas') || lower.includes('hydrogen sulfide');
  const hasPPE = lower.includes('ppe') || lower.includes('protective equipment');
  const hasFire = lower.includes('fire') || lower.includes('flame');
  const hasPressure = lower.includes('pressure') || lower.includes('leak');

  const precursors: Array<{ name: string; confidence: number; category: string }> = [];
  if (hasGas) precursors.push({ name: 'H2S Gas Exposure', confidence: 0.92, category: 'Chemical Exposure' });
  if (hasConfined) precursors.push({ name: 'Confined Space Entry', confidence: 0.88, category: 'High-risk Activity' });
  if (hasIsolation) precursors.push({ name: 'Lockout/Tagout Failure', confidence: 0.87, category: 'Hazardous Energy' });
  if (hasUnguarded) precursors.push({ name: 'Moving Equipment Exposure', confidence: 0.85, category: 'Unsafe Condition' });
  if (hasFall) precursors.push({ name: 'Fall from Height', confidence: 0.82, category: 'Fall-related' });
  if (hasStruck) precursors.push({ name: 'Struck-by Hazard', confidence: 0.80, category: 'Struck-by' });
  if (hasPPE) precursors.push({ name: 'PPE Non-compliance', confidence: 0.75, category: 'Personal Protection' });
  if (hasFire) precursors.push({ name: 'Fire Risk', confidence: 0.83, category: 'Fire/Explosion' });
  if (hasPressure) precursors.push({ name: 'Pressure System Anomaly', confidence: 0.78, category: 'Mechanical Energy' });
  if (precursors.length === 0) precursors.push({ name: 'General Safety Hazard', confidence: 0.65, category: 'Unsafe Condition' });

  const maxConf = Math.max(...precursors.map(p => p.confidence));
  const risk = maxConf > 0.8 ? 'HIGH' : maxConf > 0.6 ? 'MEDIUM' : 'LOW';

  const controls: Array<{ control: string; category: string }> = [];
  if (hasGas) controls.push({ control: 'Gas Monitoring & Detection', category: 'Environmental Monitoring' });
  if (hasIsolation) controls.push({ control: 'Lockout/Tagout Procedures', category: 'Energy Isolation' });
  if (hasConfined) controls.push({ control: 'Confined Space Entry Permit', category: 'Entry Control' });
  if (hasUnguarded) controls.push({ control: 'Machine Guarding', category: 'Physical Protection' });
  if (hasFall) controls.push({ control: 'Fall Protection System', category: 'Fall Prevention' });
  if (hasPPE) controls.push({ control: 'PPE Compliance Program', category: 'Personal Protection' });
  if (controls.length === 0) controls.push({ control: 'Standard Safety Procedures', category: 'Administrative Control' });

  const keyPhrases: string[] = [];
  if (hasGas) keyPhrases.push('H2S gas detected', 'toxic gas exposure', 'gas monitoring not calibrated');
  if (hasConfined) keyPhrases.push('confined space entry', 'no gas testing', 'oxygen deficiency');
  if (hasIsolation) keyPhrases.push('no isolation procedures', 'LOTO not implemented');
  if (hasUnguarded) keyPhrases.push('unguarded moving component', 'inadequate isolation');
  if (hasFall) keyPhrases.push('working at height', 'no fall protection');
  if (hasStruck) keyPhrases.push('struck-by exposure', 'impact hazard');
  if (keyPhrases.length === 0) keyPhrases.push('safety hazard identified', 'requires review');

  return {
    report_id: 9999,
    analysis: {
      risk_level: risk as 'HIGH' | 'MEDIUM' | 'LOW',
      confidence_score: maxConf,
      sif_precursor: risk === 'HIGH',
      review_priority: risk === 'HIGH' ? 'critical' : risk === 'MEDIUM' ? 'high' : 'normal',
      detected_precursors: precursors,
      missing_controls: controls,
      important_phrases: keyPhrases,
      explanation: `Risk Assessment: ${risk} (confidence: ${(maxConf * 100).toFixed(0)}%) — The report describes conditions involving ${precursors.map(p => p.name.toLowerCase()).join(', ')}. These patterns are strongly associated with Serious Injury & Fatality (SIF) precursors in oil and gas operations. ${risk === 'HIGH' ? 'IMMEDIATE safety team review required.' : risk === 'MEDIUM' ? 'Review within 24 hours recommended.' : 'Log for routine safety review.'} DISCLAIMER: AI-generated analysis — not a substitute for professional safety judgment.`,
    },
  };
}
