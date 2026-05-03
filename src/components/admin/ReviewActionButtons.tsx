'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, Trash2, Loader2 } from 'lucide-react';

export default function ReviewActionButtons({ id, approved }: { id: string; approved: boolean }) {
  const [state, setState] = useState<'pending' | 'approved' | 'rejected' | 'deleted'>(
    approved ? 'approved' : 'pending'
  );
  const [loading, setLoading] = useState<string | null>(null);

  async function handleAction(action: 'approve' | 'reject') {
    setLoading(action);
    try {
      await fetch(`/api/admin/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      setState(action === 'approve' ? 'approved' : 'rejected');
    } finally {
      setLoading(null);
    }
  }

  async function handleDelete() {
    setLoading('delete');
    try {
      await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
      setState('deleted');
    } finally {
      setLoading(null);
    }
  }

  if (state === 'deleted') {
    return <span className="text-xs text-gray-400 italic">Deleted</span>;
  }

  if (state === 'approved') {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
          <CheckCircle2 className="h-3 w-3" />Approved
        </span>
        <button
          onClick={handleDelete}
          disabled={!!loading}
          className="flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors"
        >
          {loading === 'delete' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
        </button>
      </div>
    );
  }

  if (state === 'rejected') {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
          <XCircle className="h-3 w-3" />Rejected
        </span>
        <button
          onClick={handleDelete}
          disabled={!!loading}
          className="flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors"
        >
          {loading === 'delete' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
        </button>
      </div>
    );
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
