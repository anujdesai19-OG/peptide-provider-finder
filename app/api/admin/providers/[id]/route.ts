import { NextRequest, NextResponse } from 'next/server';
import { ensureDb, getPool } from '@/lib/db';
import { getAdminSessionFromRequest } from '@/lib/auth';

interface Params { params: { id: string } }

export async function GET(req: NextRequest, { params }: Params) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await ensureDb();
  const pool = getPool();
  const { rows } = await pool.query('SELECT * FROM providers WHERE id = $1', [params.id]);
  if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  await ensureDb();
  const pool = getPool();

  const allowedFields = [
    'business_name', 'clinician_name', 'provider_type', 'license_number', 'license_state',
    'npi', 'address', 'city', 'state', 'zip', 'phone', 'email', 'website', 'booking_url',
    'telehealth_available', 'states_served', 'services_offered', 'lab_requirement_summary',
    'pharmacy_model', 'verification_status', 'verification_date', 'next_review_date',
    'admin_notes', 'public_profile_description',
  ];

  const setClauses: string[] = [];
  const values: unknown[] = [];

  for (const [key, val] of Object.entries(body)) {
    if (allowedFields.includes(key)) {
      values.push(val);
      setClauses.push(`${key} = $${values.length}`);
    }
  }

  if (!setClauses.length) {
    return NextResponse.json({ error: 'No valid fields to update.' }, { status: 400 });
  }

  values.push(params.id);
  await pool.query(
    `UPDATE providers SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $${values.length}`,
    values
  );

  await pool.query(
    `INSERT INTO audit_logs (entity_type, entity_id, action, performed_by, details) VALUES ($1,$2,$3,$4,$5)`,
    ['provider', Number(params.id), 'updated', session.email, `Updated fields: ${Object.keys(body).join(', ')}`]
  );

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'owner') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await ensureDb();
  const pool = getPool();
  const { rows } = await pool.query('SELECT business_name FROM providers WHERE id = $1', [params.id]);
  const providerName = rows[0]?.business_name;

  await pool.query('DELETE FROM providers WHERE id = $1', [params.id]);

  await pool.query(
    `INSERT INTO audit_logs (entity_type, entity_id, action, performed_by, details) VALUES ($1,$2,$3,$4,$5)`,
    ['provider', Number(params.id), 'deleted', session.email, `Deleted provider: ${providerName}`]
  );

  return NextResponse.json({ success: true });
}
