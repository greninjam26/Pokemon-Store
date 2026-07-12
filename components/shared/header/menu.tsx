import { EllipsisVertical, ShoppingCart } from "lucide-react";
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
import SearchForm from "./search-form";
import UserButton from "./user-button";

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
				<UserButton />
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
								Quick access to your cart, account, and display
								settings.
							</SheetDescription>
						</SheetHeader>
						<div className="flex flex-col gap-3 px-4">
							<div className="flex items-center justify-between rounded-lg border p-3">
								<span className="text-sm font-medium">
									Theme
								</span>
								<ModeToggle className="border border-border" />
							</div>
							<SearchForm className="flex-col items-stretch" />
							<SheetClose asChild>
								<Button
									asChild
									variant="ghost"
									className="justify-start text-base"
								>
									<Link href="/cart">
										<ShoppingCart />
										Cart
									</Link>
								</Button>
							</SheetClose>
							<UserButton className="justify-start text-base" />
						</div>
					</SheetContent>
				</Sheet>
			</div>
		</>
	);
}

export default Menu;
