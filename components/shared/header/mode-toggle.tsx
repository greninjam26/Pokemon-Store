"use client";

import { Moon, Sun, SunMoon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

function ModeToggle({ className }: { className?: string }) {
	const { setTheme, theme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const ThemeIcon =
		mounted && theme === "light"
			? Sun
			: mounted && theme === "dark"
				? Moon
				: SunMoon;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className={cn(
						"hover:bg-primary/10 hover:text-primary aria-expanded:border-transparent aria-expanded:bg-primary/10 focus-visible:border-transparent focus-visible:ring-0 focus-visible:ring-offset-0 dark:hover:bg-primary/20 dark:aria-expanded:bg-primary/20",
						className,
					)}
					size="icon"
					aria-label="Toggle theme"
				>
					<ThemeIcon className="size-4" />
					<span className="sr-only">Toggle theme</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuLabel>Display Mode</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuCheckboxItem
					checked={theme === "light"}
					onCheckedChange={() => setTheme("light")}
				>
					<Sun />
					Light
				</DropdownMenuCheckboxItem>
				<DropdownMenuCheckboxItem
					checked={theme === "dark"}
					onCheckedChange={() => setTheme("dark")}
				>
					<Moon />
					Dark
				</DropdownMenuCheckboxItem>
				<DropdownMenuCheckboxItem
					checked={theme === "system"}
					onCheckedChange={() => setTheme("system")}
				>
					<SunMoon />
					System
				</DropdownMenuCheckboxItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export default ModeToggle;
