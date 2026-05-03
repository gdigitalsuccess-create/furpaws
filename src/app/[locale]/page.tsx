import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';
  return {
    title: isAr ? 'فيرباوز — مستلزمات الحيوانات الأليفة في الإمارات' : 'FURPAWS — Premium Pet Accessories UAE',
    description: isAr
      ? 'تسوق أفضل مستلزمات الحيوانات الأليفة في الشارقة والإمارات. منتجات فاخرة للكلاب والقطط والحيوانات الصغيرة.'
      : 'Shop premium pet accessories in Sharjah & UAE. Quality products for dogs, cats and small animals with free shipping over 250 AED.',
    alternates: {
      canonical: `https://furpaws.ae/${locale}`,
      languages: { en: 'https://furpaws.ae/en', ar: 'https://furpaws.ae/ar' },
    },
    openGraph: {
      title: isAr ? 'فيرباوز — مستلزمات الحيوانات الأليفة' : 'FURPAWS — Pet Accessories UAE',
      description: isAr
        ? 'منتجات فاخرة للحيوانات الأليفة في الإمارات'
        : 'Premium pet accessories in Sharjah & UAE',
      url: `https://furpaws.ae/${locale}`,
      locale: isAr ? 'ar_AE' : 'en_AE',
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

  return (
    <>
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
