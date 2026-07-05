import { z } from "zod";

import { PAYMENT_METHODS } from "../constant";

import { cartItemSchema } from "./cart";
import { shippingAddressSchema } from "./checkout";
import { currencySchema } from "./shared";

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

// Order items use the same product snapshot shape as cart items.
export const insertOrderItemSchema = cartItemSchema;
