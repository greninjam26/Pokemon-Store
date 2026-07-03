"use server";

import { cartItemSchema, type CartItem } from "@/lib/validator";

type ActionResponse = {
	success: boolean;
	message: string;
};

export async function addItemToCart(item: CartItem): Promise<ActionResponse> {
	const result = cartItemSchema.safeParse(item);

	if (!result.success) {
		return {
			success: false,
			message: "Could not add item to cart",
		};
	}

	return {
		success: true,
		message: `${result.data.name} added to cart`,
	};
}
