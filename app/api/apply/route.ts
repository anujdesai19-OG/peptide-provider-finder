import { NextRequest, NextResponse } from 'next/server';
import { ensureDb, getPool } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { business_name, license_number, license_state, email, provider_type } = body;

    if (!business_name || !license_number || !license_state || !email || !provider_type) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    if (email.length > 200 || business_name.length > 200) {
      return NextResponse.json({ error: 'Input too long.' }, { status: 400 });
    }

    await ensureDb();
    const pool = getPool();

    await pool.query(`
      INSERT INTO provider_applications (
        business_name, clinician_name, provider_type, license_number, license_state, npi,
        address, city, state, zip, phone, email, website, booking_url,
        telehealth_available, states_served, services_offered, lab_requirement_summary,
        pharmacy_model, public_profile_description, verification_docs
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21
      )
    `, [
      body.business_name || '',
      body.clinician_name || null,
      body.provider_type || '',
      body.license_number || '',
      body.license_state || '',
      body.npi || null,
      body.address || null,
      body.city || null,
      body.state || null,
      body.zip || null,
      body.phone || null,
      body.email || '',
      body.website || null,
      body.booking_url || null,
      body.telehealth_available ? 1 : 0,
      body.states_served || null,
      body.services_offered || null,
      body.lab_requirement_summary || null,
      body.pharmacy_model || null,
      body.public_profile_description || null,
      body.verification_docs || null,
    ]);

    await pool.query(
      `INSERT INTO audit_logs (entity_type, action, performed_by, details) VALUES ($1,$2,$3,$4)`,
      ['application', 'submitted', email, `New application from ${business_name}`]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Application error:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
