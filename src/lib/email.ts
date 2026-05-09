import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://furpaws-uae.com';
const PINK = '#e91e8c';
const PINK_LIGHT = '#fff0f7';

export async function sendContactEmail(data: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL ?? FROM;
  const { name, email, subject, message } = data;

  const body = `
    <div style="background:${PINK};border-radius:12px 12px 0 0;padding:28px;text-align:center">
      <h1 style="margin:0;color:#fff;font-size:22px">New Contact Message</h1>
    </div>
    <div style="background:#fff;border:1px solid #f0f0f0;border-top:none;border-radius:0 0 12px 12px;padding:28px;margin-bottom:24px">
      <table style="width:100%;font-size:14px;border-collapse:collapse;margin-bottom:20px">
        <tr><td style="padding:6px 0;color:#888;width:25%">From</td><td style="padding:6px 0;font-weight:600;color:#333">${name}</td></tr>
        <tr><td style="padding:6px 0;color:#888">Email</td><td style="padding:6px 0"><a href="mailto:${email}" style="color:${PINK}">${email}</a></td></tr>
        ${subject ? `<tr><td style="padding:6px 0;color:#888">Subject</td><td style="padding:6px 0;font-weight:600;color:#333">${subject}</td></tr>` : ''}
      </table>
      <div style="background:#f9f9f9;border-left:4px solid ${PINK};border-radius:4px;padding:16px;color:#444;font-size:14px;line-height:1.7;white-space:pre-line">${message}</div>
    </div>
    <p style="color:#bbb;font-size:12px;text-align:center;margin:0">FURPAWS · Sharjah, UAE</p>
  `;

  const { error } = await resend.emails.send({
    from: FROM,
    to: adminEmail,
    replyTo: email,
    subject: `Contact: ${subject || name} — FURPAWS`,
    html: buildWrapper(body),
  });

  if (error) { console.error('[email] Contact failed:', error); throw new Error(JSON.stringify(error)); }
}

export async function sendBackInStockEmail(customerEmail: string, productName: string, productUrl: string) {
  const html = buildWrapper(`
    <div style="background:${PINK_LIGHT};border-radius:8px;padding:24px;margin-bottom:24px;border:1px solid #f9c0dd">
      <h2 style="margin:0 0 8px;color:${PINK}">Back in Stock!</h2>
      <p style="margin:0;color:#555">Good news — <strong>${productName}</strong> is back in stock and ready to order.</p>
    </div>
    <div style="text-align:center;margin-bottom:24px">
      <a href="${productUrl}" style="${ctaStyle()}">Shop Now</a>
    </div>
    <p style="color:#999;font-size:12px;text-align:center">Hurry — stock is limited!</p>
  `);

  const { error } = await resend.emails.send({ from: FROM, to: customerEmail, subject: `'${productName}' is back in stock — FURPAWS`, html });
  if (error) { console.error('[email] Back-in-stock failed:', error); throw new Error(JSON.stringify(error)); }
}

export interface OrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  image?: string;
}

export interface OrderEmailData {
  orderId: string;
  customerEmail: string;
  customerName?: string;
  items: OrderItem[];
  subtotal: number;
  shippingAmount: number;
  discount?: number;
  totalAmount: number;
  shippingAddress: Record<string, string>;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  const { orderId, customerEmail, customerName, items, subtotal, shippingAmount, discount, totalAmount, shippingAddress } = data;
  const orderRef = orderId.slice(0, 8).toUpperCase();
  const orderUrl = `${BASE_URL}/en/account/orders`;

