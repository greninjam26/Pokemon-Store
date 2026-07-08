import {
	ArrowUpRight,
	Boxes,
	CircleDollarSign,
	ClipboardList,
	Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import LocalDateTime from "@/components/shared/local-date-time";
import OrderPaymentStatusBadge from "@/components/shared/order/order-payment-status-badge";
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
import { getOrderSummary } from "@/lib/action/order.action";
import { formatCurrency, formatId } from "@/lib/utils";

export const metadata: Metadata = {
	title: "Admin Dashboard",
};

function getCustomerName(order: {
	user: {
		name: string;
		email: string | null;
	};
}) {
	if (order.user.name && order.user.name !== "NO_NAME") {
		return order.user.name;
	}

	return order.user.email ?? "Customer";
}

function getUserName(user: { name: string; email: string | null }) {
	if (user.name && user.name !== "NO_NAME") {
		return user.name;
	}

	return user.email?.split("@")[0] ?? "User";
}

async function AdminDashboardPage() {
	const summary = await getOrderSummary();
	const stats = [
		{
			label: "Revenue",
			value: formatCurrency(summary.totalSales),
			detail: "Paid orders",
			icon: CircleDollarSign,
		},
		{
			label: "Orders",
			value: summary.ordersCount.toString(),
			detail: `${summary.pendingOrdersCount} needs attention`,
			icon: ClipboardList,
		},
		{
			label: "Products",
			value: summary.productsCount.toString(),
			detail: `${summary.lowStockProductsCount} low stock`,
			icon: Boxes,
		},
		{
			label: "Customers",
			value: summary.usersCount.toString(),
			detail: "Registered users",
			icon: Users,
		},
	];

	return (
		<div className="space-y-4">
			<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
				{stats.map((stat) => {
					const Icon = stat.icon;

					return (
						<Card key={stat.label} className="rounded-lg">
							<CardContent className="flex items-center justify-between gap-3 p-4">
								<div>
									<p className="text-xs font-bold text-muted-foreground">
										{stat.label}
									</p>
									<p className="text-xl font-black">
										{stat.value}
									</p>
									<p className="text-xs font-semibold text-muted-foreground">
										{stat.detail}
									</p>
								</div>
								<div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
									<Icon className="size-4" />
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			<div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
				<Card className="rounded-lg">
					<CardHeader className="flex-row items-center justify-between py-3">
						<CardTitle>Recent Orders</CardTitle>
						<Button asChild variant="outline" size="sm">
							<Link href="/admin/orders">
								View All
								<ArrowUpRight className="size-4" />
							</Link>
						</Button>
					</CardHeader>
					<CardContent className="p-0">
						{summary.latestOrders.length === 0 ? (
							<div className="p-6 text-sm font-medium text-muted-foreground">
								No orders yet.
							</div>
						) : (
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Order</TableHead>
											<TableHead>Customer</TableHead>
											<TableHead>Total</TableHead>
											<TableHead>Status</TableHead>
											<TableHead className="text-right">
												Details
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{summary.latestOrders
											.slice(0, 4)
											.map((order) => (
												<TableRow key={order.id}>
													<TableCell className="font-bold">
														{formatId(order.id)}
													</TableCell>
													<TableCell>
														{getCustomerName(
															order,
														)}
													</TableCell>
													<TableCell className="font-bold">
														{formatCurrency(
															order.totalPrice,
														)}
													</TableCell>
													<TableCell>
														<div className="flex flex-wrap gap-1">
															<OrderPaymentStatusBadge
																isPaid={
																	order.isPaid
																}
																paymentResult={
																	order.paymentResult
																}
															/>
															<Badge
																variant={
																	order.isDelivered
																		? "secondary"
																		: "destructive"
																}
															>
																{order.isDelivered
																	? "Delivered"
																	: "Not delivered"}
															</Badge>
														</div>
													</TableCell>
													<TableCell className="text-right">
														<Button
															asChild
															variant="outline"
															size="sm"
														>
															<Link
																href={`/order/${order.id}`}
															>
																View
															</Link>
														</Button>
													</TableCell>
												</TableRow>
											))}
									</TableBody>
								</Table>
							</div>
						)}
					</CardContent>
				</Card>

				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
					<Card className="rounded-lg">
						<CardHeader className="flex-row items-center justify-between py-3">
							<CardTitle>Low Stock</CardTitle>
							<Button asChild variant="outline" size="sm">
								<Link href="/admin/products">
									View All
									<ArrowUpRight className="size-4" />
								</Link>
							</Button>
						</CardHeader>
						<CardContent className="space-y-2">
							{summary.lowStockProducts.length === 0 ? (
								<p className="text-sm font-medium text-muted-foreground">
									No low stock products.
								</p>
							) : (
								summary.lowStockProducts
									.slice(0, 3)
									.map((product) => (
										<Link
											key={product.id}
											href={`/product/${product.slug}`}
											className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 transition-colors hover:bg-muted/60"
										>
											<span className="line-clamp-1 text-sm font-bold">
												{product.name}
											</span>
											<Badge variant="destructive">
												{product.stock}
											</Badge>
										</Link>
									))
							)}
						</CardContent>
					</Card>

					<Card className="rounded-lg">
						<CardHeader className="py-3">
							<CardTitle>Recent Users</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							{summary.recentUsers.length === 0 ? (
								<p className="text-sm font-medium text-muted-foreground">
									No users yet.
								</p>
							) : (
								summary.recentUsers.slice(0, 3).map((user) => (
									<div
										key={user.id}
										className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
									>
										<div className="min-w-0">
											<p className="truncate text-sm font-bold">
												{getUserName(user)}
											</p>
											<p className="truncate text-xs font-medium text-muted-foreground">
												<LocalDateTime
													value={user.createdAt.toISOString()}
												/>
											</p>
										</div>
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
									</div>
								))
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

export default AdminDashboardPage;
