'use client';

import { useState } from 'react';
import ReviewsSection from './ReviewsSection';
import type { ReviewRow } from '@/lib/supabase/reviews';

interface ProductTabsProps {
  description: string | null;
  specs: Record<string, string> | null;
  reviews: ReviewRow[];
  productId: string;
  isLoggedIn: boolean;
  locale: string;
}

export default function ProductTabs({
  description,
  specs,
  reviews,
  productId,
  isLoggedIn,
  locale,
}: ProductTabsProps) {
  const isAr = locale === 'ar';

  const tabs = [
    {
      id: 'description',
      label: isAr ? 'الوصف' : 'Description',
      show: !!description,
    },
    {
      id: 'specs',
      label: isAr ? 'المواصفات' : 'Specifications',
      show: !!specs && Object.keys(specs).length > 0,
    },
    {
      id: 'reviews',
      label: isAr ? `التقييمات (${reviews.length})` : `Reviews (${reviews.length})`,
      show: true,
    },
  ].filter((t) => t.show);

  const [active, setActive] = useState(tabs[0]?.id ?? 'reviews');

  return (
    <div className="mt-10">
      {/* Tab bar */}
      <div className="flex border-b border-fur-border overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`shrink-0 px-6 py-3 text-sm font-semibold transition-colors whitespace-nowrap border-b-2 -mb-px ${
              active === tab.id
                ? 'border-pink-primary text-pink-primary'
                : 'border-transparent text-text-muted hover:text-text-dark hover:border-fur-border'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="pt-6">

        {active === 'description' && description && (
          <p className="text-sm leading-relaxed text-text-dark whitespace-pre-line max-w-3xl">
            {description}
          </p>
        )}

        {active === 'specs' && specs && (
          <table className="w-full max-w-lg text-sm">
            <tbody>
              {Object.entries(specs).map(([key, val]) => (
                <tr key={key} className="border-b border-fur-border last:border-0">
                  <td className="py-2.5 pe-6 font-medium text-text-muted w-1/3">{key}</td>
                  <td className="py-2.5 text-text-dark">{String(val)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {active === 'reviews' && (
          <ReviewsSection
            reviews={reviews}
            productId={productId}
            isLoggedIn={isLoggedIn}
            locale={locale}
          />
        )}
      </div>
    </div>
  );
}