  const itemsHtml = items.map((item) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;vertical-align:middle">
        ${item.image
          ? `<img src="${item.image}" alt="${item.name}" width="48" height="48" style="border-radius:8px;object-fit:cover;margin-right:12px;vertical-align:middle">`
          : `<span style="display:inline-block;width:48px;height:48px;background:${PINK_LIGHT};border-radius:8px;margin-right:12px;vertical-align:middle"></span>`
        }
        <span style="font-weight:600;color:#333">${item.name}</span>
        <span style="display:block;font-size:12px;color:#999;margin-top:2px">Qty: ${item.quantity}</span>
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;text-align:right;vertical-align:middle;font-weight:600;white-space:nowrap">${item.subtotal.toFixed(2)} AED</td>
    </tr>
  `).join('');

  const addressLines = [
    shippingAddress.name,
    shippingAddress.address,
    [shippingAddress.city, shippingAddress.emirate].filter(Boolean).join(', '),
    shippingAddress.phone,
  ].filter(Boolean).join('<br>');

  const discountRow = discount && discount > 0
    ? `<tr><td style="padding:4px 0;color:#16a34a">Discount</td><td style="padding:4px 0;text-align:right;color:#16a34a">−${discount.toFixed(2)} AED</td></tr>`
    : '';

  const greeting = customerName ? `Hi ${customerName.split(' ')[0]},` : 'Hello,';

  const body = `
    <div style="background:linear-gradient(135deg,${PINK} 0%,#c0157a 100%);border-radius:12px 12px 0 0;padding:32px;text-align:center;margin-bottom:0">
      <h1 style="margin:0 0 4px;color:#fff;font-size:28px;letter-spacing:-0.5px">Order Confirmed!</h1>
      <p style="margin:0;color:rgba(255,255,255,0.85);font-size:14px">Order <strong>#${orderRef}</strong></p>
    </div>

    <div style="background:#fff;border:1px solid #f0f0f0;border-top:none;border-radius:0 0 12px 12px;padding:32px;margin-bottom:24px">
      <p style="margin:0 0 24px;color:#555;font-size:15px">${greeting} Thank you for your order! We're preparing your items and will notify you once they're on the way.</p>

      <h3 style="margin:0 0 12px;color:#333;font-size:13px;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid ${PINK};padding-bottom:8px">Order Summary</h3>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
        <tbody>${itemsHtml}</tbody>
      </table>

      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <tr><td style="padding:4px 0;color:#666">Subtotal</td><td style="padding:4px 0;text-align:right">${subtotal.toFixed(2)} AED</td></tr>
        <tr><td style="padding:4px 0;color:#666">Shipping</td><td style="padding:4px 0;text-align:right">${shippingAmount === 0 ? '<span style="color:#16a34a;font-weight:600">Free</span>' : shippingAmount.toFixed(2) + ' AED'}</td></tr>
        ${discountRow}
        <tr style="border-top:2px solid ${PINK}">
          <td style="padding:12px 0 4px;font-weight:700;font-size:16px;color:#333">Total</td>
          <td style="padding:12px 0 4px;text-align:right;font-weight:700;font-size:18px;color:${PINK}">${totalAmount.toFixed(2)} AED</td>
        </tr>
      </table>

      <h3 style="margin:0 0 10px;color:#333;font-size:13px;text-transform:uppercase;letter-spacing:1px">Shipping To</h3>
      <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin-bottom:24px;color:#555;line-height:1.7;font-size:14px">${addressLines}</div>

      <div style="text-align:center">
        <a href="${orderUrl}" style="${ctaStyle()}">View My Orders</a>
      </div>
    </div>

    <p style="color:#bbb;font-size:12px;text-align:center;margin:0">
      Questions? <a href="mailto:support@furpaws-uae.com" style="color:${PINK}">support@furpaws-uae.com</a><br>
      FURPAWS · Sharjah, UAE
    </p>
  `;

  const html = buildWrapper(body);

  const { error } = await resend.emails.send({
    from: FROM,
    to: customerEmail,
    subject: `Order Confirmed #${orderRef} — FURPAWS`,
    html,
  });

  if (error) console.error('[email] Order confirmation failed:', error);
}

export async function sendAdminOrderNotification(data: OrderEmailData) {
  const adminEmail = process.env.ADMIN_EMAIL ?? FROM;
  const { orderId, customerEmail, items, totalAmount, shippingAddress } = data;
  const orderRef = orderId.slice(0, 8).toUpperCase();

  const itemsList = items.map((i) => `<li style="margin:4px 0">${i.name} × ${i.quantity} — ${i.subtotal.toFixed(2)} AED</li>`).join('');

  const body = `
    <div style="background:${PINK};border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
      <h1 style="margin:0;color:#fff;font-size:22px">New Order Received</h1>
      <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:14px">#${orderRef}</p>
    </div>
    <div style="background:#fff;border:1px solid #f0f0f0;border-radius:12px;padding:24px;margin-bottom:16px">
      <p style="margin:0 0 8px"><strong>Customer:</strong> ${customerEmail}</p>
      <p style="margin:0 0 8px"><strong>Ship to:</strong> ${shippingAddress.name ?? ''}, ${shippingAddress.emirate ?? ''}</p>
      <p style="margin:0 0 16px"><strong>Total:</strong> <span style="color:${PINK};font-weight:700;font-size:18px">${totalAmount.toFixed(2)} AED</span></p>
      <ul style="margin:0;padding-left:20px;color:#555;font-size:14px">${itemsList}</ul>
    </div>
    <div style="text-align:center">
      <a href="${BASE_URL}/admin/orders" style="${ctaStyle()}">View in Admin</a>
    </div>
  `;

  const { error } = await resend.emails.send({
    from: FROM,
    to: adminEmail,
    subject: `New Order #${orderRef} — ${totalAmount.toFixed(2)} AED`,
    html: buildWrapper(body),
  });

  if (error) console.error('[email] Admin notification failed:', error);
}

