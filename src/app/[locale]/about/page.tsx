import type { Metadata } from 'next';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { Heart, Truck, ShieldCheck, Star } from 'lucide-react';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://furpaws-uae.com';
  return {
    title: isAr ? 'من نحن' : 'About Us',
    description: isAr
      ? 'تعرف على فيرباوز — متجرك الأول لمستلزمات الحيوانات الأليفة في الشارقة والإمارات'
      : 'Learn about FURPAWS — the UAE\'s go-to store for premium pet accessories, based in Sharjah.',
    alternates: { canonical: `${base}/${locale}/about` },
    openGraph: {
      url: `${base}/${locale}/about`,
      locale: isAr ? 'ar_AE' : 'en_AE',
      images: [{ url: '/hero.jpg', width: 1200, height: 630, alt: 'FURPAWS About Us' }],
    },
  };
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  if (locale === 'ar') return <AboutAr />;
  return <AboutEn />;
}

function AboutEn() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative h-64 md:h-80 overflow-hidden bg-pink-50">
        <Image
          src="/hero.jpg"
          alt="FurPaws — About Us"
          fill
          className="object-cover opacity-30"
          priority
        />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-text-dark mb-3">
            About <span className="text-pink-primary">FurPaws</span>
          </h1>
          <p className="text-text-muted text-lg max-w-xl">
            Premium pet accessories — proudly based in Sharjah, UAE.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-bold text-text-dark mb-4">Our Story</h2>
            <p className="text-text-muted leading-relaxed mb-4">
              FurPaws was born from a simple belief: every pet deserves the best. Founded in Sharjah, UAE, we set out to bring high-quality, carefully selected accessories to pet owners across the Emirates — without the hassle of long waits or inflated prices.
            </p>
            <p className="text-text-muted leading-relaxed">
              From grooming tools and cosy beds to carriers and veterinary essentials, every product in our catalogue is chosen with your pet's comfort and safety in mind. We partner with trusted international brands while continuously expanding our own FurPaws collection.
            </p>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-lg">
            <Image
              src="/hero.jpg"
              alt="FurPaws pets"
              width={600}
              height={400}
              className="object-cover w-full h-64"
            />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-pink-50 py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-bold text-text-dark text-center mb-10">Why FurPaws?</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <Heart className="h-7 w-7 text-pink-primary" />, title: 'Made with Love', desc: 'Every product is hand-picked by pet lovers, for pet lovers.' },
              { icon: <ShieldCheck className="h-7 w-7 text-pink-primary" />, title: 'Quality Assured', desc: 'We only stock safe, tested, and trusted brands.' },
              { icon: <Truck className="h-7 w-7 text-pink-primary" />, title: 'Fast UAE Delivery', desc: 'Delivered across all 7 Emirates. Free shipping over AED 250.' },
              { icon: <Star className="h-7 w-7 text-pink-primary" />, title: '5-Star Service', desc: 'Friendly support team always ready to help you and your pet.' },
            ].map((v) => (
              <div key={v.title} className="bg-white rounded-2xl p-6 text-center shadow-sm">
                <div className="flex justify-center mb-3">{v.icon}</div>
                <h3 className="font-bold text-text-dark mb-1">{v.title}</h3>
                <p className="text-sm text-text-muted">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-text-dark mb-4">Ready to spoil your pet?</h2>
        <p className="text-text-muted mb-8 max-w-md mx-auto">
          Browse our full collection of premium pet accessories — delivered fast across the UAE.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-pink-primary text-white font-bold hover:bg-pink-accent transition-colors"
          >
            Shop Now
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-8 py-3 rounded-full border-2 border-pink-primary text-pink-primary font-bold hover:bg-pink-light transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  );
}

function AboutAr() {
  return (
    <main className="min-h-screen bg-white" dir="rtl">
      {/* Hero */}
      <section className="relative h-64 md:h-80 overflow-hidden bg-pink-50">
        <Image
          src="/hero.jpg"
          alt="فيرباوز — من نحن"
          fill
          className="object-cover opacity-30"
          priority
        />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-text-dark mb-3">
            من نحن — <span className="text-pink-primary">فيرباوز</span>
          </h1>
          <p className="text-text-muted text-lg max-w-xl">
            مستلزمات الحيوانات الأليفة الفاخرة — من قلب الشارقة، الإمارات.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-bold text-text-dark mb-4">قصتنا</h2>
            <p className="text-text-muted leading-relaxed mb-4">
              وُلدت فيرباوز من إيمان بسيط: كل حيوان أليف يستحق الأفضل. أسّسنا متجرنا في الشارقة بهدف توفير مستلزمات عالية الجودة لأصحاب الحيوانات الأليفة في جميع أنحاء الإمارات — بأسعار معقولة وتوصيل سريع.
            </p>
            <p className="text-text-muted leading-relaxed">
              من أدوات العناية والأسرّة المريحة إلى حوامل النقل واللوازم البيطرية، كل منتج في كتالوجنا مختار بعناية مع مراعاة راحة وسلامة حيوانك الأليف.
            </p>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-lg">
            <Image
              src="/hero.jpg"
              alt="حيوانات فيرباوز"
              width={600}
              height={400}
              className="object-cover w-full h-64"
            />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-pink-50 py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-bold text-text-dark text-center mb-10">لماذا فيرباوز؟</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <Heart className="h-7 w-7 text-pink-primary" />, title: 'بُني بالحب', desc: 'كل منتج اخترناه بعناية من قِبَل محبّي الحيوانات.' },
              { icon: <ShieldCheck className="h-7 w-7 text-pink-primary" />, title: 'جودة مضمونة', desc: 'نوفّر فقط ماركات موثوقة وآمنة.' },
              { icon: <Truck className="h-7 w-7 text-pink-primary" />, title: 'توصيل سريع', desc: 'نوصّل لجميع الإمارات. شحن مجاني فوق 250 درهم.' },
              { icon: <Star className="h-7 w-7 text-pink-primary" />, title: 'خدمة 5 نجوم', desc: 'فريق دعم ودود جاهز لمساعدتك دائماً.' },
            ].map((v) => (
              <div key={v.title} className="bg-white rounded-2xl p-6 text-center shadow-sm">
                <div className="flex justify-center mb-3">{v.icon}</div>
                <h3 className="font-bold text-text-dark mb-1">{v.title}</h3>
                <p className="text-sm text-text-muted">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-text-dark mb-4">هل أنت مستعد لإسعاد حيوانك الأليف؟</h2>
        <p className="text-text-muted mb-8 max-w-md mx-auto">
          تصفّح مجموعتنا الكاملة من مستلزمات الحيوانات الأليفة الفاخرة — توصيل سريع في كل الإمارات.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-pink-primary text-white font-bold hover:bg-pink-accent transition-colors"
          >
            تسوّق الآن
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-8 py-3 rounded-full border-2 border-pink-primary text-pink-primary font-bold hover:bg-pink-light transition-colors"
          >
            تواصل معنا
          </Link>
        </div>
      </section>
    </main>
  );
}
