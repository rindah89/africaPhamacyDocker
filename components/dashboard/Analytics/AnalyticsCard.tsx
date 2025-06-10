import { DollarSign } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsProps } from "@/hooks/use-dashboard-data";
import Link from "next/link";
import FormattedAmount from "@/components/frontend/FormattedAmount";

export default function AnalyticsCard({ item }: { item: AnalyticsProps }) {
  const Icon = item.icon;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold flex items-center">
          {item.countUnit && item.countUnit}
          <FormattedAmount showSymbol={false} amount={item?.count ?? 0} />
          {/* {item.count.toString().padStart(3, "0")} */}
          {/* {item.count.toString().padStart(3, "0")} */}
        </div>
        <Link href={item.detailLink} className="text-xs text-muted-foreground">
          View Details
        </Link>
      </CardContent>
    </Card>
  );
}
