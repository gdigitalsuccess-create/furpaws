'use client';

import dynamic from 'next/dynamic';
import type { Database } from '@/types/database';

type Category = Database['public']['Tables']['categories']['Row'];
type Product  = Database['public']['Tables']['products']['Row'];
type CategoryWithParent = Pick<Category, 'id' | 'name_en' | 'slug' | 'parent_id' | 'sort_order'>;

const ProductForm = dynamic(() => import('./ProductForm'), { ssr: false });

interface Props {
  categories: CategoryWithParent[];
  brands?: string[];
  product?: Product;
}

export default function ProductFormWrapper({ categories, brands = [], product }: Props) {
  return <ProductForm categories={categories} brands={brands} product={product} />;
}
