#!/usr/bin/env node
/**
 * Generates the admin credentials for the analytics dashboard.
 *
 *   node scripts/admin-credentials.mjs
 *
 * Prints the env block to paste into .env.local (and into Vercel's env vars).
 * The plain password is never written anywhere — only the PBKDF2 digest is.
 */
import { webcrypto as crypto } from "node:crypto";
import { createInterface } from "node:readline";

const ITERATIONS = 210_000;
// base64url: "$" and "+" do not survive a .env file intact (dotenv expands them).
const b64 = (bytes) => Buffer.from(bytes).toString("base64url");

async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" },
    key,
    256
  );

  return `pbkdf2.${ITERATIONS}.${b64(salt)}.${b64(new Uint8Array(bits))}`;
}

function ask(question, { hidden = false } = {}) {
  const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });

  if (hidden) {
    // Swallow the echo so the password never lands in the terminal scrollback.
    rl._writeToOutput = (chunk) =>
      rl.output.write(chunk.includes(question) ? chunk : "");
  }

  return new Promise((resolve) =>
    rl.question(question, (answer) => {
      if (hidden) rl.output.write("\n");
      rl.close();
      resolve(answer.trim());
    })
  );
}

const email = await ask("E-mail do admin: ");
const password = await ask("Senha do admin: ", { hidden: true });

if (!email || password.length < 10) {
  console.error("\nE-mail obrigatório e senha com pelo menos 10 caracteres.");
  process.exit(1);
}

console.log(`
Cole isto no .env.local e nas Environment Variables da Vercel:

ADMIN_EMAIL=${email}
ADMIN_PASSWORD_HASH=${await hashPassword(password)}
ADMIN_AUTH_SECRET=${b64(crypto.getRandomValues(new Uint8Array(48)))}
`);
