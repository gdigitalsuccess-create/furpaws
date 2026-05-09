import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === 'ar' ? 'شروط الخدمة' : 'Terms of Service',
    description: locale === 'ar'
      ? 'شروط وأحكام استخدام متجر فيرباوز للحيوانات الأليفة في الإمارات'
      : 'FURPAWS Terms of Service — your rights and obligations when shopping with us in the UAE.',
  };
}

export default async function TermsPage({ params }: PageProps) {
  const { locale } = await params;
  const isAr = locale === 'ar';
  const updated = 'May 7, 2026';

  if (isAr) return <ArabicTerms updated={updated} />;
  return <EnglishTerms updated={updated} />;
}

function EnglishTerms({ updated }: { updated: string }) {
  return (
    <LegalLayout title="Terms of Service" updated={updated}>
      <Section title="1. About Us">
        <p>FURPAWS is a pet accessories retailer based in <strong>Sharjah, United Arab Emirates</strong>. By placing an order or using our website you agree to these Terms of Service, governed by <strong>UAE Federal Law No. 1 of 2006 on Electronic Commerce</strong> and <strong>UAE Federal Law No. 15 of 2020 on Consumer Protection</strong>.</p>
      </Section>

      <Section title="2. Products & Availability">
        <ul>
          <li>All prices are in <strong>AED (UAE Dirham)</strong> and include VAT where applicable.</li>
          <li>We reserve the right to modify prices without prior notice.</li>
          <li>Product images are for illustrative purposes only; slight colour variations may occur.</li>
          <li>We reserve the right to cancel orders where stock is unavailable; a full refund will be issued immediately.</li>
        </ul>
      </Section>

      <Section title="3. Orders & Payment">
        <ul>
          <li>Orders are confirmed only after successful payment processing.</li>
          <li>We accept Visa, Mastercard, and other cards supported by Stripe.</li>
          <li>All transactions are encrypted and processed by <strong>Stripe, Inc.</strong> (PCI-DSS Level 1).</li>
          <li>Promotional codes are subject to individual terms and cannot be combined unless stated.</li>
        </ul>
      </Section>

      <Section title="4. Shipping">
        <ul>
          <li>We deliver within the <strong>UAE only</strong>.</li>
          <li>Shipping fees vary by emirate (AED 15–30). Orders above <strong>AED 250</strong> qualify for free shipping.</li>
          <li>Estimated delivery: <strong>2–5 business days</strong> within the UAE.</li>
          <li>FURPAWS is not responsible for delays caused by courier services or customs.</li>
        </ul>
      </Section>

      <Section title="5. Returns & Refunds">
        <p>In accordance with UAE Consumer Protection Law, you may return eligible products within <strong>14 days of delivery</strong>, provided:</p>
        <ul>
          <li>The product is unused, in its original packaging and condition.</li>
          <li>Proof of purchase (order number or receipt) is provided.</li>
          <li>The product is not from an excluded category (see below).</li>
        </ul>
        <p className="mt-2"><strong>Excluded from returns:</strong> perishable goods, opened food/treats, grooming items that have been used, and products damaged by the buyer.</p>
        <p className="mt-2"><strong>Refund process:</strong> Refunds are processed to the original payment method within <strong>5–10 business days</strong> after we receive and inspect the returned item.</p>
        <p className="mt-2">To initiate a return, contact us at <a href="mailto:support@furpaws-uae.com">support@furpaws-uae.com</a> with your order number.</p>
      </Section>

      <Section title="6. Defective or Wrong Items">
        <p>If you receive a defective, damaged, or incorrect item, please contact us within <strong>48 hours of delivery</strong> with photos. We will arrange a free replacement or full refund at our discretion.</p>
      </Section>

      <Section title="7. Intellectual Property">
        <p>All content on this website (text, images, logos, designs) is the property of FURPAWS or its licensors. You may not reproduce, distribute, or use any content without our prior written consent.</p>
      </Section>

      <Section title="8. Limitation of Liability">
        <p>To the maximum extent permitted by UAE law, FURPAWS is not liable for indirect or consequential damages arising from the use of our products or website. Our total liability shall not exceed the value of the order in question.</p>
      </Section>

      <Section title="9. Governing Law & Disputes">
        <p>These Terms are governed by the laws of the <strong>United Arab Emirates</strong>. Any disputes shall be subject to the exclusive jurisdiction of the courts of <strong>Sharjah, UAE</strong>.</p>
      </Section>

      <Section title="10. Changes to These Terms">
        <p>We may update these Terms from time to time. Continued use of our website after changes constitutes acceptance of the new Terms. The effective date is shown at the top of this page.</p>
      </Section>

      <Section title="11. Contact">
        <p><strong>FURPAWS</strong><br />Sharjah, United Arab Emirates<br />Email: <a href="mailto:support@furpaws-uae.com">support@furpaws-uae.com</a></p>
      </Section>
    </LegalLayout>
  );
}

