export const dynamic = 'force-dynamic';
import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { Plus, Pencil } from 'lucide-react';
import { formatPrice } from '@/lib/pricing';
import DeleteProductButton from '@/components/admin/DeleteProductButton';
import type { Product } from '@/types/database';

type ProductRow = Pick<Product, 'id' | 'name_en' | 'brand' | 'price_retail' | 'stock_quantity' | 'is_active' | 'is_featured' | 'is_new' | 'category_id'>;

export const metadata = { title: 'Admin — Products' };

export default async function AdminProductsPage() {
  const admin = createAdminClient();
  const { data: products } = await admin
    .from('products')
    .select('id, name_en, brand, price_retail, stock_quantity, is_active, is_featured, is_new, category_id')
    .order('created_at', { ascending: false }) as { data: ProductRow[] | null; error: unknown };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 rounded-lg bg-pink-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-pink-accent transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
              <th className="px-5 py-3 text-start">Name</th>
              <th className="px-4 py-3 text-start">Brand</th>
              <th className="px-4 py-3 text-end">Price</th>
              <th className="px-4 py-3 text-center">Stock</th>
              <th className="px-4 py-3 text-center">Active</th>
              <th className="px-4 py-3 text-center">New In</th>
              <th className="px-4 py-3 text-center">Bestseller</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(products ?? []).map((p) => (
              <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-3 font-medium text-gray-900 max-w-[200px] truncate">{p.name_en}</td>
                <td className="px-4 py-3 text-gray-500">{p.brand ?? '—'}</td>
                <td className="px-4 py-3 text-end text-gray-700">{formatPrice(p.price_retail, 'en')}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-semibold ${p.stock_quantity < 5 ? 'text-red-600' : 'text-gray-700'}`}>
                    {p.stock_quantity}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block h-2 w-2 rounded-full ${p.is_active ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block h-2 w-2 rounded-full ${p.is_new ? 'bg-blue-500' : 'bg-gray-300'}`} />
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block h-2 w-2 rounded-full ${p.is_featured ? 'bg-pink-primary' : 'bg-gray-300'}`} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                    <DeleteProductButton id={p.id} name={p.name_en} />
                  </div>
                </td>
              </tr>
            ))}
            {!products?.length && (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-sm text-gray-400">
                  No products yet. <Link href="/admin/products/new" className="text-pink-primary hover:underline">Add one →</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
