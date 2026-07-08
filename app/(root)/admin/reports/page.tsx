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
import {
	DailySalesChart,
	HorizontalValueChart,
	PaymentMethodsChart,
} from "./report-charts";

export const metadata: Metadata = {
	title: "Admin Reports",
};

function formatReportDate(value: string) {
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: ORDER_REPORT_TIME_ZONE,
		month: "short",
		day: "numeric",
	}).format(new Date(`${value}T12:00:00`));
}

async function AdminReportsPage() {
	const reports = await getAdminReports();
	const dailySales = reports.dailySales.map((day) => ({
		...day,
		label: formatReportDate(day.date),
	}));
	const topProducts = reports.topProducts.map((product) => ({
		name: product.name,
		value: product.revenue,
		detail: `${product.qty} sold`,
	}));
	const categorySales = reports.categorySales.map((category) => ({
		name: category.category,
		value: category.revenue,
	}));
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
					<CardContent>
						<DailySalesChart data={dailySales} />
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

			<div className="grid gap-4 xl:grid-cols-2">
				<Card className="rounded-lg xl:col-span-2">
					<CardHeader className="py-3">
						<CardTitle>Top Products</CardTitle>
					</CardHeader>
					<CardContent>
						{topProducts.length === 0 ? (
							<p className="text-sm font-medium text-muted-foreground">
								No paid product sales yet.
							</p>
						) : (
							<HorizontalValueChart data={topProducts} />
						)}
					</CardContent>
				</Card>

				<Card className="rounded-lg">
					<CardHeader className="py-3">
						<CardTitle>Sales By Category</CardTitle>
					</CardHeader>
					<CardContent>
						{categorySales.length === 0 ? (
							<p className="text-sm font-medium text-muted-foreground">
								No paid category sales yet.
							</p>
						) : (
							<HorizontalValueChart data={categorySales} />
						)}
					</CardContent>
				</Card>

				<Card className="rounded-lg">
					<CardHeader className="py-3">
						<CardTitle>Payment Methods</CardTitle>
					</CardHeader>
					<CardContent>
						{reports.paymentMethodSales.length === 0 ? (
							<p className="text-sm font-medium text-muted-foreground">
								No paid payment data yet.
							</p>
						) : (
							<PaymentMethodsChart
								data={reports.paymentMethodSales}
							/>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

export default AdminReportsPage;
