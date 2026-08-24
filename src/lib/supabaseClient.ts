import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mekibdmvpkkujqpfqwyt.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_RSAj2n6JVAg9X6P8UFyTDA_AvhjlwDX';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
