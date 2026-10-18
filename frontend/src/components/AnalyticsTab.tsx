import React, { useEffect, useMemo, useState } from "react";
import { BarChart3, Download, Eye, MousePointerClick, RefreshCw, Users, Repeat } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { supabase } from "utils/supabaseClient";

/* Analytics tab of the admin dashboard.
   Every number comes from one database call, bertie_analytics_summary(days),
   which only admins can run (see supabase/2026-10-18_site_analytics.sql). */

type Slice = { label: string; n: number; kind?: string };
type Day = { day: string; pageviews: number; visitors: number };
export type AnalyticsSummary = {
  range_from: string;
  range_to: string;
  tracking_since: string | null;
  pageviews: number;
  visitors: number;
  new_visitors: number;
  visits: number;
  clicks: number;
  form_events: number;
  pages: Slice[];
  buttons: Slice[];
  click_kinds: Slice[];
  devices: Slice[];
  sources: Slice[];
  daily: Day[];
};

const RANGES: { key: string; label: string; days: number | null }[] = [
  { key: "7", label: "7 days", days: 7 },
  { key: "30", label: "30 days", days: 30 },
  { key: "90", label: "90 days", days: 90 },
  { key: "365", label: "12 months", days: 365 },
  { key: "all", label: "All time", days: null },
];

// Four categorical colors, checked for color-blind separation on this dark surface,
// plus a neutral gray for "Other". Every slice is also named with its count and share.
const SLICE_COLORS = ["#3987e5", "#d95926", "#199e70", "#c98500"];
const OTHER_COLOR = "#6b7280";
const SURFACE = "#111827";

const PAGE_NAMES: Record<string, string> = {
  "/": "Home",
  "/about-us": "About us",
  "/aboutus": "About us",
  "/who-is-bertie": "Who is Bertie",
  "/whoisbertie": "Who is Bertie",
  "/our-story": "Our story",
  "/ourstory": "Our story",
  "/vision": "Vision",
  "/history": "History",
  "/members": "Members",
  "/donate": "Donate",
  "/contact-us": "Contact us",
  "/contactus": "Contact us",
  "/contact": "Contact us",
  "/volunteer": "Volunteer",
  "/volunteer-apply": "Volunteer",
  "/videos": "Videos",
  "/pictures": "Pictures",
  "/share-story": "Share your story",
  "/sharestory": "Share your story",
  "/success-stories": "Success stories",
  "/successstories": "Success stories",
  "/news-and-stories": "News and stories",
  "/newsandstories": "News and stories",
  "/impact": "Impact",
  "/community-impact": "Community impact",
  "/making-difference": "Making a difference",
  "/resources": "Resources",
  "/feedback": "Feedback",
  "/unsubscribe": "Unsubscribe",
};

export function pageName(path: string): string {
  return PAGE_NAMES[path] || path;
}

const nf = new Intl.NumberFormat("en-US");
const pct = (n: number, total: number) => (total ? Math.round((n / total) * 100) : 0);

function shortDate(iso: string, withYear = false) {
  const d = new Date(iso.length === 10 ? iso + "T12:00:00" : iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", ...(withYear ? { year: "numeric" } : {}) });
}

// Keep the four biggest slices and fold the rest into "Other", so colors never repeat.
// `total`, when given, is the full count (the list may hold only the top 12), so "Other" covers the rest.
function topFour(rows: Slice[], total?: number): { label: string; n: number; color: string }[] {
  const sorted = [...rows].filter((r) => r.n > 0).sort((a, b) => b.n - a.n);
  const head = sorted.slice(0, 4).map((r, i) => ({ label: r.label, n: r.n, color: SLICE_COLORS[i] }));
  const shown = head.reduce((sum, r) => sum + r.n, 0);
  const listed = sorted.reduce((sum, r) => sum + r.n, 0);
  const rest = Math.max(0, (total !== undefined ? Math.max(total, listed) : listed) - shown);
  if (rest > 0) head.push({ label: "Other", n: rest, color: OTHER_COLOR });
  return head;
}

function Kpi({ icon, label, value, note }: { icon: React.ReactNode; label: string; value: number; note?: string }) {
  return (
    <div className="min-w-0 bg-gray-800/60 border border-gray-700 rounded-xl p-4">
      <div className="flex items-center gap-2 text-gray-300 text-sm font-medium">{icon}{label}</div>
      <p className="mt-2 text-3xl font-bold text-white tabular-nums">{nf.format(value)}</p>
      {note && <p className="mt-1 text-xs text-gray-400">{note}</p>}
    </div>
  );
}

function SliceTooltip({ active, payload, total, unit }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-sm shadow-lg">
      <p className="font-semibold text-white">{p.label}</p>
      <p className="text-gray-300">{nf.format(p.n)} {unit} · {pct(p.n, total)}%</p>
    </div>
  );
}

