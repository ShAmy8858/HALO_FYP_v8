import fs from "fs/promises";
import path from "path";
import { pool, closeDb } from ".";

async function migrate() {
  const migrationPath = path.resolve(__dirname, "../../migrations/0000_initial.sql");
  const sql = await fs.readFile(migrationPath, "utf8");
  await pool.query(sql);
  console.log("[db] Applied migrations/0000_initial.sql");
}

migrate()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    void closeDb();
  });
