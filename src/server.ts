import path from "path";
import express, { Request, Response } from "express";
import dotenv from "dotenv";
import pool from "./db";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.static(path.resolve(process.cwd(), "public")));

app.get("/api/lancamentos", async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, descricao, data_lancamento, valor, tipo_lancamento, situacao
       FROM lancamento
       ORDER BY data_lancamento DESC, id DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao listar lancamentos:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
