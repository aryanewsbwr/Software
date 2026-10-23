import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn(
    'Supabase Admin client initialized without required environment variables: ' +
    'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in production.'
  );
}

export const supabaseAdmin = createClient(supabaseUrl || '', supabaseServiceRoleKey || '', {
  auth: {
    persistSession: false
  },
  global: {
    fetch: (url, options = {}) => {
      return fetch(url, {
        ...options,
        cache: 'no-store'
      });
    }
  }
});
