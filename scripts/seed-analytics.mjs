#!/usr/bin/env node
/**
 * Popula o banco com acessos falsos para visualizar o painel.
 *
 *   node scripts/seed-analytics.mjs            # 90 dias de dados
 *   node scripts/seed-analytics.mjs --days 30
 *   node scripts/seed-analytics.mjs --clear    # apaga tudo e sai
 *
 * Por segurança só roda contra um banco local (`file:`); para um banco remoto
 * é preciso passar --force explicitamente.
 */
import { createClient } from "@libsql/client";
import { readFileSync } from "node:fs";

// Lê o .env.local sem depender de dotenv.
function loadEnv() {
  try {
    for (const line of readFileSync(".env.local", "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const at = trimmed.indexOf("=");
      if (at < 0) continue;
      const key = trimmed.slice(0, at);
      if (!process.env[key]) process.env[key] = trimmed.slice(at + 1);
    }
  } catch {
    // sem .env.local: usa o que já estiver no ambiente
  }
}

loadEnv();

const args = process.argv.slice(2);
const has = (flag) => args.includes(flag);
const value = (flag, fallback) => {
  const at = args.indexOf(flag);
  return at >= 0 && args[at + 1] ? Number(args[at + 1]) : fallback;
};

const url = process.env.TURSO_DATABASE_URL;
if (!url) {
  console.error("TURSO_DATABASE_URL não está definida (.env.local).");
  process.exit(1);
}

if (!url.startsWith("file:") && !has("--force")) {
  console.error(
    `Recusando semear "${url}" — isso parece um banco remoto.\n` +
      "Se for mesmo o que você quer, rode de novo com --force."
  );
  process.exit(1);
}

const db = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });

const pick = (list) => list[Math.floor(Math.random() * list.length)];
const weighted = (pairs) => {
  const total = pairs.reduce((sum, [, w]) => sum + w, 0);
  let roll = Math.random() * total;
  for (const [item, w] of pairs) {
    roll -= w;
    if (roll <= 0) return item;
  }
  return pairs[0][0];
};

const REFERRERS = [
  [null, 34], ["linkedin.com", 22], ["github.com", 16], ["google.com", 12],
  ["x.com", 7], ["reddit.com", 5], ["news.ycombinator.com", 3], ["instagram.com", 3],
];
const COUNTRIES = [
  [["BR", "São Paulo"], 30], [["BR", "Curitiba"], 12], [["BR", "Rio de Janeiro"], 10],
  [["US", "New York"], 10], [["US", "San Francisco"], 7], [["PT", "Lisboa"], 8],
  [["DE", "Berlin"], 5], [["ES", "Madrid"], 4], [["AR", "Buenos Aires"], 4],
  [["CA", "Toronto"], 3], [["GB", "London"], 3], [["FR", "Paris"], 2], [["JP", "Tokyo"], 2],
];
const AGENTS = [
  [["mobile", "Safari", "iOS"], 22], [["mobile", "Chrome", "Android"], 18],
  [["desktop", "Chrome", "macOS"], 20], [["desktop", "Chrome", "Windows"], 15],
  [["desktop", "Safari", "macOS"], 8], [["desktop", "Firefox", "Linux"], 5],
  [["desktop", "Edge", "Windows"], 6], [["tablet", "Safari", "iOS"], 6],
];
const DOWNLOADS = ["Heisen · ios", "Heisen · macos", "Nara · ios", "Soma · macos"];

// Curva típica de um dia: vale de madrugada, picos no meio da manhã e à noite.
const HOUR_WEIGHT = [
  2, 1, 1, 1, 1, 2, 4, 7, 11, 14, 15, 13,
  12, 13, 15, 16, 17, 18, 20, 22, 21, 16, 10, 5,
];

const hourOfDay = () => {
  const total = HOUR_WEIGHT.reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  for (let h = 0; h < 24; h++) {
    roll -= HOUR_WEIGHT[h];
    if (roll <= 0) return h;
  }
  return 12;
};

async function clear() {
  for (const table of ["page_views", "events", "login_attempts"]) {
    await db.execute(`DELETE FROM ${table}`);
  }
}

async function seed(days) {
  const now = Date.now();
  let views = 0;
  let events = 0;

  for (let ago = days - 1; ago >= 0; ago--) {
    const midnight = new Date(now - ago * 86_400_000).setUTCHours(0, 0, 0, 0);
    const weekday = new Date(midnight).getUTCDay();

    // Cresce ao longo do período, cai no fim de semana, com ruído por dia.
    const growth = 1 + ((days - ago) / days) * 1.6;
    const weekend = weekday === 0 || weekday === 6 ? 0.55 : 1;
    const spike = Math.random() < 0.06 ? 2.8 : 1; // um post que viralizou
    const sessions = Math.max(
      1,
      Math.round(7 * growth * weekend * spike * (0.7 + Math.random() * 0.6))
    );

    for (let s = 0; s < sessions; s++) {
      const ts =
        midnight + hourOfDay() * 3_600_000 + Math.floor(Math.random() * 3_600_000);
      if (ts > now) continue;

      const [country, city] = weighted(COUNTRIES);
      const [device, browser, os] = weighted(AGENTS);
      const referrer = weighted(REFERRERS);
      const session = `seed-${ago}-${s}`;
      const visitor = `seed-visitor-${ago}-${Math.floor(s / 1.25)}`;
      const engaged = Math.random() < 0.55;

      await db.execute({
        sql: `INSERT INTO page_views
                (ts, path, referrer_host, country, city, device, browser, os,
                 locale, visitor_hash, session_id, duration_ms)
              VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        args: [
          ts, "/", referrer, country, city, device, browser, os,
          country === "BR" || country === "PT" ? "pt" : "en",
          visitor, session,
          engaged
            ? Math.round(15_000 + Math.random() * 240_000)
            : Math.round(2_000 + Math.random() * 12_000),
        ],
      });
      views++;

      // Parte das visitas engajadas volta à página — sem isso toda sessão teria
      // uma única visualização e a taxa de rejeição sairia sempre em 100%.
      if (engaged && Math.random() < 0.35) {
        await db.execute({
          sql: `INSERT INTO page_views
                  (ts, path, referrer_host, country, city, device, browser, os,
                   locale, visitor_hash, session_id, duration_ms)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
          args: [
            ts + 60_000 + Math.floor(Math.random() * 600_000),
            "/", null, country, city, device, browser, os,
            country === "BR" || country === "PT" ? "pt" : "en",
            visitor, session,
            Math.round(10_000 + Math.random() * 120_000),
          ],
        });
        views++;
      }

      if (engaged && Math.random() < 0.22) {
        await db.execute({
          sql: `INSERT INTO events (ts, name, label, session_id, visitor_hash)
                VALUES (?,?,?,?,?)`,
          args: [
            ts + 20_000 + Math.floor(Math.random() * 90_000),
            "download_click",
            pick(DOWNLOADS),
            session,
            visitor,
          ],
        });
        events++;
      }
    }
  }

  console.log(`Semeados ${views} acessos e ${events} cliques ao longo de ${days} dias.`);
  console.log("Veja em http://localhost:3000/admin");
  console.log("Para limpar: node scripts/seed-analytics.mjs --clear");
}

if (has("--clear")) {
  await clear();
  console.log("Banco limpo.");
} else {
  await clear();
  await seed(value("--days", 90));
}
