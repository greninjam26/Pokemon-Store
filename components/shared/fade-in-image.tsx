"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

type FadeInImageProps = ImageProps;

function FadeInImage({
	alt,
	className,
	onLoadingComplete,
	...props
}: FadeInImageProps) {
	const [isLoaded, setIsLoaded] = useState(false);

	return (
		<Image
			alt={alt}
			className={cn(
				"opacity-0 transition-opacity duration-300 ease-out",
				isLoaded && "opacity-100",
				className,
			)}
			onLoadingComplete={(image) => {
				setIsLoaded(true);
				onLoadingComplete?.(image);
			}}
			{...props}
		/>
	);
}

export default FadeInImage;
