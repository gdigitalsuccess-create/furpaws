import { redirect } from 'next/navigation';
import Image from 'next/image';
import { assertAdmin } from '@/lib/assertAdmin';
import AdminLoginForm from '@/components/auth/AdminLoginForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin Login — FurPaws' };

interface PageProps {
  searchParams: Promise<{ unauthorized?: string }>;
}

export default async function AdminLoginPage({ searchParams }: PageProps) {
  const isAdmin = await assertAdmin();
  if (isAdmin) redirect('/admin');

  const { unauthorized } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">

        <div className="mb-8 flex justify-center">
          <Image src="/logo.png" alt="FurPaws" width={140} height={46} className="h-12 w-auto" priority />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="mb-1 text-center text-xl font-bold text-gray-900">Admin Access</h1>
          <p className="mb-6 text-center text-sm text-gray-400">Sign in to manage FurPaws</p>

          {unauthorized && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              This account does not have admin privileges.
            </div>
          )}

          <AdminLoginForm />
        </div>

      </div>
    </div>
  );
}
