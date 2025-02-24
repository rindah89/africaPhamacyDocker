import React from "react";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { Button } from "../ui/button";
import Link from "next/link";

export default function CategoryHeaderMobile() {
  const mainCategories = [
    { id: "1", title: "Category 1", slug: "category-1" },
    { id: "2", title: "Category 2", slug: "category-2" },
    { id: "3", title: "Category 3", slug: "category-3" },
  ];

  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-md px-4">
      {mainCategories && mainCategories.length > 0 ? (
        <div className="flex gap-6 items-center py-3 border-b">
          {mainCategories.map((item) => {
            return (
              <Button key={item.id} variant="outline" asChild>
                <Link href={`/pos?cat=all`} className="">
                  <h2 className="text-sm">{item.title}</h2>
                </Link>
              </Button>
            );
          })}
        </div>
      ) : (
        <div className="">
          <h2>No Categories Found</h2>
        </div>
      )}
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
