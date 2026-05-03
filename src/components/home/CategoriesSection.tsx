import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';

type Category = {
  key: 'dogs' | 'cats' | 'small_animals' | 'veterinary';
  href: string;
  image: string;
};

const CATEGORIES: Category[] = [
  { key: 'dogs', href: '/shop/dogs', image: '/categories/dogs.jpg' },
  { key: 'cats', href: '/shop/cats', image: '/categories/cats.jpg' },
  { key: 'small_animals', href: '/shop/small-animals', image: '/categories/small-animals.jpg' },
  { key: 'veterinary', href: '/shop/veterinary', image: '/categories/veterinary.jpg' },
];

export default async function CategoriesSection({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'home' });
  const tNav = await getTranslations({ locale, namespace: 'nav' });

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-10 text-center text-3xl font-bold text-text-dark">
          {t('categories_title')}
        </h2>

        <div className="flex flex-wrap justify-center gap-6 md:gap-10">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.key}
              href={cat.href}
              className="group flex flex-col items-center gap-3"
            >
              <div className="relative h-28 w-28 overflow-hidden rounded-full ring-2 ring-transparent transition-all duration-300 group-hover:ring-4 group-hover:ring-pink-400 group-hover:scale-105 md:h-36 md:w-36">
                <Image
                  src={cat.image}
                  alt={tNav(cat.key)}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 112px, 144px"
                />
              </div>
              <span className="text-center text-sm font-semibold text-text-dark group-hover:text-pink-500 transition-colors">
                {tNav(cat.key)}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
