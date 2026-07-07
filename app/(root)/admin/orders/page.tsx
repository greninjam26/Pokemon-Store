import { Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

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
import { getAdminOrders } from "@/lib/action/order.action";
import { EXPIRED_ORDER_PAYMENT_STATUS } from "@/lib/constant";
import { formatCurrency, formatDateTime, formatId } from "@/lib/utils";

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

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
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
				<div className="flex flex-col gap-2 md:flex-row">
					<form className="flex gap-2" action="/admin/orders">
						<div className="relative">
							<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								name="query"
								placeholder="Search orders"
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
							<Link href="/admin/orders">Clear</Link>
						</Button>
					) : null}
				</div>
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
								{orders.data.map((order) => {
									const isExpired =
										isRecord(order.paymentResult) &&
										order.paymentResult.status ===
											EXPIRED_ORDER_PAYMENT_STATUS;

									return (
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
												{formatDateTime(
													order.createdAt,
												)}
											</TableCell>
											<TableCell className="font-bold">
												{formatCurrency(
													order.totalPrice,
												)}
											</TableCell>
											<TableCell>
												<div className="flex flex-col gap-1">
													<Badge
														variant={
															order.isPaid
																? "secondary"
																: "destructive"
														}
													>
														{order.isPaid
															? "Paid"
															: isExpired
																? "Expired"
																: "Not paid"}
													</Badge>
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
									);
								})}
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
