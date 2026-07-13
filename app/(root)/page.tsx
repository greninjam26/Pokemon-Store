import Link from "next/link";
import Image from "next/image";
import {
	CreditCard,
	Headphones,
	PackageCheck,
	ShieldCheck,
} from "lucide-react";

import ProductCarousel from "@/components/shared/product/product-carousel";
import ProductList from "@/components/shared/product/product-list";
import { Button } from "@/components/ui/button";
import { getMyCart } from "@/lib/action/cart.action";
import {
	getFeaturedProducts,
	getLatestProducts,
} from "@/lib/action/product.action";
import { CART_FREE_SHIPPING_MIN_PRICE } from "@/lib/constant";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

const storeHighlights = [
	{
		title: "Free Shipping",
		description: `On orders over ${formatCurrency(CART_FREE_SHIPPING_MIN_PRICE)}`,
		icon: PackageCheck,
	},
	{
		title: "Collector Care",
		description: "Secure packing for cards, packs, and boxes",
		icon: ShieldCheck,
	},
	{
		title: "Flexible Payment",
		description: "Pay with card, PayPal, or cash on delivery",
		icon: CreditCard,
	},
	{
		title: "Trainer Support",
		description: "Help with orders, checkout, and product questions",
		icon: Headphones,
	},
];

async function Homepage() {
	const [latestProducts, featuredProducts, cart] = await Promise.all([
		getLatestProducts(),
		getFeaturedProducts(),
		getMyCart(),
	]);
	const featuredDeal = featuredProducts[0];

	return (
		<div className="space-y-10">
			<ProductCarousel products={featuredProducts} />
			<ProductList
				products={latestProducts}
				title="Newest Arrivals"
				cart={cart}
			/>
			<div className="flex justify-center">
				<Button
					asChild
					size="lg"
					className="h-11 min-w-56 rounded-full px-8 text-base font-black shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25"
				>
					<Link href="/search">View All Products</Link>
				</Button>
			</div>
			{featuredDeal ? (
				<section className="overflow-hidden rounded-lg border bg-card">
					<div className="grid gap-8 p-6 md:grid-cols-[minmax(0,1fr)_320px] md:items-center md:p-8 lg:grid-cols-[minmax(0,1fr)_420px]">
						<div className="space-y-5">
							<p className="w-fit rounded-full bg-secondary px-3 py-1 text-xs font-black uppercase text-secondary-foreground">
								Featured Pick
							</p>
							<div className="space-y-3">
								<h2 className="text-3xl font-black leading-tight md:text-4xl">
									Add a collector favorite to your lineup
								</h2>
								<p className="max-w-2xl text-base font-medium leading-7 text-muted-foreground md:text-lg">
									{featuredDeal.name} is featured for trainers
									looking for standout Pokemon TCG pieces and
									sealed-display picks.
								</p>
							</div>
							<div className="flex flex-wrap items-center gap-4">
								<Button asChild size="lg">
									<Link
										href={`/product/${featuredDeal.slug}`}
									>
										View Featured Product
									</Link>
								</Button>
								<span className="text-2xl font-black text-primary">
									{formatCurrency(featuredDeal.price)}
								</span>
							</div>
						</div>
						<Link
							href={`/product/${featuredDeal.slug}`}
							className="relative mx-auto block aspect-square w-full max-w-sm overflow-hidden rounded-lg bg-muted"
						>
							<Image
								src={featuredDeal.images[0]}
								alt={featuredDeal.name}
								fill
								sizes="(min-width: 1024px) 420px, 90vw"
								className="object-contain p-6"
							/>
						</Link>
					</div>
				</section>
			) : null}
			<section className="grid gap-4 rounded-lg border bg-card p-6 sm:grid-cols-2 lg:grid-cols-4">
				{storeHighlights.map((item) => {
					const Icon = item.icon;

					return (
						<div key={item.title} className="space-y-3">
							<Icon className="size-7 text-primary" />
							<div className="space-y-1">
								<h3 className="font-black">{item.title}</h3>
								<p className="text-sm font-medium leading-6 text-muted-foreground">
									{item.description}
								</p>
							</div>
						</div>
					);
				})}
			</section>
		</div>
	);
}

export default Homepage;
