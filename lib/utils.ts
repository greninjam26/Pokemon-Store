import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ZodError } from "zod";

const cadCurrencyFormatter = new Intl.NumberFormat("en-CA", {
	style: "currency",
	currency: "CAD",
});

type DecimalLike = {
	toString: () => string;
};

type UserDisplayNameInput = {
	name?: string | null;
	email?: string | null;
};

const PLACEHOLDER_USER_NAME = "NO_NAME";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
	return cadCurrencyFormatter.format(value);
}

export function formatId(id: string) {
	return `...${id.slice(-8)}`;
}

export function getCleanUserName(name?: string | null) {
	return name && name !== PLACEHOLDER_USER_NAME ? name : "";
}

export function getUserDisplayName(
	user: UserDisplayNameInput,
	fallback = "User",
) {
	return getCleanUserName(user.name) || user.email?.split("@")[0] || fallback;
}

export function getCustomerDisplayName(
	user: UserDisplayNameInput,
	fallback = "Customer",
) {
	return getCleanUserName(user.name) || user.email || fallback;
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
