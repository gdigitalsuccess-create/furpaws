'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RecentProduct {
  id: string;
  name_en: string;
  name_ar: string;
  slug: string;
  price_retail: number;
  price_b2b?: number | null;
  images: string[];
  brand: string | null;
  stock_quantity: number;
}

const MAX_ITEMS = 6;

interface RecentlyViewedStore {
  items: RecentProduct[];
  add: (product: RecentProduct) => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set) => ({
      items: [],
      add: (product) =>
        set((state) => {
          const filtered = state.items.filter((i) => i.id !== product.id);
          return { items: [product, ...filtered].slice(0, MAX_ITEMS) };
        }),
    }),
    { name: 'furpaws-recently-viewed' }
  )
);
