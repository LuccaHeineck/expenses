import fs from "fs";
import path from "path";
import pool from "./db";

async function initDatabase(): Promise<void> {
  const scriptPath = path.resolve(process.cwd(), "src", "sql", "init.sql");
  const sql = fs.readFileSync(scriptPath, "utf-8");

  try {
    await pool.query(sql);
    console.log("Banco inicializado com sucesso.");
  } catch (error) {
    console.error("Erro ao inicializar banco:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

void initDatabase();
