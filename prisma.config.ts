import "dotenv/config";
import path from "node:path";
import { defineConfig } from "prisma/config";

// Falls back to a SQLite file at prisma/dev.db when DATABASE_URL isn't set,
// so `npm install` / `prisma generate` / `prisma migrate` work on a fresh
// clone with no .env. Set DATABASE_URL explicitly (in .env or the shell) to
// point at Postgres/MySQL/etc. instead. schema.prisma's own `env("DATABASE_URL")`
// call is evaluated directly by some CLI commands (e.g. migrate), bypassing the
// `datasource.url` override below, so the fallback is also applied to
// process.env itself here.
const defaultDatabaseUrl = `file:${path.join(__dirname, "prisma", "dev.db")}`;
process.env.DATABASE_URL ??= defaultDatabaseUrl;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
