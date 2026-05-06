import { NextRequest, NextResponse } from 'next/server';
import { ensureDb, getPool } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reason, details, provider_id, email } = body;

    if (!reason || !details) {
      return NextResponse.json({ error: 'Reason and details are required.' }, { status: 400 });
    }

    if (details.length > 5000) {
      return NextResponse.json({ error: 'Details too long.' }, { status: 400 });
    }

    await ensureDb();
    const pool = getPool();

    await pool.query(
      `INSERT INTO reports (provider_id, reporter_email, reason, details) VALUES ($1,$2,$3,$4)`,
      [provider_id ? Number(provider_id) : null, email || null, reason, details]
    );

    if (provider_id) {
      await pool.query(
        `UPDATE providers SET report_count = report_count + 1 WHERE id = $1`,
        [Number(provider_id)]
      );
    }

    await pool.query(
      `INSERT INTO audit_logs (entity_type, action, performed_by, details) VALUES ($1,$2,$3,$4)`,
      ['report', 'submitted', email || 'anonymous', `Report for provider ${provider_id || 'general'}: ${reason}`]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Report error:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
