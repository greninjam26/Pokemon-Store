import type { z } from "zod";

import type {
	cartItemSchema,
	insertCartSchema,
	insertOrderItemSchema,
	insertOrderSchema,
	insertProductSchema,
	paymentMethodSchema,
	shippingAddressSchema,
	signInFormSchema,
	signUpFormSchema,
} from "@/lib/validators";

export type Product = z.infer<typeof insertProductSchema> & {
	id: string;
};

export type SignInForm = z.infer<typeof signInFormSchema>;

export type SignUpForm = z.infer<typeof signUpFormSchema>;

export type CartItem = z.infer<typeof cartItemSchema>;

export type Cart = z.infer<typeof insertCartSchema>;

export type ShippingAddress = z.infer<typeof shippingAddressSchema>;

export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

export type OrderItem = z.infer<typeof insertOrderItemSchema>;

export type Order = z.infer<typeof insertOrderSchema> & {
	id: string;
	createdAt: Date;
	updatedAt: Date;
	isPaid: boolean;
	paidAt: Date | null;
	isDelivered: boolean;
	deliveredAt: Date | null;
	orderItems: OrderItem[];
	user?: {
		name: string;
		email: string | null;
	};
};
