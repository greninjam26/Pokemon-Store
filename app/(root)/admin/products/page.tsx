import { Plus, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import FadeInImage from "@/components/shared/fade-in-image";
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
import { getAdminProducts } from "@/lib/action/product.action";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
	title: "Admin Products",
};

type AdminProductsPageProps = Readonly<{
	searchParams: Promise<{
		page?: string;
		query?: string;
	}>;
}>;

function getProductStatus(product: { isFeatured: boolean; stock: number }) {
	if (product.stock <= 0) {
		return {
			label: "Out of Stock",
			variant: "destructive" as const,
		};
	}

	if (product.isFeatured) {
		return {
			label: "Featured",
			variant: "secondary" as const,
		};
	}

	if (product.stock <= 5) {
		return {
			label: "Low Stock",
			variant: "outline" as const,
		};
	}

	return {
		label: "Active",
		variant: "outline" as const,
	};
}

async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
	const { page, query } = await searchParams;
	const currentPage = Math.max(1, Number(page) || 1);
	const searchQuery = query?.trim() ?? "";
	const products = await getAdminProducts({
		page: currentPage,
		query: searchQuery,
	});

	if (products.totalPages > 0 && currentPage > products.totalPages) {
		const params = new URLSearchParams();

		if (searchQuery) {
			params.set("query", searchQuery);
		}

		params.set("page", products.totalPages.toString());
		redirect(`/admin/products?${params.toString()}`);
	}

	return (
		<Card className="rounded-lg">
			<CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="space-y-1">
					<CardTitle>Products</CardTitle>
					<p className="text-sm font-medium text-muted-foreground">
						{products.totalProducts} product
						{products.totalProducts === 1 ? "" : "s"} found
					</p>
				</div>
				<div className="flex flex-col gap-2 md:flex-row">
					<form className="flex gap-2" action="/admin/products">
						<div className="relative">
							<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								name="query"
								placeholder="Search products"
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
							<Link href="/admin/products">Clear</Link>
						</Button>
					) : null}
					<Button disabled>
						<Plus className="size-4" />
						Add Product
					</Button>
				</div>
			</CardHeader>
			<CardContent className="p-0">
				{products.data.length === 0 ? (
					<div className="grid min-h-64 place-items-center border-t p-8 text-center">
						<div className="space-y-2">
							<p className="text-lg font-black">
								No products found
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
									<TableHead>Product</TableHead>
									<TableHead>Category</TableHead>
									<TableHead>Price</TableHead>
									<TableHead>Stock</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="text-right">
										Actions
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{products.data.map((product) => {
									const status = getProductStatus(product);
									const productImage =
										product.images[0] ?? "/images/logo.svg";

									return (
										<TableRow key={product.id}>
											<TableCell>
												<Link
													href={`/product/${product.slug}`}
													className="flex min-w-80 items-center gap-3"
												>
													<span className="relative size-14 shrink-0 overflow-hidden rounded-lg border bg-muted">
														<FadeInImage
															src={productImage}
															alt={product.name}
															fill
															sizes="56px"
															className="object-contain p-1.5"
														/>
													</span>
													<span className="line-clamp-2 font-bold hover:text-primary hover:underline">
														{product.name}
													</span>
												</Link>
											</TableCell>
											<TableCell>
												{product.category}
											</TableCell>
											<TableCell className="font-bold">
												{formatCurrency(product.price)}
											</TableCell>
											<TableCell>{product.stock}</TableCell>
											<TableCell>
												<Badge variant={status.variant}>
													{status.label}
												</Badge>
											</TableCell>
											<TableCell className="text-right">
												<Button
													variant="outline"
													size="sm"
													disabled
												>
													Edit
												</Button>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</div>
				)}
				<Pagination
					page={currentPage}
					totalPages={products.totalPages}
				/>
			</CardContent>
		</Card>
	);
}

export default AdminProductsPage;
