import { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
} from 'recharts';
import { analyticsApi } from '../services/api';
import type { TrendsData } from '../types';

const COLORS = { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#22c55e' };
const PREC = ['#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#e11d48', '#84cc16'];

const tip = {
  contentStyle: {
    background: 'rgba(8,13,30,0.95)', border: '1px solid rgba(59,130,246,0.12)',
    borderRadius: 12, boxShadow: '0 8px 40px rgba(0,0,0,0.5)', color: '#f0f4ff', fontSize: '13px',
  },
};

export default function Analytics() {
  const [data, setData] = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.trends().then((r) => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-msg">Loading analytics...</div>;
  if (!data) return <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Failed to load analytics.</p>;

  const riskPie = [
    { name: 'HIGH', value: data.risk_distribution.HIGH },
    { name: 'MEDIUM', value: data.risk_distribution.MEDIUM },
    { name: 'LOW', value: data.risk_distribution.LOW },
  ];

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="page-header">
        <h1 className="page-title">Analytics & Trends</h1>
        <p className="page-subtitle">Deep dive into SIF precursor patterns across Oil India operations</p>
      </div>

      <div className="grid-2-1">
        <div className="glass p-5">
          <h3 className="section-title">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={riskPie} cx="50%" cy="50%" innerRadius={52} outerRadius={85} paddingAngle={4} dataKey="value" stroke="none">
                {riskPie.map((e) => <Cell key={e.name} fill={COLORS[e.name as keyof typeof COLORS]} />)}
              </Pie>
              <Tooltip {...tip} />
            </PieChart>
          </ResponsiveContainer>
          <div className="text-center" style={{ marginTop: -4 }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>{riskPie.reduce((s, d) => s + d.value, 0)}</span>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total Reports</div>
          </div>
        </div>

        <div className="glass p-5">
          <h3 className="section-title">Precursor Category Frequency</h3>
          <ResponsiveContainer width="100%" height={310}>
            <BarChart data={data.precursor_trends} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" tick={{ fontSize: 11, fill: '#4a5568' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fill: '#8896b3' }} axisLine={false} tickLine={false} />
              <Tooltip {...tip} />
              <Bar dataKey="count" radius={[0, 8, 8, 0]} animationDuration={1000}>
                {data.precursor_trends.map((_, i) => <Cell key={i} fill={PREC[i % PREC.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid-2">
        <div className="glass p-5">
          <h3 className="section-title">Risk by Department</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.department_trends} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#4a5568' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#4a5568' }} axisLine={false} tickLine={false} />
              <Tooltip {...tip} />
              <Legend iconType="circle" iconSize={7} formatter={(v) => <span style={{ color: '#8896b3', fontSize: 11 }}>{v}</span>} />
              <Bar dataKey="HIGH" stackId="a" fill={COLORS.HIGH} />
              <Bar dataKey="MEDIUM" stackId="a" fill={COLORS.MEDIUM} />
              <Bar dataKey="LOW" stackId="a" fill={COLORS.LOW} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass p-5">
          <h3 className="section-title">Recurring Hazards</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={data.recurring_hazards.slice(0, 8)} cx="50%" cy="50%" outerRadius="68%">
              <PolarGrid stroke="rgba(255,255,255,0.04)" />
              <PolarAngleAxis dataKey="hazard" tick={{ fontSize: 10, fill: '#8896b3' }} />
              <PolarRadiusAxis tick={{ fontSize: 9, fill: '#4a5568' }} />
              <Radar name="Count" dataKey="count" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
              <Tooltip {...tip} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid-2">
        <div className="glass p-5">
          <h3 className="section-title">Risk by Site</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.site_trends} margin={{ top: 5, right: 10, bottom: 30, left: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#4a5568', angle: -25, textAnchor: 'end' }} height={60} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#4a5568' }} axisLine={false} tickLine={false} />
              <Tooltip {...tip} />
              <Legend iconType="circle" iconSize={7} formatter={(v) => <span style={{ color: '#8896b3', fontSize: 11 }}>{v}</span>} />
              <Bar dataKey="HIGH" fill={COLORS.HIGH} radius={[4, 4, 0, 0]} />
              <Bar dataKey="MEDIUM" fill={COLORS.MEDIUM} radius={[4, 4, 0, 0]} />
              <Bar dataKey="LOW" fill={COLORS.LOW} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass p-5">
          <h3 className="section-title">Top Missing Controls</h3>
          <div className="flex-col-gap">
            {data.missing_control_trends.slice(0, 8).map((item, i) => {
              const max = data.missing_control_trends[0]?.count || 1;
              const pct = (item.count / max) * 100;
              return (
                <div key={i}>
                  <div className="flex-between" style={{ marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.control}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--neon-red)' }}>{item.count}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill progress-red" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
