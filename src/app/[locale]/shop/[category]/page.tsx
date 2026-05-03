import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchProducts, fetchBrands } from '@/lib/supabase/products';
import ShopView from '@/components/shop/ShopView';

const VALID_CATEGORIES = ['dogs', 'cats', 'small-animals', 'veterinary', 'brands'];

const CATEGORY_LABELS: Record<string, { en: string; ar: string }> = {
  dogs:          { en: 'Dog Accessories',         ar: 'مستلزمات الكلاب' },
  cats:          { en: 'Cat Accessories',         ar: 'مستلزمات القطط' },
  'small-animals': { en: 'Small Animals',         ar: 'الحيوانات الصغيرة' },
  veterinary:    { en: 'Veterinary Products',     ar: 'المنتجات البيطرية' },
  brands:        { en: 'Shop by Brand',           ar: 'تسوق حسب الماركة' },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string; category: string }> }): Promise<Metadata> {
  const { locale, category } = await params;
  const isAr = locale === 'ar';
  const label = CATEGORY_LABELS[category];
  if (!label) return {};
  const title = isAr ? label.ar : label.en;
  return {
    title,
    description: isAr
      ? `تسوق ${label.ar} بأفضل الأسعار في الإمارات.`
      : `Shop ${label.en} at the best prices in UAE. Free shipping over 250 AED.`,
    alternates: { canonical: `https://furpaws.ae/${locale}/shop/${category}` },
    openGraph: { url: `https://furpaws.ae/${locale}/shop/${category}` },
  };
}

interface PageProps {
  params: Promise<{ locale: string; category: string }>;
  searchParams: Promise<{
    brand?: string;
    sort?: string;
    q?: string;
    page?: string;
  }>;
}

export default async function CategoryShopPage({ params, searchParams }: PageProps) {
  const { locale, category } = await params;

  if (!VALID_CATEGORIES.includes(category)) {
    notFound();
  }

  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1);

  // For "brands" category show all products (brand browsing handled by filter)
  const categorySlug = category === 'brands' ? undefined : category;

  const [{ products, total }, brands] = await Promise.all([
    fetchProducts({
      categorySlug,
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
      categorySlug={category}
      currentSort={sp.sort}
      currentBrand={sp.brand}
      currentQ={sp.q}
      currentPage={page}
    />
  );
}
