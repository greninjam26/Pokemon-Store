import Link from "next/link";

import FadeInImage from "@/components/shared/fade-in-image";
import LocalDateTime from "@/components/shared/local-date-time";
import OrderPaymentStatusBadge from "@/components/shared/order/order-payment-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { getOrderById } from "@/lib/action/order.action";
import {
	PAYMENT_METHOD_CASH_ON_DELIVERY,
	PAYMENT_METHOD_CREDIT_CARD,
	PAYMENT_METHOD_PAYPAL,
	PAYPAL_CURRENCY_CODE,
} from "@/lib/constant";
import { isOrderExpired } from "@/lib/order-utils";
import { formatCurrency, formatId } from "@/lib/utils";
import { shippingAddressSchema } from "@/lib/validators";
import AdminOrderActions from "./admin-order-actions";
import PayPalPayment from "./paypal-payment";
import StripePayment from "./stripe-payment";

type OrderDetailsTableProps = Readonly<{
	order: NonNullable<Awaited<ReturnType<typeof getOrderById>>>;
	isAdmin?: boolean;
	paypalClientId: string;
	stripePublishableKey: string;
}>;

function OrderDetailsTable({
	order,
	isAdmin = false,
	paypalClientId,
	stripePublishableKey,
}: OrderDetailsTableProps) {
	const address = shippingAddressSchema.parse(order.shippingAddress);
	const isExpired = isOrderExpired(order.paymentResult);
	const shouldShowPayPal =
		!isAdmin &&
		!order.isPaid &&
		!isExpired &&
		order.paymentMethod.trim().toLowerCase() ===
			PAYMENT_METHOD_PAYPAL.toLowerCase();
	const shouldShowStripe =
		!isAdmin &&
		!order.isPaid &&
		!isExpired &&
		order.paymentMethod.trim().toLowerCase() ===
			PAYMENT_METHOD_CREDIT_CARD.toLowerCase();
	const canMarkPaid =
		isAdmin &&
		!order.isPaid &&
		!isExpired &&
		order.paymentMethod.trim().toLowerCase() ===
			PAYMENT_METHOD_CASH_ON_DELIVERY.toLowerCase();
	const canMarkDelivered = isAdmin && order.isPaid && !order.isDelivered;

	return (
		<section className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div className="space-y-2">
					<h1 className="h1-bold">Order {formatId(order.id)}</h1>
					<p className="text-base font-medium leading-7 text-muted-foreground">
						{isAdmin
							? "Review this customer order and fulfillment status."
							: "Your order has been created. Keep this page for your records."}
					</p>
				</div>
				<div className="flex flex-wrap gap-2">
					{isAdmin ? (
						<Button variant="outline" asChild>
							<Link href="/admin/orders">
								Back to Admin Orders
							</Link>
						</Button>
					) : null}
					<Button variant="outline" asChild>
						<Link href="/account/orders">Order History</Link>
					</Button>
					<Button variant="outline" asChild>
						<Link href="/">Continue Shopping</Link>
					</Button>
				</div>
			</div>

			<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
				<div className="space-y-5">
					<Card className="rounded-lg">
						<CardHeader>
							<CardTitle>Payment</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<p className="font-semibold">
								{order.paymentMethod}
							</p>
							<OrderPaymentStatusBadge
								isPaid={order.isPaid}
								paymentResult={order.paymentResult}
								paidAt={order.paidAt}
							/>
							{shouldShowPayPal ? (
								<PayPalPayment
									orderId={order.id}
									paypalClientId={paypalClientId}
									currencyCode={PAYPAL_CURRENCY_CODE}
								/>
							) : null}
							{shouldShowStripe ? (
								<StripePayment
									orderId={order.id}
									stripePublishableKey={
										stripePublishableKey
									}
								/>
							) : null}
							<AdminOrderActions
								orderId={order.id}
								canMarkPaid={canMarkPaid}
								canMarkDelivered={false}
							/>
						</CardContent>
					</Card>

					<Card className="rounded-lg">
						<CardHeader>
							<CardTitle>Shipping</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="space-y-1 text-sm font-medium text-muted-foreground">
								<p className="font-bold text-foreground">
									{address.fullName}
								</p>
								<p>
									{address.streetAddress}, {address.city},{" "}
									{address.province} {address.postalCode}
								</p>
								<p>{address.country}</p>
							</div>
							{order.isDelivered ? (
								<Badge variant="secondary">
									Delivered
									{order.deliveredAt ? (
										<>
											{" at "}
											<LocalDateTime
												value={order.deliveredAt.toISOString()}
											/>
										</>
									) : null}
								</Badge>
							) : (
								<Badge variant="destructive">
									Not delivered
								</Badge>
							)}
							<AdminOrderActions
								orderId={order.id}
								canMarkPaid={false}
								canMarkDelivered={canMarkDelivered}
							/>
						</CardContent>
					</Card>

					<Card className="rounded-lg">
						<CardHeader>
							<CardTitle>Order Items</CardTitle>
						</CardHeader>
						<CardContent className="p-0">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Product</TableHead>
										<TableHead className="text-center">
											Qty
										</TableHead>
										<TableHead className="text-right">
											Price
										</TableHead>
										<TableHead className="text-right">
											Subtotal
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{order.orderItems.map((item) => (
										<TableRow key={item.productId}>
											<TableCell>
												<Link
													href={`/product/${item.slug}`}
													className="flex min-w-72 items-center gap-4"
												>
													<span className="relative size-16 shrink-0 overflow-hidden rounded-lg border bg-muted">
														<FadeInImage
															src={item.image}
															alt={item.name}
															fill
															sizes="64px"
															className="object-contain p-2"
														/>
													</span>
													<span className="line-clamp-2 font-bold hover:text-primary hover:underline">
														{item.name}
													</span>
												</Link>
											</TableCell>
											<TableCell className="text-center font-semibold">
												{item.qty}
											</TableCell>
											<TableCell className="text-right font-semibold">
												{formatCurrency(item.price)}
											</TableCell>
											<TableCell className="text-right font-black text-primary">
												{formatCurrency(
													item.price * item.qty,
												)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</div>

				<Card className="h-fit rounded-lg">
					<CardHeader>
						<CardTitle>Order Summary</CardTitle>
					</CardHeader>
					<CardContent className="space-y-5">
						<div className="space-y-3 text-sm">
							<div className="flex justify-between gap-4">
								<span className="font-medium text-muted-foreground">
									Items
								</span>
								<span className="font-bold">
									{formatCurrency(order.itemsPrice)}
								</span>
							</div>
							<div className="flex justify-between gap-4">
								<span className="font-medium text-muted-foreground">
									Shipping
								</span>
								<span className="font-bold">
									{formatCurrency(order.shippingPrice)}
								</span>
							</div>
							<div className="flex justify-between gap-4">
								<span className="font-medium text-muted-foreground">
									Tax
								</span>
								<span className="font-bold">
									{formatCurrency(order.taxPrice)}
								</span>
							</div>
						</div>
						<div className="flex justify-between border-t pt-4 text-lg font-black">
							<span>Total</span>
							<span className="text-primary">
								{formatCurrency(order.totalPrice)}
							</span>
						</div>
						{!shouldShowPayPal &&
						!shouldShowStripe &&
						!order.isPaid ? (
							<div className="rounded-lg border bg-muted/40 p-4 text-sm font-medium leading-6 text-muted-foreground">
								{isExpired ? (
									<>
										This order expired before payment was
										completed. Its items have been returned
										to stock.
									</>
								) : (
									<>
										This order was placed with{" "}
										<span className="font-bold text-foreground">
											{order.paymentMethod}
										</span>
										. Payment options can be changed before
										placing a new order.
									</>
								)}
							</div>
						) : null}
					</CardContent>
				</Card>
			</div>
		</section>
	);
}

export default OrderDetailsTable;
