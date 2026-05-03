'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { PawPrint, ArrowRight, Truck, Star, Shield } from 'lucide-react';

export default function HeroSection() {
  const t = useTranslations('home');

  return (
    <section className="relative overflow-hidden bg-off-white">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/hero.jpg"
          alt=""
          fill
          className="object-cover"
          priority
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/45" />
      </div>

      <div className="container relative mx-auto px-4 py-16 md:py-24 lg:py-28">
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:gap-16">

          {/* Left — text content */}
          <div className="flex-1 text-center lg:text-start">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-4 py-1.5 text-sm font-semibold text-white"
            >
              <PawPrint className="h-3.5 w-3.5" />
              {t('trust_uae')}
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="mb-5 text-5xl font-extrabold leading-tight tracking-tight text-white md:text-6xl lg:text-7xl"
            >
              {t('hero_title')}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2 }}
              className="mb-10 max-w-xl text-lg leading-relaxed text-white/80 lg:max-w-none"
            >
              {t('hero_subtitle')}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-3 lg:justify-start"
            >
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-xl bg-pink-primary px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-pink-primary/30 transition-all hover:bg-pink-accent hover:shadow-pink-primary/40 hover:-translate-y-0.5"
              >
                {t('hero_cta')}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
              <Link
                href="/b2b"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-white px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-white/20 hover:-translate-y-0.5"
              >
                {t('hero_cta_b2b')}
              </Link>
            </motion.div>

            {/* Trust mini row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-white/70 lg:justify-start"
            >
              <span className="flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-pink-primary" />
                {t('trust_shipping')}
              </span>
              <span className="hidden h-1 w-1 rounded-full bg-fur-border sm:block" />
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-pink-primary" />
                {t('trust_quality')}
              </span>
              <span className="hidden h-1 w-1 rounded-full bg-fur-border sm:block" />
              <span className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-pink-primary" />
                {t('trust_returns')}
              </span>
            </motion.div>
          </div>

        </div>
      </div>

      {/* Floating paw prints */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {[
          { size: 'h-8 w-8', pos: 'top-8 start-[5%]', opacity: 'opacity-10', rotate: '-rotate-12', delay: 0 },
          { size: 'h-5 w-5', pos: 'top-20 end-[8%]', opacity: 'opacity-10', rotate: 'rotate-20', delay: 0.2 },
          { size: 'h-10 w-10', pos: 'bottom-12 start-[10%]', opacity: 'opacity-8', rotate: 'rotate-45', delay: 0.4 },
          { size: 'h-6 w-6', pos: 'bottom-24 end-[6%]', opacity: 'opacity-10', rotate: '-rotate-30', delay: 0.1 },
        ].map((p, i) => (
          <motion.div
            key={i}
            className={`absolute ${p.pos} ${p.opacity} ${p.rotate}`}
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4 + i, delay: p.delay }}
          >
            <PawPrint className={`${p.size} text-pink-primary`} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
