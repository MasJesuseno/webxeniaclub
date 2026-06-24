// This file loads .env values and OVERRIDES any system env vars
// because the system has a stale DATABASE_URL from the old MySQL setup
import { config } from "dotenv";
config({ override: true });

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"] as string,
  },
});
