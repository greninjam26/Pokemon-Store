import ProductList from "@/components/shared/product/product-list";
import { getMyCart } from "@/lib/action/cart.action";
import { getLatestProducts } from "@/lib/action/product.action";

export const dynamic = "force-dynamic";

async function Homepage() {
	const latestProducts = await getLatestProducts();
	const cart = await getMyCart();

	return (
		<ProductList
			products={latestProducts}
			title="Newest Arrivals"
			cart={cart}
		/>
	);
}

export default Homepage;
