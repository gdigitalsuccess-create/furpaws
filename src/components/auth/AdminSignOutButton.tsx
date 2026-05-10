'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { LogOut, Loader2 } from 'lucide-react';

export default function AdminSignOutButton() {
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
      Sign Out
    </button>
  );
}
