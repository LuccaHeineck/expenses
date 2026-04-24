import { describe, test, expect, afterAll } from '@jest/globals';
import pool from '../db';

describe('DB Connection', () => {
 
  test('Conexão com o banco de dados', async () => {
    const resposta = await pool.query('SELECT NOW()');
    expect(resposta).toBeDefined();
  });

  afterAll(async () => {
    await pool.end();
  });
});