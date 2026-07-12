import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = [
	"/shipping-address",
	"/payment-method",
	"/place-order",
	"/profile",
	"/user",
	"/account",
	"/order",
	"/orders",
];

const adminRoutes = ["/admin"];

function matchesRoute(pathname: string, routes: string[]) {
	return routes.some(
		(route) => pathname === route || pathname.startsWith(`${route}/`),
	);
}

export async function authGuard(request: NextRequest) {
	const { pathname, search } = request.nextUrl;
	const isProtectedRoute = matchesRoute(pathname, protectedRoutes);
	const isAdminRoute = matchesRoute(pathname, adminRoutes);

	if (!isProtectedRoute && !isAdminRoute) {
		return null;
	}

	const token = await getToken({
		req: request,
		secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
		secureCookie: process.env.NODE_ENV === "production",
	});

	if (!token) {
		const signInUrl = new URL("/sign-in", request.url);
		signInUrl.searchParams.set("callbackUrl", `${pathname}${search}`);

		return NextResponse.redirect(signInUrl);
	}

	if (isAdminRoute && token.role !== "admin") {
		return NextResponse.redirect(new URL("/unauthorized", request.url));
	}

	return null;
}
