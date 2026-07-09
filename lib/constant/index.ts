export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Pokemon Store";
export const APP_DESCRIPTION =
	process.env.NEXT_PUBLIC_APP_DESCRIPTION || "A store for Pokemon products";
export const SERVER_URL =
	process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
export const LATEST_PRODUCTS_LIMIT = 4;
export const ADMIN_PRODUCTS_PAGE_SIZE = 10;
export const ADMIN_ORDERS_PAGE_SIZE = 10;
export const ADMIN_USERS_PAGE_SIZE = 10;
export const USER_ROLES = ["user", "admin"] as const;
export const ADMIN_ORDER_SHORT_ID_LOOKUP_LIMIT = 1000;
export const ORDER_HISTORY_PAGE_SIZE = 5;
export const MIN_ORDER_HISTORY_PAGE_SIZE = 1;
export const MAX_ORDER_HISTORY_PAGE_SIZE = 20;
export const ORDER_REPORT_TIME_ZONE =
	process.env.ORDER_REPORT_TIME_ZONE || "America/Toronto";
export const UNPAID_ORDER_EXPIRE_MINUTES = Number(
	process.env.UNPAID_ORDER_EXPIRE_MINUTES || 60,
);
export const UNPAID_ORDER_EXPIRE_BATCH_SIZE = 25;
export const EXPIRED_ORDER_PAYMENT_STATUS = "EXPIRED";
export const EXPIRABLE_ORDER_PAYMENT_METHODS = ["PayPal"];
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
