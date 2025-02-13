"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function startShift(name: string) {
  try {
    // Check if there's already an active shift
    const activeShift = await prisma.shift.findFirst({
      where: {
        isActive: true
      }
    });

    if (activeShift) {
      return {
        error: "There is already an active shift",
        data: null,
        success: false
      };
    }

    // Create new shift
    const shift = await prisma.shift.create({
      data: {
        name,
        startTime: new Date(),
        isActive: true
      }
    });

    revalidatePath("/pos");
    return {
      error: null,
      data: shift,
      success: true
    };
  } catch (error) {
    console.error("Error starting shift:", error);
    return {
      error: "Failed to start shift",
      data: null,
      success: false
    };
  }
}

export async function endShift(shiftId: string) {
  try {
    const shift = await prisma.shift.update({
      where: {
        id: shiftId
      },
      data: {
        endTime: new Date(),
        isActive: false
      }
    });

    revalidatePath("/pos");
    return {
      error: null,
      data: shift,
      success: true
    };
  } catch (error) {
    console.error("Error ending shift:", error);
    return {
      error: "Failed to end shift",
      data: null,
      success: false
    };
  }
}

export async function getCurrentShift() {
  try {
    const shift = await prisma.shift.findFirst({
      where: {
        isActive: true
      }
    });

    return shift;
  } catch (error) {
    console.error("Error getting current shift:", error);
    return null;
  }
}

export async function getShiftSales(shiftId: string) {
  try {
    const sales = await prisma.sale.findMany({
      where: {
        shiftId
      },
      include: {
        products: true
      }
    });

    return sales;
  } catch (error) {
    console.error("Error getting shift sales:", error);
    return null;
  }
}

export async function getAllShifts() {
  try {
    const shifts = await prisma.shift.findMany({
      orderBy: {
        startTime: 'desc'
      }
    });

    return shifts.map(shift => ({
      id: shift.id,
      userName: shift.name,
      startTime: shift.startTime.toISOString(),
      endTime: shift.endTime?.toISOString(),
      isActive: shift.isActive
    }));
  } catch (error) {
    console.error('Error fetching shifts:', error);
    return [];
  }
} 