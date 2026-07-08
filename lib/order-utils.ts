import { EXPIRED_ORDER_PAYMENT_STATUS } from "@/lib/constant";

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

export function isOrderExpired(paymentResult: unknown) {
	return (
		isRecord(paymentResult) &&
		paymentResult.status === EXPIRED_ORDER_PAYMENT_STATUS
	);
}
