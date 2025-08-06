import React from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import Barcode from 'react-barcode';
import { format } from 'date-fns';
import { formatMoney } from '@/lib/formatMoney';
import { Trash2, Printer } from 'lucide-react';
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
      <div className="flex-shrink-0">
        <div className="text-[7px] font-semibold truncate leading-tight mb-0.5">{productName}</div>
        <div className="text-[6px] truncate leading-tight">{supplierName || ''}</div>
      </div>
      
      {/* Barcode section - middle section with more space */}
      <div className="flex-grow flex items-center justify-center">
        <div className="w-full flex justify-center">
          <Barcode
            value={productCode}
            width={1.2}
            height={25}
            fontSize={8}
            margin={2}
            displayValue={true}
            textMargin={2}
            font="monospace"
            textAlign="center"
            background="#ffffff"
            lineColor="#000000"
          />
        </div>
      </div>
      
      {/* Price and delivery date - bottom section */}
      <div className="flex-shrink-0 flex justify-between items-end">
        <div className="text-[7px] font-bold">{formatMoney(price)}</div>
        <div className="text-[6px] leading-tight">{formatDeliveryDate(deliveryDate, supplierName)}</div>
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

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'Batch-Barcodes',
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
    onAfterPrint: () => {
      toast.success(`Successfully printed ${totalBarcodes} barcodes!`);
      // Optionally clear all batches after successful printing
      if (clearAllBatches) {
        clearAllBatches();
      }
    },
  });

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
      <div className="flex items-center gap-2 mb-4">
        <Button 
          onClick={handlePrint}
          disabled={selectedBatches.length === 0}
          className="flex items-center gap-2"
        >
          <Printer className="h-4 w-4" />
          Print {totalBarcodes} Barcodes
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

      <div ref={componentRef} className="bg-white print:bg-white">
        <div className="flex flex-col" style={{ gap: '2mm' }}>
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex flex-row justify-between" style={{ height: '21.1mm' }}>
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