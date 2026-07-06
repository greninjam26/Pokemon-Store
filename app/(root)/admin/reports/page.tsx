import { BarChart3, CircleDollarSign, PackageCheck } from "lucide-react";
import type { Metadata } from "next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
	title: "Admin Reports",
};

const reportCards = [
	{
		title: "Sales",
		value: "$1,286.92",
		detail: "Projected monthly revenue",
		icon: CircleDollarSign,
	},
	{
		title: "Inventory",
		value: "68",
		detail: "Units available",
		icon: PackageCheck,
	},
	{
		title: "Conversion",
		value: "12.4%",
		detail: "Checkout completion",
		icon: BarChart3,
	},
];

function AdminReportsPage() {
	return (
		<div className="space-y-6">
			<div className="grid gap-4 md:grid-cols-3">
				{reportCards.map((report) => {
					const Icon = report.icon;

					return (
						<Card key={report.title} className="rounded-lg">
							<CardContent className="flex items-center justify-between gap-4 p-5">
								<div className="space-y-1">
									<p className="text-sm font-bold text-muted-foreground">
										{report.title}
									</p>
									<p className="text-2xl font-black">
										{report.value}
									</p>
									<p className="text-xs font-semibold text-muted-foreground">
										{report.detail}
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

			<Card className="rounded-lg">
				<CardHeader>
					<CardTitle>Report Snapshot</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid h-72 place-items-center rounded-lg border bg-muted/30 text-center">
						<div className="space-y-2">
							<BarChart3 className="mx-auto size-10 text-primary" />
							<p className="text-lg font-black">
								Charts will appear here
							</p>
							<p className="text-sm font-medium text-muted-foreground">
								Sales and inventory reporting can connect here
								when admin data actions are added.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export default AdminReportsPage;
