"use server";

import { SubCategoryProps } from "@/types/types";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
export async function createSubCategory(data: SubCategoryProps) {
  const slug = data.slug;
  try {
    const existingCategory = await prisma.subCategory.findUnique({
      where: {
        slug,
      },
    });
    if (existingCategory) {
      return existingCategory;
    }
    const newCategory = await prisma.subCategory.create({
      data,
    });
    revalidatePath("/dashboard/inventory/sub-categories");
    return newCategory;
  } catch (error) {
    console.log(error);
    return null;
  }
}
export async function getAllSubCategories() {
  try {
    const categories = await prisma.subCategory.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        category: true,
      },
    });

    return categories;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function createBulkSubCategories(categories: SubCategoryProps[]) {
  try {
    for (const category of categories) {
      await createSubCategory(category);
    }
  } catch (error) {
    console.log(error);
  }
}
export async function getSubCategoryById(id: string) {
  try {
    const category = await prisma.subCategory.findUnique({
      where: {
        id,
      },
    });
    return category;
  } catch (error) {
    console.log(error);
  }
}
export async function updateSubCategoryById(
  id: string,
  data: SubCategoryProps
) {
  try {
    const updatedCategory = await prisma.subCategory.update({
      where: {
        id,
      },
      data,
    });
    revalidatePath("/dashboard/inventory/sub-categories");
    return updatedCategory;
  } catch (error) {
    console.log(error);
  }
}

export async function deleteSubCategory(id: string) {
  try {
    const deletedCategory = await prisma.subCategory.delete({
      where: {
        id,
      },
    });
    return {
      ok: true,
      data: deletedCategory,
    };
  } catch (error) {
    console.log(error);
  }
}
