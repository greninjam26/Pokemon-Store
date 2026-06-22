import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/lib/validator";

function ProductCard({ product }: { product: Product }) {
	return (
		<article className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md">
			<Link
				href={`/product/${product.slug}`}
				className="relative block aspect-square bg-muted"
			>
				<Image
					src={product.images[0]}
					alt={product.name}
					fill
					sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
					className="object-contain p-6"
				/>
			</Link>
			<div className="flex min-h-48 flex-col gap-4 p-4">
				<div className="space-y-2">
					<p className="text-xs font-bold uppercase text-primary">
						{product.category}
					</p>
					<h2 className="line-clamp-2 text-xl font-bold leading-7 text-foreground">
						<Link
							href={`/product/${product.slug}`}
							className="hover:text-primary hover:underline"
						>
							{product.name}
						</Link>
					</h2>
				</div>
				<div className="mt-auto flex items-center justify-between gap-3">
					<div>
						<p className="text-xl font-black text-primary">
							{formatCurrency(product.price)}
						</p>
						<p className="text-sm font-medium text-muted-foreground">
							{product.rating}/5 from {product.numReviews} reviews
						</p>
					</div>
					<Button disabled={product.stock === 0}>
						{product.stock > 0 ? "Add to Cart" : "Out of Stock"}
					</Button>
				</div>
			</div>
		</article>
	);
}

export default ProductCard;
