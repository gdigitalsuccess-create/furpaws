'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';

type Slide = {
  bg: string;
  badge?: string;
  title: string;
  subtitle?: string;
  cta?: { label: string; href: string };
};

const SLIDES_TOP: Slide[] = [
  {
    bg: 'from-[#1a1a2e] via-[#16213e] to-[#0f3460]',
    badge: '🐾 New Arrival',
    title: 'Premium Dog Food\nCollections',
    subtitle: 'Natural ingredients, crafted for your best friend',
    cta: { label: 'Shop Now', href: '/shop' },
  },
  {
    bg: 'from-[#2d1b69] via-[#11998e] to-[#38ef7d]',
    badge: '🐱 For Cats',
    title: 'Discover Our\nCat Range',
    subtitle: 'Everything your feline companion needs',
    cta: { label: 'Explore', href: '/shop/cats' },
  },
  {
    bg: 'from-[#c94b4b] via-[#4b134f] to-[#1a1a2e]',
    badge: '🎉 Special Offer',
    title: 'Free Shipping\nOver 250 AED',
    subtitle: 'Across Sharjah and all UAE',
    cta: { label: 'Shop Now', href: '/shop' },
  },
];

const SLIDES_BOTTOM: Slide[] = [
  {
    bg: 'from-[#7c3aed] via-[#db2777] to-[#f59e0b]',
    badge: '💊 Veterinary Care',
    title: 'Health &\nWellness Range',
    subtitle: 'Supplements, dental care & first aid for your pet',
    cta: { label: 'Shop Veterinary', href: '/shop/veterinary' },
  },
  {
    bg: 'from-[#065f46] via-[#0d9488] to-[#1e40af]',
    badge: '🏷️ B2B Wholesale',
    title: 'Are You a\nPet Store?',
    subtitle: 'Get exclusive wholesale pricing — up to 30% off',
    cta: { label: 'Apply Now', href: '/b2b' },
  },
  {
    bg: 'from-[#1e1b4b] via-[#7c3aed] to-[#c026d3]',
    badge: '🐹 Small Animals',
    title: 'Cages, Toys &\nTreats for Small Pets',
    subtitle: 'Rabbits, hamsters, guinea pigs & more',
    cta: { label: 'Explore', href: '/shop/small-animals' },
  },
];

export default function PromoSlider({ variant = 'top' }: { variant?: 'top' | 'bottom' }) {
  const SLIDES = variant === 'bottom' ? SLIDES_BOTTOM : SLIDES_TOP;
  const locale = useLocale();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const prev = useCallback(() => {
    setCurrent((i) => (i === 0 ? SLIDES.length - 1 : i - 1));
  }, []);

  const next = useCallback(() => {
    setCurrent((i) => (i === SLIDES.length - 1 ? 0 : i + 1));
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 4500);
    return () => clearInterval(timer);
  }, [next, paused]);

  const slide = SLIDES[current];

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ aspectRatio: '16/5' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      {SLIDES.map((s, i) => (
        <div
          key={i}
          className={`absolute inset-0 bg-gradient-to-r ${s.bg} transition-opacity duration-700 ${
            i === current ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}

      {/* Decorative circles */}
      <div className="pointer-events-none absolute -end-20 -top-20 h-80 w-80 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-10 end-40 h-48 w-48 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute start-1/3 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-white/5" />

      {/* Content */}
      <div className="relative flex h-full items-center justify-center px-16 text-center">
        <div className="max-w-2xl">
          {slide.badge && (
            <span className="mb-3 inline-block rounded-full bg-white/20 px-4 py-1 text-sm font-semibold text-white backdrop-blur-sm">
              {slide.badge}
            </span>
          )}
          <h2 className="mb-2 whitespace-pre-line text-3xl font-extrabold leading-tight text-white md:text-4xl lg:text-5xl">
            {slide.title}
          </h2>
          {slide.subtitle && (
            <p className="mb-6 text-base text-white/75">{slide.subtitle}</p>
          )}
          {slide.cta && (
            <Link
              href={slide.cta.href as Parameters<typeof Link>[0]['href']}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-gray-900 shadow-lg transition-all hover:bg-white/90 hover:-translate-y-0.5"
            >
              {slide.cta.label}
            </Link>
          )}
        </div>
      </div>

      {/* Left arrow */}
      <button
        onClick={locale === 'ar' ? next : prev}
        className="absolute start-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/40"
        aria-label="Previous"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Right arrow */}
      <button
        onClick={locale === 'ar' ? prev : next}
        className="absolute end-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/40"
        aria-label="Next"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current ? 'w-6 bg-white' : 'w-2 bg-white/50'
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
