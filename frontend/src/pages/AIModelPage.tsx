import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, LineChart, Line, CartesianGrid
} from 'recharts';
import {
  Brain, Target, Layers, Clock, Activity, Zap, GitBranch,
  Database, Cpu, RefreshCw, TrendingUp, Shield, AlertTriangle,
  CheckCircle2, Info
} from 'lucide-react';
import type { Mesh } from 'three';

const tipStyle = { contentStyle: { background: 'rgba(6,10,20,0.95)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 12, color: '#f8fafc', fontSize: 12 } };

// ─── 3D AI Core ───
function AICore() {
  const meshRef = useRef<Mesh>(null!);
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.3) * 0.15;
    }
  });
  return (
    <group>
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
        <mesh ref={meshRef}>
          <octahedronGeometry args={[1.5, 0]} />
          <MeshDistortMaterial color="#8b5cf6" emissive="#5b21b6" emissiveIntensity={0.5} roughness={0.3} metalness={0.7} distort={0.2} speed={1.5} />
        </mesh>
      </Float>
      {[...Array(12)].map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const r = 2.5;
        const y = (Math.random() - 0.5) * 2;
        return (
          <Float key={i} speed={1} rotationIntensity={0.1} floatIntensity={0.3}>
            <mesh position={[Math.cos(angle) * r, y, Math.sin(angle) * r]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={1} />
            </mesh>
          </Float>
        );
      })}
    </group>
  );
}

function AIScene() {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
      <ambientLight intensity={0.15} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#8b5cf6" />
      <pointLight position={[-10, -10, -10]} intensity={0.4} color="#3b82f6" />
      <AICore />
    </Canvas>
  );
}

// ─── Data ───
const performanceMetrics = [
  { metric: 'Precision', value: 94.2, color: '#3b82f6' },
  { metric: 'Recall', value: 91.8, color: '#8b5cf6' },
  { metric: 'F1 Score', value: 93.0, color: '#6366f1' },
  { metric: 'AUC-ROC', value: 96.5, color: '#22c55e' },
];

const capabilities = [
  { name: 'H2S Gas Detection', accuracy: 97, status: 'optimal', version: 'v2.1', lastUpdated: '2h ago' },
  { name: 'Equipment Anomaly Detection', accuracy: 92, status: 'optimal', version: 'v2.1', lastUpdated: '2h ago' },
  { name: 'Fire Risk Assessment', accuracy: 95, status: 'optimal', version: 'v2.0', lastUpdated: '1d ago' },
  { name: 'Structural Integrity Analysis', accuracy: 89, status: 'warning', version: 'v1.9', lastUpdated: '3d ago' },
  { name: 'Chemical Exposure Risk', accuracy: 93, status: 'optimal', version: 'v2.1', lastUpdated: '2h ago' },
  { name: 'SIF Precursor Identification', accuracy: 94, status: 'optimal', version: 'v2.1', lastUpdated: '2h ago' },
];

const trainingHistory = [
  { epoch: 1, loss: 0.85, accuracy: 72.3 },
  { epoch: 2, loss: 0.62, accuracy: 78.1 },
  { epoch: 3, loss: 0.48, accuracy: 83.5 },
  { epoch: 4, loss: 0.35, accuracy: 87.2 },
  { epoch: 5, loss: 0.28, accuracy: 90.1 },
  { epoch: 6, loss: 0.22, accuracy: 92.4 },
  { epoch: 7, loss: 0.18, accuracy: 93.6 },
  { epoch: 8, loss: 0.15, accuracy: 94.2 },
];

const confusionData = [
  { name: 'True Positive', value: 234, color: '#22c55e' },
  { name: 'True Negative', value: 189, color: '#3b82f6' },
  { name: 'False Positive', value: 12, color: '#f59e0b' },
  { name: 'False Negative', value: 15, color: '#ef4444' },
];

