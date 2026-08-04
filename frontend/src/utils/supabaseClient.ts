import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://msuqflssqixsplcearxr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zdXFmbHNzcWl4c3BsY2VhcnhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMzU3NDgsImV4cCI6MjA4OTcxMTc0OH0.BlrDiIu2YdDB7oHJ0fFiSEiBDQGvHCFAUaysR6O24zk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
