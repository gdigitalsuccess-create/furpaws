import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy',
    description: locale === 'ar'
      ? 'سياسة الخصوصية لمتجر فيرباوز — كيف نحمي بياناتك الشخصية'
      : 'FURPAWS Privacy Policy — how we collect, use and protect your personal data.',
  };
}

export default async function PrivacyPage({ params }: PageProps) {
  const { locale } = await params;
  const isAr = locale === 'ar';
  const updated = 'May 7, 2026';

  if (isAr) return <ArabicPrivacy updated={updated} />;
  return <EnglishPrivacy updated={updated} />;
}

function EnglishPrivacy({ updated }: { updated: string }) {
  return (
    <LegalLayout title="Privacy Policy" updated={updated}>
      <Section title="1. Introduction">
        <p>FURPAWS ("we", "our", "us") is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase. It complies with the <strong>UAE Federal Decree-Law No. 45 of 2021 on the Protection of Personal Data (PDPL)</strong>.</p>
      </Section>

      <Section title="2. Data We Collect">
        <ul>
          <li><strong>Identity & contact:</strong> name, email address, phone number.</li>
          <li><strong>Delivery address:</strong> street, city, emirate, UAE.</li>
          <li><strong>Order data:</strong> products purchased, order amounts, payment status.</li>
          <li><strong>Technical data:</strong> IP address, browser type, device, pages visited (via Vercel Analytics — anonymised).</li>
          <li><strong>Cookies:</strong> session cookies for cart/wishlist persistence; analytics cookies (see Section 6).</li>
        </ul>
        <p className="mt-2">We do <strong>not</strong> store payment card details. All payments are processed securely by <strong>Stripe, Inc.</strong> (PCI-DSS Level 1 certified).</p>
      </Section>

      <Section title="3. How We Use Your Data">
        <ul>
          <li>Process and fulfil your orders.</li>
          <li>Send order confirmation and shipping emails.</li>
          <li>Respond to customer enquiries.</li>
          <li>Send back-in-stock alerts you subscribed to.</li>
          <li>Send our newsletter (only if you opted in — unsubscribe at any time).</li>
          <li>Improve our website through anonymous analytics.</li>
        </ul>
      </Section>

      <Section title="4. Legal Basis for Processing">
        <p>We process your personal data based on:</p>
        <ul>
          <li><strong>Contract performance</strong> — to process orders and deliver goods.</li>
          <li><strong>Legitimate interest</strong> — to improve our services and prevent fraud.</li>
          <li><strong>Consent</strong> — for marketing emails and cookies (where required).</li>
        </ul>
      </Section>

      <Section title="5. Data Sharing & Third Parties">
        <p>We share your data only where necessary:</p>
        <table>
          <thead><tr><th>Partner</th><th>Purpose</th><th>Location</th></tr></thead>
          <tbody>
            <tr><td>Stripe, Inc.</td><td>Payment processing</td><td>USA (SCCs)</td></tr>
            <tr><td>Supabase, Inc.</td><td>Database & authentication</td><td>USA (SCCs)</td></tr>
            <tr><td>Resend, Inc.</td><td>Transactional emails</td><td>USA (SCCs)</td></tr>
            <tr><td>Vercel, Inc.</td><td>Website hosting & analytics</td><td>USA (SCCs)</td></tr>
          </tbody>
        </table>
        <p className="mt-2">We never sell your personal data to third parties.</p>
      </Section>

      <Section title="6. Cookies">
        <p>We use the following cookies:</p>
        <ul>
          <li><strong>Essential cookies:</strong> cart contents, wishlist, session state. These cannot be disabled.</li>
          <li><strong>Analytics cookies:</strong> anonymous usage statistics via Vercel Analytics. You can opt out via our Cookie Banner.</li>
        </ul>
      </Section>

      <Section title="7. Data Retention">
        <p>We retain your personal data for as long as necessary to fulfil the purposes above. Order records are kept for <strong>5 years</strong> to comply with UAE commercial law. You may request earlier deletion (see Section 8).</p>
      </Section>

      <Section title="8. Your Rights (PDPL)">
        <p>Under UAE PDPL, you have the right to:</p>
        <ul>
          <li>Access your personal data.</li>
          <li>Correct inaccurate data.</li>
          <li>Request deletion of your data.</li>
          <li>Withdraw consent at any time.</li>
          <li>Lodge a complaint with the UAE Data Office.</li>
        </ul>
        <p className="mt-2">To exercise these rights, email us at <a href="mailto:support@furpaws-uae.com">support@furpaws-uae.com</a>.</p>
      </Section>

      <Section title="9. Security">
        <p>We implement appropriate technical and organisational measures to protect your data, including TLS encryption, row-level security on our database, and access controls for admin functions.</p>
      </Section>

      <Section title="10. Children">
        <p>Our services are not directed to children under 13. We do not knowingly collect data from children.</p>
      </Section>

      <Section title="11. Contact">
        <p><strong>FURPAWS</strong><br />Sharjah, United Arab Emirates<br />Email: <a href="mailto:support@furpaws-uae.com">support@furpaws-uae.com</a></p>
      </Section>
    </LegalLayout>
  );
}

