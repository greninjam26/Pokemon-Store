import Image from "next/image";
import Link from "next/link";

import { APP_NAME } from "@/lib/constant";
import AccountNav from "./account-nav";
import CategoryDrawer from "./category-drawer";
import Menu from "./menu";

function Header() {
	return (
		<header className="w-full border-b bg-card/95 shadow-sm">
			<div className="wrapper flex-between py-3">
				<div className="flex-start">
					<CategoryDrawer />
					<Link href="/" className="flex-start">
						<Image
							priority={true}
							src="/images/logo.svg"
							width={48}
							height={48}
							alt={`${APP_NAME} logo`}
						/>
						<span className="ml-3 hidden text-2xl font-black leading-none text-primary lg:block">
							{APP_NAME}
						</span>
					</Link>
					<AccountNav />
				</div>
				<Menu />
			</div>
		</header>
	);
}

export default Header;
