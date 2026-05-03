import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ChevronRight, Tag } from 'lucide-react';
import { fetchProductBySlug } from '@/lib/supabase/products';
import { fetchProductReviews } from '@/lib/supabase/reviews';
import { createClient } from '@/lib/supabase/server';
import ProductGallery from '@/components/product/ProductGallery';
import ProductBuySection from '@/components/product/ProductBuySection';
import type { Variant } from '@/components/product/ProductBuySection';
import SimilarProducts from '@/components/product/SimilarProducts';
import ReviewsSection from '@/components/product/ReviewsSection';
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

  return {
    title: name,
    description,
    alternates: { canonical: `https://furpaws.ae/${locale}/products/${slug}` },
    openGraph: {
      title: `${name} | FURPAWS`,
      description,
      url: `https://furpaws.ae/${locale}/products/${slug}`,
      type: 'website',
      images: images.length > 0 ? [{ url: images[0], alt: name }] : [],
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

  const reviews = await fetchProductReviews(product.id);
  const name = locale === 'ar' ? product.name_ar : product.name_en;
  const description = locale === 'ar' ? product.description_ar : product.description_en;
  const images = getImages(product.images);
  const specs = getSpecs(product.specs);
  const variants = getVariants(product.variants);
  const inStock = product.stock_quantity > 0;

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
      url: `https://furpaws.ae/en/products/${product.slug}`,
      seller: { '@type': 'Organization', name: 'FURPAWS' },
    },
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

          {/* Price + Variants + Add to cart */}
          <ProductBuySection
            productId={product.id}
            nameEn={product.name_en}
            nameAr={product.name_ar}
            slug={product.slug}
            basePrice={product.price_retail}
            baseStock={product.stock_quantity}
            firstImage={images[0] ?? ''}
            variants={variants}
          />

          <div className="my-1 h-px bg-fur-border" />

          {/* Description */}
          {description && (
            <div>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-text-muted">
                {t('description')}
              </h2>
              <p className="text-sm leading-relaxed text-text-dark whitespace-pre-line">
                {description}
              </p>
            </div>
          )}

          {/* Specifications */}
          {specs && Object.keys(specs).length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
                {t('specifications')}
              </h2>
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(specs).map(([key, val]) => (
                    <tr key={key} className="border-b border-fur-border last:border-0">
                      <td className="py-2 pr-4 font-medium text-text-muted w-1/3">{key}</td>
                      <td className="py-2 text-text-dark">{String(val)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <ReviewsSection
        reviews={reviews}
        productId={product.id}
        isLoggedIn={!!user}
        locale={locale}
      />

      {/* Similar products */}
      <SimilarProducts categoryId={product.category_id} excludeSlug={slug} locale={locale} />
    </div>
    </>
  );
}
