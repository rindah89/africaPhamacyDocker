"use server";

import { BannerProps, CategoryProps, ExcelCategoryProps } from "@/types/types";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
export async function createBanner(data: BannerProps) {
  try {
    const newBanner = await prisma.banner.create({
      data,
    });
    // console.log(newBanner);
    revalidatePath("/dashboard/inventory/banners");
    return newBanner;
  } catch (error) {
    console.log(error);
    return null;
  }
}
export async function getAllBanners() {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return banners;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function createBulkBanners(banners: BannerProps[]) {
  try {
    for (const banner of banners) {
      await createBanner(banner);
    }
  } catch (error) {
    console.log(error);
  }
}
export async function getBannerById(id: string) {
  try {
    const banner = await prisma.banner.findUnique({
      where: {
        id,
      },
    });
    return banner;
  } catch (error) {
    console.log(error);
  }
}
export async function updateBannerById(id: string, data: BannerProps) {
  try {
    const updatedBanner = await prisma.banner.update({
      where: {
        id,
      },
      data,
    });
    revalidatePath("/dashboard/inventory/banners");
    return updatedBanner;
  } catch (error) {
    console.log(error);
  }
}

export async function deleteBanner(id: string) {
  try {
    const deletedBanner = await prisma.banner.delete({
      where: {
        id,
      },
    });

    return {
      ok: true,
      data: deletedBanner,
    };
  } catch (error) {
    console.log(error);
  }
}
