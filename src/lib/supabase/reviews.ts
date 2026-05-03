import { createClient } from '@/lib/supabase/server';

export type RatingInfo = { avg: number; count: number };

export type ReviewRow = {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export async function fetchRatingsMap(productIds: string[]): Promise<Record<string, RatingInfo>> {
  if (productIds.length === 0) return {};
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('reviews')
      .select('product_id, rating')
      .in('product_id', productIds)
      .eq('is_approved', true) as { data: { product_id: string; rating: number }[] | null };

    const map: Record<string, { sum: number; count: number }> = {};
    for (const r of data ?? []) {
      if (!map[r.product_id]) map[r.product_id] = { sum: 0, count: 0 };
      map[r.product_id].sum += r.rating;
      map[r.product_id].count++;
    }
    const result: Record<string, RatingInfo> = {};
    for (const id in map) {
      result[id] = {
        avg: Math.round((map[id].sum / map[id].count) * 10) / 10,
        count: map[id].count,
      };
    }
    return result;
  } catch {
    return {};
  }
}

export async function fetchProductReviews(productId: string): Promise<ReviewRow[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('reviews')
      .select('id, user_id, rating, comment, created_at')
      .eq('product_id', productId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) console.error('fetchProductReviews error:', error);
    return (data ?? []) as ReviewRow[];
  } catch (e) {
    console.error('fetchProductReviews exception:', e);
    return [];
  }
}
