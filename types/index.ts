import type { z } from "zod";

import type {
	cartItemSchema,
	insertCartSchema,
	insertOrderItemSchema,
	insertOrderSchema,
	insertProductSchema,
	paymentMethodSchema,
	paymentResultSchema,
	shippingAddressSchema,
	signInFormSchema,
	signUpFormSchema,
	userProfileSchema,
} from "@/lib/validators";

export type Product = z.infer<typeof insertProductSchema> & {
	id: string;
};

export type SignInForm = z.infer<typeof signInFormSchema>;

export type SignUpForm = z.infer<typeof signUpFormSchema>;

export type UserProfile = z.infer<typeof userProfileSchema>;

export type CartItem = z.infer<typeof cartItemSchema>;

export type Cart = z.infer<typeof insertCartSchema>;

export type ShippingAddress = z.infer<typeof shippingAddressSchema>;

export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

export type OrderItem = z.infer<typeof insertOrderItemSchema>;

export type PaymentResult = z.infer<typeof paymentResultSchema>;

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
