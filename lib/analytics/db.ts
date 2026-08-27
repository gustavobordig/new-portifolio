import { createClient, type Client } from "@libsql/client";

let client: Client | null = null;
let schemaReady: Promise<void> | null = null;

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS page_views (
     id            INTEGER PRIMARY KEY AUTOINCREMENT,
     ts            INTEGER NOT NULL,
     path          TEXT    NOT NULL,
     referrer_host TEXT,
     country       TEXT,
     city          TEXT,
     device        TEXT,
     browser       TEXT,
     os            TEXT,
     locale        TEXT,
     visitor_hash  TEXT    NOT NULL,
     session_id    TEXT    NOT NULL,
     duration_ms   INTEGER NOT NULL DEFAULT 0
   )`,
  `CREATE INDEX IF NOT EXISTS idx_page_views_ts ON page_views (ts)`,
  `CREATE INDEX IF NOT EXISTS idx_page_views_session ON page_views (session_id, path)`,
  `CREATE TABLE IF NOT EXISTS events (
     id           INTEGER PRIMARY KEY AUTOINCREMENT,
     ts           INTEGER NOT NULL,
     name         TEXT    NOT NULL,
     label        TEXT,
     session_id   TEXT    NOT NULL,
     visitor_hash TEXT    NOT NULL
   )`,
  `CREATE INDEX IF NOT EXISTS idx_events_ts ON events (ts)`,
  `CREATE TABLE IF NOT EXISTS login_attempts (
     id      INTEGER PRIMARY KEY AUTOINCREMENT,
     ts      INTEGER NOT NULL,
     email   TEXT    NOT NULL,
     ip_hash TEXT    NOT NULL,
     ok      INTEGER NOT NULL
   )`,
  `CREATE INDEX IF NOT EXISTS idx_login_attempts_ts ON login_attempts (ts, ip_hash)`,
];

/**
 * Lazily builds the libSQL client. Kept lazy so a missing env var only breaks
 * the analytics routes instead of the whole build.
 */
export function db(): Client {
  if (client) return client;

  const url = process.env.TURSO_DATABASE_URL;
  if (!url) throw new Error("TURSO_DATABASE_URL is not set");

  client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  return client;
}

/** Runs the migrations once per server instance. */
export function ensureSchema(): Promise<void> {
  schemaReady ??= (async () => {
    const c = db();
    for (const statement of SCHEMA) await c.execute(statement);
  })().catch((error) => {
    schemaReady = null;
    throw error;
  });

  return schemaReady;
}
