"use client";

import { Ban, Loader2, Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	addItemToCart,
	removeItemFromCart,
	type CartWithItems,
} from "@/lib/action/cart.action";
import { cn } from "@/lib/utils";
import type { CartItem } from "@/lib/validator";

type AddToCartProps = Readonly<{
	item: CartItem;
	cart?: CartWithItems | null;
	disabled?: boolean;
	className?: string;
	size?: "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg";
	action?: "add" | "remove";
}>;

function AddToCart({
	item,
	cart,
	disabled = false,
	className,
	size = "default",
	action = "add",
}: AddToCartProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const isRemoveAction = action === "remove";
	const existingItem = cart?.items.find(
		(cartItem) => cartItem.productId === item.productId,
	);

	function handleCartAction(nextAction: "add" | "remove" = action) {
		startTransition(async () => {
			const response =
				nextAction === "remove"
					? await removeItemFromCart(item.productId)
					: await addItemToCart(item);

			if (!response.success) {
				toast.error(response.message);
				return;
			}

			if (nextAction === "remove") {
				toast.success(response.message);
				router.refresh();
				return;
			}

			toast.success(response.message, {
				action: {
					label: "View cart",
					onClick: () => router.push("/cart"),
				},
			});
			router.refresh();
		});
	}

	if (existingItem && !disabled) {
		return (
			<div className={cn("flex items-center gap-1.5", className)}>
				<Button
					type="button"
					variant="default"
					size="icon-sm"
					disabled={isPending}
					onClick={() => handleCartAction("remove")}
					aria-label={`Remove one ${item.name} from cart`}
				>
					{isPending ? (
						<Loader2 className="animate-spin" />
					) : (
						<Minus />
					)}
				</Button>
				<span className="flex h-8 min-w-9 flex-1 items-center justify-center rounded-lg border bg-card px-2 text-sm font-black text-primary shadow-sm">
					{existingItem.qty}
				</span>
				<Button
					type="button"
					variant="default"
					size="icon-sm"
					disabled={isPending}
					onClick={() => handleCartAction("add")}
					aria-label={`Add one ${item.name} to cart`}
				>
					{isPending ? (
						<Loader2 className="animate-spin" />
					) : (
						<Plus />
					)}
				</Button>
			</div>
		);
	}

	return (
		<Button
			type="button"
			size={size}
			className={className}
			disabled={disabled || isPending}
			onClick={() => handleCartAction()}
		>
			{disabled ? (
				<Ban data-icon="inline-start" />
			) : isPending ? (
				<Loader2 className="animate-spin" />
			) : isRemoveAction ? (
				<Minus data-icon="inline-start" />
			) : (
				<Plus data-icon="inline-start" />
			)}
			{size === "icon" || size === "icon-sm" || size === "icon-lg"
				? null
				: disabled
					? "Out of Stock"
					: isRemoveAction
						? "Remove"
						: "Add to Cart"}
		</Button>
	);
}

export default AddToCart;
