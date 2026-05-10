'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, LayoutDashboard, Package, ShoppingCart, Users, Star, Tag, ArrowLeft } from 'lucide-react';
import AdminSignOutButton from '@/components/auth/AdminSignOutButton';

const NAV = [
  { href: '/admin',          icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/products', icon: Package,          label: 'Products' },
  { href: '/admin/orders',   icon: ShoppingCart,     label: 'Orders' },
  { href: '/admin/b2b',      icon: Users,            label: 'B2B Requests' },
  { href: '/admin/reviews',  icon: Star,             label: 'Reviews' },
  { href: '/admin/promos',   icon: Tag,              label: 'Promo Codes' },
];

export default function AdminMobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Top bar — mobile only */}
      <header className="flex md:hidden h-14 items-center justify-between border-b border-gray-200 bg-white px-4 shrink-0">
        <Image src="/logo.png" alt="FurPaws" width={100} height={34} className="h-8 w-auto" priority />
        <div className="flex items-center gap-2">
          <span className="rounded bg-pink-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-pink-primary uppercase">Admin</span>
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white shadow-xl transition-transform duration-300 md:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-gray-200 px-4">
          <Image src="/logo.png" alt="FurPaws" width={100} height={34} className="h-8 w-auto" />
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {NAV.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-gray-200 p-3 space-y-0.5">
          <Link
            href="/en"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-lg px-3 py-3 text-sm font-medium text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Site
          </Link>
          <AdminSignOutButton />
        </div>
      </aside>
    </>
  );
}
