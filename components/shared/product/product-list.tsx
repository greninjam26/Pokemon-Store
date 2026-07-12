import type { CartWithItems } from "@/lib/action/cart.action";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";
import ProductCard from "./product-card";

type ProductListProps = {
	products: Product[];
	cart?: CartWithItems | null;
	description?: string;
	gridClassName?: string;
	title?: string;
};

function ProductList({
	products,
	cart,
	description = "Fresh picks for trainers, collectors, and Pokemon fans.",
	gridClassName,
	title = "New Arrivals",
}: ProductListProps) {
	return (
		<section className="space-y-6">
			<div className="flex flex-col gap-2">
				<h1 className="h2-bold">{title}</h1>
				<p className="max-w-2xl text-lg font-medium leading-8 text-muted-foreground">
					{description}
				</p>
			</div>
			<div
				className={cn(
					"grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4",
					gridClassName,
				)}
			>
				{products.map((product) => (
					<ProductCard
						key={product.slug}
						product={product}
						cart={cart}
					/>
				))}
			</div>
		</section>
	);
}

export default ProductList;
