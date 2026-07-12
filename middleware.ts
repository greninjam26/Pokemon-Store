import { NextResponse, type NextRequest } from "next/server";

import { authGuard } from "@/auth-guard";
import {
	CART_SESSION_COOKIE_MAX_AGE,
	CART_SESSION_COOKIE_NAME,
} from "@/lib/constant";

function withCartSessionCookie(request: NextRequest, response: NextResponse) {
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

export async function middleware(request: NextRequest) {
	const guardResponse = await authGuard(request);

	if (guardResponse) {
		return withCartSessionCookie(request, guardResponse);
	}

	return withCartSessionCookie(request, NextResponse.next());
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};
