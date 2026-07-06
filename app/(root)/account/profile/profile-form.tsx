"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { updateUserProfile } from "@/lib/action/user.actions";
import {
	MAX_ORDER_HISTORY_PAGE_SIZE,
	MIN_ORDER_HISTORY_PAGE_SIZE,
} from "@/lib/constant";
import { userProfileSchema } from "@/lib/validators";
import type { UserProfile } from "@/types";

type UserProfileInput = z.input<typeof userProfileSchema>;

type ProfileFormProps = Readonly<{
	user: Pick<UserProfile, "name" | "orderHistoryPageSize"> & {
		email: string;
	};
}>;

function ProfileForm({ user }: ProfileFormProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const form = useForm<UserProfileInput, unknown, UserProfile>({
		resolver: zodResolver(userProfileSchema),
		defaultValues: {
			name: user.name,
			orderHistoryPageSize: user.orderHistoryPageSize,
			currentPassword: "",
			password: "",
			confirmPassword: "",
		},
	});

	function onSubmit(values: UserProfile) {
		startTransition(async () => {
			const response = await updateUserProfile(values);

			if (!response.success) {
				toast.error(response.message);
				return;
			}

			toast.success(response.message);
			form.reset({
				name: values.name,
				orderHistoryPageSize: values.orderHistoryPageSize,
				currentPassword: "",
				password: "",
				confirmPassword: "",
			});
			router.refresh();
		});
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<div className="grid gap-5 sm:grid-cols-2">
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Name</FormLabel>
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

					<FormItem>
						<FormLabel>Email</FormLabel>
						<FormControl>
							<Input
								type="email"
								value={user.email}
								disabled
								readOnly
							/>
						</FormControl>
					</FormItem>

					<FormField
						control={form.control}
						name="orderHistoryPageSize"
						render={({ field }) => (
							<FormItem className="sm:col-span-2">
								<FormLabel>Orders Per Page</FormLabel>
								<FormControl>
									<Input
										type="number"
										min={MIN_ORDER_HISTORY_PAGE_SIZE}
										max={MAX_ORDER_HISTORY_PAGE_SIZE}
										inputMode="numeric"
										value={field.value}
										onBlur={field.onBlur}
										name={field.name}
										ref={field.ref}
										onChange={(event) =>
											field.onChange(
												event.currentTarget
													.valueAsNumber,
											)
										}
									/>
								</FormControl>
								<FormDescription>
									Choose how many orders appear on each order
									history page.
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<div className="space-y-4 rounded-lg border bg-muted/30 p-4">
					<div className="space-y-1">
						<h2 className="text-base font-bold">Change Password</h2>
						<p className="text-sm font-medium leading-6 text-muted-foreground">
							Leave these fields blank to keep your current
							password.
						</p>
					</div>

					<div className="grid gap-5 sm:grid-cols-2">
						<FormField
							control={form.control}
							name="currentPassword"
							render={({ field }) => (
								<FormItem className="sm:col-span-2">
									<FormLabel>Current Password</FormLabel>
									<FormControl>
										<Input
											type="password"
											autoComplete="current-password"
											value={field.value ?? ""}
											onChange={field.onChange}
											onBlur={field.onBlur}
											name={field.name}
											ref={field.ref}
										/>
									</FormControl>
									<FormDescription>
										Required only when setting a new
										password.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>New Password</FormLabel>
									<FormControl>
										<Input
											type="password"
											autoComplete="new-password"
											value={field.value ?? ""}
											onChange={field.onChange}
											onBlur={field.onBlur}
											name={field.name}
											ref={field.ref}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="confirmPassword"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Confirm Password</FormLabel>
									<FormControl>
										<Input
											type="password"
											autoComplete="new-password"
											value={field.value ?? ""}
											onChange={field.onChange}
											onBlur={field.onBlur}
											name={field.name}
											ref={field.ref}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
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
						<Save className="size-4" />
					)}
					{isPending ? "Saving profile..." : "Save Profile"}
				</Button>
			</form>
		</Form>
	);
}

export default ProfileForm;
