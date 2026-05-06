import { NextRequest, NextResponse } from 'next/server';
import { ensureDb, getPool } from '@/lib/db';
import { getAdminSessionFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await ensureDb();
  const pool = getPool();
  const { rows } = await pool.query(`
    SELECT r.*, p.business_name as provider_name
    FROM reports r
    LEFT JOIN providers p ON r.provider_id = p.id
    ORDER BY r.created_at DESC
    LIMIT 100
  `);

  return NextResponse.json(rows);
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, status, admin_notes } = await req.json();
  await ensureDb();
  const pool = getPool();

  await pool.query(
    `UPDATE reports SET status = $1, admin_notes = $2, updated_at = NOW() WHERE id = $3`,
    [status, admin_notes || null, id]
  );

  await pool.query(
    `INSERT INTO audit_logs (entity_type, entity_id, action, performed_by, details) VALUES ($1,$2,$3,$4,$5)`,
    ['report', id, 'status_changed', session.email, `Report status → ${status}`]
  );

  return NextResponse.json({ success: true });
}
