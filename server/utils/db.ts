import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../prisma/generated/client";

const connectionString =
	process.env.DATABASE_URL || process.env.DATABASE_DIRECT_URL;

const poolMax = Number.parseInt(
	process.env.PRISMA_POOL_MAX ??
		(process.env.NODE_ENV === "production" ? "1" : "10"),
	10,
);

if (!connectionString) {
	throw new Error(
		"Missing DATABASE_URL or DATABASE_DIRECT_URL in environment.",
	);
}

const prismaClientSingleton = () => {
	// Keep the pool tiny in serverless environments to avoid exhausting session-mode limits.
	const pool = new PrismaPg({
		connectionString,
		max: Number.isNaN(poolMax) ? 1 : poolMax,
	});
	return new PrismaClient({ adapter: pool });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

globalForPrisma.prisma = prisma;
