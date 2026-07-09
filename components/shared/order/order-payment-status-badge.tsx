import { Badge } from "@/components/ui/badge";
import { isOrderExpired } from "@/lib/order-utils";
import LocalDateTime from "../local-date-time";

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
				Paid
				{paidAt ? (
					<>
						{" at "}
						<LocalDateTime
							value={
								paidAt instanceof Date
									? paidAt.toISOString()
									: paidAt
							}
						/>
					</>
				) : null}
			</Badge>
		);
	}

	if (isOrderExpired(paymentResult)) {
		return <Badge variant="destructive">Expired</Badge>;
	}

	return <Badge variant="destructive">Not paid</Badge>;
}

export default OrderPaymentStatusBadge;
