import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchPriceMap, checkStock, decrementStock } from '@/lib/supabase/products';
import { calculateShipping } from '@/lib/pricing';
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from '@/lib/email';
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
  customerName?: string;
  discount?: number;
}

export async function POST(request: Request) {
  try {
    const { paymentIntentId, shippingAddress, items, customerEmail, customerName, discount } =
      (await request.json()) as OrderPayload;

    // Verify payment status with Stripe before creating order
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json({ error: 'Payment not confirmed' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Block duplicate orders for the same PaymentIntent
    const { data: existing } = await supabase
      .from('orders')
      .select('id')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .maybeSingle() as { data: { id: string } | null };

    if (existing) {
      return NextResponse.json({ orderId: existing.id }); // idempotent — return existing order
    }

    // Fetch real prices from DB — never trust client-provided prices
    const priceMap = await fetchPriceMap(items.map((i) => i.id));
    const itemsSubtotal = items.reduce((s, i) => s + (priceMap[i.id] ?? 0) * i.quantity, 0);

    // Verify stock availability before creating order
    const stockError = await checkStock(items.map((i) => ({ id: i.id, quantity: i.quantity })));
    if (stockError) return NextResponse.json({ error: stockError }, { status: 409 });
    const shippingAmount = calculateShipping(itemsSubtotal, shippingAddress.emirate);
    const totalAmount = paymentIntent.amount / 100; // authoritative: what Stripe actually charged

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
      unit_price: priceMap[item.id] ?? 0,
      subtotal: (priceMap[item.id] ?? 0) * item.quantity,
    }));

    // Create order items
    await supabase.from('order_items').insert(orderItems as never);

    // Decrement stock asynchronously after confirmed order
    decrementStock(items.map((i) => ({ id: i.id, quantity: i.quantity }))).catch(() => {});

    // Send emails (non-blocking)
    const emailItems = items.map((item) => ({
      name: item.name_en,
      quantity: item.quantity,
      unitPrice: item.price,
      subtotal: item.price * item.quantity,
      image: item.image || undefined,
    }));
    const emailPayload = {
      orderId: order.id,
      customerEmail: customerEmail ?? '',
      customerName,
      items: emailItems,
      subtotal: itemsSubtotal,
      shippingAmount,
      discount,
      totalAmount,
      shippingAddress,
    };
    if (customerEmail) {
      sendOrderConfirmationEmail(emailPayload).catch(() => {});
    }
    sendAdminOrderNotification(emailPayload).catch(() => {});

    return NextResponse.json({ orderId: order.id });
  } catch (err) {
    console.error('[orders] Creation error:', err);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
