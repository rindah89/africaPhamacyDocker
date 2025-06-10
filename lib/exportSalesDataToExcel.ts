// Dynamic import for XLSX to reduce bundle size
const loadXLSX = () => import("xlsx");

interface SalesExportData {
  date: string;
  orderNumber: string;
  customerName: string;
  productName: string;
  category: string;
  subCategory: string;
  brand: string;
  quantity: number;
  unitPrice: number;
  revenue: number;
  cost: number;
  profit: number;
}

export default async function exportSalesDataToExcel(data: any[], filename: string) {
  try {
    // Dynamically load XLSX only when needed
    const XLSX = await loadXLSX();
    
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Transform sales data for better Excel formatting
    const formattedData: SalesExportData[] = data.map(sale => ({
      date: new Date(sale.date).toLocaleDateString(),
      orderNumber: sale.orderNumber,
      customerName: sale.customerName,
      productName: sale.productName,
      category: sale.category,
      subCategory: sale.subCategory,
      brand: sale.brand,
      quantity: sale.quantity,
      unitPrice: sale.unitPrice,
      revenue: sale.revenue,
      cost: sale.cost,
      profit: sale.profit
    }));

    // Create the main data worksheet
    const worksheet = XLSX.utils.json_to_sheet(formattedData, {
      header: [
        'date',
        'orderNumber', 
        'customerName',
        'productName',
        'category',
        'subCategory',
        'brand',
        'quantity',
        'unitPrice',
        'revenue',
        'cost',
        'profit'
      ]
    });

    // Set column headers with better names
    const headers = [
      'Date',
      'Order Number',
      'Customer',
      'Product',
      'Category', 
      'Sub Category',
      'Brand',
      'Quantity',
      'Unit Price (FCFA)',
      'Revenue (FCFA)',
      'Cost (FCFA)',
      'Profit (FCFA)'
    ];

    // Update the first row with proper headers
    headers.forEach((header, index) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index });
      if (!worksheet[cellAddress]) worksheet[cellAddress] = {};
      worksheet[cellAddress].v = header;
    });

    // Calculate summary data
    const totals = data.reduce((acc, sale) => {
      const orderIds = new Set([...acc.orderIds, sale.orderId]);
      return {
        orderIds,
        totalQuantity: acc.totalQuantity + sale.quantity,
        totalRevenue: acc.totalRevenue + sale.revenue,
        totalCost: acc.totalCost + sale.cost,
        totalProfit: acc.totalProfit + sale.profit
      };
    }, {
      orderIds: new Set(),
      totalQuantity: 0,
      totalRevenue: 0,
      totalCost: 0,
      totalProfit: 0
    });

    // Create summary data
    const summaryData = [
      ['Sales Report Summary', ''],
      ['Report Generated', new Date().toLocaleDateString()],
      ['Total Orders', totals.orderIds.size],
      ['Total Items Sold', totals.totalQuantity],
      ['Total Revenue (FCFA)', totals.totalRevenue],
      ['Total Cost (FCFA)', totals.totalCost],
      ['Total Profit (FCFA)', totals.totalProfit],
      ['', ''], // Empty row
      ['Detailed Sales Data', '']
    ];

    // Create summary worksheet
    const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryData);

    // Add worksheets to workbook
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "Summary");
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Details");

    // Auto-fit columns (approximate)
    const wscols = [
      { wch: 12 }, // Date
      { wch: 15 }, // Order Number
      { wch: 20 }, // Customer
      { wch: 30 }, // Product
      { wch: 15 }, // Category
      { wch: 18 }, // Sub Category
      { wch: 15 }, // Brand
      { wch: 10 }, // Quantity
      { wch: 15 }, // Unit Price
      { wch: 15 }, // Revenue
      { wch: 15 }, // Cost
      { wch: 15 }  // Profit
    ];
    
    worksheet['!cols'] = wscols;

    // Write the workbook to a file
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  } catch (error) {
    console.error('Error exporting sales data to Excel:', error);
    throw error;
  }
} 