export async function sendBankTransferEmail(data: OrderEmailData) {
  const { orderId, customerEmail, customerName, items, subtotal, shippingAmount, discount, totalAmount, shippingAddress } = data;
  const orderRef = orderId.slice(0, 8).toUpperCase();

  const bankName    = process.env.BANK_NAME         ?? 'Emirates NBD';
  const accountName = process.env.BANK_ACCOUNT_NAME ?? 'FURPAWS LLC';
  const iban        = process.env.BANK_IBAN         ?? 'AE-XXXX-XXXX-XXXX (configure BANK_IBAN)';
  const swift       = process.env.BANK_SWIFT        ?? '';

  const greeting = customerName ? `Hi ${customerName.split(' ')[0]},` : 'Hello,';
  const discountRow = discount && discount > 0
    ? `<tr><td style="padding:4px 0;color:#16a34a">Discount</td><td style="padding:4px 0;text-align:right;color:#16a34a">−${discount.toFixed(2)} AED</td></tr>`
    : '';

  const itemsHtml = items.map((item) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f0f0f0">
        <span style="font-weight:600;color:#333">${item.name}</span>
        <span style="display:block;font-size:12px;color:#999">Qty: ${item.quantity}</span>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600">${item.subtotal.toFixed(2)} AED</td>
    </tr>
  `).join('');

  const body = `
    <div style="background:linear-gradient(135deg,#1e40af 0%,#1d4ed8 100%);border-radius:12px 12px 0 0;padding:32px;text-align:center">
      <h1 style="margin:0 0 4px;color:#fff;font-size:26px">Order Confirmed!</h1>
      <p style="margin:0;color:rgba(255,255,255,0.85);font-size:14px">Order <strong>#${orderRef}</strong> — Bank Transfer</p>
    </div>
    <div style="background:#fff;border:1px solid #f0f0f0;border-top:none;border-radius:0 0 12px 12px;padding:32px;margin-bottom:24px">
      <p style="margin:0 0 16px;color:#555;font-size:15px">${greeting}</p>
      <p style="margin:0 0 24px;color:#555;font-size:15px">Thank you for your order! To complete your purchase, please transfer the amount below to our bank account. Use your order reference as the payment description.</p>

      <div style="background:#eff6ff;border:2px solid #bfdbfe;border-radius:12px;padding:20px;margin-bottom:24px">
        <h3 style="margin:0 0 14px;color:#1e40af;font-size:13px;text-transform:uppercase;letter-spacing:1px">Bank Transfer Details</h3>
        <table style="width:100%;font-size:14px;border-collapse:collapse">
          <tr><td style="padding:5px 0;color:#555;width:40%">Bank</td><td style="padding:5px 0;font-weight:700;color:#1e3a8a">${bankName}</td></tr>
          <tr><td style="padding:5px 0;color:#555">Account Name</td><td style="padding:5px 0;font-weight:700;color:#1e3a8a">${accountName}</td></tr>
          <tr><td style="padding:5px 0;color:#555">IBAN</td><td style="padding:5px 0;font-weight:700;color:#1e3a8a;font-size:15px">${iban}</td></tr>
          ${swift ? `<tr><td style="padding:5px 0;color:#555">SWIFT / BIC</td><td style="padding:5px 0;font-weight:700;color:#1e3a8a">${swift}</td></tr>` : ''}
          <tr><td style="padding:5px 0;color:#555">Reference</td><td style="padding:5px 0;font-weight:700;color:${PINK};font-size:15px">#${orderRef}</td></tr>
          <tr style="border-top:2px solid #bfdbfe"><td style="padding:10px 0 5px;color:#555">Amount to Transfer</td><td style="padding:10px 0 5px;font-weight:800;font-size:18px;color:${PINK}">${totalAmount.toFixed(2)} AED</td></tr>
        </table>
        <p style="margin:12px 0 0;font-size:12px;color:#6b7280">Please include <strong>#${orderRef}</strong> in your transfer description. Orders are cancelled if payment is not received within 48 hours.</p>
      </div>

      <h3 style="margin:0 0 12px;color:#333;font-size:13px;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid ${PINK};padding-bottom:8px">Order Summary</h3>
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
        <tbody>${itemsHtml}</tbody>
      </table>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <tr><td style="padding:4px 0;color:#666">Subtotal</td><td style="padding:4px 0;text-align:right">${subtotal.toFixed(2)} AED</td></tr>
        <tr><td style="padding:4px 0;color:#666">Shipping</td><td style="padding:4px 0;text-align:right">${shippingAmount === 0 ? '<span style="color:#16a34a">Free</span>' : shippingAmount.toFixed(2) + ' AED'}</td></tr>
        ${discountRow}
        <tr style="border-top:2px solid ${PINK}">
          <td style="padding:10px 0 4px;font-weight:700;color:#333">Total</td>
          <td style="padding:10px 0 4px;text-align:right;font-weight:800;font-size:18px;color:${PINK}">${totalAmount.toFixed(2)} AED</td>
        </tr>
      </table>

      <h3 style="margin:0 0 10px;color:#333;font-size:13px;text-transform:uppercase;letter-spacing:1px">Shipping To</h3>
      <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin-bottom:24px;color:#555;line-height:1.7;font-size:14px">
        ${[shippingAddress.full_name, shippingAddress.address, [shippingAddress.city, shippingAddress.emirate].filter(Boolean).join(', '), shippingAddress.phone].filter(Boolean).join('<br>')}
      </div>
    </div>
    <p style="color:#bbb;font-size:12px;text-align:center;margin:0">
      Questions? <a href="mailto:support@furpaws-uae.com" style="color:${PINK}">support@furpaws-uae.com</a><br>
      FURPAWS · Sharjah, UAE
    </p>
  `;

  const { error } = await resend.emails.send({
    from: FROM,
    to: customerEmail,
    subject: `Bank Transfer Details — Order #${orderRef} — FURPAWS`,
    html: buildWrapper(body),
  });

  if (error) console.error('[email] Bank transfer email failed:', error);
}

