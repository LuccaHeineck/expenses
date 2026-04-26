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

const getSSL = (): boolean | { rejectUnauthorized: boolean } => {
  const host = process.env.DB_HOST || 'localhost';
  if (host === 'localhost' || host === '127.0.0.1') {
    return false;
  }
  return { rejectUnauthorized: false };
};

export default {
  schema: './src/database/schema.ts',
  out: './drizzle',
  migrations: {
    schema: 'drizzle',
    table: '__drizzle_migrations',
  },
  dialect: 'postgresql',
  dbCredentials: {
    host: requiredEnv('DB_HOST'),
    port: requiredPort('DB_PORT'),
    user: requiredEnv('DB_USER'),
    password: requiredEnv('DB_PASSWORD'),
    database: requiredEnv('DB_DATABASE'),
    ssl: getSSL(),
  },
} satisfies Config;