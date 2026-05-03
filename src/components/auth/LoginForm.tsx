'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type Values = z.infer<typeof schema>;

const inputCls =
  'h-11 w-full rounded-xl border border-fur-border bg-white px-4 text-sm text-text-dark placeholder:text-text-muted transition-colors focus:border-pink-primary focus:outline-none focus:ring-2 focus:ring-pink-primary/20';

export default function LoginForm() {
  const locale = useLocale();
  const t = useTranslations('auth');
  const [showPwd, setShowPwd] = useState(false);
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  async function onSubmit(data: Values) {
    setAuthError('');
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        setAuthError(error.message);
        return;
      }

      // Full redirect so server components pick up the new session
      window.location.href = `/${locale}/account`;
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Auth error */}
      {authError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {authError}
        </div>
      )}

      {/* Email */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-dark">{t('email')}</label>
        <input
          {...register('email')}
          type="email"
          autoComplete="email"
          placeholder="email@example.com"
          className={inputCls}
        />
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
      </div>

      {/* Password */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-sm font-medium text-text-dark">{t('password')}</label>
          <Link
            href="/account/forgot-password"
            className="text-xs font-medium text-pink-primary hover:underline"
          >
            {t('forgot_password')}
          </Link>
        </div>
        <div className="relative">
          <input
            {...register('password')}
            type={showPwd ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            className={`${inputCls} pe-11`}
          />
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-dark"
          >
            {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-pink-primary py-3 font-semibold text-white shadow-lg shadow-pink-primary/25 transition-all hover:bg-pink-accent disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {t('sign_in')}
      </button>

      {/* Switch to register */}
      <p className="text-center text-sm text-text-muted">
        {t('no_account')}{' '}
        <Link href="/account/register" className="font-semibold text-pink-primary hover:underline">
          {t('sign_up')}
        </Link>
      </p>
    </form>
  );
}
