import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { PawPrint } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import B2BApplyForm from '@/components/b2b/B2BApplyForm';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Apply for B2B' };

interface PageProps { params: Promise<{ locale: string }> }
export default async function B2BApplyPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'b2b' });
  const supabase = await createClient();

  // Pre-fill form if logged in
  let defaultEmail: string | undefined;
  let defaultName: string | undefined;

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    defaultEmail = user.email ?? undefined;
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single() as { data: { full_name: string | null } | null; error: unknown };
    defaultName = profile?.full_name ?? undefined;
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-off-white px-4 py-12">
      <div className="w-full max-w-xl">

        {/* Logo */}
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 group">
          <PawPrint className="h-7 w-7 text-pink-primary transition-transform group-hover:scale-110" />
          <span className="text-xl font-bold text-pink-primary tracking-tight">FURPAWS</span>
        </Link>

        {/* Card */}
        <div className="rounded-2xl border border-fur-border bg-white p-8 shadow-sm">
          <h1 className="mb-1 text-center text-2xl font-bold text-text-dark">{t('apply_title')}</h1>
          <p className="mb-6 text-center text-sm text-text-muted">{t('apply_subtitle')}</p>
          <B2BApplyForm defaultEmail={defaultEmail} defaultName={defaultName} />
        </div>

        <p className="mt-4 text-center text-sm text-text-muted">
          {t('already_partner')}{' '}
          <Link href="/account/login" className="font-semibold text-pink-primary hover:underline">
            {t('sign_in')}
          </Link>
        </p>
      </div>
    </div>
  );
}
