import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { APP_NAME } from "@/lib/constant";

export const metadata: Metadata = {
	title: "Sign In",
};

function SignInPage() {
	return (
		<div className="mx-auto w-full max-w-md">
			<Card>
				<CardHeader className="space-y-4">
					<Link href="/" className="flex-center">
						<Image
							src="/images/logo.svg"
							width={100}
							height={100}
							alt={`${APP_NAME} logo`}
							priority
						/>
					</Link>
					<div className="space-y-1.5 text-center">
						<CardTitle className="text-2xl font-semibold">
							Sign In
						</CardTitle>
						<CardDescription>
							Sign in to your account
						</CardDescription>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* form is here */}
				</CardContent>
			</Card>
		</div>
	);
}

export default SignInPage;
