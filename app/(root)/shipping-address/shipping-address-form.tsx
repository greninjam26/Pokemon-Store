"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";
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
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SHIPPING_ADDRESS_DEFAULT_VALUES } from "@/lib/constant";
import { updateUserAddress } from "@/lib/action/user.actions";
import { shippingAddressSchema } from "@/lib/validators";
import type { ShippingAddress } from "@/types";

type ShippingAddressFormProps = Readonly<{
	address?: Partial<ShippingAddress> | null;
}>;

function ShippingAddressForm({ address }: ShippingAddressFormProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const form = useForm<ShippingAddress>({
		resolver: zodResolver(shippingAddressSchema),
		defaultValues: {
			...SHIPPING_ADDRESS_DEFAULT_VALUES,
			...address,
		},
	});

	function onSubmit(values: ShippingAddress) {
		startTransition(async () => {
			const response = await updateUserAddress(values);

			if (!response.success) {
				toast.error(response.message);
				return;
			}

			toast.success(response.message);
			router.push("/payment-method");
		});
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
				<div className="grid gap-5 sm:grid-cols-2">
					<FormField
						control={form.control}
						name="fullName"
						render={({ field }) => (
							<FormItem className="sm:col-span-2">
								<FormLabel>Full Name</FormLabel>
								<FormControl>
									<Input
										autoComplete="name"
										placeholder="Ash Ketchum"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="streetAddress"
						render={({ field }) => (
							<FormItem className="sm:col-span-2">
								<FormLabel>Street Address</FormLabel>
								<FormControl>
									<Input
										autoComplete="street-address"
										placeholder="123 Route 1"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="city"
						render={({ field }) => (
							<FormItem>
								<FormLabel>City</FormLabel>
								<FormControl>
									<Input
										autoComplete="address-level2"
										placeholder="Pallet Town"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="province"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Province</FormLabel>
								<FormControl>
									<Input
										autoComplete="address-level1"
										placeholder="Ontario"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="postalCode"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Postal Code</FormLabel>
								<FormControl>
									<Input
										autoComplete="postal-code"
										placeholder="A1A 1A1"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="country"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Country</FormLabel>
								<FormControl>
									<Input
										autoComplete="country-name"
										placeholder="Canada"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

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
					{isPending ? "Saving address..." : "Continue to Payment"}
				</Button>
			</form>
		</Form>
	);
}

export default ShippingAddressForm;
