"use client";

import { CheckCircle2, Loader2, PackageCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { deliverOrder, updateOrderToPaidCOD } from "@/lib/action/order.action";

type AdminOrderActionsProps = Readonly<{
	orderId: string;
	canMarkPaid: boolean;
	canMarkDelivered: boolean;
}>;

function AdminOrderActions({
	orderId,
	canMarkPaid,
	canMarkDelivered,
}: AdminOrderActionsProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	function runAction(
		action: () => Promise<{ success: boolean; message: string }>,
	) {
		startTransition(async () => {
			const response = await action();

			if (!response.success) {
				toast.error(response.message);
				return;
			}

			toast.success(response.message);
			router.refresh();
		});
	}

	if (!canMarkPaid && !canMarkDelivered) {
		return null;
	}

	return (
		<div className="flex flex-wrap gap-2">
			{canMarkPaid ? (
				<Button
					type="button"
					disabled={isPending}
					onClick={() =>
						runAction(() => updateOrderToPaidCOD(orderId))
					}
				>
					{isPending ? (
						<Loader2 className="animate-spin" />
					) : (
						<CheckCircle2 />
					)}
					Mark As Paid
				</Button>
			) : null}

			{canMarkDelivered ? (
				<Button
					type="button"
					disabled={isPending}
					onClick={() => runAction(() => deliverOrder(orderId))}
				>
					{isPending ? (
						<Loader2 className="animate-spin" />
					) : (
						<PackageCheck />
					)}
					Mark As Delivered
				</Button>
			) : null}
		</div>
	);
}

export default AdminOrderActions;
