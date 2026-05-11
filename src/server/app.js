import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { env } from './config/env.js';
import { pool } from './db/pool.js';
import { authRouter } from './modules/auth/routes.js';
import { bootstrapRouter } from './modules/bootstrap/routes.js';
import { financeRouter } from './modules/finance/routes.js';
import { errorHandler, notFoundHandler } from './shared/http.js';

const PgStore = connectPgSimple(session);

export function createApp() {
  const app = express();
  const hasBuiltClient = fs.existsSync(env.clientDistPath);

  app.use(express.json());
  app.use(
    session({
      store: new PgStore({
        pool,
        tableName: 'user_sessions',
        createTableIfMissing: true
      }),
      secret: env.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        maxAge: 1000 * 60 * 60 * 24 * 30
      }
    })
  );

  app.get('/api/health', (req, res) => {
    res.json({ ok: true });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/bootstrap', bootstrapRouter);
  app.use('/api/finance', financeRouter);

  if (hasBuiltClient) {
    app.use(express.static(env.clientDistPath));

    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        next();
        return;
      }

      res.sendFile(path.join(env.clientDistPath, 'index.html'));
    });
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
