"use server";

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { LATEST_PRODUCTS_LIMIT } from "@/lib/constant";
import type { Product } from "@/lib/validator";

const globalForPrisma = globalThis as unknown as {
	prisma?: PrismaClient;
};

function createPrismaClient() {
	const connectionString = process.env.DATABASE_URL;

	if (!connectionString) {
		throw new Error("DATABASE_URL is not defined");
	}

	const adapter = new PrismaPg({ connectionString });

	return new PrismaClient({ adapter });
}

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
	globalForPrisma.prisma = prisma;
}

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
