"use client";

import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

type SubCategoryProps = {
  title: string;
  slug: string;
};
type CategoryProps = {
  title: string;
  slug: string;
  subCategories: SubCategoryProps[];
};
export function CategoryHeader({
  mainCategories,
}: {
  mainCategories: {
    title: string;
    slug: string;
    categories: CategoryProps[];
  }[];
}) {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {mainCategories.map((mainCat, i) => {
          return (
            <NavigationMenuItem key={i}>
              <NavigationMenuTrigger>
                <Link href={`/categories/${mainCat.slug}?type=main`}>
                  {mainCat.title}
                </Link>
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-3 lg:w-[600px] ">
                  {mainCat.categories.map((category, i) => (
                    <div className="" key={i}>
                      <Link
                        className="font-bold hover:text-pink-600"
                        href={`/categories/${category.slug}?type=cat`}
                      >
                        {category.title}
                      </Link>
                      <div className="py-3">
                        {category.subCategories.map((item, i) => {
                          return (
                            <Link
                              key={i}
                              href={`/categories/${item.slug}?type=sub`}
                              className="block text-xs hover:text-blue-600"
                            >
                              {item.title}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

