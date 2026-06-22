import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const cadCurrencyFormatter = new Intl.NumberFormat("en-CA", {
	style: "currency",
	currency: "CAD",
});

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
	return cadCurrencyFormatter.format(value);
}
