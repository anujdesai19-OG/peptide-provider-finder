'use client';
import { useState, useEffect } from 'react';
import { AuditLog } from '@/lib/types';

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/audit').then(r => r.json()).then(data => { setLogs(data); setLoading(false); });
  }, []);

  const actionColor: Record<string, string> = {
    created: 'text-green-400', updated: 'text-blue-400', deleted: 'text-red-400',
    approved: 'text-green-400', rejected: 'text-red-400', suspended: 'text-orange-400',
    submitted: 'text-brand-400', status_changed: 'text-yellow-400',
  };

  return (
    <div>
      <h1 className="text-white text-2xl font-bold mb-6">Audit Log</h1>

      {loading ? (
        <div className="text-gray-400 text-center py-12">Loading...</div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 font-medium px-4 py-3">Timestamp</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Action</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Entity</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3 hidden md:table-cell">Performed By</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3 hidden lg:table-cell">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} className="border-b border-gray-800/50 hover:bg-gray-800/20">
                  <td className="px-4 py-2 text-gray-500 text-xs whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    <span className={`text-xs font-medium ${actionColor[log.action] || 'text-gray-400'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-400 text-xs">
                    {log.entity_type}{log.entity_id ? ` #${log.entity_id}` : ''}
                  </td>
                  <td className="px-4 py-2 text-gray-500 text-xs hidden md:table-cell">
                    {log.performed_by || '—'}
                  </td>
                  <td className="px-4 py-2 text-gray-500 text-xs hidden lg:table-cell max-w-sm truncate">
                    {log.details || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
