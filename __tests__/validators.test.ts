import {
	cartItemSchema,
	currencySchema,
	paymentMethodSchema,
	paymentResultSchema,
	shippingAddressSchema,
	userProfileSchema,
} from "@/lib/validators";

const productId = "16d184c1-6838-4e06-9c8c-ded5181a32e3";

describe("validators", () => {
	it("coerces valid currency values", () => {
		expect(currencySchema.parse("12.99")).toBe(12.99);
		expect(currencySchema.parse(10)).toBe(10);
	});

	it("rejects currency values with more than two decimals", () => {
		expect(() => currencySchema.parse("12.999")).toThrow(
			"Amount must be a valid number with at most two decimal places",
		);
	});

	it("validates cart items", () => {
		const item = cartItemSchema.parse({
			productId,
			name: "Twilight Masquerade Booster Pack",
			slug: "twilight-masquerade-booster-pack",
			qty: "2",
			image: "/images/products/twilight-pack.webp",
			price: "6.49",
		});

		expect(item.qty).toBe(2);
		expect(item.price).toBe(6.49);
	});

	it("validates checkout payment method options", () => {
		expect(paymentMethodSchema.parse({ type: "PayPal" })).toEqual({
			type: "PayPal",
		});
		expect(() => paymentMethodSchema.parse({ type: "Crypto" })).toThrow(
			"Invalid payment method",
		);
	});

	it("validates shipping addresses", () => {
		expect(
			shippingAddressSchema.parse({
				fullName: "Ash Ketchum",
				streetAddress: "123 Pallet Town",
				city: "Pallet",
				province: "ON",
				postalCode: "A1A 1A1",
				country: "Canada",
			}),
		).toMatchObject({
			fullName: "Ash Ketchum",
			country: "Canada",
		});
	});

	it("allows profile updates without changing the password", () => {
		expect(
			userProfileSchema.parse({
				name: "Ash Ketchum",
				orderHistoryPageSize: 5,
				currentPassword: "",
				password: "",
				confirmPassword: "",
			}),
		).toEqual({
			name: "Ash Ketchum",
			orderHistoryPageSize: 5,
			currentPassword: undefined,
			password: undefined,
			confirmPassword: undefined,
		});
	});

	it("requires the current password when changing profile password", () => {
		expect(() =>
			userProfileSchema.parse({
				name: "Ash Ketchum",
				orderHistoryPageSize: 5,
				currentPassword: "",
				password: "newpassword",
				confirmPassword: "newpassword",
			}),
		).toThrow("Current password is required");
	});

	it("allows PayPal payment results without payer email", () => {
		expect(
			paymentResultSchema.parse({
				id: "paypal-order-id",
				status: "CREATED",
				pricePaid: 0,
			}),
		).toEqual({
			id: "paypal-order-id",
			status: "CREATED",
			pricePaid: 0,
		});
	});
});
