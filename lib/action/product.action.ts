"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";

import prisma from "@/db/prisma";
import {
	ADMIN_PRODUCTS_PAGE_SIZE,
	LATEST_PRODUCTS_LIMIT,
} from "@/lib/constant";
import { insertProductSchema, updateProductSchema } from "@/lib/validators";
import { decimalToNumber, formatError, normalizePagination } from "@/lib/utils";
import type { Product } from "@/types";
import { requireAdmin } from "./helpers";

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
		price: decimalToNumber(product.price),
		rating: decimalToNumber(product.rating),
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
		price: decimalToNumber(product.price),
		rating: decimalToNumber(product.rating),
	};
}

export async function getProductById(id: string): Promise<Product | null> {
	await requireAdmin();

	const product = await prisma.product.findUnique({
		where: { id },
		select: productSelect,
	});

	if (!product) {
		return null;
	}

	return {
		...product,
		price: decimalToNumber(product.price),
		rating: decimalToNumber(product.rating),
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
	await requireAdmin();

	const { pageSize, skip } = normalizePagination({ limit, page });
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
			skip,
		}),
		prisma.product.count({ where }),
	]);

	return {
		data: products.map((product) => ({
			...product,
			price: decimalToNumber(product.price),
		})),
		totalPages: Math.ceil(productCount / pageSize),
		totalProducts: productCount,
	};
}

export async function createProduct(data: z.infer<typeof insertProductSchema>) {
	try {
		await requireAdmin();

		const product = insertProductSchema.parse(data);

		await prisma.product.create({
			data: {
				...product,
				banner: product.banner || null,
			},
		});

		revalidatePath("/");
		revalidatePath("/admin/products");

		return {
			success: true,
			message: "Product created",
		};
	} catch (error) {
		return {
			success: false,
			message: formatError(error),
		};
	}
}

export async function updateProduct(data: z.infer<typeof updateProductSchema>) {
	try {
		await requireAdmin();

		const product = updateProductSchema.parse(data);
		const existingProduct = await prisma.product.findUnique({
			where: { id: product.id },
			select: { slug: true },
		});

		if (!existingProduct) {
			return {
				success: false,
				message: "Product not found",
			};
		}

		await prisma.product.update({
			where: { id: product.id },
			data: {
				name: product.name,
				slug: product.slug,
				category: product.category,
				description: product.description,
				images: product.images,
				price: product.price,
				brand: product.brand,
				rating: product.rating,
				numReviews: product.numReviews,
				stock: product.stock,
				isFeatured: product.isFeatured,
				banner: product.banner || null,
			},
		});

		revalidatePath("/");
		revalidatePath("/admin/products");
		revalidatePath(`/product/${existingProduct.slug}`);
		revalidatePath(`/product/${product.slug}`);

		return {
			success: true,
			message: "Product updated",
		};
	} catch (error) {
		return {
			success: false,
			message: formatError(error),
		};
	}
}

export async function deleteProduct(id: string) {
	try {
		await requireAdmin();

		const product = await prisma.product.findUnique({
			where: { id },
			select: {
				slug: true,
				_count: {
					select: {
						orderItems: true,
					},
				},
			},
		});

		if (!product) {
			return {
				success: false,
				message: "Product not found",
			};
		}

		if (product._count.orderItems > 0) {
			return {
				success: false,
				message: "Products with existing orders cannot be deleted",
			};
		}

		await prisma.product.delete({
			where: { id },
		});

		revalidatePath("/");
		revalidatePath("/admin/products");
		revalidatePath(`/product/${product.slug}`);

		return {
			success: true,
			message: "Product deleted",
		};
	} catch (error) {
		return {
			success: false,
			message: formatError(error),
		};
	}
}
