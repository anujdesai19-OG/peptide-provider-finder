'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ReportRow {
  id: number;
  provider_id: number | null;
  provider_name: string | null;
  reporter_email: string | null;
  reason: string;
  details: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [selected, setSelected] = useState<ReportRow | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  async function loadReports() {
    setLoading(true);
    const res = await fetch('/api/admin/reports');
    if (res.ok) setReports(await res.json());
    setLoading(false);
  }

  useEffect(() => { loadReports(); }, []);

  async function updateReport(id: number, status: string) {
    await fetch('/api/admin/reports', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, admin_notes: notes }),
    });
    setMessage('Report updated.');
    setSelected(null);
    setNotes('');
    loadReports();
  }

  const badgeClass: Record<string, string> = {
    open: 'badge-rejected', reviewed: 'badge-pending',
    resolved: 'badge-approved', dismissed: 'text-gray-400 text-xs',
  };

  return (
    <div>
      <h1 className="text-white text-2xl font-bold mb-6">Reports</h1>

      {message && (
        <div className="bg-green-900/30 border border-green-700 rounded-lg p-3 text-green-400 text-sm mb-4">
          {message}
        </div>
      )}

      {loading ? (
        <div className="text-gray-400 text-center py-12">Loading...</div>
      ) : reports.length === 0 ? (
        <div className="text-gray-500 text-center py-12">No reports found.</div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 font-medium px-4 py-3">Report</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3 hidden md:table-cell">Provider</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Status</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3 hidden lg:table-cell">Date</th>
                <th className="text-right text-gray-400 font-medium px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="px-4 py-3">
                    <div className="text-white font-medium capitalize">{r.reason.replace(/_/g, ' ')}</div>
                    <div className="text-gray-400 text-xs truncate max-w-xs">{r.details}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell">
                    {r.provider_name
                      ? <Link href={`/providers/${r.provider_id}`} className="text-brand-400 hover:underline">{r.provider_name}</Link>
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={badgeClass[r.status] || 'badge-pending'}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setSelected(r); setNotes(r.admin_notes || ''); }} className="text-xs text-brand-400 hover:underline">
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-lg font-bold">Review Report #{selected.id}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
            </div>

            <div className="space-y-3 text-sm mb-5">
              <div className="flex gap-2">
                <span className="text-gray-400 w-28 shrink-0">Reason:</span>
                <span className="text-white capitalize">{selected.reason.replace(/_/g, ' ')}</span>
              </div>
              {selected.provider_name && (
                <div className="flex gap-2">
                  <span className="text-gray-400 w-28 shrink-0">Provider:</span>
                  <span className="text-white">{selected.provider_name}</span>
                </div>
              )}
              {selected.reporter_email && (
                <div className="flex gap-2">
                  <span className="text-gray-400 w-28 shrink-0">Reporter:</span>
                  <span className="text-white">{selected.reporter_email}</span>
                </div>
              )}
              <div className="flex gap-2">
                <span className="text-gray-400 w-28 shrink-0">Details:</span>
                <span className="text-white">{selected.details}</span>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-xs text-gray-400 mb-1">Admin Notes (internal)</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                className="w-full bg-gray-800 text-white rounded-lg border border-gray-700 px-3 py-2 text-sm"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <button onClick={() => updateReport(selected.id, 'reviewed')} className="btn-secondary text-xs py-1.5 px-3">
                Mark Reviewed
              </button>
              <button onClick={() => updateReport(selected.id, 'resolved')} className="text-xs text-green-400 border border-green-700 rounded-lg px-3 py-1.5 hover:bg-green-900/20">
                Resolve
              </button>
              <button onClick={() => updateReport(selected.id, 'dismissed')} className="text-xs text-gray-400 border border-gray-700 rounded-lg px-3 py-1.5 hover:bg-gray-800">
                Dismiss
              </button>
              {selected.provider_id && (
                <Link href={`/admin/providers?edit=${selected.provider_id}`} className="text-xs text-brand-400 hover:underline self-center ml-auto">
                  View Provider →
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
