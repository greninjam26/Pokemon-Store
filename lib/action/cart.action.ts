"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { auth } from "@/auth";
import prisma from "@/db/prisma";
import {
	CART_FREE_SHIPPING_MIN_PRICE,
	CART_SESSION_COOKIE_MAX_AGE,
	CART_SESSION_COOKIE_NAME,
	CART_SHIPPING_PRICE,
	CART_TAX_RATE,
} from "@/lib/constant";
import { formatError, roundToTwoDecimals } from "@/lib/utils";
import {
	cartItemSchema,
	insertCartSchema,
	type Cart,
	type CartItem,
} from "@/lib/validator";

type ActionResponse = {
	success: boolean;
	message: string;
};

type CartPrices = Pick<
	Cart,
	"itemsPrice" | "shippingPrice" | "taxPrice" | "totalPrice"
>;

export type CartWithItems = Cart & {
	id: string;
	items: CartItem[];
	createdAt: string;
};

function toNumber(value: { toString: () => string }) {
	return Number(value.toString());
}

function parseCartItems(items: unknown): CartItem[] {
	const result = cartItemSchema.array().safeParse(items);

	return result.success ? result.data : [];
}

export function calcPrice(items: CartItem[]): CartPrices {
	const itemsPrice = roundToTwoDecimals(
		items.reduce((total, item) => total + item.price * item.qty, 0),
	);
	const shippingPrice =
		itemsPrice > 0 && itemsPrice < CART_FREE_SHIPPING_MIN_PRICE
			? CART_SHIPPING_PRICE
			: 0;
	const taxPrice = roundToTwoDecimals(itemsPrice * CART_TAX_RATE);
	const totalPrice = roundToTwoDecimals(
		itemsPrice + shippingPrice + taxPrice,
	);

	return {
		itemsPrice,
		shippingPrice,
		taxPrice,
		totalPrice,
	};
}

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

export async function getMyCart(): Promise<CartWithItems | null> {
	const cookieStore = await cookies();
	const sessionCartId = cookieStore.get(CART_SESSION_COOKIE_NAME)?.value;

	if (!sessionCartId) {
		return null;
	}

	const session = await auth();
	const userId = (session?.user as { id?: string } | undefined)?.id;

	const cart = await prisma.cart.findFirst({
		where: userId
			? {
					OR: [{ userId }, { sessionCartId }],
				}
			: { sessionCartId },
		orderBy: { createdAt: "desc" },
	});

	if (!cart) {
		return null;
	}

	return {
		id: cart.id,
		items: parseCartItems(cart.items),
		itemsPrice: toNumber(cart.itemsPrice),
		shippingPrice: toNumber(cart.shippingPrice),
		taxPrice: toNumber(cart.taxPrice),
		totalPrice: toNumber(cart.totalPrice),
		sessionCartId: cart.sessionCartId,
		userId: cart.userId,
		createdAt: cart.createdAt.toISOString(),
	};
}

export async function addItemToCart(item: CartItem): Promise<ActionResponse> {
	try {
		const sessionCartId = await ensureSessionCartId();
		const session = await auth();
		const userId = (session?.user as { id?: string } | undefined)?.id;
		const cart = await getMyCart();
		const cartItem = cartItemSchema.parse(item);

		const product = await prisma.product.findUnique({
			where: { id: cartItem.productId },
			select: {
				id: true,
				name: true,
				slug: true,
				stock: true,
			},
		});

		if (!product) {
			throw new Error("Product not found");
		}

		const existingItemQuantity =
			cart?.items.find(
				(existingItem) => existingItem.productId === cartItem.productId,
			)?.qty ?? 0;

		if (product.stock < existingItemQuantity + cartItem.qty) {
			return {
				success: false,
				message: "Not enough stock available",
			};
		}

		if (!cart) {
			const newCart = insertCartSchema.parse({
				userId: userId ?? null,
				items: [cartItem],
				sessionCartId,
				...calcPrice([cartItem]),
			});

			await prisma.cart.create({
				data: newCart,
			});

			revalidatePath(`/product/${product.slug}`);
			revalidatePath("/cart");

			return {
				success: true,
				message: `${cartItem.name} added to cart`,
			};
		}

		const itemAlreadyInCart = cart.items.some(
			(existingItem) => existingItem.productId === cartItem.productId,
		);
		const updatedItems = itemAlreadyInCart
			? cart.items.map((existingItem) =>
					existingItem.productId === cartItem.productId
						? {
								...existingItem,
								qty: existingItem.qty + cartItem.qty,
							}
						: existingItem,
				)
			: [...cart.items, cartItem];

		const updatedCart = insertCartSchema.parse({
			userId: cart.userId ?? userId ?? null,
			items: updatedItems,
			sessionCartId: cart.sessionCartId,
			...calcPrice(updatedItems),
		});

		await prisma.cart.update({
			where: { id: cart.id },
			data: {
				userId: updatedCart.userId,
				items: updatedCart.items,
				itemsPrice: updatedCart.itemsPrice,
				shippingPrice: updatedCart.shippingPrice,
				taxPrice: updatedCart.taxPrice,
				totalPrice: updatedCart.totalPrice,
			},
		});

		revalidatePath(`/product/${product.slug}`);
		revalidatePath("/cart");

		return {
			success: true,
			message: itemAlreadyInCart
				? `${cartItem.name} quantity updated`
				: `${cartItem.name} added to cart`,
		};
	} catch (error) {
		return {
			success: false,
			message: formatError(error),
		};
	}
}
