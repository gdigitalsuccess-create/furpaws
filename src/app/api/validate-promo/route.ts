import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { rateLimit, getIp } from '@/lib/rateLimit';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  if (!rateLimit(`promo:${getIp(request)}`, 10, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const { code } = await request.json() as { code: string };
    if (!code?.trim()) return NextResponse.json({ error: 'No code provided' }, { status: 400 });

    const { data } = await stripe.promotionCodes.list({
      code: code.trim().toUpperCase(),
      active: true,
      limit: 1,
    });

    if (!data.length) return NextResponse.json({ error: 'Invalid or expired promo code' }, { status: 404 });

    const promo = data[0];
    const couponRef = promo.promotion.coupon;
    // couponRef may be a string (id) or expanded Coupon object
    const coupon = typeof couponRef === 'string'
      ? await stripe.coupons.retrieve(couponRef)
      : couponRef;

    if (!coupon || !coupon.valid) return NextResponse.json({ error: 'This promo code is no longer valid' }, { status: 404 });

    return NextResponse.json({
      id: promo.id,
      code: promo.code,
      percent_off: coupon.percent_off ?? null,
      amount_off: coupon.amount_off ? coupon.amount_off / 100 : null,
      name: coupon.name ?? promo.code,
    });
  } catch {
    return NextResponse.json({ error: 'Could not validate promo code' }, { status: 500 });
  }
}
