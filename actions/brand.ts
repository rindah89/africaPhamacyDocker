"use server";

import { BrandProps } from "@/types/types";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
export async function createBrand(data: BrandProps) {
  const slug = data.slug;
  try {
    const existingBrand = await prisma.brand.findUnique({
      where: {
        slug,
      },
    });
    if (existingBrand) {
      return existingBrand;
    }
    const newBrand = await prisma.brand.create({
      data,
    });
    revalidatePath("/dashboard/inventory/brands");
    return newBrand;
  } catch (error) {
    console.log(error);
    return null;
  }
}
export async function getAllBrands() {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return brands;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function createBulkBrands(brands: BrandProps[]) {
  try {
    for (const brand of brands) {
      await createBrand(brand);
    }
  } catch (error) {
    console.log(error);
  }
}
export async function getBrandById(id: string) {
  try {
    const brand = await prisma.brand.findUnique({
      where: {
        id,
      },
    });
    return brand;
  } catch (error) {
    console.log(error);
  }
}
export async function updateBrandById(id: string, data: BrandProps) {
  try {
    const updatedBrand = await prisma.brand.update({
      where: {
        id,
      },
      data,
    });
    revalidatePath("/dashboard/inventory/brands");
    return updatedBrand;
  } catch (error) {
    console.log(error);
  }
}

export async function deleteBrand(id: string) {
  try {
    const deletedBrand = await prisma.brand.delete({
      where: {
        id,
      },
    });

    return {
      ok: true,
      data: deletedBrand,
    };
  } catch (error) {
    console.log(error);
  }
}
