import { History, LogOut, UserIcon } from "lucide-react";
import Link from "next/link";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutUser } from "@/lib/action/user.actions";
import { cn } from "@/lib/utils";

type UserButtonProps = Readonly<{
	className?: string;
}>;

async function UserButton({ className }: UserButtonProps) {
	const session = await auth();

	if (!session?.user) {
		return (
			<Button asChild className={className}>
				<Link href="/sign-in">
					<UserIcon />
					Sign In
				</Link>
			</Button>
		);
	}

	const name = session.user.name || "User";
	const email = session.user.email;
	const initial = name.charAt(0).toUpperCase();
	const role = (session.user as { role?: string }).role;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className={cn("gap-2", className)}
					aria-label="Open user menu"
				>
					<span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
						{initial}
					</span>
					<span className="max-w-28 truncate">{name}</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel>
					<span className="block truncate text-sm text-foreground">
						{name}
					</span>
					{email ? (
						<span className="block truncate text-xs font-normal">
							{email}
						</span>
					) : null}
					{role ? (
						<span className="mt-1 block text-xs font-normal capitalize">
							{role}
						</span>
					) : null}
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link href="/account/profile">
						<UserIcon />
						Profile
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link href="/account/orders">
						<History />
						Order History
					</Link>
				</DropdownMenuItem>
				<form action={signOutUser}>
					<DropdownMenuItem asChild>
						<button type="submit" className="w-full">
							<LogOut />
							Sign Out
						</button>
					</DropdownMenuItem>
				</form>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export default UserButton;