function ArabicTerms({ updated }: { updated: string }) {
  return (
    <LegalLayout title="شروط الخدمة" updated={updated} isAr>
      <Section title="١. معلومات عنا">
        <p>فيرباوز هو متجر لمستلزمات الحيوانات الأليفة مقره في <strong>الشارقة، الإمارات العربية المتحدة</strong>. باستخدام موقعنا أو تقديم طلب، فإنك توافق على هذه الشروط المنظَّمة بموجب <strong>قانون التجارة الإلكترونية الاتحادي رقم 1 لسنة 2006</strong> و<strong>قانون حماية المستهلك الاتحادي رقم 15 لسنة 2020</strong>.</p>
      </Section>

      <Section title="٢. المنتجات والأسعار">
        <ul>
          <li>جميع الأسعار بالدرهم الإماراتي (AED) وتشمل ضريبة القيمة المضافة عند الانطباق.</li>
          <li>نحتفظ بحق تعديل الأسعار دون إشعار مسبق.</li>
          <li>الصور توضيحية فقط، قد تختلف الألوان قليلاً في الواقع.</li>
        </ul>
      </Section>

      <Section title="٣. الطلبات والدفع">
        <ul>
          <li>تُؤكَّد الطلبات فقط بعد نجاح عملية الدفع.</li>
          <li>نقبل Visa وMastercard والبطاقات المدعومة عبر Stripe.</li>
          <li>رموز الخصم خاضعة لشروط محددة ولا يمكن دمجها إلا عند النص على ذلك.</li>
        </ul>
      </Section>

      <Section title="٤. الشحن والتوصيل">
        <ul>
          <li>نوصّل داخل <strong>الإمارات العربية المتحدة فقط</strong>.</li>
          <li>رسوم الشحن تتراوح بين 15 و30 درهم حسب الإمارة. الطلبات فوق <strong>250 درهم</strong> تحظى بشحن مجاني.</li>
          <li>مدة التوصيل المتوقعة: <strong>2–5 أيام عمل</strong>.</li>
        </ul>
      </Section>

      <Section title="٥. الإرجاع والاسترداد">
        <p>وفقاً لقانون حماية المستهلك الإماراتي، يمكنك إرجاع المنتجات المؤهلة خلال <strong>14 يوماً من التسليم</strong> شريطة أن تكون:</p>
        <ul>
          <li>غير مستخدمة، في عبوتها الأصلية وحالتها الأولى.</li>
          <li>مرفقة برقم الطلب.</li>
          <li>غير مشمولة بالاستثناءات: المواد الغذائية المفتوحة، منتجات العناية المستخدمة.</li>
        </ul>
        <p className="mt-2">تُعالَج المبالغ المستردة خلال <strong>5–10 أيام عمل</strong> بعد استلام وفحص المنتج. للبدء: <a href="mailto:support@furpaws-uae.com">support@furpaws-uae.com</a></p>
      </Section>

      <Section title="٦. القانون الحاكم">
        <p>تخضع هذه الشروط لقوانين <strong>الإمارات العربية المتحدة</strong>، وتختص محاكم <strong>الشارقة</strong> بالفصل في أي نزاعات.</p>
      </Section>

      <Section title="٧. التواصل">
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
