import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { calculateShipping } from '@/lib/pricing';
import { sendOrderConfirmationEmail } from '@/lib/email';
import type { CartItem } from '@/store/cartStore';
import type { Database } from '@/types/database';

type OrderInsert = Database['public']['Tables']['orders']['Insert'];
type OrderItemInsert = Database['public']['Tables']['order_items']['Insert'];

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

interface OrderPayload {
  paymentIntentId: string;
  shippingAddress: Record<string, string>;
  items: CartItem[];
  customerEmail?: string;
}

export async function POST(request: Request) {
  try {
    const { paymentIntentId, shippingAddress, items, customerEmail } =
      (await request.json()) as OrderPayload;

    // Verify payment status with Stripe before creating order
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json({ error: 'Payment not confirmed' }, { status: 400 });
    }

    const itemsSubtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const shippingAmount = calculateShipping(itemsSubtotal);
    const totalAmount = paymentIntent.amount / 100;

    const supabase = createAdminClient();

    const orderInsert: OrderInsert = {
      user_id: null,
      status: 'paid',
      total_amount: totalAmount,
      shipping_amount: shippingAmount,
      shipping_address: shippingAddress,
      stripe_payment_intent_id: paymentIntentId,
      stripe_payment_status: 'succeeded',
      notes: null,
    };

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderInsert as never)
      .select('id')
      .single() as { data: { id: string } | null; error: { message: string } | null };

    if (orderError || !order) {
      throw new Error(orderError?.message ?? 'Order insert failed');
    }

    const orderItems: OrderItemInsert[] = items.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name_en,
      product_image: item.image || null,
      quantity: item.quantity,
      unit_price: item.price,
      subtotal: item.price * item.quantity,
    }));

    // Create order items
    await supabase.from('order_items').insert(orderItems as never);

    // Send confirmation email (non-blocking)
    if (customerEmail) {
      sendOrderConfirmationEmail({
        orderId: order.id,
        customerEmail,
        items: items.map((item) => ({
          name: item.name_en,
          quantity: item.quantity,
          unitPrice: item.price,
          subtotal: item.price * item.quantity,
        })),
        subtotal: itemsSubtotal,
        shippingAmount,
        totalAmount,
        shippingAddress,
      }).catch(() => {});
    }

    return NextResponse.json({ orderId: order.id });
  } catch (err) {
    console.error('[orders] Creation error:', err);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
