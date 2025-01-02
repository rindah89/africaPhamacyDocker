"use server";

import { ProductBatchProps } from "@/types/types";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createProductBatch(data: ProductBatchProps) {
  try {
    // Ensure quantity is a valid number and convert to integer
    const quantity = parseInt(String(data.quantity), 10);
    if (isNaN(quantity)) {
      throw new Error("Invalid quantity value");
    }

    const newBatch = await prisma.productBatch.create({
      data: {
        batchNumber: data.batchNumber,
        quantity: quantity,
        expiryDate: new Date(data.expiryDate),
        deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : undefined,
        costPerUnit: data.costPerUnit,
        notes: data.notes,
        status: data.status,
        productId: data.productId,
      },
    });

    // Update the total stock quantity of the product
    await prisma.product.update({
      where: { id: data.productId },
      data: {
        stockQty: {
          increment: quantity
        }
      }
    });

    revalidatePath("/dashboard/inventory/products");
    return newBatch;
  } catch (error) {
    console.error("Error creating product batch:", error);
    throw error;
  }
}

export async function getProductBatches(productId: string) {
  try {
    const batches = await prisma.productBatch.findMany({
      where: {
        productId,
        status: true
      },
      orderBy: {
        expiryDate: 'asc'
      }
    });
    return batches;
  } catch (error) {
    console.error("Error fetching product batches:", error);
    throw error;
  }
}

export async function updateProductBatch(id: string, data: Partial<ProductBatchProps>) {
  try {
    // Get the original batch to calculate stock difference
    const originalBatch = await prisma.productBatch.findUnique({
      where: { id }
    });

    if (!originalBatch) {
      throw new Error("Batch not found");
    }

    const updatedBatch = await prisma.productBatch.update({
      where: { id },
      data: {
        quantity: data.quantity,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
        deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : undefined,
        costPerUnit: data.costPerUnit,
        notes: data.notes,
        status: data.status,
      },
    });

    // Update the product's total stock if quantity changed
    if (data.quantity !== undefined && data.quantity !== originalBatch.quantity) {
      const quantityDifference = data.quantity - originalBatch.quantity;
      await prisma.product.update({
        where: { id: originalBatch.productId },
        data: {
          stockQty: {
            increment: quantityDifference
          }
        }
      });
    }

    revalidatePath("/dashboard/inventory/products");
    return updatedBatch;
  } catch (error) {
    console.error("Error updating product batch:", error);
    throw error;
  }
}

export async function deleteProductBatch(id: string) {
  try {
    const batch = await prisma.productBatch.findUnique({
      where: { id }
    });

    if (!batch) {
      throw new Error("Batch not found");
    }

    // Soft delete by setting status to false
    const deletedBatch = await prisma.productBatch.update({
      where: { id },
      data: {
        status: false
      }
    });

    // Update the product's total stock
    await prisma.product.update({
      where: { id: batch.productId },
      data: {
        stockQty: {
          decrement: batch.quantity
        }
      }
    });

    revalidatePath("/dashboard/inventory/products");
    return deletedBatch;
  } catch (error) {
    console.error("Error deleting product batch:", error);
    throw error;
  }
}

export async function fixNullBatchNumbers() {
  try {
    // Find all ProductBatch records
    const batches = await prisma.productBatch.findMany();
    
    // Update any batch with null batchNumber
    for (const batch of batches) {
      if (!batch.batchNumber) {
        await prisma.productBatch.update({
          where: { id: batch.id },
          data: {
            batchNumber: `BATCH-${batch.id}`, // Generate a default batch number using the record's ID
          },
        });
      }
    }
    
    revalidatePath("/dashboard/inventory/products");
    return { success: true, message: "Fixed null batch numbers" };
  } catch (error) {
    console.error("Error fixing batch numbers:", error);
    throw error;
  }
} 