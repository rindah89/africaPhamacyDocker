export default function Loading() {
  return (
    <div className="w-full min-h-screen p-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-8">
        <div className="animate-pulse h-10 w-48 bg-gray-200 rounded"></div>
        <div className="animate-pulse h-10 w-32 bg-gray-200 rounded"></div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Side - Categories */}
        <div className="col-span-3">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>

        {/* Middle - Products Grid */}
        <div className="col-span-6">
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6, 9].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Cart */}
        <div className="col-span-3">
          <div className="space-y-4">
            <div className="animate-pulse h-12 bg-gray-200 rounded"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
            <div className="animate-pulse h-32 bg-gray-200 rounded mt-8"></div>
          </div>
        </div>
      </div>
    </div>
  );
} 