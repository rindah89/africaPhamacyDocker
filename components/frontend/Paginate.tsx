"use client";

import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useSearchParams } from "next/navigation";

export default function Paginate({ totalPages }: { totalPages: number }) {
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") || "asc";
  const min = searchParams.get("min") || "0";
  const max = searchParams.get("max") || "";
  const type = searchParams.get("type") || "main";
  const currentPage = +(searchParams.get("page") || 1);

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={`?${
              currentPage === 1
                ? new URLSearchParams({ page: "1", type, sort, min, max })
                : new URLSearchParams({
                    page: (currentPage - 1).toString(),
                    type,
                    sort,
                    min,
                    max,
                  })
            }`}
          />
        </PaginationItem>
        {totalPages <= 3 ? (
          Array.from({ length: totalPages }, (_, index) => (
            <PaginationItem key={index}>
              <PaginationLink
                isActive={index + 1 === currentPage}
                href={`?${new URLSearchParams({
                  page: (index + 1).toString(),
                  type,
                  sort,
                  min,
                  max,
                })}`}
              >
                {index + 1}
              </PaginationLink>
            </PaginationItem>
          ))
        ) : (
          <>
            {Array.from({ length: 3 }, (_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  href={`?${new URLSearchParams({
                    page: (index + 1).toString(),
                    type,
                    sort,
                    min,
                    max,
                  })}`}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          </>
        )}
        <PaginationItem>
          <PaginationNext
            href={`?${
              currentPage == totalPages
                ? new URLSearchParams({
                    page: totalPages.toString(),
                    type,
                    sort,
                    min,
                    max,
                  })
                : new URLSearchParams({
                    page: (currentPage + 1).toString(),
                    type,
                    sort,
                    min,
                    max,
                  })
            }`}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
