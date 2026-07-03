"use client";

import { Ban, Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { addItemToCart } from "@/lib/action/cart.action";
import type { CartItem } from "@/lib/validator";

type AddToCartProps = Readonly<{
	item: CartItem;
	disabled?: boolean;
	className?: string;
	size?: "default" | "sm" | "lg";
}>;

function AddToCart({
	item,
	disabled = false,
	className,
	size = "default",
}: AddToCartProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	function handleAddToCart() {
		startTransition(async () => {
			const response = await addItemToCart(item);

			if (!response.success) {
				toast.error(response.message);
				return;
			}

			toast.success(response.message, {
				action: {
					label: "View cart",
					onClick: () => router.push("/cart"),
				},
			});
		});
	}

	return (
		<Button
			type="button"
			size={size}
			className={className}
			disabled={disabled || isPending}
			onClick={handleAddToCart}
		>
			{disabled ? (
				<Ban data-icon="inline-start" />
			) : isPending ? (
				<Loader2 className="animate-spin" />
			) : (
				<Plus data-icon="inline-start" />
			)}
			{disabled ? "Out of Stock" : "Add to Cart"}
		</Button>
	);
}

export default AddToCart;
