'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useCartStore } from '@/store/cartStore';
import { ShoppingBag, Menu, User, ChevronDown, ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import LanguageSwitch from './LanguageSwitch';

type SubCategory = { key: string; href: string };
type Category    = { key: string; href: string; subcategories: SubCategory[] };

const NAV_CATEGORIES: Category[] = [
  {
    key: 'dogs',
    href: '/shop/dogs',
    subcategories: [
      { key: 'sub_grooming',      href: '/shop/dogs/grooming' },
      { key: 'sub_carriers',      href: '/shop/dogs/carriers' },
      { key: 'sub_beds',          href: '/shop/dogs/beds' },
      { key: 'sub_toys',          href: '/shop/dogs/toys' },
      { key: 'sub_training_pads', href: '/shop/dogs/training-pads' },
    ],
  },
  {
    key: 'cats',
    href: '/shop/cats',
    subcategories: [
      { key: 'sub_grooming',   href: '/shop/cats/grooming' },
      { key: 'sub_carriers',   href: '/shop/cats/carriers' },
      { key: 'sub_beds',       href: '/shop/cats/beds' },
      { key: 'sub_toys',       href: '/shop/cats/toys' },
      { key: 'sub_litter_box', href: '/shop/cats/litter-box' },
    ],
  },
  {
    key: 'small_animals',
    href: '/shop/small-animals',
    subcategories: [
      { key: 'sub_cages',   href: '/shop/small-animals/cages' },
      { key: 'sub_food',    href: '/shop/small-animals/food' },
      { key: 'sub_toys',    href: '/shop/small-animals/toys' },
      { key: 'sub_bedding', href: '/shop/small-animals/bedding' },
    ],
  },
  {
    key: 'veterinary',
    href: '/shop/veterinary',
    subcategories: [
      { key: 'sub_supplements', href: '/shop/veterinary/supplements' },
      { key: 'sub_first_aid',   href: '/shop/veterinary/first-aid' },
      { key: 'sub_dental',      href: '/shop/veterinary/dental-care' },
      { key: 'sub_flea_tick',   href: '/shop/veterinary/flea-tick' },
    ],
  },
  {
    key: 'brands',
    href: '/shop/brands',
    subcategories: [
      { key: 'sub_brand_furpaws', href: '/shop/brands/furpaws' },
      { key: 'sub_brand_andis',   href: '/shop/brands/andis' },
    ],
  },
];

export default function Navbar() {
  const t          = useTranslations('nav');
  const locale     = useLocale();
  const totalItems = useCartStore((s) => s.totalItems());

  const [mobileOpen,     setMobileOpen]     = useState(false);
  const [shopOpen,       setShopOpen]       = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [searchQuery,    setSearchQuery]    = useState('');

  const placeholder = locale === 'ar' ? 'ابحث عن منتجاتك المفضلة...' : 'Search for your pet\'s favorites here...';

  function handleSearch(e: { preventDefault(): void }) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    window.location.href = `/${locale}/shop?q=${encodeURIComponent(q)}`;
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-md">

      {/* ── Row 1 : Logo + Search + Actions ── */}
      <div className="container mx-auto px-4 h-20 flex items-center gap-4">

        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image src="/logo.png" alt="FurPaws" width={140} height={140} className="h-14 w-auto" priority />
        </Link>

        {/* Search bar — always visible */}
        <form onSubmit={handleSearch} className="flex-1 flex items-center">
          <div className="relative w-full">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={placeholder}
              className="h-11 w-full rounded-full border border-fur-border bg-gray-50 ps-5 pe-12 text-sm text-text-dark placeholder:text-text-muted focus:border-pink-primary focus:outline-none focus:ring-2 focus:ring-pink-primary/20 transition-all"
            />
            <button
              type="submit"
              className="absolute end-1 top-1/2 -translate-y-1/2 flex items-center justify-center h-9 w-9 rounded-full bg-pink-primary text-white hover:bg-pink-accent transition-colors"
              aria-label={locale === 'ar' ? 'بحث' : 'Search'}
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </form>

        {/* Right actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <LanguageSwitch />

          <Link
            href="/account/login"
            className="hidden md:flex items-center justify-center h-9 w-9 rounded-full text-text-muted hover:text-pink-primary hover:bg-pink-light transition-colors"
            aria-label={t('account')}
          >
            <User className="h-5 w-5" />
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative flex items-center justify-center h-9 w-9 rounded-full text-text-muted hover:text-pink-primary hover:bg-pink-light transition-colors"
            aria-label={t('cart')}
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -end-1 h-5 w-5 rounded-full bg-pink-primary text-white text-[11px] flex items-center justify-center font-bold leading-none">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </Link>

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-text-muted hover:text-pink-primary"
                  aria-label={t('open_menu')}
                />
              }
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>

            <SheetContent
              side={locale === 'ar' ? 'right' : 'left'}
              className="w-72 p-0 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center p-5 border-b border-fur-border">
                <Image src="/logo.png" alt="FurPaws" width={100} height={100} className="h-10 w-auto" />
              </div>

              {/* Mobile search */}
              <form onSubmit={handleSearch} className="px-4 pt-4">
                <div className="relative">
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={placeholder}
                    className="h-10 w-full rounded-full border border-fur-border bg-gray-50 ps-4 pe-10 text-sm text-text-dark placeholder:text-text-muted focus:border-pink-primary focus:outline-none focus:ring-2 focus:ring-pink-primary/20"
                  />
                  <button
                    type="submit"
                    className="absolute end-1 top-1/2 -translate-y-1/2 flex items-center justify-center h-8 w-8 rounded-full bg-pink-primary text-white hover:bg-pink-accent transition-colors"
                  >
                    <Search className="h-3.5 w-3.5" />
                  </button>
                </div>
              </form>

              {/* Nav links */}
              <nav className="flex-1 flex flex-col p-4 gap-0.5 overflow-y-auto">
                {NAV_CATEGORIES.map((cat) => (
                  <div key={cat.key}>
                    <button
                      className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg text-text-dark hover:text-pink-primary hover:bg-pink-light transition-colors text-sm font-medium"
                      onClick={() => setMobileExpanded(mobileExpanded === cat.key ? null : cat.key)}
                    >
                      <span>{t(cat.key as Parameters<typeof t>[0])}</span>
                      <ChevronRight className={`h-4 w-4 transition-transform text-text-muted rtl:rotate-180 ${mobileExpanded === cat.key ? 'rotate-90 rtl:rotate-[270deg]' : ''}`} />
                    </button>

                    {mobileExpanded === cat.key && (
                      <div className="ms-4 mb-1 flex flex-col gap-0.5">
                        <Link
                          href={cat.href}
                          onClick={() => setMobileOpen(false)}
                          className="py-2 px-3 rounded-lg text-xs font-semibold text-pink-primary hover:bg-pink-light transition-colors"
                        >
                          {t('shop')} {t(cat.key as Parameters<typeof t>[0])}
                        </Link>
                        {cat.subcategories.map((sub) => (
                          <Link
                            key={sub.key}
                            href={sub.href}
                            onClick={() => setMobileOpen(false)}
                            className="py-2 px-3 rounded-lg text-sm text-text-dark hover:text-pink-primary hover:bg-pink-light transition-colors"
                          >
                            {t(sub.key as Parameters<typeof t>[0])}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                <div className="my-3 border-t border-fur-border" />

                <Link href="/about" onClick={() => setMobileOpen(false)} className="py-2.5 px-3 rounded-lg text-text-dark hover:text-pink-primary hover:bg-pink-light transition-colors text-sm font-medium">
                  {t('about')}
                </Link>
                <Link href="/contact" onClick={() => setMobileOpen(false)} className="py-2.5 px-3 rounded-lg text-text-dark hover:text-pink-primary hover:bg-pink-light transition-colors text-sm font-medium">
                  {t('contact')}
                </Link>
                <Link href="/b2b" onClick={() => setMobileOpen(false)} className="py-2.5 px-3 rounded-lg text-pink-primary hover:bg-pink-light transition-colors text-sm font-semibold">
                  {t('b2b')}
                </Link>
              </nav>

              <div className="p-4 border-t border-fur-border">
                <Link
                  href="/account/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-lg text-text-dark hover:text-pink-primary hover:bg-pink-light transition-colors text-sm font-medium"
                >
                  <User className="h-4 w-4" />
                  {t('login')}
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* ── Row 2 : Navigation links (desktop only) ── */}
      <div className="hidden md:block border-t border-fur-border bg-white">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-1 h-11">

            {/* Shop mega-menu */}
            <div
              className="relative h-full flex items-center"
              onMouseEnter={() => setShopOpen(true)}
              onMouseLeave={() => setShopOpen(false)}
            >
              <button className="flex items-center gap-1 px-4 h-full text-sm font-semibold text-text-dark hover:text-pink-primary transition-colors">
                {t('shop')}
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${shopOpen ? 'rotate-180' : ''}`} />
              </button>

              {shopOpen && (
                <div className="absolute top-full start-0 bg-white border border-fur-border rounded-2xl shadow-xl py-6 px-6 z-50 min-w-[700px] flex gap-8">
                  {NAV_CATEGORIES.map((cat) => (
                    <div key={cat.key} className="flex-1 min-w-[120px]">
                      <Link
                        href={cat.href}
                        className="block text-sm font-bold text-pink-primary mb-3 hover:underline"
                        onClick={() => setShopOpen(false)}
                      >
                        {t(cat.key as Parameters<typeof t>[0])}
                      </Link>
                      <ul className="space-y-1.5">
                        {cat.subcategories.map((sub) => (
                          <li key={sub.key}>
                            <Link
                              href={sub.href}
                              className="block text-sm text-text-dark hover:text-pink-primary transition-colors"
                              onClick={() => setShopOpen(false)}
                            >
                              {t(sub.key as Parameters<typeof t>[0])}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link href="/about" className="px-4 h-full flex items-center text-sm font-semibold text-text-dark hover:text-pink-primary transition-colors">
              {t('about')}
            </Link>
            <Link href="/contact" className="px-4 h-full flex items-center text-sm font-semibold text-text-dark hover:text-pink-primary transition-colors">
              {t('contact')}
            </Link>
            <Link href="/b2b" className="px-4 h-full flex items-center text-sm font-bold text-pink-primary hover:text-pink-accent transition-colors">
              {t('b2b')}
            </Link>
          </nav>
        </div>
      </div>

    </header>
  );
}
