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
	title: "Admin Orders",
};

const orders = [
	{
		id: "...f3ae67fd",
		customer: "Ash",
		date: "Jul 5, 2026",
		total: "$17.33",
		payment: "Paid",
		delivery: "Not delivered",
	},
	{
		id: "...e6789873",
		customer: "Liko",
		date: "Jul 5, 2026",
		total: "$38.24",
		payment: "Not paid",
		delivery: "Not delivered",
	},
	{
		id: "...474f67a2",
		customer: "Professor Oak",
		date: "Jul 4, 2026",
		total: "$451.99",
		payment: "Paid",
		delivery: "Delivered",
	},
];

function AdminOrdersPage() {
	return (
		<Card className="rounded-lg">
			<CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
				<CardTitle>Orders</CardTitle>
				<div className="relative">
					<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search orders"
						className="h-10 pl-9 sm:w-64"
						disabled
					/>
				</div>
			</CardHeader>
			<CardContent className="p-0">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Order</TableHead>
							<TableHead>Customer</TableHead>
							<TableHead>Date</TableHead>
							<TableHead>Total</TableHead>
							<TableHead>Payment</TableHead>
							<TableHead>Delivery</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{orders.map((order) => (
							<TableRow key={order.id}>
								<TableCell className="font-bold">
									{order.id}
								</TableCell>
								<TableCell>{order.customer}</TableCell>
								<TableCell>{order.date}</TableCell>
								<TableCell className="font-bold">
									{order.total}
								</TableCell>
								<TableCell>
									<Badge
										variant={
											order.payment === "Paid"
												? "secondary"
												: "destructive"
										}
									>
										{order.payment}
									</Badge>
								</TableCell>
								<TableCell>
									<Badge
										variant={
											order.delivery === "Delivered"
												? "secondary"
												: "destructive"
										}
									>
										{order.delivery}
									</Badge>
								</TableCell>
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

export default AdminOrdersPage;
