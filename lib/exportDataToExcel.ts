// Dynamic import for XLSX to reduce bundle size
const loadXLSX = () => import("xlsx");

export default async function exportDataToExcel(data: any[], filename: string) {
  try {
    // Dynamically load XLSX only when needed
    const XLSX = await loadXLSX();
    
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Convert the array of objects to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Write the workbook to a file
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  } catch (error) {
    console.error('Error exporting data to Excel:', error);
    throw error;
  }
}
