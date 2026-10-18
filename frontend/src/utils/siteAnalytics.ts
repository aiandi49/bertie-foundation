import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabaseClient";

/* Site analytics for the admin dashboard.
   Records page views and clicks into the existing `analytics_events` table, anonymously:
   - a random visitor id kept in this browser (no name, email, IP address or cookie),
   - a random visit id that lasts until the tab is closed,
   - the page, the device size, where the visit came from, and the text of what was clicked.
   Nothing is recorded on the admin pages, or for visitors whose browser sends
   "Do Not Track" or "Global Privacy Control". Analytics never break the site: every
   failure is ignored. */

const VISITOR_KEY = "bf-visitor";
const VISIT_KEY = "bf-visit";
const MAX_EVENTS_PER_VISIT = 300;
const ENDPOINT = `${SUPABASE_URL}/rest/v1/analytics_events`;

let sentThisVisit = 0;
let visitStarted = false;

function randomId(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  } catch { /* fall through */ }
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
}

function readStore(store: "local" | "session", key: string): string | null {
  try {
    return (store === "local" ? window.localStorage : window.sessionStorage).getItem(key);
  } catch {
    return null;
  }
}

function writeStore(store: "local" | "session", key: string, value: string) {
  try {
    (store === "local" ? window.localStorage : window.sessionStorage).setItem(key, value);
  } catch { /* private mode or blocked storage: carry on without it */ }
}

// One id per browser, so returning visitors are counted once.
let memoryVisitor: string | null = null;
function visitor(): { id: string; isNew: boolean } {
  const saved = readStore("local", VISITOR_KEY) || memoryVisitor;
  if (saved) return { id: saved, isNew: false };
  const id = randomId();
  memoryVisitor = id;
  writeStore("local", VISITOR_KEY, id);
  return { id, isNew: true };
}

// One id per visit (until the tab is closed).
let memoryVisit: string | null = null;
function visit(): { id: string; isFirstPage: boolean } {
  const saved = readStore("session", VISIT_KEY) || memoryVisit;
  if (saved) return { id: saved, isFirstPage: false };
  const id = randomId();
  memoryVisit = id;
  writeStore("session", VISIT_KEY, id);
  return { id, isFirstPage: true };
}

export function analyticsAllowed(): boolean {
  if (typeof window === "undefined") return false;
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  if (nav.globalPrivacyControl === true) return false;
  if (nav.doNotTrack === "1" || (window as any).doNotTrack === "1") return false;
  const path = window.location.pathname.toLowerCase();
  if (path.startsWith("/admin") || path.startsWith("/campaign-admin") || path.startsWith("/campaignadmin")) return false;
  return true;
}

function device(): "Phone" | "Tablet" | "Computer" {
  const w = Math.min(window.innerWidth || 0, window.screen?.width || Infinity);
  if (w < 768) return "Phone";
  if (w < 1100) return "Tablet";
  return "Computer";
}

const SOURCES: [RegExp, string][] = [
  [/(^|\.)facebook\.com$|(^|\.)fb\.com$|(^|\.)fb\.me$/, "Facebook"],
  [/(^|\.)instagram\.com$/, "Instagram"],
  [/(^|\.)youtube\.com$|(^|\.)youtu\.be$/, "YouTube"],
  [/(^|\.)linkedin\.com$|(^|\.)lnkd\.in$/, "LinkedIn"],
  [/(^|\.)whatsapp\.com$|(^|\.)wa\.me$/, "WhatsApp"],
  [/(^|\.)t\.co$|(^|\.)twitter\.com$|(^|\.)x\.com$/, "X (Twitter)"],
  [/(^|\.)google\./, "Google search"],
  [/(^|\.)bing\.com$/, "Bing search"],
  [/(^|\.)duckduckgo\.com$/, "DuckDuckGo"],
  [/(^|\.)yahoo\./, "Yahoo search"],
  [/(^|\.)mail\.google\.com$|(^|\.)outlook\./, "Email"],
];

