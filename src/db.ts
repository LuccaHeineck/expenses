import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import * as schema from './database/schema';

dotenv.config();

const getSSL = (): boolean | { rejectUnauthorized: boolean } => {
  const host = process.env.DB_HOST || 'localhost';
  if (host === 'localhost' || host === '127.0.0.1') {
    return false;
  }
  return { rejectUnauthorized: false };
};

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  ssl: getSSL(),
});

export const db = drizzle(pool, { schema });
export { pool };
export default pool;