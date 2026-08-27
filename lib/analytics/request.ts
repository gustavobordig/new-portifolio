const BOT_PATTERN =
  /bot|crawler|spider|crawl|slurp|facebookexternalhit|preview|monitor|lighthouse|headless|curl|wget|python-requests|axios|phantom|pingdom|uptime|semrush|ahrefs|dataprovider|gptbot|claudebot|chatgpt|perplexity/i;

export const isBot = (userAgent: string) => BOT_PATTERN.test(userAgent);

export function clientIp(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "0.0.0.0";
}

/**
 * A visitor is identified by a salted digest of ip + user agent, where the salt
 * rotates daily. That is enough to count uniques per day without ever storing
 * anything that points back at a person.
 */
export async function visitorHash(ip: string, userAgent: string) {
  const day = new Date().toISOString().slice(0, 10);
  const salt = process.env.ADMIN_AUTH_SECRET ?? "space-portfolio";
  const data = new TextEncoder().encode(`${day}:${salt}:${ip}:${userAgent}`);
  const digest = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(digest).slice(0, 16))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function parseUserAgent(userAgent: string) {
  const ua = userAgent.toLowerCase();

  const device = /ipad|tablet|playbook|silk/.test(ua)
    ? "tablet"
    : /mobi|iphone|ipod|android.*mobile|windows phone/.test(ua)
      ? "mobile"
      : "desktop";

  // Order matters: every Chromium browser also claims "chrome" and "safari".
  const browser = /edg\//.test(ua)
    ? "Edge"
    : /opr\/|opera/.test(ua)
      ? "Opera"
      : /samsungbrowser/.test(ua)
        ? "Samsung Internet"
        : /firefox|fxios/.test(ua)
          ? "Firefox"
          : /chrome|crios|chromium/.test(ua)
            ? "Chrome"
            : /safari/.test(ua)
              ? "Safari"
              : "Outro";

  const os = /windows/.test(ua)
    ? "Windows"
    : /iphone|ipad|ipod/.test(ua)
      ? "iOS"
      : /mac os x/.test(ua)
        ? "macOS"
        : /android/.test(ua)
          ? "Android"
          : /linux/.test(ua)
            ? "Linux"
            : "Outro";

  return { device, browser, os };
}

/** Vercel injects the geo headers at the edge; locally they are simply absent. */
export function geo(headers: Headers) {
  const decode = (value: string | null) => {
    if (!value) return null;
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  };

  return {
    country: headers.get("x-vercel-ip-country"),
    city: decode(headers.get("x-vercel-ip-city")),
  };
}

/** Only the host is kept — full referrer URLs are noisy and needlessly precise. */
export function referrerHost(referrer: string | null, selfHost: string | null) {
  if (!referrer) return null;

  try {
    const { hostname } = new URL(referrer);
    if (!hostname || hostname === selfHost) return null;
    return hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}
