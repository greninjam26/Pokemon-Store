"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CreditCard, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DEFAULT_PAYMENT_METHOD, PAYMENT_METHODS } from "@/lib/constant";
import { updateUserPaymentMethod } from "@/lib/action/user.actions";
import { paymentMethodSchema } from "@/lib/validators";
import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/types";

type PaymentMethodFormProps = Readonly<{
	preferredPaymentMethod?: string | null;
}>;

function PaymentMethodForm({ preferredPaymentMethod }: PaymentMethodFormProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const form = useForm<PaymentMethod>({
		resolver: zodResolver(paymentMethodSchema),
		defaultValues: {
			type: preferredPaymentMethod || DEFAULT_PAYMENT_METHOD,
		},
	});

	function onSubmit(values: PaymentMethod) {
		startTransition(async () => {
			const response = await updateUserPaymentMethod(values);

			if (!response.success) {
				toast.error(response.message);
				return;
			}

			toast.success(response.message);
			router.push("/place-order");
		});
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
				<FormField
					control={form.control}
					name="type"
					render={({ field }) => (
						<FormItem className="space-y-3">
							<FormControl>
								<RadioGroup
									onValueChange={field.onChange}
									value={field.value}
									className="gap-3"
								>
									{PAYMENT_METHODS.map((paymentMethod) => (
										<FormItem key={paymentMethod}>
											<FormControl>
												<label
													className={cn(
														"flex cursor-pointer items-center gap-3 rounded-lg border bg-card p-4 transition-colors hover:border-primary/60 hover:bg-muted/60",
														field.value ===
															paymentMethod &&
															"border-primary bg-primary/5",
													)}
												>
													<RadioGroupItem
														value={paymentMethod}
													/>
													<CreditCard className="size-4 text-primary" />
													<span className="font-semibold">
														{paymentMethod}
													</span>
												</label>
											</FormControl>
										</FormItem>
									))}
								</RadioGroup>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button
					type="submit"
					size="lg"
					className="w-full"
					disabled={isPending}
				>
					{isPending ? (
						<Loader2 className="size-4 animate-spin" />
					) : (
						<ArrowRight className="size-4" />
					)}
					{isPending
						? "Saving payment..."
						: "Continue to Place Order"}
				</Button>
			</form>
		</Form>
	);
}

export default PaymentMethodForm;
