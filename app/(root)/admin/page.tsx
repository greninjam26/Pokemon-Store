import {
	ArrowUpRight,
	Boxes,
	CircleDollarSign,
	ClipboardList,
	Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = {
	title: "Admin Dashboard",
};

const stats = [
	{
		label: "Revenue",
		value: "$1,286.92",
		detail: "Last 30 days",
		icon: CircleDollarSign,
	},
	{
		label: "Orders",
		value: "18",
		detail: "4 pending",
		icon: ClipboardList,
	},
	{
		label: "Products",
		value: "6",
		detail: "2 low stock",
		icon: Boxes,
	},
	{
		label: "Customers",
		value: "3",
		detail: "1 admin",
		icon: Users,
	},
];

const recentOrders = [
	{
		id: "...f3ae67fd",
		customer: "Ash",
		total: "$17.33",
		status: "Paid",
	},
	{
		id: "...e6789873",
		customer: "Liko",
		total: "$38.24",
		status: "Not paid",
	},
	{
		id: "...474f67a2",
		customer: "Professor Oak",
		total: "$451.99",
		status: "Paid",
	},
];

function AdminDashboardPage() {
	return (
		<div className="space-y-6">
			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{stats.map((stat) => {
					const Icon = stat.icon;

					return (
						<Card key={stat.label} className="rounded-lg">
							<CardContent className="flex items-center justify-between gap-4 p-5">
								<div className="space-y-1">
									<p className="text-sm font-bold text-muted-foreground">
										{stat.label}
									</p>
									<p className="text-2xl font-black">
										{stat.value}
									</p>
									<p className="text-xs font-semibold text-muted-foreground">
										{stat.detail}
									</p>
								</div>
								<div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
									<Icon className="size-5" />
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			<div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
				<Card className="rounded-lg">
					<CardHeader className="flex-row items-center justify-between">
						<CardTitle>Recent Orders</CardTitle>
						<Button asChild variant="outline" size="sm">
							<Link href="/admin/orders">
								View All
								<ArrowUpRight className="size-4" />
							</Link>
						</Button>
					</CardHeader>
					<CardContent className="p-0">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Order</TableHead>
									<TableHead>Customer</TableHead>
									<TableHead>Total</TableHead>
									<TableHead>Status</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{recentOrders.map((order) => (
									<TableRow key={order.id}>
										<TableCell className="font-bold">
											{order.id}
										</TableCell>
										<TableCell>{order.customer}</TableCell>
										<TableCell className="font-bold">
											{order.total}
										</TableCell>
										<TableCell>
											<Badge
												variant={
													order.status === "Paid"
														? "secondary"
														: "destructive"
												}
											>
												{order.status}
											</Badge>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>

				<Card className="rounded-lg">
					<CardHeader>
						<CardTitle>Quick Actions</CardTitle>
					</CardHeader>
					<CardContent className="grid gap-3">
						<Button asChild variant="outline">
							<Link href="/admin/products">Manage Products</Link>
						</Button>
						<Button asChild variant="outline">
							<Link href="/admin/orders">Review Orders</Link>
						</Button>
						<Button asChild variant="outline">
							<Link href="/admin/users">View Users</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

export default AdminDashboardPage;
