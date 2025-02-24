import { formatMoney } from "@/lib/formatMoney";

interface InventoryStatsProps {
  totalItems: number;
  totalCost: number;
  totalSelling: number;
  totalProfit: number;
}

export default function InventoryStats({
  totalItems,
  totalCost,
  totalSelling,
  totalProfit,
}: InventoryStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Items in Stock</h3>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalItems.toLocaleString()}</p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Stock Value (Cost)</h3>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatMoney(totalCost)}</p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Stock Value (Selling)</h3>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatMoney(totalSelling)}</p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Potential Profit</h3>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatMoney(totalProfit)}</p>
      </div>
    </div>
  );
} 