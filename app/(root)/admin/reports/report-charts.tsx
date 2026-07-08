"use client";

import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

import { formatCurrency } from "@/lib/utils";

type DailySalesPoint = {
	date: string;
	label: string;
	totalSales: number;
	orders: number;
};

type ValuePoint = {
	name: string;
	value: number;
	detail?: string;
};

type PaymentMethodPoint = {
	method: string;
	orders: number;
	revenue: number;
};

type TooltipPayload = {
	name?: string;
	value?: number;
	payload?: Record<string, unknown>;
};

type TooltipProps = {
	active?: boolean;
	payload?: TooltipPayload[];
	label?: string;
};

const chartColors = [
	"var(--primary)",
	"var(--chart-2)",
	"var(--chart-3)",
	"var(--chart-4)",
	"var(--chart-5)",
];

function formatCompactCurrency(value: number) {
	if (value >= 1000) {
		return `$${Math.round(value / 1000)}k`;
	}

	return `$${Math.round(value)}`;
}

function ChartTooltip({ active, payload, label }: TooltipProps) {
	if (!active || !payload?.length) {
		return null;
	}

	return (
		<div className="rounded-lg border bg-popover px-3 py-2 text-xs font-medium text-popover-foreground shadow-md">
			{label ? <p className="mb-1 font-bold">{label}</p> : null}
			{payload.map((item) => {
				const value =
					typeof item.value === "number"
						? formatCurrency(item.value)
						: item.value;

				return (
					<p key={item.name ?? String(item.value)}>
						<span className="text-muted-foreground">
							{item.name}:{" "}
						</span>
						<span className="font-bold">{value}</span>
					</p>
				);
			})}
		</div>
	);
}

function DailySalesChart({ data }: { data: DailySalesPoint[] }) {
	return (
		<div className="h-60">
			<ResponsiveContainer width="100%" height="100%">
				<BarChart
					data={data}
					margin={{ left: 0, right: 4, top: 8, bottom: 0 }}
					barCategoryGap="38%"
				>
					<CartesianGrid
						vertical={false}
						stroke="var(--border)"
						strokeDasharray="4 4"
					/>
					<XAxis
						dataKey="label"
						axisLine={false}
						tickLine={false}
						tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
					/>
					<YAxis
						axisLine={false}
						tickLine={false}
						tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
						tickFormatter={(value) =>
							formatCompactCurrency(Number(value))
						}
						width={44}
					/>
					<Tooltip
						content={<ChartTooltip />}
						cursor={{ fill: "var(--muted)", opacity: 0.35 }}
					/>
					<Bar
						dataKey="totalSales"
						name="Sales"
						fill="var(--primary)"
						maxBarSize={44}
						radius={[5, 5, 0, 0]}
					/>
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}

function HorizontalValueChart({ data }: { data: ValuePoint[] }) {
	const maxValue = Math.max(...data.map((item) => item.value), 0);

	return (
		<div className="space-y-4">
			{data.map((item, index) => {
				const width =
					maxValue > 0
						? Math.round((item.value / maxValue) * 100)
						: 0;

				return (
					<div key={item.name} className="space-y-1.5">
						<div className="flex items-start justify-between gap-3">
							<div className="min-w-0">
								<p
									className="truncate text-sm font-bold"
									title={item.name}
								>
									{item.name}
								</p>
								{item.detail ? (
									<p className="text-xs font-medium text-muted-foreground">
										{item.detail}
									</p>
								) : null}
							</div>
							<span className="shrink-0 text-sm font-black">
								{formatCurrency(item.value)}
							</span>
						</div>
						<div className="h-2.5 overflow-hidden rounded-full bg-muted">
							<div
								className="h-full rounded-full"
								style={{
									width: `${width}%`,
									background:
										chartColors[index % chartColors.length],
								}}
							/>
						</div>
					</div>
				);
			})}
		</div>
	);
}

function PaymentMethodsChart({ data }: { data: PaymentMethodPoint[] }) {
	const totalRevenue = data.reduce(
		(total, method) => total + method.revenue,
		0,
	);

	return (
		<div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)] md:items-center">
			<div className="relative mx-auto size-56 max-w-full">
				<ResponsiveContainer width="100%" height="100%">
					<PieChart>
						<Tooltip content={<ChartTooltip />} />
						<Pie
							data={data}
							dataKey="revenue"
							nameKey="method"
							innerRadius="62%"
							outerRadius="86%"
							paddingAngle={data.length > 1 ? 2 : 0}
							stroke="var(--card)"
							strokeWidth={3}
						>
							{data.map((method, index) => (
								<Cell
									key={method.method}
									fill={
										chartColors[index % chartColors.length]
									}
								/>
							))}
						</Pie>
					</PieChart>
				</ResponsiveContainer>
				<div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
					<p className="text-xs font-bold text-muted-foreground">
						Paid revenue
					</p>
					<p className="text-lg font-black">
						{formatCurrency(totalRevenue)}
					</p>
				</div>
			</div>

			<div className="space-y-2">
				{data.map((method, index) => {
					const percent =
						totalRevenue > 0
							? Math.round((method.revenue / totalRevenue) * 100)
							: 0;

					return (
						<div
							key={method.method}
							className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
						>
							<div className="flex min-w-0 items-center gap-2">
								<span
									className="size-2.5 shrink-0 rounded-full"
									style={{
										background:
											chartColors[
												index % chartColors.length
											],
									}}
								/>
								<div className="min-w-0">
									<p className="truncate text-sm font-bold">
										{method.method}
									</p>
									<p className="text-xs font-medium text-muted-foreground">
										{method.orders} paid orders
									</p>
								</div>
							</div>
							<div className="shrink-0 text-right">
								<p className="text-sm font-black">
									{formatCurrency(method.revenue)}
								</p>
								<p className="text-xs font-semibold text-muted-foreground">
									{percent}%
								</p>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

export { DailySalesChart, HorizontalValueChart, PaymentMethodsChart };
