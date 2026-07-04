import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import CheckoutSteps from "@/components/shared/checkout/checkout-steps";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import prisma from "@/db/prisma";
import { getMyCart } from "@/lib/action/cart.action";
import { shippingAddressSchema } from "@/lib/validator";
import ShippingAddressForm from "./shipping-address-form";

export const metadata = {
	title: "Shipping Address",
};

async function ShippingAddressPage() {
	const session = await auth();
	const userId = (session?.user as { id?: string } | undefined)?.id;

	if (!userId) {
		redirect("/sign-in?callbackUrl=/shipping-address");
	}

	const cart = await getMyCart();

	if (!cart || cart.items.length === 0) {
		redirect("/cart");
	}

	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { address: true },
	});
	const addressResult = shippingAddressSchema
		.partial()
		.safeParse(user?.address ?? {});
	const address = addressResult.success ? addressResult.data : null;

	return (
		<section className="mx-auto max-w-2xl space-y-6">
			<CheckoutSteps currentStep="shipping" />

			<Link
				href="/cart"
				className="inline-flex items-center gap-2 font-semibold text-muted-foreground hover:text-foreground"
			>
				<ArrowLeft className="size-4" />
				Back to cart
			</Link>

			<Card className="rounded-lg">
				<CardHeader>
					<CardTitle className="text-2xl">Shipping Address</CardTitle>
					<CardDescription>
						Enter the address where your Pokemon order should be
						delivered.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ShippingAddressForm address={address} />
				</CardContent>
			</Card>
		</section>
	);
}

export default ShippingAddressPage;
