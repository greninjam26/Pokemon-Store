import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { APP_NAME } from "@/lib/constant";
import SignUpForm from "./sign-up-form";

export const metadata: Metadata = {
	title: "Sign Up",
};

type SignUpPageProps = Readonly<{
	searchParams: Promise<{
		callbackUrl?: string;
	}>;
}>;

async function SignUpPage({ searchParams }: SignUpPageProps) {
	const { callbackUrl } = await searchParams;
	const session = await auth();

	if (session) {
		redirect(callbackUrl || "/");
	}

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
							Sign Up
						</CardTitle>
						<CardDescription>Create your account</CardDescription>
					</div>
				</CardHeader>
				<CardContent>
					<SignUpForm />
				</CardContent>
			</Card>
		</div>
	);
}

export default SignUpPage;
