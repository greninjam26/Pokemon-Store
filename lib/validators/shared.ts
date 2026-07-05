import { z } from "zod";

export const currencySchema = z
	.union([z.string(), z.number()])
	.transform((value) =>
		typeof value === "number" ? value.toString() : value.trim(),
	)
	.refine((value) => value.length > 0, "Amount is required")
	.refine(
		(value) => /^-?\d+(\.\d{1,2})?$/.test(value),
		"Amount must be a valid number with at most two decimal places",
	)
	.transform((value) => Number(value))
	.refine((value) => value >= 0, "Amount cannot be negative");
