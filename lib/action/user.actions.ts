"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";

import { signIn, signOut } from "@/auth";
import { signInFormSchema } from "@/lib/validator";

type ActionResponse = {
	success: boolean;
	message: string;
};

export async function signInWithCredentials(
	_previousState: unknown,
	formData: FormData,
): Promise<ActionResponse> {
	try {
		const user = signInFormSchema.parse({
			email: formData.get("email"),
			password: formData.get("password"),
			callbackUrl: formData.get("callbackUrl") || "/",
		});

		await signIn("credentials", {
			email: user.email,
			password: user.password,
			redirectTo: user.callbackUrl,
		});

		return {
			success: true,
			message: "Signed in successfully",
		};
	} catch (error) {
		if (isRedirectError(error)) {
			throw error;
		}

		return {
			success: false,
			message: "Invalid email or password",
		};
	}
}

export async function signOutUser() {
	await signOut({ redirectTo: "/" });
}
