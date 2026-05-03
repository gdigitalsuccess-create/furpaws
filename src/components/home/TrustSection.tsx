import { getTranslations } from 'next-intl/server';
import { Truck, Star, Headphones, RefreshCw, MapPin } from 'lucide-react';

const TRUST_ITEMS = [
  { icon: Truck,       key: 'trust_shipping' },
  { icon: Star,        key: 'trust_quality' },
  { icon: Headphones,  key: 'trust_support' },
  { icon: RefreshCw,   key: 'trust_returns' },
  { icon: MapPin,      key: 'trust_uae' },
] as const;

export default async function TrustSection({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'home' });

  return (
    <section className="bg-pink-light py-14">
      <div className="container mx-auto px-4">
        <h2 className="mb-10 text-center text-2xl font-bold text-text-dark">
          {t('why_title')}
        </h2>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
          {TRUST_ITEMS.map(({ icon: Icon, key }) => (
            <div key={key} className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                <Icon className="h-6 w-6 text-pink-primary" />
              </div>
              <span className="text-sm font-semibold text-text-dark">{t(key)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
