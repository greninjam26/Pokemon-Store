import { z } from "zod";

import {
	MAX_ORDER_HISTORY_PAGE_SIZE,
	MIN_ORDER_HISTORY_PAGE_SIZE,
} from "@/lib/constant";

const optionalPasswordSchema = z
	.string()
	.trim()
	.optional()
	.transform((value) => (value && value.length > 0 ? value : undefined));

export const signInFormSchema = z.object({
	email: z.email("Invalid email address"),
	password: z
		.string()
		.trim()
		.min(6, "password must be at least 6 characters"),
	callbackUrl: z.string().trim().default("/"),
});

export const signUpFormSchema = z
	.object({
		name: z.string().trim().min(3, "Name must be at least 3 characters"),
		email: z.email("Invalid email address"),
		password: z
			.string()
			.trim()
			.min(6, "Password must be at least 6 characters"),
		confirmPassword: z
			.string()
			.trim()
			.min(6, "Confirm password must be at least 6 characters"),
		callbackUrl: z.string().trim().default("/"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export const userProfileSchema = z
	.object({
		name: z.string().trim().min(3, "Name must be at least 3 characters"),
		orderHistoryPageSize: z
			.number()
			.int("Orders per page must be a whole number")
			.min(
				MIN_ORDER_HISTORY_PAGE_SIZE,
				`Orders per page must be at least ${MIN_ORDER_HISTORY_PAGE_SIZE}`,
			)
			.max(
				MAX_ORDER_HISTORY_PAGE_SIZE,
				`Orders per page cannot be more than ${MAX_ORDER_HISTORY_PAGE_SIZE}`,
			),
		currentPassword: optionalPasswordSchema,
		password: optionalPasswordSchema,
		confirmPassword: optionalPasswordSchema,
	})
	.superRefine((data, context) => {
		if (!data.password) {
			return;
		}

		if (data.password.length < 6) {
			context.addIssue({
				code: "custom",
				path: ["password"],
				message: "Password must be at least 6 characters",
			});
		}

		if (!data.currentPassword) {
			context.addIssue({
				code: "custom",
				path: ["currentPassword"],
				message: "Current password is required",
			});
		} else if (data.currentPassword.length < 6) {
			context.addIssue({
				code: "custom",
				path: ["currentPassword"],
				message: "Current password must be at least 6 characters",
			});
		}

		if (data.password !== data.confirmPassword) {
			context.addIssue({
				code: "custom",
				path: ["confirmPassword"],
				message: "Passwords do not match",
			});
		}
	});
