'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { PawPrint, Loader2, ArrowLeft, Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const inputCls =
  'h-11 w-full rounded-xl border border-fur-border bg-white px-4 text-sm text-text-dark placeholder:text-text-muted transition-colors focus:border-pink-primary focus:outline-none focus:ring-2 focus:ring-pink-primary/20';

export default function ForgotPasswordPage() {
  const locale = useLocale();
  const t = useTranslations('auth');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/${locale}/account/reset-password`;
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (err) { setError(err.message); return; }
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-off-white px-4 py-12">
      <div className="w-full max-w-md">

        <Link href="/" className="mb-8 flex items-center justify-center gap-2 group">
          <PawPrint className="h-7 w-7 text-pink-primary transition-transform group-hover:scale-110" />
          <span className="text-xl font-bold text-pink-primary tracking-tight">FURPAWS</span>
        </Link>

        <div className="rounded-2xl border border-fur-border bg-white p-8 shadow-sm">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                <Mail className="h-7 w-7 text-emerald-600" />
              </div>
              <h1 className="mb-2 text-xl font-bold text-text-dark">{t('reset_sent').split('!')[0]}!</h1>
              <p className="mb-6 text-sm text-text-muted">{t('reset_sent').split('! ')[1] ?? t('reset_sent')}</p>
              <Link href="/account/login" className="text-sm font-semibold text-pink-primary hover:underline">
                {t('back_to_login')}
              </Link>
            </div>
          ) : (
            <>
              <h1 className="mb-1 text-center text-2xl font-bold text-text-dark">{t('forgot_title')}</h1>
              <p className="mb-6 text-center text-sm text-text-muted">{t('forgot_desc')}</p>

              {error && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-dark">{t('email')}</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className={inputCls}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-pink-primary py-3 font-semibold text-white shadow-lg shadow-pink-primary/25 transition-all hover:bg-pink-accent disabled:opacity-60"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {t('send_reset')}
                </button>
              </form>

              <div className="mt-4 text-center">
                <Link href="/account/login" className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-pink-primary transition-colors">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {t('back_to_login')}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
