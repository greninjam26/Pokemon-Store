import type { Metadata } from "next";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { getUserProfile } from "@/lib/action/user.actions";
import ProfileForm from "./profile-form";

export const metadata: Metadata = {
	title: "Profile",
};

async function AccountProfilePage() {
	const user = await getUserProfile();

	return (
		<section className="mx-auto max-w-3xl space-y-6">
			<div className="space-y-2">
				<h1 className="h1-bold">Profile</h1>
				<p className="text-base font-medium leading-7 text-muted-foreground">
					Update your account details and password.
				</p>
			</div>

			<Card className="rounded-lg">
				<CardHeader>
					<CardTitle>Account Details</CardTitle>
					<CardDescription>
						Changes here update how your account appears across the
						store.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ProfileForm user={user} />
				</CardContent>
			</Card>
		</section>
	);
}

export default AccountProfilePage;
