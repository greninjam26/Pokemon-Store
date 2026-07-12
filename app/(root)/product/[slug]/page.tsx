import { ArrowLeft, Star } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import AddToCart from "@/components/shared/product/add-to-cart";
import ProductImages from "@/components/shared/product/product-images";
import ProductReviews from "@/components/shared/product/product-reviews";
import { Badge } from "@/components/ui/badge";
import { getMyCart } from "@/lib/action/cart.action";
import { getCurrentUserId } from "@/lib/action/helpers";
import { getProductBySlug } from "@/lib/action/product.action";
import {
	getMyProductReview,
	getProductReviews,
} from "@/lib/action/review.action";
import { formatCurrency } from "@/lib/utils";

type ProductDetailPageProps = Readonly<{
	params: Promise<{ slug: string }>;
}>;

async function ProductDetailPage({ params }: ProductDetailPageProps) {
	const { slug } = await params;
	const product = await getProductBySlug(slug);

	if (!product) {
		notFound();
	}

	const [cart, reviews, myReview, userId] = await Promise.all([
		getMyCart(),
		getProductReviews(product.id),
		getMyProductReview(product.id),
		getCurrentUserId(),
	]);

	return (
		<section className="space-y-8">
			<Link
				href="/"
				className="inline-flex items-center gap-2 font-semibold text-muted-foreground hover:text-foreground"
			>
				<ArrowLeft className="size-4" />
				Back to products
			</Link>

			<div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:gap-12">
				<ProductImages images={product.images} name={product.name} />

				<div className="space-y-7 lg:sticky lg:top-8">
					<div className="space-y-3">
						<div className="flex flex-wrap items-center gap-2">
							<Badge variant="secondary">
								{product.category}
							</Badge>
							{product.isFeatured && <Badge>Featured</Badge>}
						</div>
						<h1 className="text-3xl font-black leading-tight text-foreground md:text-4xl">
							{product.name}
						</h1>
						<Link
							href="#reviews"
							className="flex w-fit items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
						>
							<Star className="size-4 fill-secondary text-secondary-foreground" />
							<span>{product.rating}/5</span>
							<span aria-hidden="true">&middot;</span>
							<span>{product.numReviews} reviews</span>
						</Link>
					</div>

					<p className="text-3xl font-black text-primary">
						{formatCurrency(product.price)}
					</p>

					<p className="text-lg leading-8 text-muted-foreground">
						{product.description}
					</p>

					<dl className="divide-y border-y text-base">
						<div className="flex justify-between gap-6 py-4">
							<dt className="font-semibold text-muted-foreground">
								Brand
							</dt>
							<dd className="font-bold text-foreground">
								{product.brand}
							</dd>
						</div>
						<div className="flex justify-between gap-6 py-4">
							<dt className="font-semibold text-muted-foreground">
								Availability
							</dt>
							<dd>
								{product.stock > 0 ? (
									<Badge
										variant="outline"
										className="border-primary/40 bg-primary/5 text-primary"
									>
										{product.stock} in stock
									</Badge>
								) : (
									<Badge variant="destructive">
										Out of stock
									</Badge>
								)}
							</dd>
						</div>
					</dl>

					<AddToCart
						cart={cart}
						item={{
							productId: product.id,
							name: product.name,
							slug: product.slug,
							qty: 1,
							image: product.images[0],
							price: product.price,
						}}
						size="lg"
						className="w-full"
						disabled={product.stock === 0}
					/>
				</div>
			</div>
			<div id="reviews" className="scroll-mt-28 border-t pt-8">
				<div className="mb-5 space-y-2">
					<h2 className="text-2xl font-black text-foreground">
						Product Reviews
					</h2>
					<p className="text-sm font-medium text-muted-foreground">
						Read customer feedback or leave your own review for{" "}
						{product.name}.
					</p>
				</div>
				<ProductReviews
					canReview={Boolean(userId)}
					myReview={myReview}
					productId={product.id}
					reviews={reviews}
					slug={product.slug}
				/>
			</div>
		</section>
	);
}

export default ProductDetailPage;
