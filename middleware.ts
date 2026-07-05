import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

import {
	CART_SESSION_COOKIE_MAX_AGE,
	CART_SESSION_COOKIE_NAME,
} from "@/lib/constant";

const protectedRoutes = [
	"/shipping-address",
	"/payment-method",
	"/place-order",
	"/profile",
	"/user",
	"/order",
	"/orders",
];

const adminRoutes = ["/admin"];

function matchesRoute(pathname: string, routes: string[]) {
	return routes.some(
		(route) => pathname === route || pathname.startsWith(`${route}/`),
	);
}

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
	const { pathname, search } = request.nextUrl;
	const isProtectedRoute = matchesRoute(pathname, protectedRoutes);
	const isAdminRoute = matchesRoute(pathname, adminRoutes);

	if (isProtectedRoute || isAdminRoute) {
		const token = await getToken({
			req: request,
			secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
			secureCookie: process.env.NODE_ENV === "production",
		});

		if (!token) {
			const signInUrl = new URL("/sign-in", request.url);
			signInUrl.searchParams.set("callbackUrl", `${pathname}${search}`);

			return withCartSessionCookie(
				request,
				NextResponse.redirect(signInUrl),
			);
		}

		if (isAdminRoute && token.role !== "admin") {
			return withCartSessionCookie(
				request,
				NextResponse.redirect(new URL("/", request.url)),
			);
		}
	}

	return withCartSessionCookie(request, NextResponse.next());
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};
