'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { LogOut, Loader2 } from 'lucide-react';

interface LogoutButtonProps {
  className?: string;
  label?: string;
}

export default function LogoutButton({ className, label }: LogoutButtonProps) {
  const locale = useLocale();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = `/${locale}`;
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={className ?? 'flex items-center gap-2 text-sm font-medium text-text-muted hover:text-pink-primary transition-colors'}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
      {label ?? (locale === 'ar' ? 'تسجيل الخروج' : 'Sign Out')}
    </button>
  );
}
