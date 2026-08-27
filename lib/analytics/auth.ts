import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "sp_admin";
const SESSION_MAX_AGE = 60 * 60 * 12; // 12h
const PBKDF2_ITERATIONS = 210_000;

const encoder = new TextEncoder();

// base64url + "." separators: "$" and "+" are expanded/mangled by dotenv, so the
// stored hash has to survive a .env file untouched.
const toBase64 = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const fromBase64 = (value: string) => {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
};

function secret(): Uint8Array {
  const value = process.env.ADMIN_AUTH_SECRET;
  if (!value || value.length < 32) {
    throw new Error("ADMIN_AUTH_SECRET is missing or shorter than 32 chars");
  }
  return encoder.encode(value);
}

export async function pbkdf2(
  password: string,
  salt: Uint8Array,
  iterations = PBKDF2_ITERATIONS
) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as BufferSource, iterations, hash: "SHA-256" },
    key,
    256
  );

  return new Uint8Array(bits);
}

/** Serialized as `pbkdf2.<iterations>.<salt>.<hash>`, base64url. */
export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2(password, salt);
  return `pbkdf2.${PBKDF2_ITERATIONS}.${toBase64(salt)}.${toBase64(hash)}`;
}

/** Constant-time comparison so a wrong password leaks no timing signal. */
function timingSafeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, iterations, salt, hash] = stored.split(".");
  if (scheme !== "pbkdf2" || !iterations || !salt || !hash) return false;

  const derived = await pbkdf2(password, fromBase64(salt), Number(iterations));
  return timingSafeEqual(derived, fromBase64(hash));
}

export async function createSessionToken(email: string) {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(email)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secret());
}

export async function readSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret());
    return { email: String(payload.email ?? payload.sub ?? "") };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE,
} as const;
