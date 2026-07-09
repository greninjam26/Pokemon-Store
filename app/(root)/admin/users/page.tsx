import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import AdminSearch from "@/components/admin/admin-search";
import DeleteDialog from "@/components/shared/delete-dialog";
import LocalDateTime from "@/components/shared/local-date-time";
import Pagination from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { deleteUser, getAdminUsers } from "@/lib/action/user.actions";
import { getUserDisplayName } from "@/lib/utils";

export const metadata: Metadata = {
	title: "Admin Users",
};

type AdminUsersPageProps = Readonly<{
	searchParams: Promise<{
		page?: string;
		query?: string;
	}>;
}>;

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
				<AdminSearch
					action="/admin/users"
					placeholder="Search users"
					defaultValue={searchQuery}
				/>
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
											{getUserDisplayName(user)}
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
										<TableCell>
											<div className="flex justify-end gap-2">
												<Button
													asChild
													variant="outline"
													size="sm"
												>
													<Link
														href={`/admin/users/${user.id}`}
													>
														Edit
													</Link>
												</Button>
												<DeleteDialog
													id={user.id}
													label="user"
													action={deleteUser}
												/>
											</div>
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
