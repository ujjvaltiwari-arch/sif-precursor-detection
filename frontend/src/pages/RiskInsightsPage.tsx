import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, CartesianGrid, Area, AreaChart
} from 'recharts';
import {
  AlertTriangle, TrendingUp, MapPin, Bell, CheckCircle2,
  Eye, Shield, Target
} from 'lucide-react';

const COLORS = { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#22c55e' };
const tipStyle = { contentStyle: { background: 'rgba(6,10,20,0.95)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 12, color: '#f8fafc', fontSize: 12 } };

const departmentData = [
  { name: 'Drilling', HIGH: 15, MEDIUM: 18, LOW: 12 },
  { name: 'Production', HIGH: 12, MEDIUM: 14, LOW: 12 },
  { name: 'Pipeline', HIGH: 10, MEDIUM: 12, LOW: 13 },
  { name: 'Refinery', HIGH: 8, MEDIUM: 10, LOW: 12 },
  { name: 'Maintenance', HIGH: 7, MEDIUM: 9, LOW: 12 },
  { name: 'Field Ops', HIGH: 6, MEDIUM: 8, LOW: 11 },
];

const hazardData = [
  { hazard: 'H2S Exposure', count: 35 }, { hazard: 'Fire Risk', count: 28 },
  { hazard: 'Equipment Failure', count: 25 }, { hazard: 'Gas Leak', count: 22 },
  { hazard: 'Slip/Trip', count: 18 }, { hazard: 'Chemical Spill', count: 15 },
  { hazard: 'Electrical', count: 12 }, { hazard: 'Structural', count: 10 },
];

const controlData = [
  { control: 'Gas Monitoring', count: 42 }, { control: 'PPE Compliance', count: 35 },
  { control: 'Ventilation', count: 28 }, { control: 'Training', count: 22 },
  { control: 'Emergency Response', count: 18 }, { control: 'Inspection', count: 15 },
];

const trendData = [
  { month: 'Apr', incidents: 75, precursors: 42, resolved: 68 },
  { month: 'May', incidents: 73, precursors: 38, resolved: 70 },
  { month: 'Jun', incidents: 70, precursors: 35, resolved: 72 },
  { month: 'Jul', incidents: 67, precursors: 30, resolved: 74 },
  { month: 'Aug', incidents: 65, precursors: 28, resolved: 76 },
  { month: 'Sep', incidents: 62, precursors: 25, resolved: 78 },
];

const alerts = [
  { id: 1, title: 'H2S Concentration Spike - Digboi Well D-7', severity: 'HIGH', time: '12 min ago', dept: 'Drilling', site: 'Digboi', description: 'H2S levels detected at 15ppm, exceeding 10ppm threshold. Immediate evacuation required.' },
  { id: 2, title: 'Equipment Vibration Anomaly - Compressor C-4', severity: 'MEDIUM', time: '45 min ago', dept: 'Maintenance', site: 'Margherita', description: 'Abnormal vibration pattern detected. Schedule inspection recommended.' },
  { id: 3, title: 'Pipeline Pressure Deviation - Segment PS-7', severity: 'MEDIUM', time: '1 hour ago', dept: 'Pipeline', site: 'Jorhat', description: 'Pressure fluctuation detected. Automated pressure relief activated.' },
  { id: 4, title: 'Fire Detection Alert - Warehouse W-2', severity: 'HIGH', time: '2 hours ago', dept: 'Maintenance', site: 'Margherita', description: 'Smoke detector triggered. Fire response team dispatched.' },
  { id: 5, title: 'Gas Leak Detection - Processing Unit P-3', severity: 'HIGH', time: '3 hours ago', dept: 'Production', site: 'Tinsukia', description: 'Hydrocarbon vapor detected. Emergency ventilation activated.' },
  { id: 6, title: 'Worker Safety Training Reminder', severity: 'LOW', time: '4 hours ago', dept: 'Field Ops', site: 'Duliajan', description: 'Q3 safety training batch scheduled. 15 workers pending completion.' },
];

export default function RiskInsightsPage() {
  const [selectedAlert, setSelectedAlert] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Risk Intelligence Center</h1>
        <p className="text-slate-500 text-sm mt-1">Deep analysis of SIF precursors, hazards, and safety metrics</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Alerts', value: '12', icon: Bell, color: 'text-danger-500', bg: 'bg-danger-500/10', border: 'border-danger-500/15', glow: 'glow-danger' },
          { label: 'Pending Review', value: '8', icon: Eye, color: 'text-warn-500', bg: 'bg-warn-500/10', border: 'border-warn-500/15', glow: 'glow-warn' },
          { label: 'Resolved Today', value: '5', icon: CheckCircle2, color: 'text-success-500', bg: 'bg-success-500/10', border: 'border-success-500/15', glow: 'glow-success' },
          { label: 'Risk Score', value: '72', icon: Target, color: 'text-brand-400', bg: 'bg-brand-500/10', border: 'border-brand-500/15', glow: 'glow-brand' },
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass p-5 gradient-border">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5" /> Risk by Department
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={departmentData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
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

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass p-5 gradient-border">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5" /> Recurring Hazards
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={hazardData} cx="50%" cy="50%" outerRadius="65%">
              <PolarGrid stroke="rgba(148,163,184,0.06)" />
              <PolarAngleAxis dataKey="hazard" tick={{ fontSize: 8, fill: '#64748b' }} />
              <PolarRadiusAxis tick={{ fontSize: 7, fill: '#475569' }} />
              <Radar name="Count" dataKey="count" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
              <Tooltip {...tipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Trend + Missing Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass p-5 gradient-border">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5" /> 6-Month Trend
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trendData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
              <Tooltip {...tipStyle} />
              <Area type="monotone" dataKey="incidents" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} strokeWidth={2} />
              <Area type="monotone" dataKey="precursors" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={2} />
              <Area type="monotone" dataKey="resolved" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} strokeWidth={2} />
              <Legend iconType="circle" iconSize={5} formatter={(v) => <span className="text-slate-400 text-xs">{v}</span>} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass p-5 gradient-border">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" /> Missing Controls
          </h3>
          <div className="space-y-3">
            {controlData.map((c, i) => (
              <motion.div key={c.control} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.05 }} className="flex items-center gap-3">
                <span className="text-xs text-slate-400 w-32 shrink-0">{c.control}</span>
                <div className="flex-1 h-2.5 rounded-full bg-white/[0.03] overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(c.count / 45) * 100}%` }} transition={{ delay: 0.7 + i * 0.05, duration: 0.6 }} className="h-full rounded-full bg-gradient-to-r from-danger-500 to-warn-500" />
                </div>
                <span className="text-xs font-bold text-white w-8 text-right">{c.count}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Alerts */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="glass p-5 gradient-border">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Bell className="w-3.5 h-3.5" /> Active Risk Alerts
        </h3>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                selectedAlert === alert.id
                  ? 'bg-white/[0.05] border-brand-500/20'
                  : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
              }`}
              onClick={() => setSelectedAlert(selectedAlert === alert.id ? null : alert.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${alert.severity === 'HIGH' ? 'bg-danger-500 animate-pulse' : alert.severity === 'MEDIUM' ? 'bg-warn-500' : 'bg-success-500'}`} />
                  <div className="min-w-0">
                    <div className="text-sm text-white font-medium truncate">{alert.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{alert.dept} · {alert.site} · {alert.time}</div>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  alert.severity === 'HIGH' ? 'bg-danger-500/10 text-danger-500 border border-danger-500/20' :
                  alert.severity === 'MEDIUM' ? 'bg-warn-500/10 text-warn-500 border border-warn-500/20' :
                  'bg-success-500/10 text-success-500 border border-success-500/20'
                }`}>{alert.severity}</span>
              </div>
              {selectedAlert === alert.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-3 pt-3 border-t border-white/5">
                  <p className="text-sm text-slate-400">{alert.description}</p>
                  <div className="flex gap-2 mt-3">
                    <button className="btn-3d btn-3d-primary py-1.5 px-3 text-xs">Acknowledge</button>
                    <button className="btn-3d btn-3d-secondary py-1.5 px-3 text-xs">Dismiss</button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
