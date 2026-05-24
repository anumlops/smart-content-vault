import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

try {
  const tables = await p.$queryRawUnsafe(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
  );
  console.log("Tables:");
  for (const t of tables) {
    console.log("  -", t.table_name);
  }

  const cols = await p.$queryRawUnsafe(
    "SELECT table_name, column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema = 'public' ORDER BY table_name, ordinal_position"
  );
  console.log("\nColumns:");
  for (const c of cols) {
    console.log(`  ${c.table_name}.${c.column_name} (${c.data_type}, nullable: ${c.is_nullable})`);
  }

  console.log("\nConnection: OK");
} catch (e) {
  console.error("Error:", e);
} finally {
  await p.$disconnect();
}
