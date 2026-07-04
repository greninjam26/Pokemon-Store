import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
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
import { getMyCart } from "@/lib/action/cart.action";
import { getUserCheckoutInfo } from "@/lib/action/user.actions";

import PaymentMethodForm from "./payment-method-form";

export const metadata: Metadata = {
	title: "Payment Method",
};

async function PaymentMethodPage() {
	const session = await auth();
	const userId = (session?.user as { id?: string } | undefined)?.id;

	if (!userId) {
		redirect("/sign-in?callbackUrl=/payment-method");
	}

	const cart = await getMyCart();

	if (!cart || cart.items.length === 0) {
		redirect("/cart");
	}

	const user = await getUserCheckoutInfo(userId);

	if (!user?.address) {
		redirect("/shipping-address");
	}

	return (
		<section className="mx-auto max-w-2xl space-y-6">
			<CheckoutSteps currentStep="payment" />

			<Link
				href="/shipping-address"
				className="inline-flex items-center gap-2 font-semibold text-muted-foreground hover:text-foreground"
			>
				<ArrowLeft className="size-4" />
				Back to shipping
			</Link>

			<Card className="rounded-lg">
				<CardHeader>
					<CardTitle className="text-2xl">Payment Method</CardTitle>
					<CardDescription>
						Choose how you want to pay for your Pokemon order.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<PaymentMethodForm
						preferredPaymentMethod={user.paymentMethod}
					/>
				</CardContent>
			</Card>
		</section>
	);
}

export default PaymentMethodPage;
