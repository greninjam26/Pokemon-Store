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
	await prisma.product.createMany({ data: sampleData.products });

	console.log(`Seeded ${sampleData.products.length} TCG products.`);
}

main()
	.catch((error) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
