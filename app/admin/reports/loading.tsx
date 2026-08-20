import { Skeleton } from "@/components/ui/skeleton";

export default function AdminReportsLoading() {
  return (
    <div className="p-4 sm:p-8 md:p-12 space-y-8 pb-24">
      {/* Header */}
      <header className="space-y-4">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-4 w-56" />
      </header>

      {/* Date Range Picker */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-20" />
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-8 w-36" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-neutral-900 border border-neutral-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-neutral-900 border border-neutral-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-4 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-7 w-20" />
          </div>
        </div>
        <Skeleton className="h-[350px] w-full" />
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 p-6 space-y-6">
          <Skeleton className="h-4 w-48" />
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-6 space-y-6">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-[250px] w-full" />
        </div>
      </div>

      {/* Monthly Comparison */}
      <div className="bg-neutral-900 border border-neutral-800 p-6 space-y-6">
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-[300px] w-full" />
      </div>

      {/* Top Customers */}
      <div className="bg-neutral-900 border border-neutral-800">
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-8 w-28" />
        </div>
        <div className="divide-y divide-neutral-800">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-8" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <div className="text-right space-y-2">
                <Skeleton className="h-6 w-20 ml-auto" />
                <Skeleton className="h-3 w-16 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
