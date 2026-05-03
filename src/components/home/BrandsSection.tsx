import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';

const BRANDS = [
  { name: 'FurPaws', image: '/brands/furpaws.png', href: '/shop/brands' },
  { name: 'Andis', image: '/brands/andis-removebg-preview.png', href: '/shop/brands' },
];

export default async function BrandsSection({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'home' });

  return (
    <section className="bg-white py-14">
      <div className="container mx-auto px-4">
        <h2 className="mb-10 text-2xl font-bold text-text-dark">{t('brands_title')}</h2>

        <div className="flex flex-wrap gap-8">
          {BRANDS.map((brand) => (
            <Link
              key={brand.name}
              href={brand.href}
              className="group flex flex-col items-center gap-3"
            >
              <div className="relative h-36 w-36 overflow-hidden rounded-full border-4 border-[#e91e8c] bg-white transition-all duration-300 group-hover:scale-105 group-hover:border-[#c4167a]">
                <Image
                  src={brand.image}
                  alt={brand.name}
                  fill
                  className="object-contain p-4"
                  sizes="144px"
                />
              </div>
              <span className="text-sm font-semibold text-text-dark group-hover:text-pink-500 transition-colors">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
