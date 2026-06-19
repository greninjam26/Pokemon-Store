function LoadingPage() {
	return (
		<div className="wrapper flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
			<div className="size-16 animate-spin rounded-full border-6 border-muted border-t-primary" />
			<p className="text-base text-muted-foreground">
				Loading the Pokemon Store...
			</p>
		</div>
	);
}

export default LoadingPage;
