import { getAllProducts } from "@/actions/products";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

// Define interface matching your Prisma Product model
interface CreateProductInput {
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
  productImages: string[];
  status: boolean;
  productThumbnail: string;
  productDetails: string;
  content?: string;
  batchNumber: string;
  expiryDate: Date;
  isFeatured: boolean;
  subCategoryId: string;
  brandId: string;
  unitId: string;
  supplierId: string;
}

export async function GET() {
  try {
    const products = await getAllProducts();
    return NextResponse.json(
      {
        data: products,
        success: true,
        error: null,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        data: null,
        success: false,
        error,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const productData: CreateProductInput = await request.json();

    // Validate required fields
    const requiredFields = [
      'name',
      'slug',
      'productCode',
      'stockQty',
      'productCost',
      'productPrice',
      'alertQty',
      'productTax',
      'taxMethod',
      'productThumbnail',
      'productDetails',
      'batchNumber',
      'expiryDate',
      'subCategoryId',
      'brandId',
      'unitId',
      'supplierId'
    ];

    const missingFields = requiredFields.filter(field => !productData[field as keyof CreateProductInput]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          data: null,
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`,
        },
        { status: 400 }
      );
    }

    if (typeof window !== 'undefined' && 'electron' in window) {
      // We're in Electron, use IPC to communicate with main process
      return new Promise((resolve, reject) => {
        window.electron.ipcRenderer.send('create-product', productData);
        
        window.electron.ipcRenderer.once('create-product-response', (event, response) => {
          if (response.error) {
            reject(response.error);
          } else {
            resolve(NextResponse.json({
              data: response,
              success: true,
              error: null
            }));
          }
        });
      });
    } else {
      // We're in a regular Next.js environment, use Prisma directly
      const product = await prisma.product.create({
        data: {
          ...productData,
          productImages: productData.productImages || [],
          status: productData.status ?? true,
          isFeatured: productData.isFeatured ?? false,
          supplierPrice: productData.supplierPrice ?? 100,
          expiryDate: new Date(productData.expiryDate)
        },
      });

      return NextResponse.json({
        data: product,
        success: true,
        error: null
      });
    }
  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json(
      {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}