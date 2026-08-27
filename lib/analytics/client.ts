const SESSION_KEY = "sp_session_id";
const ENDPOINT = "/api/track";

const disabled = () => process.env.NEXT_PUBLIC_DISABLE_ANALYTICS === "1";

export function getSessionId() {
  if (typeof window === "undefined") return null;

  try {
    let id = window.sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    // Private mode / storage blocked: the visit still counts, just not the session.
    return null;
  }
}

function send(payload: Record<string, unknown>, beacon = false) {
  if (typeof window === "undefined" || disabled()) return;

  const sessionId = getSessionId();
  if (!sessionId) return;

  const body = JSON.stringify({ ...payload, sessionId });

  if (beacon && navigator.sendBeacon) {
    navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "application/json" }));
    return;
  }

  void fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
}

export const trackPageView = (path: string) =>
  send({
    type: "pageview",
    path,
    referrer: document.referrer || null,
    locale: document.documentElement.lang || null,
  });

export const trackDuration = (path: string, durationMs: number) =>
  send({ type: "duration", path, durationMs }, true);

/** Call from any client component: trackEvent("project_click", "Heisen"). */
export const trackEvent = (name: string, label?: string) =>
  send({ type: "event", name, label: label ?? null });
