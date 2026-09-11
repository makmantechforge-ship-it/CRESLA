import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';

  if (code) {
    const cookieStore = await cookies();
    const supabaseUrl = 
      process.env.NEXT_PUBLIC_SUPABASE_URL || 
      'https://udfzxkxcmoinbetuzfag.supabase.co';

    const supabaseAnonKey = 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkZnp4a3hjbW9pbmJldHV6ZmFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5NjI5ODEsImV4cCI6MjEwMTUzODk4MX0.QZX7xPEF941Lbp4aAVUZyA7hna-CjXzkXPgIrjFdGVA';

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {
              // Server component / route handler edge case
            }
          },
        },
      });

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(new URL(next, request.url));
      }
    }
  }

  // Return the user to an error page or login with instructions
  return NextResponse.redirect(new URL('/auth/login?error=auth-failed', request.url));
}
