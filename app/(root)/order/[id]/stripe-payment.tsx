"use client";

import {
	Elements,
	PaymentElement,
	useElements,
	useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { CreditCard, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	approveStripePayment,
	createStripePaymentIntent,
} from "@/lib/action/order.action";

type StripePaymentProps = Readonly<{
	orderId: string;
	stripePublishableKey: string;
}>;

type StripeCheckoutFormProps = Readonly<{
	orderId: string;
}>;

function StripeCheckoutForm({ orderId }: StripeCheckoutFormProps) {
	const router = useRouter();
	const stripe = useStripe();
	const elements = useElements();
	const [isPending, setIsPending] = useState(false);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (!stripe || !elements) {
			return;
		}

		setIsPending(true);

		const { error, paymentIntent } = await stripe.confirmPayment({
			elements,
			redirect: "if_required",
		});

		if (error) {
			toast.error(error.message || "Stripe payment failed");
			setIsPending(false);
			return;
		}

		if (!paymentIntent || paymentIntent.status !== "succeeded") {
			toast.error("Stripe payment was not completed");
			setIsPending(false);
			return;
		}

		const response = await approveStripePayment(orderId, paymentIntent.id);

		if (!response.success) {
			toast.error(response.message);
			setIsPending(false);
			return;
		}

		toast.success(response.message);
		router.refresh();
		setIsPending(false);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="rounded-lg border bg-background p-4">
				<PaymentElement />
			</div>
			<Button
				type="submit"
				size="lg"
				className="w-full"
				disabled={!stripe || !elements || isPending}
			>
				{isPending ? (
					<Loader2 className="size-4 animate-spin" />
				) : (
					<CreditCard className="size-4" />
				)}
				{isPending ? "Processing payment..." : "Pay with Card"}
			</Button>
		</form>
	);
}

function StripePayment({ orderId, stripePublishableKey }: StripePaymentProps) {
	const [clientSecret, setClientSecret] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const stripePromise = useMemo(
		() =>
			stripePublishableKey
				? loadStripe(stripePublishableKey)
				: Promise.resolve(null),
		[stripePublishableKey],
	);
	const requestedClientSecret = useRef(false);

	useEffect(() => {
		if (!stripePublishableKey || requestedClientSecret.current) {
			setIsLoading(false);
			return;
		}

		requestedClientSecret.current = true;

		async function loadClientSecret() {
			const response = await createStripePaymentIntent(orderId);

			if (!response.success || !response.data) {
				setErrorMessage(response.message);
				toast.error(response.message);
				setIsLoading(false);
				return;
			}

			setClientSecret(response.data);
			setIsLoading(false);
		}

		void loadClientSecret();
	}, [orderId, stripePublishableKey]);

	if (!stripePublishableKey) {
		return (
			<div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
				Stripe publishable key is missing.
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="flex items-center gap-2 rounded-lg border bg-muted/40 p-4 text-sm font-semibold text-muted-foreground">
				<Loader2 className="size-4 animate-spin" />
				Loading card payment...
			</div>
		);
	}

	if (errorMessage || !clientSecret) {
		return (
			<div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
				{errorMessage || "Stripe payment could not be loaded."}
			</div>
		);
	}

	return (
		<div className="space-y-3 border-t pt-5">
			<p className="text-sm font-bold">Pay with Card</p>
			<Elements
				stripe={stripePromise}
				options={{
					clientSecret,
					appearance: {
						theme: "night",
						variables: {
							borderRadius: "8px",
							colorPrimary: "#60a5fa",
						},
					},
				}}
			>
				<StripeCheckoutForm orderId={orderId} />
			</Elements>
		</div>
	);
}

export default StripePayment;
