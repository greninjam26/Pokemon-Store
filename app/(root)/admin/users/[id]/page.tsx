import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getUserById } from "@/lib/action/user.actions";
import UpdateUserForm from "./update-user-form";

export const metadata: Metadata = {
	title: "Update User",
};

type AdminUserUpdatePageProps = Readonly<{
	params: Promise<{
		id: string;
	}>;
}>;

async function AdminUserUpdatePage({ params }: AdminUserUpdatePageProps) {
	const { id } = await params;
	const user = await getUserById(id);

	if (!user) {
		notFound();
	}

	return (
		<UpdateUserForm
			user={{
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role as "user" | "admin",
				orderCount: user._count.orders,
			}}
		/>
	);
}

export default AdminUserUpdatePage;
