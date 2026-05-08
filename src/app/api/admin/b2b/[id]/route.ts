import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { assertAdmin } from '@/lib/assertAdmin';
import { sendB2BApprovalEmail } from '@/lib/email';
import { z } from 'zod';

const schema = z.object({
  action:  z.enum(['approve', 'reject']),
  user_id: z.string().uuid().nullable().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await assertAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });

    const { action, user_id } = parsed.data;
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const admin = createAdminClient();

    // Fetch the application to get the email
    const { data: application } = await admin
      .from('b2b_applications')
      .select('email, contact_name, company_name')
      .eq('id', id)
      .single() as { data: { email: string; contact_name: string; company_name: string } | null };

    // Update application status
    const { error } = await admin
      .from('b2b_applications')
      .update({ status: newStatus } as never)
      .eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (action === 'approve') {
      let resolvedUserId = user_id ?? null;

      // If user_id is missing, look up user by email in Supabase Auth
      if (!resolvedUserId && application?.email) {
        const { data: { users } } = await admin.auth.admin.listUsers();
        const match = users.find((u) => u.email === application.email);
        if (match) resolvedUserId = match.id;
      }

      // Update profile role if user found
      if (resolvedUserId) {
        await admin
          .from('profiles')
          .update({ role: 'b2b', b2b_status: 'approved' } as never)
          .eq('id', resolvedUserId);
      }

      // Send approval email
      if (application) {
        sendB2BApprovalEmail(application.email, application.contact_name, application.company_name).catch(() => {});
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
