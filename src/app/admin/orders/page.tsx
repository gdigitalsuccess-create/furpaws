export const dynamic = 'force-dynamic';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatPrice } from '@/lib/pricing';
import OrderStatusSelect from '@/components/admin/OrderStatusSelect';
import OrdersToolbar from '@/components/admin/OrdersToolbar';
import type { Order } from '@/types/database';

export const metadata = { title: 'Admin — Orders' };

const STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

interface Props {
  searchParams: Promise<{ status?: string; q?: string; from?: string; to?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const sp = await searchParams;
  const admin = createAdminClient();

  type OrderRow = Pick<Order, 'id' | 'status' | 'total_amount' | 'shipping_amount' | 'shipping_address' | 'created_at' | 'stripe_payment_intent_id'> & { notes: string | null };

  let query = admin
    .from('orders')
    .select('id, status, total_amount, shipping_amount, shipping_address, created_at, stripe_payment_intent_id, notes')
    .order('created_at', { ascending: false })
    .limit(200);

  if (sp.status && STATUSES.includes(sp.status)) query = query.eq('status', sp.status);
  if (sp.from) query = query.gte('created_at', sp.from);
  if (sp.to)   query = query.lte('created_at', sp.to + 'T23:59:59');

  const { data: allOrders } = await query as unknown as { data: OrderRow[] | null };

  // Client-side search filter by name/email (done in server after fetch for simplicity)
  const q = sp.q?.toLowerCase() ?? '';
  const orders = (allOrders ?? []).filter((o) => {
    if (!q) return true;
    const addr = o.shipping_address as Record<string, string> | null;
    return (
      (addr?.full_name ?? '').toLowerCase().includes(q) ||
      (addr?.email ?? '').toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <OrdersToolbar statuses={STATUSES} current={sp} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
              <th className="px-5 py-3 text-start">Order ID</th>
              <th className="px-4 py-3 text-start">Customer</th>
              <th className="px-4 py-3 text-start">Emirate</th>
              <th className="px-4 py-3 text-start">Date</th>
              <th className="px-4 py-3 text-end">Total</th>
              <th className="px-4 py-3 text-start">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.map((order) => {
              const addr = order.shipping_address as Record<string, string> | null;
              const date = new Intl.DateTimeFormat('en-AE', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(order.created_at));
              return (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-mono text-xs font-semibold text-gray-700">{order.id.slice(0, 8).toUpperCase()}</p>
                    {order.stripe_payment_intent_id
                      ? <p className="text-[10px] text-blue-400 font-mono">Card</p>
                      : <p className="text-[10px] text-orange-400">{order.notes ?? 'Offline'}</p>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{addr?.full_name ?? '—'}</p>
                    <p className="text-xs text-gray-400">{addr?.email ?? ''}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{addr?.emirate ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{date}</td>
                  <td className="px-4 py-3 text-end font-semibold text-gray-900">
                    {formatPrice(order.total_amount, 'en')}
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusSelect id={order.id} current={order.status} />
                  </td>
                </tr>
              );
            })}
            {!orders.length && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-sm text-gray-400">No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="border-t border-gray-100 px-5 py-3 text-xs text-gray-400">
          {orders.length} order{orders.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
