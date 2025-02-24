"use server";

import { SupplierProps } from "@/types/types";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
export async function createSupplier(data: SupplierProps) {
  const email = data.email;
  try {
    const existingSupplier = await prisma.supplier.findUnique({
      where: {
        email,
      },
    });
    if (existingSupplier) {
      return existingSupplier;
    }
    const newSupplier = await prisma.supplier.create({
      data,
    });
    // console.log(newSupplier);
    revalidatePath("/dashboard/inventory/suppliers");
    return newSupplier;
  } catch (error) {
    console.log(error);
    return null;
  }
}
export async function getAllSuppliers() {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return suppliers;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function createBulkSuppliers(suppliers: SupplierProps[]) {
  // console.log(suppliers);
  try {
    for (const supplier of suppliers) {
      await createSupplier(supplier);
    }
  } catch (error) {
    console.log(error);
  }
}
export async function getSupplierById(id: string) {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: {
        id,
      },
    });
    return supplier;
  } catch (error) {
    console.log(error);
  }
}
export async function updateSupplierById(id: string, data: SupplierProps) {
  try {
    const updatedSupplier = await prisma.supplier.update({
      where: {
        id,
      },
      data,
    });
    revalidatePath("/dashboard/inventory/suppliers");
    return updatedSupplier;
  } catch (error) {
    console.log(error);
  }
}

export async function deleteSupplier(id: string) {
  try {
    const deletedSupplier = await prisma.supplier.delete({
      where: {
        id,
      },
    });

    return {
      ok: true,
      data: deletedSupplier,
    };
  } catch (error) {
    console.log(error);
  }
}
