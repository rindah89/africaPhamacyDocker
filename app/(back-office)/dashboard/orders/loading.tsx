import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  console.log("🔄 OrdersLoading: Loading component is being rendered");
  console.log("🔄 OrdersLoading: This indicates orders data is still being fetched");
  
  const loadingStartTime = Date.now();
  
  // Log when component unmounts (when data loads)
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      console.log(`⏱️ OrdersLoading: Loading component has been visible for at least 100ms`);
    }, 100);
    
    setTimeout(() => {
      console.log(`⏱️ OrdersLoading: Loading component has been visible for at least 1000ms - potential performance issue`);
    }, 1000);
    
    setTimeout(() => {
      console.log(`⚠️ OrdersLoading: Loading component has been visible for at least 5000ms - likely an error occurred`);
    }, 5000);
  }
  
  return (
    <div className="space-y-6">
      {/* Debug info */}
      <div className="text-xs text-gray-400 p-2 bg-gray-50 rounded">
        Loading orders data... Started at {new Date().toLocaleTimeString()}
      </div>
      
      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between py-4">
        <Skeleton className="h-8 w-32" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>

      {/* Pagination info skeleton */}
      <div className="flex items-center justify-between py-4 px-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Table skeleton */}
      <div className="space-y-4">
        {/* Table header */}
        <div className="rounded-md border">
          <div className="grid grid-cols-7 gap-4 p-4 border-b">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
          
          {/* Table rows */}
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="grid grid-cols-7 gap-4 p-4 border-b last:border-b-0">
              {Array.from({ length: 7 }).map((_, j) => (
                <Skeleton key={j} className="h-4 w-full" />
              ))}
            </div>
          ))}
        </div>

        {/* Pagination skeleton */}
        <div className="flex items-center justify-between px-2 py-4">
          <Skeleton className="h-4 w-48" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </div>
    </div>
  );
} 