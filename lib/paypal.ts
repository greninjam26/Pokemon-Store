import type { PayPalCaptureResponse } from "@/types";

import { PAYPAL_CURRENCY_CODE } from "./constant";

const PAYPAL_API_URL =
	process.env.PAYPAL_API_URL || "https://api-m.sandbox.paypal.com";

type PayPalAccessTokenResponse = {
	access_token?: string;
	error?: string;
	error_description?: string;
};

type PayPalApiError = {
	name?: string;
	message?: string;
	details?: { issue?: string; description?: string }[];
};

function getPayPalCredentials() {
	const clientId = process.env.PAYPAL_CLIENT_ID;
	const clientSecret = process.env.PAYPAL_APP_SECRET;

	if (!clientId || !clientSecret) {
		throw new Error("Missing PayPal credentials");
	}

	return { clientId, clientSecret };
}

async function parsePayPalResponse<T>(response: Response) {
	const data = (await response.json()) as T & PayPalApiError;

	if (!response.ok) {
		const detail = data.details?.[0]?.description || data.message;
		throw new Error(detail || "PayPal request failed");
	}

	return data;
}

async function getPayPalAccessToken() {
	const { clientId, clientSecret } = getPayPalCredentials();
	const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

	const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
		method: "POST",
		headers: {
			Authorization: `Basic ${auth}`,
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: "grant_type=client_credentials",
	});

	const data = await parsePayPalResponse<PayPalAccessTokenResponse>(response);

	if (!data.access_token) {
		throw new Error(data.error_description || "Unable to get PayPal token");
	}

	return data.access_token;
}

export async function createPayPalOrder(totalPrice: number) {
	const accessToken = await getPayPalAccessToken();

	const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			intent: "CAPTURE",
			purchase_units: [
				{
					amount: {
						currency_code: PAYPAL_CURRENCY_CODE,
						value: totalPrice.toFixed(2),
					},
				},
			],
		}),
	});

	return parsePayPalResponse<{ id: string; status: string }>(response);
}

export async function capturePayPalOrder(paypalOrderId: string) {
	const accessToken = await getPayPalAccessToken();

	const response = await fetch(
		`${PAYPAL_API_URL}/v2/checkout/orders/${paypalOrderId}/capture`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
			},
		},
	);

	return parsePayPalResponse<PayPalCaptureResponse>(response);
}
