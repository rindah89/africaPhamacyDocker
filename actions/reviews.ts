"use server";

import { BrandProps, FeedbackProps } from "@/types/types";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ReviewFormProps } from "@/components/frontend/ProductReviewForm";
export async function createReview(data: ReviewFormProps) {
  try {
    const newReview = await prisma.review.create({
      data,
    });
    // console.log(newFeedback);
    revalidatePath("/dashboard/inventory/products");
    return newReview;
  } catch (error) {
    console.log(error);
    return null;
  }
}
export async function getApprovedProductReviews(productId: string) {
  if (productId) {
    try {
      const reviews = await prisma.review.findMany({
        orderBy: {
          createdAt: "desc",
        },
        where: {
          productId,
          status: true,
        },
      });

      return reviews;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
export async function getProductReviews(productId: string) {
  if (productId) {
    try {
      const reviews = await prisma.review.findMany({
        orderBy: {
          createdAt: "desc",
        },
        where: {
          productId,
        },
      });
      return reviews;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}

export async function deleteReview(id: string) {
  try {
    const deletedReview = await prisma.review.delete({
      where: {
        id,
      },
    });

    return {
      ok: true,
      data: deletedReview,
    };
  } catch (error) {
    console.log(error);
  }
}

export async function updateReviewById(id: string, status: boolean) {
  try {
    const updatedReview = await prisma.review.update({
      where: {
        id,
      },
      data: {
        status: status,
      },
    });
    console.log(updatedReview);
    revalidatePath("/dashboard/inventory/products");
    return updatedReview;
  } catch (error) {
    console.log(error);
  }
}
