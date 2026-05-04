export const dynamic = 'force-dynamic';
import { createAdminClient } from '@/lib/supabase/admin';
import { ShoppingCart, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { formatPrice } from '@/lib/pricing';
import type { Order, B2BApplication } from '@/types/database';

type RecentOrder = Pick<Order, 'id' | 'status' | 'total_amount' | 'created_at' | 'shipping_address'>;
type PendingB2B  = Pick<B2BApplication, 'id' | 'company_name' | 'contact_name' | 'email' | 'created_at'>;

export const metadata = { title: 'Admin Dashboard' };

export default async function AdminDashboardPage() {
  const admin = createAdminClient();

  const [
    { count: totalOrders },
    { data: revenueRows },
    { count: pendingOrders },
    { count: lowStock },
    { data: recentOrders },
    { data: pendingB2B },
  ] = await Promise.all([
    admin.from('orders').select('*', { count: 'exact', head: true }),
    admin.from('orders').select('total_amount').in('status', ['paid', 'processing', 'shipped', 'delivered']),
    admin.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    admin.from('products').select('*', { count: 'exact', head: true }).lt('stock_quantity', 5).eq('is_active', true),
    admin.from('orders')
      .select('id, status, total_amount, created_at, shipping_address')
      .order('created_at', { ascending: false })
      .limit(8) as unknown as Promise<{ data: RecentOrder[] | null }>,
    admin.from('b2b_applications')
      .select('id, company_name, contact_name, email, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5) as unknown as Promise<{ data: PendingB2B[] | null }>,
  ]);

  const totalRevenue = (revenueRows as { total_amount: number }[] | null ?? []).reduce((s, r) => s + r.total_amount, 0);

  const stats = [
    { label: 'Total Orders',   value: String(totalOrders ?? 0),      icon: ShoppingCart, color: 'text-blue-600',   bg: 'bg-blue-50' },
    { label: 'Total Revenue',  value: formatPrice(totalRevenue, 'en'), icon: DollarSign,   color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pending Orders', value: String(pendingOrders ?? 0),     icon: Clock,        color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Low Stock',      value: String(lowStock ?? 0),          icon: AlertTriangle, color: 'text-red-600',   bg: 'bg-red-50' },
  ];

  return (
    <div className="p-8">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="mt-0.5 text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        {/* Recent orders */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-pink-primary hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {(recentOrders ?? []).map((order) => {
              const addr = order.shipping_address as Record<string, string> | null;
              return (
                <div key={order.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <div>
                    <p className="font-mono text-xs text-gray-500">{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="font-medium text-gray-900">{addr?.full_name ?? '—'}</p>
                  </div>
                  <div className="text-end">
                    <StatusBadge status={order.status} />
                    <p className="mt-0.5 text-xs text-gray-500">{formatPrice(order.total_amount, 'en')}</p>
                  </div>
                </div>
              );
            })}
            {!recentOrders?.length && <p className="px-5 py-4 text-sm text-gray-400">No orders yet.</p>}
          </div>
        </div>

        {/* Pending B2B */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="font-semibold text-gray-900">Pending B2B Requests</h2>
            <Link href="/admin/b2b" className="text-sm text-pink-primary hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {(pendingB2B ?? []).map((app) => (
              <div key={app.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <div>
                  <p className="font-medium text-gray-900">{app.company_name}</p>
                  <p className="text-xs text-gray-500">{app.contact_name} · {app.email}</p>
                </div>
                <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-700">Pending</span>
              </div>
            ))}
            {!pendingB2B?.length && <p className="px-5 py-4 text-sm text-gray-400">No pending requests.</p>}
          </div>
        </div>

      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending:    'bg-yellow-100 text-yellow-700',
    paid:       'bg-blue-100 text-blue-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped:    'bg-purple-100 text-purple-700',
    delivered:  'bg-emerald-100 text-emerald-700',
    cancelled:  'bg-red-100 text-red-700',
    refunded:   'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${styles[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}
