import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface OrderEmailData {
  orderId: string;
  customerEmail: string;
  items: { name: string; quantity: number; unitPrice: number; subtotal: number }[];
  subtotal: number;
  shippingAmount: number;
  totalAmount: number;
  shippingAddress: Record<string, string>;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  const { orderId, customerEmail, items, subtotal, shippingAmount, totalAmount, shippingAddress } = data;

  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0">${item.name}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;text-align:center">${item.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;text-align:right">${item.subtotal.toFixed(2)} AED</td>
      </tr>`
    )
    .join('');

  const addressHtml = [
    shippingAddress.name,
    shippingAddress.address,
    shippingAddress.city,
    shippingAddress.emirate,
    shippingAddress.phone,
  ]
    .filter(Boolean)
    .join('<br>');

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;color:#333;max-width:600px;margin:0 auto;padding:20px">
  <div style="text-align:center;margin-bottom:30px">
    <h1 style="color:#e91e8c;margin:0">FurPaws</h1>
    <p style="color:#666;margin:4px 0">Your pet's favorite store</p>
  </div>

  <div style="background:#f9f9f9;border-radius:8px;padding:24px;margin-bottom:24px">
    <h2 style="margin:0 0 8px;color:#333">Order Confirmed!</h2>
    <p style="margin:0;color:#666">Order <strong>#${orderId.slice(0, 8).toUpperCase()}</strong></p>
  </div>

  <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
    <thead>
      <tr style="border-bottom:2px solid #e91e8c">
        <th style="text-align:left;padding:8px 0">Product</th>
        <th style="text-align:center;padding:8px 0">Qty</th>
        <th style="text-align:right;padding:8px 0">Price</th>
      </tr>
    </thead>
    <tbody>${itemsHtml}</tbody>
  </table>

  <div style="text-align:right;margin-bottom:24px">
    <p style="margin:4px 0">Subtotal: <strong>${subtotal.toFixed(2)} AED</strong></p>
    <p style="margin:4px 0">Shipping: <strong>${shippingAmount === 0 ? 'Free' : shippingAmount.toFixed(2) + ' AED'}</strong></p>
    <p style="margin:8px 0;font-size:18px;color:#e91e8c">Total: <strong>${totalAmount.toFixed(2)} AED</strong></p>
  </div>

  <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin-bottom:24px">
    <h3 style="margin:0 0 8px">Shipping Address</h3>
    <p style="margin:0;color:#666;line-height:1.6">${addressHtml}</p>
  </div>

  <p style="text-align:center;color:#999;font-size:12px">
    Questions? Contact us at support@furpaws.ae<br>
    FurPaws · Sharjah, UAE
  </p>
</body>
</html>`;

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev',
    to: customerEmail,
    subject: `Order Confirmed #${orderId.slice(0, 8).toUpperCase()} — FurPaws`,
    html,
  });

  if (error) {
    console.error('[email] Failed to send confirmation:', error);
  }
}
