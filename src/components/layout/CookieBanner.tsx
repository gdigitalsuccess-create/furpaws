'use client';

import { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';

const STORAGE_KEY = 'furpaws-cookie-consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, 'declined');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 md:p-6">
      <div className="mx-auto max-w-2xl rounded-2xl border border-fur-border bg-white p-4 shadow-xl flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-pink-light">
            <Cookie className="h-4.5 w-4.5 text-pink-primary" />
          </div>
          <p className="text-sm text-text-muted leading-relaxed">
            We use cookies to improve your experience and analyse site traffic.
            By clicking <strong className="text-text-dark">Accept</strong>, you agree to our use of cookies.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
          <button
            onClick={decline}
            className="rounded-xl border border-fur-border px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:border-text-muted hover:text-text-dark"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="rounded-xl bg-pink-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-pink-accent"
          >
            Accept
          </button>
          <button onClick={decline} aria-label="Close" className="ms-1 text-text-muted hover:text-text-dark">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
