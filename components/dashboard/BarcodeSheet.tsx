import React from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import Barcode from 'react-barcode';
import { format } from 'date-fns';
import { formatMoney } from '@/lib/formatMoney';

interface BarcodeItemProps {
  productName: string;
  price: number;
  batchNumber: string;
  expiryDate: Date;
}

const BarcodeItem = ({ productName, price, batchNumber, expiryDate }: BarcodeItemProps) => (
  <div className="w-[120px] p-1 text-center text-[8px] border border-dashed border-gray-200 m-0.5">
    <div className="mb-0.5 font-semibold truncate">{productName}</div>
    <Barcode 
      value={batchNumber}
      width={0.8}
      height={20}
      fontSize={6}
      margin={1}
      displayValue={true}
      textMargin={1}
    />
    <div className="mt-0.5">
      <div>{formatMoney(price)}</div>
      <div>Exp: {format(expiryDate, 'MM/dd/yyyy')}</div>
    </div>
  </div>
);

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
        <div className="grid grid-cols-6 gap-0 justify-items-center p-2">
          {barcodeItems.map((batch) => (
            <BarcodeItem
              key={batch.uniqueKey}
              productName={batch.product.name}
              price={batch.product.productPrice}
              batchNumber={batch.batchNumber}
              expiryDate={new Date(batch.expiryDate)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BarcodeSheet; 