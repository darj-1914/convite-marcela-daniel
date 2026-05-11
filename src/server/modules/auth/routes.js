import { Router } from 'express';
import { asyncHandler, createError } from '../../shared/http.js';
import { requireAuth } from '../../shared/auth.js';
import { validateUserCredentials } from './service.js';

export const authRouter = Router();

authRouter.get('/session', (req, res) => {
  res.json({
    authenticated: Boolean(req.session?.user),
    user: req.session?.user || null
  });
});

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const username = String(req.body?.username || '').trim();
    const password = String(req.body?.password || '').trim();

    if (!username || !password) {
      throw createError(400, 'Usuario e senha sao obrigatorios');
    }

    const user = await validateUserCredentials(username, password);
    if (!user) {
      throw createError(401, 'Usuario ou senha invalidos');
    }

    req.session.user = user;

    res.json({
      ok: true,
      user
    });
  })
);

authRouter.post(
  '/logout',
  requireAuth,
  asyncHandler(async (req, res) => {
    await new Promise((resolve, reject) => {
      req.session.destroy((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });

    res.json({ ok: true });
  })
);
