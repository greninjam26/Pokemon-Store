"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import prisma from "@/db/prisma";
import {
	capturePayPalOrder as capturePayPalApiOrder,
	createPayPalOrder as createPayPalApiOrder,
} from "@/lib/paypal";
import { formatError } from "@/lib/utils";
import {
	insertOrderItemSchema,
	insertOrderSchema,
	paymentResultSchema,
	shippingAddressSchema,
} from "@/lib/validators";
import type { PaymentResult } from "@/types";
import { getMyCart } from "./cart.action";
import { getUserCheckoutInfo } from "./user.actions";

type ActionResponse = {
	success: boolean;
	message: string;
	redirectTo?: string;
	data?: string;
};

function decimalToNumber(value: { toString: () => string }) {
	return Number(value.toString());
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

async function updateOrderToPaid({
	orderId,
	userId,
	paymentResult,
}: {
	orderId: string;
	userId: string;
	paymentResult: PaymentResult;
}) {
	const order = await prisma.order.findFirst({
		where: {
			id: orderId,
			userId,
		},
		select: {
			id: true,
			isPaid: true,
		},
	});

	if (!order) {
		throw new Error("Order not found");
	}

	if (order.isPaid) {
		throw new Error("Order is already paid");
	}

	await prisma.order.update({
		where: { id: order.id },
		data: {
			isPaid: true,
			paidAt: new Date(),
			paymentResult,
		},
	});
}

async function getCurrentUserId() {
	const session = await auth();

	return (session?.user as { id?: string } | undefined)?.id;
}

export async function createOrder(): Promise<ActionResponse> {
	try {
		const userId = await getCurrentUserId();

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
	const userId = await getCurrentUserId();

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

export async function createPayPalOrder(
	orderId: string,
): Promise<ActionResponse> {
	try {
		const userId = await getCurrentUserId();

		if (!userId) {
			return {
				success: false,
				message: "Please sign in to pay for your order",
				redirectTo: `/sign-in?callbackUrl=/order/${orderId}`,
			};
		}

		const order = await prisma.order.findFirst({
			where: {
				id: orderId,
				userId,
			},
		});

		if (!order) {
			throw new Error("Order not found");
		}

		if (order.isPaid) {
			throw new Error("Order is already paid");
		}

		const paypalOrder = await createPayPalApiOrder(
			decimalToNumber(order.totalPrice),
		);

		await prisma.order.update({
			where: { id: order.id },
			data: {
				paymentResult: {
					id: paypalOrder.id,
					status: paypalOrder.status,
					pricePaid: 0,
				},
			},
		});

		revalidatePath(`/order/${orderId}`);

		return {
			success: true,
			message: "PayPal order created successfully",
			data: paypalOrder.id,
		};
	} catch (error) {
		return {
			success: false,
			message: formatError(error),
		};
	}
}

export async function approvePayPalOrder(
	orderId: string,
	data: { orderID: string },
): Promise<ActionResponse> {
	try {
		const userId = await getCurrentUserId();

		if (!userId) {
			return {
				success: false,
				message: "Please sign in to pay for your order",
				redirectTo: `/sign-in?callbackUrl=/order/${orderId}`,
			};
		}

		const order = await prisma.order.findFirst({
			where: {
				id: orderId,
				userId,
			},
		});

		if (!order) {
			throw new Error("Order not found");
		}

		if (order.isPaid) {
			throw new Error("Order is already paid");
		}

		const pendingPaymentResult = order.paymentResult;
		const pendingPayPalOrderId = isRecord(pendingPaymentResult)
			? pendingPaymentResult.id
			: undefined;

		if (
			typeof pendingPayPalOrderId !== "string" ||
			pendingPayPalOrderId !== data.orderID
		) {
			throw new Error("PayPal order does not match this order");
		}

		const captureData = await capturePayPalApiOrder(data.orderID);

		if (
			captureData.id !== pendingPayPalOrderId ||
			captureData.status !== "COMPLETED"
		) {
			throw new Error("Error in PayPal payment");
		}

		const pricePaid = Number(
			captureData.purchase_units?.[0]?.payments?.captures?.[0]?.amount
				?.value,
		);
		const orderTotal = decimalToNumber(order.totalPrice);

		if (
			!Number.isFinite(pricePaid) ||
			pricePaid.toFixed(2) !== orderTotal.toFixed(2)
		) {
			throw new Error("PayPal payment amount does not match this order");
		}

		const paymentResult = paymentResultSchema.parse({
			id: captureData.id,
			status: captureData.status,
			pricePaid,
			...(captureData.payer?.email_address
				? { email_address: captureData.payer.email_address }
				: {}),
		});

		await updateOrderToPaid({
			orderId,
			userId,
			paymentResult,
		});

		revalidatePath(`/order/${orderId}`);

		return {
			success: true,
			message: "Your order has been paid",
		};
	} catch (error) {
		return {
			success: false,
			message: formatError(error),
		};
	}
}
