import type { Metadata } from 'next';
import { fetchProducts, fetchBrands } from '@/lib/supabase/products';
import ShopView from '@/components/shop/ShopView';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';
  return {
    title: isAr ? 'جميع المنتجات' : 'Shop All Products',
    description: isAr
      ? 'تصفح كامل مجموعة مستلزمات الحيوانات الأليفة — كلاب، قطط، حيوانات صغيرة وأدوات بيطرية.'
      : 'Browse our full range of pet accessories — dogs, cats, small animals and veterinary products.',
    alternates: { canonical: `https://furpaws.ae/${locale}/shop` },
    openGraph: { url: `https://furpaws.ae/${locale}/shop` },
  };
}

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    brand?: string;
    sort?: string;
    q?: string;
    page?: string;
  }>;
}

export default async function ShopPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1);

  const [{ products, total }, brands] = await Promise.all([
    fetchProducts({
      brand: sp.brand,
      sort: sp.sort,
      q: sp.q,
      page,
    }),
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
      currentPage={page}
    />
  );
}
