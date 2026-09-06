import { useEffect, useState } from 'react';
import { analyticsApi } from '../services/api';
import type { HeatmapData } from '../types';

export default function Heatmap() {
  const [data, setData] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.heatmap().then((r) => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-msg">Loading heatmap...</div>;
  if (!data || !data.sites.length) return <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>No site data available.</p>;

  const maxRisk = Math.max(...data.sites.map((s) => s.risk_count), 1);

  function getStyle(count: number) {
    const r = count / maxRisk;
    if (r > 0.7) return { cellClass: 'heatmap-cell heatmap-critical', textClass: 'color-red', dotClass: 'heatmap-dot dot-red' };
    if (r > 0.4) return { cellClass: 'heatmap-cell heatmap-elevated', textClass: 'color-amber', dotClass: 'heatmap-dot dot-amber' };
    return { cellClass: 'heatmap-cell heatmap-normal', textClass: 'color-green', dotClass: 'heatmap-dot dot-green' };
  }

  const cols = Math.min(data.sites.length, 3);

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="page-header">
        <h1 className="page-title">Risk Heatmap</h1>
        <p className="page-subtitle">Geographic risk concentration across Oil India Limited sites</p>
      </div>

      <div className="grid-2-1-wide">
        <div className="glass p-5">
          <h3 className="section-title">Site Risk Grid</h3>
          <div className="heatmap-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {data.sites.map((site, i) => {
              const s = getStyle(site.risk_count);
              return (
                <div key={i} className={s.cellClass}>
                  <div className={`${s.dotClass} ${site.risk_count === maxRisk ? 'animate-pulse-glow' : ''}`} />
                  <div className={`heatmap-cell-count ${s.textClass}`}>{site.risk_count}</div>
                  <div className="heatmap-cell-name">{site.name}</div>
                  <div className="heatmap-cell-sub">high-risk incidents</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-col-gap" style={{ gap: 16 }}>
          <div className="glass p-4">
            <h3 className="section-title">Risk Legend</h3>
            <Legend color="dot-red" label="Critical" desc="> 70% of max risk" />
            <Legend color="dot-amber" label="Elevated" desc="40–70% of max risk" />
            <Legend color="dot-green" label="Normal" desc="< 40% of max risk" />
          </div>
          <div className="glass p-4">
            <h3 className="section-title">Site Summary</h3>
            <div className="flex-col-gap">
              {data.sites.sort((a, b) => b.risk_count - a.risk_count).map((site, i) => {
                const s = getStyle(site.risk_count);
                return (
                  <div key={i} className="flex-between">
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{site.name}</span>
                    <span className={s.textClass} style={{ fontSize: 13, fontWeight: 700 }}>{site.risk_count}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="glass p-4 text-center">
            <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--neon-blue)' }}>{data.sites.length}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>monitored locations</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label, desc }: { color: string; label: string; desc: string }) {
  return (
    <div className="legend-item">
      <div className={`legend-dot ${color}`} />
      <div>
        <div className="legend-label">{label}</div>
        <div className="legend-desc">{desc}</div>
      </div>
    </div>
  );
}
