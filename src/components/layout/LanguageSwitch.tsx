'use client';

import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';

export default function LanguageSwitch() {
  const locale   = useLocale();
  const pathname = usePathname(); // ex: /en/shop/dogs

  const toggle = () => {
    const newLocale = locale === 'en' ? 'ar' : 'en';
    // Remplace le segment locale dans l'URL : /en/shop → /ar/shop
    const rest    = pathname.slice(`/${locale}`.length);
    const newPath = `/${newLocale}${rest || '/'}`;
    window.location.href = newPath;
  };

  return (
    <button
      onClick={toggle}
      className="h-8 px-2 rounded-lg text-text-muted hover:text-pink-primary font-medium text-sm transition-colors hover:bg-pink-light"
      aria-label="Switch language"
    >
      {locale === 'en' ? 'العربية' : 'English'}
    </button>
  );
}
