import React from "react";

export default function ProductSkeleton() {
  return (
    <>
      <div className="bg-gray-200 h-14 animate-pulse rounded-md my-4"></div>
      <div className="grid grid-cols-12 gap-6 w-full">
        <div className="col-span-full md:col-span-4 h-64 w-full bg-gray-200 animate-pulse rounded-md"></div>
        <div className="col-span-full md:col-span-4 h-64 w-full bg-gray-200 animate-pulse rounded-md"></div>
        <div className="col-span-full md:col-span-4 h-64 w-full bg-gray-200 animate-pulse rounded-md"></div>
      </div>
      <div className="bg-gray-200 h-24 animate-pulse rounded-md my-4"></div>
      <div className="py-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {[...Array(5)].map((_, index) => {
          return (
            <div
              key={index}
              className="bg-gray-200 h-48 animate-pulse rounded-md"
            ></div>
          );
        })}
      </div>
    </>
  );
}
