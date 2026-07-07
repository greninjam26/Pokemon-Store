import { auth } from "@/auth";

type SessionUser = {
	id?: string;
	role?: string;
};

export async function getCurrentUser() {
	const session = await auth();

	return session?.user as SessionUser | undefined;
}

export async function getCurrentUserId() {
	return (await getCurrentUser())?.id;
}

export async function getCurrentUserRole() {
	return (await getCurrentUser())?.role;
}

export async function requireAdmin() {
	const role = await getCurrentUserRole();

	if (role !== "admin") {
		throw new Error("User is not authorized");
	}
}
