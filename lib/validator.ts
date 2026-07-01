import { z } from "zod";

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

export type Product = z.infer<typeof insertProductSchema>;

export const signInFormSchema = z.object({
	email: z.email("Invalid email address"),
	password: z
		.string()
		.trim()
		.min(6, "password must be at least 6 characters"),
});

export type SignInForm = z.infer<typeof signInFormSchema>;
