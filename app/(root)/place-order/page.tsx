import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import CheckoutSteps from "@/components/shared/checkout/checkout-steps";
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
import { getMyCart } from "@/lib/action/cart.action";
import { getUserCheckoutInfo } from "@/lib/action/user.actions";
import { formatCurrency } from "@/lib/utils";
import { shippingAddressSchema } from "@/lib/validators";

import PlaceOrderForm from "./place-order-form";

export const metadata: Metadata = {
	title: "Place Order",
};

async function PlaceOrderPage() {
	const session = await auth();
	const userId = (session?.user as { id?: string } | undefined)?.id;

	if (!userId) {
		redirect("/sign-in?callbackUrl=/place-order");
	}

	const cart = await getMyCart();

	if (!cart || cart.items.length === 0) {
		redirect("/cart");
	}

	const user = await getUserCheckoutInfo(userId);
	const addressResult = shippingAddressSchema.safeParse(user?.address ?? {});

	if (!addressResult.success) {
		redirect("/shipping-address");
	}

	if (!user?.paymentMethod) {
		redirect("/payment-method");
	}

	const address = addressResult.data;

	return (
		<section className="space-y-6">
			<CheckoutSteps currentStep="place-order" />

			<Link
				href="/payment-method"
				className="inline-flex items-center gap-2 font-semibold text-muted-foreground hover:text-foreground"
			>
				<ArrowLeft className="size-4" />
				Back to payment
			</Link>

			<div className="space-y-2">
				<h1 className="h1-bold">Place Order</h1>
				<p className="text-base font-medium leading-7 text-muted-foreground">
					Review your order before it is created.
				</p>
			</div>

			<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
				<div className="space-y-5">
					<Card className="rounded-lg">
						<CardHeader className="flex-row items-center justify-between gap-4">
							<CardTitle>Shipping Address</CardTitle>
							<Button variant="outline" size="sm" asChild>
								<Link href="/shipping-address">Edit</Link>
							</Button>
						</CardHeader>
						<CardContent className="space-y-1 text-sm font-medium text-muted-foreground">
							<p className="font-bold text-foreground">
								{address.fullName}
							</p>
							<p>
								{address.streetAddress}, {address.city},{" "}
								{address.province} {address.postalCode}
							</p>
							<p>{address.country}</p>
						</CardContent>
					</Card>

					<Card className="rounded-lg">
						<CardHeader className="flex-row items-center justify-between gap-4">
							<CardTitle>Payment Method</CardTitle>
							<Button variant="outline" size="sm" asChild>
								<Link href="/payment-method">Edit</Link>
							</Button>
						</CardHeader>
						<CardContent>
							<Badge variant="secondary">
								{user.paymentMethod}
							</Badge>
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
									{cart.items.map((item) => (
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
									{formatCurrency(cart.itemsPrice)}
								</span>
							</div>
							<div className="flex justify-between gap-4">
								<span className="font-medium text-muted-foreground">
									Shipping
								</span>
								<span className="font-bold">
									{formatCurrency(cart.shippingPrice)}
								</span>
							</div>
							<div className="flex justify-between gap-4">
								<span className="font-medium text-muted-foreground">
									Tax
								</span>
								<span className="font-bold">
									{formatCurrency(cart.taxPrice)}
								</span>
							</div>
						</div>
						<div className="flex justify-between border-t pt-4 text-lg font-black">
							<span>Total</span>
							<span className="text-primary">
								{formatCurrency(cart.totalPrice)}
							</span>
						</div>
						<PlaceOrderForm />
					</CardContent>
				</Card>
			</div>
		</section>
	);
}

export default PlaceOrderPage;
