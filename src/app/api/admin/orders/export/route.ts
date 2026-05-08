import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { assertAdmin } from '@/lib/assertAdmin';

export async function GET() {
  if (!await assertAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();
  const { data: orders } = await admin
    .from('orders')
    .select('id, status, total_amount, shipping_amount, shipping_address, created_at, stripe_payment_intent_id, notes')
    .order('created_at', { ascending: false }) as {
      data: {
        id: string;
        status: string;
        total_amount: number;
        shipping_amount: number;
        shipping_address: Record<string, string> | null;
        created_at: string;
        stripe_payment_intent_id: string | null;
        notes: string | null;
      }[] | null;
    };

  const rows = orders ?? [];

  const headers = ['Order ID', 'Date', 'Customer', 'Email', 'Phone', 'Emirate', 'Address', 'Status', 'Shipping (AED)', 'Total (AED)', 'Payment', 'Notes'];

  const escape = (v: string | null | undefined) => {
    if (v == null) return '';
    const s = String(v).replace(/"/g, '""');
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s;
  };

  const lines = [
    headers.join(','),
    ...rows.map((o) => {
      const addr = o.shipping_address ?? {};
      const date = new Date(o.created_at).toLocaleDateString('en-AE', { day: '2-digit', month: 'short', year: 'numeric' });
      return [
        o.id.slice(0, 8).toUpperCase(),
        date,
        escape(addr.full_name),
        escape(addr.email),
        escape(addr.phone),
        escape(addr.emirate),
        escape(addr.address),
        o.status,
        o.shipping_amount.toFixed(2),
        o.total_amount.toFixed(2),
        o.stripe_payment_intent_id ? 'Card' : (o.notes ?? 'Offline'),
        escape(o.notes),
      ].join(',');
    }),
  ];

  const csv = lines.join('\n');
  const filename = `furpaws-orders-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
