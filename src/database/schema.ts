import { date, integer, numeric, pgTable, serial, varchar } from 'drizzle-orm/pg-core';

export const usuario = pgTable('usuario', {
  id: serial('id').primaryKey(),
  nome: varchar('nome', { length: 120 }).notNull(),
  login: varchar('login', { length: 80 }).notNull().unique(),
  senha: varchar('senha', { length: 255 }).notNull(),
  situacao: varchar('situacao', { length: 20 }).notNull(),
});

export const lancamento = pgTable('lancamento', {
  id: serial('id').primaryKey(),
  descricao: varchar('descricao', { length: 255 }).notNull(),
  data_lancamento: date('data_lancamento').notNull(),
  valor: numeric('valor', { precision: 12, scale: 2, mode: 'number' }).notNull(),
  tipo_lancamento: varchar('tipo_lancamento', { length: 20 }).notNull(),
  situacao: varchar('situacao', { length: 20 }).notNull(),
  usuario_id: integer('usuario_id').notNull().references(() => usuario.id),
});

export type Usuario = typeof usuario.$inferSelect;
export type Lancamento = typeof lancamento.$inferSelect;