import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { BreadcrumbProps } from "@/app/(shop)/product/[slug]/page";
import React from "react";

export function CustomBreadCrumb({
  breadcrumb,
}: {
  breadcrumb: BreadcrumbProps[];
}) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumb.map((crumb, index) => {
          const isLast = index === breadcrumb.length - 1;
          return (
            <React.Fragment key={crumb.href}>
              <BreadcrumbItem>
                <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
