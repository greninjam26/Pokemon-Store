"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import prisma from "@/db/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import {
	ADMIN_ORDER_SHORT_ID_LOOKUP_LIMIT,
	ADMIN_ORDERS_PAGE_SIZE,
	EXPIRED_ORDER_PAYMENT_STATUS,
	EXPIRABLE_ORDER_PAYMENT_METHODS,
	MAX_ORDER_HISTORY_PAGE_SIZE,
	MIN_ORDER_HISTORY_PAGE_SIZE,
	ORDER_HISTORY_PAGE_SIZE,
	ORDER_REPORT_TIME_ZONE,
	UNPAID_ORDER_EXPIRE_BATCH_SIZE,
	UNPAID_ORDER_EXPIRE_MINUTES,
} from "@/lib/constant";
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

type ExpirableOrder = {
	id: string;
	isPaid: boolean;
	paymentMethod: string;
	createdAt: Date;
	paymentResult: unknown;
};

function decimalToNumber(value: { toString: () => string }) {
	return Number(value.toString());
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function isUuid(value: string) {
	return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
		value,
	);
}

function getOrderIdSearchSuffix(value: string) {
	const suffix = value
		.replace(/^\.\.\./, "")
		.trim()
		.toLowerCase();

	return /^[0-9a-f-]+$/.test(suffix) && suffix.length >= 4 ? suffix : "";
}

function getTimeZoneDateKey(value: Date) {
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone: ORDER_REPORT_TIME_ZONE,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).formatToParts(value);
	const year = parts.find((part) => part.type === "year")?.value;
	const month = parts.find((part) => part.type === "month")?.value;
	const day = parts.find((part) => part.type === "day")?.value;

	return `${year}-${month}-${day}`;
}

function getUnpaidOrderExpiresAt(createdAt: Date) {
	return new Date(
		createdAt.getTime() + UNPAID_ORDER_EXPIRE_MINUTES * 60 * 1000,
	);
}

function isExpiredPaymentResult(paymentResult: unknown) {
	return (
		isRecord(paymentResult) &&
		paymentResult.status === EXPIRED_ORDER_PAYMENT_STATUS
	);
}

function notExpiredOrderFilter() {
	return {
		OR: [
			{
				paymentResult: {
					equals: Prisma.AnyNull,
				},
			},
			{
				paymentResult: {
					path: ["status"],
					not: EXPIRED_ORDER_PAYMENT_STATUS,
				},
			},
		],
	};
}

function shouldExpireOrder(order: ExpirableOrder) {
	return (
		!order.isPaid &&
		EXPIRABLE_ORDER_PAYMENT_METHODS.includes(order.paymentMethod) &&
		!isExpiredPaymentResult(order.paymentResult) &&
		getUnpaidOrderExpiresAt(order.createdAt).getTime() <= Date.now()
	);
}

function getUnpaidOrderExpireCutoff() {
	return new Date(Date.now() - UNPAID_ORDER_EXPIRE_MINUTES * 60 * 1000);
}

async function expireUnpaidOrder(
	orderId: string,
	{ revalidate = false }: { revalidate?: boolean } = {},
) {
	const result = await prisma.$transaction(async (tx) => {
		const order = await tx.order.findUnique({
			where: { id: orderId },
			select: {
				id: true,
				isPaid: true,
				paymentMethod: true,
				createdAt: true,
				paymentResult: true,
				orderItems: {
					select: {
						productId: true,
						qty: true,
						slug: true,
					},
				},
			},
		});

		if (!order || !shouldExpireOrder(order)) {
			return { expired: false, productSlugs: [] };
		}

		const updatedOrder = await tx.order.updateMany({
			where: {
				id: order.id,
				isPaid: false,
				OR: [
					{
						paymentResult: {
							equals: Prisma.AnyNull,
						},
					},
					{
						paymentResult: {
							path: ["status"],
							not: EXPIRED_ORDER_PAYMENT_STATUS,
						},
					},
				],
			},
			data: {
				paymentResult: {
					id: order.id,
					status: EXPIRED_ORDER_PAYMENT_STATUS,
					pricePaid: 0,
					expiredAt: new Date().toISOString(),
				},
			},
		});

		if (updatedOrder.count !== 1) {
			return { expired: false, productSlugs: [] };
		}

		for (const item of order.orderItems) {
			await tx.product.update({
				where: { id: item.productId },
				data: {
					stock: {
						increment: item.qty,
					},
				},
			});
		}

		return {
			expired: true,
			productSlugs: order.orderItems.map((item) => item.slug),
		};
	});

	if (result.expired && revalidate) {
		revalidatePath(`/order/${orderId}`);
		revalidatePath("/account/orders");
		revalidatePath("/admin/orders");
		revalidatePath("/admin/reports");
		revalidatePath("/");

		for (const slug of result.productSlugs) {
			revalidatePath(`/product/${slug}`);
		}
	}

	return result.expired;
}

