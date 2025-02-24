import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
      </div>
      
      <div className="flex flex-col gap-4">
        <div className="border rounded-lg p-4">
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    </div>
  );
} 