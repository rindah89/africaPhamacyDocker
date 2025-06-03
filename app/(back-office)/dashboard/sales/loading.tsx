import React from 'react';

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Summary Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="border rounded-lg p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3 mt-2"></div>
        </div>
        <div className="border rounded-lg p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3 mt-2"></div>
        </div>
      </div>

      {/* Table Header Skeleton */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
        <div className="flex space-x-2">
          <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="border rounded-lg">
        <div className="border-b p-4">
          <div className="flex space-x-4">
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>
        </div>
        {/* Table rows skeleton */}
        {[...Array(10)].map((_, i) => (
          <div key={i} className="border-b p-4">
            <div className="flex space-x-4">
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Loading text */}
      <div className="flex items-center justify-center py-8">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-gray-600">Loading sales data...</p>
        </div>
      </div>
    </div>
  );
} 