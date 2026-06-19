import { EllipsisVertical, ShoppingCart, UserIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import ModeToggle from "./mode-toggle";

function Menu() {
	return (
		<>
			<div className="hidden items-center gap-2 md:flex">
				<ModeToggle />
				<Button asChild variant="ghost">
					<Link href="/cart">
						<ShoppingCart />
						Cart
					</Link>
				</Button>
				<Button asChild>
					<Link href="/sign-in">
						<UserIcon />
						Sign In
					</Link>
				</Button>
			</div>
			<div className="md:hidden">
				<Sheet>
					<SheetTrigger asChild>
						<Button
							variant="ghost"
							size="icon-lg"
							aria-label="Open menu"
						>
							<EllipsisVertical className="size-5" />
						</Button>
					</SheetTrigger>
					<SheetContent side="right">
						<SheetHeader>
							<SheetTitle>Menu</SheetTitle>
							<SheetDescription>
								Manage your store navigation and display mode.
							</SheetDescription>
						</SheetHeader>
						<div className="flex flex-col gap-3 px-4">
							<div className="flex items-center justify-between rounded-lg border p-3">
								<span className="text-sm font-medium">
									Theme
								</span>
								<ModeToggle className="border border-border" />
							</div>
							<SheetClose asChild>
								<Button
									asChild
									variant="ghost"
									className="justify-start"
								>
									<Link href="/cart">
										<ShoppingCart />
										Cart
									</Link>
								</Button>
							</SheetClose>
							<SheetClose asChild>
								<Button asChild className="justify-start">
									<Link href="/sign-in">
										<UserIcon />
										Sign In
									</Link>
								</Button>
							</SheetClose>
						</div>
					</SheetContent>
				</Sheet>
			</div>
		</>
	);
}

export default Menu;
