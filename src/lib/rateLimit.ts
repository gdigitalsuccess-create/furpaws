/**
 * Simple in-process rate limiter (per-IP, sliding window).
 * Works on Vercel serverless — each instance has its own counter,
 * which is acceptable for abuse prevention (not strict enforcement).
 */

interface Window { count: number; resetAt: number }
const store = new Map<string, Window>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true; // allowed
  }

  if (entry.count >= limit) return false; // blocked

  entry.count++;
  return true; // allowed
}

export function getIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}
