import Link from "next/link";

import AddToCart from "@/components/shared/product/add-to-cart";
import FadeInImage from "@/components/shared/fade-in-image";
import { Card, CardContent } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { CartWithItems } from "@/lib/action/cart.action";
import { formatCurrency } from "@/lib/utils";

type CartTableProps = Readonly<{
	cart: CartWithItems;
}>;

function CartTable({ cart }: CartTableProps) {
	return (
		<Card className="rounded-lg">
			<CardContent className="p-0">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Product</TableHead>
							<TableHead className="text-right">Price</TableHead>
							<TableHead className="text-center">
								Quantity
							</TableHead>
							<TableHead className="text-right">
								Subtotal
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{cart.items.map((item) => (
							<TableRow key={item.productId}>
								<TableCell>
									<div className="flex min-w-72 items-center gap-4">
										<Link
											href={`/product/${item.slug}`}
											className="relative size-20 shrink-0 overflow-hidden rounded-lg border bg-muted"
										>
											<FadeInImage
												src={item.image}
												alt={item.name}
												fill
												sizes="80px"
												className="object-contain p-2"
											/>
										</Link>
										<div className="space-y-1">
											<Link
												href={`/product/${item.slug}`}
												className="line-clamp-2 font-bold text-foreground hover:text-primary hover:underline"
											>
												{item.name}
											</Link>
											<p className="text-sm font-medium text-muted-foreground">
												{item.slug}
											</p>
										</div>
									</div>
								</TableCell>
								<TableCell className="text-right font-semibold">
									{formatCurrency(item.price)}
								</TableCell>
								<TableCell>
									<div className="flex justify-center">
										<AddToCart
											cart={cart}
											item={{ ...item, qty: 1 }}
											className="w-28"
										/>
									</div>
								</TableCell>
								<TableCell className="text-right font-black text-primary">
									{formatCurrency(item.price * item.qty)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}

export default CartTable;
