"use server";

import { cookies } from "next/headers";

import {
	CART_SESSION_COOKIE_MAX_AGE,
	CART_SESSION_COOKIE_NAME,
} from "@/lib/constant";
import { cartItemSchema, type CartItem } from "@/lib/validator";

type ActionResponse = {
	success: boolean;
	message: string;
};

async function ensureSessionCartId() {
	const cookieStore = await cookies();
	const sessionCartId = cookieStore.get(CART_SESSION_COOKIE_NAME)?.value;

	if (sessionCartId) {
		return sessionCartId;
	}

	const newSessionCartId = crypto.randomUUID();

	cookieStore.set(CART_SESSION_COOKIE_NAME, newSessionCartId, {
		httpOnly: true,
		maxAge: CART_SESSION_COOKIE_MAX_AGE,
		path: "/",
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
	});

	return newSessionCartId;
}

export async function addItemToCart(item: CartItem): Promise<ActionResponse> {
	const result = cartItemSchema.safeParse(item);

	if (!result.success) {
		return {
			success: false,
			message: "Could not add item to cart",
		};
	}

	await ensureSessionCartId();

	return {
		success: true,
		message: `${result.data.name} added to cart`,
	};
}
