import { describe, it, test, expect, beforeAll, beforeEach, afterEach, afterAll } from '@jest/globals';
import pool from '../db';

describe('Testes de Banco de Dados', () => {
    let client: any;

    // Para manter DB limpo, fazemos rollback depois de todas alterações
    beforeAll(async () => {
        client = await pool.connect();
        await client.query('BEGIN');
    });

    afterAll(async () => {
        await client.query('ROLLBACK');
        await client.release();
        await pool.end();
    })

    test('Inserção de dados', async () => {
        const result = await client.query(
            'INSERT INTO usuario (nome, login, senha, situacao) VALUES ($1, $2, MD5($3), $4) RETURNING id, nome, login, situacao',
            ['Testador', 'teste', 'teste', 'ATIVO']
        );

        // Verifica se a inserção deu certo
        expect(result.rowCount).toBe(1);
        expect(result.rows[0].nome).toBe('Testador');
        expect(result.rows[0].login).toBe('teste');
        expect(result.rows[0].situacao).toBe('ATIVO');
    });

    test('Consulta de dados', async () => {
        const result = await client.query('SELECT * FROM usuario WHERE login = $1', ['teste']);
        expect(result.rowCount).toBe(1);
        expect(result.rows[0].nome).toBe('Testador');
        expect(result.rows[0].login).toBe('teste');
        expect(result.rows[0].situacao).toBe('ATIVO');
    });

    test('Atualização de dados', async () => {
        const result = await client.query(
            'UPDATE usuario SET situacao = $1 WHERE login = $2 RETURNING situacao',
            ['INATIVO', 'teste']
        );
        expect(result.rowCount).toBe(1);
        expect(result.rows[0].situacao).toBe('INATIVO');
    });

    test('Exclusão de dados', async () => {
        const result = await client.query('DELETE FROM usuario WHERE login = $1 RETURNING id', ['teste']);
        expect(result.rowCount).toBe(1);
    });
});