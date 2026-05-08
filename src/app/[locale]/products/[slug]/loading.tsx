import { Skeleton } from '@/components/ui/skeleton';

export default function ProductLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-3" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-3" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Main grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:gap-12">

        {/* Gallery */}
        <div className="space-y-3">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-16 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          {/* Brand + SKU */}
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24" />
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-3/4" />
          </div>

          <div className="h-px bg-fur-border" />

          {/* Price */}
          <Skeleton className="h-10 w-28" />

          {/* Size */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-24 rounded-xl" />
          </div>

          {/* Add to cart */}
          <div className="flex gap-3">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <Skeleton className="h-12 flex-1 rounded-xl" />
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2 rounded-xl border border-fur-border p-3">
                <Skeleton className="h-6 w-6 rounded" />
                <Skeleton className="h-3 w-14" />
                <Skeleton className="h-3 w-10" />
              </div>
            ))}
          </div>

          <div className="h-px bg-fur-border" />

          {/* Share */}
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-9 w-9 rounded-xl" />
            ))}
          </div>
        </div>
      </div>

      {/* Frequently Bought Together */}
      <div className="mt-10 rounded-2xl border border-fur-border p-5">
        <Skeleton className="mb-4 h-5 w-56" />
        <div className="flex flex-wrap gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-fur-border p-3">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-14 w-14 rounded-lg" />
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between border-t border-fur-border pt-4">
          <div className="space-y-1">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12">
        <div className="flex gap-6 border-b border-fur-border pb-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-5 w-24" />
          ))}
        </div>
        <div className="mt-6 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
}
