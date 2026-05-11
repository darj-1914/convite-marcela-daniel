import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.join(__dirname, 'migrations');

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT NOT NULL UNIQUE,
      executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function run() {
  await ensureMigrationsTable();

  const filenames = (await fs.readdir(migrationsDir))
    .filter((filename) => filename.endsWith('.sql'))
    .sort();

  for (const filename of filenames) {
    const existing = await pool.query(
      'SELECT filename FROM schema_migrations WHERE filename = $1',
      [filename]
    );

    if (existing.rowCount > 0) {
      continue;
    }

    const sql = await fs.readFile(path.join(migrationsDir, filename), 'utf8');

    await pool.query('BEGIN');
    try {
      await pool.query(sql);
      await pool.query('INSERT INTO schema_migrations(filename) VALUES ($1)', [filename]);
      await pool.query('COMMIT');
      console.log('Migracao aplicada:', filename);
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  }
}

run()
  .then(async () => {
    await pool.end();
    console.log('Migracoes concluídas.');
  })
  .catch(async (error) => {
    console.error('Erro ao rodar migracoes:', error);
    await pool.end();
    process.exit(1);
  });
