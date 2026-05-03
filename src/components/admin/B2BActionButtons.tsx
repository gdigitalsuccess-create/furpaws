'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function B2BActionButtons({ id, userId }: { id: string; userId: string | null }) {
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null);

  async function handleAction(action: 'approve' | 'reject') {
    setLoading(action);
    try {
      await fetch(`/api/admin/b2b/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, user_id: userId }),
      });
      setStatus(action === 'approve' ? 'approved' : 'rejected');
    } finally {
      setLoading(null);
    }
  }

  if (status === 'approved') {
    return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700"><CheckCircle2 className="h-3 w-3" />Approved</span>;
  }
  if (status === 'rejected') {
    return <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700"><XCircle className="h-3 w-3" />Rejected</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleAction('approve')}
        disabled={!!loading}
        className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
      >
        {loading === 'approve' ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
        Approve
      </button>
      <button
        onClick={() => handleAction('reject')}
        disabled={!!loading}
        className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
      >
        {loading === 'reject' ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
        Reject
      </button>
    </div>
  );
}
