import type { Metadata } from "next";

import ProductForm from "@/components/admin/product-form";

export const metadata: Metadata = {
	title: "Create Product",
};

function CreateProductPage() {
	return <ProductForm type="Create" />;
}

export default CreateProductPage;
