import { Skeleton } from "@/components/ui/skeleton";

export function SummarySkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <Skeleton className="h-[200px]" />
    </div>
  );
} 