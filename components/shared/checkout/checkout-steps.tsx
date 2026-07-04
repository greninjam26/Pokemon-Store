import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const checkoutSteps = [
	{ key: "sign-in", label: "Sign In" },
	{ key: "shipping", label: "Shipping" },
	{ key: "payment", label: "Payment" },
	{ key: "place-order", label: "Place Order" },
] as const;

type CheckoutStep = (typeof checkoutSteps)[number]["key"];

type CheckoutStepsProps = Readonly<{
	currentStep: CheckoutStep;
}>;

function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
	const currentStepIndex = checkoutSteps.findIndex(
		(step) => step.key === currentStep,
	);

	return (
		<nav aria-label="Checkout progress" className="w-full">
			<ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
				{checkoutSteps.map((step, index) => {
					const isComplete = index < currentStepIndex;
					const isCurrent = index === currentStepIndex;

					return (
						<li
							key={step.key}
							className={cn(
								"flex items-center justify-center gap-2 border-b-2 pb-3 text-sm font-bold text-muted-foreground",
								isComplete && "border-primary text-primary",
								isCurrent && "border-primary text-foreground",
								!isComplete && !isCurrent && "border-muted",
							)}
							aria-current={isCurrent ? "step" : undefined}
						>
							<span
								className={cn(
									"flex size-6 items-center justify-center rounded-full border text-xs",
									isComplete &&
										"border-primary bg-primary text-primary-foreground",
									isCurrent && "border-primary text-primary",
									!isComplete &&
										!isCurrent &&
										"border-muted-foreground/30",
								)}
							>
								{isComplete ? (
									<Check className="size-3.5" />
								) : (
									index + 1
								)}
							</span>
							<span>{step.label}</span>
						</li>
					);
				})}
			</ol>
		</nav>
	);
}

export default CheckoutSteps;
