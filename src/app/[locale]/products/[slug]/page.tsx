import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ChevronRight, Tag } from 'lucide-react';
import { fetchProductBySlug } from '@/lib/supabase/products';
import { fetchProductReviews } from '@/lib/supabase/reviews';
import { createClient } from '@/lib/supabase/server';
import { getDisplayPrice } from '@/lib/pricing';
import type { UserRole } from '@/types/database';
import ProductGallery from '@/components/product/ProductGallery';
import ProductBuySection from '@/components/product/ProductBuySection';
import ShareButtons from '@/components/product/ShareButtons';
import BackInStockForm from '@/components/product/BackInStockForm';
import RecentlyViewedSection from '@/components/product/RecentlyViewedSection';
import ProductTabs from '@/components/product/ProductTabs';
import type { Variant } from '@/components/product/ProductBuySection';
import SimilarProducts from '@/components/product/SimilarProducts';
import FrequentlyBoughtTogether from '@/components/product/FrequentlyBoughtTogether';
import type { Metadata } from 'next';
import type { Json } from '@/types/database';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) return {};

  const images = getImages(product.images);
  const isAr = locale === 'ar';
  const name = isAr ? product.name_ar : product.name_en;
  const description = (isAr ? product.description_ar : product.description_en)
    ?? `Buy ${product.name_en} at FURPAWS — Premium Pet Accessories UAE`;

  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://furpaws-uae.com';
  return {
    title: name,
    description,
    alternates: { canonical: `${base}/${locale}/products/${slug}` },
    openGraph: {
      title: `${name} | FURPAWS`,
      description,
      url: `${base}/${locale}/products/${slug}`,
      type: 'website',
      locale: isAr ? 'ar_AE' : 'en_AE',
      images: images.length > 0 ? [{ url: images[0], width: 800, height: 800, alt: name ?? undefined }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} | FURPAWS`,
      description,
      images: images.length > 0 ? [images[0]] : [],
    },
  };
}

function getImages(images: Json): string[] {
  if (!Array.isArray(images)) return [];
  return images.filter((img): img is string => typeof img === 'string');
}

function getSpecs(specs: Json): Record<string, string> | null {
  if (!specs || typeof specs !== 'object' || Array.isArray(specs)) return null;
  return specs as Record<string, string>;
}

function getVariants(raw: Json): Variant[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (v): v is Variant =>
      typeof v === 'object' && v !== null &&
      typeof (v as Variant).name === 'string' &&
      typeof (v as Variant).price === 'number' &&
      typeof (v as Variant).stock === 'number'
  );
}

export default async function ProductPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const supabase = await createClient();
  const [product, t, { data: { user } }] = await Promise.all([
    fetchProductBySlug(slug),
    getTranslations({ locale, namespace: 'product' }),
    supabase.auth.getUser(),
  ]);

  if (!product) notFound();

  let userRole: UserRole = 'guest';
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single() as { data: { role: UserRole } | null };
    userRole = profile?.role ?? 'customer';
  }
  const basePrice = getDisplayPrice(product.price_retail, product.price_b2b, userRole);

  const reviews = await fetchProductReviews(product.id);
  const name = locale === 'ar' ? (product.name_ar || product.name_en) : product.name_en;
  const description = locale === 'ar' ? (product.description_ar || product.description_en) : product.description_en;
  const images = getImages(product.images);
  const specs = getSpecs(product.specs);
  const variants = getVariants(product.variants);
  const inStock = product.stock_quantity > 0;

  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://furpaws-uae.com';
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name_en,
    description: product.description_en ?? undefined,
    image: images,
    sku: product.id.slice(0, 8).toUpperCase(),
    brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
    offers: {
      '@type': 'Offer',
      price: product.price_retail,
      priceCurrency: 'AED',
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${base}/en/products/${product.slug}`,
      seller: { '@type': 'Organization', name: 'FURPAWS' },
      itemCondition: 'https://schema.org/NewCondition',
    },
    ...(avgRating !== null && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: avgRating.toFixed(1),
        reviewCount: reviews.length,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <div className="container mx-auto px-4 py-8">

      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-text-muted flex-wrap">
        <Link href="/" className="hover:text-pink-primary transition-colors">
          {locale === 'ar' ? 'الرئيسية' : 'Home'}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 rtl:rotate-180" />
        <Link href="/shop" className="hover:text-pink-primary transition-colors">
          {locale === 'ar' ? 'المتجر' : 'Shop'}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 rtl:rotate-180" />
        <span className="text-text-dark font-medium truncate max-w-[200px]">{name}</span>
      </nav>

      {/* Main layout */}
      <div className="grid gap-8 md:grid-cols-2 lg:gap-12">

        {/* Gallery */}
        <ProductGallery images={images} alt={name} />

        {/* Info */}
        <div className="flex flex-col gap-5">

          {/* Brand + SKU */}
          <div className="flex items-center gap-2 flex-wrap">
            {product.brand && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-pink-light px-3 py-1 text-xs font-semibold text-pink-primary">
                <Tag className="h-3 w-3" />
                {product.brand}
              </span>
            )}
            <span className="text-xs text-text-muted">
              {t('sku')}: {product.id.slice(0, 8).toUpperCase()}
            </span>
          </div>

          {/* Name */}
          <h1 className="text-2xl font-bold leading-snug text-text-dark md:text-3xl">
            {name}
          </h1>

          <div className="my-1 h-px bg-fur-border" />

          {/* B2B wholesale badge */}
          {(userRole === 'b2b' || userRole === 'admin') && product.price_b2b !== null && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              ✓ {locale === 'ar' ? 'سعر الجملة مُفعَّل' : 'Wholesale Price Active'}
            </div>
          )}

          {/* Price + Variants + Add to cart */}
          <ProductBuySection
            productId={product.id}
            nameEn={product.name_en}
            nameAr={product.name_ar}
            slug={product.slug}
            basePrice={basePrice}
            baseStock={product.stock_quantity}
            firstImage={images[0] ?? ''}
            variants={variants}
            sizeLabel={
              specs
                ? (specs['Size'] ?? specs['size'] ?? specs['Weight'] ?? specs['weight'] ?? specs['Taille'] ?? specs['Poids'] ?? null)
                : null
            }
            retailPrice={product.price_retail}
            isB2B={(userRole === 'b2b' || userRole === 'admin') && product.price_b2b !== null}
          />

          {/* Back in stock */}
          {!inStock && (
            <BackInStockForm productId={product.id} locale={locale} />
          )}

          <div className="my-1 h-px bg-fur-border" />

          {/* Share */}
          <ShareButtons
            name={name}
            url={`https://furpaws.vercel.app/${locale}/products/${product.slug}`}
            locale={locale}
          />
        </div>
      </div>

      {/* Frequently Bought Together */}
      {inStock && (
        <div className="mt-10">
          <FrequentlyBoughtTogether
            categoryId={product.category_id}
            currentProduct={product}
            locale={locale}
            userRole={userRole}
          />
        </div>
      )}

      {/* Tabs: Description / Specifications / Reviews */}
      <ProductTabs
        description={description ?? null}
        specs={specs}
        reviews={reviews}
        productId={product.id}
        isLoggedIn={!!user}
        locale={locale}
      />

      {/* Similar products */}
      <SimilarProducts categoryId={product.category_id} excludeSlug={slug} locale={locale} userRole={userRole} />

      {/* Recently viewed */}
      <RecentlyViewedSection
        current={{
          id: product.id,
          name_en: product.name_en,
          name_ar: product.name_ar,
          slug: product.slug,
          price_retail: product.price_retail,
          price_b2b: product.price_b2b,
          images: images,
          brand: product.brand ?? null,
          stock_quantity: product.stock_quantity,
        }}
        userRole={userRole}
      />
    </div>
    </>
  );
}
