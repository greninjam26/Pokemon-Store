import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

import { auth } from "@/auth";

const f = createUploadthing();

export const ourFileRouter = {
	productImageUploader: f({
		image: {
			maxFileSize: "4MB",
			maxFileCount: 8,
		},
	})
		.middleware(async () => {
			const session = await auth();
			const role = (session?.user as { role?: string } | undefined)?.role;
			const userId = (session?.user as { id?: string } | undefined)?.id;

			if (!userId || role !== "admin") {
				throw new UploadThingError("Unauthorized");
			}

			return { userId };
		})
		.onUploadComplete(async ({ metadata, file }) => {
			return {
				uploadedBy: metadata.userId,
				url: file.ufsUrl,
			};
		}),
} satisfies FileRouter;
