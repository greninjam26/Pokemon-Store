import { z } from "zod";

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
