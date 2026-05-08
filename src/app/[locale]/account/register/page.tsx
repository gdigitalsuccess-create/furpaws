import { redirect } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { PawPrint } from 'lucide-react';
import RegisterForm from '@/components/auth/RegisterForm';
import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Register' };

interface PageProps { params: Promise<{ locale: string }> }
export default async function RegisterPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect(`/${locale}/account`);

  const t = await getTranslations({ locale, namespace: 'auth' });

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-off-white px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 group">
          <PawPrint className="h-7 w-7 text-pink-primary transition-transform group-hover:scale-110" />
          <span className="text-xl font-bold text-pink-primary tracking-tight">FURPAWS</span>
        </Link>

        {/* Card */}
        <div className="rounded-2xl border border-fur-border bg-white p-8 shadow-sm">
          <h1 className="mb-6 text-center text-2xl font-bold text-text-dark">{t('register_title')}</h1>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
