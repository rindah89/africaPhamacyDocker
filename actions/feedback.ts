"use server";

import { BrandProps, FeedbackProps } from "@/types/types";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
export async function createFeedback(data: FeedbackProps) {
  try {
    const newFeedback = await prisma.feedback.create({
      data,
    });
    // console.log(newFeedback);
    revalidatePath("/dashboard/feedbacks");
    return newFeedback;
  } catch (error) {
    console.log(error);
    return null;
  }
}
export async function getAllBrands() {
  try {
    const feedbacks = await prisma.feedback.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return feedbacks;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function createBulkFeedbacks(feedbacks: FeedbackProps[]) {
  try {
    for (const feedback of feedbacks) {
      await createFeedback(feedback);
    }
  } catch (error) {
    console.log(error);
  }
}
export async function getFeedbackById(id: string) {
  try {
    const feedback = await prisma.feedback.findUnique({
      where: {
        id,
      },
    });
    return feedback;
  } catch (error) {
    console.log(error);
  }
}
export async function updateFeedbackById(id: string, data: FeedbackProps) {
  try {
    const updatedFeedback = await prisma.feedback.update({
      where: {
        id,
      },
      data,
    });
    revalidatePath("/dashboard/feedbacks");
    return updatedFeedback;
  } catch (error) {
    console.log(error);
  }
}

export async function deleteFeedback(id: string) {
  try {
    const deletedFeedback = await prisma.feedback.delete({
      where: {
        id,
      },
    });

    return {
      ok: true,
      data: deletedFeedback,
    };
  } catch (error) {
    console.log(error);
  }
}
