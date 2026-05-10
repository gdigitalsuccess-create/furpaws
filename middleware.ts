import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { routing } from './src/i18n/routing';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Admin routes — server-side role check, no locale prefix
  if (pathname.startsWith('/admin')) {
    // Login page is publicly accessible — skip auth check
    if (pathname === '/admin/login') {
      return NextResponse.next({ request });
    }

    const response = NextResponse.next({ request });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value);
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login?unauthorized=1', request.url));
    }

    return response;
  }

  // All other routes go through next-intl locale middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Skip Next.js internals, API routes and all static files
    '/((?!_next|_vercel|api|.*\\.[^/]+$).*)',
    '/',
  ],
};
