import { createBrowserClient } from '@supabase/ssr';

// Read from environment variables, or use configured project credentials
const supabaseUrl = 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  'https://udfzxkxcmoinbetuzfag.supabase.co';

const supabaseAnonKey = 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkZnp4a3hjbW9pbmJldHV6ZmFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5NjI5ODEsImV4cCI6MjEwMTUzODk4MX0.QZX7xPEF941Lbp4aAVUZyA7hna-CjXzkXPgIrjFdGVA';

export const createClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        onAuthStateChange: (_event: any, _callback: any) => ({
          data: { subscription: { unsubscribe: () => {} } },
        }),
        signUp: async () => ({ data: { user: null, session: null }, error: { message: 'Supabase credentials not configured' } }),
        signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: 'Supabase credentials not configured' } }),
        signInWithOAuth: async () => ({ data: { url: null, provider: null }, error: { message: 'Supabase credentials not configured' } }),
        signOut: async () => ({ error: null }),
      },
    } as any;
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};
