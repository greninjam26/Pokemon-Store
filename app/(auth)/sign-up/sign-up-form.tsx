"use client";

import { UserPlus } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpUser } from "@/lib/action/user.actions";

const initialState = {
	success: false,
	message: "",
};

function SubmitButton() {
	const { pending } = useFormStatus();

	return (
		<Button className="h-10 w-full gap-2" disabled={pending} type="submit">
			<UserPlus className="size-4" />
			{pending ? "Creating account..." : "Create account"}
		</Button>
	);
}

function SignUpForm() {
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get("callbackUrl") || "/";
	const [state, formAction] = useActionState(signUpUser, initialState);

	return (
		<form action={formAction} className="space-y-4">
			<input type="hidden" name="callbackUrl" value={callbackUrl} />

			<div className="space-y-2">
				<Label htmlFor="name">Name</Label>
				<Input
					id="name"
					name="name"
					type="text"
					autoComplete="name"
					required
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="email">Email</Label>
				<Input
					id="email"
					name="email"
					type="email"
					autoComplete="email"
					required
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="password">Password</Label>
				<Input
					id="password"
					name="password"
					type="password"
					autoComplete="new-password"
					required
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="confirmPassword">Confirm Password</Label>
				<Input
					id="confirmPassword"
					name="confirmPassword"
					type="password"
					autoComplete="new-password"
					required
				/>
			</div>

			{state.message && !state.success ? (
				<p className="text-sm font-medium text-destructive">
					{state.message}
				</p>
			) : null}

			<SubmitButton />

			<p className="text-center text-sm text-muted-foreground">
				Already have an account?{" "}
				<Link
					href="/sign-in"
					className="font-medium text-primary hover:underline"
				>
					Sign In
				</Link>
			</p>
		</form>
	);
}

export default SignUpForm;
