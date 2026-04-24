import fs from "fs";
import path from "path";
import pool, { db } from "./db";
import { createHash } from "crypto";
import { eq, sql } from 'drizzle-orm';
import { usuario } from './database/schema';

async function initDatabase(): Promise<void> {
  const scriptPath = path.resolve(process.cwd(), "src", "sql", "init.sql");
  const script = fs.readFileSync(scriptPath, "utf-8");

  try {
    await db.execute(sql.raw(script));
    console.log("Banco inicializado com sucesso.");

    const users = await db.select({ id: usuario.id, senha: usuario.senha }).from(usuario);
    for (const row of users) {
      const { id, senha } = row;
      if (!senha || !/^[a-f0-9]{32}$/i.test(senha)) {
        const hash = createHash("md5").update(senha || "").digest("hex");
        await db.update(usuario).set({ senha: hash }).where(eq(usuario.id, id));
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
