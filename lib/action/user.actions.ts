"use server";

import { hashSync } from "bcrypt-ts-edge";
import { isRedirectError } from "next/dist/client/components/redirect-error";

import { signIn, signOut } from "@/auth";
import prisma from "@/db/prisma";
import { formatError } from "@/lib/utils";
import { signInFormSchema, signUpFormSchema } from "@/lib/validator";

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

export async function signUpUser(
	_previousState: unknown,
	formData: FormData,
): Promise<ActionResponse> {
	try {
		const user = signUpFormSchema.parse({
			name: formData.get("name"),
			email: formData.get("email"),
			password: formData.get("password"),
			confirmPassword: formData.get("confirmPassword"),
			callbackUrl: formData.get("callbackUrl") || "/",
		});

		const existingUser = await prisma.user.findUnique({
			where: {
				email: user.email,
			},
		});

		if (existingUser) {
			return {
				success: false,
				message: "User already exists",
			};
		}

		await prisma.user.create({
			data: {
				name: user.name,
				email: user.email,
				password: hashSync(user.password, 10),
			},
		});

		await signIn("credentials", {
			email: user.email,
			password: user.password,
			redirectTo: user.callbackUrl,
		});

		return {
			success: true,
			message: "User registered successfully",
		};
	} catch (error) {
		if (isRedirectError(error)) {
			throw error;
		}

		return {
			success: false,
			message: formatError(error),
		};
	}
}
