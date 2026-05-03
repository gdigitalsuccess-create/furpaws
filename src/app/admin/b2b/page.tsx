import { createAdminClient } from '@/lib/supabase/admin';
import B2BActionButtons from '@/components/admin/B2BActionButtons';
import type { B2BApplication } from '@/types/database';

export const metadata = { title: 'Admin — B2B Requests' };

const STATUS_STYLE: Record<string, string> = {
  pending:  'bg-yellow-100 text-yellow-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
};

export default async function AdminB2BPage() {
  const admin = createAdminClient();
  const { data: applications } = await admin
    .from('b2b_applications')
    .select('*')
    .order('created_at', { ascending: false }) as { data: B2BApplication[] | null; error: unknown };

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">B2B Requests</h1>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
              <th className="px-5 py-3 text-start">Company</th>
              <th className="px-4 py-3 text-start">Contact</th>
              <th className="px-4 py-3 text-start">Type</th>
              <th className="px-4 py-3 text-start">Date</th>
              <th className="px-4 py-3 text-start">Status</th>
              <th className="px-4 py-3 text-start">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(applications ?? []).map((app) => {
              const date = new Intl.DateTimeFormat('en-AE', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(app.created_at));
              return (
                <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900">{app.company_name}</p>
                    <p className="text-xs text-gray-500">{app.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-700">{app.contact_name}</p>
                    <p className="text-xs text-gray-500">{app.phone}</p>
                  </td>
                  <td className="px-4 py-3 capitalize text-gray-500">{app.business_type ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{date}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLE[app.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {app.status === 'pending' ? (
                      <B2BActionButtons id={app.id} userId={app.user_id} />
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {!applications?.length && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-sm text-gray-400">No B2B applications yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Message column */}
      {(applications ?? []).some((a) => a.message) && (
        <div className="mt-6 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Application Messages</h2>
          {applications?.filter((a) => a.message).map((a) => (
            <div key={a.id} className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
              <p className="font-medium text-gray-900">{a.company_name}</p>
              <p className="mt-1 text-gray-600">{a.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
