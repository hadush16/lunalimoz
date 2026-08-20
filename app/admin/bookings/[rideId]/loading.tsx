import { Skeleton } from "@/components/ui/skeleton";

export default function RideDetailLoading() {
  return (
    <div className="p-4 sm:p-8 md:p-12 space-y-8 pb-24">
      {/* Back Button */}
      <Skeleton className="h-4 w-40" />

      {/* Header */}
      <header className="space-y-4">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-4 w-56" />
      </header>

      {/* Status Badge */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-8 w-32" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Map */}
          <div className="h-[400px] border border-neutral-800 bg-neutral-900">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="flex justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em]">
                  Calculating route...
                </p>
              </div>
            </div>
          </div>

          {/* Route Summary */}
          <section className="bg-neutral-900 border border-neutral-800 p-6 space-y-4">
            <Skeleton className="h-4 w-32" />
            <div className="space-y-4">
              <div className="bg-black p-4 border border-neutral-800 space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-full" />
              </div>
              <div className="bg-black p-4 border border-neutral-800 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </section>

          {/* Ride Information */}
          <section className="bg-neutral-900 border border-neutral-800 p-6">
            <Skeleton className="h-4 w-40 mb-6" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-black p-4 border border-neutral-800 space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </section>

          {/* Notes */}
          <section className="bg-neutral-900 border border-neutral-800 p-6 space-y-4">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-12 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-12 flex-1" />
              <Skeleton className="h-12 w-20" />
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Customer Info */}
          <section className="bg-neutral-900 border border-neutral-800 p-6 space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </section>

          {/* Actions */}
          <section className="bg-neutral-900 border border-neutral-800 p-6 space-y-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </section>
        </div>
      </div>
    </div>
  );
}
