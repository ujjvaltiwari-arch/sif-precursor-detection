import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';
import { analyticsApi } from '../services/api';
import type { Overview as OverviewType, TrendsData } from '../types';

const COLORS = { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#22c55e' };

const tip = {
  contentStyle: {
    background: 'rgba(8,13,30,0.95)', border: '1px solid rgba(59,130,246,0.12)',
    borderRadius: 12, boxShadow: '0 8px 40px rgba(0,0,0,0.5)', color: '#f0f4ff', fontSize: '13px',
  },
};

export default function Overview() {
  const [overview, setOverview] = useState<OverviewType | null>(null);
  const [trends, setTrends] = useState<TrendsData | null>(null);

  useEffect(() => {
    Promise.all([analyticsApi.overview(), analyticsApi.trends()])
      .then(([ov, tr]) => { setOverview(ov.data); setTrends(tr.data); })
      .catch(console.error);
  }, []);

  if (!overview) return <div className="loading-msg">Loading dashboard...</div>;

  const pieData = [
    { name: 'HIGH', value: overview.high_risk_count },
    { name: 'MEDIUM', value: overview.medium_risk_count },
    { name: 'LOW', value: overview.low_risk_count },
  ];

  const statCards = [
    { label: 'Total Reports', value: overview.total_reports, colorClass: 'stat-blue', iconColor: 'color-blue', iconBg: 'bg-blue-10', iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { label: 'High Risk', value: overview.high_risk_count, colorClass: 'stat-red', iconColor: 'color-red', iconBg: 'bg-red-10', iconPath: 'M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4.99c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z' },
    { label: 'Medium Risk', value: overview.medium_risk_count, colorClass: 'stat-amber', iconColor: 'color-amber', iconBg: 'bg-amber-10', iconPath: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
    { label: 'Low Risk', value: overview.low_risk_count, colorClass: 'stat-green', iconColor: 'color-green', iconBg: 'bg-green-10', iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="page-header">
        <h1 className="page-title">Dashboard Overview</h1>
        <p className="page-subtitle">Real-time SIF precursor monitoring for Oil India Limited</p>
      </div>

      <div className="grid-4">
        {statCards.map((s) => (
          <div key={s.label} className={`stat-card ${s.colorClass}`}>
            <div className="stat-card-content">
              <div>
                <div className="stat-card-label">{s.label}</div>
                <div className={`stat-card-value ${s.iconColor}`}>{s.value}</div>
              </div>
              <div className={`stat-card-icon ${s.iconBg}`}>
                <svg className={`sidebar-link-icon ${s.iconColor}`} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d={s.iconPath} /></svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2-1">
        <div className="glass p-5">
          <h3 className="section-title">Risk Split</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={4} dataKey="value" stroke="none" animationBegin={0} animationDuration={800}>
                {pieData.map((e) => <Cell key={e.name} fill={COLORS[e.name as keyof typeof COLORS]} />)}
              </Pie>
              <Tooltip {...tip} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-center" style={{ gap: 20, marginTop: 8 }}>
            {pieData.map((d) => (
              <div key={d.name} className="flex-center" style={{ gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: COLORS[d.name as keyof typeof COLORS] }} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass p-5">
          <h3 className="section-title">Top Precursor Categories</h3>
          {trends && (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trends.precursor_trends.slice(0, 6)} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#4a5568' }} axisLine={false} tickLine={false} />
                <Tooltip {...tip} />
                <defs>
                  <linearGradient id="barG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.5} />
                  </linearGradient>
                </defs>
                <Bar dataKey="count" fill="url(#barG)" radius={[6, 6, 0, 0]} animationDuration={1000} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid-4">
        <InfoCard title="Most Common Precursor" value={overview.most_common_precursor} gradient="gradient-blue-purple" />
        <InfoCard title="Highest Risk Site" value={overview.highest_risk_site} gradient="gradient-red-rose" />
        <InfoCard title="Highest Risk Dept" value={overview.highest_risk_department} gradient="gradient-amber-orange" />
        <InfoCard title="Open Alerts" value={String(overview.recent_alerts_count)} gradient="gradient-cyan-blue" />
      </div>
    </div>
  );
}

function InfoCard({ title, value, gradient }: { title: string; value: string; gradient: string }) {
  return (
    <div className="glass info-card">
      <div className={`info-card-bar ${gradient}`} />
      <div className="info-card-label">{title}</div>
      <div className="info-card-value">{value}</div>
    </div>
  );
}
