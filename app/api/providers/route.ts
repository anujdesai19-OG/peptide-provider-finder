import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { ensureDb, getPool } from '@/lib/db';

export async function GET(req: NextRequest) {
  await ensureDb();
  const pool = getPool();
  const { searchParams } = req.nextUrl;

  const params: (string | number)[] = [];
  function p(val: string | number): string {
    params.push(val);
    return `$${params.length}`;
  }

  let query = `SELECT * FROM providers WHERE verification_status = 'approved'`;

  const state = searchParams.get('state');
  if (state && state !== 'all') {
    query += ` AND (state = ${p(state)} OR states_served LIKE ${p(`%${state}%`)})`;
  }

  if (searchParams.get('telehealth') === '1') {
    query += ` AND telehealth_available = 1`;
  }

  const type = searchParams.get('type');
  if (type && type !== 'all') {
    query += ` AND provider_type = ${p(type)}`;
  }

  const service = searchParams.get('service');
  if (service) {
    query += ` AND services_offered LIKE ${p(`%${service}%`)}`;
  }

  const q = searchParams.get('q');
  if (q) {
    const term = `%${q}%`;
    query += ` AND (business_name ILIKE ${p(term)} OR clinician_name ILIKE ${p(term)} OR city ILIKE ${p(term)})`;
  }

  query += ` ORDER BY verification_date DESC LIMIT 50`;

  const { rows } = await pool.query(query, params);
  return NextResponse.json(rows);
}
