import React from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import Barcode from 'react-barcode';
import { format } from 'date-fns';
import { formatMoney } from '@/lib/formatMoney';

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
    return `K${supplierInitial}-${format(date, 'MM/dd/yyyy')}`;
  };

  return (
    <div className="w-[110px] p-1 text-center text-[8px] border border-dashed border-gray-200 m-0.5">
      <div className="mb-0.5 font-semibold truncate">{productName}</div>
      <div className="mb-0.5 truncate">{supplierName || ''}</div>
      <div className="flex items-center justify-between">
        <div className="w-[75%]">
          <Barcode 
            value={productCode}
            width={0.5}
            height={10}
            fontSize={6}
            margin={0}
            displayValue={false}
            textMargin={1}
          />
        </div>
        <div className="w-[25%] text-right pr-1">{formatMoney(price)}</div>
      </div>
      <div className="mt-0.5">{formatDeliveryDate(deliveryDate, supplierName)}</div>
    </div>
  );
};

interface BarcodeSheetProps {
  selectedBatches: any[];
}

const BarcodeSheet = ({ selectedBatches }: BarcodeSheetProps) => {
  const componentRef = React.useRef(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    pageStyle: `
      @page {
        size: A4;
        margin: 5mm;
      }
      @media print {
        body {
          margin: 0;
          padding: 0;
        }
      }
    `,
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

  // Create a grid of 27 rows x 7 columns
  const rows = [];
  for (let i = 0; i < Math.min(barcodeItems.length, 27 * 7); i += 7) {
    rows.push(barcodeItems.slice(i, i + 7));
  }

  // Pad with empty cells if needed to maintain grid structure
  while (rows.length < 27) {
    rows.push(Array(7).fill(null));
  }

  return (
    <div>
      <Button 
        onClick={handlePrint}
        disabled={selectedBatches.length === 0}
        className="mb-4"
      >
        Print {totalBarcodes} Barcodes
      </Button>

      <div ref={componentRef}>
        <div className="flex flex-col gap-0">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex flex-row gap-0 justify-center">
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
                  <div key={`empty-${rowIndex}-${colIndex}`} className="w-[110px] p-1 m-0.5" />
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