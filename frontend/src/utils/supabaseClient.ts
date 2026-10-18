import { createClient } from '@supabase/supabase-js';

// Which Supabase project the website talks to.
// Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel (Settings → Environment Variables)
// to point the site at Bertie's own project; until they are set, the current project is used.
// Both values are public by design: Supabase's row level security is what protects the data.
const FALLBACK_URL = 'https://msuqflssqixsplcearxr.supabase.co';
const FALLBACK_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zdXFmbHNzcWl4c3BsY2VhcnhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMzU3NDgsImV4cCI6MjA4OTcxMTc0OH0.BlrDiIu2YdDB7oHJ0fFiSEiBDQGvHCFAUaysR6O24zk';

export const SUPABASE_URL: string = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() || FALLBACK_URL;
export const SUPABASE_ANON_KEY: string = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() || FALLBACK_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
