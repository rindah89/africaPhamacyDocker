"use server";

import { AdvertProps } from "@/types/types";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
export async function createAdvert(data: AdvertProps) {
  try {
    const newAdvert = await prisma.advert.create({
      data,
    });
    // console.log(newAdvert);
    revalidatePath("/dashboard/inventory/adverts");
    return newAdvert;
  } catch (error) {
    console.log(error);
    return null;
  }
}
export async function getAllAdverts() {
  try {
    const adverts = await prisma.advert.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return adverts;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function createBulkAdverts(adverts: AdvertProps[]) {
  try {
    for (const advert of adverts) {
      await createAdvert(advert);
    }
  } catch (error) {
    console.log(error);
  }
}
export async function getAdvertById(id: string) {
  try {
    const advert = await prisma.advert.findUnique({
      where: {
        id,
      },
    });
    return advert;
  } catch (error) {
    console.log(error);
  }
}
export async function updateAdvertById(id: string, data: AdvertProps) {
  try {
    const updatedAdvert = await prisma.advert.update({
      where: {
        id,
      },
      data,
    });
    revalidatePath("/dashboard/inventory/adverts");
    return updatedAdvert;
  } catch (error) {
    console.log(error);
  }
}

export async function deleteAdvert(id: string) {
  try {
    const deletedAdvert = await prisma.advert.delete({
      where: {
        id,
      },
    });

    return {
      ok: true,
      data: deletedAdvert,
    };
  } catch (error) {
    console.log(error);
  }
}
