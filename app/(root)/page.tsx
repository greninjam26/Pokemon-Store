import ProductList from "@/components/shared/product/product-list";
import sampleData from "@/db/simple-data";

function Homepage() {
	return (
		<ProductList products={sampleData.products} title="Newest Arrivals" />
	);
}

export default Homepage;
