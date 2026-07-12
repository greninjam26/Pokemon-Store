import type { z } from "zod";

import type { ourFileRouter } from "@/app/api/uploadthing/core";
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

export type CartWithItems = Cart & {
	id: string;
	items: CartItem[];
	createdAt: string;
};

export type ShippingAddress = z.infer<typeof shippingAddressSchema>;

export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

export type OrderItem = z.infer<typeof insertOrderItemSchema>;

export type PaymentResult = z.infer<typeof paymentResultSchema>;

export type ActionResponse<TData = string> = {
	success: boolean;
	message: string;
	redirectTo?: string;
	data?: TData;
};

export type ProductReview = {
	id: string;
	rating: number;
	title: string;
	description: string;
	isVerifiedPurchase: boolean;
	createdAt: Date;
	updatedAt: Date;
	userName: string;
	user: {
		name: string;
		email: string | null;
	};
};

export type PayPalCaptureResponse = {
	id: string;
	status: string;
	payer?: {
		email_address?: string;
	};
	purchase_units?: {
		payments?: {
			captures?: {
				amount?: {
					value?: string;
				};
			}[];
		};
	}[];
};

export type OurFileRouter = typeof ourFileRouter;

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
