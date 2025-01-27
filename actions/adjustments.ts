"use server";

import { AdjustmentDataProps } from "@/components/dashboard/Forms/AdjstmentForm";
import prisma from "@/lib/db";
import { NotificationStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { createNotification } from "./pos";

interface AdjustmentItem {
  productId: string;
  productName: string;
  currentStock: number;
  quantity: number;
  type: "Addition" | "Subtraction";
  batchId?: string;
}

interface AdjustmentDataProps {
  reason: string;
  items: AdjustmentItem[];
}

export async function createAdjustment(data: AdjustmentDataProps) {
  const { reason, items } = data;
  try {
    const adjustmentId = await prisma.$transaction(async (transaction) => {
      // Generate adjustment reference number
      const counter = await transaction.counter.upsert({
        where: { name: 'adjustmentNumber' },
        update: { value: { increment: 1 } },
        create: { name: 'adjustmentNumber', value: 1 }
      });
      
      const refNo = `ADJ${counter.value.toString().padStart(6, '0')}`;
      
      // Create the adjustment
      const adjustment = await transaction.adjustment.create({
        data: {
          reason,
          refNo,
        },
      });

      for (const item of items) {
        // Update Product stock quantity
        let query;
        if (item.type === "Addition") {
          query = {
            increment: item.quantity,
          };
        } else if (item.type === "Subtraction") {
          query = {
            decrement: item.quantity,
          };
        }

        // If it's a subtraction, we need to check and update the batch
        if (item.type === "Subtraction" && item.batchId) {
          const batch = await transaction.productBatch.findUnique({
            where: { id: item.batchId }
          });

          if (!batch) {
            throw new Error(`Batch not found for ID: ${item.batchId}`);
          }

          if (batch.quantity < item.quantity) {
            throw new Error(`Insufficient quantity in batch ${batch.batchNumber}`);
          }

          // Update batch quantity
          await transaction.productBatch.update({
            where: { id: item.batchId },
            data: {
              quantity: {
                decrement: item.quantity
              }
            }
          });
        } else if (item.type === "Addition") {
          // For additions, create a new batch if no batch is specified
          if (!item.batchId) {
            const batchCounter = await transaction.counter.upsert({
              where: { name: 'batchNumber' },
              update: { value: { increment: 1 } },
              create: { name: 'batchNumber', value: 1 }
            });

            const batchNumber = `BAT${batchCounter.value.toString().padStart(6, '0')}`;
            
            // Create new batch for addition
            const newBatch = await transaction.productBatch.create({
              data: {
                batchNumber,
                quantity: item.quantity,
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Default 1 year expiry
                costPerUnit: 0, // You might want to get this from somewhere
                status: true,
                productId: item.productId,
              }
            });
            
            item.batchId = newBatch.id;
          } else {
            // Update existing batch quantity
            await transaction.productBatch.update({
              where: { id: item.batchId },
              data: {
                quantity: {
                  increment: item.quantity
                }
              }
            });
          }
        }

        const updatedProduct = await transaction.product.update({
          where: { id: item.productId },
          data: {
            stockQty: query,
          },
        });

        if (!updatedProduct) {
          throw new Error(
            `Failed to update stock for product ID: ${item.productId}`
          );
        }

        if (updatedProduct.stockQty < updatedProduct.alertQty) {
          // Send/Create the Notification
          const message =
            updatedProduct.stockQty === 0
              ? `The stock of ${updatedProduct.name} is out. Current stock: ${updatedProduct.stockQty}.`
              : `The stock of ${updatedProduct.name} has gone below threshold. Current stock: ${updatedProduct.stockQty}.`;
          const statusText =
            updatedProduct.stockQty === 0 ? "Stock Out" : "Warning";
          const status: NotificationStatus =
            updatedProduct.stockQty === 0 ? "DANGER" : "WARNING";

          const newNotification = {
            message,
            status,
            statusText,
          };
          await createNotification(newNotification);
        }

        // Create Adjustment Item
        const adjustmentItem = await transaction.adjustmentItem.create({
          data: {
            adjustmentId: adjustment.id,
            productId: item.productId,
            productName: item.productName,
            currentStock: item.currentStock,
            quantity: item.quantity,
            type: item.type,
            batchId: item.batchId,
          },
        });

        if (!adjustmentItem) {
          throw new Error(`Failed to create adjustment`);
        }
      }

      revalidatePath("/dashboard/stock/adjustments");
      return adjustment.id;
    });

    const savedAdjustment = await prisma.adjustment.findUnique({
      where: {
        id: adjustmentId,
      },
      include: {
        items: {
          include: {
            batch: true
          }
        },
      },
    });

    return savedAdjustment;
  } catch (error) {
    console.error("Transaction error:", error);
    throw error;
  }
}

export async function getAdjustments() {
  try {
    const adjustments = await prisma.adjustment.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        items: true,
      },
    });
    return adjustments;
  } catch (error) {
    console.log(error);
  }
}

