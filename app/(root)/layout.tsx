import type { ReactNode } from "react";
import Footer from "@/components/footer";
import Header from "@/components/shared/header";

export default function RootLayout({
	children,
}: Readonly<{ children: ReactNode }>) {
	return (
		<div className="flex min-h-screen flex-col">
			<Header />
			<main className="flex-1 wrapper py-8 md:py-10">{children}</main>
			<Footer />
		</div>
	);
}
