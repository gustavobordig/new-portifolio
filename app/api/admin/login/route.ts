import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  SESSION_COOKIE,
  createSessionToken,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/analytics/auth";
import { db, ensureSchema } from "@/lib/analytics/db";
import { clientIp, visitorHash } from "@/lib/analytics/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 8;

const fail = (message: string, status = 401) =>
  NextResponse.json({ error: message }, { status });

async function recentFailures(ipHash: string) {
  try {
    await ensureSchema();

    const result = await db().execute({
      sql: `SELECT COUNT(*) AS failures
            FROM login_attempts
            WHERE ip_hash = ? AND ok = 0 AND ts >= ?`,
      args: [ipHash, Date.now() - WINDOW_MS],
    });

    return Number(result.rows[0]?.failures ?? 0);
  } catch (error) {
    console.error("[login] rate limit unavailable", error);
    return 0;
  }
}

async function recordAttempt(email: string, ipHash: string, ok: boolean) {
  try {
    await db().execute({
      sql: `INSERT INTO login_attempts (ts, email, ip_hash, ok) VALUES (?, ?, ?, ?)`,
      args: [Date.now(), email.slice(0, 120), ipHash, ok ? 1 : 0],
    });
  } catch (error) {
    console.error("[login] could not record attempt", error);
  }
}

export async function POST(request: Request) {
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  const adminHash = process.env.ADMIN_PASSWORD_HASH;

  if (!adminEmail || !adminHash || !process.env.ADMIN_AUTH_SECRET) {
    return fail("Admin não configurado no servidor.", 500);
  }

  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return fail("Requisição inválida.", 400);
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";
  if (!email || !password) return fail("Informe e-mail e senha.", 400);

  const ipHash = await visitorHash(clientIp(request.headers), "login");

  // The credentials live in the environment, so authentication never depends on
  // the database being reachable — a broken analytics DB must not lock the owner
  // out of the dashboard. The rate limiter is best-effort on top of that.
  const failures = await recentFailures(ipHash);
  if (failures >= MAX_FAILURES) {
    return fail("Muitas tentativas. Tente novamente em 15 minutos.", 429);
  }

  // Always run the KDF so a wrong e-mail costs the same time as a wrong password.
  const passwordOk = await verifyPassword(password, adminHash);
  const ok = passwordOk && email === adminEmail;

  await recordAttempt(email, ipHash, ok);

  if (!ok) return fail("E-mail ou senha incorretos.");

  (await cookies()).set(
    SESSION_COOKIE,
    await createSessionToken(adminEmail),
    sessionCookieOptions
  );

  return NextResponse.json({ ok: true });
}
