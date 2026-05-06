'use client';
import { useState, useEffect, useCallback } from 'react';
import { ProviderApplication } from '@/lib/types';

export default function AdminApplicationsPage() {
  const [apps, setApps] = useState<ProviderApplication[]>([]);
  const [selected, setSelected] = useState<ProviderApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadApps = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/providers?tab=applications');
    if (res.ok) setApps(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { loadApps(); }, [loadApps]);

  async function approveAsProvider(app: ProviderApplication) {
    // Create as approved provider
    const res = await fetch('/api/admin/providers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        business_name: app.business_name,
        clinician_name: app.clinician_name,
        provider_type: app.provider_type,
        license_number: app.license_number,
        license_state: app.license_state,
        npi: app.npi,
        address: app.address,
        city: app.city,
        state: app.state,
        zip: app.zip,
        phone: app.phone,
        email: app.email,
        website: app.website,
        booking_url: app.booking_url,
        telehealth_available: app.telehealth_available,
        states_served: app.states_served,
        services_offered: app.services_offered,
        lab_requirement_summary: app.lab_requirement_summary,
        pharmacy_model: app.pharmacy_model,
        public_profile_description: app.public_profile_description,
        verification_status: 'approved',
        verification_date: new Date().toISOString().slice(0, 10),
        next_review_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      }),
    });

    if (res.ok) {
      // Update application status
      await updateAppStatus(app.id, 'approved');
      setMessage('Application approved and provider listing created.');
      setSelected(null);
      loadApps();
    }
  }

  async function updateAppStatus(id: number, status: string, notes?: string) {
    await fetch('/api/admin/providers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, admin_notes: notes }),
    });
    loadApps();
  }

  const badgeClass: Record<string, string> = {
    approved: 'badge-approved', pending: 'badge-pending',
    rejected: 'badge-rejected', needs_info: 'badge-suspended',
  };

  return (
    <div>
      <h1 className="text-white text-2xl font-bold mb-6">Provider Applications</h1>

      {message && (
        <div className="bg-green-900/30 border border-green-700 rounded-lg p-3 text-green-400 text-sm mb-4">
          {message}
        </div>
      )}

      {loading ? (
        <div className="text-gray-400 text-center py-12">Loading...</div>
      ) : apps.length === 0 ? (
        <div className="text-gray-500 text-center py-12">No applications found.</div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 font-medium px-4 py-3">Applicant</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3 hidden md:table-cell">Type</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3 hidden md:table-cell">License</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Status</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3 hidden lg:table-cell">Submitted</th>
                <th className="text-right text-gray-400 font-medium px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {apps.map(app => (
                <tr key={app.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="px-4 py-3">
                    <div className="text-white font-medium">{app.business_name}</div>
                    <div className="text-gray-400 text-xs">{app.email}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell">{app.provider_type}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell">
                    {app.license_number} ({app.license_state})
                  </td>
                  <td className="px-4 py-3">
                    <span className={badgeClass[app.status] || 'badge-pending'}>{app.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell">
                    {new Date(app.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setSelected(app)} className="text-xs text-brand-400 hover:underline">
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
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-lg font-bold">Review Application</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
            </div>

            <div className="space-y-3 text-sm">
              {[
                ['Business Name', selected.business_name],
                ['Clinician Name', selected.clinician_name],
                ['Provider Type', selected.provider_type],
                ['License Number', selected.license_number],
                ['License State', selected.license_state],
                ['NPI', selected.npi],
                ['Email', selected.email],
                ['Phone', selected.phone],
                ['Website', selected.website],
                ['Telehealth', selected.telehealth_available ? 'Yes' : 'No'],
                ['States Served', selected.states_served],
                ['Services', selected.services_offered],
                ['Lab Requirements', selected.lab_requirement_summary],
                ['Pharmacy Model', selected.pharmacy_model],
                ['Verification Docs', selected.verification_docs],
                ['Description', selected.public_profile_description],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label as string} className="flex gap-2">
                  <span className="text-gray-400 shrink-0 w-32">{label}:</span>
                  <span className="text-white break-words">{value as string}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6 flex-wrap">
              <button
                onClick={() => approveAsProvider(selected)}
                className="btn-primary text-sm bg-green-700 hover:bg-green-600"
              >
                ✓ Approve & Create Listing
              </button>
              <button
                onClick={async () => { await updateAppStatus(selected.id, 'rejected'); setSelected(null); setMessage('Application rejected.'); }}
                className="btn-danger text-sm"
              >
                ✗ Reject
              </button>
              <button
                onClick={async () => { await updateAppStatus(selected.id, 'needs_info'); setSelected(null); setMessage('Marked as needs more info.'); }}
                className="btn-secondary text-sm"
              >
                Request Info
              </button>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
