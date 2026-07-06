"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const accountLinks = [
	{
		href: "/account/profile",
		label: "Profile",
	},
	{
		href: "/account/orders",
		label: "Orders",
	},
];

function AccountNav() {
	const pathname = usePathname();

	if (!pathname.startsWith("/account")) {
		return null;
	}

	return (
		<nav className="ml-6 hidden items-center gap-5 md:flex">
			{accountLinks.map((link) => (
				<Link
					key={link.href}
					href={link.href}
					className={cn(
						"text-sm font-bold transition-colors hover:text-primary",
						pathname.startsWith(link.href)
							? "text-primary"
							: "text-muted-foreground",
					)}
				>
					{link.label}
				</Link>
			))}
		</nav>
	);
}

export default AccountNav;
