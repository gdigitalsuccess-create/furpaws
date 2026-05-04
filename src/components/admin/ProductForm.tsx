'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Upload, X, Link as LinkIcon, Languages, Plus, Trash2 } from 'lucide-react';
import type { Database } from '@/types/database';
import BrandCombobox from './BrandCombobox';

type Category = Database['public']['Tables']['categories']['Row'];
type Product  = Database['public']['Tables']['products']['Row'];
type CategoryWithParent = Pick<Category, 'id' | 'name_en' | 'slug' | 'parent_id' | 'sort_order'>;

export type ProductVariant = {
  name: string;
  price: number;
  stock: number;
};

const schema = z.object({
  name_en:         z.string().min(2),
  name_ar:         z.string().min(2),
  slug:            z.string().min(2).regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers and hyphens only'),
  description_en:  z.string().optional(),
  description_ar:  z.string().optional(),
  price_retail:    z.number().positive(),
  price_b2b:       z.number().positive().optional(),
  brand:           z.string().optional(),
  category_id:     z.string().optional(),
  stock_quantity:  z.number().int().min(0),
  is_active:       z.boolean(),
  is_featured:     z.boolean(),
  is_new:          z.boolean(),
  specs_raw:       z.string().optional(),
});

type Values = z.infer<typeof schema>;

const inputCls = 'h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-pink-primary focus:outline-none focus:ring-2 focus:ring-pink-primary/20';
const labelCls = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500';

const MAX_IMAGES = 5;

interface Props {
  categories: CategoryWithParent[];
  brands?: string[];
  product?: Product;
}

function parseVariants(raw: unknown): ProductVariant[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (v): v is ProductVariant =>
      typeof v === 'object' && v !== null &&
      typeof (v as ProductVariant).name === 'string' &&
      typeof (v as ProductVariant).price === 'number' &&
      typeof (v as ProductVariant).stock === 'number'
  );
}

