import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  FileText, Upload, Search, Brain, Zap, Target, BarChart3,
  Eye, Layers, Users, ArrowRight, CheckCircle2, Shield,
} from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, duration: 0.6 } };

const steps = [
  { icon: FileText, title: 'Safety Report', desc: 'A worker or safety officer submits a report describing an incident, near-miss, or hazard observation.', color: 'text-brand-400', bg: 'bg-brand-500/10' },
  { icon: Upload, title: 'Report Input', desc: 'The report text is entered via the web interface or uploaded as a .txt/.csv file.', color: 'text-brand-400', bg: 'bg-brand-500/10' },
  { icon: Search, title: 'Text Preprocessing', desc: 'Raw text is cleaned, normalized, and tokenized. Abbreviations expanded, PII removed.', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { icon: Brain, title: 'NLP Analysis', desc: 'Feature extraction using TF-IDF vectors and keyword hazard detection.', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { icon: Zap, title: 'AI / Transformer Model', desc: 'Baseline logistic regression or fine-tuned BERT model classifies the risk.', color: 'text-violet-400', bg: 'bg-violet-500/10' },
  { icon: Target, title: 'SIF Precursor Detection', desc: 'System identifies language patterns associated with serious injury/fatality precursors.', color: 'text-danger-500', bg: 'bg-danger-500/10' },
  { icon: BarChart3, title: 'Risk Classification', desc: 'Report classified as LOW, MEDIUM, or HIGH risk with confidence score.', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { icon: Eye, title: 'Explainable Result', desc: 'SHAP/LIME explainability shows which words and features drove the classification.', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { icon: Layers, title: 'Risk Dashboard', desc: 'Aggregated insights, trends, and heatmaps visualize organizational risk posture.', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { icon: Users, title: 'Human Safety Review', desc: 'Safety professionals review AI findings, confirm or override, and take preventive action.', color: 'text-brand-400', bg: 'bg-brand-500/10' },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen pt-20 pb-16 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-6">
            <Shield className="w-3.5 h-3.5" />
            Complete Workflow
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">How It Works</h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            From raw safety report to actionable intelligence — a complete AI-powered analysis pipeline.
          </p>
        </motion.div>

        <div className="space-y-4">
          {steps.map((step, i) => (
            <StepCard key={i} step={step} index={i} isLast={i === steps.length - 1} />
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mt-16">
          <Link
            to="/analyze"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-brand-500 text-white font-semibold hover:bg-brand-600 transition-all no-underline"
          >
            Try It Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

function StepCard({ step, index, isLast }: { step: typeof steps[0]; index: number; isLast: boolean }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={fadeUp}
      className="flex gap-5"
    >
      <div className="flex flex-col items-center">
        <div className={`w-12 h-12 rounded-2xl ${step.bg} flex items-center justify-center flex-shrink-0`}>
          <step.icon className={`w-5 h-5 ${step.color}`} />
        </div>
        {!isLast && <div className="w-px flex-1 bg-white/5 my-2" />}
      </div>
      <div className={`glass p-5 flex-1 ${isLast ? '' : 'mb-0'}`}>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs text-brand-400 font-bold">Step {String(index + 1).padStart(2, '0')}</span>
          <h3 className="text-white font-semibold">{step.title}</h3>
        </div>
        <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
      </div>
    </motion.div>
  );
}
