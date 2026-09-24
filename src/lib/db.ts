import path from "node:path";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Must match the fallback in prisma.config.ts: a relative "file:" URL resolves
// differently for the Prisma CLI (relative to schema.prisma) than for the
// runtime client (relative to process.cwd()), so both sides compute the same
// absolute path explicitly instead of relying on Prisma's relative resolution.
const defaultDatabaseUrl = `file:${path.join(process.cwd(), "prisma", "dev.db")}`;

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({ datasourceUrl: process.env.DATABASE_URL ?? defaultDatabaseUrl });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
