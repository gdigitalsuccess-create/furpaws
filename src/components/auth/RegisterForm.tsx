'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { Eye, EyeOff, Loader2, MailCheck } from 'lucide-react';

const schema = z
  .object({
    full_name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

type Values = z.infer<typeof schema>;

const inputCls =
  'h-11 w-full rounded-xl border border-fur-border bg-white px-4 text-sm text-text-dark placeholder:text-text-muted transition-colors focus:border-pink-primary focus:outline-none focus:ring-2 focus:ring-pink-primary/20';

export default function RegisterForm() {
  const locale = useLocale();
  const t = useTranslations('auth');
  const [showPwd, setShowPwd] = useState(false);
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

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
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { full_name: data.full_name },
          emailRedirectTo: `${window.location.origin}/${locale}/account`,
        },
      });

      if (error) {
        setAuthError(error.message);
        return;
      }

      // Session available → email confirmation disabled, user is logged in
      if (authData.session) {
        window.location.href = `/${locale}/account`;
        return;
      }

      // No session → email confirmation required
      setEmailSent(true);
    } finally {
      setLoading(false);
    }
  }

  if (emailSent) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <MailCheck className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-lg font-bold text-text-dark">
          {locale === 'ar' ? 'تحقق من بريدك الإلكتروني' : 'Check your inbox'}
        </h2>
        <p className="text-sm text-text-muted">
          {locale === 'ar'
            ? 'أرسلنا رابط تأكيد. انقر عليه لتفعيل حسابك.'
            : "We've sent a confirmation link. Click it to activate your account."}
        </p>
        <Link
          href="/account/login"
          className="text-sm font-semibold text-pink-primary hover:underline"
        >
          {t('sign_in')} →
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {authError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {authError}
        </div>
      )}

      {/* Full name */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-dark">{t('full_name')}</label>
        <input
          {...register('full_name')}
          placeholder="Mohammed Al Rashid"
          autoComplete="name"
          className={inputCls}
        />
        {errors.full_name && <p className="mt-1 text-xs text-red-500">{errors.full_name.message}</p>}
      </div>

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
        <label className="mb-1.5 block text-sm font-medium text-text-dark">{t('password')}</label>
        <div className="relative">
          <input
            {...register('password')}
            type={showPwd ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Min. 8 characters"
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

      {/* Confirm password */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-dark">
          {t('confirm_password')}
        </label>
        <input
          {...register('confirm_password')}
          type={showPwd ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="••••••••"
          className={inputCls}
        />
        {errors.confirm_password && (
          <p className="mt-1 text-xs text-red-500">{errors.confirm_password.message}</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-pink-primary py-3 font-semibold text-white shadow-lg shadow-pink-primary/25 transition-all hover:bg-pink-accent disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {t('sign_up')}
      </button>

      {/* Terms */}
      <p className="text-center text-xs text-text-muted">{t('terms')}</p>

      {/* Switch to login */}
      <p className="text-center text-sm text-text-muted">
        {t('have_account')}{' '}
        <Link href="/account/login" className="font-semibold text-pink-primary hover:underline">
          {t('sign_in')}
        </Link>
      </p>
    </form>
  );
}
