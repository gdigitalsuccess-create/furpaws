import { createAdminClient } from '@/lib/supabase/admin';
import B2BActionButtons from '@/components/admin/B2BActionButtons';
import type { B2BApplication } from '@/types/database';
import { FileText, CreditCard, Receipt } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin — B2B Requests' };

const STATUS_STYLE: Record<string, string> = {
  pending:  'bg-yellow-100 text-yellow-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
};

async function getSignedUrl(admin: ReturnType<typeof createAdminClient>, path: string | null): Promise<string | null> {
  if (!path) return null;
  const { data } = await admin.storage.from('b2b-documents').createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

export default async function AdminB2BPage() {
  const admin = createAdminClient();
  const { data: applications } = await admin
    .from('b2b_applications')
    .select('*')
    .order('created_at', { ascending: false }) as { data: B2BApplication[] | null; error: unknown };

  // Generate signed URLs for all documents
  const docsMap: Record<string, { tradeLicense: string | null; emiratesId: string | null }> = {};
  await Promise.all(
    (applications ?? []).map(async (app) => {
      const [tradeLicense, emiratesId] = await Promise.all([
        getSignedUrl(admin, app.trade_license_doc_url),
        getSignedUrl(admin, app.emirates_id_doc_url),
      ]);
      docsMap[app.id] = { tradeLicense, emiratesId };
    })
  );

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">B2B Requests</h1>

      <div className="space-y-4">
        {(applications ?? []).map((app) => {
          const date = new Intl.DateTimeFormat('en-AE', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(app.created_at));
          const docs = docsMap[app.id];
          return (
            <div key={app.id} className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
              <div className="flex items-start justify-between gap-4">
                {/* Left — company info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="font-semibold text-gray-900">{app.company_name}</p>
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLE[app.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {app.status}
                    </span>
                    <span className="text-xs text-gray-400">{date}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500">{app.contact_name} · {app.email} · {app.phone}</p>
                  {app.business_type && <p className="mt-0.5 text-xs text-gray-400 capitalize">Type: {app.business_type}</p>}
                </div>

                {/* Right — action */}
                <div className="shrink-0">
                  {app.status === 'pending' ? (
                    <B2BActionButtons id={app.id} userId={app.user_id} />
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </div>
              </div>

              {/* UAE verification fields */}
              <div className="mt-4 grid gap-3 sm:grid-cols-3 border-t border-gray-100 pt-4">
                {/* Trade License */}
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 mt-0.5 shrink-0 text-pink-500" />
                  <div className="text-xs">
                    <p className="font-medium text-gray-500 uppercase tracking-wide">Trade License</p>
                    <p className="mt-0.5 text-gray-800">{app.trade_license_number ?? '—'}</p>
                    {docs.tradeLicense && (
                      <a href={docs.tradeLicense} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-pink-500 hover:underline">
                        View document ↗
                      </a>
                    )}
                  </div>
                </div>

                {/* Emirates ID */}
                <div className="flex items-start gap-2">
                  <CreditCard className="h-4 w-4 mt-0.5 shrink-0 text-pink-500" />
                  <div className="text-xs">
                    <p className="font-medium text-gray-500 uppercase tracking-wide">Emirates ID</p>
                    <p className="mt-0.5 text-gray-800">{app.emirates_id_number ?? '—'}</p>
                    {docs.emiratesId && (
                      <a href={docs.emiratesId} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-pink-500 hover:underline">
                        View document ↗
                      </a>
                    )}
                  </div>
                </div>

                {/* TRN */}
                <div className="flex items-start gap-2">
                  <Receipt className="h-4 w-4 mt-0.5 shrink-0 text-pink-500" />
                  <div className="text-xs">
                    <p className="font-medium text-gray-500 uppercase tracking-wide">TRN (VAT)</p>
                    <p className="mt-0.5 text-gray-800">{app.trn_number ?? '—'}</p>
                  </div>
                </div>
              </div>

              {/* Message */}
              {app.message && (
                <div className="mt-3 rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-600">
                  {app.message}
                </div>
              )}
            </div>
          );
        })}

        {!applications?.length && (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-400">
            No B2B applications yet.
          </div>
        )}
      </div>
    </div>
  );
}
