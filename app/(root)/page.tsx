import Link from "next/link";

import ProductCarousel from "@/components/shared/product/product-carousel";
import ProductList from "@/components/shared/product/product-list";
import { Button } from "@/components/ui/button";
import { getMyCart } from "@/lib/action/cart.action";
import {
	getFeaturedProducts,
	getLatestProducts,
} from "@/lib/action/product.action";

export const dynamic = "force-dynamic";

async function Homepage() {
	const [latestProducts, featuredProducts, cart] = await Promise.all([
		getLatestProducts(),
		getFeaturedProducts(),
		getMyCart(),
	]);

	return (
		<div className="space-y-10">
			<ProductCarousel products={featuredProducts} />
			<ProductList
				products={latestProducts}
				title="Newest Arrivals"
				cart={cart}
			/>
			<div className="flex justify-center">
				<Button
					asChild
					size="lg"
					className="h-11 min-w-56 rounded-full px-8 text-base font-black shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25"
				>
					<Link href="/search">View All Products</Link>
				</Button>
			</div>
		</div>
	);
}

export default Homepage;
