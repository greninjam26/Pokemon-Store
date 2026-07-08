import { Badge } from "@/components/ui/badge";
import { isOrderExpired } from "@/lib/order-utils";
import { formatDateTime } from "@/lib/utils";

type OrderPaymentStatusBadgeProps = Readonly<{
	isPaid: boolean;
	paymentResult: unknown;
	paidAt?: Date | string | null;
}>;

function OrderPaymentStatusBadge({
	isPaid,
	paymentResult,
	paidAt,
}: OrderPaymentStatusBadgeProps) {
	if (isPaid) {
		return (
			<Badge variant="secondary">
				Paid{paidAt ? ` at ${formatDateTime(paidAt)}` : null}
			</Badge>
		);
	}

	if (isOrderExpired(paymentResult)) {
		return <Badge variant="destructive">Expired</Badge>;
	}

	return <Badge variant="destructive">Not paid</Badge>;
}

export default OrderPaymentStatusBadge;
