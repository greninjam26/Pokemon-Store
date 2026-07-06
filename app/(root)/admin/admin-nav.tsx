"use client";

import {
	BarChart3,
	Boxes,
	ClipboardList,
	LayoutDashboard,
	Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const adminLinks = [
	{
		href: "/admin",
		label: "Dashboard",
		icon: LayoutDashboard,
		exact: true,
	},
	{
		href: "/admin/products",
		label: "Products",
		icon: Boxes,
	},
	{
		href: "/admin/orders",
		label: "Orders",
		icon: ClipboardList,
	},
	{
		href: "/admin/users",
		label: "Users",
		icon: Users,
	},
	{
		href: "/admin/reports",
		label: "Reports",
		icon: BarChart3,
	},
];

function AdminNav() {
	const pathname = usePathname();

	return (
		<nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
			{adminLinks.map((link) => {
				const Icon = link.icon;
				const isActive = link.exact
					? pathname === link.href
					: pathname.startsWith(link.href);

				return (
					<Link
						key={link.href}
						href={link.href}
						className={cn(
							"flex min-h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-bold transition-colors",
							isActive
								? "bg-primary text-primary-foreground"
								: "text-muted-foreground hover:bg-muted hover:text-foreground",
						)}
					>
						<Icon className="size-4" />
						{link.label}
					</Link>
				);
			})}
		</nav>
	);
}

export default AdminNav;
