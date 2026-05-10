export const dynamic = 'force-dynamic';
import Stripe from 'stripe';
import { Tag, Plus, Calendar, Users } from 'lucide-react';
import CreatePromoForm from './CreatePromoForm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const metadata = { title: 'Promo Codes — Admin' };

export default async function PromosPage() {
  const [{ data: promoCodes }, { data: coupons }] = await Promise.all([
    stripe.promotionCodes.list({ limit: 20, active: true }),
    stripe.coupons.list({ limit: 20 }),
  ]);

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Promo Codes</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">

        {/* Active promo codes list */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="font-semibold text-gray-900">Active Codes</h2>
          </div>

          {promoCodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Tag className="mb-3 h-10 w-10 text-gray-300" />
              <p className="text-sm text-gray-400">No active promo codes yet.</p>
              <p className="text-xs text-gray-400">Create one using the form →</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {promoCodes.map((p) => {
                const couponRef = p.promotion.coupon;
                const c = typeof couponRef === 'string' ? null : couponRef;
                const discount = c?.percent_off
                  ? `${c.percent_off}% off`
                  : c?.amount_off ? `${(c.amount_off / 100).toFixed(2)} AED off` : 'Discount';
                const expires = p.expires_at
                  ? new Date(p.expires_at * 1000).toLocaleDateString('en-AE')
                  : null;
                const uses = p.times_redeemed;
                const maxUses = p.max_redemptions;

                return (
                  <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-pink-50 px-3 py-1 font-mono text-sm font-bold tracking-wider text-pink-primary">
                          {p.code}
                        </span>
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                          {discount}
                        </span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                        {expires && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> Expires {expires}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {uses} used{maxUses ? ` / ${maxUses} max` : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Create form */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm h-fit">
          <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
            <Plus className="h-4 w-4 text-pink-primary" />
            <h2 className="font-semibold text-gray-900">Create Promo Code</h2>
          </div>
          <div className="p-5">
            <CreatePromoForm coupons={coupons.map((c) => ({
              id: c.id,
              name: c.name ?? c.id,
              discount: c.percent_off ? `${c.percent_off}%` : `${((c.amount_off ?? 0) / 100).toFixed(2)} AED`,
            }))} />
          </div>
        </div>

      </div>
    </div>
  );
}
