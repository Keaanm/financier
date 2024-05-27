import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "./index";

async function main() {
  console.log("Running migrations...");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migrations complete!");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(0);
});