export async function updateAdjustment(id: string, data: AdjustmentDataProps) {
  const { reason, items } = data;
  try {
    // Get the original adjustment with its items to reverse the stock changes
    const originalAdjustment = await prisma.adjustment.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!originalAdjustment) {
      throw new Error("Adjustment not found");
    }

    const updatedAdjustment = await prisma.$transaction(async (transaction) => {
      // First, reverse the original adjustment's effects
      for (const originalItem of originalAdjustment.items) {
        // Reverse the stock quantity changes
        if (originalItem.type === "Addition") {
          await transaction.product.update({
            where: { id: originalItem.productId },
            data: {
              stockQty: {
                decrement: originalItem.quantity,
              },
            },
          });

          // If there was a batch, update its quantity
          if (originalItem.batchId) {
            await transaction.productBatch.update({
              where: { id: originalItem.batchId },
              data: {
                quantity: {
                  decrement: originalItem.quantity,
                },
              },
            });
          }
        } else if (originalItem.type === "Subtraction") {
          await transaction.product.update({
            where: { id: originalItem.productId },
            data: {
              stockQty: {
                increment: originalItem.quantity,
              },
            },
          });

          // If there was a batch, update its quantity
          if (originalItem.batchId) {
            await transaction.productBatch.update({
              where: { id: originalItem.batchId },
              data: {
                quantity: {
                  increment: originalItem.quantity,
                },
              },
            });
          }
        }
      }

      // Delete old adjustment items
      await transaction.adjustmentItem.deleteMany({
        where: {
          adjustmentId: id,
        },
      });

      // Update the adjustment
      const adjustment = await transaction.adjustment.update({
        where: { id },
        data: {
          reason,
        },
      });

      // Apply new adjustment items
      for (const item of items) {
        let query;
        if (item.type === "Addition") {
          query = {
            increment: item.quantity,
          };
        } else if (item.type === "Subtraction") {
          query = {
            decrement: item.quantity,
          };
        }

        // If it's a subtraction, we need to check and update the batch
        if (item.type === "Subtraction" && item.batchId) {
          const batch = await transaction.productBatch.findUnique({
            where: { id: item.batchId }
          });

          if (!batch) {
            throw new Error(`Batch not found for ID: ${item.batchId}`);
          }

          if (batch.quantity < item.quantity) {
            throw new Error(`Insufficient quantity in batch ${batch.batchNumber}`);
          }

          // Update batch quantity
          await transaction.productBatch.update({
            where: { id: item.batchId },
            data: {
              quantity: {
                decrement: item.quantity
              }
            }
          });
        } else if (item.type === "Addition") {
          // For additions, create a new batch if no batch is specified
          if (!item.batchId) {
            const batchCounter = await transaction.counter.upsert({
              where: { name: 'batchNumber' },
              update: { value: { increment: 1 } },
              create: { name: 'batchNumber', value: 1 }
            });

            const batchNumber = `BAT${batchCounter.value.toString().padStart(6, '0')}`;
            
            // Create new batch for addition
            const newBatch = await transaction.productBatch.create({
              data: {
                batchNumber,
                quantity: item.quantity,
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Default 1 year expiry
                costPerUnit: 0,
                status: true,
                productId: item.productId,
              }
            });
            
            item.batchId = newBatch.id;
          } else {
            // Update existing batch quantity
            await transaction.productBatch.update({
              where: { id: item.batchId },
              data: {
                quantity: {
                  increment: item.quantity
                }
              }
            });
          }
        }

        const updatedProduct = await transaction.product.update({
          where: { id: item.productId },
          data: {
            stockQty: query,
          },
        });

        if (!updatedProduct) {
          throw new Error(
            `Failed to update stock for product ID: ${item.productId}`
          );
        }

        if (updatedProduct.stockQty < updatedProduct.alertQty) {
          const message =
            updatedProduct.stockQty === 0
              ? `The stock of ${updatedProduct.name} is out. Current stock: ${updatedProduct.stockQty}.`
              : `The stock of ${updatedProduct.name} has gone below threshold. Current stock: ${updatedProduct.stockQty}.`;
          const statusText =
            updatedProduct.stockQty === 0 ? "Stock Out" : "Warning";
          const status: NotificationStatus =
            updatedProduct.stockQty === 0 ? "DANGER" : "WARNING";

          const newNotification = {
            message,
            status,
            statusText,
          };
          await createNotification(newNotification);
        }

        // Create new Adjustment Item
        const adjustmentItem = await transaction.adjustmentItem.create({
          data: {
            adjustmentId: adjustment.id,
            productId: item.productId,
            productName: item.productName,
            currentStock: item.currentStock,
            quantity: item.quantity,
            type: item.type,
            batchId: item.batchId,
          },
        });

        if (!adjustmentItem) {
          throw new Error(`Failed to create adjustment item`);
        }
      }

      revalidatePath("/dashboard/stock/adjustments");
      return adjustment;
    });

    return updatedAdjustment;
  } catch (error) {
    console.error("Transaction error:", error);
    throw error;
  }
}
