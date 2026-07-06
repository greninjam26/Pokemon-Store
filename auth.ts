import { PrismaAdapter } from "@auth/prisma-adapter";
import { compareSync } from "bcrypt-ts-edge";
import NextAuth, { type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import prisma from "@/db/prisma";

function getUserDisplayName(name: string | null, email: string | null) {
	if (name && name !== "NO_NAME") {
		return name;
	}

	return email?.split("@")[0] ?? "User";
}

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
					name: getUserDisplayName(user.name, user.email),
					email: user.email,
					role: user.role,
				};
			},
		}),
	],
	callbacks: {
		async jwt({ token, user, trigger, session }) {
			if (user) {
				token.role = (user as { role?: string }).role;
			}

			if (trigger === "update") {
				const updatedSession = session as
					| { user?: { name?: unknown; email?: unknown } }
					| undefined;

				if (typeof updatedSession?.user?.name === "string") {
					token.name = getUserDisplayName(
						updatedSession.user.name,
						typeof token.email === "string" ? token.email : null,
					);
				}

				if (typeof updatedSession?.user?.email === "string") {
					token.email = updatedSession.user.email;
				}
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
				if (typeof token.email === "string") {
					sessionUser.email = token.email;
				}
				sessionUser.role =
					typeof token.role === "string" ? token.role : undefined;
			}

			return session;
		},
	},
} satisfies NextAuthConfig;

export const {
	handlers,
	auth,
	signIn,
	signOut,
	unstable_update: updateSession,
} = NextAuth(authConfig);
