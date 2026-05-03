import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { assertAdmin } from '@/lib/assertAdmin';
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

    const { error } = await admin
      .from('b2b_applications')
      .update({ status: newStatus } as never)
      .eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // If approved and we have a linked user — update their profile role
    if (action === 'approve' && user_id) {
      await admin
        .from('profiles')
        .update({ role: 'b2b', b2b_status: 'approved' } as never)
        .eq('id', user_id);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
