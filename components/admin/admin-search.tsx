import { Search } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AdminSearchProps = Readonly<{
	action: string;
	placeholder: string;
	defaultValue?: string;
	clearHref?: string;
}>;

function AdminSearch({
	action,
	placeholder,
	defaultValue = "",
	clearHref = action,
}: AdminSearchProps) {
	return (
		<div className="flex flex-col gap-2 md:flex-row md:items-center">
			<form className="flex items-center gap-2" action={action}>
				<div className="relative">
					<Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						name="query"
						placeholder={placeholder}
						className="pl-8 sm:w-64"
						defaultValue={defaultValue}
					/>
				</div>
				<Button type="submit" variant="outline">
					Search
				</Button>
			</form>
			{defaultValue ? (
				<Button asChild variant="ghost">
					<Link href={clearHref}>Clear</Link>
				</Button>
			) : null}
		</div>
	);
}

export default AdminSearch;
