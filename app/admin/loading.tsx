import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardLoading() {
  return (
    <div className="p-4 sm:p-8 md:p-10 space-y-10 pb-20">
      {/* Header */}
      <header className="space-y-4">
        <Skeleton className="h-12 w-80" />
        <Skeleton className="h-4 w-64" />
      </header>

      {/* KPI Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-neutral-900 border border-neutral-800 p-6 space-y-4">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-2 w-20" />
          </div>
        ))}
      </section>

      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2 bg-neutral-900 border border-neutral-800 p-6 h-[400px] flex flex-col">
          <Skeleton className="h-4 w-48 mb-6" />
          <Skeleton className="flex-1 w-full" />
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-6 h-[400px] flex flex-col justify-center space-y-6">
          <Skeleton className="h-4 w-32 mb-4" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-8" />
              </div>
              <Skeleton className="h-1.5 w-full" />
            </div>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="bg-neutral-900 border border-neutral-800 p-6">
        <Skeleton className="h-4 w-40 mb-8" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex flex-col sm:flex-row justify-between p-4 bg-black border border-neutral-800 gap-4">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-3 w-32" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
