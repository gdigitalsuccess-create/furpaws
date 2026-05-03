import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const { total } = (await request.json()) as { total: number };

    if (!total || total <= 0) {
      return NextResponse.json({ error: 'Invalid total' }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // AED → fils (smallest unit)
      currency: 'aed',
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('[checkout] PaymentIntent error:', err);
    return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 });
  }
}
