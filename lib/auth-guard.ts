import { redirect } from "next/navigation";

import { auth } from "@/auth";

export async function requireAdmin() {
	const session = await auth();
	const role = (session?.user as { role?: string } | undefined)?.role;

	if (role !== "admin") {
		redirect("/unauthorized");
	}

	return session;
}
