import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ZodError } from "zod";

const cadCurrencyFormatter = new Intl.NumberFormat("en-CA", {
	style: "currency",
	currency: "CAD",
});
const dateTimeFormatter = new Intl.DateTimeFormat("en-CA", {
	dateStyle: "medium",
	timeStyle: "short",
});

type DecimalLike = {
	toString: () => string;
};

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
	return cadCurrencyFormatter.format(value);
}

export function formatDateTime(value: Date | string) {
	return dateTimeFormatter.format(new Date(value));
}

export function formatId(id: string) {
	return `...${id.slice(-8)}`;
}

export function roundToTwoDecimals(value: number) {
	return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function decimalToNumber(value: DecimalLike) {
	return Number(value.toString());
}

export function normalizePagination({
	limit,
	page,
}: {
	limit: number;
	page: number;
}) {
	const currentPage = Math.max(1, page);
	const pageSize = Math.max(1, limit);

	return {
		currentPage,
		pageSize,
		skip: (currentPage - 1) * pageSize,
	};
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

export function formatError(error: unknown) {
	if (error instanceof ZodError) {
		return error.issues.map((issue) => issue.message).join(". ");
	}

	if (
		isRecord(error) &&
		error.name === "PrismaClientKnownRequestError" &&
		error.code === "P2002"
	) {
		return "A record with this value already exists";
	}

	if (error instanceof Error) {
		return error.message;
	}

	return "Something went wrong";
}
