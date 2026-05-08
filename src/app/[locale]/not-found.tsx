import Link from 'next/link';
import { PawPrint } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-off-white px-4 py-16 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-pink-light">
        <PawPrint className="h-12 w-12 text-pink-primary" />
      </div>
      <p className="mb-2 text-7xl font-black text-pink-primary">404</p>
      <h1 className="mb-3 text-2xl font-bold text-text-dark">Page not found</h1>
      <p className="mb-8 max-w-sm text-text-muted">
        Oops! This page has run off like a curious cat. Let&apos;s get you back on track.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/en"
          className="rounded-xl bg-pink-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-pink-accent"
        >
          Back to Home
        </Link>
        <Link
          href="/en/shop"
          className="rounded-xl border border-fur-border bg-white px-6 py-3 font-semibold text-text-dark transition-colors hover:border-pink-primary hover:text-pink-primary"
        >
          Browse Shop
        </Link>
      </div>
    </div>
  );
}
