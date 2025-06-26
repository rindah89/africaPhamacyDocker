import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Minus, Plus } from 'lucide-react';
import { formatMoney } from '@/lib/formatMoney';
import { format } from 'date-fns';
import { useBarcodeSelection } from '@/hooks/use-barcode-selection';

export default function SelectedBatchesList() {
  const { selectedBatches, removeBatch, updateBatchQuantity, getTotalBarcodes } = useBarcodeSelection();

  if (selectedBatches.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <p>No batches selected for printing</p>
            <p className="text-sm">Select batches from the table above to get started</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Selected Batches ({selectedBatches.length})</span>
          <Badge variant="secondary">
            {getTotalBarcodes()} total barcodes
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {selectedBatches.map((batch) => (
          <div
            key={batch.id}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium truncate">{batch.product.name}</h4>
                <Badge variant="outline" className="text-xs">
                  {batch.product.productCode}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex items-center gap-4">
                  <span>Batch: {batch.batchNumber}</span>
                  <span>Price: {formatMoney(batch.product.productPrice)}</span>
                  {batch.product.supplier && (
                    <span>Supplier: {batch.product.supplier.name}</span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  {batch.deliveryDate && (
                    <span>Delivery: {format(new Date(batch.deliveryDate), 'MMM dd, yyyy')}</span>
                  )}
                  {batch.expiryDate && (
                    <span>Expiry: {format(new Date(batch.expiryDate), 'MMM dd, yyyy')}</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateBatchQuantity(batch.id, batch.quantity - 1)}
                  disabled={batch.quantity <= 1}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Input
                  type="number"
                  value={batch.quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    updateBatchQuantity(batch.id, value);
                  }}
                  className="w-16 h-8 text-center"
                  min="1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateBatchQuantity(batch.id, batch.quantity + 1)}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeBatch(batch.id)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
} 