// Where this visit came from: a utm_source tag, the referring site, or "Direct".
function source(): string {
  try {
    const utm = new URLSearchParams(window.location.search).get("utm_source");
    if (utm) return utm.trim().slice(0, 40).replace(/^./, (c) => c.toUpperCase());
    if (!document.referrer) return "Direct";
    const host = new URL(document.referrer).hostname.replace(/^www\./, "");
    if (host === window.location.hostname.replace(/^www\./, "")) return "Direct";
    for (const [pattern, name] of SOURCES) if (pattern.test(host)) return name;
    return host.slice(0, 60);
  } catch {
    return "Direct";
  }
}

function send(event_type: string, component: string, action: string, metadata: Record<string, unknown>) {
  if (!analyticsAllowed()) return;
  if (sentThisVisit >= MAX_EVENTS_PER_VISIT) return;
  sentThisVisit += 1;
  const body = JSON.stringify({
    event_type,
    component: component.slice(0, 200),
    action: action.slice(0, 120),
    metadata,
    timestamp: new Date().toISOString(),
  });
  try {
    // keepalive lets a click on a link to another site still be recorded as the page unloads.
    fetch(ENDPOINT, {
      method: "POST",
      keepalive: true,
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Prefer: "return=minimal",
      },
      body,
    }).catch(() => undefined);
  } catch { /* never break the page */ }
}

function cleanPath(pathname: string): string {
  const p = (pathname || "/").replace(/\/+$/, "") || "/";
  return p.toLowerCase().slice(0, 200);
}

export function trackPageView(pathname: string) {
  if (!analyticsAllowed()) return;
  const v = visitor();
  const s = visit();
  const meta: Record<string, unknown> = { v: v.id, s: s.id, dev: device() };
  if (v.isNew) meta.new = true;
  if (s.isFirstPage && !visitStarted) {
    meta.entry = true;
    meta.src = source();
  }
  visitStarted = true;
  send("pageview", cleanPath(pathname), "view", meta);
}

function labelFor(el: Element): string {
  const aria = el.getAttribute("aria-label") || el.getAttribute("title") || "";
  const text = (aria || (el as HTMLElement).innerText || el.textContent || "").replace(/\s+/g, " ").trim();
  if (text) return text.slice(0, 80);
  const img = el.querySelector("img[alt]");
  const alt = img?.getAttribute("alt")?.trim();
  if (alt) return alt.slice(0, 80);
  // Icon-only links (Instagram, YouTube...): name them by the site they open.
  const href = el.getAttribute("href");
  if (href) {
    try {
      return new URL(href, window.location.href).hostname.replace(/^www\./, "").slice(0, 80);
    } catch { /* fall through */ }
  }
  return "(unlabelled)";
}

function targetFor(el: Element): { kind: string; to?: string } {
  if (el.tagName === "A") {
    const raw = el.getAttribute("href") || "";
    if (/^mailto:/i.test(raw)) return { kind: "Email link" };
    if (/^tel:/i.test(raw)) return { kind: "Phone link" };
    try {
      const url = new URL(raw, window.location.href);
      if (url.hostname.replace(/^www\./, "") === window.location.hostname.replace(/^www\./, "")) {
        return { kind: "Link", to: cleanPath(url.pathname) };
      }
      return { kind: "Outside link", to: url.hostname.replace(/^www\./, "").slice(0, 80) };
    } catch {
      return { kind: "Link" };
    }
  }
  return { kind: "Button" };
}

export function startClickTracking(): () => void {
  const onClick = (event: MouseEvent) => {
    try {
      if (!analyticsAllowed()) return;
      const start = event.target as Element | null;
      const el = start?.closest?.('a[href], button, [role="button"], summary');
      if (!el || el.closest("[data-no-track]")) return;
      if (el.matches("input, textarea, select")) return;
      const v = visitor();
      const s = visit();
      const target = targetFor(el);
      const meta: Record<string, unknown> = { v: v.id, s: s.id, dev: device(), kind: target.kind };
      if (target.to) meta.to = target.to;
      send("click", cleanPath(window.location.pathname), labelFor(el), meta);
    } catch { /* never break the page */ }
  };
  document.addEventListener("click", onClick, { capture: true });
  return () => document.removeEventListener("click", onClick, { capture: true });
}
