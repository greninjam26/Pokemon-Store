"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

type PaginationProps = Readonly<{
	page: number;
	totalPages: number;
	paramName?: string;
}>;

function Pagination({ page, totalPages, paramName = "page" }: PaginationProps) {
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();

	function goToPage(nextPage: number) {
		const params = new URLSearchParams(searchParams.toString());
		params.set(paramName, nextPage.toString());
		router.push(`${pathname}?${params.toString()}`);
	}

	if (totalPages <= 1) {
		return null;
	}

	return (
		<div className="flex items-center justify-end gap-2 border-t p-4">
			<span className="mr-auto text-sm font-medium text-muted-foreground">
				Page {page} of {totalPages}
			</span>
			<Button
				type="button"
				variant="outline"
				size="sm"
				disabled={page <= 1}
				onClick={() => goToPage(page - 1)}
			>
				<ChevronLeft className="size-4" />
				Previous
			</Button>
			<Button
				type="button"
				variant="outline"
				size="sm"
				disabled={page >= totalPages}
				onClick={() => goToPage(page + 1)}
			>
				Next
				<ChevronRight className="size-4" />
			</Button>
		</div>
	);
}

export default Pagination;
