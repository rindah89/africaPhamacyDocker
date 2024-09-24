"use server";

import { CategoryProps, ExcelCategoryProps } from "@/types/types";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
export async function createCategory(data: CategoryProps) {
  const slug = data.slug;
  try {
    const existingCategory = await prisma.category.findUnique({
      where: {
        slug,
      },
    });
    if (existingCategory) {
      return existingCategory;
    }
    const newCategory = await prisma.category.create({
      data,
    });
    // console.log(newCategory);
    revalidatePath("/dashboard/inventory/categories");
    return newCategory;
  } catch (error) {
    console.log(error);
    return null;
  }
}
export async function getAllCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        mainCategory: true,
      },
    });

    return categories;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function createBulkCategories(categories: CategoryProps[]) {
  try {
    for (const category of categories) {
      await createCategory(category);
    }
  } catch (error) {
    console.log(error);
  }
}
export async function getCategoryById(id: string) {
  try {
    const category = await prisma.category.findUnique({
      where: {
        id,
      },
    });
    return category;
  } catch (error) {
    console.log(error);
  }
}
export async function updateCategoryById(id: string, data: CategoryProps) {
  try {
    const updatedCategory = await prisma.category.update({
      where: {
        id,
      },
      data,
    });
    revalidatePath("/dashboard/inventory/categories");
    return updatedCategory;
  } catch (error) {
    console.log(error);
  }
}

export async function deleteCategory(id: string) {
  try {
    const deletedCategory = await prisma.category.delete({
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
export async function deleteManyCategories() {
  try {
    await prisma.category.deleteMany();

    return {
      ok: true,
    };
  } catch (error) {
    console.log(error);
  }
}
