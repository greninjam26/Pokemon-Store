"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { USER_ROLES } from "@/lib/constant";
import { updateUser } from "@/lib/action/user.actions";
import { cn } from "@/lib/utils";
import { adminUpdateUserSchema } from "@/lib/validators";

type UpdateUserFormValues = z.infer<typeof adminUpdateUserSchema>;

type UpdateUserFormProps = Readonly<{
	user: UpdateUserFormValues & {
		email: string | null;
		orderCount: number;
	};
}>;

function getDisplayName(name: string) {
	return name === "NO_NAME" ? "" : name;
}

function UpdateUserForm({ user }: UpdateUserFormProps) {
	const router = useRouter();
	const form = useForm<UpdateUserFormValues>({
		resolver: zodResolver(adminUpdateUserSchema),
		defaultValues: {
			id: user.id,
			name: getDisplayName(user.name),
			role: user.role,
		},
	});

	async function onSubmit(values: UpdateUserFormValues) {
		const response = await updateUser(values);

		if (!response.success) {
			toast.error(response.message);
			return;
		}

		toast.success(response.message);
		router.push("/admin/users");
		router.refresh();
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<Card className="rounded-lg">
					<CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<CardTitle>Update User</CardTitle>
							<p className="text-sm font-medium text-muted-foreground">
								Edit account display details and access level.
							</p>
						</div>
						<Button
							type="button"
							variant="outline"
							onClick={() => router.push("/admin/users")}
						>
							Cancel
						</Button>
					</CardHeader>
					<CardContent className="grid gap-5">
						<div className="grid gap-4 md:grid-cols-2">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Name</FormLabel>
										<FormControl>
											<Input
												placeholder="User name"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormItem>
								<FormLabel>Email</FormLabel>
								<Input
									value={user.email ?? "No email"}
									disabled
									readOnly
								/>
							</FormItem>
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							<FormField
								control={form.control}
								name="role"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Role</FormLabel>
										<FormControl>
											<select
												className={cn(
													"h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm font-medium outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
												)}
												value={field.value}
												onChange={field.onChange}
											>
												{USER_ROLES.map((role) => (
													<option
														key={role}
														value={role}
														className="bg-background text-foreground"
													>
														{role}
													</option>
												))}
											</select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormItem>
								<FormLabel>Orders</FormLabel>
								<Input
									value={`${user.orderCount} order${user.orderCount === 1 ? "" : "s"}`}
									disabled
									readOnly
								/>
							</FormItem>
						</div>
					</CardContent>
					<CardFooter className="justify-end">
						<Button
							type="submit"
							disabled={form.formState.isSubmitting}
						>
							{form.formState.isSubmitting ? (
								<Loader2 className="animate-spin" />
							) : (
								<Save />
							)}
							Update User
						</Button>
					</CardFooter>
				</Card>
			</form>
		</Form>
	);
}

export default UpdateUserForm;
