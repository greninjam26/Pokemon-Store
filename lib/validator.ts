import { z } from "zod";

import { PAYMENT_METHODS } from "@/lib/constant";

const currencySchema = z
	.union([z.string(), z.number()])
	.transform((value) =>
		typeof value === "number" ? value.toString() : value.trim(),
	)
	.refine((value) => value.length > 0, "Amount is required")
	.refine(
		(value) => /^-?\d+(\.\d{1,2})?$/.test(value),
		"Amount must be a valid number with at most two decimal places",
	)
	.transform((value) => Number(value))
	.refine((value) => value >= 0, "Amount cannot be negative");

export const insertProductSchema = z.object({
	name: z.string().trim().min(3, "Name must be at least 3 characters"),
	slug: z
		.string()
		.trim()
		.min(3, "Slug must be at least 3 characters")
		.regex(
			/^[a-z0-9]+(?:-[a-z0-9]+)*$/,
			"Slug must contain lowercase letters, numbers, and hyphens only",
		),
	category: z
		.string()
		.trim()
		.min(3, "Category must be at least 3 characters"),
	description: z
		.string()
		.trim()
		.min(10, "Description must be at least 10 characters"),
	images: z.array(z.string()).min(1, "Product must have at least one image"),
	price: z.coerce
		.number()
		.nonnegative("Price cannot be negative")
		.multipleOf(0.01, "Price can have at most two decimal places"),
	brand: z.string().trim().min(3, "Brand must be at least 3 characters"),
	rating: z.coerce
		.number()
		.min(0, "Rating cannot be lower than 0")
		.max(5, "Rating cannot be higher than 5")
		.default(0),
	numReviews: z.coerce.number().int().nonnegative().default(0),
	stock: z.coerce.number().int().nonnegative("Stock cannot be negative"),
	isFeatured: z.boolean().default(false),
	banner: z.string().nullable().default(null),
});

export type Product = z.infer<typeof insertProductSchema> & {
	id: string;
};

export const signInFormSchema = z.object({
	email: z.email("Invalid email address"),
	password: z
		.string()
		.trim()
		.min(6, "password must be at least 6 characters"),
	callbackUrl: z.string().trim().default("/"),
});

export type SignInForm = z.infer<typeof signInFormSchema>;

export const signUpFormSchema = z
	.object({
		name: z.string().trim().min(3, "Name must be at least 3 characters"),
		email: z.email("Invalid email address"),
		password: z
			.string()
			.trim()
			.min(6, "Password must be at least 6 characters"),
		confirmPassword: z
			.string()
			.trim()
			.min(6, "Confirm password must be at least 6 characters"),
		callbackUrl: z.string().trim().default("/"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export type SignUpForm = z.infer<typeof signUpFormSchema>;

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

export type CartItem = z.infer<typeof cartItemSchema>;

export const insertCartSchema = z.object({
	items: z.array(cartItemSchema).default([]),
	itemsPrice: currencySchema,
	shippingPrice: currencySchema,
	taxPrice: currencySchema,
	totalPrice: currencySchema,
	sessionCartId: z.string().trim().min(1, "Session cart id is required"),
	userId: z.uuid("User id must be a valid UUID").optional().nullable(),
});

export type Cart = z.infer<typeof insertCartSchema>;

export const shippingAddressSchema = z.object({
	fullName: z
		.string()
		.trim()
		.min(3, "Full name must be at least 3 characters"),
	streetAddress: z
		.string()
		.trim()
		.min(3, "Street address must be at least 3 characters"),
	city: z.string().trim().min(2, "City must be at least 2 characters"),
	province: z
		.string()
		.trim()
		.min(2, "Province must be at least 2 characters"),
	postalCode: z
		.string()
		.trim()
		.min(3, "Postal code must be at least 3 characters"),
	country: z.string().trim().min(2, "Country must be at least 2 characters"),
	lat: z.number().optional(),
	lng: z.number().optional(),
});

export type ShippingAddress = z.infer<typeof shippingAddressSchema>;

export const paymentMethodSchema = z
	.object({
		type: z.string().trim().min(1, "Payment method is required"),
	})
	.refine((data) => PAYMENT_METHODS.includes(data.type), {
		path: ["type"],
		message: "Invalid payment method",
	});

export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

export const insertOrderSchema = z.object({
	userId: z.uuid("User id must be a valid UUID"),
	shippingAddress: shippingAddressSchema,
	paymentMethod: z
		.string()
		.trim()
		.min(1, "Payment method is required")
		.refine(
			(value) => PAYMENT_METHODS.includes(value),
			"Invalid payment method",
		),
	itemsPrice: currencySchema,
	shippingPrice: currencySchema,
	taxPrice: currencySchema,
	totalPrice: currencySchema,
});

export type Order = z.infer<typeof insertOrderSchema> & {
	id: string;
	createdAt: Date;
	updatedAt: Date;
	isPaid: boolean;
	paidAt: Date | null;
	isDelivered: boolean;
	deliveredAt: Date | null;
	orderItems: OrderItem[];
	user?: {
		name: string;
		email: string | null;
	};
};

export const insertOrderItemSchema = cartItemSchema;

export type OrderItem = z.infer<typeof insertOrderItemSchema>;
