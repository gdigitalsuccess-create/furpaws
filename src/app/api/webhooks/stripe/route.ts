import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const admin = createAdminClient();

  try {
    switch (event.type) {

      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent;

        // Check if order already exists (created by client-side /api/orders call)
        const { data: existing } = await admin
          .from('orders')
          .select('id')
          .eq('stripe_payment_intent_id', pi.id)
          .maybeSingle() as { data: { id: string } | null; error: unknown };

        if (existing) {
          // Ensure status is 'paid'
          await admin
            .from('orders')
            .update({ status: 'paid', stripe_payment_status: 'succeeded' } as never)
            .eq('stripe_payment_intent_id', pi.id);
        }
        // If order doesn't exist: client-side flow hasn't completed yet (or failed).
        // The order will be created by /api/orders or manually by admin.
        break;
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent;
        await admin
          .from('orders')
          .update({
            status: 'cancelled',
            stripe_payment_status: pi.last_payment_error?.code ?? 'failed',
          } as never)
          .eq('stripe_payment_intent_id', pi.id);
        break;
      }

      case 'payment_intent.canceled': {
        const pi = event.data.object as Stripe.PaymentIntent;
        await admin
          .from('orders')
          .update({ status: 'cancelled', stripe_payment_status: 'canceled' } as never)
          .eq('stripe_payment_intent_id', pi.id);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        if (charge.payment_intent) {
          await admin
            .from('orders')
            .update({ status: 'refunded' } as never)
            .eq('stripe_payment_intent_id', charge.payment_intent as string);
        }
        break;
      }

      default:
        // Unhandled event — acknowledge receipt
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error(`[webhook] Handler error for ${event.type}:`, err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

// Stripe requires the raw body — disable Next.js body parsing
export const config = {
  api: { bodyParser: false },
};
