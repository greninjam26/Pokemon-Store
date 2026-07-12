import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
	title: "Unauthorized Access",
};

function UnauthorizedPage() {
	return (
		<section className="container mx-auto flex min-h-[calc(100vh-220px)] flex-col items-center justify-center space-y-4 px-4 text-center">
			<h1 className="h1-bold">Unauthorized Access</h1>
			<p className="max-w-md text-base font-medium leading-7 text-muted-foreground">
				You do not have permission to access this page.
			</p>
			<Button asChild>
				<Link href="/">Return Home</Link>
			</Button>
		</section>
	);
}

export default UnauthorizedPage;
