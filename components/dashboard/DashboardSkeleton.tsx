import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      {/* Analytics Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <Skeleton className="h-8 w-[200px] mb-4" />
            <Skeleton className="h-6 w-[100px]" />
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg border bg-card p-6">
          <Skeleton className="h-[300px]" />
        </div>
        <div className="rounded-lg border bg-card p-6">
          <Skeleton className="h-[300px]" />
        </div>
      </div>

      {/* Summary Skeleton */}
      <div className="rounded-lg border bg-card p-6">
        <Skeleton className="h-[200px]" />
      </div>
    </main>
  );
} 