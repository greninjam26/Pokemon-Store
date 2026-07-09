import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ProductForm from "@/components/admin/product-form";
import { getProductById } from "@/lib/action/product.action";

export const metadata: Metadata = {
	title: "Update Product",
};

type AdminProductUpdatePageProps = Readonly<{
	params: Promise<{
		id: string;
	}>;
}>;

async function AdminProductUpdatePage({ params }: AdminProductUpdatePageProps) {
	const { id } = await params;
	const product = await getProductById(id);

	if (!product) {
		notFound();
	}

	return <ProductForm type="Update" product={product} productId={id} />;
}

export default AdminProductUpdatePage;
