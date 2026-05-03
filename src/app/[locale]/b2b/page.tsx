import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { PawPrint, Tag, Package, HeadphonesIcon, Truck, CheckCircle2 } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'B2B Wholesale' };

interface PageProps { params: Promise<{ locale: string }> }
export default async function B2BLandingPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'b2b' });

  const benefits = [
    { icon: Tag,             title: t('benefit_pricing'),  desc: t('benefit_pricing_desc') },
    { icon: Package,         title: t('benefit_stock'),    desc: t('benefit_stock_desc') },
    { icon: HeadphonesIcon,  title: t('benefit_support'),  desc: t('benefit_support_desc') },
    { icon: Truck,           title: t('benefit_delivery'), desc: t('benefit_delivery_desc') },
  ];

  const steps = [
    { n: '1', title: t('step1_title'), desc: t('step1_desc') },
    { n: '2', title: t('step2_title'), desc: t('step2_desc') },
    { n: '3', title: t('step3_title'), desc: t('step3_desc') },
  ];

  return (
    <div className="bg-off-white">

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pink-primary to-pink-accent px-4 py-20 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <PawPrint
              key={i}
              className="absolute h-24 w-24"
              style={{ top: `${(i * 23) % 90}%`, left: `${(i * 17) % 90}%`, rotate: `${i * 40}deg` }}
            />
          ))}
        </div>
        <div className="relative mx-auto max-w-3xl text-center">
          <span className="mb-4 inline-block rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold">
            B2B Wholesale
          </span>
          <h1 className="mb-4 text-4xl font-bold leading-tight sm:text-5xl">{t('landing_title')}</h1>
          <p className="mb-8 text-lg text-white/85">{t('landing_subtitle')}</p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/b2b/apply"
              className="rounded-xl bg-white px-8 py-3.5 font-semibold text-pink-primary shadow-lg hover:bg-off-white transition-colors"
            >
              {t('apply_cta')}
            </Link>
            <Link
              href="/account/login"
              className="rounded-xl border border-white/40 px-8 py-3.5 font-semibold text-white hover:bg-white/10 transition-colors"
            >
              {t('already_partner')} {t('sign_in')}
            </Link>
          </div>
          <p className="mt-4 text-sm text-white/70">{t('min_order')}</p>
        </div>
      </section>

      {/* Benefits */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-10 text-center text-2xl font-bold text-text-dark">{t('benefits_title')}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-fur-border bg-white p-6 shadow-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-pink-primary/10">
                  <Icon className="h-5 w-5 text-pink-primary" />
                </div>
                <h3 className="mb-1.5 font-semibold text-text-dark">{title}</h3>
                <p className="text-sm text-text-muted">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-10 text-center text-2xl font-bold text-text-dark">{t('how_it_works')}</h2>
          <div className="relative">
            <div className="absolute start-5 top-0 h-full w-px bg-fur-border" aria-hidden="true" />
            <div className="space-y-8">
              {steps.map(({ n, title, desc }) => (
                <div key={n} className="relative flex gap-6">
                  <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-primary text-sm font-bold text-white shadow-md shadow-pink-primary/30">
                    {n}
                  </div>
                  <div className="pt-1.5">
                    <h3 className="font-semibold text-text-dark">{title}</h3>
                    <p className="mt-0.5 text-sm text-text-muted">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-3xl rounded-2xl bg-pink-primary/5 border border-pink-primary/20 px-8 py-10 text-center">
          <CheckCircle2 className="mx-auto mb-4 h-10 w-10 text-pink-primary" />
          <h2 className="mb-2 text-xl font-bold text-text-dark">{t('apply_title')}</h2>
          <p className="mb-6 text-sm text-text-muted">{t('apply_subtitle')}</p>
          <Link
            href="/b2b/apply"
            className="inline-block rounded-xl bg-pink-primary px-8 py-3.5 font-semibold text-white shadow-lg shadow-pink-primary/25 hover:bg-pink-accent transition-colors"
          >
            {t('apply_cta')}
          </Link>
        </div>
      </section>

    </div>
  );
}
