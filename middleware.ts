import { NextResponse, type NextRequest } from "next/server";

import {
	CART_SESSION_COOKIE_MAX_AGE,
	CART_SESSION_COOKIE_NAME,
} from "@/lib/constant";

export function middleware(request: NextRequest) {
	const response = NextResponse.next();
	const sessionCartId = request.cookies.get(CART_SESSION_COOKIE_NAME);

	if (!sessionCartId) {
		response.cookies.set(CART_SESSION_COOKIE_NAME, crypto.randomUUID(), {
			httpOnly: true,
			maxAge: CART_SESSION_COOKIE_MAX_AGE,
			path: "/",
			sameSite: "lax",
			secure: process.env.NODE_ENV === "production",
		});
	}

	return response;
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};
