'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'] as const;

export default function OrderStatusSelect({ id, current }: { id: string; current: string }) {
  const [value, setValue] = useState(current);
  const [loading, setLoading] = useState(false);

  async function handleChange(next: string) {
    if (next === value) return;
    setLoading(true);
    try {
      await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      setValue(next);
    } finally {
      setLoading(false);
    }
  }

  const colors: Record<string, string> = {
    pending:    'bg-yellow-50 text-yellow-700 border-yellow-200',
    paid:       'bg-blue-50 text-blue-700 border-blue-200',
    processing: 'bg-blue-50 text-blue-700 border-blue-200',
    shipped:    'bg-purple-50 text-purple-700 border-purple-200',
    delivered:  'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled:  'bg-red-50 text-red-700 border-red-200',
    refunded:   'bg-gray-50 text-gray-600 border-gray-200',
  };

  return (
    <div className="flex items-center gap-1.5">
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />}
      <select
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        disabled={loading}
        className={`rounded-full border px-3 py-1 text-xs font-medium capitalize cursor-pointer focus:outline-none ${colors[value] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  );
}
