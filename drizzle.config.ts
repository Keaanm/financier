import { defineConfig } from "drizzle-kit";
export default defineConfig({
  schema: "./server/lib/db/schema.ts",
  dialect: "postgresql",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DB_URL!,
  },
  verbose: true,
  strict: true,
});
