import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, LineChart, Line, CartesianGrid
} from 'recharts';
import {
  BarChart3, AlertOctagon, AlertTriangle, CheckCircle2, TrendingUp,
  MapPin, Bell, RefreshCw, Brain, Activity,
  Eye, FileText, ArrowUpRight, ArrowDownRight, Clock, Database,
  ChevronRight, Target, Layers, GitBranch, LayoutDashboard, Bot
} from 'lucide-react';
import InteractiveSynapseNetwork from '../components/InteractiveSynapseNetwork';

const COLORS = { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#22c55e' };
const tipStyle = { contentStyle: { background: 'rgba(6,10,20,0.95)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 12, color: '#f8fafc', fontSize: 12 } };

// ─── Mock Data ───
const mockOverview = {
  total_reports: 250, high_risk_count: 61, medium_risk_count: 80, low_risk_count: 109,
  most_common_precursor: 'H2S Gas Release', highest_risk_site: 'Digboi',
  highest_risk_department: 'Drilling', recent_alerts_count: 12
};

const mockTrends = {
  precursor_trends: [
    { name: 'H2S Release', count: 45 }, { name: 'HWC', count: 38 },
    { name: 'UHC', count: 32 }, { name: 'Gas Leak', count: 28 },
    { name: 'Equipment Failure', count: 22 }, { name: 'Fire', count: 18 },
  ],
  risk_distribution: { HIGH: 61, MEDIUM: 80, LOW: 109 },
  department_trends: [
    { name: 'Drilling', count: 45, HIGH: 15, MEDIUM: 18, LOW: 12 },
    { name: 'Production', count: 38, HIGH: 12, MEDIUM: 14, LOW: 12 },
    { name: 'Pipeline', count: 35, HIGH: 10, MEDIUM: 12, LOW: 13 },
    { name: 'Refinery', count: 30, HIGH: 8, MEDIUM: 10, LOW: 12 },
    { name: 'Maintenance', count: 28, HIGH: 7, MEDIUM: 9, LOW: 12 },
    { name: 'Field Ops', count: 25, HIGH: 6, MEDIUM: 8, LOW: 11 },
  ],
  site_trends: [
    { name: 'Digboi', count: 55, HIGH: 18, MEDIUM: 20, LOW: 17 },
    { name: 'Margherita', count: 45, HIGH: 14, MEDIUM: 16, LOW: 15 },
    { name: 'Duliajan', count: 40, HIGH: 12, MEDIUM: 14, LOW: 14 },
    { name: 'Tinsukia', count: 35, HIGH: 10, MEDIUM: 12, LOW: 13 },
    { name: 'Jorhat', count: 30, HIGH: 8, MEDIUM: 10, LOW: 12 },
  ],
  recurring_hazards: [
    { hazard: 'H2S Exposure', count: 35 }, { hazard: 'Fire Risk', count: 28 },
    { hazard: 'Equipment Failure', count: 25 }, { hazard: 'Gas Leak', count: 22 },
    { hazard: 'Slip/Trip', count: 18 }, { hazard: 'Chemical Spill', count: 15 },
    { hazard: 'Electrical', count: 12 }, { hazard: 'Structural', count: 10 },
  ],
  missing_control_trends: [
    { control: 'Gas Monitoring', count: 42 }, { control: 'PPE Compliance', count: 35 },
    { control: 'Ventilation', count: 28 }, { control: 'Training', count: 22 },
  ]
};

const mockReports = [
  { id: 1, report_text: 'H2S gas detected in wellhead area, workers evacuated', report_type: 'gas_detection', site: 'Digboi', department: 'Drilling', date: '2026-09-02', prediction: { risk_level: 'HIGH' as const, confidence_score: 0.94 } },
  { id: 2, report_text: 'Equipment vibration abnormal on compressor unit C-4', report_type: 'equipment', site: 'Margherita', department: 'Maintenance', date: '2026-09-01', prediction: { risk_level: 'MEDIUM' as const, confidence_score: 0.78 } },
  { id: 3, report_text: 'Routine safety inspection completed with minor findings', report_type: 'inspection', site: 'Duliajan', department: 'Production', date: '2026-08-31', prediction: { risk_level: 'LOW' as const, confidence_score: 0.92 } },
  { id: 4, report_text: 'Hydrocarbon vapor detected near processing unit P-3', report_type: 'gas_detection', site: 'Tinsukia', department: 'Refinery', date: '2026-08-30', prediction: { risk_level: 'HIGH' as const, confidence_score: 0.89 } },
  { id: 5, report_text: 'Pipeline pressure anomaly detected in segment PS-7', report_type: 'equipment', site: 'Jorhat', department: 'Pipeline', date: '2026-08-29', prediction: { risk_level: 'MEDIUM' as const, confidence_score: 0.71 } },
  { id: 6, report_text: 'Worker safety training completed for Q3 batch', report_type: 'training', site: 'Digboi', department: 'Field Ops', date: '2026-08-28', prediction: { risk_level: 'LOW' as const, confidence_score: 0.95 } },
  { id: 7, report_text: 'Fire detection system alert in warehouse W-2', report_type: 'fire', site: 'Margherita', department: 'Maintenance', date: '2026-08-27', prediction: { risk_level: 'HIGH' as const, confidence_score: 0.87 } },
  { id: 8, report_text: 'Drilling mud return shows unusual gas content', report_type: 'drilling', site: 'Duliajan', department: 'Drilling', date: '2026-08-26', prediction: { risk_level: 'MEDIUM' as const, confidence_score: 0.65 } },
];

const riskTrendData = [
  { month: 'Apr', high: 18, medium: 22, low: 35 },
  { month: 'May', high: 15, medium: 20, low: 38 },
  { month: 'Jun', high: 12, medium: 18, low: 40 },
  { month: 'Jul', high: 10, medium: 15, low: 42 },
  { month: 'Aug', high: 8, medium: 12, low: 45 },
  { month: 'Sep', high: 6, medium: 8, low: 48 },
];

const siteHeatmap = [
  { site: 'Digboi', risk: 38, color: '#ef4444' },
  { site: 'Margherita', risk: 30, color: '#f59e0b' },
  { site: 'Duliajan', risk: 25, color: '#f59e0b' },
  { site: 'Tinsukia', risk: 20, color: '#22c55e' },
  { site: 'Jorhat', risk: 15, color: '#22c55e' },
];

// ─── Risk Gauge Component ───
function RiskGauge({ value, label }: { value: number; label: string }) {
  const angle = (value / 100) * 180;
  const color = value > 70 ? '#ef4444' : value > 40 ? '#f59e0b' : '#22c55e';

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="140" height="80" viewBox="0 0 140 80">
        <path d="M 10 70 A 60 60 0 0 1 130 70" fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="10" strokeLinecap="round" />
        <path
          d="M 10 70 A 60 60 0 0 1 130 70"
          fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${(angle / 180) * 188.5} 188.5`}
          style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
        />
        <text x="70" y="65" textAnchor="middle" fill={color} fontSize="22" fontWeight="bold">{value}%</text>
      </svg>
      <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{label}</span>
    </div>
  );
}

// ─── Sidebar Link Component ───
function SidebarLink({ icon: Icon, label, active, onClick }: { icon: any; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
        active
          ? 'bg-gradient-to-r from-brand-500/15 to-blue-500/10 text-white border border-brand-500/20'
          : 'text-slate-500 hover:text-white hover:bg-white/[0.04] border border-transparent'
      }`}
    >
      <Icon className={`w-5 h-5 ${active ? 'text-brand-400' : 'text-slate-500'}`} />
      {label}
    </button>
  );
}

// ─── KPI Card ───
function KPICard({ icon: Icon, label, value, change, changeType, color, bg, border, glow }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass p-5 ${bg} border ${border} stat-card ${glow} hover:-translate-y-1 transition-all duration-300 gradient-border`}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">{label}</div>
          <div className={`text-3xl font-bold mt-2 ${color}`}>{value}</div>
          <div className={`flex items-center gap-1 mt-1 text-xs ${changeType === 'up' ? 'text-danger-500' : 'text-success-500'}`}>
            {changeType === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            <span>{change} vs last month</span>
          </div>
        </div>
        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color} opacity-80`} />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Dashboard ───
export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'model' | 'chat'>('overview');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: string; text: string }[]>([
    { role: 'ai', text: 'Hello! I\'m NexGuard AI Safety Assistant. How can I help you analyze SIF precursors today?' }
  ]);

  const handleChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [
      ...prev,
      { role: 'user', text: chatInput },
      { role: 'ai', text: 'Based on my analysis of the recent reports, I recommend prioritizing H2S monitoring in the Digboi drilling zone. The trend shows a 15% increase in gas detection incidents.' }
    ]);
    setChatInput('');
  };

  const stats = [
    { label: 'Total Reports', value: mockOverview.total_reports, icon: BarChart3, color: 'text-brand-400', bg: 'bg-brand-500/10', border: 'border-brand-500/15', glow: 'glow-brand', change: '+12%', changeType: 'up' },
    { label: 'High Risk', value: mockOverview.high_risk_count, icon: AlertOctagon, color: 'text-danger-500', bg: 'bg-danger-500/10', border: 'border-danger-500/15', glow: 'glow-danger', change: '-8%', changeType: 'down' },
    { label: 'Medium Risk', value: mockOverview.medium_risk_count, icon: AlertTriangle, color: 'text-warn-500', bg: 'bg-warn-500/10', border: 'border-warn-500/15', glow: 'glow-warn', change: '-15%', changeType: 'down' },
    { label: 'Low Risk', value: mockOverview.low_risk_count, icon: CheckCircle2, color: 'text-success-500', bg: 'bg-success-500/10', border: 'border-success-500/15', glow: 'glow-success', change: '+5%', changeType: 'up' },
  ];

  const pieData = [
    { name: 'HIGH', value: mockTrends.risk_distribution.HIGH },
    { name: 'MEDIUM', value: mockTrends.risk_distribution.MEDIUM },
    { name: 'LOW', value: mockTrends.risk_distribution.LOW },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
            <span className="text-xs text-success-500 font-semibold uppercase tracking-wider">System Operational</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Safety Intelligence Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time SIF precursor monitoring across Oil India Limited</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-slate-400 text-sm">
            <Clock className="w-4 h-4" />
            <span>Last updated: 2 min ago</span>
          </div>
          <button className="btn-3d btn-3d-primary py-2 px-4 text-xs">
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
          { id: 'insights' as const, label: 'Risk Insights', icon: AlertTriangle },
          { id: 'model' as const, label: 'AI Model', icon: Brain },
          { id: 'chat' as const, label: 'AI Assistant', icon: Bot },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-brand-500/15 text-white border border-brand-500/20'
                : 'text-slate-500 hover:text-white hover:bg-white/[0.04] border border-transparent'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => <KPICard key={s.label} {...s} />)}
          </div>

          {/* 3D AI Visualization + Risk Gauge */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass p-5 gradient-border overflow-hidden h-[280px] sm:h-[360px]">
              <div className="flex items-center justify-between mb-3 relative z-10">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Brain className="w-3.5 h-3.5 text-brand-400" />
                  Neural Network Analysis Core
                </h3>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-success-500/10 border border-success-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-success-500">ACTIVE</span>
                </div>
              </div>
              <div className="absolute inset-0 top-12">
                <InteractiveSynapseNetwork
                  nodeColor="rgba(59,130,246,0.8)"
                  pulseColor="rgba(255,255,255,1)"
                  nodeCount={60}
                  connectionRadius={150}
                  trailOpacity={0.15}
                />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass p-5 gradient-border space-y-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Target className="w-3.5 h-3.5" />
                Risk Assessment
              </h3>
              <RiskGauge value={72} label="Overall Risk" />
              <RiskGauge value={45} label="Trend Direction" />
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">SIF Probability</span>
                  <span className="text-danger-500 font-bold">34%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/[0.05]">
                  <div className="h-full rounded-full bg-gradient-to-r from-danger-500 to-warn-500" style={{ width: '34%' }} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Detection Accuracy</span>
                  <span className="text-success-500 font-bold">94.2%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/[0.05]">
                  <div className="h-full rounded-full bg-gradient-to-r from-success-500 to-brand-500" style={{ width: '94.2%' }} />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass p-5 gradient-border">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Risk Distribution</h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value" stroke="none">
                    {pieData.map((e) => <Cell key={e.name} fill={COLORS[e.name as keyof typeof COLORS]} />)}
                  </Pie>
                  <Tooltip {...tipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-5 mt-2">
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[d.name as keyof typeof COLORS] }} />
                    <span className="text-xs text-slate-500">{d.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="glass p-5 gradient-border">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5" /> Precursor Categories
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={mockTrends.precursor_trends} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                  <Tooltip {...tipStyle} />
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.5} />
                    </linearGradient>
                  </defs>
                  <Bar dataKey="count" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Department + Hazards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass p-5 gradient-border">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" /> Risk by Department
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={mockTrends.department_trends} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#475569' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#475569' }} axisLine={false} tickLine={false} />
                  <Tooltip {...tipStyle} />
                  <Legend iconType="circle" iconSize={5} formatter={(v) => <span className="text-slate-400 text-xs">{v}</span>} />
                  <Bar dataKey="HIGH" stackId="a" fill={COLORS.HIGH} />
                  <Bar dataKey="MEDIUM" stackId="a" fill={COLORS.MEDIUM} />
                  <Bar dataKey="LOW" stackId="a" fill={COLORS.LOW} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass p-5 gradient-border">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5" /> Recurring Hazards
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={mockTrends.recurring_hazards.slice(0, 8)} cx="50%" cy="50%" outerRadius="65%">
                  <PolarGrid stroke="rgba(148,163,184,0.06)" />
                  <PolarAngleAxis dataKey="hazard" tick={{ fontSize: 8, fill: '#64748b' }} />
                  <PolarRadiusAxis tick={{ fontSize: 7, fill: '#475569' }} />
                  <Radar name="Count" dataKey="count" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                  <Tooltip {...tipStyle} />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Risk Trend + Site Heatmap */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="glass p-5 gradient-border">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5" /> Risk Trend (6 Months)
              </h3>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={riskTrendData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                  <Tooltip {...tipStyle} />
                  <Line type="monotone" dataKey="high" stroke={COLORS.HIGH} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="medium" stroke={COLORS.MEDIUM} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="low" stroke={COLORS.LOW} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="glass p-5 gradient-border">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" /> Site Risk Heatmap
              </h3>
              <div className="space-y-3">
                {siteHeatmap.map((site, i) => (
                  <motion.div
                    key={site.site}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <span className="text-xs text-slate-400 w-24 shrink-0">{site.site}</span>
                    <div className="flex-1 h-3 rounded-full bg-white/[0.03] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${site.risk}%` }}
                        transition={{ delay: 0.9 + i * 0.05, duration: 0.8, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${site.color}80, ${site.color})` }}
                      />
                    </div>
                    <span className="text-xs font-bold" style={{ color: site.color }}>{site.risk}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Recent Reports */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="glass p-5 gradient-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" /> Recent Reports
              </h3>
              <button className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
                View All <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {['#', 'Report', 'Type', 'Site', 'Risk', 'Confidence', 'Date'].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mockReports.map((r, i) => (
                    <tr key={r.id} className="border-b border-white/[0.03] table-row-hover">
                      <td className="px-3 py-2.5 text-sm text-slate-500">{i + 1}</td>
                      <td className="px-3 py-2.5 text-sm text-white max-w-[200px] truncate">{r.report_text}</td>
                      <td className="px-3 py-2.5">
                        <span className="px-2 py-0.5 rounded-md bg-white/[0.04] text-xs text-slate-400 border border-white/5 capitalize">{r.report_type.replace('_', ' ')}</span>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-slate-400">{r.site}</td>
                      <td className="px-3 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          r.prediction.risk_level === 'HIGH' ? 'bg-danger-500/10 text-danger-500 border border-danger-500/20' :
                          r.prediction.risk_level === 'MEDIUM' ? 'bg-warn-500/10 text-warn-500 border border-warn-500/20' :
                          'bg-success-500/10 text-success-500 border border-success-500/20'
                        }`}>{r.prediction.risk_level}</span>
                      </td>
                      <td className="px-3 py-2.5 text-sm font-semibold text-white">
                        {(r.prediction.confidence_score * 100).toFixed(0)}%
                      </td>
                      <td className="px-3 py-2.5 text-sm text-slate-400">{r.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      )}

      {/* Risk Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Active Alerts', value: '12', icon: Bell, color: 'text-danger-500', bg: 'bg-danger-500/10' },
              { label: 'Pending Review', value: '8', icon: Eye, color: 'text-warn-500', bg: 'bg-warn-500/10' },
              { label: 'Resolved Today', value: '5', icon: CheckCircle2, color: 'text-success-500', bg: 'bg-success-500/10' },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass p-5 gradient-border">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">{s.label}</div>
                    <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 gradient-border">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-danger-500" /> Active Risk Alerts
            </h3>
            <div className="space-y-3">
              {[
                { title: 'H2S Concentration Spike - Digboi Well D-7', severity: 'HIGH', time: '12 min ago', dept: 'Drilling' },
                { title: 'Equipment Vibration Anomaly - Compressor C-4', severity: 'MEDIUM', time: '45 min ago', dept: 'Maintenance' },
                { title: 'Pipeline Pressure Deviation - Segment PS-7', severity: 'MEDIUM', time: '1 hour ago', dept: 'Pipeline' },
                { title: 'Fire Detection Alert - Warehouse W-2', severity: 'HIGH', time: '2 hours ago', dept: 'Maintenance' },
              ].map((alert, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${alert.severity === 'HIGH' ? 'bg-danger-500 animate-pulse' : 'bg-warn-500'}`} />
                    <div className="min-w-0">
                      <div className="text-sm text-white font-medium truncate">{alert.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{alert.dept} · {alert.time}</div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    alert.severity === 'HIGH' ? 'bg-danger-500/10 text-danger-500 border border-danger-500/20' : 'bg-warn-500/10 text-warn-500 border border-warn-500/20'
                  }`}>{alert.severity}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* AI Model Tab */}
      {activeTab === 'model' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Model Version', value: 'v2.1', icon: GitBranch, color: 'text-brand-400', bg: 'bg-brand-500/10' },
              { label: 'Accuracy', value: '94.2%', icon: Target, color: 'text-success-500', bg: 'bg-success-500/10' },
              { label: 'Total Predictions', value: '1,247', icon: Layers, color: 'text-warn-500', bg: 'bg-warn-500/10' },
              { label: 'Last Retrained', value: '2d ago', icon: Clock, color: 'text-brand-400', bg: 'bg-brand-500/10' },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass p-5 gradient-border">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">{s.label}</div>
                    <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-5 gradient-border">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Model Performance</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={[
                  { metric: 'Precision', value: 94.2 },
                  { metric: 'Recall', value: 91.8 },
                  { metric: 'F1 Score', value: 93.0 },
                  { metric: 'AUC-ROC', value: 96.5 },
                ]}>
                  <XAxis dataKey="metric" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[80, 100]} tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                  <Tooltip {...tipStyle} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-5 gradient-border">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Detection Capabilities</h3>
              <div className="space-y-3">
                {[
                  { name: 'H2S Gas Detection', accuracy: 97, status: 'optimal' },
                  { name: 'Equipment Anomaly', accuracy: 92, status: 'optimal' },
                  { name: 'Fire Risk Assessment', accuracy: 95, status: 'optimal' },
                  { name: 'Structural Integrity', accuracy: 89, status: 'warning' },
                  { name: 'Chemical Exposure', accuracy: 93, status: 'optimal' },
                ].map((cap, i) => (
                  <div key={cap.name} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cap.status === 'optimal' ? '#22c55e' : '#f59e0b' }} />
                    <span className="text-sm text-slate-400 flex-1">{cap.name}</span>
                    <div className="w-24 h-1.5 rounded-full bg-white/[0.05]">
                      <div className="h-full rounded-full bg-brand-500" style={{ width: `${cap.accuracy}%` }} />
                    </div>
                    <span className="text-xs font-bold text-white w-10 text-right">{cap.accuracy}%</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* AI Chat Tab */}
      {activeTab === 'chat' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-5 gradient-border">
          <div className="flex items-center gap-2 mb-4">
            <Bot className="w-5 h-5 text-brand-400" />
            <h3 className="text-sm font-bold text-white">NexGuard AI Safety Assistant</h3>
            <div className="ml-auto flex items-center gap-1.5 px-2 py-1 rounded-lg bg-success-500/10 border border-success-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse" />
              <span className="text-[10px] font-bold text-success-500">ONLINE</span>
            </div>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto mb-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-brand-500/20 text-white border border-brand-500/20 rounded-br-sm'
                    : 'bg-white/[0.05] text-slate-300 border border-white/5 rounded-bl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleChat()}
              placeholder="Ask about SIF precursors, risk analysis, or safety protocols..."
              className="flex-1 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5 text-white text-sm focus:outline-none focus:border-brand-500/30 transition-all placeholder:text-slate-600"
            />
            <button onClick={handleChat} className="btn-3d btn-3d-primary py-3 px-5 text-sm">
              Send
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
