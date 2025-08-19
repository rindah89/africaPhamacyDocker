"use client";
import React from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import Barcode from 'react-barcode';
import { format } from 'date-fns';
import { formatMoney } from '@/lib/formatMoney';
import { Trash2, Printer, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import '@/styles/print-barcodes.css';

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
      className="p-1 text-center flex flex-col justify-between relative barcode-item"
      style={{
        width: '52.5mm',
        height: '21.1mm',
        border: '0.5px dotted #999',
        position: 'relative',
        pageBreakInside: 'avoid'
      }}
    >
      {/* Corner cutting guides */}
      <div className="corner-guide top-left" />
      <div className="corner-guide top-right" />
      <div className="corner-guide bottom-left" />
      <div className="corner-guide bottom-right" />
      
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
  const promiseResolveRef = React.useRef<(() => void) | null>(null);

  // Calculate total number of barcodes before using in hook
  const totalBarcodes = selectedBatches.reduce((total, batch) => total + batch.quantity, 0);

  // Watch for printing state changes
  React.useEffect(() => {
    if (isPrinting && promiseResolveRef.current) {
      // Give React time to update the DOM
      setTimeout(() => {
        promiseResolveRef.current?.();
        promiseResolveRef.current = null;
      }, 100);
    }
  }, [isPrinting]);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'Batch-Barcodes',
    onBeforePrint: () => {
      return new Promise((resolve) => {
        promiseResolveRef.current = resolve;
        setIsPrinting(true);
      });
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
      promiseResolveRef.current = null;
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
      
      // Import html2pdf
      const html2pdf = (await import('html2pdf.js')).default;
      
      const element = componentRef.current as HTMLElement;
      
      // Configure html2pdf options
      const opt = {
        margin: 10,
        filename: 'Batch-Barcodes.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          backgroundColor: '#ffffff',
          useCORS: true,
          allowTaint: true,
          width: element.scrollWidth,
          height: element.scrollHeight,
          scrollX: 0,
          scrollY: 0
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait' 
        },
        pagebreak: { 
          mode: ['avoid-all', 'css', 'legacy'],
          before: '.page-break-before',
          after: '.page-break-after',
          avoid: '.barcode-item'
        }
      };
      
      // Generate and save PDF
      await html2pdf().set(opt).from(element).save();
      
      console.timeEnd('[BarcodeSheet] PDF generation');
      toast.success(`PDF downloaded for ${totalBarcodes} barcodes`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[BarcodeSheet] PDF generation failed', error);
      toast.error('Failed to generate PDF');
    }
  };


  // Generate array of barcodes based on quantity
  const barcodeItems = selectedBatches.flatMap(batch => 
    Array(batch.quantity).fill(null).map((_, index) => ({
      ...batch,
      uniqueKey: `${batch.id}-${index}`
    }))
  );

  // Create pages of barcodes - 14 rows x 4 columns per page
  const ROWS_PER_PAGE = 14;
  const COLS_PER_PAGE = 4;
  const ITEMS_PER_PAGE = ROWS_PER_PAGE * COLS_PER_PAGE;
  
  const pages = [];
  for (let pageStart = 0; pageStart < barcodeItems.length; pageStart += ITEMS_PER_PAGE) {
    const pageItems = barcodeItems.slice(pageStart, pageStart + ITEMS_PER_PAGE);
    const pageRows = [];
    
    for (let i = 0; i < pageItems.length; i += COLS_PER_PAGE) {
      const row = pageItems.slice(i, i + COLS_PER_PAGE);
      // Pad each row to exactly 4 columns
      while (row.length < COLS_PER_PAGE) {
        row.push(null);
      }
      pageRows.push(row);
    }
    
    // Pad with empty rows if needed to maintain 14 rows per page
    while (pageRows.length < ROWS_PER_PAGE) {
      pageRows.push(Array(COLS_PER_PAGE).fill(null));
    }
    
    pages.push(pageRows);
  }
  
  // If no items, create one empty page
  if (pages.length === 0) {
    pages.push(Array(ROWS_PER_PAGE).fill(null).map(() => Array(COLS_PER_PAGE).fill(null)));
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

      <div className="print-wrapper">
        <div 
          ref={componentRef} 
          className="bg-white print-content" 
          style={{ 
            width: '210mm', 
            minHeight: '297mm', 
            padding: '0', 
            margin: '0', 
            overflow: 'visible'
          }}
        >
          {pages.map((pageRows, pageIndex) => (
            <div key={pageIndex} className={pageIndex > 0 ? 'page-break-after' : ''}>
              <div className="flex flex-col" style={{ gap: '2mm', width: '100%', minHeight: pageIndex === pages.length - 1 ? 'auto' : '297mm' }}>
                {pageRows.map((row, rowIndex) => (
                  <div key={`${pageIndex}-${rowIndex}`} className="barcode-row">
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
                        <div key={`empty-${pageIndex}-${rowIndex}-${colIndex}`} className="barcode-placeholder" />
                      )
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BarcodeSheet; 