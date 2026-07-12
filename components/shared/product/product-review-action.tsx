"use client";

import { MessageSquareText, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import ProductReviewForm from "./product-review-form";

type ProductReviewActionProps = Readonly<{
	canReview: boolean;
	review?: {
		rating: number;
		title: string;
		description: string;
	} | null;
	productId: string;
	slug: string;
}>;

function ProductReviewAction({
	canReview,
	review,
	productId,
	slug,
}: ProductReviewActionProps) {
	const [isOpen, setIsOpen] = useState(false);

	if (!canReview) {
		return (
			<div className="space-y-4">
				<p className="text-sm font-medium leading-6 text-muted-foreground">
					Sign in to share your thoughts about this product.
				</p>
				<Button asChild>
					<Link href={`/sign-in?callbackUrl=/product/${slug}`}>
						Sign In
					</Link>
				</Button>
			</div>
		);
	}

	if (isOpen) {
		return (
			<div className="space-y-4">
				<div className="flex items-center justify-between gap-4">
					<p className="text-sm font-semibold text-muted-foreground">
						{review
							? "Update your review for this product."
							: "Share your review for this product."}
					</p>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => setIsOpen(false)}
						aria-label="Close review form"
					>
						<X className="size-4" />
					</Button>
				</div>
				<ProductReviewForm
					productId={productId}
					review={review}
					onSubmitted={() => setIsOpen(false)}
				/>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<p className="text-sm font-medium leading-6 text-muted-foreground">
				{review
					? "You already reviewed this product. You can edit it anytime."
					: "Bought or tried this product? Leave a review to help other collectors."}
			</p>
			<Button type="button" onClick={() => setIsOpen(true)}>
				<MessageSquareText className="size-4" />
				{review ? "Edit Your Review" : "Write a Review"}
			</Button>
		</div>
	);
}

export default ProductReviewAction;
