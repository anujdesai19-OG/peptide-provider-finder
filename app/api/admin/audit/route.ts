import { NextRequest, NextResponse } from 'next/server';
import { ensureDb, getPool } from '@/lib/db';
import { getAdminSessionFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await ensureDb();
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 200`
  );

  return NextResponse.json(rows);
}
