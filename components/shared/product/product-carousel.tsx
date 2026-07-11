"use client";

import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import { useRef } from "react";

import FadeInImage from "@/components/shared/fade-in-image";
import { Button } from "@/components/ui/button";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types";

type ProductCarouselProps = Readonly<{
	products: Product[];
}>;

function ProductCarousel({ products }: ProductCarouselProps) {
	const autoplay = useRef(
		Autoplay({
			delay: 4500,
			stopOnInteraction: true,
			stopOnMouseEnter: true,
		}),
	);

	if (products.length === 0) {
		return null;
	}

	return (
		<section aria-label="Featured products">
			<Carousel
				opts={{
					align: "start",
					loop: products.length > 1,
				}}
				plugins={[autoplay.current]}
				className="group px-0 sm:px-12"
			>
				<CarouselContent>
					{products.map((product) => (
						<CarouselItem key={product.id}>
							<Link
								href={`/product/${product.slug}`}
								className="relative block overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm"
							>
								<div className="relative min-h-75 sm:min-h-90 lg:min-h-105">
									<FadeInImage
										src={
											product.banner || product.images[0]
										}
										alt={product.name}
										fill
										priority
										sizes="(min-width: 1024px) 1120px, 100vw"
										className="object-cover"
									/>
									<div className="absolute inset-0 bg-linear-to-r from-background/95 via-background/70 to-background/10" />
									<div className="absolute inset-0 flex max-w-2xl flex-col justify-center gap-4 p-6 sm:p-10">
										<p className="w-fit rounded-full bg-primary px-3 py-1 text-xs font-black uppercase text-primary-foreground">
											Featured
										</p>
										<div className="space-y-3">
											<p className="text-sm font-bold uppercase text-primary">
												{product.category}
											</p>
											<h1 className="max-w-xl text-3xl font-black leading-tight text-foreground sm:text-5xl">
												{product.name}
											</h1>
											<p className="line-clamp-2 max-w-lg text-base font-medium leading-7 text-muted-foreground sm:text-lg">
												{product.description}
											</p>
										</div>
										<div className="flex flex-wrap items-center gap-3">
											<Button asChild size="lg">
												<span>View Product</span>
											</Button>
											<span className="text-xl font-black text-primary">
												{formatCurrency(product.price)}
											</span>
										</div>
									</div>
								</div>
							</Link>
						</CarouselItem>
					))}
				</CarouselContent>
				{products.length > 1 ? (
					<>
						<CarouselPrevious className="left-2 hidden bg-background shadow-md hover:bg-muted group-hover:flex sm:left-0" />
						<CarouselNext className="right-2 hidden bg-background shadow-md hover:bg-muted group-hover:flex sm:right-0" />
					</>
				) : null}
			</Carousel>
		</section>
	);
}

export default ProductCarousel;
