import { APP_NAME } from "@/lib/constant";

function Footer() {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="border-t bg-background">
			<div className="wrapper flex flex-col gap-2 py-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
				<p>
					&copy; {currentYear} {APP_NAME}. All rights reserved.
				</p>
				<p>Built for Pokemon trainers and collectors.</p>
			</div>
		</footer>
	);
}

export default Footer;
