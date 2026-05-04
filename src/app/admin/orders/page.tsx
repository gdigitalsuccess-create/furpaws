export const dynamic = 'force-dynamic';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatPrice } from '@/lib/pricing';
import OrderStatusSelect from '@/components/admin/OrderStatusSelect';
import type { Order } from '@/types/database';

export const metadata = { title: 'Admin — Orders' };

export default async function AdminOrdersPage() {
  const admin = createAdminClient();
  const { data: orders } = await admin
    .from('orders')
    .select('id, status, total_amount, shipping_amount, shipping_address, created_at, stripe_payment_intent_id')
    .order('created_at', { ascending: false })
    .limit(100) as { data: Pick<Order, 'id' | 'status' | 'total_amount' | 'shipping_amount' | 'shipping_address' | 'created_at' | 'stripe_payment_intent_id'>[] | null; error: unknown };

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Orders</h1>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
              <th className="px-5 py-3 text-start">Order ID</th>
              <th className="px-4 py-3 text-start">Customer</th>
              <th className="px-4 py-3 text-start">Date</th>
              <th className="px-4 py-3 text-end">Total</th>
              <th className="px-4 py-3 text-start">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(orders ?? []).map((order) => {
              const addr = order.shipping_address as Record<string, string> | null;
              const date = new Intl.DateTimeFormat('en-AE', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(order.created_at));
              return (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-mono text-xs text-gray-500">{order.id.slice(0, 8).toUpperCase()}</p>
                    {order.stripe_payment_intent_id && (
                      <p className="font-mono text-[10px] text-gray-400 truncate max-w-[120px]">{order.stripe_payment_intent_id}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{addr?.full_name ?? '—'}</p>
                    <p className="text-xs text-gray-500">{addr?.email ?? ''}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{date}</td>
                  <td className="px-4 py-3 text-end font-semibold text-gray-900">
                    {formatPrice(order.total_amount, 'en')}
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusSelect id={order.id} current={order.status} />
                  </td>
                </tr>
              );
            })}
            {!orders?.length && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-400">No orders yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
