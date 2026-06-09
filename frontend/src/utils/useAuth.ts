import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';

// ─── Admin Access List ────────────────────────────────────────────────────────
// All three emails have admin access. Activity is logged for all of them.
const ADMIN_EMAILS = [
  'msleespark@gmail.com',
  'ai.agent.lamar@gmail.com',
  // ← Add the third admin's email here when account is created in Supabase Auth
  // 'thirdadmin@example.com',
];

// ─── Notification Recipients ──────────────────────────────────────────────────
// These two emails always receive deletion alert emails (via Supabase Edge Function).
export const ALERT_RECIPIENTS = [
  'msleespark@gmail.com',
  'ai.agent.lamar@gmail.com',
];

// ─── Activity Logger ──────────────────────────────────────────────────────────
// Call this anywhere in admin components when a meaningful action occurs.
// It writes a row to the `admin_activity_log` table in Supabase.
export async function logAdminActivity({
  action,
  table_name,
  record_id,
  details,
  user_email,
}: {
  action: 'delete' | 'approve' | 'reject' | 'unapprove' | 'publish' | 'view' | 'export';
  table_name: string;
  record_id?: string;
  details?: string;
  user_email: string;
}) {
  await supabase.from('admin_activity_log').insert({
    action,
    table_name,
    record_id: record_id ?? null,
    details: details ?? null,
    performed_by: user_email,
    performed_at: new Date().toISOString(),
  });

  // For destructive actions, also trigger the email alert Edge Function
  if (action === 'delete') {
    await supabase.functions.invoke('send-admin-alert', {
      body: {
        action,
        table_name,
        record_id,
        details,
        performed_by: user_email,
        alert_recipients: ALERT_RECIPIENTS,
      },
    });
  }
}

// ─── useAuth Hook ─────────────────────────────────────────────────────────────
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const isAdmin = user ? ADMIN_EMAILS.includes(user.email || '') : false;

  return { user, isAdmin, loading };
}
