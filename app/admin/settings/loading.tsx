import { Skeleton } from "@/components/ui/skeleton";

export default function AdminSettingsLoading() {
  return (
    <div className="p-4 sm:p-8 md:p-12 space-y-12 pb-24 max-w-4xl">
      {/* Header */}
      <header className="space-y-4">
        <Skeleton className="h-12 w-80" />
        <Skeleton className="h-4 w-64" />
      </header>

      {/* Business Details */}
      <section className="bg-neutral-900 border border-neutral-800">
        <div className="p-6 border-b border-neutral-800 flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-12 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-36" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </section>

      {/* Pricing Rules */}
      <section className="bg-neutral-900 border border-neutral-800">
        <div className="p-6 border-b border-neutral-800 flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-36" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="bg-neutral-900 border border-neutral-800">
        <div className="p-6 border-b border-neutral-800 flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-36" />
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-11" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-64" />
            </div>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-14 w-56" />
        <Skeleton className="h-14 w-48" />
      </div>
    </div>
  );
}
