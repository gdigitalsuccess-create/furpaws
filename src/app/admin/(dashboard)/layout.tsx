import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, Users, Star, Tag, ArrowLeft } from 'lucide-react';
import { assertAdmin } from '@/lib/assertAdmin';
import { createClient } from '@/lib/supabase/server';
import AdminSignOutButton from '@/components/auth/AdminSignOutButton';

const NAV = [
  { href: '/admin',          icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/products', icon: Package,          label: 'Products' },
  { href: '/admin/orders',   icon: ShoppingCart,     label: 'Orders' },
  { href: '/admin/b2b',      icon: Users,            label: 'B2B Requests' },
  { href: '/admin/reviews',  icon: Star,             label: 'Reviews' },
  { href: '/admin/promos',   icon: Tag,              label: 'Promo Codes' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  let isAdmin = false;
  try {
    isAdmin = await assertAdmin();
  } catch {
    // treat any error as unauthenticated
  }
  if (!isAdmin) redirect('/admin/login?unauthorized=1');
  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Sidebar */}
      <aside className="flex w-56 shrink-0 flex-col border-e border-gray-200 bg-white">
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
          <Image src="/logo.png" alt="FurPaws" width={120} height={40} className="h-9 w-auto" priority />
          <span className="rounded bg-pink-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-pink-primary uppercase">Admin</span>
        </div>

        <nav className="flex-1 space-y-0.5 p-3">
          {NAV.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-gray-200 p-3 space-y-0.5">
          <Link
            href="/en"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Site
          </Link>
          <AdminSignOutButton />
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

    </div>
  );
}
