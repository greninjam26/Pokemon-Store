import { MenuIcon } from "lucide-react";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import { getAllCategories } from "@/lib/action/product.action";
import { cn } from "@/lib/utils";

async function CategoryDrawer() {
	const categories = await getAllCategories();

	return (
		<Drawer direction="left">
			<DrawerTrigger asChild>
				<Button
					variant="outline"
					size="icon"
					className="mr-2 border-primary/25 bg-primary/10 text-primary shadow-sm hover:border-primary/50 hover:bg-primary hover:text-primary-foreground dark:bg-primary/15 dark:hover:bg-primary"
					aria-label="Browse categories"
				>
					<MenuIcon className="size-4.5" />
				</Button>
			</DrawerTrigger>
			<DrawerContent className="h-full max-w-sm">
				<DrawerHeader className="border-b">
					<DrawerTitle>Categories</DrawerTitle>
					<DrawerDescription>
						Browse Pokemon TCG products by category.
					</DrawerDescription>
				</DrawerHeader>
				<nav className="grid gap-1 p-4">
					{categories.length === 0 ? (
						<p className="rounded-lg border p-4 text-sm font-medium text-muted-foreground">
							No categories found.
						</p>
					) : (
						categories.map((category) => (
							<DrawerClose key={category.category} asChild>
								<Link
									href={{
										pathname: "/search",
										query: {
											category: category.category,
										},
									}}
									className={cn(
										buttonVariants({
											variant: "ghost",
										}),
										"h-auto justify-between gap-3 whitespace-normal px-3 py-3 text-left",
									)}
								>
									<span className="font-bold">
										{category.category}
									</span>
									<span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">
										{category.count}
									</span>
								</Link>
							</DrawerClose>
						))
					)}
				</nav>
			</DrawerContent>
		</Drawer>
	);
}

export default CategoryDrawer;
