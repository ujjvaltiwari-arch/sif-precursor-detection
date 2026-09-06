import { motion } from 'framer-motion';
import { Users, Shield, Code, Brain, Database, Palette, ArrowRight, Zap, Target, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const members = [
  { role: 'Team Lead / AI Engineer', focus: 'ML Pipeline, Architecture, NLP Models', icon: Brain, color: 'from-brand-500/20 to-blue-600/10' },
  { role: 'Backend Engineer', focus: 'FastAPI, Database Design, API Architecture', icon: Database, color: 'from-purple-500/20 to-violet-600/10' },
  { role: 'Frontend Engineer', focus: 'React, Three.js, UI/UX, 3D Visualization', icon: Palette, color: 'from-cyan-500/20 to-blue-500/10' },
  { role: 'NLP Researcher', focus: 'Text Analysis, Transformer Models, Explainability', icon: Code, color: 'from-emerald-500/20 to-green-600/10' },
];

const features = [
  { icon: Brain, title: 'AI-Powered', desc: 'Transformer models trained on domain-specific safety data' },
  { icon: Target, title: 'SIF Detection', desc: 'Identifies precursor patterns before incidents occur' },
  { icon: Zap, title: 'Real-time', desc: 'Instant analysis and risk classification of reports' },
  { icon: Globe, title: 'Scalable', desc: 'Multi-site deployment across Oil India operations' },
];

export default function TeamPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-4">
            <Users className="w-3.5 h-3.5" />
            Smart India Hackathon 2026
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Team <span className="gradient-text">Anveshak</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Building the future of workplace safety intelligence through AI and innovation.
          </p>
        </motion.div>

        {/* Members */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-14">
          {members.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass p-6 hover:border-brand-500/20 transition-all duration-300 hover:-translate-y-1 gradient-border group"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${m.color} border border-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                  <m.icon className="w-6 h-6 text-brand-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-base mb-1">{m.role}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{m.focus}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Features */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
          <div className="text-center mb-8">
            <span className="text-xs text-brand-400 font-bold uppercase tracking-widest mb-3 block">Features</span>
            <h2 className="text-2xl font-bold text-white">What We Built</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass p-5 text-center gradient-border hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-lg bg-brand-500/10 border border-brand-500/15 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <f.icon className="w-5 h-5 text-brand-400" />
                </div>
                <h3 className="text-white font-bold text-sm mb-1">{f.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* About */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass p-8 text-center gradient-border glow-brand">
          <Shield className="w-10 h-10 text-brand-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white mb-3">About the Project</h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl mx-auto mb-5">
            The AI-Based SIF Precursor Detection System is developed for Smart India Hackathon 2026,
            Problem Statement #26165, in collaboration with Oil India Limited.
            The system uses natural language processing and machine learning to analyze safety reports
            and identify patterns associated with Serious Injury &amp; Fatality precursors.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <span className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-slate-400 text-xs font-medium">Problem #26165</span>
            <span className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-slate-400 text-xs font-medium">Oil India Limited</span>
            <span className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-slate-400 text-xs font-medium">SIH 2026</span>
          </div>
          <Link to="/analyze" className="btn-3d btn-3d-primary inline-flex">
            Try the System
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
