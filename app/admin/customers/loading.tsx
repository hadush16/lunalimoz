import { Skeleton } from "@/components/ui/skeleton";

export default function AdminCustomersLoading() {
  return (
    <div className="p-4 sm:p-8 md:p-12 space-y-12 pb-24">
      {/* Header */}
      <header className="space-y-4">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-4 w-56" />
      </header>

      {/* Aggregate Stats */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-neutral-900 border border-neutral-800 p-6 space-y-4">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-3 w-40" />
          </div>
        ))}
      </section>

      {/* Customer List */}
      <section className="bg-neutral-900 border border-neutral-800">
        <div className="p-4 sm:p-6 border-b border-neutral-800 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-10 w-full sm:w-64" />
        </div>

        <div className="divide-y divide-neutral-800">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-6 flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1 space-y-3">
                <Skeleton className="h-7 w-48" />
                <div className="flex flex-wrap gap-4">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
              <div className="flex items-center gap-6 bg-black p-4 border border-neutral-800">
                <div className="text-center pr-6 border-r border-neutral-800 space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-7 w-12" />
                </div>
                <div className="text-center space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-7 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
