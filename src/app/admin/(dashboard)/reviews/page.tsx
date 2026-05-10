export const dynamic = 'force-dynamic';
import { createAdminClient } from '@/lib/supabase/admin';
import ReviewActionButtons from '@/components/admin/ReviewActionButtons';
import { Star } from 'lucide-react';

export const metadata = { title: 'Admin — Reviews' };

type ReviewWithProduct = {
  id: string;
  rating: number;
  comment: string | null;
  is_approved: boolean;
  created_at: string;
  products: { name_en: string; slug: string } | null;
};

function Stars({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i <= value ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-gray-200'}`}
        />
      ))}
    </div>
  );
}

export default async function AdminReviewsPage() {
  const admin = createAdminClient();
  const { data: reviews } = await admin
    .from('reviews')
    .select('id, rating, comment, is_approved, created_at, products(name_en, slug)')
    .order('created_at', { ascending: false }) as { data: ReviewWithProduct[] | null };

  const pending = (reviews ?? []).filter((r) => !r.is_approved);
  const approved = (reviews ?? []).filter((r) => r.is_approved);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
        <div className="flex gap-3 text-sm">
          <span className="rounded-full bg-yellow-100 px-3 py-1 font-medium text-yellow-700">
            {pending.length} pending
          </span>
          <span className="rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-700">
            {approved.length} approved
          </span>
        </div>
      </div>

      {/* Pending first */}
      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Pending Approval</h2>
          <ReviewTable reviews={pending} />
        </div>
      )}

      {/* Approved */}
      {approved.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Approved</h2>
          <ReviewTable reviews={approved} />
        </div>
      )}

      {!reviews?.length && (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-400">
          No reviews yet.
        </div>
      )}
    </div>
  );
}

function ReviewTable({ reviews }: { reviews: ReviewWithProduct[] }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
            <th className="px-5 py-3 text-start">Product</th>
            <th className="px-4 py-3 text-start">Rating</th>
            <th className="px-4 py-3 text-start">Comment</th>
            <th className="px-4 py-3 text-start">Date</th>
            <th className="px-4 py-3 text-start">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {reviews.map((r) => {
            const date = new Intl.DateTimeFormat('en-AE', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(r.created_at));
            return (
              <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-3">
                  <p className="font-medium text-gray-900">{r.products?.name_en ?? '—'}</p>
                </td>
                <td className="px-4 py-3">
                  <Stars value={r.rating} />
                </td>
                <td className="px-4 py-3 max-w-xs">
                  <p className="text-gray-600 truncate">{r.comment ?? <span className="text-gray-300 italic">No comment</span>}</p>
                </td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{date}</td>
                <td className="px-4 py-3">
                  <ReviewActionButtons id={r.id} approved={r.is_approved} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
