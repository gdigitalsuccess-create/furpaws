import { Heart } from 'lucide-react';
import { fetchProductsBySlugs } from '@/lib/supabase/products';
import SharedWishlistClient from '@/components/wishlist/SharedWishlistClient';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ s?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { s } = await searchParams;
  const count = s ? s.split(',').filter(Boolean).length : 0;
  return {
    title: `Shared Wishlist (${count} items) | FURPAWS`,
    robots: { index: false, follow: false },
  };
}

export default async function SharedWishlistPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { s } = await searchParams;
  const isAr = locale === 'ar';

  const slugs = (s ?? '')
    .split(',')
    .map((sl) => sl.trim())
    .filter(Boolean)
    .slice(0, 50); // max 50 produits

  const products = await fetchProductsBySlugs(slugs);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-light">
          <Heart className="h-5 w-5 fill-pink-primary text-pink-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-dark md:text-3xl">
            {isAr ? 'قائمة مفضلة مشتركة' : 'Shared Wishlist'}
          </h1>
          <p className="text-sm text-text-muted">
            {products.length}{' '}
            {isAr ? 'منتج' : products.length === 1 ? 'item' : 'items'}
          </p>
        </div>
      </div>

      <SharedWishlistClient products={products} />
    </div>
  );
}
