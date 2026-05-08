import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { assertAdmin } from '@/lib/assertAdmin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  if (!await assertAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { code, discountType, discountValue, maxUses, expiresAt } =
      await request.json() as {
        code: string;
        discountType: 'percent' | 'fixed';
        discountValue: number;
        maxUses: number | null;
        expiresAt: string | null;
      };

    const coupon = await stripe.coupons.create({
      ...(discountType === 'percent'
        ? { percent_off: discountValue }
        : { amount_off: Math.round(discountValue * 100), currency: 'aed' }),
      duration: 'once',
      name: code,
    });

    const promo = await stripe.promotionCodes.create({
      promotion: { type: 'coupon', coupon: coupon.id },
      code,
      ...(maxUses ? { max_redemptions: maxUses } : {}),
      ...(expiresAt ? { expires_at: Math.floor(new Date(expiresAt).getTime() / 1000) } : {}),
    });

    return NextResponse.json({ code: promo.code, id: promo.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to create promo code';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
