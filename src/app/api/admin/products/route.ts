import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { assertAdmin } from '@/lib/assertAdmin';

const productSchema = z.object({
  name_en:        z.string().min(1).max(200),
  name_ar:        z.string().max(200).optional(),
  slug:           z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  description_en: z.string().max(5000).optional(),
  description_ar: z.string().max(5000).optional(),
  price_retail:   z.number().positive(),
  price_b2b:      z.number().positive().nullable().optional(),
  stock_quantity: z.number().int().min(0),
  category_id:    z.string().uuid().nullable().optional(),
  brand:          z.string().max(100).nullable().optional(),
  images:         z.array(z.string().url()).optional(),
  is_active:      z.boolean().optional(),
  is_featured:    z.boolean().optional(),
  is_new:         z.boolean().optional(),
  specs:          z.record(z.string(), z.string()).nullable().optional(),
  variants:       z.unknown().optional(),
});

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
    const body = await request.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const admin = createAdminClient();
    const data = {
      ...parsed.data,
      slug: await findUniqueSlug(admin, parsed.data.slug),
      name_ar: parsed.data.name_ar || parsed.data.name_en,
      description_ar: parsed.data.description_ar || parsed.data.description_en || null,
    };

    const { data: row, error } = await admin
      .from('products')
      .insert(data as never)
      .select('id, slug')
      .single() as { data: { id: string; slug: string } | null; error: unknown };

    if (error) return NextResponse.json({ error: (error as { message: string }).message }, { status: 500 });
    return NextResponse.json({ id: row!.id, slug: row!.slug });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
