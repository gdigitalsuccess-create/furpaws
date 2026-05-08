'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MapPin, Mail, Phone, Send, CheckCircle } from 'lucide-react';
import { useLocale } from 'next-intl';

export default function ContactPage() {
  const locale = useLocale();
  if (locale === 'ar') return <ContactAr />;
  return <ContactEn />;
}

function ContactEn() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setSent(true);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative h-48 md:h-64 overflow-hidden bg-pink-50">
        <Image src="/hero.jpg" alt="Contact FurPaws" fill className="object-cover opacity-20" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-text-dark mb-2">
            Contact <span className="text-pink-primary">Us</span>
          </h1>
          <p className="text-text-muted">We'd love to hear from you — reach out anytime.</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-12">

          {/* Info */}
          <div>
            <h2 className="text-xl font-bold text-text-dark mb-6">Get in Touch</h2>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-pink-light flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-pink-primary" />
                </div>
                <div>
                  <p className="font-semibold text-text-dark">Address</p>
                  <p className="text-text-muted text-sm">Sharjah, United Arab Emirates</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-pink-light flex items-center justify-center">
                  <Mail className="h-5 w-5 text-pink-primary" />
                </div>
                <div>
                  <p className="font-semibold text-text-dark">Email</p>
                  <a href="mailto:hello@furpaws.ae" className="text-pink-primary text-sm hover:underline">
                    hello@furpaws.ae
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-pink-light flex items-center justify-center">
                  <Phone className="h-5 w-5 text-pink-primary" />
                </div>
                <div>
                  <p className="font-semibold text-text-dark">WhatsApp</p>
                  <a href="https://wa.me/971500000000" target="_blank" rel="noopener noreferrer" className="text-pink-primary text-sm hover:underline">
                    +971 50 000 0000
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-8 p-5 bg-pink-50 rounded-2xl">
              <p className="text-sm font-semibold text-text-dark mb-1">Working Hours</p>
              <p className="text-sm text-text-muted">Monday – Saturday: 9:00 AM – 7:00 PM</p>
              <p className="text-sm text-text-muted">Sunday: 10:00 AM – 4:00 PM (UAE Time)</p>
            </div>
          </div>

          {/* Form */}
          <div>
            {sent ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <CheckCircle className="h-14 w-14 text-emerald-500 mb-4" />
                <h3 className="text-xl font-bold text-text-dark mb-2">Message Sent!</h3>
                <p className="text-text-muted">Thank you for reaching out. We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-1">Name *</label>
                    <input
                      required
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your name"
                      className="w-full h-11 rounded-xl border border-fur-border px-4 text-sm text-text-dark placeholder:text-text-muted focus:border-pink-primary focus:outline-none focus:ring-2 focus:ring-pink-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-1">Email *</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="your@email.com"
                      className="w-full h-11 rounded-xl border border-fur-border px-4 text-sm text-text-dark placeholder:text-text-muted focus:border-pink-primary focus:outline-none focus:ring-2 focus:ring-pink-primary/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Subject</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="What is this about?"
                    className="w-full h-11 rounded-xl border border-fur-border px-4 text-sm text-text-dark placeholder:text-text-muted focus:border-pink-primary focus:outline-none focus:ring-2 focus:ring-pink-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Message *</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us how we can help..."
                    className="w-full rounded-xl border border-fur-border px-4 py-3 text-sm text-text-dark placeholder:text-text-muted focus:border-pink-primary focus:outline-none focus:ring-2 focus:ring-pink-primary/20 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 h-12 rounded-full bg-pink-primary text-white font-bold hover:bg-pink-accent transition-colors disabled:opacity-60"
                >
                  {loading ? (
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function ContactAr() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setSent(true);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-white" dir="rtl">
      {/* Hero */}
      <section className="relative h-48 md:h-64 overflow-hidden bg-pink-50">
        <Image src="/hero.jpg" alt="تواصل مع فيرباوز" fill className="object-cover opacity-20" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-text-dark mb-2">
            <span className="text-pink-primary">تواصل</span> معنا
          </h1>
          <p className="text-text-muted">يسعدنا سماعك — تواصل معنا في أي وقت.</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-12">

          {/* Info */}
          <div>
            <h2 className="text-xl font-bold text-text-dark mb-6">معلومات التواصل</h2>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-pink-light flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-pink-primary" />
                </div>
                <div>
                  <p className="font-semibold text-text-dark">العنوان</p>
                  <p className="text-text-muted text-sm">الشارقة، الإمارات العربية المتحدة</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-pink-light flex items-center justify-center">
                  <Mail className="h-5 w-5 text-pink-primary" />
                </div>
                <div>
                  <p className="font-semibold text-text-dark">البريد الإلكتروني</p>
                  <a href="mailto:hello@furpaws.ae" className="text-pink-primary text-sm hover:underline">
                    hello@furpaws.ae
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-pink-light flex items-center justify-center">
                  <Phone className="h-5 w-5 text-pink-primary" />
                </div>
                <div>
                  <p className="font-semibold text-text-dark">واتساب</p>
                  <a href="https://wa.me/971500000000" target="_blank" rel="noopener noreferrer" className="text-pink-primary text-sm hover:underline">
                    +971 50 000 0000
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-8 p-5 bg-pink-50 rounded-2xl">
              <p className="text-sm font-semibold text-text-dark mb-1">ساعات العمل</p>
              <p className="text-sm text-text-muted">الاثنين – السبت: 9:00 ص – 7:00 م</p>
              <p className="text-sm text-text-muted">الأحد: 10:00 ص – 4:00 م (توقيت الإمارات)</p>
            </div>
          </div>

          {/* Form */}
          <div>
            {sent ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <CheckCircle className="h-14 w-14 text-emerald-500 mb-4" />
                <h3 className="text-xl font-bold text-text-dark mb-2">تم إرسال رسالتك!</h3>
                <p className="text-text-muted">شكراً لتواصلك معنا. سنرد عليك خلال 24 ساعة.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-1">الاسم *</label>
                    <input
                      required
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="اسمك الكريم"
                      className="w-full h-11 rounded-xl border border-fur-border px-4 text-sm text-text-dark placeholder:text-text-muted focus:border-pink-primary focus:outline-none focus:ring-2 focus:ring-pink-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-1">البريد الإلكتروني *</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="your@email.com"
                      className="w-full h-11 rounded-xl border border-fur-border px-4 text-sm text-text-dark placeholder:text-text-muted focus:border-pink-primary focus:outline-none focus:ring-2 focus:ring-pink-primary/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">الموضوع</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="موضوع رسالتك"
                    className="w-full h-11 rounded-xl border border-fur-border px-4 text-sm text-text-dark placeholder:text-text-muted focus:border-pink-primary focus:outline-none focus:ring-2 focus:ring-pink-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">الرسالة *</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="كيف يمكننا مساعدتك؟"
                    className="w-full rounded-xl border border-fur-border px-4 py-3 text-sm text-text-dark placeholder:text-text-muted focus:border-pink-primary focus:outline-none focus:ring-2 focus:ring-pink-primary/20 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 h-12 rounded-full bg-pink-primary text-white font-bold hover:bg-pink-accent transition-colors disabled:opacity-60"
                >
                  {loading ? (
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      إرسال الرسالة
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
