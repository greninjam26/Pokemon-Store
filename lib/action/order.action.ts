"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import prisma from "@/db/prisma";
import { getMyCart } from "@/lib/action/cart.action";
import { getUserCheckoutInfo } from "@/lib/action/user.actions";
import { formatError } from "@/lib/utils";
import {
	insertOrderItemSchema,
	insertOrderSchema,
	shippingAddressSchema,
} from "@/lib/validators";

type ActionResponse = {
	success: boolean;
	message: string;
	redirectTo?: string;
};

function decimalToNumber(value: { toString: () => string }) {
	return Number(value.toString());
}

export async function createOrder(): Promise<ActionResponse> {
	try {
		const session = await auth();
		const userId = (session?.user as { id?: string } | undefined)?.id;

		if (!userId) {
			return {
				success: false,
				message: "Please sign in to place your order",
				redirectTo: "/sign-in?callbackUrl=/place-order",
			};
		}

		const cart = await getMyCart();

		if (!cart || cart.items.length === 0) {
			return {
				success: false,
				message: "Your cart is empty",
				redirectTo: "/cart",
			};
		}

		const user = await getUserCheckoutInfo(userId);
		const shippingAddress = shippingAddressSchema.safeParse(
			user?.address ?? {},
		);

		if (!shippingAddress.success) {
			return {
				success: false,
				message: "Please add a shipping address",
				redirectTo: "/shipping-address",
			};
		}

		if (!user?.paymentMethod) {
			return {
				success: false,
				message: "Please choose a payment method",
				redirectTo: "/payment-method",
			};
		}

		const order = insertOrderSchema.parse({
			userId,
			shippingAddress: shippingAddress.data,
			paymentMethod: user.paymentMethod,
			itemsPrice: cart.itemsPrice,
			shippingPrice: cart.shippingPrice,
			taxPrice: cart.taxPrice,
			totalPrice: cart.totalPrice,
		});
		const orderItems = insertOrderItemSchema.array().parse(cart.items);

		const insertedOrderId = await prisma.$transaction(async (tx) => {
			const products = await tx.product.findMany({
				where: {
					id: {
						in: orderItems.map((item) => item.productId),
					},
				},
				select: {
					id: true,
					name: true,
					stock: true,
				},
			});
			const productById = new Map(
				products.map((product) => [product.id, product]),
			);

			for (const item of orderItems) {
				const product = productById.get(item.productId);

				if (!product) {
					throw new Error(`${item.name} is no longer available`);
				}

				if (product.stock < item.qty) {
					throw new Error(
						`${product.name} only has ${product.stock} in stock`,
					);
				}
			}

			const insertedOrder = await tx.order.create({
				data: order,
			});

			await tx.orderItem.createMany({
				data: orderItems.map((item) => ({
					orderId: insertedOrder.id,
					productId: item.productId,
					name: item.name,
					slug: item.slug,
					image: item.image,
					price: item.price,
					qty: item.qty,
				})),
			});

			for (const item of orderItems) {
				const updatedProduct = await tx.product.updateMany({
					where: {
						id: item.productId,
						stock: {
							gte: item.qty,
						},
					},
					data: {
						stock: { decrement: item.qty },
					},
				});

				if (updatedProduct.count !== 1) {
					throw new Error(`${item.name} is no longer in stock`);
				}
			}

			await tx.cart.deleteMany({
				where: { id: cart.id },
			});

			return insertedOrder.id;
		});

		for (const item of orderItems) {
			revalidatePath(`/product/${item.slug}`);
		}
		revalidatePath("/");
		revalidatePath("/cart");
		revalidatePath("/place-order");

		return {
			success: true,
			message: "Order placed successfully",
			redirectTo: `/order/${insertedOrderId}`,
		};
	} catch (error) {
		return {
			success: false,
			message: formatError(error),
		};
	}
}

export async function getOrderById(orderId: string) {
	const session = await auth();
	const userId = (session?.user as { id?: string } | undefined)?.id;

	if (!userId) {
		return null;
	}

	const order = await prisma.order.findFirst({
		where: {
			id: orderId,
			userId,
		},
		include: {
			orderItems: true,
			user: {
				select: {
					name: true,
					email: true,
				},
			},
		},
	});

	if (!order) {
		return null;
	}

	return {
		...order,
		itemsPrice: decimalToNumber(order.itemsPrice),
		shippingPrice: decimalToNumber(order.shippingPrice),
		taxPrice: decimalToNumber(order.taxPrice),
		totalPrice: decimalToNumber(order.totalPrice),
		orderItems: order.orderItems.map((item) => ({
			...item,
			price: decimalToNumber(item.price),
		})),
	};
}
