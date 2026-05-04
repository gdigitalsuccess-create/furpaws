import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import ProductFormWrapper from '@/components/admin/ProductFormWrapper';

export const metadata = { title: 'Admin — Edit Product' };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();

  const [productRes, categoriesRes, brandsRes] = await Promise.all([
    admin.from('products').select('*').eq('id', id).single(),
    admin.from('categories').select('id, name_en, name_ar, slug, parent_id, sort_order').eq('is_active', true).order('sort_order'),
    admin.from('products').select('brand').not('brand', 'is', null),
  ]);
  const product = productRes.data;
  const categories = categoriesRes.data;
  const brands = [...new Set(
    ((brandsRes.data ?? []) as { brand: string | null }[]).map((p) => p.brand).filter((b): b is string => b !== null)
  )].sort();

  if (!product) notFound();

  return (
    <div className="p-8">
      <Link href="/admin/products" className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
        <ChevronLeft className="h-4 w-4" />
        Back to Products
      </Link>
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Edit Product</h1>
      <div className="max-w-3xl rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <ProductFormWrapper categories={categories ?? []} brands={brands} product={product} />
      </div>
    </div>
  );
}