export async function sendB2BApprovalEmail(to: string, contactName: string, companyName: string) {
  const firstName = contactName.split(' ')[0];
  const dashboardUrl = `${BASE_URL}/en/b2b/dashboard`;

  const body = `
    <div style="background:linear-gradient(135deg,${PINK} 0%,#c0157a 100%);border-radius:12px 12px 0 0;padding:32px;text-align:center">
      <h1 style="margin:0 0 4px;color:#fff;font-size:26px">You're Approved!</h1>
      <p style="margin:0;color:rgba(255,255,255,0.85);font-size:14px">Welcome to FURPAWS Wholesale</p>
    </div>
    <div style="background:#fff;border:1px solid #f0f0f0;border-top:none;border-radius:0 0 12px 12px;padding:32px;margin-bottom:24px">
      <p style="margin:0 0 16px;color:#555;font-size:15px">Hi ${firstName},</p>
      <p style="margin:0 0 16px;color:#555;font-size:15px">
        Great news! Your B2B wholesale application for <strong>${companyName}</strong> has been <strong style="color:#16a34a">approved</strong>.
      </p>
      <p style="margin:0 0 24px;color:#555;font-size:15px">
        You now have access to exclusive wholesale pricing across our full catalogue. Log in to your account and start shopping at B2B prices.
      </p>
      <div style="background:${PINK_LIGHT};border-radius:10px;padding:16px;margin-bottom:24px">
        <p style="margin:0;font-size:13px;color:#333">
          &nbsp;<strong>Wholesale prices</strong> activated on your account<br>
          &nbsp;<strong>Full catalogue</strong> access at B2B rates<br>
          &nbsp;<strong>Priority support</strong> for bulk orders
        </p>
      </div>
      <div style="text-align:center">
        <a href="${dashboardUrl}" style="${ctaStyle()}">Go to B2B Dashboard</a>
      </div>
    </div>
    <p style="color:#bbb;font-size:12px;text-align:center;margin:0">
      Questions? <a href="mailto:support@furpaws-uae.com" style="color:${PINK}">support@furpaws-uae.com</a><br>
      FURPAWS · Sharjah, UAE
    </p>
  `;

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: 'Your FURPAWS B2B Account is Approved!',
    html: buildWrapper(body),
  });

  if (error) console.error('[email] B2B approval failed:', error);
}

function ctaStyle() {
  return `display:inline-block;background:${PINK};color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:15px`;
}

function buildWrapper(content: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif">
  <div style="max-width:600px;margin:32px auto;padding:0 16px 32px">
    <div style="text-align:center;margin-bottom:24px">
      <img src="${BASE_URL}/logo.png" alt="FURPAWS" width="140" height="auto" style="display:block;margin:0 auto 8px">
      <p style="margin:0;font-size:12px;color:#999">Your pet's favorite store · Sharjah, UAE</p>
    </div>
    ${content}
  </div>
</body>
</html>`;
}
