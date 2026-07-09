import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import AdminSearch from "@/components/admin/admin-search";
import LocalDateTime from "@/components/shared/local-date-time";
import OrderPaymentStatusBadge from "@/components/shared/order/order-payment-status-badge";
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
import { getAdminOrders } from "@/lib/action/order.action";
import { formatCurrency, formatId } from "@/lib/utils";

export const metadata: Metadata = {
	title: "Admin Orders",
};

type AdminOrdersPageProps = Readonly<{
	searchParams: Promise<{
		page?: string;
		query?: string;
	}>;
}>;

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

async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
	const { page, query } = await searchParams;
	const currentPage = Math.max(1, Number(page) || 1);
	const searchQuery = query?.trim() ?? "";
	const orders = await getAdminOrders({
		page: currentPage,
		query: searchQuery,
	});

	if (orders.totalPages > 0 && currentPage > orders.totalPages) {
		const params = new URLSearchParams();

		if (searchQuery) {
			params.set("query", searchQuery);
		}

		params.set("page", orders.totalPages.toString());
		redirect(`/admin/orders?${params.toString()}`);
	}

	return (
		<Card className="rounded-lg">
			<CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="space-y-1">
					<CardTitle>Orders</CardTitle>
					<p className="text-sm font-medium text-muted-foreground">
						{orders.totalOrders} order
						{orders.totalOrders === 1 ? "" : "s"} found
					</p>
				</div>
				<AdminSearch
					action="/admin/orders"
					placeholder="Search orders"
					defaultValue={searchQuery}
				/>
			</CardHeader>
			<CardContent className="p-0">
				{orders.data.length === 0 ? (
					<div className="grid min-h-64 place-items-center border-t p-8 text-center">
						<div className="space-y-2">
							<p className="text-lg font-black">
								No orders found
							</p>
							<p className="text-sm font-medium text-muted-foreground">
								Try a different search term or clear the
								filter.
							</p>
						</div>
					</div>
				) : (
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Order</TableHead>
									<TableHead>Customer</TableHead>
									<TableHead>Date</TableHead>
									<TableHead>Total</TableHead>
									<TableHead>Payment</TableHead>
									<TableHead>Delivery</TableHead>
									<TableHead className="text-right">
										Actions
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{orders.data.map((order) => (
									<TableRow key={order.id}>
										<TableCell className="font-bold">
											{formatId(order.id)}
										</TableCell>
										<TableCell>
											<div className="min-w-48">
												<p className="font-bold">
													{getCustomerName(order)}
												</p>
												{order.user.email ? (
													<p className="text-xs font-medium text-muted-foreground">
														{order.user.email}
													</p>
												) : null}
											</div>
										</TableCell>
										<TableCell className="min-w-36">
											<LocalDateTime
												value={order.createdAt.toISOString()}
											/>
										</TableCell>
										<TableCell className="font-bold">
											{formatCurrency(order.totalPrice)}
										</TableCell>
										<TableCell>
											<div className="flex flex-col gap-1">
												<OrderPaymentStatusBadge
													isPaid={order.isPaid}
													paymentResult={
														order.paymentResult
													}
												/>
												<span className="text-xs font-medium text-muted-foreground">
													{order.paymentMethod}
												</span>
											</div>
										</TableCell>
										<TableCell>
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
				<Pagination page={currentPage} totalPages={orders.totalPages} />
			</CardContent>
		</Card>
	);
}

export default AdminOrdersPage;
