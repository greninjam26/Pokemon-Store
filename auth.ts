import { PrismaAdapter } from "@auth/prisma-adapter";
import { compareSync } from "bcrypt-ts-edge";
import NextAuth, { type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import prisma from "@/db/prisma";

export const authConfig = {
	pages: {
		signIn: "/sign-in",
		error: "/sign-in",
	},
	session: {
		strategy: "jwt",
		maxAge: 30 * 24 * 60 * 60, //30 days
	},
	adapter: PrismaAdapter(prisma),
	providers: [
		CredentialsProvider({
			credentials: {
				email: { type: "email" },
				password: { type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials.password) {
					return null;
				}

				const user = await prisma.user.findUnique({
					where: {
						email: credentials.email as string,
					},
				});

				if (!user?.password) {
					return null;
				}

				const isValidPassword = compareSync(
					credentials.password as string,
					user.password,
				);

				if (!isValidPassword) {
					return null;
				}

				return {
					id: user.id,
					name: user.name,
					email: user.email,
					role: user.role,
				};
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.role = (user as { role?: string }).role;
			}

			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				const sessionUser = session.user as typeof session.user & {
					id?: string;
					role?: string;
				};

				if (token.sub) {
					sessionUser.id = token.sub;
				}
				sessionUser.role =
					typeof token.role === "string" ? token.role : undefined;
			}

			return session;
		},
	},
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
