import { NextRequest, NextResponse } from 'next/server';
import { ensureDb, getPool } from '@/lib/db';
import { signAdminToken, checkPassword, COOKIE_NAME } from '@/lib/auth';
import { AdminUser } from '@/lib/types';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required.' }, { status: 400 });
  }

  await ensureDb();
  const pool = getPool();
  const { rows } = await pool.query('SELECT * FROM admin_users WHERE email = $1', [email]);
  const user = rows[0] as (AdminUser & { password_hash: string }) | undefined;

  if (!user || !checkPassword(password, user.password_hash)) {
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
  }

  const token = await signAdminToken({ email: user.email, role: user.role, id: user.id });

  const res = NextResponse.json({ success: true, role: user.role });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 8 * 60 * 60,
    path: '/',
  });

  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete(COOKIE_NAME);
  return res;
}
