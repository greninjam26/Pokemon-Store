export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Pokemon Store";
export const APP_DESCRIPTION =
	process.env.NEXT_PUBLIC_APP_DESCRIPTION || "A store for Pokemon products";
export const SERVER_URL =
	process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
export const LATEST_PRODUCTS_LIMIT = 4;
export const CART_SESSION_COOKIE_NAME = "sessionCartId";
export const CART_SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;
export const CART_TAX_RATE = 0.13;
export const CART_SHIPPING_PRICE = 10;
export const CART_FREE_SHIPPING_MIN_PRICE = 100;
export const PAYMENT_METHODS = process.env.PAYMENT_METHODS
	? process.env.PAYMENT_METHODS.split(",").map((method) => method.trim())
	: ["Credit Card", "PayPal", "Cash On Delivery"];
export const DEFAULT_PAYMENT_METHOD =
	process.env.DEFAULT_PAYMENT_METHOD || PAYMENT_METHODS[0];
export const PAYPAL_CURRENCY_CODE = "CAD";
export const SHIPPING_ADDRESS_DEFAULT_VALUES = {
	fullName: "",
	streetAddress: "",
	city: "",
	province: "",
	postalCode: "",
	country: "Canada",
	lat: undefined,
	lng: undefined,
};
