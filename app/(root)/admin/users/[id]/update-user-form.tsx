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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { USER_ROLES } from "@/lib/constant";
import { updateUser } from "@/lib/action/user.actions";
import { adminUpdateUserSchema } from "@/lib/validators";

type UpdateUserFormValues = z.infer<typeof adminUpdateUserSchema>;

type UpdateUserFormProps = Readonly<{
	user: {
		id: string;
		name: string;
		email: string | null;
		role: UpdateUserFormValues["role"];
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
								Review account details and manage access level.
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
							<FormItem>
								<FormLabel>Name</FormLabel>
								<Input
									value={
										getDisplayName(user.name) || "No name"
									}
									disabled
									readOnly
								/>
							</FormItem>

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
										<Select
											value={field.value}
											onValueChange={field.onChange}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select role" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{USER_ROLES.map((role) => (
													<SelectItem
														key={role}
														value={role}
													>
														{role}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
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
