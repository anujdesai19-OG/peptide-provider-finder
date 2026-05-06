import { NextRequest, NextResponse } from 'next/server';
import { ensureDb, getPool } from '@/lib/db';
import { getAdminSessionFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await ensureDb();
  const pool = getPool();
  const { searchParams } = req.nextUrl;
  const status = searchParams.get('status') || 'all';
  const tab = searchParams.get('tab') || 'providers';

  if (tab === 'applications') {
    const { rows } = status === 'all'
      ? await pool.query('SELECT * FROM provider_applications ORDER BY created_at DESC')
      : await pool.query('SELECT * FROM provider_applications WHERE status = $1 ORDER BY created_at DESC', [status]);
    return NextResponse.json(rows);
  }

  const { rows } = status === 'all'
    ? await pool.query('SELECT * FROM providers ORDER BY created_at DESC')
    : await pool.query('SELECT * FROM providers WHERE verification_status = $1 ORDER BY created_at DESC', [status]);

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  await ensureDb();
  const pool = getPool();

  const { rows } = await pool.query(`
    INSERT INTO providers (
      business_name, clinician_name, provider_type, license_number, license_state, npi,
      address, city, state, zip, phone, email, website, booking_url,
      telehealth_available, states_served, services_offered, lab_requirement_summary,
      pharmacy_model, verification_status, verification_date, next_review_date,
      admin_notes, public_profile_description
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,
      $15,$16,$17,$18,$19,$20,$21,$22,$23,$24
    ) RETURNING id
  `, [
    body.business_name, body.clinician_name, body.provider_type, body.license_number,
    body.license_state, body.npi, body.address, body.city, body.state, body.zip,
    body.phone, body.email, body.website, body.booking_url, body.telehealth_available,
    body.states_served, body.services_offered, body.lab_requirement_summary,
    body.pharmacy_model, body.verification_status, body.verification_date,
    body.next_review_date, body.admin_notes, body.public_profile_description,
  ]);

  const id = rows[0].id;

  await pool.query(
    `INSERT INTO audit_logs (entity_type, entity_id, action, performed_by, details) VALUES ($1,$2,$3,$4,$5)`,
    ['provider', id, 'created', session.email, `Created provider: ${body.business_name}`]
  );

  return NextResponse.json({ id });
}
