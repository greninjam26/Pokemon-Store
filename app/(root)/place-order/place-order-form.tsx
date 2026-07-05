"use client";

import { Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createOrder } from "@/lib/action/order.action";

function PlaceOrderForm() {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		startTransition(async () => {
			const response = await createOrder();

			if (!response.success) {
				toast.error(response.message);

				if (response.redirectTo) {
					router.push(response.redirectTo);
				}

				return;
			}

			toast.success(response.message);

			if (response.redirectTo) {
				router.push(response.redirectTo);
			}
		});
	}

	return (
		<form onSubmit={handleSubmit}>
			<Button
				type="submit"
				size="lg"
				className="w-full"
				disabled={isPending}
			>
				{isPending ? (
					<Loader2 className="size-4 animate-spin" />
				) : (
					<Check className="size-4" />
				)}
				{isPending ? "Placing order..." : "Place Order"}
			</Button>
		</form>
	);
}

export default PlaceOrderForm;
