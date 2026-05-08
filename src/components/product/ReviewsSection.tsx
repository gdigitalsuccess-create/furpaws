'use client';

import { useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import type { ReviewRow } from '@/lib/supabase/reviews';

interface ReviewsSectionProps {
  reviews: ReviewRow[];
  productId: string;
  isLoggedIn: boolean;
  locale: string;
}

const t = {
  en: {
    reviews: 'Reviews',
    no_reviews: 'No reviews yet. Be the first!',
    write_review: 'Write a Review',
    your_rating: 'Your Rating',
    your_comment: 'Your comment (optional)',
    submit: 'Submit Review',
    pending: 'Thank you! Your review will appear after approval.',
    already_reviewed: 'You have already reviewed this product.',
    login_to_review: 'Log in to leave a review',
    anonymous: 'Customer',
  },
  ar: {
    reviews: 'التقييمات',
    no_reviews: 'لا توجد تقييمات بعد. كن الأول!',
    write_review: 'اكتب تقييماً',
    your_rating: 'تقييمك',
    your_comment: 'تعليقك (اختياري)',
    submit: 'إرسال التقييم',
    pending: 'شكراً! سيظهر تقييمك بعد الموافقة.',
    already_reviewed: 'لقد قيّمت هذا المنتج من قبل.',
    login_to_review: 'سجّل الدخول لترك تقييم',
    anonymous: 'عميل',
  },
};

function Stars({ value, interactive = false, onChange }: {
  value: number;
  interactive?: boolean;
  onChange?: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  const display = interactive ? (hovered || value) : value;

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type={interactive ? 'button' : undefined}
          disabled={!interactive}
          onClick={() => onChange?.(i)}
          onMouseEnter={() => interactive && setHovered(i)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={interactive ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default'}
          aria-label={interactive ? `${i} star` : undefined}
        >
          <Star
            className={`h-5 w-5 transition-colors ${
              i <= display ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function formatDate(dateStr: string, locale: string) {
  return new Date(dateStr).toLocaleDateString(locale === 'ar' ? 'ar-AE' : 'en-AE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function ReviewsSection({ reviews, productId, isLoggedIn, locale }: ReviewsSectionProps) {
  const lang = locale === 'ar' ? t.ar : t.en;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'already' | 'error'>('idle');

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (rating === 0) return;
    setStatus('loading');

    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId, rating, comment: comment || undefined }),
    });

    if (res.status === 409) { setStatus('already'); return; }
    if (!res.ok) { setStatus('error'); return; }
    setStatus('done');
  }

  const avg = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : 0;

  return (
    <section>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="h-6 w-6 text-pink-primary" />
        <h2 className="text-2xl font-bold text-text-dark">{lang.reviews}</h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2 ms-2">
            <Stars value={Math.round(avg)} />
            <span className="text-sm text-text-muted font-medium">{avg} ({reviews.length})</span>
          </div>
        )}
      </div>

      {/* Review list */}
      {reviews.length === 0 ? (
        <p className="text-sm text-text-muted mb-8">{lang.no_reviews}</p>
      ) : (
        <div className="space-y-5 mb-10">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-2xl border border-fur-border bg-white p-5">
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-pink-light flex items-center justify-center text-pink-primary font-bold text-sm select-none">
                    {lang.anonymous[0].toUpperCase()}
                  </div>
                  <span className="font-semibold text-sm text-text-dark">
                    {lang.anonymous}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Stars value={r.rating} />
                  <span className="text-xs text-text-muted">{formatDate(r.created_at, locale)}</span>
                </div>
              </div>
              {r.comment && (
                <p className="text-sm text-text-dark leading-relaxed mt-2">{r.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Submit form */}
      {!isLoggedIn ? (
        <div className="rounded-2xl border border-dashed border-fur-border p-6 text-center text-sm text-text-muted">
          <a href={`/${locale}/account/login`} className="text-pink-primary font-semibold hover:underline">
            {lang.login_to_review}
          </a>
        </div>
      ) : status === 'done' ? (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-5 py-4 text-sm text-emerald-700 font-medium">
          {lang.pending}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-fur-border bg-off-white p-6 space-y-4">
          <h3 className="font-semibold text-text-dark">{lang.write_review}</h3>

          <div>
            <p className="text-xs text-text-muted mb-2">{lang.your_rating}</p>
            <Stars value={rating} interactive onChange={setRating} />
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={lang.your_comment}
            rows={3}
            maxLength={1000}
            className="w-full rounded-xl border border-fur-border bg-white px-4 py-3 text-sm text-text-dark placeholder:text-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-pink-primary/30 focus:border-pink-primary transition-colors"
          />

          {(status === 'already' || status === 'error') && (
            <p className="text-sm text-red-500">
              {status === 'already' ? lang.already_reviewed : 'An error occurred. Please try again.'}
            </p>
          )}

          <button
            type="submit"
            disabled={rating === 0 || status === 'loading'}
            className="flex items-center gap-2 rounded-xl bg-pink-primary px-6 py-3 text-sm font-semibold text-white shadow-md shadow-pink-primary/20 transition-all hover:bg-pink-accent hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
          >
            {status === 'loading' ? (
              <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            ) : (
              <Star className="h-4 w-4" />
            )}
            {lang.submit}
          </button>
        </form>
      )}
    </section>
  );
}