const featureImportance = [
  { feature: 'H2S Concentration', importance: 0.92 },
  { feature: 'Equipment Age', importance: 0.78 },
  { feature: 'Maintenance History', importance: 0.71 },
  { feature: 'Weather Conditions', importance: 0.65 },
  { feature: 'Worker Experience', importance: 0.58 },
  { feature: 'Shift Duration', importance: 0.45 },
  { feature: 'Training Score', importance: 0.38 },
  { feature: 'Incident History', importance: 0.32 },
];

export default function AIModelPage() {
  const [activeSection, setActiveSection] = useState<'overview' | 'performance' | 'capabilities' | 'training'>('overview');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">AI Model Center</h1>
          <p className="text-slate-500 text-sm mt-1">Machine learning model performance and capabilities</p>
        </div>
        <button className="btn-3d btn-3d-secondary py-2 px-4 text-xs">
          <RefreshCw className="w-3.5 h-3.5" />
          Retrain Model
        </button>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'overview' as const, label: 'Overview', icon: Brain },
          { id: 'performance' as const, label: 'Performance', icon: Target },
          { id: 'capabilities' as const, label: 'Capabilities', icon: Layers },
          { id: 'training' as const, label: 'Training History', icon: Activity },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              activeSection === tab.id
                ? 'bg-brand-500/15 text-white border border-brand-500/20'
                : 'text-slate-500 hover:text-white hover:bg-white/[0.04] border border-transparent'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Model Version', value: 'v2.1', icon: GitBranch, color: 'text-brand-400', bg: 'bg-brand-500/10', border: 'border-brand-500/15', glow: 'glow-brand' },
              { label: 'Accuracy', value: '94.2%', icon: Target, color: 'text-success-500', bg: 'bg-success-500/10', border: 'border-success-500/15', glow: 'glow-success' },
              { label: 'Total Predictions', value: '1,247', icon: Layers, color: 'text-warn-500', bg: 'bg-warn-500/10', border: 'border-warn-500/15', glow: 'glow-warn' },
              { label: 'Last Retrained', value: '2d ago', icon: Clock, color: 'text-brand-400', bg: 'bg-brand-500/10', border: 'border-brand-500/15', glow: 'glow-brand' },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className={`glass p-5 ${s.bg} border ${s.border} stat-card ${s.glow} gradient-border`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">{s.label}</div>
                    <div className={`text-3xl font-bold mt-2 ${s.color}`}>{s.value}</div>
                  </div>
                  <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                    <s.icon className={`w-5 h-5 ${s.color} opacity-80`} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass p-5 gradient-border overflow-hidden" style={{ height: '380px' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Brain className="w-3.5 h-3.5 text-brand-400" /> AI Core Visualization
                </h3>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-success-500/10 border border-success-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-success-500">ACTIVE</span>
                </div>
              </div>
              <AIScene />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass p-5 gradient-border space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Model Architecture</h3>
              <div className="space-y-3">
                {[
                  { label: 'Type', value: 'Ensemble (XGBoost + Neural Net)' },
                  { label: 'Features', value: '24 input features' },
                  { label: 'Training Data', value: '10,000+ reports' },
                  { label: 'Classes', value: 'HIGH / MEDIUM / LOW' },
                  { label: 'Inference Time', value: '< 50ms' },
                  { label: 'Model Size', value: '12.4 MB' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">{item.label}</span>
                    <span className="text-white font-medium text-xs">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-white/5">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Feature Importance</h4>
                <div className="space-y-2">
                  {featureImportance.slice(0, 4).map((f, i) => (
                    <div key={f.feature} className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 w-24 shrink-0 truncate">{f.feature}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-white/[0.05]">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${f.importance * 100}%` }} transition={{ delay: 0.5 + i * 0.05 }} className="h-full rounded-full bg-brand-500" />
                      </div>
                      <span className="text-[10px] font-bold text-white w-8 text-right">{(f.importance * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Performance */}
      {activeSection === 'performance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-5 gradient-border">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Performance Metrics</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={performanceMetrics} layout="vertical" margin={{ left: 20, right: 10 }}>
                  <XAxis type="number" domain={[80, 100]} tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="metric" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip {...tipStyle} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {performanceMetrics.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-5 gradient-border">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Confusion Matrix</h3>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {confusionData.map((item, i) => (
                  <motion.div key={item.name} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.05 }} className="p-4 rounded-xl text-center" style={{ background: `${item.color}10`, border: `1px solid ${item.color}20` }}>
                    <div className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</div>
                    <div className="text-xs text-slate-400 mt-1">{item.name}</div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Info className="w-3.5 h-3.5 text-brand-400" />
                  <span>Model correctly identifies <span className="text-success-500 font-bold">93.7%</span> of SIF precursors</span>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass p-5 gradient-border">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Full Feature Importance</h3>
            <div className="space-y-3">
              {featureImportance.map((f, i) => (
                <motion.div key={f.feature} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.03 }} className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-40 shrink-0">{f.feature}</span>
                  <div className="flex-1 h-2.5 rounded-full bg-white/[0.03] overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${f.importance * 100}%` }} transition={{ delay: 0.4 + i * 0.03, duration: 0.6 }} className="h-full rounded-full bg-gradient-to-r from-brand-500 to-purple-500" />
                  </div>
                  <span className="text-xs font-bold text-white w-10 text-right">{(f.importance * 100).toFixed(0)}%</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Capabilities */}
      {activeSection === 'capabilities' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {capabilities.map((cap, i) => (
              <motion.div key={cap.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass p-5 gradient-border hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${cap.status === 'optimal' ? 'bg-success-500' : 'bg-warn-500'}`} />
                    <span className="text-xs font-bold text-white">{cap.name}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-white/[0.04] text-[10px] text-slate-400 border border-white/5">{cap.version}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-white/[0.05]">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${cap.accuracy}%` }} transition={{ delay: 0.2 + i * 0.05, duration: 0.8 }} className="h-full rounded-full" style={{ background: cap.status === 'optimal' ? 'linear-gradient(90deg, #22c55e, #16a34a)' : 'linear-gradient(90deg, #f59e0b, #d97706)' }} />
                  </div>
                  <span className="text-sm font-bold text-white w-12 text-right">{cap.accuracy}%</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-slate-500">Last updated: {cap.lastUpdated}</span>
                  <span className={`text-[10px] font-bold uppercase ${cap.status === 'optimal' ? 'text-success-500' : 'text-warn-500'}`}>{cap.status}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Training History */}
      {activeSection === 'training' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-5 gradient-border">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Training Loss</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trainingHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" />
                  <XAxis dataKey="epoch" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                  <Tooltip {...tipStyle} />
                  <Line type="monotone" dataKey="loss" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-5 gradient-border">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Training Accuracy</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trainingHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" />
                  <XAxis dataKey="epoch" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[70, 100]} tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                  <Tooltip {...tipStyle} />
                  <Line type="monotone" dataKey="accuracy" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass p-5 gradient-border">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Training Log</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Epoch', 'Loss', 'Accuracy', 'Learning Rate', 'Status'].map(h => (
                      <th key={h} className="px-4 py-2 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {trainingHistory.map((t) => (
                    <tr key={t.epoch} className="border-b border-white/[0.03] table-row-hover">
                      <td className="px-4 py-2.5 text-sm text-white font-medium">{t.epoch}</td>
                      <td className="px-4 py-2.5 text-sm text-danger-500 font-mono">{t.loss.toFixed(3)}</td>
                      <td className="px-4 py-2.5 text-sm text-success-500 font-bold">{t.accuracy}%</td>
                      <td className="px-4 py-2.5 text-sm text-slate-400 font-mono">0.001</td>
                      <td className="px-4 py-2.5">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-success-500/10 text-success-500 border border-success-500/20">Complete</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
