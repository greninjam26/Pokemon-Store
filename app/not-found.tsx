import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constant";

function NotFoundPage() {
	return (
		<div className="wrapper flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center">
			<Image
				src="/images/logo.svg"
				width={48}
				height={48}
				alt={`${APP_NAME} logo`}
				priority={true}
			/>
			<div className="flex max-w-md flex-col items-center gap-4">
				<p className="text-sm font-medium text-muted-foreground">404</p>
				<h1 className="h1-bold">Page not found</h1>
				<p className="text-base leading-7 text-muted-foreground">
					We could not find the page you were looking for. It may have
					moved, or the link may be outdated.
				</p>
				<Button asChild variant="outline">
					<Link href="/">Back to Home</Link>
				</Button>
			</div>
		</div>
	);
}

export default NotFoundPage;
