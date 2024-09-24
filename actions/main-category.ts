"use server";

import {
  CategoryProps,
  ExcelCategoryProps,
  MainCategoryProps,
} from "@/types/types";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createMainCategory(data: MainCategoryProps) {
  const slug = data.slug;
  try {
    const existingCategory = await prisma.mainCategory.findUnique({
      where: {
        slug,
      },
    });
    if (existingCategory) {
      return existingCategory;
    }
    const newCategory = await prisma.mainCategory.create({
      data,
    });
    revalidatePath("/dashboard/inventory/main-categories");
    return newCategory;
  } catch (error) {
    console.log(error);
    return null;
  }
}
export async function getAllMainCategories() {
  try {
    const categories = await prisma.mainCategory.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return categories;
  } catch (error) {
    console.log(error);
    return null;
  }
}
export async function getPopulatedMainCategories() {
  type SubCategoryProps = {
    title: string;
    slug: string;
  };

  type CategoryProps = {
    title: string;
    slug: string;
    subCategories: SubCategoryProps[];
  };

  type MainCategoryProps = {
    title: string;
    slug: string;
    categories: CategoryProps[];
  };
  try {
    const categories = await prisma.mainCategory.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        categories: {
          include: {
            subCategories: true,
          },
        },
      },
    });
    const mainCategories: MainCategoryProps[] = categories.map((category) => ({
      title: category.title,
      slug: category.slug,
      categories: category.categories.map((subCategory) => ({
        title: subCategory.title,
        slug: subCategory.slug,
        subCategories: subCategory.subCategories.map((subSubCategory) => ({
          title: subSubCategory.title,
          slug: subSubCategory.slug,
        })),
      })),
    }));

    return mainCategories;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function createBulkMainCategories(
  categories: MainCategoryProps[]
) {
  try {
    for (const category of categories) {
      await createMainCategory(category);
    }
  } catch (error) {
    console.log(error);
  }
}
export async function getMainCategoryById(id: string) {
  try {
    const category = await prisma.mainCategory.findUnique({
      where: {
        id,
      },
    });
    return category;
  } catch (error) {
    console.log(error);
  }
}
export async function updateMainCategoryById(
  id: string,
  data: MainCategoryProps
) {
  try {
    const updatedCategory = await prisma.mainCategory.update({
      where: {
        id,
      },
      data,
    });
    revalidatePath("/dashboard/inventory/main-categories");
    return updatedCategory;
  } catch (error) {
    console.log(error);
  }
}

export async function deleteMainCategory(id: string) {
  try {
    const deletedCategory = await prisma.mainCategory.delete({
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
