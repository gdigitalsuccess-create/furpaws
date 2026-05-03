import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { PawPrint, Mail, MapPin } from 'lucide-react';

export default async function Footer({ locale }: { locale: string }) {
  const t    = await getTranslations({ locale, namespace: 'footer' });
  const tNav = await getTranslations({ locale, namespace: 'nav' });
  const year = new Date().getFullYear();

  return (
    <footer className="bg-text-dark text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">

          {/* ── Brand ── */}
          <div className="sm:col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
              <PawPrint className="h-6 w-6 text-pink-primary transition-transform group-hover:scale-110" />
              <span className="font-bold text-xl text-pink-primary">FURPAWS</span>
            </Link>
            <p className="text-sm text-gray-400 mb-5 leading-relaxed">{t('tagline')}</p>
            <div className="flex flex-col gap-2.5 text-sm text-gray-400">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5 text-pink-accent" />
                <span>{t('address')}</span>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 flex-shrink-0 mt-0.5 text-pink-accent" />
                <a href={`mailto:${t('email')}`} className="hover:text-pink-accent transition-colors">
                  {t('email')}
                </a>
              </div>
            </div>
          </div>

          {/* ── Shop ── */}
          <div>
            <h3 className="font-semibold mb-4 text-white text-sm uppercase tracking-wider">{t('shop')}</h3>
            <ul className="flex flex-col gap-2.5 text-sm text-gray-400">
              {(['dogs', 'cats', 'small_animals', 'veterinary', 'brands'] as const).map((key) => (
                <li key={key}>
                  <Link href={`/shop/${key.replace('_', '-')}`} className="hover:text-pink-accent transition-colors">
                    {tNav(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Company ── */}
          <div>
            <h3 className="font-semibold mb-4 text-white text-sm uppercase tracking-wider">{t('company')}</h3>
            <ul className="flex flex-col gap-2.5 text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-pink-accent transition-colors">{t('about')}</Link></li>
              <li><Link href="/contact" className="hover:text-pink-accent transition-colors">{t('contact')}</Link></li>
              <li><Link href="/b2b" className="hover:text-pink-accent transition-colors">{t('b2b')}</Link></li>
            </ul>
          </div>

          {/* ── Legal ── */}
          <div>
            <h3 className="font-semibold mb-4 text-white text-sm uppercase tracking-wider">{t('legal')}</h3>
            <ul className="flex flex-col gap-2.5 text-sm text-gray-400">
              <li><Link href="/privacy" className="hover:text-pink-accent transition-colors">{t('privacy')}</Link></li>
              <li><Link href="/terms" className="hover:text-pink-accent transition-colors">{t('terms')}</Link></li>
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <span>{t('copyright', { year })}</span>
          <span>{t('made_with')}</span>
        </div>
      </div>
    </footer>
  );
}
