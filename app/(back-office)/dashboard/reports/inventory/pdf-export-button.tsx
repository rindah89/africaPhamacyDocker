"use client";

import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { IProduct } from "@/types/types";
import jsPDF from "jspdf";
import 'jspdf-autotable';

interface PDFExportButtonProps {
  data: IProduct[];
}

function handleExportPDF(data: IProduct[]) {
  const doc = new jsPDF();
  const tableColumn = ["Product Name", "Quantity", "Expiry Date"];
  const tableRows = data.map((item) => [
    item.name,
    item.stockQty.toString(),
    item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "N/A",
  ]);

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
  });

  doc.save("inventory-report.pdf");
}

export function PDFExportButton({ data }: PDFExportButtonProps) {
  return (
    <Button
      onClick={() => handleExportPDF(data)}
      size="sm"
      variant="outline"
      className="h-8 gap-1"
    >
      <FileDown className="h-3.5 w-3.5 mr-2" />
      Export PDF
    </Button>
  );
} 