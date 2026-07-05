import { z } from "zod";

import { currencySchema } from "./shared";

export const cartItemSchema = z.object({
	productId: z.uuid("Product id must be a valid UUID"),
	name: z.string().trim().min(1, "Name is required"),
	slug: z.string().trim().min(1, "Slug is required"),
	qty: z.coerce
		.number()
		.int("Quantity must be a whole number")
		.positive("Quantity must be at least 1"),
	image: z.string().trim().min(1, "Image is required"),
	price: currencySchema,
});

export const insertCartSchema = z.object({
	items: z.array(cartItemSchema).default([]),
	itemsPrice: currencySchema,
	shippingPrice: currencySchema,
	taxPrice: currencySchema,
	totalPrice: currencySchema,
	sessionCartId: z.string().trim().min(1, "Session cart id is required"),
	userId: z.uuid("User id must be a valid UUID").optional().nullable(),
});
