'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function NewsletterSection() {
  const t = useTranslations('home');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error('failed');

      setEmail('');
      toast.success(t('newsletter_success'));
    } catch {
      toast.error(t('newsletter_error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-xl text-center">

          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-pink-light">
            <Mail className="h-6 w-6 text-pink-primary" />
          </div>

          <h2 className="mb-2 text-3xl font-bold text-text-dark">
            {t('newsletter_title')}
          </h2>
          <p className="mb-8 text-text-muted">{t('newsletter_subtitle')}</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('newsletter_placeholder')}
              required
              className="h-12 flex-1 rounded-xl border border-fur-border bg-white px-4 text-text-dark placeholder:text-text-muted transition-colors focus:border-pink-primary focus:outline-none focus:ring-2 focus:ring-pink-primary/20"
            />
            <button
              type="submit"
              disabled={loading}
              className="h-12 whitespace-nowrap rounded-xl bg-pink-primary px-6 font-semibold text-white transition-colors hover:bg-pink-accent disabled:opacity-60"
            >
              {loading ? '...' : t('newsletter_cta')}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
