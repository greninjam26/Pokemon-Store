"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import prisma from "@/db/prisma";
import {
	CART_FREE_SHIPPING_MIN_PRICE,
	CART_SESSION_COOKIE_MAX_AGE,
	CART_SESSION_COOKIE_NAME,
	CART_SHIPPING_PRICE,
	CART_TAX_RATE,
} from "@/lib/constant";
import {
	decimalToNumber,
	formatError,
	roundToTwoDecimals,
} from "@/lib/utils";
import { cartItemSchema, insertCartSchema } from "@/lib/validators";
import type { Cart, CartItem } from "@/types";
import { getCurrentUserId } from "./helpers";

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

type CartRecord = {
	id: string;
	userId: string | null;
	sessionCartId: string;
	items: unknown;
	itemsPrice: { toString: () => string };
	shippingPrice: { toString: () => string };
	taxPrice: { toString: () => string };
	totalPrice: { toString: () => string };
	createdAt: Date;
};

function parseCartItems(items: unknown): CartItem[] {
	const result = cartItemSchema.array().safeParse(items);

	return result.success ? result.data : [];
}

function cartToPlainObject(cart: CartRecord): CartWithItems {
	return {
		id: cart.id,
		items: parseCartItems(cart.items),
		itemsPrice: decimalToNumber(cart.itemsPrice),
		shippingPrice: decimalToNumber(cart.shippingPrice),
		taxPrice: decimalToNumber(cart.taxPrice),
		totalPrice: decimalToNumber(cart.totalPrice),
		sessionCartId: cart.sessionCartId,
		userId: cart.userId,
		createdAt: cart.createdAt.toISOString(),
	};
}

async function mergeCartItems(currentItems: CartItem[], guestItems: CartItem[]) {
	const itemByProductId = new Map<string, CartItem>();

	for (const item of [...currentItems, ...guestItems]) {
		const existingItem = itemByProductId.get(item.productId);

		if (existingItem) {
			itemByProductId.set(item.productId, {
				...existingItem,
				qty: existingItem.qty + item.qty,
			});
		} else {
			itemByProductId.set(item.productId, item);
		}
	}

	const productIds = [...itemByProductId.keys()];
	const products = await prisma.product.findMany({
		where: {
			id: {
				in: productIds,
			},
		},
		select: {
			id: true,
			stock: true,
		},
	});
	const stockByProductId = new Map(
		products.map((product) => [product.id, product.stock]),
	);

	return [...itemByProductId.values()].flatMap((item) => {
		const stock = stockByProductId.get(item.productId) ?? 0;
		const qty = Math.min(item.qty, stock);

		return qty > 0 ? [{ ...item, qty }] : [];
	});
}

function calcPrice(items: CartItem[]): CartPrices {
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

	const userId = await getCurrentUserId();

	if (!userId) {
		const guestCart = await prisma.cart.findFirst({
			where: {
				sessionCartId,
				userId: null,
			},
			orderBy: { createdAt: "desc" },
		});

		return guestCart ? cartToPlainObject(guestCart) : null;
	}

	const userCart = await prisma.cart.findFirst({
		where: { userId },
		orderBy: { createdAt: "desc" },
	});
	const guestCart = await prisma.cart.findFirst({
		where: {
			sessionCartId,
			userId: null,
		},
		orderBy: { createdAt: "desc" },
	});

	if (userCart && guestCart) {
		const mergedItems = await mergeCartItems(
			parseCartItems(userCart.items),
			parseCartItems(guestCart.items),
		);
		const updatedCart = await prisma.cart.update({
			where: { id: userCart.id },
			data: {
				items: mergedItems,
				...calcPrice(mergedItems),
			},
		});

		await prisma.cart.delete({
			where: { id: guestCart.id },
		});

		return cartToPlainObject(updatedCart);
	}

	if (guestCart) {
		const updatedCart = await prisma.cart.update({
			where: { id: guestCart.id },
			data: { userId },
		});

		return cartToPlainObject(updatedCart);
	}

	return userCart ? cartToPlainObject(userCart) : null;
}

export async function addItemToCart(item: CartItem): Promise<ActionResponse> {
	try {
		const sessionCartId = await ensureSessionCartId();
		const userId = await getCurrentUserId();
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

export async function removeItemFromCart(
	productId: string,
): Promise<ActionResponse> {
	try {
		const cart = await getMyCart();

		if (!cart) {
			throw new Error("Cart not found");
		}

		const existingItem = cart.items.find(
			(item) => item.productId === productId,
		);

		if (!existingItem) {
			throw new Error("Item not found in cart");
		}

		const product = await prisma.product.findUnique({
			where: { id: productId },
			select: {
				name: true,
				slug: true,
			},
		});

		const updatedItems =
			existingItem.qty === 1
				? cart.items.filter((item) => item.productId !== productId)
				: cart.items.map((item) =>
						item.productId === productId
							? { ...item, qty: item.qty - 1 }
							: item,
					);

		if (updatedItems.length === 0) {
			await prisma.cart.delete({
				where: { id: cart.id },
			});
		} else {
			const updatedCart = insertCartSchema.parse({
				userId: cart.userId,
				items: updatedItems,
				sessionCartId: cart.sessionCartId,
				...calcPrice(updatedItems),
			});

			await prisma.cart.update({
				where: { id: cart.id },
				data: {
					items: updatedCart.items,
					itemsPrice: updatedCart.itemsPrice,
					shippingPrice: updatedCart.shippingPrice,
					taxPrice: updatedCart.taxPrice,
					totalPrice: updatedCart.totalPrice,
				},
			});
		}

		if (product) {
			revalidatePath(`/product/${product.slug}`);
		}
		revalidatePath("/cart");

		return {
			success: true,
			message:
				existingItem.qty === 1
					? `${existingItem.name} removed from cart`
					: `${existingItem.name} quantity updated`,
		};
	} catch (error) {
		return {
			success: false,
			message: formatError(error),
		};
	}
}
