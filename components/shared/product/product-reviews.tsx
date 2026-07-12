import { Star } from "lucide-react";

import LocalDateTime from "@/components/shared/local-date-time";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProductReview } from "@/types";
import ProductReviewAction from "./product-review-action";

type ProductReviewsProps = Readonly<{
	canReview: boolean;
	myReview?: {
		rating: number;
		title: string;
		description: string;
	} | null;
	productId: string;
	reviews: ProductReview[];
	slug: string;
}>;

function RatingStars({ rating }: Readonly<{ rating: number }>) {
	return (
		<div className="flex items-center gap-0.5">
			{Array.from({ length: 5 }).map((_, index) => (
				<Star
					key={index}
					className={
						index < rating
							? "size-4 fill-secondary text-secondary-foreground"
							: "size-4 text-muted-foreground"
					}
				/>
			))}
		</div>
	);
}

function ProductReviews({
	canReview,
	myReview,
	productId,
	reviews,
	slug,
}: ProductReviewsProps) {
	return (
		<section className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
			<Card className="h-fit rounded-lg">
				<CardHeader>
					<CardTitle>Write a Review</CardTitle>
				</CardHeader>
				<CardContent>
					<ProductReviewAction
						canReview={canReview}
						productId={productId}
						review={myReview}
						slug={slug}
					/>
				</CardContent>
			</Card>

			<Card className="rounded-lg">
				<CardHeader>
					<CardTitle>Customer Reviews</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{reviews.length === 0 ? (
						<p className="rounded-lg border bg-muted/30 p-4 text-sm font-medium text-muted-foreground">
							No reviews yet. Be the first to review this product.
						</p>
					) : (
						reviews.map((review) => (
							<article
								key={review.id}
								className="space-y-3 rounded-lg border p-4"
							>
								<div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
									<div className="space-y-1">
										<div className="flex flex-wrap items-center gap-2">
											<p className="font-black">
												{review.userName}
											</p>
											{review.isVerifiedPurchase ? (
												<Badge variant="secondary">
													Verified Purchase
												</Badge>
											) : null}
										</div>
										<RatingStars rating={review.rating} />
									</div>
									<p className="text-sm font-medium text-muted-foreground">
										<LocalDateTime
											value={review.createdAt.toISOString()}
										/>
									</p>
								</div>
								<div className="space-y-2">
									<h3 className="font-black">
										{review.title}
									</h3>
									<p className="leading-7 text-muted-foreground">
										{review.description}
									</p>
								</div>
							</article>
						))
					)}
				</CardContent>
			</Card>
		</section>
	);
}

export default ProductReviews;
