import { getAllCategories } from "@/actions/category";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { cn } from "@/lib/utils";

export default async function CategoryListing() {
  const categories = await getAllCategories();
  return (
    <div className="py-6 ">
      <ScrollArea className="w-full whitespace-nowrap rounded-md px-4">
        <div className="flex gap-6 space-x-4 items-center py-3">
          {categories &&
            categories.length > 0 &&
            categories.map((cat) => {
              return (
                <Link
                  key={cat.id}
                  className="flex items-center flex-col justify-center"
                  href={`/categories/${cat.slug}?type=cat`}
                >
                  <Image
                    width={200}
                    height={200}
                    className="w-16 h-16 rounded-lg object-cover"
                    src={cat.imageUrl ?? "/placeholder.svg"}
                    alt={cat.title}
                  />
                  <span
                    className={cn(
                      "text-xs truncate",
                      cat.title.length > 16 && "truncate-20"
                    )}
                  >
                    {cat.title}
                  </span>
                </Link>
              );
            })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
