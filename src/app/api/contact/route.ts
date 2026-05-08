import { NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit, getIp } from '@/lib/rateLimit';
import { sendContactEmail } from '@/lib/email';

const schema = z.object({
  name:    z.string().min(1).max(100),
  email:   z.string().email().max(200),
  subject: z.string().max(200).optional(),
  message: z.string().min(1).max(2000),
});

export async function POST(request: Request) {
  if (!rateLimit(`contact:${getIp(request)}`, 5, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }

  try {
    await sendContactEmail(parsed.data);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
