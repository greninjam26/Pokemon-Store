import { Plus, Search } from "lucide-react";
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
	title: "Admin Products",
};

const products = [
	{
		name: "Pokemon TCG Ash-Greninja-EX Box",
		category: "Sealed Collections",
		price: "$149.99",
		stock: 3,
		status: "Featured",
	},
	{
		name: "Greninja ex 214/167 Special Illustration Rare",
		category: "Single Cards",
		price: "$399.99",
		stock: 2,
		status: "Featured",
	},
	{
		name: "Twilight Masquerade Booster Pack",
		category: "Booster Packs",
		price: "$6.49",
		stock: 36,
		status: "Active",
	},
	{
		name: "XY - BREAKpoint Booster Pack",
		category: "Booster Packs",
		price: "$24.99",
		stock: 8,
		status: "Active",
	},
];

function AdminProductsPage() {
	return (
		<Card className="rounded-lg">
			<CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
				<CardTitle>Products</CardTitle>
				<div className="flex flex-col gap-2 sm:flex-row">
					<div className="relative">
						<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder="Search products"
							className="h-10 pl-9 sm:w-64"
							disabled
						/>
					</div>
					<Button disabled>
						<Plus className="size-4" />
						Add Product
					</Button>
				</div>
			</CardHeader>
			<CardContent className="p-0">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Product</TableHead>
							<TableHead>Category</TableHead>
							<TableHead>Price</TableHead>
							<TableHead>Stock</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{products.map((product) => (
							<TableRow key={product.name}>
								<TableCell className="min-w-72 font-bold">
									{product.name}
								</TableCell>
								<TableCell>{product.category}</TableCell>
								<TableCell className="font-bold">
									{product.price}
								</TableCell>
								<TableCell>{product.stock}</TableCell>
								<TableCell>
									<Badge variant="secondary">
										{product.status}
									</Badge>
								</TableCell>
								<TableCell className="text-right">
									<Button variant="outline" size="sm" disabled>
										Edit
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

export default AdminProductsPage;
