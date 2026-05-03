import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ShoppingBag, User, Package } from 'lucide-react';
import LogoutButton from '@/components/auth/LogoutButton';
import { formatPrice } from '@/lib/pricing';
import type { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Order = Pick<
  Database['public']['Tables']['orders']['Row'],
  'id' | 'status' | 'total_amount' | 'created_at'
>;

interface Props {
  user: { id: string; email: string };
  profile: Profile | null;
  orders: Order[];
  locale: string;
  showAllOrders?: boolean;
}

const STATUS_STYLES: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-800',
  paid:       'bg-blue-100 text-blue-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped:    'bg-purple-100 text-purple-800',
  delivered:  'bg-emerald-100 text-emerald-800',
  cancelled:  'bg-red-100 text-red-800',
  refunded:   'bg-gray-100 text-gray-700',
};

export default async function AccountDashboard({ user, profile, orders, locale, showAllOrders }: Props) {
  const t = await getTranslations({ locale, namespace: 'account' });

  const displayName = profile?.full_name ?? user.email.split('@')[0];
  const memberSince = profile
    ? new Intl.DateTimeFormat(locale === 'ar' ? 'ar-AE' : 'en-AE', {
        year: 'numeric',
        month: 'long',
      }).format(new Date(profile.created_at))
    : null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-off-white px-4 py-10">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-dark">
              {t('welcome', { name: displayName })}
            </h1>
            <p className="mt-0.5 text-sm text-text-muted">{user.email}</p>
          </div>
          <LogoutButton />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">

          {/* Profile sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-fur-border bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-primary/10">
                  <User className="h-6 w-6 text-pink-primary" />
                </div>
                <div>
                  <p className="font-semibold text-text-dark">{displayName}</p>
                  {memberSince && (
                    <p className="text-xs text-text-muted">{t('member_since', { date: memberSince })}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1 border-t border-fur-border pt-4">
                <div className="rounded-lg px-3 py-2">
                  <p className="text-xs font-medium text-text-muted">{t('profile_title')}</p>
                  <p className="mt-0.5 text-sm text-text-dark">{user.email}</p>
                  {profile?.phone && (
                    <p className="text-sm text-text-dark">{profile.phone}</p>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-2 border-t border-fur-border pt-4">
                <Link
                  href="/account/orders"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-text-dark hover:bg-off-white transition-colors"
                >
                  <Package className="h-4 w-4 text-pink-primary" />
                  {t('orders_title')}
                </Link>
                <Link
                  href="/shop"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-text-dark hover:bg-off-white transition-colors"
                >
                  <ShoppingBag className="h-4 w-4 text-pink-primary" />
                  {t('shop_now')}
                </Link>
              </div>
            </div>
          </div>

          {/* Orders section */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-fur-border bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-fur-border px-6 py-4">
                <h2 className="font-semibold text-text-dark">
                  {showAllOrders ? t('orders_title') : t('recent_orders')}
                </h2>
                {!showAllOrders && orders.length > 0 && (
                  <Link
                    href="/account/orders"
                    className="text-sm font-medium text-pink-primary hover:underline"
                  >
                    {t('view_all_orders')}
                  </Link>
                )}
                {showAllOrders && (
                  <Link
                    href="/account"
                    className="text-sm font-medium text-text-muted hover:text-pink-primary transition-colors"
                  >
                    {t('back_to_account')}
                  </Link>
                )}
              </div>

              {orders.length === 0 ? (
                <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-off-white">
                    <Package className="h-8 w-8 text-text-muted" />
                  </div>
                  <p className="text-sm text-text-muted">{t('no_orders')}</p>
                  <Link
                    href="/shop"
                    className="rounded-xl bg-pink-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-pink-primary/25 hover:bg-pink-accent transition-colors"
                  >
                    {t('shop_now')}
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-fur-border bg-off-white/50 text-xs font-medium uppercase text-text-muted">
                        <th className="px-6 py-3 text-start">{t('order_id')}</th>
                        <th className="px-4 py-3 text-start">{t('order_date')}</th>
                        <th className="px-4 py-3 text-start">{t('order_status')}</th>
                        <th className="px-4 py-3 text-end">{t('order_total')}</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-fur-border">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-off-white/30 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs text-text-dark">
                            {order.id.slice(0, 8).toUpperCase()}
                          </td>
                          <td className="px-4 py-4 text-text-muted">
                            {new Intl.DateTimeFormat(locale === 'ar' ? 'ar-AE' : 'en-AE', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            }).format(new Date(order.created_at))}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {t(`status_${order.status}` as Parameters<typeof t>[0])}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-end font-semibold text-text-dark">
                            {formatPrice(order.total_amount, locale)}
                          </td>
                          <td className="px-4 py-4 text-end">
                            <span className="text-xs text-text-muted">{t('view_order')}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
