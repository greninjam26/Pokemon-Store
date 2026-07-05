"use server";

import prisma from "@/db/prisma";
import { LATEST_PRODUCTS_LIMIT } from "@/lib/constant";
import type { Product } from "@/types";

const productSelect = {
	id: true,
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
} as const;

export async function getLatestProducts(): Promise<Product[]> {
	const products = await prisma.product.findMany({
		select: productSelect,
		orderBy: { createdAt: "desc" },
		take: LATEST_PRODUCTS_LIMIT,
	});

	return products.map((product) => ({
		...product,
		price: Number(product.price),
		rating: Number(product.rating),
	}));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
	const product = await prisma.product.findUnique({
		where: { slug },
		select: productSelect,
	});

	if (!product) {
		return null;
	}

	return {
		...product,
		price: Number(product.price),
		rating: Number(product.rating),
	};
}
