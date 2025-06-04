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
    return `K${supplierInitial}-${format(date, 'MM/dd')}`;
  };

  return (
    <div className="w-[94px] p-0.5 text-center text-[6px] border border-dashed border-gray-200 flex flex-col justify-between h-[37px]">
      <div className="mb-px font-semibold truncate leading-tight">{productName}</div>
      <div className="mb-px truncate leading-tight">{supplierName || ''}</div>
      <div className="flex items-center justify-between">
        <div className="w-[65%]">
          <Barcode
            value={productCode}
            width={0.4}
            height={8}
            fontSize={5}
            margin={0}
            displayValue={false}
            textMargin={0}
          />
        </div>
        <div className="w-[35%] text-right pr-0.5 text-[7px] leading-tight">{formatMoney(price)}</div>
      </div>
      <div className="mt-px leading-tight">{formatDeliveryDate(deliveryDate, supplierName)}</div>
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
        margin: 13mm 18mm 15mm 16mm;
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
    const row = barcodeItems.slice(i, i + 7);
    // Pad each row to exactly 7 columns
    while (row.length < 7) {
      row.push(null);
    }
    rows.push(row);
  }

  // Pad with empty rows if needed to maintain 27 rows total
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
        <div className="flex flex-col">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex flex-row justify-between h-[38px]">
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
                  <div key={`empty-${rowIndex}-${colIndex}`} className="w-[94px] h-[37px]" />
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