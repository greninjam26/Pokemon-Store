import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
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
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
