import { redirect } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/server';
import { ShoppingBag, CheckCircle2, Clock, User } from 'lucide-react';
import LogoutButton from '@/components/auth/LogoutButton';
import type { Profile } from '@/types/database';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'B2B Dashboard' };

interface PageProps { params: Promise<{ locale: string }> }

export default async function B2BDashboardPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/account/login`);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() as { data: Profile | null; error: unknown };

  // Redirect non-B2B users to apply page
  if (!profile || (profile.role !== 'b2b' && profile.role !== 'admin')) {
    redirect(`/${locale}/b2b/apply`);
  }

  const t = await getTranslations({ locale, namespace: 'b2b' });
  const displayName = profile.full_name ?? user.email!.split('@')[0];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-off-white px-4 py-10">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-dark">{t('dashboard_title')}</h1>
            <p className="mt-0.5 text-sm text-text-muted">{t('dashboard_subtitle')}</p>
          </div>
          <LogoutButton />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">

          {/* Profile card */}
          <div className="rounded-2xl border border-fur-border bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-primary/10">
                <User className="h-6 w-6 text-pink-primary" />
              </div>
              <div>
                <p className="font-semibold text-text-dark">{displayName}</p>
                <p className="text-xs text-text-muted">{user.email}</p>
              </div>
            </div>

            <div className="space-y-3 border-t border-fur-border pt-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">{t('account_type')}</span>
                <span className="font-semibold text-pink-primary">{t('wholesale')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">{t('your_status')}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" />
                  {t('approved_title')}
                </span>
              </div>
            </div>

            <div className="mt-4 border-t border-fur-border pt-4">
              <Link
                href="/account"
                className="block text-sm font-medium text-text-muted hover:text-pink-primary transition-colors"
              >
                → My Account
              </Link>
            </div>
          </div>

          {/* Main area */}
          <div className="lg:col-span-2 space-y-6">

            {/* Pricing notice */}
            <div className="flex gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="font-semibold text-emerald-800">{t('approved_title')}</p>
                <p className="mt-0.5 text-sm text-emerald-700">{t('pricing_active')}</p>
              </div>
            </div>

            {/* Quick actions */}
            <div className="rounded-2xl border border-fur-border bg-white p-6 shadow-sm">
              <h2 className="mb-4 font-semibold text-text-dark">{t('shop_wholesale')}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <Link
                  href="/shop"
                  className="flex items-center gap-3 rounded-xl border border-fur-border bg-off-white p-4 hover:border-pink-primary hover:bg-pink-primary/5 transition-colors group"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-primary/10 group-hover:bg-pink-primary/20 transition-colors">
                    <ShoppingBag className="h-4 w-4 text-pink-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-dark">{t('shop_wholesale')}</p>
                    <p className="text-xs text-text-muted">{t('min_order')}</p>
                  </div>
                </Link>
                <Link
                  href="/account/orders"
                  className="flex items-center gap-3 rounded-xl border border-fur-border bg-off-white p-4 hover:border-pink-primary hover:bg-pink-primary/5 transition-colors group"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-primary/10 group-hover:bg-pink-primary/20 transition-colors">
                    <Clock className="h-4 w-4 text-pink-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-dark">Order History</p>
                    <p className="text-xs text-text-muted">View past orders</p>
                  </div>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
