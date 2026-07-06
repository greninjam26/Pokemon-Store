import { Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import LocalDateTime from "@/components/shared/local-date-time";
import Pagination from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { getAdminUsers } from "@/lib/action/user.actions";

export const metadata: Metadata = {
	title: "Admin Users",
};

type AdminUsersPageProps = Readonly<{
	searchParams: Promise<{
		page?: string;
		query?: string;
	}>;
}>;

function getDisplayName(user: { name: string; email: string | null }) {
	if (user.name && user.name !== "NO_NAME") {
		return user.name;
	}

	return user.email?.split("@")[0] ?? "User";
}

async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
	const { page, query } = await searchParams;
	const currentPage = Math.max(1, Number(page) || 1);
	const searchQuery = query?.trim() ?? "";
	const users = await getAdminUsers({
		page: currentPage,
		query: searchQuery,
	});

	if (users.totalPages > 0 && currentPage > users.totalPages) {
		const params = new URLSearchParams();

		if (searchQuery) {
			params.set("query", searchQuery);
		}

		params.set("page", users.totalPages.toString());
		redirect(`/admin/users?${params.toString()}`);
	}

	return (
		<Card className="rounded-lg">
			<CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="space-y-1">
					<CardTitle>Users</CardTitle>
					<p className="text-sm font-medium text-muted-foreground">
						{users.totalUsers} user
						{users.totalUsers === 1 ? "" : "s"} found
					</p>
				</div>
				<div className="flex flex-col gap-2 md:flex-row">
					<form className="flex gap-2" action="/admin/users">
						<div className="relative">
							<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								name="query"
								placeholder="Search users"
								className="h-10 pl-9 sm:w-64"
								defaultValue={searchQuery}
							/>
						</div>
						<Button type="submit" variant="outline">
							Search
						</Button>
					</form>
					{searchQuery ? (
						<Button asChild variant="ghost">
							<Link href="/admin/users">Clear</Link>
						</Button>
					) : null}
				</div>
			</CardHeader>
			<CardContent className="p-0">
				{users.data.length === 0 ? (
					<div className="grid min-h-64 place-items-center border-t p-8 text-center">
						<div className="space-y-2">
							<p className="text-lg font-black">No users found</p>
							<p className="text-sm font-medium text-muted-foreground">
								Try a different search term or clear the filter.
							</p>
						</div>
					</div>
				) : (
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Role</TableHead>
									<TableHead>Orders</TableHead>
									<TableHead>Joined</TableHead>
									<TableHead className="text-right">
										Actions
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{users.data.map((user) => (
									<TableRow key={user.id}>
										<TableCell className="min-w-40 font-bold">
											{getDisplayName(user)}
										</TableCell>
										<TableCell className="min-w-56">
											{user.email ?? "No email"}
										</TableCell>
										<TableCell>
											<Badge
												variant={
													user.role === "admin"
														? "secondary"
														: "outline"
												}
												className="capitalize"
											>
												{user.role}
											</Badge>
										</TableCell>
										<TableCell>{user.orderCount}</TableCell>
										<TableCell className="min-w-36">
											<LocalDateTime
												value={user.createdAt.toISOString()}
											/>
										</TableCell>
										<TableCell className="text-right">
											<Button
												variant="outline"
												size="sm"
												disabled
											>
												View
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}
				<Pagination page={currentPage} totalPages={users.totalPages} />
			</CardContent>
		</Card>
	);
}

export default AdminUsersPage;
