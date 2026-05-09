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
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://furpaws-uae.com';
  const title = isAr ? label.ar : label.en;
  const description = isAr
    ? `تسوق ${label.ar} بأفضل الأسعار في الإمارات. شحن مجاني فوق 250 درهم.`
    : `Shop ${label.en} at the best prices in UAE. Free shipping over 250 AED.`;
  return {
    title,
    description,
    alternates: { canonical: `${base}/${locale}/shop/${category}` },
    openGraph: {
      url: `${base}/${locale}/shop/${category}`,
      locale: isAr ? 'ar_AE' : 'en_AE',
      description,
      images: [{ url: '/hero.jpg', width: 1200, height: 630, alt: title }],
    },
  };
}

interface PageProps {
  params: Promise<{ locale: string; category: string }>;
  searchParams: Promise<{
    brand?: string;
    sort?: string;
    q?: string;
    page?: string;
    price_min?: string;
    price_max?: string;
    sub?: string;
  }>;
}

export default async function CategoryShopPage({ params, searchParams }: PageProps) {
  const { locale, category } = await params;

  if (!VALID_CATEGORIES.includes(category)) {
    notFound();
  }

  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1);

  // ?sub=grooming filters by subcategory slug; otherwise use parent category
  const categorySlug = sp.sub ?? (category === 'brands' ? undefined : category);

  const priceMin = sp.price_min ? Number(sp.price_min) : undefined;
  const priceMax = sp.price_max ? Number(sp.price_max) : undefined;

  const [{ products, total }, brands] = await Promise.all([
    fetchProducts({ categorySlug, brand: sp.brand, sort: sp.sort, q: sp.q, page, priceMin, priceMax }),
    fetchBrands(),
  ]);

  return (
    <ShopView
      products={products}
      total={total}
      brands={brands}
      locale={locale}
      categorySlug={category}
      currentSub={sp.sub}
      currentSort={sp.sort}
      currentBrand={sp.brand}
      currentQ={sp.q}
      currentPriceMin={priceMin}
      currentPriceMax={priceMax}
      currentPage={page}
    />
  );
}
