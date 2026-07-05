"use client";

import {
	PayPalButtons,
	PayPalScriptProvider,
	usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
	approvePayPalOrder,
	createPayPalOrder,
} from "@/lib/action/order.action";

type PayPalPaymentProps = Readonly<{
	orderId: string;
	paypalClientId: string;
	currencyCode: string;
}>;

type PayPalApproveData = {
	orderID: string;
};

function PayPalLoadingState() {
	const [{ isPending, isRejected }] = usePayPalScriptReducer();

	if (isPending) {
		return (
			<div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-600">
				<Loader2 className="size-4 animate-spin" />
				Loading PayPal...
			</div>
		);
	}

	if (isRejected) {
		return (
			<div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
				PayPal could not load. Refresh the page and try again.
			</div>
		);
	}

	return null;
}

function PayPalCheckoutButtons({ orderId }: Pick<PayPalPaymentProps, "orderId">) {
	const router = useRouter();

	return (
		<PayPalButtons
			style={{
				layout: "vertical",
				color: "gold",
				shape: "rect",
				label: "paypal",
				disableMaxWidth: true,
			}}
			createOrder={async () => {
				const response = await createPayPalOrder(orderId);

				if (!response.success || !response.data) {
					toast.error(response.message);
					throw new Error(response.message);
				}

				return response.data;
			}}
			onApprove={async (data) => {
				const response = await approvePayPalOrder(orderId, {
					orderID: (data as PayPalApproveData).orderID,
				});

				if (!response.success) {
					toast.error(response.message);
					return;
				}

				toast.success(response.message);
				router.refresh();
			}}
			onError={(error) => {
				toast.error(
					error instanceof Error
						? error.message
						: "PayPal payment failed",
				);
			}}
		/>
	);
}

function PayPalPayment({
	orderId,
	paypalClientId,
	currencyCode,
}: PayPalPaymentProps) {
	return (
		<div className="space-y-3 border-t pt-5">
			<p className="text-sm font-bold">Pay with PayPal</p>
			<div className="overflow-hidden rounded-lg [&_iframe]:rounded-lg">
				<PayPalScriptProvider
					options={{
						clientId: paypalClientId,
						currency: currencyCode,
						components: "buttons",
						disableFunding: "paylater,card",
					}}
				>
					<PayPalLoadingState />
					<PayPalCheckoutButtons orderId={orderId} />
				</PayPalScriptProvider>
			</div>
		</div>
	);
}

export default PayPalPayment;
