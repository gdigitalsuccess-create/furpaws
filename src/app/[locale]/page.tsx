import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://furpaws-uae.com';
  return {
    title: isAr ? 'فيرباوز — مستلزمات الحيوانات الأليفة في الإمارات' : 'FURPAWS — Premium Pet Accessories UAE',
    description: isAr
      ? 'تسوق أفضل مستلزمات الحيوانات الأليفة في الشارقة والإمارات. منتجات فاخرة للكلاب والقطط والحيوانات الصغيرة.'
      : 'Shop premium pet accessories in Sharjah & UAE. Quality products for dogs, cats and small animals with free shipping over 250 AED.',
    alternates: {
      canonical: `${base}/${locale}`,
      languages: { en: `${base}/en`, ar: `${base}/ar` },
    },
    openGraph: {
      title: isAr ? 'فيرباوز — مستلزمات الحيوانات الأليفة' : 'FURPAWS — Pet Accessories UAE',
      description: isAr
        ? 'منتجات فاخرة للحيوانات الأليفة في الإمارات'
        : 'Premium pet accessories in Sharjah & UAE',
      url: `${base}/${locale}`,
      locale: isAr ? 'ar_AE' : 'en_AE',
      images: [{ url: '/hero.jpg', width: 1200, height: 630, alt: 'FURPAWS' }],
    },
  };
}
import HeroSection from '@/components/home/HeroSection';
import CategoriesSection from '@/components/home/CategoriesSection';
import NewArrivalsSection from '@/components/home/NewArrivalsSection';
import PromoSlider from '@/components/home/PromoSlider';
import BestsellersSection from '@/components/home/BestsellersSection';
import TrustSection from '@/components/home/TrustSection';
import B2BSection from '@/components/home/B2BSection';
import BrandsSection from '@/components/home/BrandsSection';
import NewsletterSection from '@/components/home/NewsletterSection';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);

  const siteBase = process.env.NEXT_PUBLIC_APP_URL ?? 'https://furpaws-uae.com';
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'FURPAWS',
    url: siteBase,
    logo: `${siteBase}/logo.png`,
    description: 'Premium pet accessories distributor in Sharjah, UAE.',
    address: { '@type': 'PostalAddress', addressCountry: 'AE', addressLocality: 'Sharjah' },
    sameAs: ['https://www.instagram.com/furpaws_ae'],
  };
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'FURPAWS',
    url: siteBase,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${siteBase}/en/shop?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <HeroSection />
      <CategoriesSection locale={locale} />
      <NewArrivalsSection locale={locale} />
      <PromoSlider />
      <BestsellersSection locale={locale} />
      <PromoSlider variant="bottom" />
      <BrandsSection locale={locale} />
      <TrustSection locale={locale} />
      <B2BSection locale={locale} />
      <NewsletterSection />
    </>
  );
}
