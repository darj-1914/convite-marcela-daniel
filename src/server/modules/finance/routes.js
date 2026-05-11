import { Router } from 'express';
import { requireAuth } from '../../shared/auth.js';
import { asyncHandler } from '../../shared/http.js';
import {
  createInvestment,
  createInstallmentPlan,
  createMilesProgram,
  createRecurringItem,
  createTransaction,
  getMonthlySummary,
  listCardMonthlyForecasts,
  listCards,
  listInstallmentPlans,
  listInvestments,
  listMilesPrograms,
  listRecurringItems,
  listTransactions,
  upsertCardMonthlyForecast,
  upsertRecurringOverride,
  updateInstallmentPlan,
  updateRecurringPaymentStatus,
  updateRecurringItem
} from './service.js';

export const financeRouter = Router();

financeRouter.use(requireAuth);

financeRouter.get(
  '/summary',
  asyncHandler(async (req, res) => {
    const payload = await getMonthlySummary(req.query.month);
    res.json(payload);
  })
);

financeRouter.get(
  '/cards',
  asyncHandler(async (req, res) => {
    res.json(await listCards());
  })
);

financeRouter.get(
  '/card-monthly-forecasts',
  asyncHandler(async (req, res) => {
    res.json(await listCardMonthlyForecasts(req.query.month));
  })
);

financeRouter.put(
  '/cards/:id/monthly-forecast',
  asyncHandler(async (req, res) => {
    res.json(await upsertCardMonthlyForecast(req.params.id, req.body || {}));
  })
);

financeRouter.get(
  '/installment-plans',
  asyncHandler(async (req, res) => {
    res.json(await listInstallmentPlans());
  })
);

financeRouter.post(
  '/installment-plans',
  asyncHandler(async (req, res) => {
    res.status(201).json(await createInstallmentPlan(req.body || {}));
  })
);

financeRouter.put(
  '/installment-plans/:id',
  asyncHandler(async (req, res) => {
    res.json(await updateInstallmentPlan(req.params.id, req.body || {}));
  })
);

financeRouter.get(
  '/recurring-items',
  asyncHandler(async (req, res) => {
    res.json(await listRecurringItems());
  })
);

financeRouter.post(
  '/recurring-items',
  asyncHandler(async (req, res) => {
    res.status(201).json(await createRecurringItem(req.body || {}));
  })
);

financeRouter.put(
  '/recurring-items/:id',
  asyncHandler(async (req, res) => {
    res.json(await updateRecurringItem(req.params.id, req.body || {}));
  })
);

financeRouter.put(
  '/recurring-items/:id/override',
  asyncHandler(async (req, res) => {
    res.json(await upsertRecurringOverride(req.params.id, req.body || {}));
  })
);

financeRouter.put(
  '/recurring-items/:id/payment-status',
  asyncHandler(async (req, res) => {
    res.json(
      await updateRecurringPaymentStatus(
        req.params.id,
        req.body?.month,
        req.body?.status
      )
    );
  })
);

financeRouter.get(
  '/transactions',
  asyncHandler(async (req, res) => {
    res.json(await listTransactions());
  })
);

financeRouter.post(
  '/transactions',
  asyncHandler(async (req, res) => {
    res.status(201).json(await createTransaction(req.body || {}));
  })
);

financeRouter.get(
  '/miles',
  asyncHandler(async (req, res) => {
    res.json(await listMilesPrograms());
  })
);

financeRouter.post(
  '/miles',
  asyncHandler(async (req, res) => {
    res.status(201).json(await createMilesProgram(req.body || {}));
  })
);

financeRouter.get(
  '/investments',
  asyncHandler(async (req, res) => {
    res.json(await listInvestments());
  })
);

financeRouter.post(
  '/investments',
  asyncHandler(async (req, res) => {
    res.status(201).json(await createInvestment(req.body || {}));
  })
);
