import { Button } from "@/components/ui/button";
import AnalyticsCard from "./Analytics/AnalyticsCard";
import TransactionsList from "./TransactionsList";
import {
  AnalyticsProps,
  getRevenueByMainCategory,
  getRevenueByMainCategoryPastSixMonths,
  getSalesCountByMainCategory,
  getSalesCountForPastSevenDays,
} from "@/actions/analytics";
import DashboardSummary from "./Analytics/DashboardSummary";
import { SalesChart } from "./Analytics/SalesChart";
import { RevenueByCategory } from "./Analytics/RevenueByCategory";
export async function Dashboard({
  analytics,
}: {
  analytics: AnalyticsProps[];
}) {
  const sales = await getSalesCountForPastSevenDays();
  const categoryRevenue = await getRevenueByMainCategoryPastSixMonths();
  // console.log(sales);
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        {analytics.map((item, i) => {
          return <AnalyticsCard key={i} item={item} />;
        })}
      </div>
      <div className="">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
          <SalesChart sales={sales} />
          <RevenueByCategory categoryRevenueData={categoryRevenue} />
        </div>
      </div>
      <DashboardSummary />
      {/* <div className="grid gap-4 md:gap-8 grid-cols-1 ">
        <TransactionsList />
      </div> */}
    </main>
  );
}
