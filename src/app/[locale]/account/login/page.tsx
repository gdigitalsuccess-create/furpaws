import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { PawPrint } from 'lucide-react';
import LoginForm from '@/components/auth/LoginForm';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Login' };

interface PageProps { params: Promise<{ locale: string }> }
export default async function LoginPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
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
          <h1 className="mb-6 text-center text-2xl font-bold text-text-dark">{t('login_title')}</h1>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
