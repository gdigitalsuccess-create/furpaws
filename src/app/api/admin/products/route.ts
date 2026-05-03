import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { assertAdmin } from '@/lib/assertAdmin';

export async function POST(request: Request) {
  if (!await assertAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('products')
      .insert(body as never)
      .select('id')
      .single() as { data: { id: string } | null; error: unknown };

    if (error) return NextResponse.json({ error: (error as { message: string }).message }, { status: 500 });
    return NextResponse.json({ id: (data as { id: string }).id });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
