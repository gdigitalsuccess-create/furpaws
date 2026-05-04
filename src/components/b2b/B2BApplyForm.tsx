'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, Clock, Upload, FileCheck } from 'lucide-react';

const inputCls =
  'h-11 w-full rounded-xl border border-fur-border bg-white px-4 text-sm text-text-dark placeholder:text-text-muted transition-colors focus:border-pink-primary focus:outline-none focus:ring-2 focus:ring-pink-primary/20';

function FileField({
  label,
  name,
  required,
  accept = 'image/*,application/pdf',
}: {
  label: string;
  name: string;
  required?: boolean;
  accept?: string;
}) {
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-text-dark">
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept={accept}
        required={required}
        className="hidden"
        onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex h-11 w-full items-center gap-3 rounded-xl border border-fur-border bg-white px-4 text-sm text-text-muted transition-colors hover:border-pink-primary hover:text-pink-primary"
      >
        {fileName ? (
          <><FileCheck className="h-4 w-4 shrink-0 text-emerald-500" /><span className="truncate text-text-dark">{fileName}</span></>
        ) : (
          <><Upload className="h-4 w-4 shrink-0" /><span>Upload PDF or image (max 5 MB)</span></>
        )}
      </button>
    </div>
  );
}

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

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError('');
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const res = await fetch('/api/b2b/apply', { method: 'POST', body: formData });
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
    <form onSubmit={onSubmit} className="space-y-4">
      {serverError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {serverError}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-dark">{t('company_name')}</label>
          <input name="company_name" required placeholder="ACME Pet Supplies LLC" className={inputCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-dark">{t('contact_name')}</label>
          <input name="contact_name" defaultValue={defaultName} required placeholder="Mohammed Al Rashid" className={inputCls} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-dark">{t('email')}</label>
          <input name="email" type="email" defaultValue={defaultEmail} required placeholder="orders@company.ae" className={inputCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-dark">{t('phone')}</label>
          <input name="phone" type="tel" required placeholder="+971 50 123 4567" className={inputCls} />
        </div>
      </div>

      {/* Business type */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-dark">{t('business_type')}</label>
        <select name="business_type" required defaultValue="" className={`${inputCls} cursor-pointer`}>
          <option value="" disabled>{t('business_type_placeholder')}</option>
          <option value="store">{t('business_type_store')}</option>
          <option value="groomer">{t('business_type_groomer')}</option>
          <option value="vet">{t('business_type_vet')}</option>
          <option value="distributor">{t('business_type_distributor')}</option>
          <option value="other">{t('business_type_other')}</option>
        </select>
      </div>

      {/* Divider */}
      <div className="border-t border-fur-border pt-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">UAE Business Verification</p>
      </div>

      {/* Trade License */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-dark">
            Trade License Number<span className="ml-0.5 text-red-500">*</span>
          </label>
          <input name="trade_license_number" required placeholder="CN-1234567" className={inputCls} />
        </div>
        <FileField label="Trade License Document" name="trade_license_doc" required />
      </div>

      {/* Emirates ID + TRN */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-dark">
            Emirates ID Number<span className="ml-0.5 text-red-500">*</span>
          </label>
          <input name="emirates_id_number" required placeholder="784-XXXX-XXXXXXX-X" className={inputCls} />
        </div>
        <FileField label="Emirates ID (copy)" name="emirates_id_doc" />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-dark">
          TRN Number <span className="text-xs font-normal text-text-muted">(optional — VAT registered)</span>
        </label>
        <input name="trn_number" placeholder="100XXXXXXXXX003" className={inputCls} />
      </div>

      {/* Message */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-dark">{t('message')}</label>
        <textarea
          name="message"
          rows={3}
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
