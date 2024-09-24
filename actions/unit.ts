"use server";

import { BrandProps, UnitProps } from "@/types/types";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
export async function createUnit(data: UnitProps) {
  const title = data.title;
  const abbreviation = data.abbreviation;
  try {
    const existingUnitByTitle = await prisma.unit.findFirst({
      where: {
        title,
      },
    });
    const existingUnitByAbb = await prisma.unit.findFirst({
      where: {
        abbreviation,
      },
    });
    if (existingUnitByAbb || existingUnitByTitle) {
      return existingUnitByAbb;
    }
    const newUnit = await prisma.unit.create({
      data,
    });
    revalidatePath("/dashboard/inventory/units");
    return newUnit;
  } catch (error) {
    console.log(error);
    return null;
  }
}
export async function getAllUnits() {
  try {
    const units = await prisma.unit.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return units;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function createBulkUnits(units: UnitProps[]) {
  try {
    for (const unit of units) {
      await createUnit(unit);
    }
  } catch (error) {
    console.log(error);
  }
}
export async function getUnitById(id: string) {
  try {
    const unit = await prisma.unit.findUnique({
      where: {
        id,
      },
    });
    return unit;
  } catch (error) {
    console.log(error);
  }
}
export async function updateUnitById(id: string, data: UnitProps) {
  try {
    const updatedUnit = await prisma.unit.update({
      where: {
        id,
      },
      data,
    });
    revalidatePath("/dashboard/inventory/units");
    return updatedUnit;
  } catch (error) {
    console.log(error);
  }
}

export async function deleteUnit(id: string) {
  try {
    const deletedUnit = await prisma.unit.delete({
      where: {
        id,
      },
    });

    return {
      ok: true,
      data: deletedUnit,
    };
  } catch (error) {
    console.log(error);
  }
}
