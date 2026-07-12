import { z } from "zod";

export const reviewSchema = z.object({
	productId: z.string().uuid("Product ID must be a valid UUID"),
	rating: z.coerce
		.number()
		.int("Rating must be a whole number")
		.min(1, "Rating must be at least 1")
		.max(5, "Rating cannot be higher than 5"),
	title: z
		.string()
		.trim()
		.min(3, "Title must be at least 3 characters")
		.max(80, "Title must be 80 characters or fewer"),
	description: z
		.string()
		.trim()
		.min(10, "Review must be at least 10 characters")
		.max(1000, "Review must be 1000 characters or fewer"),
});
