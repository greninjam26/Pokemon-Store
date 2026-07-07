import {
	decimalToNumber,
	formatCurrency,
	formatError,
	formatId,
	normalizePagination,
	roundToTwoDecimals,
} from "@/lib/utils";

describe("utils", () => {
	it("formats CAD currency", () => {
		expect(formatCurrency(17.33)).toBe("$17.33");
	});

	it("formats shortened ids", () => {
		expect(formatId("f4363b41-56bf-4e9b-aa54-47028b42dd4e")).toBe(
			"...8b42dd4e",
		);
	});

	it("rounds numbers to two decimals", () => {
		expect(roundToTwoDecimals(1.005)).toBe(1.01);
		expect(roundToTwoDecimals(17.333)).toBe(17.33);
	});

	it("converts decimal-like values to numbers", () => {
		expect(decimalToNumber({ toString: () => "17.33" })).toBe(17.33);
	});

	it("normalizes pagination inputs", () => {
		expect(normalizePagination({ page: 3, limit: 10 })).toEqual({
			currentPage: 3,
			pageSize: 10,
			skip: 20,
		});
		expect(normalizePagination({ page: 0, limit: 0 })).toEqual({
			currentPage: 1,
			pageSize: 1,
			skip: 0,
		});
	});

	it("formats unknown errors", () => {
		expect(formatError("oops")).toBe("Something went wrong");
		expect(formatError(new Error("Payment failed"))).toBe("Payment failed");
	});
});
