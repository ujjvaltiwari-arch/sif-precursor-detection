import { useState } from 'react';
import { analyzeApi } from '../services/api';
import type { AnalysisResult } from '../types';
import RiskBadge from '../components/common/RiskBadge';

export default function AnalyzeReport() {
  const [text, setText] = useState('');
  const [reportType, setReportType] = useState('unsafe_act');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await analyzeApi.submit({ report_text: text, report_type: reportType });
      setResult(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="page-header">
        <h1 className="page-title">Analyze Safety Report</h1>
        <p className="page-subtitle">Submit a safety report for AI-powered SIF precursor detection</p>
      </div>

      <div className="glass p-5">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"Paste or type the safety report text here...\n\nExample: Worker entered confined space without gas testing and no permit was issued..."}
          rows={6}
          className="form-input"
        />
        <div className="flex-gap-md mt-4 items-end">
          <div>
            <label className="form-label">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="form-select"
            >
              <option value="unsafe_act">Unsafe Act</option>
              <option value="unsafe_condition">Unsafe Condition</option>
              <option value="near_miss">Near Miss</option>
            </select>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading || !text.trim()}
            className="btn btn-primary"
          >
            {loading ? (
              <>
                <div className="spinner" />
                Analyzing...
              </>
            ) : (
              <>
                <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                Analyze
              </>
            )}
          </button>
        </div>
      </div>

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="glass p-4 flex-gap-lg items-center">
            <RiskBadge level={result.analysis.risk_level} size="md" />
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Confidence: <strong style={{ color: 'var(--text-primary)' }}>{(result.analysis.confidence_score * 100).toFixed(1)}%</strong>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Report #{result.report_id} | Priority: {result.analysis.review_priority}</div>
            </div>
          </div>

          <div className="grid-2">
            <div className="glass p-5">
              <h3 className="section-title">AI Explanation</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{result.analysis.explanation}</p>
            </div>
            <div className="glass p-5">
              <h3 className="section-title">Detected Precursors</h3>
              <div className="flex-col-gap">
                {result.analysis.detected_precursors.map((p, i) => (
                  <div key={i} className="flex-between items-center">
                    <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{p.name}</span>
                    <div className="flex-gap-md items-center">
                      <div className="progress-bar" style={{ width: 56 }}>
                        <div className="progress-fill progress-red" style={{ width: `${p.confidence * 100}%` }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', width: 36, textAlign: 'right' }}>{(p.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid-2">
            <div className="glass p-5">
              <h3 className="section-title">Missing Controls</h3>
              <div className="flex-col-gap">
                {result.analysis.missing_controls.length > 0 ? (
                  result.analysis.missing_controls.map((c, i) => (
                    <div key={i} className="alert-item alert-item-red">
                      <div className="alert-item-title">{c.control}</div>
                      <div className="alert-item-sub">{c.category}</div>
                    </div>
                  ))
                ) : <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No missing controls detected.</p>}
              </div>
            </div>
            <div className="glass p-5">
              <h3 className="section-title">Important Phrases</h3>
              <div className="flex-wrap">
                {result.analysis.important_phrases.map((p, i) => (
                  <span key={i} className="phrase-tag">{p}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="disclaimer">
            <span className="disclaimer-text">
              <strong>Disclaimer:</strong> This AI-generated analysis supports but does not replace human safety judgment.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
