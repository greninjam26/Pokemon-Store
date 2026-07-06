import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { getOrderById } from "@/lib/action/order.action";
import OrderDetailsTable from "./order-details-table";

export const metadata: Metadata = {
	title: "Order Details",
};

type OrderDetailsPageProps = Readonly<{
	params: Promise<{
		id: string;
	}>;
}>;

async function OrderDetailsPage({ params }: OrderDetailsPageProps) {
	const { id } = await params;
	const session = await auth();
	const isAdmin =
		(session?.user as { role?: string } | undefined)?.role === "admin";
	const order = await getOrderById(id);

	if (!order) {
		notFound();
	}

	return (
		<OrderDetailsTable
			order={order}
			isAdmin={isAdmin}
			paypalClientId={process.env.PAYPAL_CLIENT_ID || "sb"}
		/>
	);
}

export default OrderDetailsPage;
