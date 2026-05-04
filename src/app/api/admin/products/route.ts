import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { assertAdmin } from '@/lib/assertAdmin';

async function findUniqueSlug(admin: ReturnType<typeof createAdminClient>, baseSlug: string): Promise<string> {
  const { data } = await admin
    .from('products')
    .select('slug')
    .ilike('slug', `${baseSlug}%`);

  const existing = new Set((data ?? []).map((r: { slug: string }) => r.slug));
  if (!existing.has(baseSlug)) return baseSlug;

  let i = 2;
  while (existing.has(`${baseSlug}-${i}`)) i++;
  return `${baseSlug}-${i}`;
}

export async function POST(request: Request) {
  if (!await assertAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json() as Record<string, unknown>;
    const admin = createAdminClient();

    if (typeof body.slug === 'string') {
      body.slug = await findUniqueSlug(admin, body.slug);
    }

    const { data, error } = await admin
      .from('products')
      .insert(body as never)
      .select('id, slug')
      .single() as { data: { id: string; slug: string } | null; error: unknown };

    if (error) return NextResponse.json({ error: (error as { message: string }).message }, { status: 500 });
    return NextResponse.json({ id: (data as { id: string; slug: string }).id, slug: (data as { id: string; slug: string }).slug });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
