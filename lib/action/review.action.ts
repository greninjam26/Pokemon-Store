"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";

import prisma from "@/db/prisma";
import { formatError, getCustomerDisplayName } from "@/lib/utils";
import { reviewSchema } from "@/lib/validators";
import type { ProductReview } from "@/types";
import { getCurrentUserId } from "./helpers";

type ReviewInput = z.infer<typeof reviewSchema>;

async function getVerifiedPurchaseStatus({
	productId,
	userId,
}: {
	productId: string;
	userId: string;
}) {
	const orderItem = await prisma.orderItem.findFirst({
		where: {
			productId,
			order: {
				userId,
				isPaid: true,
			},
		},
		select: {
			productId: true,
		},
	});

	return Boolean(orderItem);
}

async function updateProductReviewSummary(productId: string) {
	const reviewSummary = await prisma.review.aggregate({
		where: {
			productId,
		},
		_count: {
			_all: true,
		},
		_avg: {
			rating: true,
		},
	});

	await prisma.product.update({
		where: {
			id: productId,
		},
		data: {
			numReviews: reviewSummary._count._all,
			rating: reviewSummary._avg.rating ?? 0,
		},
	});
}

export async function getProductReviews(
	productId: string,
): Promise<ProductReview[]> {
	const reviews = await prisma.review.findMany({
		where: {
			productId,
		},
		select: {
			id: true,
			rating: true,
			title: true,
			description: true,
			isVerifiedPurchase: true,
			createdAt: true,
			updatedAt: true,
			user: {
				select: {
					name: true,
					email: true,
				},
			},
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	return reviews.map((review) => ({
		...review,
		userName: getCustomerDisplayName(review.user, "Customer"),
	}));
}

export async function getMyProductReview(productId: string) {
	const userId = await getCurrentUserId();

	if (!userId) {
		return null;
	}

	return prisma.review.findUnique({
		where: {
			userId_productId: {
				userId,
				productId,
			},
		},
		select: {
			id: true,
			rating: true,
			title: true,
			description: true,
		},
	});
}

export async function createUpdateReview(data: ReviewInput) {
	try {
		const userId = await getCurrentUserId();

		if (!userId) {
			return {
				success: false,
				message: "Please sign in to write a review",
			};
		}

		const review = reviewSchema.parse(data);
		const product = await prisma.product.findUnique({
			where: {
				id: review.productId,
			},
			select: {
				slug: true,
			},
		});

		if (!product) {
			return {
				success: false,
				message: "Product not found",
			};
		}

		const isVerifiedPurchase = await getVerifiedPurchaseStatus({
			productId: review.productId,
			userId,
		});

		await prisma.review.upsert({
			where: {
				userId_productId: {
					userId,
					productId: review.productId,
				},
			},
			update: {
				rating: review.rating,
				title: review.title,
				description: review.description,
				isVerifiedPurchase,
			},
			create: {
				userId,
				productId: review.productId,
				rating: review.rating,
				title: review.title,
				description: review.description,
				isVerifiedPurchase,
			},
		});

		await updateProductReviewSummary(review.productId);

		revalidatePath(`/product/${product.slug}`);
		revalidatePath("/");
		revalidatePath("/search");

		return {
			success: true,
			message: "Review saved",
		};
	} catch (error) {
		return {
			success: false,
			message: formatError(error),
		};
	}
}
