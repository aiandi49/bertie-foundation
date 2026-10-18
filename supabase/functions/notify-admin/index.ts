import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Sends an instant admin notification email:
//   • when a new row lands in one of the four "someone is waiting on a response" tables
//     (newsletter sign-ups are left to the weekly digest, so admins aren't spammed), and
//   • when an admin deletes something in the dashboard (a 'delete' row in admin_activity_log).
// Triggered by database triggers that call notify_admin_on_insert(), never by the browser.

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET")!;
const ADMIN_EMAILS = (Deno.env.get("ADMIN_EMAILS") ?? "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "notifications@bertiefoundation.org";

const TABLE_LABELS: Record<string, string> = {
  contact_requests: "New Contact Message",
  volunteer_applications: "New Volunteer Application",
  feedback: "New Feedback Submission",
  success_stories: "New Success Story Submission",
  admin_activity_log: "Something was deleted in the admin dashboard",
};

const FIELD_LABELS: Record<string, string> = {
  table_name: "Deleted from",
  details: "Details",
  performed_by: "Deleted by",
  performed_at: "When",
  record_id: "Record id",
};

const TABLE_NAMES: Record<string, string> = {
  contact_requests: "Contact messages",
  volunteer_applications: "Volunteer applications",
  newsletter_subscribers: "Newsletter subscribers",
  feedback: "Feedback",
  success_stories: "Success stories",
};

// Form fields are typed by website visitors, so escape them before putting them in the email.
function esc(value: unknown): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatRecord(table: string, record: Record<string, unknown>): string {
  const isDeletion = table === "admin_activity_log";
  return Object.entries(record)
    .filter(([key]) => key !== "id" && !(isDeletion && key === "action"))
    .map(([key, value]) => {
      const label = isDeletion ? FIELD_LABELS[key] ?? key : key;
      let shown = value;
      if (isDeletion && key === "table_name" && typeof value === "string") shown = TABLE_NAMES[value] ?? value;
      const text = shown === null || shown === undefined || shown === "" ? "—" : esc(shown);
      return `<tr><td style="padding:4px 12px 4px 0;color:#666;font-weight:600;vertical-align:top;">${esc(label)}</td><td style="padding:4px 0;">${text}</td></tr>`;
    })
    .join("");
}

Deno.serve(async (req: Request) => {
  if (req.headers.get("x-webhook-secret") !== WEBHOOK_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!ADMIN_EMAILS.length) {
    return new Response("No admin emails configured", { status: 500 });
  }

  const payload = await req.json();
  const table = String(payload.table ?? "");
  const record = (payload.record ?? {}) as Record<string, unknown>;

  // Only deletions from the activity log are emailed; other logged actions are not.
  if (table === "admin_activity_log" && record.action !== "delete") {
    return new Response("Ignored", { status: 200 });
  }

  const label = TABLE_LABELS[table] ?? `New submission (${table})`;

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#b91c1c;">${esc(label)}</h2>
      <p style="color:#666;">Bertie Foundation — bertiefoundation.org</p>
      <table style="border-collapse:collapse;width:100%;">${formatRecord(table, record)}</table>
    </div>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: ADMIN_EMAILS,
      subject: `${label} — Bertie Foundation`,
      html,
    }),
  });

  if (!res.ok) {
    console.error("Resend error status:", res.status);
    return new Response("Failed to send email", { status: 500 });
  }

  return new Response("OK", { status: 200 });
});
