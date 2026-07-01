import type { ReactNode } from "react";

function AuthLayout({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<main className="flex min-h-screen items-center justify-center px-4 py-12">
			{children}
		</main>
	);
}

export default AuthLayout;
