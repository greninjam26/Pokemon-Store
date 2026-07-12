"use client";

import { Loader2, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createUpdateReview } from "@/lib/action/review.action";
import { cn } from "@/lib/utils";

type ProductReviewFormProps = Readonly<{
	onSubmitted?: () => void;
	productId: string;
	review?: {
		rating: number;
		title: string;
		description: string;
	} | null;
}>;

function ProductReviewForm({
	onSubmitted,
	productId,
	review,
}: ProductReviewFormProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [rating, setRating] = useState(review?.rating ?? 5);

	function handleSubmit(formData: FormData) {
		startTransition(async () => {
			const response = await createUpdateReview({
				productId,
				rating,
				title: String(formData.get("title") ?? ""),
				description: String(formData.get("description") ?? ""),
			});

			if (!response.success) {
				toast.error(response.message);
				return;
			}

			toast.success(response.message);
			onSubmitted?.();
			router.refresh();
		});
	}

	return (
		<form action={handleSubmit} className="space-y-4">
			<div className="space-y-2">
				<label className="text-sm font-bold text-muted-foreground">
					Rating
				</label>
				<div className="flex gap-1">
					{Array.from({ length: 5 }).map((_, index) => {
						const value = index + 1;
						const isSelected = value <= rating;

						return (
							<button
								key={value}
								type="button"
								className="rounded-md p-1 text-secondary-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
								onClick={() => setRating(value)}
								aria-label={`${value} star${value === 1 ? "" : "s"}`}
							>
								<Star
									className={cn(
										"size-6",
										isSelected
											? "fill-secondary text-secondary-foreground"
											: "text-muted-foreground",
									)}
								/>
							</button>
						);
					})}
				</div>
			</div>

			<div className="space-y-2">
				<label
					htmlFor="review-title"
					className="text-sm font-bold text-muted-foreground"
				>
					Title
				</label>
				<Input
					id="review-title"
					name="title"
					defaultValue={review?.title ?? ""}
					placeholder="Great pull quality"
					required
				/>
			</div>

			<div className="space-y-2">
				<label
					htmlFor="review-description"
					className="text-sm font-bold text-muted-foreground"
				>
					Review
				</label>
				<Textarea
					id="review-description"
					name="description"
					defaultValue={review?.description ?? ""}
					placeholder="Share what stood out about this product."
					required
				/>
			</div>

			<Button type="submit" disabled={isPending}>
				{isPending ? <Loader2 className="animate-spin" /> : null}
				{review ? "Update Review" : "Submit Review"}
			</Button>
		</form>
	);
}

export default ProductReviewForm;
