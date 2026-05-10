import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { assertAdmin } from '@/lib/assertAdmin';
import { sendBackInStockEmail } from '@/lib/email';

const productUpdateSchema = z.object({
  name_en:        z.string().min(1).max(200).optional(),
  name_ar:        z.string().min(1).max(200).optional(),
  slug:           z.string().min(1).max(200).regex(/^[a-z0-9-]+$/).optional(),
  description_en: z.string().max(5000).nullable().optional(),
  description_ar: z.string().max(5000).nullable().optional(),
  price_retail:   z.number().positive().optional(),
  price_b2b:      z.number().positive().nullable().optional(),
  stock_quantity: z.number().int().min(0).optional(),
  category_id:    z.string().uuid().nullable().optional(),
  brand:          z.string().max(100).nullable().optional(),
  images:         z.array(z.string().url()).optional(),
  is_active:      z.boolean().optional(),
  is_featured:    z.boolean().optional(),
  is_new:         z.boolean().optional(),
  specs:          z.record(z.string(), z.string()).nullable().optional(),
  variants:       z.unknown().optional(),
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await assertAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const parsed = productUpdateSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    const body = parsed.data;
    const admin = createAdminClient();

    // Check previous stock before update
    const { data: before } = await admin
      .from('products')
      .select('stock_quantity, name_en, slug')
      .eq('id', id)
      .single() as { data: { stock_quantity: number; name_en: string; slug: string } | null };

    const { error } = await admin.from('products').update(body as never).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Trigger back-in-stock emails if stock went from 0 to >0
    const newStock = Number(body.stock_quantity ?? -1);
    const oldStock = Number(before?.stock_quantity ?? -1);

    console.log('[stock-notify] before:', oldStock, '→ after:', newStock, '| product:', id);

    if (before && oldStock === 0 && newStock > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = admin as any;
      const { data: subs, error: subError } = await db
        .from('stock_notifications')
        .select('id, email')
        .eq('product_id', id)
        .is('notified_at', null);

      console.log('[stock-notify] subs found:', subs?.length ?? 0, '| error:', subError?.message);

      if (subs && subs.length > 0) {
        const productUrl = `${process.env.NEXT_PUBLIC_APP_URL}/en/products/${before.slug}`;
        const results = await Promise.allSettled(
          subs.map((s: { id: string; email: string }) => sendBackInStockEmail(s.email, before.name_en, productUrl))
        );
        results.forEach((r, i) => {
          if (r.status === 'rejected') console.error('[stock-notify] email failed for sub', subs[i].email, r.reason);
          else console.log('[stock-notify] email sent to', subs[i].email);
        });

        await db
          .from('stock_notifications')
          .update({ notified_at: new Date().toISOString() })
          .in('id', subs.map((s: { id: string }) => s.id));
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await assertAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const admin = createAdminClient();
    const { error } = await admin.from('products').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
