import { db, ensureSchema } from "./db";
import {
  RANGES,
  type RangeKey,
  type Slice,
  type Stats,
  type Totals,
} from "./types";

export * from "./types";

const num = (value: unknown) => Number(value ?? 0);

async function totalsFor(from: number, to: number): Promise<Totals> {
  const aggregate = await db().execute({
    sql: `SELECT COUNT(*)                     AS views,
                 COUNT(DISTINCT visitor_hash) AS visitors,
                 COUNT(DISTINCT session_id)   AS sessions,
                 AVG(NULLIF(duration_ms, 0))  AS avg_duration
          FROM page_views
          WHERE ts >= ? AND ts < ?`,
    args: [from, to],
  });

  const row = aggregate.rows[0];

  return {
    views: num(row?.views),
    visitors: num(row?.visitors),
    sessions: num(row?.sessions),
    avgDurationMs: Math.round(num(row?.avg_duration)),
  };
}

async function breakdown(
  column: string,
  from: number,
  to: number,
  limit = 8
): Promise<Slice[]> {
  const result = await db().execute({
    sql: `SELECT ${column} AS label, COUNT(*) AS value
          FROM page_views
          WHERE ts >= ? AND ts < ? AND ${column} IS NOT NULL AND ${column} <> ''
          GROUP BY label
          ORDER BY value DESC
          LIMIT ?`,
    args: [from, to, limit],
  });

  return result.rows.map((row) => ({
    label: String(row.label),
    value: num(row.value),
  }));
}

/** Produces one entry per bucket in the window, zero-filled, oldest first. */
function bucketKeys(from: number, to: number, granularity: "hour" | "day") {
  const step = granularity === "hour" ? 3_600_000 : 86_400_000;
  const start =
    granularity === "hour"
      ? Math.floor(from / step) * step
      : Date.UTC(
          new Date(from).getUTCFullYear(),
          new Date(from).getUTCMonth(),
          new Date(from).getUTCDate()
        );

  const keys: string[] = [];
  for (let t = start; t < to; t += step) {
    const iso = new Date(t).toISOString();
    keys.push(granularity === "hour" ? `${iso.slice(0, 13)}:00` : iso.slice(0, 10));
  }

  return keys;
}

export async function getStats(range: RangeKey): Promise<Stats> {
  await ensureSchema();

  const client = db();
  const now = Date.now();
  const span = RANGES[range].ms;

  let from = 0;
  if (span) {
    from = now - span;
  } else {
    const first = await client.execute("SELECT MIN(ts) AS first FROM page_views");
    from = num(first.rows[0]?.first) || now - RANGES["30d"].ms!;
  }

  const granularity: "hour" | "day" = range === "24h" ? "hour" : "day";
  const bucketExpr =
    granularity === "hour"
      ? `strftime('%Y-%m-%dT%H:00', ts / 1000, 'unixepoch')`
      : `date(ts / 1000, 'unixepoch')`;

  const [totals, previous, series, referrers, countries, devices, browsers, events, recent] =
    await Promise.all([
      totalsFor(from, now),
      span ? totalsFor(from - span, from) : Promise.resolve(null),
      client.execute({
        sql: `SELECT ${bucketExpr} AS bucket,
                     COUNT(*) AS views,
                     COUNT(DISTINCT visitor_hash) AS visitors
              FROM page_views
              WHERE ts >= ? AND ts < ?
              GROUP BY bucket
              ORDER BY bucket`,
        args: [from, now],
      }),
      breakdown("referrer_host", from, now),
      breakdown("country", from, now),
      breakdown("device", from, now, 4),
      breakdown("browser", from, now, 6),
      client.execute({
        sql: `SELECT COALESCE(label, name) AS label, COUNT(*) AS value
              FROM events
              WHERE ts >= ? AND ts < ?
              GROUP BY label
              ORDER BY value DESC
              LIMIT 8`,
        args: [from, now],
      }),
      client.execute({
        sql: `SELECT ts, path, country, city, device, browser, referrer_host
              FROM page_views
              ORDER BY ts DESC
              LIMIT 15`,
      }),
    ]);

  const byBucket = new Map(
    series.rows.map((row) => [
      String(row.bucket),
      { views: num(row.views), visitors: num(row.visitors) },
    ])
  );

  return {
    range,
    granularity,
    totals,
    previous,
    series: bucketKeys(from, now, granularity).map((bucket) => ({
      bucket,
      views: byBucket.get(bucket)?.views ?? 0,
      visitors: byBucket.get(bucket)?.visitors ?? 0,
    })),
    referrers,
    countries,
    devices,
    browsers,
    events: events.rows.map((row) => ({
      label: String(row.label),
      value: num(row.value),
    })),
    recent: recent.rows.map((row) => ({
      ts: num(row.ts),
      path: String(row.path),
      country: row.country ? String(row.country) : null,
      city: row.city ? String(row.city) : null,
      device: row.device ? String(row.device) : null,
      browser: row.browser ? String(row.browser) : null,
      referrer: row.referrer_host ? String(row.referrer_host) : null,
    })),
  };
}
