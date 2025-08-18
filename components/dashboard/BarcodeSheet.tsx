"use client";
import React from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import Barcode from 'react-barcode';
import { format } from 'date-fns';
import { formatMoney } from '@/lib/formatMoney';
import { Trash2, Printer, Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface BarcodeItemProps {
  productName: string;
  price: number;
  productCode: string;
  deliveryDate?: Date | null;
  supplierName?: string;
}

const BarcodeItem = ({ productName, price, productCode, deliveryDate, supplierName }: BarcodeItemProps) => {
  const formatDeliveryDate = (date: Date | null | undefined, supplierName?: string) => {
    if (!date) return 'N/A';
    const supplierInitial = supplierName ? supplierName.charAt(0).toUpperCase() : '';
    return `K${supplierInitial}-${format(date, 'MM/dd')}`;
  };

  return (
    <div 
      className="p-1 text-center flex flex-col justify-between relative"
      style={{
        width: '52.5mm',
        height: '21.1mm',
        border: '0.5px dotted #999',
        position: 'relative'
      }}
    >
      {/* Corner cutting guides */}
      <div 
        className="absolute"
        style={{
          top: '-2px',
          left: '-2px',
          width: '4px',
          height: '4px',
          borderTop: '1px solid #666',
          borderLeft: '1px solid #666'
        }}
      />
      <div 
        className="absolute"
        style={{
          top: '-2px',
          right: '-2px',
          width: '4px',
          height: '4px',
          borderTop: '1px solid #666',
          borderRight: '1px solid #666'
        }}
      />
      <div 
        className="absolute"
        style={{
          bottom: '-2px',
          left: '-2px',
          width: '4px',
          height: '4px',
          borderBottom: '1px solid #666',
          borderLeft: '1px solid #666'
        }}
      />
      <div 
        className="absolute"
        style={{
          bottom: '-2px',
          right: '-2px',
          width: '4px',
          height: '4px',
          borderBottom: '1px solid #666',
          borderRight: '1px solid #666'
        }}
      />
      
      {/* Product name and supplier - top section */}
      <div className="flex-shrink-0" style={{ minHeight: '16px', paddingTop: '1px' }}>
        <div
          className="text-[7px] font-semibold leading-tight mb-0.5"
          style={{
            height: '10px',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            wordBreak: 'break-word'
          }}
        >
          {productName}
        </div>
        <div
          className="text-[6px] leading-tight"
          style={{
            height: '8px',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            wordBreak: 'break-word'
          }}
        >
          {supplierName || ''}
        </div>
      </div>
      
      {/* Barcode section - middle section with more space */}
      <div className="flex-grow flex items-center justify-center" style={{ minHeight: '30px', padding: '2px 0' }}>
        <div className="w-full flex justify-center">
          <Barcode
            value={productCode}
            width={1.0}
            height={22}
            fontSize={7}
            margin={1}
            displayValue={true}
            textMargin={1}
            font="monospace"
            textAlign="center"
            background="#ffffff"
            lineColor="#000000"
          />
        </div>
      </div>
      
      {/* Price and delivery date - bottom section */}
      <div className="flex-shrink-0 flex justify-between items-end" style={{ minHeight: '12px', paddingBottom: '1px' }}>
        <div className="text-[7px] font-bold" style={{ lineHeight: '1' }}>{formatMoney(price)}</div>
        <div
          className="text-[6px] leading-tight"
          style={{
            maxWidth: '20mm',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            lineHeight: '1'
          }}
        >
          {formatDeliveryDate(deliveryDate, supplierName)}
        </div>
      </div>
    </div>
  );
};

interface BarcodeSheetProps {
  selectedBatches: any[];
  clearAllBatches?: () => void;
}

const BarcodeSheet = ({ selectedBatches, clearAllBatches }: BarcodeSheetProps) => {
  const componentRef = React.useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = React.useState(false);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'Batch-Barcodes',
    removeAfterPrint: false,
    pageStyle: `
      @page {
        size: A4;
        margin: 13mm 13mm 15mm 11mm;
      }
      @media print {
        body {
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact;
        }
        * {
          color: black !important;
        }
      }
    `,
    onBeforeGetContent: () => {
      setIsPrinting(true);
      return Promise.resolve();
    },
    onAfterPrint: () => {
      setIsPrinting(false);
      toast.success(`Successfully printed ${totalBarcodes} barcodes!`);
      if (clearAllBatches) {
        clearAllBatches();
      }
    },
    onPrintError: (errorLocation, error) => {
      setIsPrinting(false);
      console.error('[BarcodeSheet] Print error:', errorLocation, error);
      toast.error('Print failed');
    }
  });

  const handlePrintClick = () => {
    // Validate before attempting to print
    if (!componentRef.current) {
      toast.error('Nothing to print');
      return;
    }
    
    if (!selectedBatches || selectedBatches.length === 0) {
      toast.error('No batches selected');
      return;
    }

    if (isPrinting) {
      return; // Prevent multiple print attempts
    }

    console.log('[BarcodeSheet] Print button clicked', {
      selectedCount: selectedBatches.length,
      totalBarcodes,
      ids: selectedBatches.map(b => b.id),
      hasRef: !!componentRef.current,
    });
    
    handlePrint();
  };

  // Fallback print method using window.open
  const handleFallbackPrint = () => {
    if (!componentRef.current) {
      toast.error('Nothing to print');
      return;
    }
    
    if (!selectedBatches || selectedBatches.length === 0) {
      toast.error('No batches selected');
      return;
    }

    try {
      const printWindow = window.open('', 'PRINT', 'height=800,width=600');
      if (printWindow && componentRef.current) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Batch Barcodes</title>
              <style>
                @page {
                  size: A4;
                  margin: 13mm 13mm 15mm 11mm;
                }
                body { 
                  margin: 0; 
                  padding: 0;
                  font-family: Arial, sans-serif;
                  -webkit-print-color-adjust: exact;
                }
                * {
                  color: black !important;
                }
                .print:bg-white { background: white !important; }
              </style>
            </head>
            <body>
              ${componentRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
          toast.success(`Successfully printed ${totalBarcodes} barcodes!`);
          if (clearAllBatches) {
            clearAllBatches();
          }
        }, 500);
      }
    } catch (error) {
      console.error('[BarcodeSheet] Fallback print error:', error);
      toast.error('Print failed');
    }
  };

  const handleDownloadPdf = async () => {
    try {
      // eslint-disable-next-line no-console
      console.log('[BarcodeSheet] Download button clicked', {
        selectedCount: selectedBatches.length,
        totalBarcodes,
        ids: selectedBatches.map(b => b.id),
      });
      console.time('[BarcodeSheet] PDF generation');
      if (!componentRef.current) return;
      const [{ jsPDF }, html2canvas] = await Promise.all([
        import('jspdf'),
        import('html2canvas') as unknown as Promise<any>,
      ]);

      const element = componentRef.current as HTMLElement;
      const canvas = await html2canvas.default(element, { 
        scale: 2, 
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        width: element.scrollWidth,
        height: element.scrollHeight,
        scrollX: 0,
        scrollY: 0
      });
      // eslint-disable-next-line no-console
      console.log('[BarcodeSheet] Canvas generated', { width: canvas.width, height: canvas.height });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = { top: 10, right: 10, bottom: 10, left: 10 };
      const usableWidth = pageWidth - margin.left - margin.right;
      const usableHeight = pageHeight - margin.top - margin.bottom;

      // Better DPI calculation based on actual canvas dimensions
      const canvasAspectRatio = canvas.width / canvas.height;
      const pageAspectRatio = usableWidth / usableHeight;
      
      let imgWidthMm, imgHeightMm;
      
      if (canvasAspectRatio > pageAspectRatio) {
        // Canvas is wider relative to page, fit to width
        imgWidthMm = usableWidth;
        imgHeightMm = usableWidth / canvasAspectRatio;
      } else {
        // Canvas is taller relative to page, fit to height
        imgHeightMm = usableHeight;
        imgWidthMm = usableHeight * canvasAspectRatio;
      }
      // eslint-disable-next-line no-console
      console.log('[BarcodeSheet] PDF dimensions', { 
        pageWidth, 
        pageHeight, 
        imgWidthMm, 
        imgHeightMm, 
        margin,
        canvasSize: { width: canvas.width, height: canvas.height }
      });

      // Center the image on the page
      const xOffset = margin.left + (usableWidth - imgWidthMm) / 2;
      const yOffset = margin.top;

      // Check if content fits on one page
      if (imgHeightMm <= usableHeight) {
        // Single page - simple approach
        pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidthMm, imgHeightMm, undefined, 'FAST');
      } else {
        // Multi-page - split the canvas into chunks
        const pageHeightPx = Math.round((usableHeight / imgHeightMm) * canvas.height);
        let currentOffsetPx = 0;
        let pageNum = 0;

        while (currentOffsetPx < canvas.height) {
          if (pageNum > 0) {
            pdf.addPage();
          }

          const remainingHeightPx = canvas.height - currentOffsetPx;
          const currentPageHeightPx = Math.min(pageHeightPx, remainingHeightPx);
          const currentPageHeightMm = (currentPageHeightPx / canvas.height) * imgHeightMm;

          // Create a slice of the canvas for this page
          const sliceCanvas = document.createElement('canvas');
          const sliceContext = sliceCanvas.getContext('2d');
          if (!sliceContext) break;

          sliceCanvas.width = canvas.width;
          sliceCanvas.height = currentPageHeightPx;
          
          sliceContext.drawImage(
            canvas,
            0, currentOffsetPx, canvas.width, currentPageHeightPx,
            0, 0, canvas.width, currentPageHeightPx
          );

          const sliceImgData = sliceCanvas.toDataURL('image/png');
          pdf.addImage(sliceImgData, 'PNG', xOffset, yOffset, imgWidthMm, currentPageHeightMm, undefined, 'FAST');

          currentOffsetPx += currentPageHeightPx;
          pageNum++;
        }
      }

      pdf.save('Batch-Barcodes.pdf');
      console.timeEnd('[BarcodeSheet] PDF generation');
      toast.success(`PDF downloaded for ${totalBarcodes} barcodes`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[BarcodeSheet] PDF generation failed', error);
      toast.error('Failed to generate PDF');
    }
  };

  // Calculate total number of barcodes
  const totalBarcodes = selectedBatches.reduce((total, batch) => total + batch.quantity, 0);

  // Generate array of barcodes based on quantity
  const barcodeItems = selectedBatches.flatMap(batch => 
    Array(batch.quantity).fill(null).map((_, index) => ({
      ...batch,
      uniqueKey: `${batch.id}-${index}`
    }))
  );

  // Create a grid of 14 rows x 4 columns (new dimensions)
  const rows = [];
  for (let i = 0; i < Math.min(barcodeItems.length, 14 * 4); i += 4) {
    const row = barcodeItems.slice(i, i + 4);
    // Pad each row to exactly 4 columns
    while (row.length < 4) {
      row.push(null);
    }
    rows.push(row);
  }

  // Pad with empty rows if needed to maintain 14 rows total
  while (rows.length < 14) {
    rows.push(Array(4).fill(null));
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 sticky top-0 bg-background z-10 py-2">
        <Button 
          onClick={handlePrintClick}
          disabled={selectedBatches.length === 0 || isPrinting}
          className="flex items-center gap-2 w-full lg:w-auto"
          variant={selectedBatches.length === 0 ? "outline" : "default"}
          size="lg"
        >
          <Printer className="h-4 w-4" />
          {isPrinting ? "Preparing to print..." : selectedBatches.length === 0 ? "Select batches to print" : `Print ${totalBarcodes} Barcodes`}
        </Button>
        <Button
          onClick={handleDownloadPdf}
          disabled={selectedBatches.length === 0}
          className="flex items-center gap-2 w-full lg:w-auto"
          variant={selectedBatches.length === 0 ? "outline" : "secondary"}
          size="lg"
        >
          <Download className="h-4 w-4" />
          {selectedBatches.length === 0 ? "Select batches to download" : "Download PDF"}
        </Button>
        {selectedBatches.length > 0 && clearAllBatches && (
          <Button
            variant="outline"
            onClick={clearAllBatches}
            className="flex items-center gap-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>

      <div ref={componentRef} className="bg-white print:bg-white" style={{ width: '210mm', minHeight: '297mm', padding: '0', margin: '0', overflow: 'visible' }}>
        <div className="flex flex-col" style={{ gap: '2mm', width: '100%' }}>
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex flex-row justify-start" style={{ height: '21.1mm', width: '100%', gap: '2mm' }}>
              {row.map((batch, colIndex) => (
                batch ? (
                  <BarcodeItem
                    key={batch.uniqueKey}
                    productName={batch.product.name}
                    price={batch.product.productPrice}
                    productCode={batch.product.productCode}
                    deliveryDate={batch.deliveryDate ? new Date(batch.deliveryDate) : null}
                    supplierName={batch.product.supplier?.name}
                  />
                ) : (
                  <div key={`empty-${rowIndex}-${colIndex}`} style={{ width: '52.5mm', height: '21.1mm' }} />
                )
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BarcodeSheet; 