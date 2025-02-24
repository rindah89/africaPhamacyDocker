export interface Product {
  id: string;
  name: string;
  slug: string;
  productCode: string;
  stockQty: number;
  productCost: number;
  productPrice: number;
  supplierPrice: number;
  alertQty: number;
  productTax: number;
  taxMethod: string;
  status: boolean;
  imageUrl: string | null;
  description: string | null;
  categoryId: string;
  supplierId: string;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface Category {
  id: string;
  slug: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  title: string;
  description: string | null;
  imageUrl: string | null;
  mainCategoryId: string;
  mainCategory: {
    id: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date | null;
    title: string;
  };
}

export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface Shift {
  id: string;
  name: string;
  startTime: Date;
  endTime: Date | null;
  status: boolean;
  createdAt: Date;
  updatedAt: Date | null;
} 