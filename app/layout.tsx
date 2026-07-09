import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";

import { ourFileRouter } from "@/app/api/uploadthing/core";
import { Toaster } from "@/components/ui/sonner";
import { APP_DESCRIPTION, APP_NAME, SERVER_URL } from "@/lib/constant";
import "./globals.css";

export const metadata: Metadata = {
	title: APP_NAME,
	description: APP_DESCRIPTION,
	metadataBase: new URL(SERVER_URL),
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className="antialiased">
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<NextSSRPlugin
						routerConfig={extractRouterConfig(ourFileRouter)}
					/>
					{children}
					<Toaster />
				</ThemeProvider>
			</body>
		</html>
	);
}
