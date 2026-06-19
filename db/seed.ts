import "dotenv/config";
import { PrismaClient } from "@/lib/generated/prisma/client";
import sampleData from "./simple-data";
import { PrismaPg } from "@prisma/adapter-pg";
const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });

async function main() {
	const prisma = new PrismaClient({ adapter });
	await prisma.product.deleteMany();
	await prisma.product.createMany({ data: sampleData.products });
	console.log("Database seeded successfully.");
}
main();
