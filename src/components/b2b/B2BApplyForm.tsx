'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Clock } from 'lucide-react';

const schema = z.object({
  company_name:  z.string().min(2),
  contact_name:  z.string().min(2),
  email:         z.string().email(),
  phone:         z.string().min(7),
  business_type: z.string().min(1),
  message:       z.string().optional(),
});

type Values = z.infer<typeof schema>;

const inputCls =
  'h-11 w-full rounded-xl border border-fur-border bg-white px-4 text-sm text-text-dark placeholder:text-text-muted transition-colors focus:border-pink-primary focus:outline-none focus:ring-2 focus:ring-pink-primary/20';

export default function B2BApplyForm({
  defaultEmail,
  defaultName,
}: {
  defaultEmail?: string;
  defaultName?: string;
}) {
  const t = useTranslations('b2b');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: defaultEmail ?? '', contact_name: defaultName ?? '' },
  });

  async function onSubmit(data: Values) {
    setServerError('');
    setLoading(true);
    try {
      const res = await fetch('/api/b2b/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setServerError(body.error ?? 'Something went wrong.');
        return;
      }
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
          <Clock className="h-8 w-8 text-yellow-600" />
        </div>
        <h2 className="text-lg font-bold text-text-dark">{t('pending_title')}</h2>
        <p className="max-w-sm text-sm text-text-muted">{t('pending_message')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {serverError}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Company name */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-dark">{t('company_name')}</label>
          <input
            {...register('company_name')}
            placeholder="ACME Pet Supplies LLC"
            className={inputCls}
          />
          {errors.company_name && <p className="mt-1 text-xs text-red-500">{errors.company_name.message}</p>}
        </div>

        {/* Contact name */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-dark">{t('contact_name')}</label>
          <input
            {...register('contact_name')}
            placeholder="Mohammed Al Rashid"
            className={inputCls}
          />
          {errors.contact_name && <p className="mt-1 text-xs text-red-500">{errors.contact_name.message}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Email */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-dark">{t('email')}</label>
          <input
            {...register('email')}
            type="email"
            autoComplete="email"
            placeholder="orders@yourcompany.ae"
            className={inputCls}
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-dark">{t('phone')}</label>
          <input
            {...register('phone')}
            type="tel"
            placeholder="+971 50 123 4567"
            className={inputCls}
          />
          {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
        </div>
      </div>

      {/* Business type */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-dark">{t('business_type')}</label>
        <select
          {...register('business_type')}
          className={`${inputCls} cursor-pointer`}
          defaultValue=""
        >
          <option value="" disabled>{t('business_type_placeholder')}</option>
          <option value="store">{t('business_type_store')}</option>
          <option value="groomer">{t('business_type_groomer')}</option>
          <option value="vet">{t('business_type_vet')}</option>
          <option value="distributor">{t('business_type_distributor')}</option>
          <option value="other">{t('business_type_other')}</option>
        </select>
        {errors.business_type && <p className="mt-1 text-xs text-red-500">{errors.business_type.message}</p>}
      </div>

      {/* Message */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-dark">{t('message')}</label>
        <textarea
          {...register('message')}
          rows={4}
          placeholder={t('message_placeholder')}
          className="w-full rounded-xl border border-fur-border bg-white px-4 py-3 text-sm text-text-dark placeholder:text-text-muted transition-colors focus:border-pink-primary focus:outline-none focus:ring-2 focus:ring-pink-primary/20 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-pink-primary py-3.5 font-semibold text-white shadow-lg shadow-pink-primary/25 transition-all hover:bg-pink-accent disabled:opacity-60"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {t('submit')}
      </button>
    </form>
  );
}
