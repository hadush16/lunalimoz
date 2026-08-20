import { Skeleton } from "@/components/ui/skeleton";

export default function AdminContactLoading() {
  return (
    <div className="p-4 sm:p-8 md:p-12 space-y-8 sm:space-y-12 pb-24">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-14 w-36" />
        </div>
      </header>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inquiry List */}
        <div className="lg:col-span-1 space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-4 border border-neutral-800 bg-neutral-900/50 space-y-3">
              <div className="flex justify-between items-start">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-2 w-2" />
              </div>
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-2">
          <div className="bg-neutral-900/50 border border-neutral-800 p-6 sm:p-8 space-y-6 min-h-[400px]">
            <div className="flex justify-between items-start">
              <div className="space-y-3">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
            <div className="border-t border-neutral-800 pt-6 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="border-t border-neutral-800 pt-4 flex justify-between items-center">
              <Skeleton className="h-3 w-48" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
