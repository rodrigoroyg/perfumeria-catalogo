import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rtchsualyoxvlxqbydhh.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_C4Jf5YOyyK--u8SCgGCAYw_MDS4r9t-';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
