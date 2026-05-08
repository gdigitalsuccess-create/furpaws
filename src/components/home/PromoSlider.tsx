'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';

type Slide = {
  bg: string;
  image?: string;
  darkText?: boolean;
  badge?: string;
  title: string;
  subtitle?: string;
  cta?: { label: string; href: string };
};

const SLIDES_TOP: Slide[] = [
  {
    bg: 'bg-white',
    image: '/1.png',
    darkText: true,
    badge: '🐱 Cat Collection',
    title: 'Premium Cat\nToys & Accessories',
    subtitle: 'Feathers, balls & more — keep them entertained',
    cta: { label: 'Shop Cats', href: '/shop/cats' },
  },
  {
    bg: 'bg-white',
    image: '/2.png',
    darkText: true,
    badge: '🐾 Dogs & Cats',
    title: 'Everything Your\nPets Need',
    subtitle: 'Toys, collars, cat trees & more — all in one place',
    cta: { label: 'Shop Now', href: '/shop' },
  },
  {
    bg: 'bg-[#c8a882]',
    image: '/3.png',
    darkText: true,
    badge: '🎒 Travel & Carriers',
    title: 'Adventures\nStart Here',
    subtitle: 'Carrier backpacks & accessories for every pet parent',
    cta: { label: 'Shop Carriers', href: '/shop' },
  },
];

const SLIDES_BOTTOM: Slide[] = [
  {
    bg: 'bg-[#c94b4b]',
    image: '/4.png',
    darkText: false,
    badge: '😴 Cozy Beds',
    title: 'Premium Beds\nFor Every Pet',
    subtitle: 'Plush, orthopedic & stylish — they deserve the best',
    cta: { label: 'Shop Beds', href: '/shop' },
  },
  {
    bg: 'bg-[#4a7c59]',
    image: '/5.png',
    darkText: false,
    badge: '✈️ Travel Ready',
    title: 'Carriers &\nTravel Essentials',
    subtitle: 'Safe, comfortable journeys for your furry companion',
    cta: { label: 'Shop Travel', href: '/shop' },
  },
  {
    bg: 'bg-[#f59e0b]',
    image: '/6.png',
    darkText: false,
    badge: '🎾 New Arrivals',
    title: 'Play Time\nJust Got Better',
    subtitle: 'Fresh toys for dogs & cats — tunnels, rings & more',
    cta: { label: 'Shop Toys', href: '/shop' },
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

  const isDark = !slide.darkText;

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ aspectRatio: '16/5' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides — image or gradient */}
      {SLIDES.map((s, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === current ? 'opacity-100' : 'opacity-0'
          } ${s.image ? s.bg : `bg-gradient-to-r ${s.bg}`}`}
        >
          {s.image && (
            <Image
              src={s.image}
              alt=""
              fill
              className="object-cover"
              priority={i === 0}
            />
          )}
        </div>
      ))}

      {/* Overlay for readability on light-bg images */}
      {slide.darkText && (
        <div className="pointer-events-none absolute inset-0 bg-white/30" />
      )}

      {/* Content */}
      <div className="relative flex h-full items-center justify-center px-16 text-center">
        <div className="max-w-2xl">
          {slide.badge && (
            <span
              className={`mb-3 inline-block rounded-full px-4 py-1 text-sm font-semibold backdrop-blur-sm ${
                isDark
                  ? 'bg-white/20 text-white'
                  : 'bg-black/10 text-gray-800'
              }`}
            >
              {slide.badge}
            </span>
          )}
          <h2
            className={`mb-2 whitespace-pre-line text-3xl font-extrabold leading-tight md:text-4xl lg:text-5xl ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            {slide.title}
          </h2>
          {slide.subtitle && (
            <p className={`mb-6 text-base ${isDark ? 'text-white/75' : 'text-gray-600'}`}>
              {slide.subtitle}
            </p>
          )}
          {slide.cta && (
            <Link
              href={slide.cta.href as Parameters<typeof Link>[0]['href']}
              className={`inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold shadow-lg transition-all hover:-translate-y-0.5 ${
                isDark
                  ? 'bg-white text-gray-900 hover:bg-white/90'
                  : 'bg-pink-500 text-white hover:bg-pink-600'
              }`}
            >
              {slide.cta.label}
            </Link>
          )}
        </div>
      </div>

      {/* Left arrow */}
      <button
        onClick={locale === 'ar' ? next : prev}
        className={`absolute start-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-sm transition-colors ${
          isDark
            ? 'bg-white/20 text-white hover:bg-white/40'
            : 'bg-black/15 text-gray-800 hover:bg-black/25'
        }`}
        aria-label="Previous"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Right arrow */}
      <button
        onClick={locale === 'ar' ? prev : next}
        className={`absolute end-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-sm transition-colors ${
          isDark
            ? 'bg-white/20 text-white hover:bg-white/40'
            : 'bg-black/15 text-gray-800 hover:bg-black/25'
        }`}
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
              isDark
                ? i === current ? 'w-6 bg-white' : 'w-2 bg-white/50'
                : i === current ? 'w-6 bg-gray-800' : 'w-2 bg-gray-400'
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
