import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';
import { rateLimit, getIp } from '@/lib/rateLimit';

const schema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  if (!rateLimit(`newsletter:${getIp(request)}`, 5, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from('newsletter_subscribers')
      .upsert({ email: parsed.data.email, is_active: true } as never, {
        onConflict: 'email',
        ignoreDuplicates: false,
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