async function expireDueUnpaidOrders({
	revalidate = false,
}: { revalidate?: boolean } = {}) {
	const orders = await prisma.order.findMany({
		where: {
			isPaid: false,
			paymentMethod: {
				in: EXPIRABLE_ORDER_PAYMENT_METHODS,
			},
			createdAt: {
				lte: getUnpaidOrderExpireCutoff(),
			},
			...notExpiredOrderFilter(),
		},
		orderBy: {
			createdAt: "asc",
		},
		take: UNPAID_ORDER_EXPIRE_BATCH_SIZE,
		select: {
			id: true,
		},
	});

	for (const order of orders) {
		await expireUnpaidOrder(order.id, { revalidate });
	}
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

async function getCurrentUserRole() {
	const session = await auth();

	return (session?.user as { role?: string } | undefined)?.role;
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
	const session = await auth();
	const userId = (session?.user as { id?: string } | undefined)?.id;
	const role = (session?.user as { role?: string } | undefined)?.role;

	if (!userId) {
		return null;
	}

	await expireUnpaidOrder(orderId);

	const order = await prisma.order.findFirst({
		where:
			role === "admin"
				? {
						id: orderId,
					}
				: {
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

export async function getMyOrders({
	limit,
	page = 1,
}: {
	limit?: number;
	page?: number;
} = {}) {
	const userId = await getCurrentUserId();

	if (!userId) {
		return {
			data: [],
			totalPages: 0,
		};
	}

	await expireDueUnpaidOrders();

	const currentPage = Math.max(1, page);
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			orderHistoryPageSize: true,
		},
	});
	const requestedPageSize = limit ?? user?.orderHistoryPageSize;
	const pageSize = Math.min(
		MAX_ORDER_HISTORY_PAGE_SIZE,
		Math.max(
			MIN_ORDER_HISTORY_PAGE_SIZE,
			requestedPageSize ?? ORDER_HISTORY_PAGE_SIZE,
		),
	);

	const where = { userId };
	const [orders, orderCount] = await prisma.$transaction([
		prisma.order.findMany({
			where,
			orderBy: {
				createdAt: "desc",
			},
			take: pageSize,
			skip: (currentPage - 1) * pageSize,
			select: {
				id: true,
				createdAt: true,
				totalPrice: true,
				paymentMethod: true,
				paymentResult: true,
				isPaid: true,
				paidAt: true,
				isDelivered: true,
				deliveredAt: true,
			},
		}),
		prisma.order.count({ where }),
	]);

	return {
		data: orders.map((order) => ({
			...order,
			totalPrice: decimalToNumber(order.totalPrice),
		})),
		totalPages: Math.ceil(orderCount / pageSize),
	};
}

export async function getAdminOrders({
	limit = ADMIN_ORDERS_PAGE_SIZE,
	page = 1,
	query = "",
}: {
	limit?: number;
	page?: number;
	query?: string;
} = {}) {
	const role = await getCurrentUserRole();

	if (role !== "admin") {
		throw new Error("User is not authorized");
	}

	await expireDueUnpaidOrders();

	const currentPage = Math.max(1, page);
	const pageSize = Math.max(1, limit);
	const trimmedQuery = query.trim();
	const orderIdSearchSuffix = getOrderIdSearchSuffix(trimmedQuery);
	const shortOrderIdMatches =
		trimmedQuery && orderIdSearchSuffix && !isUuid(trimmedQuery)
			? await prisma.order.findMany({
					orderBy: {
						createdAt: "desc",
					},
					take: ADMIN_ORDER_SHORT_ID_LOOKUP_LIMIT,
					select: {
						id: true,
					},
				})
			: [];
	const matchingOrderIds = shortOrderIdMatches
		.map((order) => order.id)
		.filter((id) => id.toLowerCase().endsWith(orderIdSearchSuffix));
	const queryFilters = [
		...(isUuid(trimmedQuery)
			? [
					{
						id: {
							equals: trimmedQuery,
						},
					},
				]
			: []),
		...(matchingOrderIds.length > 0
			? [
					{
						id: {
							in: matchingOrderIds,
						},
					},
				]
			: []),
		{
			user: {
				name: {
					contains: trimmedQuery,
					mode: "insensitive" as const,
				},
			},
		},
		{
			user: {
				email: {
					contains: trimmedQuery,
					mode: "insensitive" as const,
				},
			},
		},
	];
	const where = trimmedQuery
		? {
				OR: queryFilters,
			}
		: {};

	const [orders, orderCount] = await prisma.$transaction([
		prisma.order.findMany({
			where,
			orderBy: {
				createdAt: "desc",
			},
			take: pageSize,
			skip: (currentPage - 1) * pageSize,
			select: {
				id: true,
				createdAt: true,
				totalPrice: true,
				paymentMethod: true,
				paymentResult: true,
				isPaid: true,
				paidAt: true,
				isDelivered: true,
				deliveredAt: true,
				user: {
					select: {
						name: true,
						email: true,
					},
				},
			},
		}),
		prisma.order.count({ where }),
	]);

	return {
		data: orders.map((order) => ({
			...order,
			totalPrice: decimalToNumber(order.totalPrice),
		})),
		totalPages: Math.ceil(orderCount / pageSize),
		totalOrders: orderCount,
	};
}

export async function getOrderSummary() {
	const role = await getCurrentUserRole();

	if (role !== "admin") {
		throw new Error("User is not authorized");
	}

	await expireDueUnpaidOrders();

	const [
		ordersCount,
		productsCount,
		usersCount,
		activeOrdersCount,
		paidSales,
		pendingOrdersCount,
		lowStockProductsCount,
		latestOrders,
		lowStockProducts,
		recentUsers,
	] = await prisma.$transaction([
		prisma.order.count(),
		prisma.product.count(),
		prisma.user.count(),
		prisma.order.count({
			where: notExpiredOrderFilter(),
		}),
		prisma.order.aggregate({
			where: {
				isPaid: true,
			},
			_sum: {
				totalPrice: true,
			},
		}),
		prisma.order.count({
			where: {
				AND: [
					notExpiredOrderFilter(),
					{
						OR: [
							{
								isPaid: false,
							},
							{
								isDelivered: false,
							},
						],
					},
				],
			},
		}),
		prisma.product.count({
			where: {
				stock: {
					lte: 5,
				},
			},
		}),
		prisma.order.findMany({
			orderBy: {
				createdAt: "desc",
			},
			take: 6,
			select: {
				id: true,
				totalPrice: true,
				paymentResult: true,
				isPaid: true,
				isDelivered: true,
				createdAt: true,
				user: {
					select: {
						name: true,
						email: true,
					},
				},
			},
		}),
		prisma.product.findMany({
			where: {
				stock: {
					lte: 5,
				},
			},
			orderBy: {
				stock: "asc",
			},
			take: 5,
			select: {
				id: true,
				name: true,
				slug: true,
				stock: true,
			},
		}),
		prisma.user.findMany({
			orderBy: {
				createdAt: "desc",
			},
			take: 5,
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				createdAt: true,
			},
		}),
	]);

	return {
		ordersCount,
		productsCount,
		usersCount,
		activeOrdersCount,
		totalSales: decimalToNumber(paidSales._sum.totalPrice ?? 0),
		pendingOrdersCount,
		lowStockProductsCount,
		latestOrders: latestOrders.map((order) => ({
			...order,
			totalPrice: decimalToNumber(order.totalPrice),
		})),
		lowStockProducts,
		recentUsers,
	};
}

export async function getAdminReports() {
	const role = await getCurrentUserRole();

	if (role !== "admin") {
		throw new Error("User is not authorized");
	}

	await expireDueUnpaidOrders();

	const today = new Date();

	const [
		ordersCount,
		activeOrdersCount,
		paidOrdersCount,
		deliveredOrdersCount,
		usersCount,
		inventory,
		lowStockProductsCount,
		paidOrders,
	] = await prisma.$transaction([
		prisma.order.count(),
		prisma.order.count({
			where: notExpiredOrderFilter(),
		}),
		prisma.order.count({
			where: {
				...notExpiredOrderFilter(),
				isPaid: true,
			},
		}),
		prisma.order.count({
			where: {
				...notExpiredOrderFilter(),
				isDelivered: true,
			},
		}),
		prisma.user.count(),
		prisma.product.aggregate({
			_sum: {
				stock: true,
			},
			_count: {
				id: true,
			},
		}),
		prisma.product.count({
			where: {
				stock: {
					lte: 5,
				},
			},
		}),
		prisma.order.findMany({
			where: {
				isPaid: true,
			},
			select: {
				id: true,
				createdAt: true,
				totalPrice: true,
				paymentMethod: true,
				orderItems: {
					select: {
						name: true,
						qty: true,
						price: true,
						product: {
							select: {
								category: true,
							},
						},
					},
				},
			},
		}),
	]);

	const totalSales = paidOrders.reduce(
		(total, order) => total + decimalToNumber(order.totalPrice),
		0,
	);
	const averageOrderValue =
		paidOrders.length > 0 ? totalSales / paidOrders.length : 0;
	const paidRate =
		activeOrdersCount > 0
			? Math.round((paidOrdersCount / activeOrdersCount) * 100)
			: 0;
	const deliveredRate =
		activeOrdersCount > 0
			? Math.round((deliveredOrdersCount / activeOrdersCount) * 100)
			: 0;

	const dailySales = Array.from({ length: 7 }, (_, index) => {
		const date = new Date(today);
		date.setDate(today.getDate() - (6 - index));
		const key = getTimeZoneDateKey(date);

		return {
			date: key,
			totalSales: 0,
			orders: 0,
		};
	});
	const dailySalesByDate = new Map(dailySales.map((day) => [day.date, day]));
	const productSales = new Map<
		string,
		{
			name: string;
			qty: number;
			revenue: number;
		}
	>();
	const categorySales = new Map<
		string,
		{
			category: string;
			revenue: number;
		}
	>();
	const paymentMethodSales = new Map<
		string,
		{
			method: string;
			orders: number;
			revenue: number;
		}
	>();

	for (const order of paidOrders) {
		const orderTotal = decimalToNumber(order.totalPrice);
		const orderDate = getTimeZoneDateKey(order.createdAt);
		const dailySale = dailySalesByDate.get(orderDate);
		const paymentMethod = paymentMethodSales.get(order.paymentMethod) ?? {
			method: order.paymentMethod,
			orders: 0,
			revenue: 0,
		};

		paymentMethod.orders += 1;
		paymentMethod.revenue += orderTotal;
		paymentMethodSales.set(order.paymentMethod, paymentMethod);

		if (dailySale) {
			dailySale.totalSales += orderTotal;
			dailySale.orders += 1;
		}

		for (const item of order.orderItems) {
			const itemRevenue = decimalToNumber(item.price) * item.qty;
			const productSale = productSales.get(item.name) ?? {
				name: item.name,
				qty: 0,
				revenue: 0,
			};
			const category = item.product.category;
			const categorySale = categorySales.get(category) ?? {
				category,
				revenue: 0,
			};

			productSale.qty += item.qty;
			productSale.revenue += itemRevenue;
			productSales.set(item.name, productSale);

			categorySale.revenue += itemRevenue;
			categorySales.set(category, categorySale);
		}
	}

	return {
		totalSales,
		averageOrderValue,
		ordersCount,
		activeOrdersCount,
		paidOrdersCount,
		deliveredOrdersCount,
		paidRate,
		deliveredRate,
		usersCount,
		productCount: inventory._count.id,
		inventoryUnits: inventory._sum.stock ?? 0,
		lowStockProductsCount,
		dailySales,
		topProducts: [...productSales.values()]
			.sort((firstProduct, secondProduct) => {
				if (secondProduct.revenue === firstProduct.revenue) {
					return secondProduct.qty - firstProduct.qty;
				}

				return secondProduct.revenue - firstProduct.revenue;
			})
			.slice(0, 5),
		categorySales: [...categorySales.values()]
			.sort(
				(firstCategory, secondCategory) =>
					secondCategory.revenue - firstCategory.revenue,
			)
			.slice(0, 5),
		paymentMethodSales: [...paymentMethodSales.values()].sort(
			(firstMethod, secondMethod) =>
				secondMethod.revenue - firstMethod.revenue,
		),
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

		if (shouldExpireOrder(order)) {
			await expireUnpaidOrder(order.id, { revalidate: true });
			throw new Error(
				"This order has expired. Please place a new order.",
			);
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

		if (shouldExpireOrder(order)) {
			await expireUnpaidOrder(order.id, { revalidate: true });
			throw new Error(
				"This order has expired. Please place a new order.",
			);
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
