import { z } from "zod";

import { PAYMENT_METHODS } from "../constant";

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

export const paymentMethodSchema = z
	.object({
		type: z.string().trim().min(1, "Payment method is required"),
	})
	.refine((data) => PAYMENT_METHODS.includes(data.type), {
		path: ["type"],
		message: "Invalid payment method",
	});
