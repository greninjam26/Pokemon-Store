import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchFormProps = Readonly<{
	className?: string;
	inputClassName?: string;
}>;

function SearchForm({ className, inputClassName }: SearchFormProps) {
	return (
		<form action="/search" className={cn("flex items-center gap-2", className)}>
			<div className="relative min-w-0 flex-1">
				<Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					name="query"
					placeholder="Search products"
					className={cn("pl-8", inputClassName)}
				/>
			</div>
			<Button type="submit" variant="outline">
				<Search data-icon="inline-start" />
				Search
			</Button>
		</form>
	);
}

export default SearchForm;
