import { Skeleton } from "@/components/ui/skeleton";

export default function AdminReviewsLoading() {
  return (
    <div className="p-4 sm:p-8 md:p-12 space-y-12 pb-24">
      {/* Header */}
      <header className="space-y-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-4 w-72" />
      </header>

      {/* Aggregate Stats */}
      <section className="bg-neutral-900 border border-neutral-800 p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center md:items-stretch">
        <div className="flex flex-col items-center justify-center md:border-r border-neutral-800 md:pr-12 space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-16 w-32" />
          <Skeleton className="h-4 w-28" />
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-6" />
            ))}
          </div>
        </div>

        <div className="flex-1 w-full space-y-4">
          <Skeleton className="h-4 w-48 mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-3 flex-1" />
                <Skeleton className="h-4 w-8" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Feed */}
      <section className="bg-neutral-900 border border-neutral-800">
        <div className="p-6 border-b border-neutral-800">
          <Skeleton className="h-4 w-40" />
        </div>

        <div className="divide-y divide-neutral-800">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-6 flex flex-col md:flex-row gap-6">
              <div className="md:w-64 space-y-3 border-b md:border-b-0 md:border-r border-neutral-800 pb-4 md:pb-0 md:pr-6">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, j) => (
                    <Skeleton key={j} className="h-4 w-4" />
                  ))}
                </div>
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="flex-1 space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="bg-black border border-neutral-800 p-3 flex flex-wrap gap-4 items-center mt-4">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
