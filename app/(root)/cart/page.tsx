import { ArrowLeft, ShoppingCart } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMyCart } from "@/lib/action/cart.action";
import { formatCurrency } from "@/lib/utils";
import CartTable from "./cart-table";

export const metadata: Metadata = {
	title: "Shopping Cart",
};

async function CartPage() {
	const cart = await getMyCart();
	const cartItems = cart?.items ?? [];
	const itemCount = cartItems.reduce((total, item) => total + item.qty, 0);

	if (!cart || cartItems.length === 0) {
		return (
			<section className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center gap-5 text-center">
				<div className="flex size-16 items-center justify-center rounded-full border bg-card text-primary shadow-sm">
					<ShoppingCart className="size-8" />
				</div>
				<div className="space-y-2">
					<h1 className="h2-bold">Your cart is empty</h1>
					<p className="text-base font-medium leading-7 text-muted-foreground">
						Add a few Pokemon picks and they will show up here.
					</p>
				</div>
				<Button asChild>
					<Link href="/">Continue Shopping</Link>
				</Button>
			</section>
		);
	}

	return (
		<section className="space-y-8">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div className="space-y-2">
					<Link
						href="/"
						className="inline-flex items-center gap-2 font-semibold text-muted-foreground hover:text-foreground"
					>
						<ArrowLeft className="size-4" />
						Continue shopping
					</Link>
					<h1 className="h1-bold">Shopping Cart</h1>
					<p className="text-base font-medium text-muted-foreground">
						{itemCount} {itemCount === 1 ? "item" : "items"} in your
						cart
					</p>
				</div>
			</div>

			<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
				<CartTable cart={cart} />

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
						<Button className="w-full" size="lg" asChild>
							<Link href="/shipping-address">
								Proceed to Checkout
							</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		</section>
	);
}

export default CartPage;
