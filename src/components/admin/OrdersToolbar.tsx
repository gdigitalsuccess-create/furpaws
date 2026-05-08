'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Search, Download, Filter } from 'lucide-react';

interface Props {
  statuses: string[];
  current: { status?: string; q?: string; from?: string; to?: string };
}

export default function OrdersToolbar({ statuses, current }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [q, setQ] = useState(current.q ?? '');
  const [status, setStatus] = useState(current.status ?? '');
  const [from, setFrom] = useState(current.from ?? '');
  const [to, setTo] = useState(current.to ?? '');
  const [downloading, setDownloading] = useState(false);

  function buildUrl(overrides: Record<string, string>) {
    const p = new URLSearchParams();
    const vals = { q, status, from, to, ...overrides };
    if (vals.q)     p.set('q', vals.q);
    if (vals.status) p.set('status', vals.status);
    if (vals.from)  p.set('from', vals.from);
    if (vals.to)    p.set('to', vals.to);
    return `${pathname}?${p.toString()}`;
  }

  function apply(overrides: Record<string, string> = {}) {
    startTransition(() => router.push(buildUrl(overrides)));
  }

  async function handleExport() {
    setDownloading(true);
    try {
      const p = new URLSearchParams();
      if (status) p.set('status', status);
      if (from)   p.set('from', from);
      if (to)     p.set('to', to);
      const res = await fetch(`/api/admin/orders/export?${p.toString()}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `furpaws-orders-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="relative">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && apply({ q })}
          placeholder="Name, email, ID…"
          className="h-9 w-48 rounded-lg border border-gray-200 bg-white ps-8 pe-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-pink-400 focus:outline-none focus:ring-1 focus:ring-pink-300"
        />
      </div>

      {/* Status filter */}
      <div className="relative flex items-center gap-1">
        <Filter className="h-3.5 w-3.5 text-gray-400" />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); apply({ status: e.target.value }); }}
          className="h-9 rounded-lg border border-gray-200 bg-white pe-8 ps-2 text-sm text-gray-700 focus:border-pink-400 focus:outline-none focus:ring-1 focus:ring-pink-300"
        >
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Date range */}
      <input
        type="date"
        value={from}
        onChange={(e) => { setFrom(e.target.value); apply({ from: e.target.value }); }}
        className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-sm text-gray-700 focus:border-pink-400 focus:outline-none focus:ring-1 focus:ring-pink-300"
        title="From date"
      />
      <span className="text-xs text-gray-400">→</span>
      <input
        type="date"
        value={to}
        onChange={(e) => { setTo(e.target.value); apply({ to: e.target.value }); }}
        className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-sm text-gray-700 focus:border-pink-400 focus:outline-none focus:ring-1 focus:ring-pink-300"
        title="To date"
      />

      {/* Export */}
      <button
        onClick={handleExport}
        disabled={downloading}
        className="flex h-9 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors"
      >
        <Download className="h-3.5 w-3.5" />
        {downloading ? 'Exporting…' : 'Export CSV'}
      </button>
    </div>
  );
}
