import { DollarSign, RefreshCw, BarChartHorizontal, Combine, LayoutGrid } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnalyticsProps } from "@/hooks/use-dashboard-data";
import Link from "next/link";
import FormattedAmount from "@/components/frontend/FormattedAmount";
import { cn } from "@/lib/utils";

interface AnalyticsCardProps {
  item: AnalyticsProps;
  compact?: boolean;
  isRefreshing?: boolean;
}

// Icon mapping on the client side
const iconMap = {
  BarChartHorizontal,
  DollarSign,
  Combine,
  LayoutGrid,
};

export default function AnalyticsCard({ 
  item, 
  compact = false, 
  isRefreshing = false 
}: AnalyticsCardProps) {
  console.log('🔍 AnalyticsCard - Rendering with item:', {
    title: item.title,
    count: item.count,
    countUnit: item.countUnit,
    iconName: item.iconName,
    compact,
    isRefreshing
  });

  // Get the icon component from the mapping
  const Icon = iconMap[item.iconName as keyof typeof iconMap];
  
  if (!Icon) {
    console.error('🔍 AnalyticsCard - No icon found for:', item.iconName);
    console.error('🔍 AnalyticsCard - Available icons:', Object.keys(iconMap));
    return null;
  }
  
  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      isRefreshing && "opacity-75 animate-pulse",
      compact && "p-3"
    )}>
      <CardHeader className={cn(
        "flex flex-row items-center justify-between space-y-0 pb-2",
        compact && "pb-1"
      )}>
        <CardTitle className={cn(
          "font-medium",
          compact ? "text-xs" : "text-sm"
        )}>
          {item.title}
        </CardTitle>
        <div className="flex items-center gap-1">
          {isRefreshing && (
            <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />
          )}
          <Icon className={cn(
            "text-muted-foreground",
            compact ? "h-3 w-3" : "h-4 w-4"
          )} />
        </div>
      </CardHeader>
      <CardContent className={cn(compact && "pt-0")}>
        <div className={cn(
          "font-bold flex items-center",
          compact ? "text-lg" : "text-2xl"
        )}>
          {item.countUnit && item.countUnit}
          <FormattedAmount showSymbol={false} amount={item?.count ?? 0} />
        </div>
        <Link 
          href={item.detailLink} 
          className={cn(
            "text-muted-foreground hover:text-primary transition-colors",
            compact ? "text-xs" : "text-xs"
          )}
        >
          View Details
        </Link>
        {isRefreshing && (
          <Badge variant="secondary" className="mt-1 text-xs">
            Updating...
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
