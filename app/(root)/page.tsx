import ProductList from "@/components/shared/product/product-list";
import { getLatestProducts } from "@/lib/action/product.action";

export const dynamic = "force-dynamic";

async function Homepage() {
	const latestProducts = await getLatestProducts();

	return <ProductList products={latestProducts} title="Newest Arrivals" />;
}

export default Homepage;
