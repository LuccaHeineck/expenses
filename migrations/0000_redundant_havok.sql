-- Baseline migration: Create initial schema
CREATE TABLE IF NOT EXISTS "usuario" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" varchar(120) NOT NULL,
	"login" varchar(80) NOT NULL,
	"senha" varchar(255) NOT NULL,
	"situacao" varchar(20) NOT NULL,
	CONSTRAINT "usuario_login_unique" UNIQUE("login")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lancamento" (
	"id" serial PRIMARY KEY NOT NULL,
	"descricao" varchar(255) NOT NULL,
	"data_lancamento" date NOT NULL,
	"valor" numeric(12, 2) NOT NULL,
	"tipo_lancamento" varchar(20) NOT NULL,
	"situacao" varchar(20) NOT NULL,
	"usuario_id" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lancamento" ADD CONSTRAINT "lancamento_usuario_id_usuario_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE no action ON UPDATE no action;