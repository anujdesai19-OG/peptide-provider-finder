'use client';
import { useState, useEffect, useCallback } from 'react';
import { Provider } from '@/lib/types';

const STATUS_OPTIONS = ['all', 'pending', 'approved', 'rejected', 'suspended'];
const PROVIDER_TYPES = ['Medical Clinic', 'Telehealth Provider', 'Integrative Medicine', 'Anti-Aging Clinic', 'Licensed Compounding Pharmacy', 'Other'];
const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [status, setStatus] = useState('all');
  const [editing, setEditing] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const loadProviders = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/providers?status=${status}`);
    if (res.ok) setProviders(await res.json());
    setLoading(false);
  }, [status]);

  useEffect(() => { loadProviders(); }, [loadProviders]);

  async function updateStatus(id: number, newStatus: string) {
    await fetch(`/api/admin/providers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verification_status: newStatus, verification_date: new Date().toISOString().slice(0, 10) }),
    });
    setMessage(`Provider status updated to ${newStatus}`);
    loadProviders();
  }

  async function deleteProvider(id: number, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/providers/${id}`, { method: 'DELETE' });
    setMessage('Provider deleted.');
    loadProviders();
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    const res = await fetch(`/api/admin/providers/${editing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing),
    });
    setSaving(false);
    if (res.ok) { setMessage('Saved.'); setEditing(null); loadProviders(); }
  }

  const badgeClass: Record<string, string> = {
    approved: 'badge-approved', pending: 'badge-pending',
    rejected: 'badge-rejected', suspended: 'badge-suspended',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white text-2xl font-bold">Provider Listings</h1>
        <div className="flex gap-2">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                status === s ? 'bg-brand-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div className="bg-green-900/30 border border-green-700 rounded-lg p-3 text-green-400 text-sm mb-4">
          {message}
        </div>
      )}

      {loading ? (
        <div className="text-gray-400 text-center py-12">Loading...</div>
      ) : providers.length === 0 ? (
        <div className="text-gray-500 text-center py-12">No providers with status: {status}</div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 font-medium px-4 py-3">Provider</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3 hidden md:table-cell">Type</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3 hidden lg:table-cell">Location</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Status</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3 hidden md:table-cell">Review Date</th>
                <th className="text-right text-gray-400 font-medium px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {providers.map(p => (
                <tr key={p.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-white font-medium">{p.business_name}</div>
                    {p.clinician_name && <div className="text-gray-400 text-xs">{p.clinician_name}</div>}
                    {p.report_count > 0 && <div className="text-red-400 text-xs">⚠ {p.report_count} report(s)</div>}
                  </td>
                  <td className="px-4 py-3 text-gray-400 hidden md:table-cell text-xs">{p.provider_type}</td>
                  <td className="px-4 py-3 text-gray-400 hidden lg:table-cell text-xs">
                    {p.city ? `${p.city}, ${p.state}` : p.state || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={badgeClass[p.verification_status] || 'badge-pending'}>
                      {p.verification_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">
                    {p.next_review_date
                      ? <span className={new Date(p.next_review_date) < new Date() ? 'text-red-400' : ''}>
                          {new Date(p.next_review_date).toLocaleDateString()}
                        </span>
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1 flex-wrap">
                      {p.verification_status !== 'approved' && (
                        <button onClick={() => updateStatus(p.id, 'approved')} className="text-xs text-green-400 hover:underline">Approve</button>
                      )}
                      {p.verification_status !== 'suspended' && (
                        <button onClick={() => updateStatus(p.id, 'suspended')} className="text-xs text-orange-400 hover:underline">Suspend</button>
                      )}
                      {p.verification_status !== 'rejected' && (
                        <button onClick={() => updateStatus(p.id, 'rejected')} className="text-xs text-red-400 hover:underline">Reject</button>
                      )}
                      <button onClick={() => setEditing(p)} className="text-xs text-brand-400 hover:underline">Edit</button>
                      <button onClick={() => deleteProvider(p.id, p.business_name)} className="text-xs text-gray-500 hover:text-red-400 hover:underline">Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setEditing(null)}>
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-lg font-bold">Edit Provider</h2>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: 'Business Name', field: 'business_name' as const },
                { label: 'Clinician Name', field: 'clinician_name' as const },
                { label: 'Phone', field: 'phone' as const },
                { label: 'Email', field: 'email' as const },
                { label: 'Website', field: 'website' as const },
                { label: 'License Number', field: 'license_number' as const },
                { label: 'NPI', field: 'npi' as const },
                { label: 'Verification Date', field: 'verification_date' as const, type: 'date' },
                { label: 'Next Review Date', field: 'next_review_date' as const, type: 'date' },
              ].map(({ label, field, type }) => (
                <div key={field}>
                  <label className="block text-xs text-gray-400 mb-1">{label}</label>
                  <input
                    type={type || 'text'}
                    value={(editing[field] as string) || ''}
                    onChange={e => setEditing(prev => prev ? { ...prev, [field]: e.target.value } : null)}
                    className="w-full bg-gray-800 text-white rounded-lg border border-gray-700 px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Verification Status</label>
                <select
                  value={editing.verification_status}
                  onChange={e => setEditing(prev => prev ? { ...prev, verification_status: e.target.value as Provider['verification_status'] } : null)}
                  className="w-full bg-gray-800 text-white rounded-lg border border-gray-700 px-3 py-2 text-sm"
                >
                  {['pending', 'approved', 'rejected', 'suspended'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Provider Type</label>
                <select
                  value={editing.provider_type}
                  onChange={e => setEditing(prev => prev ? { ...prev, provider_type: e.target.value } : null)}
                  className="w-full bg-gray-800 text-white rounded-lg border border-gray-700 px-3 py-2 text-sm"
                >
                  {PROVIDER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">State</label>
                <select
                  value={editing.state || ''}
                  onChange={e => setEditing(prev => prev ? { ...prev, state: e.target.value } : null)}
                  className="w-full bg-gray-800 text-white rounded-lg border border-gray-700 px-3 py-2 text-sm"
                >
                  <option value="">—</option>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs text-gray-400 mb-1">Admin Notes (internal only)</label>
              <textarea
                value={editing.admin_notes || ''}
                onChange={e => setEditing(prev => prev ? { ...prev, admin_notes: e.target.value } : null)}
                rows={3}
                className="w-full bg-gray-800 text-white rounded-lg border border-gray-700 px-3 py-2 text-sm focus:outline-none"
              />
            </div>

            <div className="mt-4">
              <label className="block text-xs text-gray-400 mb-1">Public Profile Description</label>
              <textarea
                value={editing.public_profile_description || ''}
                onChange={e => setEditing(prev => prev ? { ...prev, public_profile_description: e.target.value } : null)}
                rows={3}
                className="w-full bg-gray-800 text-white rounded-lg border border-gray-700 px-3 py-2 text-sm focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
              <button onClick={saveEdit} disabled={saving} className="btn-primary text-sm">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