export default function ProductForm({ categories, brands = [], product }: Props) {
  const parents = categories.filter((c) => !c.parent_id);
  const children = (parentId: string) => categories.filter((c) => c.parent_id === parentId);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isEdit = !!product;

  // Images
  const initialImages = Array.isArray(product?.images) ? (product.images as string[]) : [];
  const [images, setImages] = useState<string[]>(initialImages);
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Variants
  const [variants, setVariants] = useState<ProductVariant[]>(parseVariants(product?.variants));
  const [newVariant, setNewVariant] = useState<ProductVariant>({ name: '', price: 0, stock: 0 });

  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: product ? {
      name_en:        product.name_en,
      name_ar:        product.name_ar,
      slug:           product.slug,
      description_en: product.description_en ?? '',
      description_ar: product.description_ar ?? '',
      price_retail:   product.price_retail,
      price_b2b:      product.price_b2b ?? undefined,
      brand:          product.brand ?? '',
      category_id:    product.category_id ?? '',
      stock_quantity: product.stock_quantity,
      is_active:      product.is_active,
      is_featured:    product.is_featured,
      is_new:         (product as Product & { is_new?: boolean }).is_new ?? false,
      specs_raw:      product.specs ? JSON.stringify(product.specs, null, 2) : '',
    } : {
      is_active: true,
      is_featured: false,
      is_new: false,
      stock_quantity: 0,
    },
  });

  async function handleTranslate() {
    const nameEn = watch('name_en');
    const descEn = watch('description_en');
    if (!nameEn?.trim()) return;
    setTranslating(true);
    setTranslateError('');
    try {
      const requests = [
        fetch('/api/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: nameEn }) }),
        descEn?.trim()
          ? fetch('/api/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: descEn }) })
          : Promise.resolve(null),
      ];
      const [nameRes, descRes] = await Promise.all(requests);
      const nameData = await nameRes?.json() as { translated?: string; error?: string };
      if (nameData?.error) { setTranslateError(nameData.error); return; }
      if (nameData?.translated) setValue('name_ar', nameData.translated, { shouldValidate: true });
      if (descRes) {
        const descData = await descRes.json() as { translated?: string };
        if (descData?.translated) setValue('description_ar', descData.translated, { shouldValidate: true });
      }
    } catch {
      setTranslateError('Translation failed. Check your connection.');
    } finally {
      setTranslating(false);
    }
  }

  function addUrlImage() {
    const url = urlInput.trim();
    if (!url || images.length >= MAX_IMAGES) return;
    setImages((prev) => [...prev, url]);
    setUrlInput('');
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || images.length >= MAX_IMAGES) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok || !data.url) { setError(data.error ?? 'Upload failed'); return; }
      setImages((prev) => [...prev, data.url!]);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  function removeImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  function addVariant() {
    if (!newVariant.name.trim() || newVariant.price <= 0) return;
    setVariants((prev) => [...prev, { ...newVariant }]);
    setNewVariant({ name: '', price: 0, stock: 0 });
  }

  function removeVariant(idx: number) {
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateVariant(idx: number, field: keyof ProductVariant, value: string | number) {
    setVariants((prev) => prev.map((v, i) => i === idx ? { ...v, [field]: value } : v));
  }

  async function onSubmit(values: Values) {
    setError('');
    setLoading(true);
    try {
      let specs: unknown = {};
      try { specs = values.specs_raw ? JSON.parse(values.specs_raw) : {}; } catch { specs = {}; }

      const body = {
        name_en:        values.name_en,
        name_ar:        values.name_ar,
        slug:           values.slug,
        description_en: values.description_en || null,
        description_ar: values.description_ar || null,
        price_retail:   values.price_retail,
        price_b2b:      values.price_b2b && !isNaN(values.price_b2b) ? values.price_b2b : null,
        brand:          values.brand || null,
        category_id:    values.category_id || null,
        stock_quantity: variants.length > 0
          ? variants.reduce((sum, v) => sum + v.stock, 0)
          : values.stock_quantity,
        is_active:      values.is_active,
        is_featured:    values.is_featured,
        is_new:         values.is_new,
        images,
        specs,
        variants,
      };

      const url = isEdit ? `/api/admin/products/${product.id}` : '/api/admin/products';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Something went wrong.');
        return;
      }

      router.push('/admin/products');
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {/* Names + Descriptions */}
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Name & Description</span>
          <div className="flex items-center gap-3">
            {translateError && <p className="text-xs text-red-500">{translateError}</p>}
            <button type="button" onClick={handleTranslate} disabled={translating}
              className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-60 transition-colors">
              {translating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Languages className="h-3.5 w-3.5" />}
              {translating ? 'Translating...' : 'Auto-translate to Arabic →'}
            </button>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Name (EN)</label>
            <input {...register('name_en')} placeholder="Premium Dog Collar" className={inputCls} />
            {errors.name_en && <p className="mt-1 text-xs text-red-500">{errors.name_en.message}</p>}
          </div>
          <div>
            <label className={labelCls}>Name (AR)</label>
            <input {...register('name_ar')} placeholder="يُملأ automatiquement" dir="rtl" className={inputCls} />
            {errors.name_ar && <p className="mt-1 text-xs text-red-500">{errors.name_ar.message}</p>}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Description (EN)</label>
            <textarea {...register('description_en')} rows={4} placeholder="Product description in English..." className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-pink-primary focus:outline-none focus:ring-2 focus:ring-pink-primary/20 resize-none" />
          </div>
          <div>
            <label className={labelCls}>Description (AR)</label>
            <textarea {...register('description_ar')} rows={4} dir="rtl" placeholder="يُملأ automatiquement..." className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-pink-primary focus:outline-none focus:ring-2 focus:ring-pink-primary/20 resize-none" />
          </div>
        </div>
      </div>

      {/* Slug */}
      <div>
        <label className={labelCls}>Slug</label>
        <input {...register('slug')} placeholder="premium-dog-collar" className={inputCls} />
        {errors.slug && <p className="mt-1 text-xs text-red-500">{errors.slug.message}</p>}
      </div>

      {/* Base Price + B2B + Stock (stock masqué si variants) */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={labelCls}>Base Price (AED)</label>
          <input {...register('price_retail', { valueAsNumber: true })} type="number" step="0.01" min="0" placeholder="99.00" className={inputCls} />
          {errors.price_retail && <p className="mt-1 text-xs text-red-500">{errors.price_retail.message}</p>}
        </div>
        <div>
          <label className={labelCls}>B2B Price (AED)</label>
          <input {...register('price_b2b', { valueAsNumber: true })} type="number" step="0.01" min="0" placeholder="Optional" className={inputCls} />
        </div>
        {variants.length === 0 && (
          <div>
            <label className={labelCls}>Stock Qty</label>
            <input {...register('stock_quantity', { valueAsNumber: true })} type="number" min="0" placeholder="0" className={inputCls} />
            {errors.stock_quantity && <p className="mt-1 text-xs text-red-500">{errors.stock_quantity.message}</p>}
          </div>
        )}
      </div>

      {/* Brand + Category */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Brand</label>
          <BrandCombobox
            value={watch('brand') ?? ''}
            onChange={(val) => setValue('brand', val)}
            brands={brands}
          />
        </div>
        <div>
          <label className={labelCls}>Category</label>
          <select {...register('category_id')} className={`${inputCls} cursor-pointer`}>
            <option value="">— No category —</option>
            {parents.map((parent) => {
              const subs = children(parent.id);
              return subs.length > 0 ? (
                <optgroup key={parent.id} label={parent.name_en}>
                  {subs.map((sub) => (
                    <option key={sub.id} value={sub.id}>{sub.name_en}</option>
                  ))}
                </optgroup>
              ) : (
                <option key={parent.id} value={parent.id}>{parent.name_en}</option>
              );
            })}
          </select>
        </div>
      </div>

      {/* ── VARIANTS ── */}
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Variants (size, weight…)
          </span>
          {variants.length > 0 && (
            <span className="text-xs text-gray-400">
              Total stock: {variants.reduce((s, v) => s + v.stock, 0)} units
            </span>
          )}
        </div>

        {/* Existing variants */}
        {variants.length > 0 && (
          <div className="space-y-2">
            {/* Header */}
            <div className="grid grid-cols-[1fr_100px_80px_32px] gap-2 px-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Name</span>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Price (AED)</span>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Stock</span>
              <span />
            </div>
            {variants.map((v, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_100px_80px_32px] gap-2 items-center">
                <input
                  value={v.name}
                  onChange={(e) => updateVariant(idx, 'name', e.target.value)}
                  placeholder="S / M / 400g"
                  className={inputCls}
                />
                <input
                  type="number" step="0.01" min="0"
                  value={v.price}
                  onChange={(e) => updateVariant(idx, 'price', parseFloat(e.target.value) || 0)}
                  className={inputCls}
                />
                <input
                  type="number" min="0"
                  value={v.stock}
                  onChange={(e) => updateVariant(idx, 'stock', parseInt(e.target.value) || 0)}
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={() => removeVariant(idx)}
                  className="flex h-10 w-8 items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add new variant row */}
        <div className="grid grid-cols-[1fr_100px_80px_auto] gap-2 items-end">
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-gray-400">Name</label>
            <input
              value={newVariant.name}
              onChange={(e) => setNewVariant((p) => ({ ...p, name: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addVariant())}
              placeholder="S / M / L / 400g / 1kg"
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-gray-400">Price</label>
            <input
              type="number" step="0.01" min="0"
              value={newVariant.price || ''}
              onChange={(e) => setNewVariant((p) => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
              placeholder="0.00"
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-gray-400">Stock</label>
            <input
              type="number" min="0"
              value={newVariant.stock || ''}
              onChange={(e) => setNewVariant((p) => ({ ...p, stock: parseInt(e.target.value) || 0 }))}
              placeholder="0"
              className={inputCls}
            />
          </div>
          <button
            type="button"
            onClick={addVariant}
            disabled={!newVariant.name.trim() || newVariant.price <= 0}
            className="flex h-10 items-center gap-1.5 rounded-lg bg-pink-primary px-3 text-sm font-semibold text-white hover:bg-pink-accent disabled:opacity-40 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>

        {variants.length === 0 && (
          <p className="text-xs text-gray-400">
            No variants — product has a single price &amp; stock (fields above).
          </p>
        )}
      </div>

      {/* ── IMAGES (max 5) ── */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className={labelCls}>Images</label>
          <span className={`text-xs font-medium ${images.length >= MAX_IMAGES ? 'text-red-500' : 'text-gray-400'}`}>
            {images.length} / {MAX_IMAGES}
          </span>
        </div>

        {images.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {images.map((url, idx) => (
              <div key={idx} className="relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                {idx === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 bg-pink-primary/80 text-center text-[9px] font-bold uppercase text-white py-0.5">
                    Main
                  </span>
                )}
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {images.length < MAX_IMAGES && (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUrlImage())}
                  placeholder="https://example.com/image.jpg"
                  className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-pink-primary focus:outline-none focus:ring-2 focus:ring-pink-primary/20"
                />
              </div>
              <button type="button" onClick={addUrlImage}
                className="rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Add URL
              </button>
            </div>
            <div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleFileUpload} className="hidden" />
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                className="flex h-10 items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 text-sm font-medium text-gray-500 hover:border-pink-primary hover:text-pink-primary transition-colors disabled:opacity-50">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? 'Uploading...' : 'Upload from computer (max 5MB)'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Specs JSON */}
      <div>
        <label className={labelCls}>Specs (JSON object, optional)</label>
        <textarea {...register('specs_raw')} rows={3} placeholder='{"Weight": "500g", "Material": "Nylon"}' className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 font-mono text-xs text-gray-900 placeholder:text-gray-400 focus:border-pink-primary focus:outline-none focus:ring-2 focus:ring-pink-primary/20 resize-none" />
      </div>

      {/* Flags */}
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Visibility</p>
        <div className="flex flex-wrap gap-5">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
            <input {...register('is_active')} type="checkbox" className="h-4 w-4 rounded border-gray-300 text-pink-primary focus:ring-pink-primary/30" />
            <span>Active <span className="text-xs text-gray-400">(visible in shop)</span></span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
            <input {...register('is_new')} type="checkbox" className="h-4 w-4 rounded border-gray-300 text-pink-primary focus:ring-pink-primary/30" />
            <span>New In <span className="text-xs text-gray-400">(homepage "New In" section)</span></span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
            <input {...register('is_featured')} type="checkbox" className="h-4 w-4 rounded border-gray-300 text-pink-primary focus:ring-pink-primary/30" />
            <span>Bestseller <span className="text-xs text-gray-400">(homepage "Bestsellers" section)</span></span>
          </label>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
        <button type="submit" disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-pink-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-pink-accent disabled:opacity-60 transition-colors">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isEdit ? 'Save Changes' : 'Create Product'}
        </button>
        <a href="/admin/products" className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
          Cancel
        </a>
      </div>
    </form>
  );
}
