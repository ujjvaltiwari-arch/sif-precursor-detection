import { useEffect, useState } from 'react';
import { reportsApi } from '../services/api';
import type { Report } from '../types';
import RiskBadge from '../components/common/RiskBadge';

export default function Watchlist() {
  const [reports, setReports] = useState<Report[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('HIGH');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    reportsApi.list({ risk_level: filter, limit: 50 })
      .then((r) => { setReports(r.data.reports); setTotal(r.data.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  const filterBtnClass = (level: string) => {
    if (filter === level) return `btn-filter active-${level.toLowerCase()}`;
    return 'btn-filter';
  };

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="flex-between">
        <div>
          <h1 className="page-title">High-Risk Watchlist</h1>
          <p className="page-subtitle">{total} reports matching {filter} risk filter</p>
        </div>
        <div className="flex-gap-sm">
          {(['HIGH', 'MEDIUM', 'LOW'] as const).map((l) => (
            <button key={l} onClick={() => setFilter(l)} className={filterBtnClass(l)}>{l}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="glass empty-msg">Loading reports...</div>
      ) : (
        <div className="glass overflow-hidden">
          <table className="table-dark">
            <thead>
              <tr>
                {['#', 'Report', 'Type', 'Site', 'Dept', 'Risk', 'Confidence', 'Date'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reports.map((r, i) => (
                <tr key={r.id}>
                  <td className="text-muted">{i + 1}</td>
                  <td className="text-primary max-w-sm truncate">{r.report_text}</td>
                  <td><span className="tag">{r.report_type?.replace('_', ' ')}</span></td>
                  <td>{r.site || '—'}</td>
                  <td>{r.department || '—'}</td>
                  <td>{r.prediction && <RiskBadge level={r.prediction.risk_level as 'LOW' | 'MEDIUM' | 'HIGH'} />}</td>
                  <td className="text-primary" style={{ fontWeight: 600 }}>
                    {r.prediction ? `${(r.prediction.confidence_score * 100).toFixed(0)}%` : '—'}
                  </td>
                  <td>{r.date || '—'}</td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr><td colSpan={8} className="empty-msg">No reports found for this risk level.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
