import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Card, CardContent } from "@/components/ui/card";
import AdminNav from "./admin-nav";

type AdminLayoutProps = Readonly<{
	children: ReactNode;
}>;

async function AdminLayout({ children }: AdminLayoutProps) {
	const session = await auth();
	const role = (session?.user as { role?: string } | undefined)?.role;

	if (role !== "admin") {
		redirect("/");
	}

	return (
		<section className="space-y-6">
			<div className="space-y-2">
				<h1 className="h1-bold">Admin</h1>
				<p className="text-base font-medium leading-7 text-muted-foreground">
					Manage store operations and review activity.
				</p>
			</div>

			<div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
				<Card className="h-fit rounded-lg">
					<CardContent className="p-3">
						<AdminNav />
					</CardContent>
				</Card>
				<div className="min-w-0">{children}</div>
			</div>
		</section>
	);
}

export default AdminLayout;
