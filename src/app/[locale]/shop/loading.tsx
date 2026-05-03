import { Skeleton } from '@/components/ui/skeleton';

export default function ShopLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="mb-2 h-8 w-48" />
      <Skeleton className="mb-8 h-4 w-24" />

      <div className="flex gap-6">
        {/* Sidebar skeleton */}
        <div className="hidden w-56 shrink-0 space-y-4 md:block">
          <Skeleton className="h-4 w-24" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full rounded-lg" />
          ))}
          <Skeleton className="mt-4 h-4 w-16" />
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>

        {/* Grid skeleton */}
        <div className="flex-1">
          <Skeleton className="mb-5 h-10 w-full rounded-xl" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full rounded-2xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-8 w-full rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
