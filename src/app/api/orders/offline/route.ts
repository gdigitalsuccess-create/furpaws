import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchPriceMap, checkStock, decrementStock } from '@/lib/supabase/products';
import { calculateShipping } from '@/lib/pricing';
import { sendOrderConfirmationEmail, sendAdminOrderNotification, sendBankTransferEmail } from '@/lib/email';
import type { Database } from '@/types/database';

type OrderInsert = Database['public']['Tables']['orders']['Insert'];
type OrderItemInsert = Database['public']['Tables']['order_items']['Insert'];

interface LineItem { id: string; name_en: string; quantity: number; image?: string | null }

interface OfflineOrderPayload {
  shippingAddress: Record<string, string>;
  items: LineItem[];
  customerEmail?: string;
  customerName?: string;
  promoPercent?: number;
  promoAmount?: number;
  paymentMethod: 'cod' | 'bank_transfer';
}

export async function POST(request: Request) {
  try {
    const { shippingAddress, items, customerEmail, customerName, promoPercent, promoAmount, paymentMethod } =
      (await request.json()) as OfflineOrderPayload;

    if (!items?.length || !shippingAddress?.emirate) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Recalculate prices from DB — never trust client
    const priceMap = await fetchPriceMap(items.map((i) => i.id));
    const itemsSubtotal = items.reduce((s, i) => s + (priceMap[i.id] ?? 0) * i.quantity, 0);

    const stockError = await checkStock(items.map((i) => ({ id: i.id, quantity: i.quantity })));
    if (stockError) return NextResponse.json({ error: stockError }, { status: 409 });
    const shippingAmount = calculateShipping(itemsSubtotal, shippingAddress.emirate);
    let totalAmount = itemsSubtotal + shippingAmount;
    if (promoPercent) totalAmount = totalAmount * (1 - promoPercent / 100);
    if (promoAmount)  totalAmount = totalAmount - promoAmount;
    totalAmount = Math.max(0, Math.round(totalAmount * 100) / 100);
    const discount = (promoPercent ? totalAmount * promoPercent / 100 : 0) + (promoAmount ?? 0);

    const supabase = createAdminClient();

    const orderInsert: OrderInsert = {
      user_id: null,
      status: 'pending',
      total_amount: totalAmount,
      shipping_amount: shippingAmount,
      shipping_address: shippingAddress,
      stripe_payment_intent_id: null,
      stripe_payment_status: null,
      notes: paymentMethod === 'cod' ? 'Cash on Delivery' : 'Bank Transfer',
    };

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

    await supabase.from('order_items').insert(orderItems as never);
    decrementStock(items.map((i) => ({ id: i.id, quantity: i.quantity }))).catch(() => {});

    const emailItems = items.map((item) => ({
      name: item.name_en,
      quantity: item.quantity,
      unitPrice: priceMap[item.id] ?? 0,
      subtotal: (priceMap[item.id] ?? 0) * item.quantity,
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
      if (paymentMethod === 'bank_transfer') {
        sendBankTransferEmail({ ...emailPayload, customerEmail }).catch(() => {});
      } else {
        sendOrderConfirmationEmail(emailPayload).catch(() => {});
      }
    }
    sendAdminOrderNotification(emailPayload).catch(() => {});

    return NextResponse.json({ orderId: order.id });
  } catch (err) {
    console.error('[orders/offline] Creation error');
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
