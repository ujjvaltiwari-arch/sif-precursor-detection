import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, Trash2, AlertTriangle, CheckCircle2, AlertOctagon } from 'lucide-react';
import { reportsApi } from '../services/api';
import type { Report } from '../types';

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string | number> = { limit: 50 };
    if (filter) params.risk_level = filter;
    reportsApi.list(params as any)
      .then((r) => { setReports(r.data.reports); setTotal(r.data.total); })
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  }, [filter]);

  const filtered = reports.filter((r) =>
    !search || r.report_text?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this report?')) return;
    await reportsApi.delete(id);
    setReports((prev) => prev.filter((r) => r.id !== id));
    setTotal((prev) => prev - 1);
  };

  const riskIcon = (level?: string) => {
    if (level === 'HIGH') return <AlertOctagon className="w-3.5 h-3.5" />;
    if (level === 'MEDIUM') return <AlertTriangle className="w-3.5 h-3.5" />;
    return <CheckCircle2 className="w-3.5 h-3.5" />;
  };

  const riskBadge = (level?: string) => {
    if (level === 'HIGH') return 'bg-danger-500/10 text-danger-500 border border-danger-500/20';
    if (level === 'MEDIUM') return 'bg-warn-500/10 text-warn-500 border border-warn-500/20';
    return 'bg-success-500/10 text-success-500 border border-success-500/20';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-4">
            <FileText className="w-3.5 h-3.5" />
            Report History
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Report History</h1>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">{total} reports in the system</p>
        </motion.div>

        {/* Search + Filters */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-4 mb-6 gradient-border">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reports..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-white text-sm focus:outline-none focus:border-brand-500/30 transition-all placeholder:text-slate-600"
              />
            </div>
            <div className="flex gap-2">
              {[
                { label: 'All', value: '' },
                { label: 'High', value: 'HIGH' },
                { label: 'Medium', value: 'MEDIUM' },
                { label: 'Low', value: 'LOW' },
              ].map((l) => (
                <button
                  key={l.value}
                  onClick={() => setFilter(l.value)}
                  className={`btn-3d py-2 px-3.5 text-xs ${
                    filter === l.value
                      ? l.value === 'HIGH' ? 'btn-3d-danger' : l.value === 'MEDIUM' ? 'btn-3d-primary' : l.value === 'LOW' ? 'btn-3d-success' : 'btn-3d-primary'
                      : 'btn-3d-secondary'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Table */}
        {loading ? (
          <div className="glass p-12 text-center gradient-border">
            <div className="w-10 h-10 rounded-full border-2 border-brand-500 border-t-transparent animate-spin mx-auto mb-4" />
            <div className="text-slate-500 animate-pulse text-sm">Loading reports...</div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass overflow-hidden gradient-border">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['#', 'Report', 'Type', 'Site', 'Risk', 'Confidence', 'Date', ''].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.id} className="border-b border-white/[0.03] table-row-hover">
                    <td className="px-3 py-2.5 text-sm text-slate-500">{i + 1}</td>
                    <td className="px-3 py-2.5 text-sm text-white max-w-[180px] truncate">{r.report_text}</td>
                    <td className="px-3 py-2.5"><span className="px-2 py-0.5 rounded-md bg-white/[0.04] text-xs text-slate-400 border border-white/5 capitalize">{r.report_type?.replace('_', ' ')}</span></td>
                    <td className="px-3 py-2.5 text-sm text-slate-400">{r.site || '—'}</td>
                    <td className="px-3 py-2.5">
                      {r.prediction && (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${riskBadge(r.prediction.risk_level)}`}>
                          {riskIcon(r.prediction.risk_level)}
                          {r.prediction.risk_level}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-sm font-semibold text-white">
                      {r.prediction ? `${(r.prediction.confidence_score * 100).toFixed(0)}%` : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-slate-400">{r.date || '—'}</td>
                    <td className="px-3 py-2.5">
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="p-1.5 rounded-lg hover:bg-danger-500/10 text-slate-600 hover:text-danger-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <FileText className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                      <div className="text-slate-500 text-sm">No reports found.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </motion.div>
        )}
    </div>
  );
}
