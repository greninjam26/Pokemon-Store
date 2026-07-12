import type { Metadata } from "next";
import { SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import Pagination from "@/components/shared/pagination";
import ProductList from "@/components/shared/product/product-list";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { getMyCart } from "@/lib/action/cart.action";
import { getAllCategories, getProducts } from "@/lib/action/product.action";
import SearchFilters from "./search-filters";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Search Products",
};

type SearchPageProps = Readonly<{
	searchParams: Promise<{
		category?: string;
		featured?: string;
		inStock?: string;
		maxPrice?: string;
		minPrice?: string;
		page?: string;
		query?: string;
		rating?: string;
		sort?: string;
	}>;
}>;

const sortOptions = [
	{ label: "Newest", value: "newest" },
	{ label: "Price: Low to High", value: "price-low" },
	{ label: "Price: High to Low", value: "price-high" },
	{ label: "Rating", value: "rating" },
	{ label: "Name", value: "name" },
];

async function SearchPage({ searchParams }: SearchPageProps) {
	const {
		category,
		featured,
		inStock,
		maxPrice,
		minPrice,
		page,
		query,
		rating,
		sort,
	} = await searchParams;
	const currentPage = Math.max(1, Number(page) || 1);
	const filters = {
		category: category?.trim() ?? "",
		featured: featured === "true" ? "true" : "",
		inStock: inStock === "true" ? "true" : "",
		maxPrice: maxPrice?.trim() ?? "",
		minPrice: minPrice?.trim() ?? "",
		query: query?.trim() ?? "",
		rating: rating?.trim() ?? "",
		sort: sort?.trim() || "newest",
	};
	const [products, categories, cart] = await Promise.all([
		getProducts({
			...filters,
			page: currentPage,
		}),
		getAllCategories(),
		getMyCart(),
	]);

	if (products.totalPages > 0 && currentPage > products.totalPages) {
		const params = new URLSearchParams();

		for (const [key, value] of Object.entries(filters)) {
			if (value) {
				params.set(key, value);
			}
		}

		params.set("page", products.totalPages.toString());
		redirect(`/search?${params.toString()}`);
	}

	const title = filters.category || "All Products";
	const description = filters.query
		? `${products.totalProducts} product${products.totalProducts === 1 ? "" : "s"} matching "${filters.query}".`
		: `${products.totalProducts} product${products.totalProducts === 1 ? "" : "s"} available${filters.category ? ` in ${filters.category}` : ""}.`;
	const hasActiveFilters = Boolean(
		filters.category ||
			filters.featured ||
			filters.inStock ||
			filters.maxPrice ||
			filters.minPrice ||
			filters.query ||
			filters.rating,
	);

	return (
		<section className="space-y-6">
			<div className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
				<div>
					<p className="text-sm font-bold uppercase text-primary">
						Browse Products
					</p>
					<p className="text-sm font-medium text-muted-foreground">
						Refine by category, price, rating, availability, and
						sort order.
					</p>
				</div>
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
					<Sheet>
						<SheetTrigger asChild>
							<Button
								type="button"
								variant="outline"
								className="lg:hidden"
							>
								<SlidersHorizontal data-icon="inline-start" />
								Filters
							</Button>
						</SheetTrigger>
						<SheetContent side="left" className="overflow-y-auto">
							<SheetHeader>
								<SheetTitle>Filters</SheetTitle>
								<SheetDescription>
									Refine the product results.
								</SheetDescription>
							</SheetHeader>
							<SearchFilters
								categories={categories}
								filters={filters}
								className="border-0 shadow-none"
							/>
						</SheetContent>
					</Sheet>
					<form action="/search" className="flex items-center gap-2">
						{Object.entries(filters).map(([key, value]) =>
							value && key !== "sort" ? (
								<input
									key={key}
									type="hidden"
									name={key}
									value={value}
								/>
							) : null,
						)}
						<label
							htmlFor="sort"
							className="text-sm font-bold text-muted-foreground"
						>
							Sort
						</label>
						<select
							id="sort"
							name="sort"
							defaultValue={filters.sort}
							className="h-8 rounded-lg border border-input bg-background px-3 text-sm font-medium text-foreground shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
						>
							{sortOptions.map((option) => (
								<option
									key={option.value}
									value={option.value}
								>
									{option.label}
								</option>
							))}
						</select>
						<Button type="submit" variant="outline">
							Apply
						</Button>
					</form>
					{hasActiveFilters ? (
						<Button asChild variant="ghost">
							<Link href="/search">Clear</Link>
						</Button>
					) : null}
				</div>
			</div>
			<div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
				<SearchFilters
					categories={categories}
					filters={filters}
					className="hidden h-fit lg:block"
				/>
				<div className="space-y-6">
					<ProductList
						products={products.data}
						title={title}
						description={description}
						cart={cart}
						gridClassName="lg:grid-cols-3"
					/>
					{products.data.length === 0 ? (
						<div className="grid min-h-64 place-items-center rounded-lg border bg-card p-8 text-center">
							<div className="space-y-3">
								<p className="text-lg font-black">
									No products found
								</p>
								<p className="text-sm font-medium text-muted-foreground">
									Try another category or browse all products.
								</p>
								<Button asChild variant="outline">
									<Link href="/search">
										View All Products
									</Link>
								</Button>
							</div>
						</div>
					) : null}
					<Pagination
						page={currentPage}
						totalPages={products.totalPages}
					/>
				</div>
			</div>
		</section>
	);
}

export default SearchPage;
