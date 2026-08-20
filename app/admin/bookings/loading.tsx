import { Skeleton } from "@/components/ui/skeleton";

export default function AdminBookingsLoading() {
  return (
    <div className="p-4 sm:p-8 md:p-12 space-y-8 pb-24">
      {/* Header */}
      <header className="space-y-4">
        <Skeleton className="h-12 w-80" />
        <Skeleton className="h-4 w-64" />
      </header>

      {/* Filters Bar */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 flex flex-col xl:flex-row gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <Skeleton className="h-12 w-full max-w-md flex-1" />
          <Skeleton className="h-12 w-40" />
        </div>
        <div className="flex gap-4 items-center">
          <Skeleton className="h-12 w-36" />
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-12 w-36" />
        </div>
      </div>

      {/* Booking List */}
      <section className="bg-neutral-900 border border-neutral-800">
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-8 w-28" />
        </div>

        <div className="divide-y divide-neutral-800">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-4 md:p-6 flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-5 w-24 ml-auto" />
                </div>
                <div className="flex flex-wrap gap-4">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2 bg-black p-3 border border-neutral-800">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  <div className="bg-black p-3 border border-neutral-800 space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                    <Skeleton className="h-3 w-28 ml-auto" />
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap lg:flex-col gap-2 lg:w-32">
                <Skeleton className="h-10 w-full lg:w-32" />
                <Skeleton className="h-10 w-full lg:w-32" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
