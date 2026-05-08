'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WishlistItem {
  id: string;
  name_en: string;
  name_ar: string;
  slug: string;
  price_retail: number;
  images: string[];
  brand: string | null;
  stock_quantity: number;
}

interface WishlistStore {
  items: WishlistItem[];
  toggle: (item: WishlistItem) => void;
  remove: (id: string) => void;
  has: (id: string) => boolean;
  count: () => number;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      toggle: (item) =>
        set((state) => {
          const exists = state.items.some((i) => i.id === item.id);
          if (exists) return { items: state.items.filter((i) => i.id !== item.id) };
          return { items: [...state.items, item] };
        }),

      remove: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      has: (id) => get().items.some((i) => i.id === id),

      count: () => get().items.length,
    }),
    { name: 'furpaws-wishlist' }
  )
);
