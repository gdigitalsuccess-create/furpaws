import { createClient } from '@/lib/supabase/server';
import type { Json, Product } from '@/types/database';

export type ProductRow = {
  id: string;
  name_en: string;
  name_ar: string;
  slug: string;
  price_retail: number;
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
}

export const PER_PAGE = 12;

export async function fetchProducts(opts: FetchProductsOptions = {}): Promise<{
  products: ProductRow[];
  total: number;
}> {
  const { categorySlug, brand, sort, q, page = 1 } = opts;

  try {
    const supabase = await createClient();

    let query = supabase
      .from('products')
      .select('id, name_en, name_ar, slug, price_retail, images, brand, stock_quantity, is_featured', { count: 'exact' })
      .eq('is_active', true);

    if (categorySlug) {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .maybeSingle() as { data: { id: string } | null };

      if (cat) {
        // Fetch children of this category
        const { data: children } = await supabase
          .from('categories')
          .select('id')
          .eq('parent_id', cat.id) as { data: { id: string }[] | null };

        const ids = [cat.id, ...(children ?? []).map((c) => c.id)];
        query = query.in('category_id', ids);
      }
    }

    if (brand) query = query.eq('brand', brand);
    if (q) query = query.or(`name_en.ilike.%${q}%,name_ar.ilike.%${q}%`);

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
      .select('id, name_en, name_ar, slug, price_retail, images, brand, stock_quantity, is_featured')
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
      .select('id, name_en, name_ar, slug, price_retail, images, brand, stock_quantity, is_featured')
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
