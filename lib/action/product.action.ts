"use server";

import prisma from "@/db/prisma";
import { LATEST_PRODUCTS_LIMIT } from "@/lib/constant";
import type { Product } from "@/lib/validator";

export async function getLatestProducts(): Promise<Product[]> {
	const products = await prisma.product.findMany({
		select: {
			name: true,
			slug: true,
			category: true,
			description: true,
			images: true,
			price: true,
			brand: true,
			rating: true,
			numReviews: true,
			stock: true,
			isFeatured: true,
			banner: true,
		},
		orderBy: { createdAt: "desc" },
		take: LATEST_PRODUCTS_LIMIT,
	});

	return products.map((product) => ({
		...product,
		price: Number(product.price),
		rating: Number(product.rating),
	}));
}
