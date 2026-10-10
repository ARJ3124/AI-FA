import { createClient } from '@supabase/supabase-js';

// These are safe to expose — Supabase Row Level Security enforces data isolation.
// The anon key only allows what RLS policies permit.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    '[FinFlow] Supabase env vars missing. ' +
    'Create finflow-app/.env with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}

export const supabase = createClient(SUPABASE_URL ?? '', SUPABASE_ANON_KEY ?? '');