function ArabicPrivacy({ updated }: { updated: string }) {
  return (
    <LegalLayout title="سياسة الخصوصية" updated={updated} isAr>
      <Section title="١. مقدمة">
        <p>تلتزم فيرباوز ("نحن") بحماية بياناتك الشخصية. توضح هذه السياسة كيفية جمع بياناتك واستخدامها والإفصاح عنها، وهي متوافقة مع <strong>المرسوم بقانون اتحادي رقم 45 لسنة 2021 بشأن حماية البيانات الشخصية (PDPL)</strong>.</p>
      </Section>

      <Section title="٢. البيانات التي نجمعها">
        <ul>
          <li><strong>الهوية والتواصل:</strong> الاسم، البريد الإلكتروني، رقم الهاتف.</li>
          <li><strong>عنوان التسليم:</strong> الشارع، المدينة، الإمارة.</li>
          <li><strong>بيانات الطلب:</strong> المنتجات المشتراة، المبالغ، حالة الدفع.</li>
          <li><strong>البيانات التقنية:</strong> عنوان IP، نوع المتصفح، الجهاز، الصفحات المزارة (عبر Vercel Analytics — مجهولة الهوية).</li>
        </ul>
        <p className="mt-2">لا نحتفظ ببيانات بطاقات الدفع. تُعالج جميع المدفوعات من قِبل <strong>Stripe, Inc.</strong> (معتمدة PCI-DSS المستوى 1).</p>
      </Section>

      <Section title="٣. كيف نستخدم بياناتك">
        <ul>
          <li>معالجة طلباتك وتنفيذها.</li>
          <li>إرسال تأكيدات الطلب وإشعارات الشحن.</li>
          <li>الرد على استفساراتك.</li>
          <li>إرسال إشعارات توفر المنتجات التي اشتركت فيها.</li>
          <li>إرسال النشرة الإخبارية (فقط إذا وافقت — يمكن إلغاء الاشتراك في أي وقت).</li>
        </ul>
      </Section>

      <Section title="٤. مشاركة البيانات مع أطراف ثالثة">
        <p>نشارك بياناتك فقط عند الضرورة مع: Stripe (الدفع)، Supabase (قاعدة البيانات)، Resend (البريد الإلكتروني)، Vercel (الاستضافة). لا نبيع بياناتك الشخصية أبداً.</p>
      </Section>

      <Section title="٥. حقوقك (PDPL)">
        <p>بموجب قانون PDPL الإماراتي، يحق لك الوصول إلى بياناتك، تصحيحها، طلب حذفها، وسحب موافقتك في أي وقت. للتواصل: <a href="mailto:support@furpaws-uae.com">support@furpaws-uae.com</a></p>
      </Section>

      <Section title="٦. التواصل">
        <p><strong>فيرباوز</strong><br />الشارقة، الإمارات العربية المتحدة<br />البريد الإلكتروني: <a href="mailto:support@furpaws-uae.com">support@furpaws-uae.com</a></p>
      </Section>
    </LegalLayout>
  );
}

function LegalLayout({ title, updated, children, isAr = false }: { title: string; updated: string; children: React.ReactNode; isAr?: boolean }) {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold text-text-dark">{title}</h1>
      <p className="mb-10 text-sm text-text-muted">
        {isAr ? `آخر تحديث: ${updated}` : `Last updated: ${updated}`}
      </p>
      <div className="prose prose-sm max-w-none text-text-dark space-y-8">{children}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-text-dark border-b border-fur-border pb-2">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-text-dark [&_ul]:list-disc [&_ul]:ps-5 [&_ul]:space-y-1 [&_a]:text-pink-primary [&_a]:underline [&_table]:w-full [&_table]:text-sm [&_th]:text-start [&_th]:pb-2 [&_th]:font-semibold [&_td]:py-1.5 [&_td]:pe-4 [&_tr]:border-b [&_tr]:border-fur-border">
        {children}
      </div>
    </section>
  );
}
