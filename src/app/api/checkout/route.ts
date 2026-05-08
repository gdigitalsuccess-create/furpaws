import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { fetchPriceMap } from '@/lib/supabase/products';
import { calculateShipping, SHIPPING_FREE_THRESHOLD } from '@/lib/pricing';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

interface CartLineItem { id: string; quantity: number }

async function computeVerifiedTotal(
  items: CartLineItem[],
  emirate?: string,
  promoPercent?: number,
  promoAmount?: number,
): Promise<{ verifiedTotal: number; subtotal: number }> {
  const priceMap = await fetchPriceMap(items.map((i) => i.id));
  const subtotal = items.reduce((sum, i) => {
    const price = priceMap[i.id] ?? 0;
    return sum + price * i.quantity;
  }, 0);
  const shipping = calculateShipping(subtotal, emirate);
  let total = subtotal + shipping;
  if (promoPercent) total = total * (1 - promoPercent / 100);
  if (promoAmount)  total = total - promoAmount;
  return { verifiedTotal: Math.max(0.5, Math.round(total * 100) / 100), subtotal };
}

export async function POST(request: Request) {
  try {
    const { items, emirate, promoPercent, promoAmount } =
      (await request.json()) as { items: CartLineItem[]; emirate?: string; promoPercent?: number; promoAmount?: number };

    if (!items?.length) {
      return NextResponse.json({ error: 'No items' }, { status: 400 });
    }

    const { verifiedTotal } = await computeVerifiedTotal(items, emirate, promoPercent, promoAmount);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(verifiedTotal * 100),
      currency: 'aed',
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('[checkout] PaymentIntent error');
    return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { paymentIntentId, items, emirate, promoPercent, promoAmount } =
      (await request.json()) as { paymentIntentId: string; items: CartLineItem[]; emirate?: string; promoPercent?: number; promoAmount?: number };

    if (!paymentIntentId || !items?.length) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const { verifiedTotal } = await computeVerifiedTotal(items, emirate, promoPercent, promoAmount);

    await stripe.paymentIntents.update(paymentIntentId, {
      amount: Math.round(verifiedTotal * 100),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[checkout] Update PaymentIntent error');
    return NextResponse.json({ error: 'Failed to update payment intent' }, { status: 500 });
  }
}
