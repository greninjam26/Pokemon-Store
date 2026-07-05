import {
	formatCurrency,
	formatError,
	formatId,
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

	it("formats unknown errors", () => {
		expect(formatError("oops")).toBe("Something went wrong");
		expect(formatError(new Error("Payment failed"))).toBe("Payment failed");
	});
});
