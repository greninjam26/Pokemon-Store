import {
	CircleDollarSign,
	PackageCheck,
	ReceiptText,
	Truck,
} from "lucide-react";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminReports } from "@/lib/action/order.action";
import { ORDER_REPORT_TIME_ZONE } from "@/lib/constant";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
	title: "Admin Reports",
};

function getPercent(value: number, max: number) {
	if (value <= 0 || max <= 0) {
		return 0;
	}

	return Math.max(4, Math.round((value / max) * 100));
}

function formatReportDate(value: string) {
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: ORDER_REPORT_TIME_ZONE,
		month: "short",
		day: "numeric",
	}).format(new Date(`${value}T12:00:00`));
}

async function AdminReportsPage() {
	const reports = await getAdminReports();
	const maxDailySales = Math.max(
		...reports.dailySales.map((day) => day.totalSales),
		0,
	);
	const maxCategorySales = Math.max(
		...reports.categorySales.map((category) => category.revenue),
		0,
	);
	const maxProductSales = Math.max(
		...reports.topProducts.map((product) => product.revenue),
		0,
	);
	const reportCards = [
		{
			title: "Sales",
			value: formatCurrency(reports.totalSales),
			detail: `${reports.paidOrdersCount} paid orders`,
			icon: CircleDollarSign,
		},
		{
			title: "Average Order",
			value: formatCurrency(reports.averageOrderValue),
			detail: "Paid orders only",
			icon: ReceiptText,
		},
		{
			title: "Inventory",
			value: reports.inventoryUnits.toString(),
			detail: `${reports.lowStockProductsCount} low stock`,
			icon: PackageCheck,
		},
		{
			title: "Delivery",
			value: `${reports.deliveredRate}%`,
			detail: `${reports.deliveredOrdersCount} delivered`,
			icon: Truck,
		},
	];

	return (
		<div className="space-y-4">
			<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
				{reportCards.map((report) => {
					const Icon = report.icon;

					return (
						<Card key={report.title} className="rounded-lg">
							<CardContent className="flex items-center justify-between gap-3 p-4">
								<div>
									<p className="text-xs font-bold text-muted-foreground">
										{report.title}
									</p>
									<p className="text-xl font-black">
										{report.value}
									</p>
									<p className="text-xs font-semibold text-muted-foreground">
										{report.detail}
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

			<div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
				<Card className="rounded-lg">
					<CardHeader className="py-3">
						<CardTitle>Sales - Last 7 Days</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{reports.dailySales.map((day) => (
							<div
								key={day.date}
								className="grid grid-cols-[76px_minmax(0,1fr)_92px] items-center gap-3"
							>
								<span className="text-sm font-bold text-muted-foreground">
									{formatReportDate(day.date)}
								</span>
								<div className="h-8 overflow-hidden rounded-lg bg-muted">
									<div
										className="h-full rounded-lg bg-primary"
										style={{
											width: `${getPercent(
												day.totalSales,
												maxDailySales,
											)}%`,
										}}
									/>
								</div>
								<div className="text-right">
									<p className="text-sm font-black">
										{formatCurrency(day.totalSales)}
									</p>
									<p className="text-xs font-medium text-muted-foreground">
										{day.orders} orders
									</p>
								</div>
							</div>
						))}
					</CardContent>
				</Card>

				<Card className="rounded-lg">
					<CardHeader className="py-3">
						<CardTitle>Order Health</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="flex items-center justify-between rounded-lg border px-3 py-2">
							<span className="text-sm font-bold">
								Payment Rate
							</span>
							<Badge variant="secondary">
								{reports.paidRate}%
							</Badge>
						</div>
						<div className="flex items-center justify-between rounded-lg border px-3 py-2">
							<span className="text-sm font-bold">
								Delivery Rate
							</span>
							<Badge variant="secondary">
								{reports.deliveredRate}%
							</Badge>
						</div>
						<div className="flex items-center justify-between rounded-lg border px-3 py-2">
							<span className="text-sm font-bold">
								Total Orders
							</span>
							<Badge variant="outline">
								{reports.ordersCount}
							</Badge>
						</div>
						<div className="flex items-center justify-between rounded-lg border px-3 py-2">
							<span className="text-sm font-bold">Customers</span>
							<Badge variant="outline">
								{reports.usersCount}
							</Badge>
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-4 xl:grid-cols-3">
				<Card className="rounded-lg">
					<CardHeader className="py-3">
						<CardTitle>Top Products</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{reports.topProducts.length === 0 ? (
							<p className="text-sm font-medium text-muted-foreground">
								No paid product sales yet.
							</p>
						) : (
							reports.topProducts.map((product) => (
								<div key={product.name} className="space-y-1">
									<div className="flex justify-between gap-3">
										<span className="line-clamp-1 text-sm font-bold">
											{product.name}
										</span>
										<span className="shrink-0 text-sm font-black">
											{formatCurrency(product.revenue)}
										</span>
									</div>
									<div className="h-2 overflow-hidden rounded-full bg-muted">
										<div
											className="h-full rounded-full bg-primary"
											style={{
												width: `${getPercent(
													product.revenue,
													maxProductSales,
												)}%`,
											}}
										/>
									</div>
									<p className="text-xs font-medium text-muted-foreground">
										{product.qty} sold
									</p>
								</div>
							))
						)}
					</CardContent>
				</Card>

				<Card className="rounded-lg">
					<CardHeader className="py-3">
						<CardTitle>Sales By Category</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{reports.categorySales.length === 0 ? (
							<p className="text-sm font-medium text-muted-foreground">
								No paid category sales yet.
							</p>
						) : (
							reports.categorySales.map((category) => (
								<div
									key={category.category}
									className="space-y-1"
								>
									<div className="flex justify-between gap-3">
										<span className="line-clamp-1 text-sm font-bold">
											{category.category}
										</span>
										<span className="shrink-0 text-sm font-black">
											{formatCurrency(category.revenue)}
										</span>
									</div>
									<div className="h-2 overflow-hidden rounded-full bg-muted">
										<div
											className="h-full rounded-full bg-primary"
											style={{
												width: `${getPercent(
													category.revenue,
													maxCategorySales,
												)}%`,
											}}
										/>
									</div>
								</div>
							))
						)}
					</CardContent>
				</Card>

				<Card className="rounded-lg">
					<CardHeader className="py-3">
						<CardTitle>Payment Methods</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2">
						{reports.paymentMethodSales.length === 0 ? (
							<p className="text-sm font-medium text-muted-foreground">
								No paid payment data yet.
							</p>
						) : (
							reports.paymentMethodSales.map((method) => (
								<div
									key={method.method}
									className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
								>
									<div>
										<p className="text-sm font-bold">
											{method.method}
										</p>
										<p className="text-xs font-medium text-muted-foreground">
											{method.orders} paid orders
										</p>
									</div>
									<span className="text-sm font-black">
										{formatCurrency(method.revenue)}
									</span>
								</div>
							))
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

export default AdminReportsPage;
