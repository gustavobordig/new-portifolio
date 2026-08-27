import { NextResponse } from "next/server";

import { db, ensureSchema } from "@/lib/analytics/db";
import {
  clientIp,
  geo,
  isBot,
  parseUserAgent,
  referrerHost,
  visitorHash,
} from "@/lib/analytics/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY = 2_000;
const noContent = () => new NextResponse(null, { status: 204 });

const str = (value: unknown, max: number) =>
  typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;

export async function POST(request: Request) {
  const userAgent = request.headers.get("user-agent") ?? "";
  if (!userAgent || isBot(userAgent)) return noContent();

  const raw = await request.text();
  if (!raw || raw.length > MAX_BODY) return noContent();

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(raw);
  } catch {
    return noContent();
  }

  const sessionId = str(payload.sessionId, 40);
  if (!sessionId) return noContent();

  try {
    await ensureSchema();

    const client = db();
    const now = Date.now();
    const hash = await visitorHash(clientIp(request.headers), userAgent);

    if (payload.type === "duration") {
      const durationMs = Math.min(Math.max(Number(payload.durationMs) || 0, 0), 3_600_000);
      const path = str(payload.path, 200) ?? "/";

      // Only fills a duration that is still empty, so a re-sent beacon is a no-op.
      await client.execute({
        sql: `UPDATE page_views
              SET duration_ms = ?
              WHERE id = (SELECT id FROM page_views
                          WHERE session_id = ? AND path = ? AND duration_ms = 0
                          ORDER BY ts DESC LIMIT 1)`,
        args: [durationMs, sessionId, path],
      });

      return noContent();
    }

    if (payload.type === "event") {
      const name = str(payload.name, 50);
      if (!name) return noContent();

      await client.execute({
        sql: `INSERT INTO events (ts, name, label, session_id, visitor_hash)
              VALUES (?, ?, ?, ?, ?)`,
        args: [now, name, str(payload.label, 120), sessionId, hash],
      });

      return noContent();
    }

    const { device, browser, os } = parseUserAgent(userAgent);
    const { country, city } = geo(request.headers);
    const selfHost = request.headers.get("host")?.split(":")[0] ?? null;

    await client.execute({
      sql: `INSERT INTO page_views
              (ts, path, referrer_host, country, city, device, browser, os, locale, visitor_hash, session_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        now,
        str(payload.path, 200) ?? "/",
        referrerHost(str(payload.referrer, 400), selfHost),
        country,
        city,
        device,
        browser,
        os,
        str(payload.locale, 10),
        hash,
        sessionId,
      ],
    });
  } catch (error) {
    // Tracking must never surface to the visitor.
    console.error("[track]", error);
  }

  return noContent();
}
