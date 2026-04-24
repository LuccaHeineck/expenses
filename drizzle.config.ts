import dotenv from 'dotenv';
import type { Config } from 'drizzle-kit';

dotenv.config();

const requiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const requiredPort = (name: string): number => {
  const value = Number(requiredEnv(name));
  if (Number.isNaN(value)) {
    throw new Error(`Invalid number in environment variable: ${name}`);
  }
  return value;
};

export default {
  schema: './src/database/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: requiredEnv('DB_HOST'),
    port: requiredPort('DB_PORT'),
    user: requiredEnv('DB_USER'),
    password: requiredEnv('DB_PASSWORD'),
    database: requiredEnv('DB_DATABASE'),
  },
} satisfies Config;