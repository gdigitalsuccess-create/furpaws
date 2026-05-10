export const dynamic = 'force-dynamic';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { ShoppingCart, DollarSign, Clock, AlertTriangle, TrendingUp, Package } from 'lucide-react';
import Link from 'next/link';
import { formatPrice } from '@/lib/pricing';
import RevenueChart from '@/components/admin/RevenueChart';
import AdminHero from '@/components/admin/AdminHero';
import type { Order, B2BApplication } from '@/types/database';

type RecentOrder     = Pick<Order, 'id' | 'status' | 'total_amount' | 'created_at' | 'shipping_address'>;
type PendingB2B      = Pick<B2BApplication, 'id' | 'company_name' | 'contact_name' | 'email' | 'created_at'>;
type LowStockProduct = { id: string; name_en: string; stock_quantity: number; slug: string };
type OrderRow        = { total_amount: number; created_at: string; status: string };
type TopProductRow   = { product_name: string; product_id: string; quantity: number; subtotal: number };

export const metadata = { title: 'Admin Dashboard' };

export default async function AdminDashboardPage() {
  const admin = createAdminClient();

  // Fetch connected admin's name
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const adminName = user ? await admin
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .maybeSingle()
    .then(({ data }) => (data as { full_name: string | null } | null)?.full_name ?? null)
    : null;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: totalOrders },
    { data: revenueRows },
    { count: pendingOrders },
    { count: lowStock },
    { data: recentOrders },
    { data: pendingB2B },
    { data: lowStockProducts },
    { data: last30Days },
    { data: topProducts },
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
    admin.from('products')
      .select('id, name_en, stock_quantity, slug')
      .lt('stock_quantity', 5)
      .eq('is_active', true)
      .order('stock_quantity', { ascending: true })
      .limit(8) as unknown as Promise<{ data: LowStockProduct[] | null }>,
    admin.from('orders')
      .select('total_amount, created_at, status')
      .gte('created_at', thirtyDaysAgo)
      .in('status', ['paid', 'processing', 'shipped', 'delivered'])
      .order('created_at', { ascending: true }) as unknown as Promise<{ data: OrderRow[] | null }>,
    admin.from('order_items')
      .select('product_name, product_id, quantity, subtotal')
      .order('subtotal', { ascending: false }) as unknown as Promise<{ data: TopProductRow[] | null }>,
  ]);

  const totalRevenue = (revenueRows as { total_amount: number }[] | null ?? []).reduce((s, r) => s + r.total_amount, 0);

  // Build daily revenue chart data (last 30 days)
  const dailyMap: Record<string, { revenue: number; orders: number }> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toLocaleDateString('en-AE', { day: '2-digit', month: 'short' });
    dailyMap[key] = { revenue: 0, orders: 0 };
  }
  for (const row of last30Days ?? []) {
    const key = new Date(row.created_at).toLocaleDateString('en-AE', { day: '2-digit', month: 'short' });
    if (dailyMap[key]) {
      dailyMap[key].revenue += row.total_amount;
      dailyMap[key].orders += 1;
    }
  }
  const chartData = Object.entries(dailyMap).map(([date, v]) => ({ date, ...v }));

  // Revenue this month vs last month
  const thisMonthStart = new Date(); thisMonthStart.setDate(1); thisMonthStart.setHours(0, 0, 0, 0);
  const lastMonthStart = new Date(thisMonthStart); lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
  const thisMonthRev = (last30Days ?? []).filter(r => new Date(r.created_at) >= thisMonthStart).reduce((s, r) => s + r.total_amount, 0);
  const lastMonthRev = (revenueRows as OrderRow[] | null ?? []).filter(r => {
    const d = new Date(r.created_at);
    return d >= lastMonthStart && d < thisMonthStart;
  }).reduce((s, r) => s + r.total_amount, 0);
  const growth = lastMonthRev > 0 ? ((thisMonthRev - lastMonthRev) / lastMonthRev) * 100 : null;

  // Top 5 products by revenue
  const productMap: Record<string, { name: string; revenue: number; qty: number }> = {};
  for (const item of topProducts ?? []) {
    if (!productMap[item.product_id]) productMap[item.product_id] = { name: item.product_name, revenue: 0, qty: 0 };
    productMap[item.product_id].revenue += item.subtotal;
    productMap[item.product_id].qty += item.quantity;
  }
  const top5 = Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const maxRev = top5[0]?.revenue ?? 1;

  const stats = [
    { label: 'Total Orders',   value: String(totalOrders ?? 0),       icon: ShoppingCart, color: 'text-blue-600',    bg: 'bg-blue-50' },
    { label: 'Total Revenue',  value: formatPrice(totalRevenue, 'en'), icon: DollarSign,   color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pending Orders', value: String(pendingOrders ?? 0),      icon: Clock,        color: 'text-yellow-600',  bg: 'bg-yellow-50' },
    { label: 'Low Stock',      value: String(lowStock ?? 0),           icon: AlertTriangle, color: 'text-red-600',   bg: 'bg-red-50' },
  ];

  return (
    <div className="p-4 md:p-8">
      <AdminHero
        name={adminName}
        totalOrders={totalOrders ?? 0}
        totalRevenue={totalRevenue}
        pendingOrders={pendingOrders ?? 0}
      />

      {/* KPI Stats */}
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

      {/* Revenue Chart */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-pink-primary" />
            <h2 className="font-semibold text-gray-900">Revenue — Last 30 Days</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-gray-500">This month: <span className="font-semibold text-gray-900">{formatPrice(thisMonthRev, 'en')}</span></span>
            {growth !== null && (
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${growth >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {growth >= 0 ? '+' : ''}{growth.toFixed(1)}% vs last month
              </span>
            )}
          </div>
        </div>
        <div className="p-5">
          <RevenueChart data={chartData} />
        </div>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">

        {/* Top Products */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
            <Package className="h-4 w-4 text-pink-primary" />
            <h2 className="font-semibold text-gray-900">Top Products by Revenue</h2>
          </div>
          <div className="divide-y divide-gray-50 p-4 space-y-3">
            {top5.length === 0 && <p className="text-sm text-gray-400 py-2">No sales data yet.</p>}
            {top5.map((p, i) => (
              <div key={i} className="pt-3 first:pt-0">
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-800 truncate max-w-[65%]">{p.name}</span>
                  <span className="text-gray-500 text-xs">{formatPrice(p.revenue, 'en')} · {p.qty} sold</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-gray-100">
                  <div
                    className="h-1.5 rounded-full bg-pink-primary transition-all"
                    style={{ width: `${(p.revenue / maxRev) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
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

      </div>

      {/* Pending B2B */}
      {(pendingB2B ?? []).length > 0 && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white shadow-sm">
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
          </div>
        </div>
      )}

      {/* Low Stock Alert */}
      {(lowStockProducts ?? []).length > 0 && (
        <div className="rounded-xl border border-red-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-red-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <h2 className="font-semibold text-gray-900">Low Stock Alert</h2>
            </div>
            <Link href="/admin/products" className="text-sm text-pink-primary hover:underline">Manage products</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {(lowStockProducts ?? []).map((p) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <p className="font-medium text-gray-900 truncate max-w-[70%]">{p.name_en}</p>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${p.stock_quantity === 0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                  {p.stock_quantity === 0 ? 'Out of stock' : `${p.stock_quantity} left`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

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
