import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zubuqhdelzdujuwtcyzx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1YnVxaGRlbHpkdWp1d3RjeXp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1OTExNDUsImV4cCI6MjA5MjE2NzE0NX0.B5hB3VA8xtWoySj6765QjbtHpt6cCsa_hXOGUGZ0e6w';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
