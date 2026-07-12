import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatCurrency } from "@/lib/utils";

type Category = {
	category: string;
	count: number;
};

type SearchFilterValues = {
	category: string;
	featured: string;
	inStock: string;
	maxPrice: string;
	minPrice: string;
	query: string;
	rating: string;
	sort: string;
};

type SearchFiltersProps = Readonly<{
	categories: Category[];
	filters: SearchFilterValues;
	className?: string;
}>;

const ratingOptions = [
	{ label: "4 stars & up", value: "4" },
	{ label: "3 stars & up", value: "3" },
	{ label: "2 stars & up", value: "2" },
];

function buildFilterHref(
	filters: SearchFilterValues,
	overrides: Partial<SearchFilterValues>,
) {
	const params = new URLSearchParams();
	const nextFilters = {
		...filters,
		...overrides,
	};

	for (const [key, value] of Object.entries(nextFilters)) {
		if (value) {
			params.set(key, value);
		}
	}

	const query = params.toString();

	return query ? `/search?${query}` : "/search";
}

function FilterLink({
	active,
	children,
	href,
}: Readonly<{
	active: boolean;
	children: ReactNode;
	href: string;
}>) {
	return (
		<Button
			asChild
			variant={active ? "default" : "ghost"}
			className="h-auto justify-start whitespace-normal px-3 py-2 text-left"
		>
			<Link href={href}>{children}</Link>
		</Button>
	);
}

function HiddenFilterFields({
	filters,
}: Readonly<{ filters: SearchFilterValues }>) {
	return (
		<>
			{filters.query ? (
				<input type="hidden" name="query" value={filters.query} />
			) : null}
			{filters.category ? (
				<input
					type="hidden"
					name="category"
					value={filters.category}
				/>
			) : null}
			{filters.rating ? (
				<input type="hidden" name="rating" value={filters.rating} />
			) : null}
			{filters.inStock ? (
				<input type="hidden" name="inStock" value={filters.inStock} />
			) : null}
			{filters.featured ? (
				<input type="hidden" name="featured" value={filters.featured} />
			) : null}
			{filters.sort ? (
				<input type="hidden" name="sort" value={filters.sort} />
			) : null}
		</>
	);
}

function SearchFilters({ categories, filters, className }: SearchFiltersProps) {
	const hasFilters = Boolean(
		filters.category ||
			filters.featured ||
			filters.inStock ||
			filters.maxPrice ||
			filters.minPrice ||
			filters.query ||
			filters.rating,
	);

	return (
		<aside
			className={cn(
				"space-y-5 rounded-lg border bg-card p-4 shadow-sm",
				className,
			)}
		>
			<div className="flex items-center justify-between gap-3">
				<h2 className="text-lg font-black">Filters</h2>
				{hasFilters ? (
					<Button asChild variant="ghost" size="sm">
						<Link href="/search">Clear</Link>
					</Button>
				) : null}
			</div>

			<div className="space-y-2">
				<p className="text-sm font-bold text-muted-foreground">
					Category
				</p>
				<div className="grid gap-1">
					<FilterLink
						active={!filters.category}
						href={buildFilterHref(filters, { category: "" })}
					>
						All categories
					</FilterLink>
					{categories.map((item) => (
						<FilterLink
							key={item.category}
							active={filters.category === item.category}
							href={buildFilterHref(filters, {
								category: item.category,
							})}
						>
							<span className="flex w-full items-center justify-between gap-3">
								<span>{item.category}</span>
								<span className="text-xs font-bold text-muted-foreground">
									{item.count}
								</span>
							</span>
						</FilterLink>
					))}
				</div>
			</div>

			<form action="/search" className="space-y-3">
				<HiddenFilterFields filters={filters} />
				<p className="text-sm font-bold text-muted-foreground">
					Price
				</p>
				<div className="grid grid-cols-2 gap-2">
					<Input
						name="minPrice"
						type="number"
						min="0"
						step="0.01"
						placeholder="Min"
						defaultValue={filters.minPrice}
					/>
					<Input
						name="maxPrice"
						type="number"
						min="0"
						step="0.01"
						placeholder="Max"
						defaultValue={filters.maxPrice}
					/>
				</div>
				<Button type="submit" variant="outline" className="w-full">
					Apply price
				</Button>
				<p className="text-xs font-medium text-muted-foreground">
					Use values like {formatCurrency(10)} and{" "}
					{formatCurrency(100)}.
				</p>
			</form>

			<div className="space-y-2">
				<p className="text-sm font-bold text-muted-foreground">
					Rating
				</p>
				<div className="grid gap-1">
					<FilterLink
						active={!filters.rating}
						href={buildFilterHref(filters, { rating: "" })}
					>
						Any rating
					</FilterLink>
					{ratingOptions.map((option) => (
						<FilterLink
							key={option.value}
							active={filters.rating === option.value}
							href={buildFilterHref(filters, {
								rating: option.value,
							})}
						>
							{option.label}
						</FilterLink>
					))}
				</div>
			</div>

			<div className="space-y-2">
				<p className="text-sm font-bold text-muted-foreground">
					Availability
				</p>
				<div className="grid gap-1">
					<FilterLink
						active={!filters.inStock}
						href={buildFilterHref(filters, { inStock: "" })}
					>
						All products
					</FilterLink>
					<FilterLink
						active={filters.inStock === "true"}
						href={buildFilterHref(filters, { inStock: "true" })}
					>
						In stock only
					</FilterLink>
				</div>
			</div>

			<div className="space-y-2">
				<p className="text-sm font-bold text-muted-foreground">
					Featured
				</p>
				<div className="grid gap-1">
					<FilterLink
						active={!filters.featured}
						href={buildFilterHref(filters, { featured: "" })}
					>
						All products
					</FilterLink>
					<FilterLink
						active={filters.featured === "true"}
						href={buildFilterHref(filters, { featured: "true" })}
					>
						Featured only
					</FilterLink>
				</div>
			</div>
		</aside>
	);
}

export default SearchFilters;
