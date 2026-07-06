import { Loader2 } from "lucide-react";

function AccountOrdersLoadingPage() {
	return (
		<div className="flex min-h-[50vh] items-center justify-center">
			<Loader2 className="size-12 animate-spin text-primary" />
		</div>
	);
}

export default AccountOrdersLoadingPage;
