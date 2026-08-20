import { Skeleton } from "@/components/ui/skeleton";

export default function AdminUsersLoading() {
  return (
    <div className="p-4 sm:p-8 md:p-12 space-y-8 pb-24">
      {/* Header */}
      <header className="space-y-4">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-4 w-80" />
      </header>

      {/* Search Bar */}
      <div className="bg-neutral-900 border border-neutral-800 p-4">
        <Skeleton className="h-12 w-full max-w-md" />
      </div>

      {/* Users List */}
      <div className="bg-neutral-900 border border-neutral-800">
        <div className="p-6 border-b border-neutral-800 flex items-center gap-2">
          <Skeleton className="h-4 w-48" />
        </div>

        <div className="divide-y divide-neutral-800">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-4 md:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="flex flex-wrap gap-4">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-28" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
