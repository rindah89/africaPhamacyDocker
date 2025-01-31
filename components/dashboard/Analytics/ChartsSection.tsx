import { getRevenueByMainCategoryPastSixMonths, getSalesCountForPastSevenDays } from "@/actions/analytics";
import { SalesChart } from "./SalesChart";
import { RevenueByCategory } from "./RevenueByCategory";
import { Skeleton } from "@/components/ui/skeleton";

export async function ChartsSection() {
  try {
    const [sales, categoryRevenue] = await Promise.all([
      getSalesCountForPastSevenDays(),
      getRevenueByMainCategoryPastSixMonths()
    ]);

    if (!sales || !categoryRevenue) {
      throw new Error("Failed to load charts data");
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SalesChart sales={sales} />
        <RevenueByCategory categoryRevenueData={categoryRevenue} />
      </div>
    );
  } catch (error) {
    throw new Error("Failed to load charts section");
  }
}

export function ChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="rounded-lg border bg-card p-6">
        <Skeleton className="h-[300px]" />
      </div>
      <div className="rounded-lg border bg-card p-6">
        <Skeleton className="h-[300px]" />
      </div>
    </div>
  );
} 