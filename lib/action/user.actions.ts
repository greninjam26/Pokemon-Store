"use server";

import { compareSync, hashSync } from "bcrypt-ts-edge";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";

import { auth, signIn, signOut, updateSession } from "@/auth";
import prisma from "@/db/prisma";
import { formatError } from "@/lib/utils";
import {
	paymentMethodSchema,
	shippingAddressSchema,
	signInFormSchema,
	signUpFormSchema,
	userProfileSchema,
} from "@/lib/validators";
import type { PaymentMethod, ShippingAddress, UserProfile } from "@/types";

type ActionResponse = {
	success: boolean;
	message: string;
};

export async function getUserProfile() {
	const session = await auth();
	const userId = (session?.user as { id?: string } | undefined)?.id;

	if (!userId) {
		redirect("/sign-in?callbackUrl=/account/profile");
	}

	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			name: true,
			email: true,
			orderHistoryPageSize: true,
		},
	});

	if (!user) {
		redirect("/sign-in?callbackUrl=/account/profile");
	}

	return {
		name: user.name === "NO_NAME" ? "" : user.name,
		email: user.email ?? "",
		orderHistoryPageSize: user.orderHistoryPageSize,
	};
}

export async function getUserCheckoutInfo(userId: string) {
	return prisma.user.findUnique({
		where: { id: userId },
		select: {
			address: true,
			paymentMethod: true,
		},
	});
}

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

export async function updateUserAddress(
	data: ShippingAddress,
): Promise<ActionResponse> {
	try {
		const session = await auth();
		const userId = (session?.user as { id?: string } | undefined)?.id;

		if (!userId) {
			redirect("/sign-in?callbackUrl=/shipping-address");
		}

		const address = shippingAddressSchema.parse(data);

		await prisma.user.update({
			where: { id: userId },
			data: { address },
		});

		return {
			success: true,
			message: "Shipping address saved",
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

export async function updateUserPaymentMethod(
	data: PaymentMethod,
): Promise<ActionResponse> {
	try {
		const session = await auth();
		const userId = (session?.user as { id?: string } | undefined)?.id;

		if (!userId) {
			redirect("/sign-in?callbackUrl=/payment-method");
		}

		const paymentMethod = paymentMethodSchema.parse(data);

		await prisma.user.update({
			where: { id: userId },
			data: { paymentMethod: paymentMethod.type },
		});

		return {
			success: true,
			message: "Payment method saved",
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

export async function updateUserProfile(
	data: UserProfile,
): Promise<ActionResponse> {
	try {
		const session = await auth();
		const userId = (session?.user as { id?: string } | undefined)?.id;

		if (!userId) {
			redirect("/sign-in?callbackUrl=/account/profile");
		}

		const profile = userProfileSchema.parse(data);
		const currentUser = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				email: true,
				password: true,
			},
		});

		if (!currentUser) {
			return {
				success: false,
				message: "User not found",
			};
		}

		const updateData: {
			name: string;
			orderHistoryPageSize: number;
			password?: string;
		} = {
			name: profile.name,
			orderHistoryPageSize: profile.orderHistoryPageSize,
		};

		if (profile.password) {
			if (
				!profile.currentPassword ||
				!currentUser.password ||
				!compareSync(profile.currentPassword, currentUser.password)
			) {
				return {
					success: false,
					message: "Current password is incorrect",
				};
			}

			updateData.password = hashSync(profile.password, 10);
		}

		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: updateData,
			select: {
				name: true,
				email: true,
			},
		});

		await updateSession({
			user: {
				name: updatedUser.name,
				email: updatedUser.email ?? undefined,
			},
		});

		return {
			success: true,
			message: "Profile updated",
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
