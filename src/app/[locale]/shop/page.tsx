import type { Metadata } from 'next';
import { fetchProducts, fetchBrands } from '@/lib/supabase/products';
import ShopView from '@/components/shop/ShopView';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://furpaws-uae.com';
  const description = isAr
    ? 'تصفح كامل مجموعة مستلزمات الحيوانات الأليفة — كلاب، قطط، حيوانات صغيرة وأدوات بيطرية.'
    : 'Browse our full range of pet accessories — dogs, cats, small animals and veterinary products.';
  return {
    title: isAr ? 'جميع المنتجات' : 'Shop All Products',
    description,
    alternates: { canonical: `${base}/${locale}/shop` },
    openGraph: {
      url: `${base}/${locale}/shop`,
      locale: isAr ? 'ar_AE' : 'en_AE',
      description,
      images: [{ url: '/hero.jpg', width: 1200, height: 630, alt: 'FURPAWS Shop' }],
    },
  };
}

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    brand?: string;
    sort?: string;
    q?: string;
    page?: string;
    price_min?: string;
    price_max?: string;
  }>;
}

export default async function ShopPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1);

  const priceMin = sp.price_min ? Number(sp.price_min) : undefined;
  const priceMax = sp.price_max ? Number(sp.price_max) : undefined;

  const [{ products, total }, brands] = await Promise.all([
    fetchProducts({ brand: sp.brand, sort: sp.sort, q: sp.q, page, priceMin, priceMax }),
    fetchBrands(),
  ]);

  return (
    <ShopView
      products={products}
      total={total}
      brands={brands}
      locale={locale}
      currentSort={sp.sort}
      currentBrand={sp.brand}
      currentQ={sp.q}
      currentPriceMin={priceMin}
      currentPriceMax={priceMax}
      currentPage={page}
    />
  );
}
