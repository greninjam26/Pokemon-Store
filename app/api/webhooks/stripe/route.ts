import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { markStripeOrderPaid } from "@/lib/action/order.action";
import { getStripeClient, getStripeWebhookSecret } from "@/lib/stripe";

export const runtime = "nodejs";

function getPaymentIntentFromEvent(event: Stripe.Event) {
	if (event.type !== "payment_intent.succeeded") {
		return null;
	}

	return event.data.object as Stripe.PaymentIntent;
}

export async function POST(req: NextRequest) {
	const signature = req.headers.get("stripe-signature");

	if (!signature) {
		return NextResponse.json(
			{ message: "Missing Stripe signature" },
			{ status: 400 },
		);
	}

	let event: Stripe.Event;

	try {
		event = getStripeClient().webhooks.constructEvent(
			await req.text(),
			signature,
			getStripeWebhookSecret(),
		);
	} catch (error) {
		return NextResponse.json(
			{
				message:
					error instanceof Error
						? error.message
						: "Invalid Stripe webhook",
			},
			{ status: 400 },
		);
	}

	const paymentIntent = getPaymentIntentFromEvent(event);

	if (!paymentIntent) {
		return NextResponse.json({
			message: `Ignored Stripe event: ${event.type}`,
		});
	}

	const { orderId, userId } = paymentIntent.metadata;

	if (!orderId || !userId) {
		return NextResponse.json(
			{ message: "Stripe payment is missing order metadata" },
			{ status: 400 },
		);
	}

	try {
		const result = await markStripeOrderPaid({
			orderId,
			paymentIntentId: paymentIntent.id,
			userId,
		});

		return NextResponse.json({
			message: result.alreadyPaid
				? "Order was already paid"
				: "Order marked paid",
		});
	} catch (error) {
		return NextResponse.json(
			{
				message:
					error instanceof Error
						? error.message
						: "Unable to update order from Stripe webhook",
			},
			{ status: 400 },
		);
	}
}
