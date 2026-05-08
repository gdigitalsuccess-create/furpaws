import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, getIp } from '@/lib/rateLimit';

type Row = { id: string; name_en: string; name_ar: string; slug: string; brand: string | null; images: unknown };

export async function GET(request: Request) {
  if (!rateLimit(`search:${getIp(request)}`, 30, 60_000)) {
    return NextResponse.json([], { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() ?? '';

  if (q.length < 2) return NextResponse.json([]);

  try {
    const supabase = await createClient();
    const words = q.split(/\s+/).filter(Boolean);

    // Build one OR condition per word, joined as AND by Supabase chaining
    const orConditions = words
      .map((w) => {
        const safe = w.replace(/'/g, "''");
        return `name_en.ilike.%${safe}%,name_ar.ilike.%${safe}%,brand.ilike.%${safe}%`;
      })
      .join(',');

    const { data } = await supabase
      .from('products')
      .select('id, name_en, name_ar, slug, images, brand')
      .eq('is_active', true)
      .or(orConditions)
      .limit(6) as { data: Row[] | null };

    const suggestions = (data ?? []).map((p) => ({
      id: p.id,
      name_en: p.name_en,
      name_ar: p.name_ar,
      slug: p.slug,
      brand: p.brand,
      image: Array.isArray(p.images) && typeof p.images[0] === 'string' ? (p.images[0] as string) : null,
    }));

    return NextResponse.json(suggestions);
  } catch {
    return NextResponse.json([]);
  }
}