function Donut({ title, subtitle, unit, rows }: { title: string; subtitle: string; unit: string; rows: { label: string; n: number; color: string }[] }) {
  const total = rows.reduce((s, r) => s + r.n, 0);
  return (
    <figure className="min-w-0 bg-gray-800/60 border border-gray-700 rounded-xl p-4 m-0">
      <figcaption>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-gray-400">{subtitle}</p>
      </figcaption>
      {total === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">Nothing recorded in this period yet.</p>
      ) : (
        <>
          <div className="relative h-48 mt-2" role="img" aria-label={`${title}: ${rows.map((r) => `${r.label} ${pct(r.n, total)}%`).join(", ")}`}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={rows} dataKey="n" nameKey="label" innerRadius="58%" outerRadius="92%" paddingAngle={0} stroke={SURFACE} strokeWidth={2} startAngle={90} endAngle={-270} isAnimationActive={false}>
                  {rows.map((r) => <Cell key={r.label} fill={r.color} />)}
                </Pie>
                <Tooltip content={<SliceTooltip total={total} unit={unit} />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-white tabular-nums">{nf.format(total)}</span>
              <span className="text-xs text-gray-300">{unit}</span>
            </div>
          </div>
          <ul className="mt-3 space-y-1.5 text-sm">
            {rows.map((r) => (
              <li key={r.label} className="flex items-center gap-2 min-w-0">
                <span className="inline-block w-3 h-3 rounded-sm shrink-0" style={{ background: r.color }} aria-hidden="true" />
                <span className="text-gray-200 truncate min-w-0 flex-1" title={r.label}>{r.label}</span>
                <span className="text-gray-300 tabular-nums">{nf.format(r.n)}</span>
                <span className="text-gray-400 tabular-nums w-10 text-right">{pct(r.n, total)}%</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </figure>
  );
}

function RankList({ title, subtitle, rows, unit }: { title: string; subtitle: string; rows: { label: string; n: number; note?: string }[]; unit: string }) {
  const max = Math.max(1, ...rows.map((r) => r.n));
  return (
    <section className="min-w-0 bg-gray-800/60 border border-gray-700 rounded-xl p-4">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm text-gray-400 mb-3">{subtitle}</p>
      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">Nothing recorded in this period yet.</p>
      ) : (
        <ol className="space-y-2.5">
          {rows.map((r, i) => (
            <li key={r.label + i} className="min-w-0">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-gray-200 min-w-0" style={{ overflowWrap: "anywhere" }}>
                  {r.label}
                  {r.note && <span className="text-gray-400"> · {r.note}</span>}
                </span>
                <span className="text-gray-300 tabular-nums shrink-0">{nf.format(r.n)} {unit}</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-gray-700/70 overflow-hidden" aria-hidden="true">
                <div className="h-full rounded-full" style={{ width: `${Math.max(2, (r.n / max) * 100)}%`, background: SLICE_COLORS[0] }} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function DayTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as Day;
  return (
    <div className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-sm shadow-lg">
      <p className="font-semibold text-white">{shortDate(d.day, true)}</p>
      <p className="text-gray-300">{nf.format(d.visitors)} visitors · {nf.format(d.pageviews)} page views</p>
    </div>
  );
}

function exportSummary(s: AnalyticsSummary, rangeLabel: string) {
  const lines: string[][] = [
    ["Bertie Foundation site analytics", rangeLabel],
    ["From", shortDate(s.range_from, true), "To", shortDate(s.range_to, true)],
    [],
    ["Visitors", String(s.visitors)],
    ["New visitors", String(s.new_visitors)],
    ["Visits", String(s.visits)],
    ["Page views", String(s.pageviews)],
    ["Clicks", String(s.clicks)],
    [],
    ["Day", "Visitors", "Page views"],
    ...s.daily.map((d) => [d.day, String(d.visitors), String(d.pageviews)]),
    [],
    ["Page", "Page views"],
    ...s.pages.map((p) => [pageName(p.label), String(p.n)]),
    [],
    ["What was clicked", "Type", "Clicks"],
    ...s.buttons.map((b) => [b.label, b.kind || "", String(b.n)]),
    [],
    ["Where visits came from", "Visits"],
    ...s.sources.map((r) => [r.label, String(r.n)]),
    [],
    ["Device", "Visitors"],
    ...s.devices.map((r) => [r.label, String(r.n)]),
  ];
  const csv = lines.map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\r\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bertie-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function AnalyticsTab() {
  const [range, setRange] = useState("30");
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const current = RANGES.find((r) => r.key === range) || RANGES[1];

  const load = async () => {
    setLoading(true);
    setError("");
    const { data: result, error: rpcError } = await supabase.rpc("bertie_analytics_summary", { p_days: current.days });
    if (rpcError) {
      setError(
        /does not exist|Could not find/i.test(rpcError.message)
          ? "Analytics are not switched on in the database yet. Run supabase/2026-10-18_site_analytics.sql once in the Supabase SQL Editor."
          : "We could not load the analytics just now. Please press Refresh in a moment."
      );
      setData(null);
    } else {
      setData(result as AnalyticsSummary);
    }
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [range]);

  const pies = useMemo(() => {
    if (!data) return null;
    return {
      devices: topFour(data.devices),
      sources: topFour(data.sources),
      clicks: topFour(data.buttons, data.clicks),
    };
  }, [data]);

  const daily = data?.daily || [];
  const tickEvery = daily.length > 60 ? Math.ceil(daily.length / 8) : daily.length > 14 ? Math.ceil(daily.length / 7) : 0;

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold text-white">Site Analytics</h2>
          <p className="text-gray-400 text-sm mt-0.5">
            Who visits the website, which pages they read and what they click.
            {data && <> {shortDate(data.range_from, true)} to {shortDate(data.range_to, true)}, Pattaya time.</>}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => data && exportSummary(data, current.label)}
            disabled={!data}
            className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            Export CSV
          </button>
          <button type="button" onClick={load} className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
            Refresh
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="Time period">
        {RANGES.map((r) => (
          <button
            key={r.key}
            type="button"
            aria-pressed={range === r.key}
            onClick={() => setRange(r.key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              range === r.key ? "bg-blue-600 border-blue-500 text-white" : "border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4 text-sm" role="alert">{error}</div>
      )}

      {loading && !data ? (
        <div className="flex justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-t-2 border-blue-500 rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Loading…</p>
          </div>
        </div>
      ) : data && pies ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Kpi icon={<Users className="w-4 h-4" aria-hidden="true" />} label="Visitors" value={data.visitors} note={`${nf.format(data.new_visitors)} new`} />
            <Kpi icon={<Repeat className="w-4 h-4" aria-hidden="true" />} label="Visits" value={data.visits} note={data.visitors ? `${(data.visits / data.visitors).toFixed(1)} per visitor` : undefined} />
            <Kpi icon={<Eye className="w-4 h-4" aria-hidden="true" />} label="Page views" value={data.pageviews} note={data.visits ? `${(data.pageviews / data.visits).toFixed(1)} pages per visit` : undefined} />
            <Kpi icon={<MousePointerClick className="w-4 h-4" aria-hidden="true" />} label="Clicks" value={data.clicks} note="Links and buttons" />
          </div>

          <section className="min-w-0 bg-gray-800/60 border border-gray-700 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-white">Visitors per day</h3>
            <p className="text-sm text-gray-400 mb-3">Hover or tap a day for its numbers.</p>
            {data.pageviews === 0 ? (
              <p className="py-10 text-center text-sm text-gray-400">No visits recorded in this period yet.</p>
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={daily} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="#374151" strokeDasharray="0" />
                    <XAxis dataKey="day" tickFormatter={(d) => shortDate(d)} interval={tickEvery} tick={{ fill: "#d1d5db", fontSize: 12 }} axisLine={{ stroke: "#4b5563" }} tickLine={false} minTickGap={8} />
                    <YAxis allowDecimals={false} tick={{ fill: "#d1d5db", fontSize: 12 }} axisLine={false} tickLine={false} width={44} />
                    <Tooltip content={<DayTooltip />} cursor={{ fill: "rgba(255,255,255,0.06)" }} />
                    <Bar dataKey="visitors" fill={SLICE_COLORS[0]} radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Donut title="Devices" subtitle="Visitors by screen" unit="visitors" rows={pies.devices} />
            <Donut title="Where visitors come from" subtitle="How each visit started" unit="visits" rows={pies.sources} />
            <Donut title="What people click" subtitle="Top buttons and links" unit="clicks" rows={pies.clicks} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RankList title="Most-read pages" subtitle="Page views" unit="views" rows={data.pages.map((p) => ({ label: pageName(p.label), n: p.n }))} />
            <RankList title="Most-clicked" subtitle="Every link and button, by its label" unit="clicks" rows={data.buttons.map((b) => ({ label: b.label, n: b.n, note: b.kind }))} />
          </div>

          <div className="flex gap-3 items-start text-sm text-gray-400 border-t border-gray-800 pt-4">
            <BarChart3 className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
            <p className="min-w-0">
              {data.tracking_since
                ? <>Visitor counting started {shortDate(data.tracking_since, true)}. </>
                : <>Visitor counting starts as soon as this update is live. </>}
              {data.form_events > 0 && <>Form views and submissions are counted separately ({nf.format(data.form_events)} in this period). </>}
              Visitors are counted anonymously: no names, emails or IP addresses are stored, admin pages are never counted,
              and browsers set to “Do Not Track” are skipped.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
