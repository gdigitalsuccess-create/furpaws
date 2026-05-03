import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';

const schema = z.object({
  company_name:  z.string().min(2),
  contact_name:  z.string().min(2),
  email:         z.string().email(),
  phone:         z.string().min(7),
  business_type: z.string().min(1),
  message:       z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const data = parsed.data;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const admin = createAdminClient();
    const { error } = await admin
      .from('b2b_applications')
      .insert({
        user_id:       user?.id ?? null,
        company_name:  data.company_name,
        contact_name:  data.contact_name,
        email:         data.email,
        phone:         data.phone,
        business_type: data.business_type,
        message:       data.message ?? null,
        status:        'pending',
      } as never);

    if (error) {
      console.error('B2B apply error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('B2B apply unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
