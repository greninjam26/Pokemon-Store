import { cn } from "@/lib/utils";

type LoadingSpinnerProps = Readonly<{
	className?: string;
	label: string;
}>;

function LoadingSpinner({ className, label }: LoadingSpinnerProps) {
	return (
		<div
			role="status"
			className={cn(
				"flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center",
				className,
			)}
		>
			<div
				aria-hidden="true"
				className="size-16 animate-spin rounded-full border-6 border-muted border-t-primary"
			/>
			<p className="text-base text-muted-foreground">{label}</p>
		</div>
	);
}

export default LoadingSpinner;
