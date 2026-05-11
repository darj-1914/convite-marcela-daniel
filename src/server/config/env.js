import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..', '..');

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  databaseUrl:
    process.env.DATABASE_URL || 'postgresql://refynce:refynce@localhost:5432/refynce',
  sessionSecret: process.env.SESSION_SECRET || 'refynce-local-secret',
  clientDistPath: path.resolve(projectRoot, process.env.CLIENT_DIST_PATH || 'client/dist'),
  projectRoot
};
