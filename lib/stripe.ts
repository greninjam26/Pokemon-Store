import Stripe from "stripe";

import { STRIPE_CURRENCY_CODE } from "./constant";

const globalForStripe = globalThis as unknown as {
	stripe?: Stripe;
};

function getStripeSecretKey() {
	const secretKey = process.env.STRIPE_SECRET_KEY;

	if (!secretKey) {
		throw new Error("Missing Stripe secret key");
	}

	return secretKey;
}

export function getStripePublishableKey() {
	return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
}

export function getStripeWebhookSecret() {
	const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

	if (!webhookSecret) {
		throw new Error("Missing Stripe webhook secret");
	}

	return webhookSecret;
}

export function getStripeClient() {
	const stripe =
		globalForStripe.stripe ??
		new Stripe(getStripeSecretKey(), {
			appInfo: {
				name: "Pokemon Store",
			},
		});

	if (process.env.NODE_ENV !== "production") {
		globalForStripe.stripe = stripe;
	}

	return stripe;
}

export function toStripeAmount(value: number) {
	return Math.round(value * 100);
}

export function fromStripeAmount(value: number) {
	return value / 100;
}

export async function createStripePaymentIntent({
	amount,
	orderId,
	userId,
}: {
	amount: number;
	orderId: string;
	userId: string;
}) {
	return getStripeClient().paymentIntents.create({
		amount: toStripeAmount(amount),
		currency: STRIPE_CURRENCY_CODE,
		metadata: {
			orderId,
			userId,
		},
		payment_method_types: ["card"],
	});
}

export async function getStripePaymentIntent(paymentIntentId: string) {
	return getStripeClient().paymentIntents.retrieve(paymentIntentId);
}
