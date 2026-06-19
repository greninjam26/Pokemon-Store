import { APP_NAME } from "@/lib/constant";

function Footer() {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="border-t bg-card">
			<div className="wrapper flex flex-col gap-2 py-6 text-base font-medium leading-7 text-muted-foreground md:flex-row md:items-center md:justify-between">
				<p>
					&copy; {currentYear} {APP_NAME}. All rights reserved.
				</p>
				<p>Made for Pokemon trainers, collectors, and fans.</p>
			</div>
		</footer>
	);
}

export default Footer;
