import { Resend } from "resend";

import prisma from "@/db/prisma";
import { APP_NAME, SERVER_URL } from "@/lib/constant";
import { decimalToNumber, formatCurrency, formatId } from "@/lib/utils";

const globalForResend = globalThis as unknown as {
	resend?: Resend;
};

function getResendClient() {
	const apiKey = process.env.RESEND_API_KEY;

	if (!apiKey) {
		return null;
	}

	const resend = globalForResend.resend ?? new Resend(apiKey);

	if (process.env.NODE_ENV !== "production") {
		globalForResend.resend = resend;
	}

	return resend;
}

function getSenderEmail() {
	return process.env.SENDER_EMAIL || "";
}

function escapeHtml(value: string) {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#039;");
}

function formatAddress(value: unknown) {
	if (typeof value !== "object" || value === null) {
		return "";
	}

	const address = value as Record<string, unknown>;
	const lines = [
		address.fullName,
		[
			address.streetAddress,
			address.city,
			address.province,
			address.postalCode,
		]
			.filter(Boolean)
			.join(", "),
		address.country,
	]
		.filter((part): part is string => typeof part === "string" && !!part)
		.map(escapeHtml);

	return lines.join("<br />");
}

function getReceiptText({
	orderId,
	orderUrl,
	paymentMethod,
	total,
}: {
	orderId: string;
	orderUrl: string;
	paymentMethod: string;
	total: string;
}) {
	return [
		`Thanks for your order from ${APP_NAME}.`,
		`Order: ${formatId(orderId)}`,
		`Payment method: ${paymentMethod}`,
		`Total paid: ${total}`,
		`View your order: ${orderUrl}`,
	].join("\n");
}

export async function sendOrderReceiptEmail(orderId: string) {
	const resend = getResendClient();
	const from = getSenderEmail();

	if (!resend || !from) {
		console.warn("Order receipt email skipped: missing Resend config");
		return;
	}

	const order = await prisma.order.findUnique({
		where: { id: orderId },
		include: {
			orderItems: true,
			user: {
				select: {
					email: true,
					name: true,
				},
			},
		},
	});

	if (!order?.user.email) {
		console.warn("Order receipt email skipped: order user has no email");
		return;
	}

	const orderUrl = `${SERVER_URL}/order/${order.id}`;
	const itemsPrice = formatCurrency(decimalToNumber(order.itemsPrice));
	const shippingPrice = formatCurrency(decimalToNumber(order.shippingPrice));
	const taxPrice = formatCurrency(decimalToNumber(order.taxPrice));
	const totalPrice = formatCurrency(decimalToNumber(order.totalPrice));
	const customerName =
		order.user.name && order.user.name !== "NO_NAME"
			? order.user.name
			: "Trainer";
	const itemRows = order.orderItems
		.map((item) => {
			const price = decimalToNumber(item.price);
			const subtotal = price * item.qty;

			return `
				<tr>
					<td style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
						<strong>${escapeHtml(item.name)}</strong>
						<div style="color:#64748b;font-size:13px;">Qty ${item.qty}</div>
					</td>
					<td style="padding:12px 0;border-bottom:1px solid #e5e7eb;text-align:right;">
						${formatCurrency(subtotal)}
					</td>
				</tr>
			`;
		})
		.join("");

	await resend.emails.send({
		from,
		to: order.user.email,
		subject: `${APP_NAME} receipt ${formatId(order.id)}`,
		text: getReceiptText({
			orderId: order.id,
			orderUrl,
			paymentMethod: order.paymentMethod,
			total: totalPrice,
		}),
		html: `
			<div style="margin:0;background:#f8fafc;padding:32px 16px;font-family:Arial,sans-serif;color:#0f172a;">
				<div style="margin:0 auto;max-width:640px;border-radius:12px;background:#ffffff;padding:28px;border:1px solid #e5e7eb;">
					<h1 style="margin:0 0 12px;font-size:24px;">Thanks for your order, ${escapeHtml(customerName)}.</h1>
					<p style="margin:0 0 24px;color:#475569;line-height:1.6;">
						Your payment was received. Keep this receipt for your records.
					</p>

					<div style="margin-bottom:24px;border-radius:10px;background:#eff6ff;padding:16px;">
						<div style="font-size:13px;color:#475569;">Order</div>
						<div style="font-size:20px;font-weight:700;">${formatId(order.id)}</div>
						<div style="margin-top:8px;color:#475569;">${escapeHtml(order.paymentMethod)}</div>
					</div>

					<table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
						<tbody>${itemRows}</tbody>
					</table>

					<table style="width:100%;border-collapse:collapse;margin-bottom:24px;color:#334155;">
						<tr>
							<td style="padding:4px 0;">Items</td>
							<td style="padding:4px 0;text-align:right;">${itemsPrice}</td>
						</tr>
						<tr>
							<td style="padding:4px 0;">Shipping</td>
							<td style="padding:4px 0;text-align:right;">${shippingPrice}</td>
						</tr>
						<tr>
							<td style="padding:4px 0;">Tax</td>
							<td style="padding:4px 0;text-align:right;">${taxPrice}</td>
						</tr>
						<tr>
							<td style="padding:12px 0 0;font-size:18px;font-weight:700;">Total paid</td>
							<td style="padding:12px 0 0;text-align:right;font-size:18px;font-weight:700;">${totalPrice}</td>
						</tr>
					</table>

					<div style="margin-bottom:24px;color:#475569;line-height:1.6;">
						<div style="font-weight:700;color:#0f172a;">Shipping to</div>
						${formatAddress(order.shippingAddress)}
					</div>

					<a href="${orderUrl}" style="display:inline-block;border-radius:8px;background:#2563eb;padding:12px 18px;color:#ffffff;text-decoration:none;font-weight:700;">
						View order
					</a>
				</div>
			</div>
		`,
	});
}
