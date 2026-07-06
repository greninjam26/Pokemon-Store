import { Search } from "lucide-react";
import type { Metadata } from "next";

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

export const metadata: Metadata = {
	title: "Admin Users",
};

const users = [
	{
		name: "Ash",
		email: "ash@example.com",
		role: "user",
		orders: 4,
	},
	{
		name: "Liko",
		email: "liko@example.com",
		role: "user",
		orders: 2,
	},
	{
		name: "Professor Oak",
		email: "admin@example.com",
		role: "admin",
		orders: 7,
	},
];

function AdminUsersPage() {
	return (
		<Card className="rounded-lg">
			<CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
				<CardTitle>Users</CardTitle>
				<div className="relative">
					<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search users"
						className="h-10 pl-9 sm:w-64"
						disabled
					/>
				</div>
			</CardHeader>
			<CardContent className="p-0">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Role</TableHead>
							<TableHead>Orders</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{users.map((user) => (
							<TableRow key={user.email}>
								<TableCell className="font-bold">
									{user.name}
								</TableCell>
								<TableCell>{user.email}</TableCell>
								<TableCell>
									<Badge
										variant={
											user.role === "admin"
												? "secondary"
												: "outline"
										}
									>
										{user.role}
									</Badge>
								</TableCell>
								<TableCell>{user.orders}</TableCell>
								<TableCell className="text-right">
									<Button variant="outline" size="sm" disabled>
										View
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}

export default AdminUsersPage;
