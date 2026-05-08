'use client';

import { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';

interface ShareButtonsProps {
  name: string;
  url: string;
  locale: string;
}

const PLATFORMS = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    color: 'bg-[#25D366] hover:bg-[#1ebe5d]',
    href: (url: string, name: string) =>
      `https://wa.me/?text=${encodeURIComponent(`${name}\n${url}`)}`,
    icon: (
      <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.135.564 4.14 1.543 5.876L.057 23.886a.5.5 0 0 0 .611.61l6.115-1.474A11.946 11.946 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.882a9.876 9.876 0 0 1-5.031-1.378l-.36-.214-3.733.9.937-3.63-.235-.374A9.844 9.844 0 0 1 2.118 12C2.118 6.52 6.52 2.118 12 2.118S21.882 6.52 21.882 12 17.48 21.882 12 21.882z"/>
      </svg>
    ),
  },
  {
    id: 'facebook',
    label: 'Facebook',
    color: 'bg-[#1877F2] hover:bg-[#1468d8]',
    href: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    icon: (
      <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.514c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
      </svg>
    ),
  },
  {
    id: 'instagram',
    label: 'Instagram',
    color: 'bg-gradient-to-br from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888] hover:opacity-90',
    href: (url: string, name: string) =>
      `https://www.instagram.com/?url=${encodeURIComponent(url)}`,
    icon: (
      <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
      </svg>
    ),
  },
  {
    id: 'snapchat',
    label: 'Snapchat',
    color: 'bg-[#FFFC00] hover:bg-[#f0ed00]',
    textColor: 'text-black',
    href: (url: string) =>
      `https://www.snapchat.com/scan?attachmentUrl=${encodeURIComponent(url)}`,
    icon: (
      <svg className="h-4 w-4 fill-black" viewBox="0 0 24 24">
        <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.505.07.038.153.08.254.12.226.09.507.164.75.164.29 0 .489-.093.65-.334.162-.241.261-.548.374-.826.11-.27.232-.51.4-.685.166-.177.41-.325.656-.325.231 0 .434.072.585.207.17.153.26.36.26.573 0 .41-.278.768-.552.968-.22.157-.297.345-.403.614-.135.334-.296.718-.58.927-.116.085-.174.215-.166.346.014.254.124.546.296.839.216.369.622.794 1.286 1.02a2.57 2.57 0 0 1 .256.09 2.285 2.285 0 0 1 .178.074c.28.125.46.385.46.654 0 .302-.166.595-.543.782-.428.213-.952.282-1.512.328a5.42 5.42 0 0 0-.58.083c-.064.021-.13.043-.2.066-.233.077-.507.167-.795.386-.26.2-.46.463-.653.715-.303.397-.623.81-1.194 1.076C17.01 22.832 16.2 23.083 15 23.083c-1.2 0-2.013-.253-2.743-.497-.57-.265-.893-.677-1.194-1.076-.194-.252-.393-.515-.653-.715-.288-.219-.563-.309-.795-.386-.069-.023-.136-.045-.2-.066a5.42 5.42 0 0 0-.58-.083c-.56-.046-1.085-.115-1.513-.328-.376-.187-.543-.48-.543-.782 0-.27.18-.529.46-.654a2.285 2.285 0 0 1 .178-.074 2.57 2.57 0 0 1 .256-.09c.664-.226 1.07-.651 1.286-1.02.172-.293.282-.585.296-.839.008-.131-.05-.261-.166-.346-.284-.209-.445-.593-.58-.927-.106-.27-.183-.457-.403-.614-.274-.2-.552-.558-.552-.968 0-.213.09-.42.26-.573.151-.135.354-.207.585-.207.246 0 .49.148.656.325.168.175.29.415.4.685.113.278.212.585.374.826.161.241.36.334.65.334.243 0 .524-.074.75-.164.101-.04.184-.082.254-.12l-.03-.505c-.104-1.628-.23-3.654.299-4.847C7.86 1.07 11.215.793 12.206.793z"/>
      </svg>
    ),
  },
];

export default function ShareButtons({ name, url, locale }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="flex items-center gap-1.5 text-sm font-medium text-text-muted">
        <Share2 className="h-4 w-4" />
        {locale === 'ar' ? 'مشاركة:' : 'Share:'}
      </span>

      {PLATFORMS.map((p) => (
        <a
          key={p.id}
          href={p.href(url, name)}
          target="_blank"
          rel="noopener noreferrer"
          title={p.label}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold shadow-sm transition-all hover:-translate-y-0.5 ${p.color} ${p.textColor ?? 'text-white'}`}
        >
          {p.icon}
          <span className="hidden sm:inline">{p.label}</span>
        </a>
      ))}

      {/* Copy link */}
      <button
        onClick={handleCopy}
        title={locale === 'ar' ? 'نسخ الرابط' : 'Copy link'}
        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all hover:-translate-y-0.5 ${
          copied
            ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
            : 'border-fur-border bg-white text-text-dark hover:border-pink-primary hover:text-pink-primary'
        }`}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        <span className="hidden sm:inline">
          {copied
            ? (locale === 'ar' ? 'تم النسخ!' : 'Copied!')
            : (locale === 'ar' ? 'نسخ الرابط' : 'Copy link')}
        </span>
      </button>
    </div>
  );
}
