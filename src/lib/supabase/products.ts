import { createClient } from '@/lib/supabase/server';
import type { Json, Product } from '@/types/database';

export type ProductRow = {
  id: string;
  name_en: string;
  name_ar: string;
  slug: string;
  price_retail: number;
  price_b2b: number | null;
  images: Json;
  brand: string | null;
  stock_quantity: number;
  is_featured: boolean;
};

export interface FetchProductsOptions {
  categorySlug?: string;
  brand?: string;
  sort?: string;
  q?: string;
  page?: number;
  priceMin?: number;
  priceMax?: number;
}

export const PER_PAGE = 12;

export async function fetchProducts(opts: FetchProductsOptions = {}): Promise<{
  products: ProductRow[];
  total: number;
}> {
  const { categorySlug, brand, sort, q, page = 1, priceMin, priceMax } = opts;

  try {
    const supabase = await createClient();

    let query = supabase
      .from('products')
      .select('id, name_en, name_ar, slug, price_retail, price_b2b, images, brand, stock_quantity, is_featured', { count: 'exact' })
      .eq('is_active', true);

    if (categorySlug) {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .maybeSingle() as { data: { id: string } | null };

      if (!cat) {
        // Category slug not found in DB → return empty result immediately
        return { products: [], total: 0 };
      }

      // Include the category itself + all its children
      const { data: children } = await supabase
        .from('categories')
        .select('id')
        .eq('parent_id', cat.id) as { data: { id: string }[] | null };

      const ids = [cat.id, ...(children ?? []).map((c) => c.id)];
      query = query.in('category_id', ids);
    }

    if (brand) query = query.eq('brand', brand);
    if (q) {
      const words = q.trim().split(/\s+/).filter(Boolean);
      for (const word of words) {
        const safe = word.replace(/'/g, "''");
        query = query.or(`name_en.ilike.%${safe}%,name_ar.ilike.%${safe}%,brand.ilike.%${safe}%`);
      }
    }
    if (priceMin !== undefined) query = query.gte('price_retail', priceMin);
    if (priceMax !== undefined) query = query.lte('price_retail', priceMax);

    switch (sort) {
      case 'price_asc':
        query = query.order('price_retail', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price_retail', { ascending: false });
        break;
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      default:
        query = query.order('is_featured', { ascending: false });
        break;
    }

    query = query.range((page - 1) * PER_PAGE, page * PER_PAGE - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    return { products: (data || []) as ProductRow[], total: count || 0 };
  } catch {
    return { products: [], total: 0 };
  }
}

/**
 * Checks stock availability for a list of items.
 * Returns an error string if any item is out of stock, null if all good.
 */
export async function checkStock(
  items: { id: string; quantity: number }[],
): Promise<string | null> {
  if (items.length === 0) return null;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('products')
      .select('id, name_en, stock_quantity')
      .in('id', items.map((i) => i.id)) as {
        data: { id: string; name_en: string; stock_quantity: number }[] | null;
      };
    for (const item of items) {
      const row = (data ?? []).find((r) => r.id === item.id);
      if (!row) return `Product not found`;
      if (row.stock_quantity < item.quantity)
        return `"${row.name_en}" only has ${row.stock_quantity} unit(s) left`;
    }
    return null;
  } catch {
    return null; // fail open — don't block checkout on DB error
  }
}

/**
 * Decrements stock for each item after a confirmed order.
 * Uses MAX(0, stock - qty) to avoid negative stock.
 */
export async function decrementStock(
  items: { id: string; quantity: number }[],
): Promise<void> {
  if (items.length === 0) return;
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rpc = (supabase as any).rpc.bind(supabase);
    await Promise.all(
      items.map((item) => rpc('decrement_stock', { p_product_id: item.id, p_quantity: item.quantity })),
    );
  } catch {
    // Non-blocking — stock sync can be corrected manually if needed
  }
}

/** Returns a map of { [productId]: price_retail } fetched from DB — never trust client prices. */
export async function fetchPriceMap(ids: string[]): Promise<Record<string, number>> {
  if (ids.length === 0) return {};
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('products')
      .select('id, price_retail')
      .eq('is_active', true)
      .in('id', ids) as { data: { id: string; price_retail: number }[] | null };
    const map: Record<string, number> = {};
    for (const row of data ?? []) map[row.id] = row.price_retail;
    return map;
  } catch {
    return {};
  }
}

export async function fetchProductsBySlugs(slugs: string[]): Promise<ProductRow[]> {
  if (slugs.length === 0) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('products')
      .select('id, name_en, name_ar, slug, price_retail, price_b2b, images, brand, stock_quantity, is_featured')
      .eq('is_active', true)
      .in('slug', slugs);
    return (data || []) as ProductRow[];
  } catch {
    return [];
  }
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle() as { data: Product | null };
    return data;
  } catch {
    return null;
  }
}

export async function fetchSimilarProducts(
  categoryId: string | null,
  excludeSlug: string,
): Promise<ProductRow[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from('products')
      .select('id, name_en, name_ar, slug, price_retail, price_b2b, images, brand, stock_quantity, is_featured')
      .eq('is_active', true)
      .neq('slug', excludeSlug)
      .limit(4);

    if (categoryId) query = query.eq('category_id', categoryId);

    const { data } = await query;
    return (data || []) as ProductRow[];
  } catch {
    return [];
  }
}

export async function fetchNewProducts(limit = 8): Promise<ProductRow[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('products')
      .select('id, name_en, name_ar, slug, price_retail, price_b2b, images, brand, stock_quantity, is_featured')
      .eq('is_active', true)
      .eq('is_new', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    return (data || []) as ProductRow[];
  } catch {
    return [];
  }
}

export async function fetchBrands(): Promise<string[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('products')
      .select('brand')
      .eq('is_active', true)
      .not('brand', 'is', null) as { data: { brand: string | null }[] | null };
    if (!data) return [];
    return [...new Set(data.map((p) => p.brand).filter(Boolean))].sort() as string[];
  } catch {
    return [];
  }
}
