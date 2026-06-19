import { LATEST_PRODUCTS_LIMIT } from "@/lib/constant";
import ProductCard, { type Product } from "./product-card";

type ProductListProps = {
	products: Product[];
	title?: string;
};

function ProductList({ products, title = "New Arrivals" }: ProductListProps) {
	const limitedProducts = products.slice(0, LATEST_PRODUCTS_LIMIT);

	return (
		<section className="space-y-6">
			<div className="flex flex-col gap-2">
				<h1 className="h2-bold">{title}</h1>
				<p className="max-w-2xl text-lg font-medium leading-8 text-muted-foreground">
					Fresh picks for trainers, collectors, and Pokemon fans.
				</p>
			</div>
			<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
				{limitedProducts.map((product) => (
					<ProductCard key={product.slug} product={product} />
				))}
			</div>
		</section>
	);
}

export default ProductList;
