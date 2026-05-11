import { Router } from 'express';
import { requireAuth } from '../../shared/auth.js';
import { asyncHandler } from '../../shared/http.js';
import { getBootstrapData } from '../finance/service.js';

export const bootstrapRouter = Router();

bootstrapRouter.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const payload = await getBootstrapData(req.query.month);
    res.json(payload);
  })
);
