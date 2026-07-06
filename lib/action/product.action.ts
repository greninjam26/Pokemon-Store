"use server";

import { auth } from "@/auth";
import prisma from "@/db/prisma";
import {
	ADMIN_PRODUCTS_PAGE_SIZE,
	LATEST_PRODUCTS_LIMIT,
} from "@/lib/constant";
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

export async function getAdminProducts({
	page = 1,
	query = "",
	limit = ADMIN_PRODUCTS_PAGE_SIZE,
}: {
	page?: number;
	query?: string;
	limit?: number;
} = {}) {
	const session = await auth();
	const role = (session?.user as { role?: string } | undefined)?.role;

	if (role !== "admin") {
		throw new Error("User is not authorized");
	}

	const currentPage = Math.max(1, page);
	const pageSize = Math.max(1, limit);
	const trimmedQuery = query.trim();
	const where = trimmedQuery
		? {
				OR: [
					{
						name: {
							contains: trimmedQuery,
							mode: "insensitive" as const,
						},
					},
					{
						category: {
							contains: trimmedQuery,
							mode: "insensitive" as const,
						},
					},
					{
						brand: {
							contains: trimmedQuery,
							mode: "insensitive" as const,
						},
					},
				],
			}
		: {};

	const [products, productCount] = await prisma.$transaction([
		prisma.product.findMany({
			where,
			select: {
				id: true,
				name: true,
				slug: true,
				category: true,
				images: true,
				price: true,
				stock: true,
				isFeatured: true,
				createdAt: true,
			},
			orderBy: {
				createdAt: "desc",
			},
			take: pageSize,
			skip: (currentPage - 1) * pageSize,
		}),
		prisma.product.count({ where }),
	]);

	return {
		data: products.map((product) => ({
			...product,
			price: Number(product.price),
		})),
		totalPages: Math.ceil(productCount / pageSize),
		totalProducts: productCount,
	};
}
