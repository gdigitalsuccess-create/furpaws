import { Skeleton } from '@/components/ui/skeleton';

function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-fur-border bg-white">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-0.5">
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-3 w-3 rounded-sm" />)}
        </div>
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
    </div>
  );
}

export default function ShopLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <Skeleton className="mb-2 h-9 w-52" />
      <Skeleton className="mb-8 h-4 w-28" />

      <div className="flex gap-6">
        {/* Sidebar skeleton */}
        <aside className="hidden w-56 shrink-0 space-y-6 md:block">
          {/* Categories */}
          <div className="space-y-1.5">
            <Skeleton className="mb-3 h-3 w-20" />
            {[90, 60, 55, 80, 70, 65].map((w, i) => (
              <Skeleton key={i} className="h-9 rounded-lg" style={{ width: `${w}%` }} />
            ))}
          </div>
          {/* Sort */}
          <div>
            <Skeleton className="mb-3 h-3 w-16" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
          {/* Price range */}
          <div className="space-y-3">
            <Skeleton className="h-3 w-24" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>
          {/* Brands */}
          <div className="space-y-1.5">
            <Skeleton className="mb-3 h-3 w-14" />
            {[70, 85].map((w, i) => (
              <Skeleton key={i} className="h-9 rounded-lg" style={{ width: `${w}%` }} />
            ))}
          </div>
        </aside>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          {/* Search bar */}
          <Skeleton className="mb-5 h-11 w-full rounded-xl" />

          {/* Product grid */}
          <div className="flex flex-wrap justify-center gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-[calc(50%-8px)] lg:w-[calc(25%-12px)]">
                <ProductCardSkeleton />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
