import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/lib/generated/prisma/client";
import sampleData from "./simple-data";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
	throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
	await prisma.product.deleteMany();
	await prisma.account.deleteMany();
	await prisma.session.deleteMany();
	await prisma.verificationToken.deleteMany();
	await prisma.user.deleteMany();

	await prisma.product.createMany({ data: sampleData.products });
	await prisma.user.createMany({ data: sampleData.users });

	console.log(`Seeded ${sampleData.products.length} TCG products.`);
	console.log(`Seeded ${sampleData.users.length} users.`);
}

main()
	.catch((error) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
