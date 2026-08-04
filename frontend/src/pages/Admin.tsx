import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Mail, Users, MessageSquare, Award, Star, Trash2, RefreshCw, CheckCircle, XCircle, Download, FileSpreadsheet } from 'lucide-react';
import { Button } from '../components/Button';
import { supabase } from '../utils/supabaseClient';
import { useAuth, logAdminActivity } from '../utils/useAuth';
import * as XLSX from 'xlsx';

// ─── Types ────────────────────────────────────────────────────────────────────

type TabKey = 'newsletter' | 'contact' | 'volunteer' | 'stories' | 'feedback';

interface Subscriber { id: string; name: string; email: string; status: string; source: string; subscribed_at: string; }
interface ContactReq  { id: string; name: string; email: string; subject: string; message: string; submitted_at: string; status: string; }
interface Volunteer   { id: string; name: string; email: string; message: string; interests: any; skills: any; submitted_at: string; status: string; }
interface Story       { id: string; name: string; email: string; title: string; story: string; program: string; impact: string; image_url: string; timestamp: string; status: string; }
interface Feedback    { id: string; name?: string; email?: string; rating: number; category: string; comment: string; created_at: string; status: string; }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(ts: any) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function Badge({ label, color }: { label: string; color: 'green' | 'yellow' | 'red' | 'blue' | 'gray' }) {
  const map = { green: 'bg-green-100 text-green-800', yellow: 'bg-yellow-100 text-yellow-800', red: 'bg-red-100 text-red-800', blue: 'bg-blue-100 text-blue-800', gray: 'bg-gray-100 text-gray-700' };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${map[color]}`}>{label}</span>;
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="text-center py-16 border border-dashed border-gray-700 rounded-xl">
      <CheckCircle className="mx-auto w-10 h-10 text-gray-600 mb-3" />
      <p className="text-gray-400 font-medium">No {label} found</p>
      <p className="text-gray-600 text-sm mt-1">New submissions will appear here</p>
    </div>
  );
}

// ─── CSV Export Utility ───────────────────────────────────────────────────────

function exportToCSV(rows: any[], filename: string) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const header = keys.join(',');
  const body = rows.map(r =>
    keys.map(k => {
      const val = r[k] === null || r[k] === undefined ? '' : String(r[k]);
      return `"${val.replace(/"/g, '""')}"`;
    }).join(',')
  ).join('\n');
  const blob = new Blob([header + '\n' + body], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Excel (.xlsx) Export — one workbook, one sheet per form type ─────────────
// This is the "beautiful Excel file" export: it pulls every table fresh,
// builds a real formatted workbook (auto-sized columns, one tab per form),
// and downloads it in a single click — not a CSV per tab.

async function exportAllToExcel(userEmail: string) {
  const tables: { key: string; sheetName: string; orderBy: string }[] = [
    { key: 'newsletter_subscribers', sheetName: 'Newsletter Signups', orderBy: 'subscribed_at' },
    { key: 'contact_requests', sheetName: 'Contact Messages', orderBy: 'submitted_at' },
    { key: 'volunteer_applications', sheetName: 'Volunteer Applications', orderBy: 'submitted_at' },
    { key: 'success_stories', sheetName: 'Success Stories', orderBy: 'timestamp' },
    { key: 'feedback', sheetName: 'Feedback', orderBy: 'created_at' },
  ];

  const workbook = XLSX.utils.book_new();

  for (const t of tables) {
    const { data, error } = await supabase.from(t.key).select('*').order(t.orderBy, { ascending: false });
    const rows = error || !data ? [] : data;
    const sheet = XLSX.utils.json_to_sheet(rows.length ? rows : [{ note: 'No submissions yet' }]);

    // Auto-size columns roughly based on content length
    if (rows.length) {
      const keys = Object.keys(rows[0]);
      sheet['!cols'] = keys.map(k => ({
        wch: Math.min(60, Math.max(12, k.length, ...rows.map(r => String(r[k] ?? '').length))),
      }));
    }

    XLSX.utils.book_append_sheet(workbook, sheet, t.sheetName.slice(0, 31)); // Excel sheet name limit
  }

  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `bertie-foundation-export-${dateStr}.xlsx`);

  await logAdminActivity({ action: 'export', table_name: 'all_tables', user_email: userEmail, details: 'Full Excel export' });
}

