"use server";

import {
  CategoryProps,
  ExcelCategoryProps,
  WarehouseProps,
} from "@/types/types";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
export async function createWarehouse(data: WarehouseProps) {
  const slug = data.slug;
  try {
    const existingWarehouse = await prisma.warehouse.findUnique({
      where: {
        slug,
      },
    });
    if (existingWarehouse) {
      return existingWarehouse;
    }
    const newWarehouse = await prisma.warehouse.create({
      data,
    });
    console.log(newWarehouse);
    revalidatePath("/dashboard/inventory/warehouse");
    return newWarehouse;
  } catch (error) {
    console.log(error);
    return null;
  }
}
export async function getAllWarehouses() {
  try {
    const warehouses = await prisma.warehouse.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return warehouses;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function createBulkWarehouses(warehouses: WarehouseProps[]) {
  try {
    for (const warehouse of warehouses) {
      await createWarehouse(warehouse);
    }
  } catch (error) {
    console.log(error);
  }
}
export async function getWarehouseById(id: string) {
  try {
    const warehouse = await prisma.warehouse.findUnique({
      where: {
        id,
      },
    });
    return warehouse;
  } catch (error) {
    console.log(error);
  }
}
export async function updateWarehouseById(id: string, data: WarehouseProps) {
  try {
    const updatedWarehouse = await prisma.warehouse.update({
      where: {
        id,
      },
      data,
    });
    revalidatePath("/dashboard/inventory/warehouse");
    return updatedWarehouse;
  } catch (error) {
    console.log(error);
  }
}

export async function deleteWarehouse(id: string) {
  try {
    const deletedWarehouse = await prisma.warehouse.delete({
      where: {
        id,
      },
    });

    return {
      ok: true,
      data: deletedWarehouse,
    };
  } catch (error) {
    console.log(error);
  }
}
