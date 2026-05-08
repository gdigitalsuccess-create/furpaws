import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { rateLimit, getIp } from '@/lib/rateLimit';

const ALLOWED_DOC_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_DOC_SIZE = 10 * 1024 * 1024; // 10 MB

function validateDoc(file: File): string | null {
  if (!ALLOWED_DOC_TYPES.includes(file.type)) return 'Invalid file type. Use JPG, PNG, WebP or PDF.';
  if (file.size > MAX_DOC_SIZE) return 'File too large. Max 10 MB.';
  return null;
}

async function uploadDoc(admin: ReturnType<typeof createAdminClient>, file: File, folder: string): Promise<string | null> {
  const ext = file.type === 'application/pdf' ? 'pdf' : file.name.split('.').pop() ?? 'bin';
  const path = `${folder}/${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await admin.storage
    .from('b2b-documents')
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (error) {
    console.error('[b2b/apply] storage upload error:', error);
    return null;
  }
  return path;
}

export async function POST(request: Request) {
  if (!rateLimit(`b2b:${getIp(request)}`, 3, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const formData = await request.formData();

    const company_name        = formData.get('company_name') as string | null;
    const contact_name        = formData.get('contact_name') as string | null;
    const email               = formData.get('email') as string | null;
    const phone               = formData.get('phone') as string | null;
    const business_type       = formData.get('business_type') as string | null;
    const message             = formData.get('message') as string | null;
    const trade_license_number = formData.get('trade_license_number') as string | null;
    const trn_number          = formData.get('trn_number') as string | null;
    const emirates_id_number  = formData.get('emirates_id_number') as string | null;
    const trade_license_file  = formData.get('trade_license_doc') as File | null;
    const emirates_id_file    = formData.get('emirates_id_doc') as File | null;

    if (!company_name || !contact_name || !email || !phone || !business_type || !trade_license_number || !emirates_id_number) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const admin = createAdminClient();

    const appId = crypto.randomUUID();

    if (trade_license_file?.size) {
      const err = validateDoc(trade_license_file);
      if (err) return NextResponse.json({ error: `Trade license: ${err}` }, { status: 400 });
    }
    if (emirates_id_file?.size) {
      const err = validateDoc(emirates_id_file);
      if (err) return NextResponse.json({ error: `Emirates ID: ${err}` }, { status: 400 });
    }

    const trade_license_doc_url = trade_license_file?.size
      ? await uploadDoc(admin, trade_license_file, `${appId}/trade-license`)
      : null;

    const emirates_id_doc_url = emirates_id_file?.size
      ? await uploadDoc(admin, emirates_id_file, `${appId}/emirates-id`)
      : null;

    const { error } = await admin
      .from('b2b_applications')
      .insert({
        id:                    appId,
        user_id:               user?.id ?? null,
        company_name,
        contact_name,
        email,
        phone,
        business_type,
        message:               message || null,
        trade_license_number,
        trade_license_doc_url,
        trn_number:            trn_number || null,
        emirates_id_number,
        emirates_id_doc_url,
        status:                'pending',
      } as never);

    if (error) {
      console.error('[b2b/apply] db error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[b2b/apply] unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
