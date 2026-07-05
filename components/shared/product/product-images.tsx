"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import FadeInImage from "../fade-in-image";

type ProductImagesProps = Readonly<{
	images: string[];
	name: string;
}>;

function ProductImages({ images, name }: ProductImagesProps) {
	const [selectedIndex, setSelectedIndex] = useState(0);
	const selectedImage = images[selectedIndex];

	if (!selectedImage) {
		return null;
	}

	return (
		<div className="mx-auto w-full max-w-xl space-y-3 lg:mx-0">
			<div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
				<FadeInImage
					key={selectedImage}
					src={selectedImage}
					alt={`${name} selected view`}
					fill
					sizes="(min-width: 1024px) 576px, 100vw"
					priority
					className="object-contain p-8"
				/>
			</div>

			<div className="flex flex-wrap gap-3">
				{images.map((image, index) => (
					<button
						key={`${image}-${index}`}
						type="button"
						onClick={() => setSelectedIndex(index)}
						aria-label={`Show ${name} image ${index + 1}`}
						aria-pressed={selectedIndex === index}
						className={cn(
							"relative size-24 shrink-0 overflow-hidden rounded-lg border bg-muted transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:size-28",
							selectedIndex === index &&
								"border-primary ring-2 ring-primary/20",
						)}
					>
						<FadeInImage
							src={image}
							alt=""
							fill
							sizes="112px"
							className="object-contain p-3"
						/>
					</button>
				))}
			</div>
		</div>
	);
}

export default ProductImages;
