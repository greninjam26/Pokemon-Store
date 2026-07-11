import ProductCarousel from "@/components/shared/product/product-carousel";
import ProductList from "@/components/shared/product/product-list";
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
		</div>
	);
}

export default Homepage;
