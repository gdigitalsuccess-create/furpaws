import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AccountDashboard from '@/components/account/AccountDashboard';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'My Orders' };

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function OrdersPage({ params }: PageProps) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/account/login`);
  }

  const [{ data: profile }, { data: orders }] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single(),
    supabase
      .from('orders')
      .select('id, status, total_amount, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  return (
    <AccountDashboard
      user={{ id: user.id, email: user.email! }}
      profile={profile}
      orders={orders ?? []}
      locale={locale}
      showAllOrders
    />
  );
}
