// Shared types for batch management and barcode printing

export interface ProductBatch {
  id: string;
  batchNumber: string;
  quantity: number;
  expiryDate: Date;
  deliveryDate?: Date | null;
  costPerUnit: number;
  notes?: string | null;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
  productId: string;
  product: {
    name: string;
    productCode: string;
    productPrice: number;
    supplier?: {
      name: string;
    } | null;
  };
}

export interface BarcodeBatch extends ProductBatch {
  // BarcodeBatch is the same as ProductBatch for now
  // This allows for future extensions specific to barcode functionality
}

export interface PrintBarcodesPageProps {
  batches: ProductBatch[];
}