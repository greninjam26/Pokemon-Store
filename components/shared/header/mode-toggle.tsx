"use client";

import { Moon, Sun, SunMoon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function ModeToggle() {
	const { setTheme, theme } = useTheme();

	const ThemeIcon =
		theme === "light" ? Sun : theme === "dark" ? Moon : SunMoon;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className="hover:bg-primary/10 hover:text-primary aria-expanded:border-transparent aria-expanded:bg-primary/10 focus-visible:border-transparent focus-visible:ring-0 focus-visible:ring-offset-0 dark:hover:bg-primary/20 dark:aria-expanded:bg-primary/20"
					size="icon"
					aria-label="Toggle theme"
				>
					<ThemeIcon className="size-4" />
					<span className="sr-only">Toggle theme</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuLabel>Theme</DropdownMenuLabel>
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
