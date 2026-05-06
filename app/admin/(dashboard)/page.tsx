import Link from 'next/link';
import { ensureDb, getPool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  await ensureDb();
  const pool = getPool();

  const { rows: statsRows } = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM providers WHERE verification_status = 'approved') as approved,
      (SELECT COUNT(*) FROM providers WHERE verification_status = 'pending') as pending,
      (SELECT COUNT(*) FROM providers WHERE verification_status = 'suspended') as suspended,
      (SELECT COUNT(*) FROM provider_applications WHERE status = 'pending') as applications,
      (SELECT COUNT(*) FROM reports WHERE status = 'open') as open_reports,
      (SELECT COUNT(*) FROM providers WHERE next_review_date::date < (CURRENT_DATE + INTERVAL '30 days') AND verification_status = 'approved') as expiring_soon
  `);
  const stats = statsRows[0] as Record<string, string>;

  const { rows: recentActivity } = await pool.query(
    `SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10`
  );

  const { rows: staleLicenses } = await pool.query(`
    SELECT id, business_name, next_review_date, verification_status
    FROM providers
    WHERE next_review_date::date < (CURRENT_DATE + INTERVAL '30 days') AND verification_status = 'approved'
    ORDER BY next_review_date ASC
    LIMIT 5
  `);

  const { rows: pendingApps } = await pool.query(`
    SELECT id, business_name, provider_type, email, created_at
    FROM provider_applications WHERE status = 'pending'
    ORDER BY created_at ASC LIMIT 5
  `);

  return (
    <div>
      <h1 className="text-white text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: 'Approved', value: stats.approved, color: 'text-green-400', bg: 'bg-green-900/20 border-green-800' },
          { label: 'Pending Providers', value: stats.pending, color: 'text-yellow-400', bg: 'bg-yellow-900/20 border-yellow-800' },
          { label: 'Suspended', value: stats.suspended, color: 'text-orange-400', bg: 'bg-orange-900/20 border-orange-800' },
          { label: 'Applications', value: stats.applications, color: 'text-blue-400', bg: 'bg-blue-900/20 border-blue-800' },
          { label: 'Open Reports', value: stats.open_reports, color: 'text-red-400', bg: 'bg-red-900/20 border-red-800' },
          { label: 'Expiring Soon', value: stats.expiring_soon, color: 'text-amber-400', bg: 'bg-amber-900/20 border-amber-800' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.bg}`}>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-gray-400 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Pending Applications */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Pending Applications</h3>
            <Link href="/admin/applications" className="text-xs text-brand-400 hover:underline">View all</Link>
          </div>
          {pendingApps.length === 0 ? (
            <p className="text-gray-500 text-sm">No pending applications.</p>
          ) : (
            <div className="space-y-3">
              {pendingApps.map((app: { id: number; business_name: string; provider_type: string; email: string; created_at: string }) => (
                <div key={app.id} className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-white text-sm font-medium">{app.business_name}</p>
                    <p className="text-gray-400 text-xs">{app.provider_type}</p>
                  </div>
                  <Link href={`/admin/applications?id=${app.id}`} className="text-xs text-brand-400 hover:underline shrink-0">
                    Review
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stale Licenses */}
        <div className="bg-gray-900 rounded-xl border border-amber-800/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">⚠ Expiring/Stale Verifications</h3>
            <Link href="/admin/providers?filter=expiring" className="text-xs text-amber-400 hover:underline">View all</Link>
          </div>
          {staleLicenses.length === 0 ? (
            <p className="text-gray-500 text-sm">No expiring verifications.</p>
          ) : (
            <div className="space-y-3">
              {staleLicenses.map((p: { id: number; business_name: string; next_review_date: string }) => (
                <div key={p.id} className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-white text-sm font-medium">{p.business_name}</p>
                    <p className="text-amber-400 text-xs">Review by: {new Date(p.next_review_date).toLocaleDateString()}</p>
                  </div>
                  <Link href={`/admin/providers?edit=${p.id}`} className="text-xs text-brand-400 hover:underline shrink-0">
                    Edit
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Recent Activity</h3>
            <Link href="/admin/audit" className="text-xs text-brand-400 hover:underline">Full log</Link>
          </div>
          <div className="space-y-2">
            {recentActivity.map((log: { id: number; action: string; entity_type: string; entity_id: number; performed_by: string; details: string; created_at: string }) => (
              <div key={log.id} className="text-xs">
                <span className="text-gray-300">{log.action}</span>
                <span className="text-gray-500"> · {log.entity_type} </span>
                <span className="text-gray-400">by {log.performed_by?.split('@')[0]}</span>
                <div className="text-gray-600">{new Date(log.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid sm:grid-cols-4 gap-3">
        {[
          { href: '/admin/applications', label: '📋 Review Applications', desc: `${stats.applications} pending` },
          { href: '/admin/reports', label: '🚩 Review Reports', desc: `${stats.open_reports} open` },
          { href: '/admin/providers?status=approved', label: '🏥 Manage Providers', desc: `${stats.approved} approved` },
          { href: '/admin/audit', label: '📝 Audit Log', desc: 'View all activity' },
        ].map(a => (
          <Link
            key={a.href}
            href={a.href}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-brand-700 transition-colors"
          >
            <p className="text-white text-sm font-medium">{a.label}</p>
            <p className="text-gray-500 text-xs mt-1">{a.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