// ─── Tab: Newsletter ──────────────────────────────────────────────────────────

function NewsletterTab({ userEmail }: { userEmail: string }) {
  const [rows, setRows] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});

  const load = async () => {
    setLoading(true); setError('');
    const { data, error } = await supabase.from('newsletter_subscribers').select('*').order('subscribed_at', { ascending: false });
    if (error) setError(error.message);
    else setRows(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: string, email: string) => {
    if (!confirm('Delete this subscriber?')) return;
    setDeleting(p => ({ ...p, [id]: true }));
    await supabase.from('newsletter_subscribers').delete().eq('id', id);
    await logAdminActivity({ action: 'delete', table_name: 'newsletter_subscribers', record_id: id, details: email, user_email: userEmail });
    setRows(p => p.filter(r => r.id !== id));
    setDeleting(p => ({ ...p, [id]: false }));
  };

  return (
    <Section title="Newsletter Subscribers" count={rows.length} onRefresh={load} loading={loading} error={error}
      onExport={() => { exportToCSV(rows, 'newsletter-subscribers.csv'); logAdminActivity({ action: 'export', table_name: 'newsletter_subscribers', user_email: userEmail }); }}
    >
      {rows.length === 0 ? <EmptyState label="subscribers" /> : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700 text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wider">
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Source</th>
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {rows.map(r => (
                <tr key={r.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="py-3 pr-4 text-white">{r.name || '—'}</td>
                  <td className="py-3 pr-4 text-gray-300">{r.email}</td>
                  <td className="py-3 pr-4"><Badge label={r.status || 'active'} color={r.status === 'active' ? 'green' : 'red'} /></td>
                  <td className="py-3 pr-4 text-gray-400">{r.source || '—'}</td>
                  <td className="py-3 pr-4 text-gray-400 whitespace-nowrap">{fmt(r.subscribed_at)}</td>
                  <td className="py-3">
                    <button onClick={() => remove(r.id, r.email)} disabled={deleting[r.id]} className="text-gray-500 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Section>
  );
}

// ─── Tab: Contact ─────────────────────────────────────────────────────────────

function ContactTab({ userEmail }: { userEmail: string }) {
  const [rows, setRows] = useState<ContactReq[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});

  const load = async () => {
    setLoading(true); setError('');
    const { data, error } = await supabase.from('contact_requests').select('*').order('submitted_at', { ascending: false });
    if (error) setError(error.message);
    else setRows(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: string, name: string) => {
    if (!confirm('Delete this message?')) return;
    setDeleting(p => ({ ...p, [id]: true }));
    await supabase.from('contact_requests').delete().eq('id', id);
    await logAdminActivity({ action: 'delete', table_name: 'contact_requests', record_id: id, details: name, user_email: userEmail });
    setRows(p => p.filter(r => r.id !== id));
    setDeleting(p => ({ ...p, [id]: false }));
  };

  return (
    <Section title="Contact Messages" count={rows.length} onRefresh={load} loading={loading} error={error}
      onExport={() => { exportToCSV(rows, 'contact-messages.csv'); logAdminActivity({ action: 'export', table_name: 'contact_requests', user_email: userEmail }); }}
    >
      {rows.length === 0 ? <EmptyState label="contact messages" /> : (
        <div className="space-y-4">
          {rows.map(r => (
            <div key={r.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-semibold text-white">{r.name}</span>
                  <span className="text-gray-400 ml-2 text-sm">{r.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 text-xs">{fmt(r.submitted_at)}</span>
                  <button onClick={() => remove(r.id, r.name)} disabled={deleting[r.id]} className="text-gray-500 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {r.subject && <p className="text-sm font-medium text-blue-400 mb-1">{r.subject}</p>}
              <p className="text-gray-300 text-sm whitespace-pre-wrap">{r.message}</p>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

// ─── Tab: Volunteer ───────────────────────────────────────────────────────────

function VolunteerTab({ userEmail }: { userEmail: string }) {
  const [rows, setRows] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});

  const load = async () => {
    setLoading(true); setError('');
    const { data, error } = await supabase.from('volunteer_applications').select('*').order('submitted_at', { ascending: false });
    if (error) setError(error.message);
    else setRows(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: string, name: string) => {
    if (!confirm('Delete this application?')) return;
    setDeleting(p => ({ ...p, [id]: true }));
    await supabase.from('volunteer_applications').delete().eq('id', id);
    await logAdminActivity({ action: 'delete', table_name: 'volunteer_applications', record_id: id, details: name, user_email: userEmail });
    setRows(p => p.filter(r => r.id !== id));
    setDeleting(p => ({ ...p, [id]: false }));
  };

  const updateStatus = async (id: string, status: string, name: string) => {
    await supabase.from('volunteer_applications').update({ status }).eq('id', id);
    await logAdminActivity({ action: status as any, table_name: 'volunteer_applications', record_id: id, details: name, user_email: userEmail });
    setRows(p => p.map(r => r.id === id ? { ...r, status } : r));
  };

  return (
    <Section title="Volunteer Applications" count={rows.length} onRefresh={load} loading={loading} error={error}
      onExport={() => { exportToCSV(rows, 'volunteer-applications.csv'); logAdminActivity({ action: 'export', table_name: 'volunteer_applications', user_email: userEmail }); }}
    >
      {rows.length === 0 ? <EmptyState label="applications" /> : (
        <div className="space-y-4">
          {rows.map(r => (
            <div key={r.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="font-semibold text-white">{r.name}</span>
                  <span className="text-gray-400 ml-2 text-sm">{r.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge label={r.status || 'pending'} color={r.status === 'approved' ? 'green' : r.status === 'rejected' ? 'red' : 'yellow'} />
                  <span className="text-gray-500 text-xs">{fmt(r.submitted_at)}</span>
                  <button onClick={() => remove(r.id, r.name)} disabled={deleting[r.id]} className="text-gray-500 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {r.interests && <p className="text-xs text-gray-400 mb-1"><span className="text-gray-300">Interests:</span> {Array.isArray(r.interests) ? r.interests.join(', ') : r.interests}</p>}
              {r.skills && <p className="text-xs text-gray-400 mb-2"><span className="text-gray-300">Skills:</span> {Array.isArray(r.skills) ? r.skills.join(', ') : r.skills}</p>}
              {r.message && <p className="text-gray-300 text-sm whitespace-pre-wrap mb-3">{r.message}</p>}
              {(!r.status || r.status === 'pending') && (
                <div className="flex gap-2">
                  <button onClick={() => updateStatus(r.id, 'approved', r.name)} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors">
                    <CheckCircle className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button onClick={() => updateStatus(r.id, 'rejected', r.name)} className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors">
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

// ─── Tab: Success Stories ─────────────────────────────────────────────────────

function StoriesTab({ userEmail }: { userEmail: string }) {
  const [rows, setRows] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});

  const load = async () => {
    setLoading(true); setError('');
    const { data, error } = await supabase.from('success_stories').select('*').order('timestamp', { ascending: false });
    if (error) setError(error.message);
    else setRows(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: string, title: string) => {
    if (!confirm('Delete this story?')) return;
    setDeleting(p => ({ ...p, [id]: true }));
    await supabase.from('success_stories').delete().eq('id', id);
    await logAdminActivity({ action: 'delete', table_name: 'success_stories', record_id: id, details: title, user_email: userEmail });
    setRows(p => p.filter(r => r.id !== id));
    setDeleting(p => ({ ...p, [id]: false }));
  };

  const updateStatus = async (id: string, status: string, title: string) => {
    await supabase.from('success_stories').update({ status }).eq('id', id);
    await logAdminActivity({ action: status as any, table_name: 'success_stories', record_id: id, details: title, user_email: userEmail });
    setRows(p => p.map(r => r.id === id ? { ...r, status } : r));
  };

  return (
    <Section title="Success Stories" count={rows.length} onRefresh={load} loading={loading} error={error}
      onExport={() => { exportToCSV(rows, 'success-stories.csv'); logAdminActivity({ action: 'export', table_name: 'success_stories', user_email: userEmail }); }}
    >
      {rows.length === 0 ? <EmptyState label="stories" /> : (
        <div className="space-y-4">
          {rows.map(r => (
            <div key={r.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-white">{r.title}</h3>
                  <span className="text-gray-400 text-sm">{r.name} · {r.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge label={r.status || 'pending'} color={r.status === 'approved' ? 'green' : r.status === 'rejected' ? 'red' : 'yellow'} />
                  <span className="text-gray-500 text-xs">{fmt(r.timestamp)}</span>
                  <button onClick={() => remove(r.id, r.title)} disabled={deleting[r.id]} className="text-gray-500 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2 text-xs text-gray-400">
                <span><span className="text-gray-300">Program:</span> {r.program}</span>
                <span><span className="text-gray-300">Impact:</span> {r.impact}</span>
              </div>
              <p className="text-gray-300 text-sm whitespace-pre-wrap mb-3">{r.story}</p>
              {r.image_url && <img src={r.image_url} alt="story" className="h-24 rounded-lg object-cover mb-3" />}
              {(!r.status || r.status === 'pending') && (
                <div className="flex gap-2">
                  <button onClick={() => updateStatus(r.id, 'approved', r.title)} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors">
                    <CheckCircle className="w-3.5 h-3.5" /> Publish
                  </button>
                  <button onClick={() => updateStatus(r.id, 'rejected', r.title)} className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors">
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

// ─── Tab: Feedback ────────────────────────────────────────────────────────────

function FeedbackTab({ userEmail }: { userEmail: string }) {
  const [rows, setRows] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});

  const load = async () => {
    setLoading(true); setError('');
    const { data, error } = await supabase.from('feedback').select('*').order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setRows(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: string, comment: string) => {
    if (!confirm('Delete this feedback?')) return;
    setDeleting(p => ({ ...p, [id]: true }));
    await supabase.from('feedback').delete().eq('id', id);
    await logAdminActivity({ action: 'delete', table_name: 'feedback', record_id: id, details: comment.slice(0, 80), user_email: userEmail });
    setRows(p => p.filter(r => r.id !== id));
    setDeleting(p => ({ ...p, [id]: false }));
  };

  const toggleApprove = async (id: string, currentStatus: string, comment: string) => {
    const newStatus = currentStatus === 'approved' ? 'pending' : 'approved';
    await supabase.from('feedback').update({ status: newStatus }).eq('id', id);
    await logAdminActivity({ action: newStatus === 'approved' ? 'approve' : 'unapprove', table_name: 'feedback', record_id: id, details: comment.slice(0, 80), user_email: userEmail });
    setRows(p => p.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n);

  return (
    <Section title="Feedback" count={rows.length} onRefresh={load} loading={loading} error={error}
      onExport={() => { exportToCSV(rows, 'feedback.csv'); logAdminActivity({ action: 'export', table_name: 'feedback', user_email: userEmail }); }}
    >
      {rows.length === 0 ? <EmptyState label="feedback" /> : (
        <div className="space-y-4">
          {rows.map(r => (
            <div key={r.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-semibold text-white">{r.name || 'Anonymous'}</span>
                  {r.email && <span className="text-gray-400 ml-2 text-sm">{r.email}</span>}
                </div>
                <div className="flex items-center gap-3">
                  <Badge label={r.status === 'approved' ? 'Approved' : 'Pending'} color={r.status === 'approved' ? 'green' : 'yellow'} />
                  <span className="text-gray-500 text-xs">{fmt(r.created_at)}</span>
                  <button onClick={() => remove(r.id, r.comment)} disabled={deleting[r.id]} className="text-gray-500 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex gap-4 mb-2 text-sm">
                <span className="text-yellow-400">{stars(r.rating || 0)}</span>
                <Badge label={r.category || '—'} color="blue" />
              </div>
              <p className="text-gray-300 text-sm whitespace-pre-wrap mb-3">{r.comment}</p>
              <button
                onClick={() => toggleApprove(r.id, r.status || 'pending', r.comment)}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg transition-colors text-white ${r.status === 'approved' ? 'bg-gray-600 hover:bg-gray-700' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {r.status === 'approved' ? <><XCircle className="w-3.5 h-3.5" /> Unapprove</> : <><CheckCircle className="w-3.5 h-3.5" /> Approve</>}
              </button>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────

function Section({ title, count, onRefresh, onExport, loading, error, children }: {
  title: string; count: number; onRefresh: () => void; onExport: () => void; loading: boolean; error: string; children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          {!loading && <p className="text-gray-400 text-sm mt-0.5">{count} total</p>}
        </div>
        <div className="flex gap-2">
          <button onClick={onExport} className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-sm rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button onClick={onRefresh} className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
          ⚠️ {error}
        </div>
      )}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-t-2 border-blue-500 rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Loading...</p>
          </div>
        </div>
      ) : children}
    </div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'newsletter', label: 'Newsletter',       icon: <Mail className="w-4 h-4" /> },
  { key: 'contact',    label: 'Contact',          icon: <MessageSquare className="w-4 h-4" /> },
  { key: 'volunteer',  label: 'Volunteers',       icon: <Users className="w-4 h-4" /> },
  { key: 'stories',    label: 'Success Stories',  icon: <Award className="w-4 h-4" /> },
  { key: 'feedback',   label: 'Feedback',         icon: <Star className="w-4 h-4" /> },
];

function AdminDashboard({ userEmail }: { userEmail: string }) {
  const [tab, setTab] = useState<TabKey>('newsletter');
  const [exporting, setExporting] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleExportAll = async () => {
    setExporting(true);
    try {
      await exportAllToExcel(userEmail);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 pt-8 pb-24">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-3 mb-8">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">Signed in as <span className="text-blue-400">{userEmail}</span></p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExportAll} variant="secondary" disabled={exporting}>
              <FileSpreadsheet className="w-4 h-4 mr-2 inline" />
              {exporting ? 'Building workbook…' : 'Export All to Excel'}
            </Button>
            <Button onClick={handleLogout} variant="secondary">Logout</Button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex flex-wrap gap-2 mb-8 bg-gray-900/80 p-2 rounded-xl border border-gray-800">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                tab === t.key
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
          {tab === 'newsletter' && <NewsletterTab userEmail={userEmail} />}
          {tab === 'contact'    && <ContactTab    userEmail={userEmail} />}
          {tab === 'volunteer'  && <VolunteerTab  userEmail={userEmail} />}
          {tab === 'stories'    && <StoriesTab    userEmail={userEmail} />}
          {tab === 'feedback'   && <FeedbackTab   userEmail={userEmail} />}
        </div>
      </div>
    </Layout>
  );
}

// ─── Login ────────────────────────────────────────────────────────────────────

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError('Invalid email or password. Please try again.');
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Bertie Foundation</h1>
          <p className="text-gray-400 mt-2">Admin Access</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
            <input
              id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
            <input
              id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function Admin() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (user && isAdmin) return <AdminDashboard userEmail={user.email || ''} />;
  return <Login />;
}
