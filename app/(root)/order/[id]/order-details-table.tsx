import Link from "next/link";

import FadeInImage from "@/components/shared/fade-in-image";
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
import { formatCurrency } from "@/lib/utils";
import { shippingAddressSchema } from "@/lib/validators";

type OrderDetailsTableProps = Readonly<{
	order: NonNullable<Awaited<ReturnType<typeof getOrderById>>>;
}>;

function OrderDetailsTable({ order }: OrderDetailsTableProps) {
	const address = shippingAddressSchema.parse(order.shippingAddress);

	return (
		<section className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div className="space-y-2">
					<h1 className="h1-bold">Order {order.id.slice(-8)}</h1>
					<p className="text-base font-medium leading-7 text-muted-foreground">
						Your order has been created. Keep this page for your
						records.
					</p>
				</div>
				<Button variant="outline" asChild>
					<Link href="/">Continue Shopping</Link>
				</Button>
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
							{order.isPaid ? (
								<Badge variant="secondary">Paid</Badge>
							) : (
								<Badge variant="destructive">Not paid</Badge>
							)}
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
								<Badge variant="secondary">Delivered</Badge>
							) : (
								<Badge variant="destructive">
									Not delivered
								</Badge>
							)}
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
					</CardContent>
				</Card>
			</div>
		</section>
	);
}

export default OrderDetailsTable;
