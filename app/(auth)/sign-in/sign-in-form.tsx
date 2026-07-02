"use client";

import { LogIn } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInWithCredentials } from "@/lib/action/user.actions";

const initialState = {
	success: false,
	message: "",
};

function SubmitButton() {
	const { pending } = useFormStatus();

	return (
		<Button className="h-10 w-full gap-2" disabled={pending} type="submit">
			<LogIn className="size-4" />
			{pending ? "Signing in..." : "Sign in"}
		</Button>
	);
}

function SignInForm() {
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get("callbackUrl") || "/";
	const [state, formAction] = useActionState(
		signInWithCredentials,
		initialState,
	);

	return (
		<form action={formAction} className="space-y-4">
			<input type="hidden" name="callbackUrl" value={callbackUrl} />

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
					autoComplete="current-password"
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
				Don&apos;t have an account?{" "}
				<Link
					href="/sign-up"
					className="font-medium text-primary hover:underline"
				>
					Sign Up
				</Link>
			</p>
		</form>
	);
}

export default SignInForm;
