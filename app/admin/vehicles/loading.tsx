import { Skeleton } from "@/components/ui/skeleton";

export default function AdminVehiclesLoading() {
  return (
    <div className="p-4 sm:p-8 md:p-12 space-y-8 sm:space-y-12 pb-24">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-14 w-full md:w-56" />
      </header>

      {/* Vehicle Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-neutral-900/50 border border-neutral-800 p-6 flex flex-col h-full space-y-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-6 w-6" />
            </div>

            <div className="space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-3">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="bg-black/40 border border-neutral-800 p-3 space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>

            <div className="pt-6 border-t border-neutral-800 flex flex-wrap gap-4 justify-between items-center">
              <Skeleton className="h-5 w-16" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
