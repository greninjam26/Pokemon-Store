import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import Pagination from "@/components/shared/pagination";
import ProductList from "@/components/shared/product/product-list";
import { Button } from "@/components/ui/button";
import { getMyCart } from "@/lib/action/cart.action";
import { getProducts } from "@/lib/action/product.action";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Search Products",
};

type SearchPageProps = Readonly<{
	searchParams: Promise<{
		category?: string;
		page?: string;
		query?: string;
	}>;
}>;

async function SearchPage({ searchParams }: SearchPageProps) {
	const { category, page, query } = await searchParams;
	const currentPage = Math.max(1, Number(page) || 1);
	const selectedCategory = category?.trim() ?? "";
	const searchQuery = query?.trim() ?? "";
	const [products, cart] = await Promise.all([
		getProducts({
			category: selectedCategory,
			page: currentPage,
			query: searchQuery,
		}),
		getMyCart(),
	]);

	if (products.totalPages > 0 && currentPage > products.totalPages) {
		const params = new URLSearchParams();

		if (selectedCategory) {
			params.set("category", selectedCategory);
		}

		if (searchQuery) {
			params.set("query", searchQuery);
		}

		params.set("page", products.totalPages.toString());
		redirect(`/search?${params.toString()}`);
	}

	const title = selectedCategory || "All Products";
	const description = searchQuery
		? `${products.totalProducts} product${products.totalProducts === 1 ? "" : "s"} matching "${searchQuery}".`
		: `${products.totalProducts} product${products.totalProducts === 1 ? "" : "s"} available${selectedCategory ? ` in ${selectedCategory}` : ""}.`;

	return (
		<section className="space-y-6">
			<ProductList
				products={products.data}
				title={title}
				description={description}
				cart={cart}
			/>
			{products.data.length === 0 ? (
				<div className="grid min-h-64 place-items-center rounded-lg border bg-card p-8 text-center">
					<div className="space-y-3">
						<p className="text-lg font-black">No products found</p>
						<p className="text-sm font-medium text-muted-foreground">
							Try another category or browse all products.
						</p>
						<Button asChild variant="outline">
							<Link href="/search">View All Products</Link>
						</Button>
					</div>
				</div>
			) : null}
			<Pagination page={currentPage} totalPages={products.totalPages} />
		</section>
	);
}

export default SearchPage;
