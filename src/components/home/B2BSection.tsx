import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { ArrowRight, Building2 } from 'lucide-react';

export default async function B2BSection({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'home' });

  return (
    <section className="relative overflow-hidden py-24">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/b2b-bg.jpg"
          alt=""
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="container relative mx-auto px-4 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-pink-primary/30 backdrop-blur-sm">
          <Building2 className="h-8 w-8 text-white" />
        </div>

        <h2 className="mb-3 text-3xl font-bold text-white md:text-4xl">
          {t('b2b_title')}
        </h2>

        <p className="mx-auto mb-8 max-w-xl leading-relaxed text-white/75">
          {t('b2b_subtitle')}
        </p>

        <Link
          href="/b2b"
          className="inline-flex items-center gap-2 rounded-xl bg-pink-primary px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-pink-primary/30 transition-all hover:bg-pink-accent hover:-translate-y-0.5"
        >
          {t('b2b_cta')}
          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
        </Link>
      </div>
    </section>
  );
}
