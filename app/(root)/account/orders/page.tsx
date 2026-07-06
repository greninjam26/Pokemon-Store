import { PackageSearch } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import Pagination from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { getMyOrders } from "@/lib/action/order.action";
import { formatCurrency, formatDateTime, formatId } from "@/lib/utils";

export const metadata: Metadata = {
	title: "Order History",
};

type AccountOrdersPageProps = Readonly<{
	searchParams: Promise<{
		page?: string;
	}>;
}>;

async function AccountOrdersPage({ searchParams }: AccountOrdersPageProps) {
	const session = await auth();

	if (!session?.user) {
		redirect("/sign-in?callbackUrl=/account/orders");
	}

	const { page } = await searchParams;
	const currentPage = Math.max(1, Number(page) || 1);
	const orders = await getMyOrders({ page: currentPage });

	if (orders.totalPages > 0 && currentPage > orders.totalPages) {
		redirect(`/account/orders?page=${orders.totalPages}`);
	}

	return (
		<section className="space-y-6">
			<div className="space-y-2">
				<h1 className="h1-bold">Order History</h1>
				<p className="text-base font-medium leading-7 text-muted-foreground">
					Review your recent orders and payment status.
				</p>
			</div>

			{orders.data.length === 0 ? (
				<Card className="rounded-lg">
					<CardContent className="flex flex-col items-center gap-4 py-14 text-center">
						<div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
							<PackageSearch className="size-7" />
						</div>
						<div className="space-y-1">
							<h2 className="text-xl font-black">
								No orders yet
							</h2>
							<p className="max-w-md text-sm font-medium leading-6 text-muted-foreground">
								Orders you place will appear here after
								checkout.
							</p>
						</div>
						<Button asChild>
							<Link href="/">Start Shopping</Link>
						</Button>
					</CardContent>
				</Card>
			) : (
				<Card className="rounded-lg">
					<CardContent className="p-0">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Order</TableHead>
									<TableHead>Date</TableHead>
									<TableHead>Payment</TableHead>
									<TableHead>Total</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="text-right">
										Details
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{orders.data.map((order) => (
									<TableRow key={order.id}>
										<TableCell className="font-bold">
											{formatId(order.id)}
										</TableCell>
										<TableCell className="font-medium text-muted-foreground">
											{formatDateTime(order.createdAt)}
										</TableCell>
										<TableCell>
											{order.paymentMethod}
										</TableCell>
										<TableCell className="font-bold">
											{formatCurrency(order.totalPrice)}
										</TableCell>
										<TableCell>
											<div className="flex flex-wrap gap-2">
												<Badge
													variant={
														order.isPaid
															? "secondary"
															: "destructive"
													}
												>
													{order.isPaid
														? "Paid"
														: "Not paid"}
												</Badge>
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
						<Pagination
							page={currentPage}
							totalPages={orders.totalPages}
						/>
					</CardContent>
				</Card>
			)}
		</section>
	);
}

export default AccountOrdersPage;
