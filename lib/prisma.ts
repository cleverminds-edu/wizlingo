import { PrismaClient } from "@/app/generated/prisma/client";

function createPrismaClient() {
  const url = process.env.DATABASE_URL ?? "";

  if (url.includes("neon.tech") || url.includes("neon.db") || url.includes("neondb")) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaNeon } = require("@prisma/adapter-neon");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { neonConfig } = require("@neondatabase/serverless");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    neonConfig.webSocketConstructor = require("ws");
    const adapter = new PrismaNeon({ connectionString: url });
    return new PrismaClient({ adapter });
  }

  // Local PostgreSQL
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Pool } = require("pg");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaPg } = require("@prisma/adapter-pg");
  const pool = new Pool({ connectionString: url });
  return new PrismaClient({ adapter: new PrismaPg(pool) });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
