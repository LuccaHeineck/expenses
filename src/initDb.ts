import fs from "fs";
import path from "path";
import pool from "./db";
import { createHash } from "crypto";

async function initDatabase(): Promise<void> {
  const scriptPath = path.resolve(process.cwd(), "src", "sql", "init.sql");
  const sql = fs.readFileSync(scriptPath, "utf-8");

  try {
    await pool.query(sql);
    console.log("Banco inicializado com sucesso.");

    const users = await pool.query("SELECT id, senha FROM usuario");
    for (const row of users.rows) {
      const { id, senha } = row as { id: number; senha: string };
      if (!senha || !/^[a-f0-9]{32}$/i.test(senha)) {
        const hash = createHash("md5").update(senha || "").digest("hex");
        await pool.query("UPDATE usuario SET senha = $1 WHERE id = $2", [hash, id]);
        console.log(`Senha do usuario id=${id} atualizada para MD5.`);
      }
    }
  } catch (error) {
    console.error("Erro ao inicializar banco:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

void initDatabase();
