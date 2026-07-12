function FilterSkeleton() {
	return (
		<aside className="hidden h-fit space-y-5 rounded-lg border bg-card p-4 shadow-sm lg:block">
			<div className="h-6 w-24 animate-pulse rounded bg-muted" />
			{Array.from({ length: 4 }).map((_, groupIndex) => (
				<div key={groupIndex} className="space-y-2">
					<div className="h-4 w-20 animate-pulse rounded bg-muted" />
					<div className="grid gap-2">
						{Array.from({ length: groupIndex === 0 ? 4 : 2 }).map(
							(__, itemIndex) => (
								<div
									key={itemIndex}
									className="h-8 animate-pulse rounded-lg bg-muted"
								/>
							),
						)}
					</div>
				</div>
			))}
		</aside>
	);
}

function ProductCardSkeleton() {
	return (
		<div className="overflow-hidden rounded-lg border bg-card shadow-sm">
			<div className="aspect-square animate-pulse bg-muted" />
			<div className="space-y-4 p-4">
				<div className="space-y-2">
					<div className="h-3 w-24 animate-pulse rounded bg-muted" />
					<div className="h-6 w-full animate-pulse rounded bg-muted" />
					<div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
				</div>
				<div className="flex items-center justify-between gap-3">
					<div className="space-y-2">
						<div className="h-6 w-20 animate-pulse rounded bg-muted" />
						<div className="h-4 w-28 animate-pulse rounded bg-muted" />
					</div>
					<div className="h-8 w-20 animate-pulse rounded-lg bg-muted" />
				</div>
			</div>
		</div>
	);
}

function SearchLoadingPage() {
	return (
		<section className="space-y-6">
			<div className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
				<div className="space-y-2">
					<div className="h-4 w-32 animate-pulse rounded bg-muted" />
					<div className="h-4 w-72 max-w-full animate-pulse rounded bg-muted" />
				</div>
				<div className="flex gap-2">
					<div className="h-8 w-24 animate-pulse rounded-lg bg-muted lg:hidden" />
					<div className="h-8 w-40 animate-pulse rounded-lg bg-muted" />
					<div className="h-8 w-16 animate-pulse rounded-lg bg-muted" />
				</div>
			</div>
			<div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
				<FilterSkeleton />
				<div className="space-y-6">
					<div className="space-y-2">
						<div className="h-8 w-48 animate-pulse rounded bg-muted" />
						<div className="h-5 w-80 max-w-full animate-pulse rounded bg-muted" />
					</div>
					<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
						{Array.from({ length: 6 }).map((_, index) => (
							<ProductCardSkeleton key={index} />
						))}
					</div>
				</div>
			</div>
		</section>
	);
}

export default SearchLoadingPage;
