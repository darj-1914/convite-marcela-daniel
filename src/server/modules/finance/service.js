import crypto from 'node:crypto';
import dayjs from 'dayjs';
import { query } from '../../db/pool.js';

function roundCurrency(value) {
  return Number((Number(value) || 0).toFixed(2));
}

function getMonthContext(monthValue) {
  const month = monthValue || dayjs().format('YYYY-MM');
  const start = dayjs(`${month}-01`);
  const end = start.endOf('month');

  return {
    month,
    start,
    end,
    daysInMonth: end.date()
  };
}

function mapSettings(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    defaultSalary: Number(row.default_salary),
    portfolioLink: row.portfolio_link,
    ownerName: row.owner_name,
    currentMonth: row.current_month
  };
}

function mapCard(row) {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    color: row.color,
    dueDay: row.due_day
  };
}

function mapRecurringItem(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    type: row.type,
    amount: Number(row.amount),
    billingCycle: row.billing_cycle,
    dueDay: row.due_day,
    paymentChannel: row.payment_channel,
    cardId: row.card_id,
    canCut: row.can_cut,
    includeInMonthlyForecast: row.include_in_monthly_forecast,
    active: row.active,
    notes: row.notes
  };
}

function mapTransaction(row) {
  return {
    id: row.id,
    date: dayjs(row.transaction_date).format('YYYY-MM-DD'),
    description: row.description,
    amount: Number(row.amount),
    type: row.type,
    category: row.category,
    paymentChannel: row.payment_channel,
    cardId: row.card_id,
    notes: row.notes
  };
}

function mapMilesProgram(row) {
  return {
    id: row.id,
    name: row.name,
    balance: Number(row.balance),
    expiryDate: row.expiry_date ? dayjs(row.expiry_date).format('YYYY-MM-DD') : '',
    notes: row.notes
  };
}

function mapInvestment(row) {
  return {
    id: row.id,
    date: dayjs(row.investment_date).format('YYYY-MM-DD'),
    platform: row.platform,
    asset: row.asset,
    amount: Number(row.amount),
    type: row.type,
    notes: row.notes
  };
}

function mapPaymentStatus(row) {
  return {
    recurringItemId: row.recurring_item_id,
    monthRef: row.month_ref,
    status: row.status,
    paidAt: row.paid_at ? dayjs(row.paid_at).format('YYYY-MM-DDTHH:mm:ss') : null
  };
}

function mapRecurringOverride(row) {
  return {
    recurringItemId: row.recurring_item_id,
    monthRef: row.month_ref,
    amountOverride: row.amount_override === null ? null : Number(row.amount_override),
    dueDayOverride: row.due_day_override,
    activeOverride: row.active_override,
    notes: row.notes || ''
  };
}

function mapCardMonthlyForecast(row) {
  return {
    cardId: row.card_id,
    monthRef: row.month_ref,
    variableAmount: Number(row.variable_amount),
    notes: row.notes || ''
  };
}

function mapInstallmentPlan(row) {
  return {
    id: row.id,
    cardId: row.card_id,
    description: row.description,
    category: row.category,
    totalAmount: Number(row.total_amount),
    installmentAmount: Number(row.installment_amount),
    totalInstallments: row.total_installments,
    startMonth: row.start_month,
    active: row.active,
    notes: row.notes || ''
  };
}

function getMonthlyAmount(item) {
  if (item.billingCycle === 'annual') {
    return roundCurrency(item.amount / 12);
  }

  return roundCurrency(item.amount);
}

function getMonthIndex(monthRef) {
  const [year, month] = String(monthRef || '').split('-').map(Number);
  return year * 12 + (month - 1);
}

function normalizeMonthRef(monthRef) {
  return String(monthRef || dayjs().format('YYYY-MM')).slice(0, 7);
}

function planInstallmentNumberForMonth(plan, monthRef) {
  const offset = getMonthIndex(monthRef) - getMonthIndex(plan.startMonth);
  if (offset < 0 || offset >= plan.totalInstallments) {
    return null;
  }

  return offset + 1;
}

export async function listCards() {
  const result = await query('SELECT * FROM cards ORDER BY name');
  return result.rows.map(mapCard);
}

export async function listRecurringItems() {
  const result = await query('SELECT * FROM recurring_items ORDER BY COALESCE(due_day, 99), name');
  return result.rows.map(mapRecurringItem);
}

export async function listPaymentStatuses(monthValue) {
  const monthRef = monthValue || dayjs().format('YYYY-MM');
  const result = await query(
    `
      SELECT recurring_item_id, month_ref, status, paid_at
      FROM recurring_item_payment_statuses
      WHERE month_ref = $1
    `,
    [monthRef]
  );

  return result.rows.map(mapPaymentStatus);
}

export async function listRecurringOverrides(monthValue) {
  const monthRef = normalizeMonthRef(monthValue);
  const result = await query(
    `
      SELECT recurring_item_id, month_ref, amount_override, due_day_override, active_override, notes
      FROM recurring_item_overrides
      WHERE month_ref = $1
    `,
    [monthRef]
  );

  return result.rows.map(mapRecurringOverride);
}

export async function listTransactions() {
  const result = await query('SELECT * FROM transactions ORDER BY transaction_date DESC, created_at DESC');
  return result.rows.map(mapTransaction);
}

export async function listMilesPrograms() {
  const result = await query('SELECT * FROM miles_programs ORDER BY balance DESC, name');
  return result.rows.map(mapMilesProgram);
}

export async function listInvestments() {
  const result = await query('SELECT * FROM investments ORDER BY investment_date DESC, created_at DESC');
  return result.rows.map(mapInvestment);
}

export async function listCardMonthlyForecasts(monthValue) {
  const monthRef = normalizeMonthRef(monthValue);
  const result = await query(
    `
      SELECT card_id, month_ref, variable_amount, notes
      FROM card_monthly_forecasts
      WHERE month_ref = $1
      ORDER BY card_id
    `,
    [monthRef]
  );

  return result.rows.map(mapCardMonthlyForecast);
}

export async function listInstallmentPlans() {
  const result = await query(
    `
      SELECT *
      FROM card_installment_plans
      ORDER BY active DESC, created_at DESC
    `
  );

  return result.rows.map(mapInstallmentPlan);
}

export async function getSettings() {
  const result = await query('SELECT * FROM settings WHERE id = $1 LIMIT 1', ['settings-default']);
  return mapSettings(result.rows[0]);
}

export async function createTransaction(payload) {
  const record = {
    id: crypto.randomUUID(),
    date: payload.date || dayjs().format('YYYY-MM-DD'),
    description: payload.description,
    amount: roundCurrency(payload.amount),
    type: payload.type || 'expense',
    category: payload.category,
    paymentChannel: payload.paymentChannel || 'pix_boleto',
    cardId: payload.cardId || null,
    notes: payload.notes || ''
  };

  await query(
    `
      INSERT INTO transactions (
        id, transaction_date, description, amount, type, category, payment_channel, card_id, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `,
    [
      record.id,
      record.date,
      record.description,
      record.amount,
      record.type,
      record.category,
      record.paymentChannel,
      record.cardId,
      record.notes
    ]
  );

  return record;
}

export async function createRecurringItem(payload) {
  const record = {
    id: crypto.randomUUID(),
    name: payload.name,
    category: payload.category,
    type: payload.type || 'fixed',
    amount: roundCurrency(payload.amount),
    billingCycle: payload.billingCycle || 'monthly',
    dueDay: payload.dueDay ? Number(payload.dueDay) : null,
    paymentChannel: payload.paymentChannel || 'pix_boleto',
    cardId: payload.cardId || null,
    canCut: Boolean(payload.canCut),
    includeInMonthlyForecast: payload.includeInMonthlyForecast !== false,
    active: payload.active !== false,
    notes: payload.notes || ''
  };

  await query(
    `
      INSERT INTO recurring_items (
        id, name, category, type, amount, billing_cycle, due_day,
        payment_channel, card_id, can_cut, include_in_monthly_forecast, active, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `,
    [
      record.id,
      record.name,
      record.category,
      record.type,
      record.amount,
      record.billingCycle,
      record.dueDay,
      record.paymentChannel,
      record.cardId,
      record.canCut,
      record.includeInMonthlyForecast,
      record.active,
      record.notes
    ]
  );

  return record;
}

export async function updateRecurringItem(id, payload) {
  const existingResult = await query('SELECT * FROM recurring_items WHERE id = $1 LIMIT 1', [id]);
  const existing = existingResult.rows[0];

  if (!existing) {
    const error = new Error('Item nao encontrado');
    error.status = 404;
    throw error;
  }

  const next = {
    name: payload.name ?? existing.name,
    category: payload.category ?? existing.category,
    type: payload.type ?? existing.type,
    amount: payload.amount === undefined ? Number(existing.amount) : roundCurrency(payload.amount),
    billingCycle: payload.billingCycle ?? existing.billing_cycle,
    dueDay:
      payload.dueDay === undefined
        ? existing.due_day
        : payload.dueDay === null || payload.dueDay === ''
          ? null
          : Number(payload.dueDay),
    paymentChannel: payload.paymentChannel ?? existing.payment_channel,
    cardId: payload.cardId === undefined ? existing.card_id : payload.cardId || null,
    canCut: payload.canCut === undefined ? existing.can_cut : Boolean(payload.canCut),
    includeInMonthlyForecast:
      payload.includeInMonthlyForecast === undefined
        ? existing.include_in_monthly_forecast
        : Boolean(payload.includeInMonthlyForecast),
    active: payload.active === undefined ? existing.active : Boolean(payload.active),
    notes: payload.notes ?? existing.notes
  };

  await query(
    `
      UPDATE recurring_items
      SET name = $2,
          category = $3,
          type = $4,
          amount = $5,
          billing_cycle = $6,
          due_day = $7,
          payment_channel = $8,
          card_id = $9,
          can_cut = $10,
          include_in_monthly_forecast = $11,
          active = $12,
          notes = $13,
          updated_at = NOW()
      WHERE id = $1
    `,
    [
      id,
      next.name,
      next.category,
      next.type,
      next.amount,
      next.billingCycle,
      next.dueDay,
      next.paymentChannel,
      next.cardId,
      next.canCut,
      next.includeInMonthlyForecast,
      next.active,
      next.notes
    ]
  );

  return {
    id,
    ...next
  };
}

export async function upsertRecurringOverride(id, payload) {
  const monthRef = normalizeMonthRef(payload.month);
  const amountOverride =
    payload.amountOverride === undefined || payload.amountOverride === ''
      ? null
      : roundCurrency(payload.amountOverride);
  const dueDayOverride =
    payload.dueDayOverride === undefined || payload.dueDayOverride === ''
      ? null
      : Number(payload.dueDayOverride);
  const activeOverride =
    payload.activeOverride === undefined || payload.activeOverride === '' || payload.activeOverride === null
      ? null
      : Boolean(payload.activeOverride);
  const notes = String(payload.notes || '');
  const shouldClear = Boolean(payload.clearOverride) ||
    (amountOverride === null && dueDayOverride === null && activeOverride === null && !notes);

  const recurringResult = await query('SELECT id FROM recurring_items WHERE id = $1 LIMIT 1', [id]);
  if (recurringResult.rowCount === 0) {
    const error = new Error('Item nao encontrado');
    error.status = 404;
    throw error;
  }

  if (shouldClear) {
    await query(
      'DELETE FROM recurring_item_overrides WHERE recurring_item_id = $1 AND month_ref = $2',
      [id, monthRef]
    );

    return {
      recurringItemId: id,
      monthRef,
      cleared: true
    };
  }

  await query(
    `
      INSERT INTO recurring_item_overrides (
        recurring_item_id, month_ref, amount_override, due_day_override, active_override, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (recurring_item_id, month_ref)
      DO UPDATE SET
        amount_override = EXCLUDED.amount_override,
        due_day_override = EXCLUDED.due_day_override,
        active_override = EXCLUDED.active_override,
        notes = EXCLUDED.notes,
        updated_at = NOW()
    `,
    [id, monthRef, amountOverride, dueDayOverride, activeOverride, notes]
  );

  const result = await query(
    `
      SELECT recurring_item_id, month_ref, amount_override, due_day_override, active_override, notes
      FROM recurring_item_overrides
      WHERE recurring_item_id = $1 AND month_ref = $2
      LIMIT 1
    `,
    [id, monthRef]
  );

  return mapRecurringOverride(result.rows[0]);
}

export async function createMilesProgram(payload) {
  const record = {
    id: crypto.randomUUID(),
    name: payload.name,
    balance: Number(payload.balance || 0),
    expiryDate: payload.expiryDate || null,
    notes: payload.notes || ''
  };

  await query(
    `
      INSERT INTO miles_programs (id, name, balance, expiry_date, notes)
      VALUES ($1, $2, $3, $4, $5)
    `,
    [record.id, record.name, record.balance, record.expiryDate, record.notes]
  );

  return record;
}

export async function createInvestment(payload) {
  const record = {
    id: crypto.randomUUID(),
    date: payload.date || dayjs().format('YYYY-MM-DD'),
    platform: payload.platform,
    asset: payload.asset,
    amount: roundCurrency(payload.amount),
    type: payload.type || 'aporte',
    notes: payload.notes || ''
  };

  await query(
    `
      INSERT INTO investments (id, investment_date, platform, asset, amount, type, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
    [record.id, record.date, record.platform, record.asset, record.amount, record.type, record.notes]
  );

  return record;
}

export async function upsertCardMonthlyForecast(cardId, payload) {
  const monthRef = normalizeMonthRef(payload.month);
  const variableAmount = roundCurrency(payload.variableAmount);
  const notes = String(payload.notes || '');
  const clearForecast = Boolean(payload.clearForecast);

  const cardResult = await query('SELECT id FROM cards WHERE id = $1 LIMIT 1', [cardId]);
  if (cardResult.rowCount === 0) {
    const error = new Error('Cartao nao encontrado');
    error.status = 404;
    throw error;
  }

  if (clearForecast) {
    await query('DELETE FROM card_monthly_forecasts WHERE card_id = $1 AND month_ref = $2', [cardId, monthRef]);
    return {
      cardId,
      monthRef,
      cleared: true
    };
  }

  await query(
    `
      INSERT INTO card_monthly_forecasts (card_id, month_ref, variable_amount, notes)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (card_id, month_ref)
      DO UPDATE SET
        variable_amount = EXCLUDED.variable_amount,
        notes = EXCLUDED.notes,
        updated_at = NOW()
    `,
    [cardId, monthRef, variableAmount, notes]
  );

  const result = await query(
    `
      SELECT card_id, month_ref, variable_amount, notes
      FROM card_monthly_forecasts
      WHERE card_id = $1 AND month_ref = $2
      LIMIT 1
    `,
    [cardId, monthRef]
  );

  return mapCardMonthlyForecast(result.rows[0]);
}

export async function createInstallmentPlan(payload) {
  const totalAmount = roundCurrency(payload.totalAmount);
  const totalInstallments = Number(payload.totalInstallments || 1);
  const installmentAmount = roundCurrency(totalAmount / totalInstallments);
  const record = {
    id: crypto.randomUUID(),
    cardId: payload.cardId,
    description: payload.description,
    category: payload.category || 'Cartao Parcelado',
    totalAmount,
    installmentAmount,
    totalInstallments,
    startMonth: normalizeMonthRef(payload.startMonth),
    active: payload.active !== false,
    notes: payload.notes || ''
  };

  await query(
    `
      INSERT INTO card_installment_plans (
        id, card_id, description, category, total_amount, installment_amount,
        total_installments, start_month, active, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `,
    [
      record.id,
      record.cardId,
      record.description,
      record.category,
      record.totalAmount,
      record.installmentAmount,
      record.totalInstallments,
      record.startMonth,
      record.active,
      record.notes
    ]
  );

  return record;
}

export async function updateInstallmentPlan(id, payload) {
  const existingResult = await query('SELECT * FROM card_installment_plans WHERE id = $1 LIMIT 1', [id]);
  const existing = existingResult.rows[0];

  if (!existing) {
    const error = new Error('Parcelamento nao encontrado');
    error.status = 404;
    throw error;
  }

  const totalAmount =
    payload.totalAmount === undefined ? Number(existing.total_amount) : roundCurrency(payload.totalAmount);
  const totalInstallments =
    payload.totalInstallments === undefined ? existing.total_installments : Number(payload.totalInstallments);
  const next = {
    description: payload.description ?? existing.description,
    category: payload.category ?? existing.category,
    totalAmount,
    totalInstallments,
    installmentAmount: roundCurrency(totalAmount / totalInstallments),
    startMonth: payload.startMonth ? normalizeMonthRef(payload.startMonth) : existing.start_month,
    active: payload.active === undefined ? existing.active : Boolean(payload.active),
    notes: payload.notes ?? existing.notes
  };

  await query(
    `
      UPDATE card_installment_plans
      SET description = $2,
          category = $3,
          total_amount = $4,
          installment_amount = $5,
          total_installments = $6,
          start_month = $7,
          active = $8,
          notes = $9,
          updated_at = NOW()
      WHERE id = $1
    `,
    [
      id,
      next.description,
      next.category,
      next.totalAmount,
      next.installmentAmount,
      next.totalInstallments,
      next.startMonth,
      next.active,
      next.notes
    ]
  );

  return { id, ...next };
}

function enrichRecurringItems(recurringItems, recurringOverrides, paymentStatuses, context) {
  const today = dayjs();
  const isCurrentMonth = context.month === today.format('YYYY-MM');
  const overrideMap = new Map(recurringOverrides.map((item) => [item.recurringItemId, item]));
  const paymentStatusMap = new Map(paymentStatuses.map((item) => [item.recurringItemId, item]));

  const enriched = recurringItems.map((item) => {
    const override = overrideMap.get(item.id);
    const paymentStatus = paymentStatusMap.get(item.id);
    const effectiveAmount = override?.amountOverride ?? item.amount;
    const effectiveDueDay = override?.dueDayOverride ?? item.dueDay;
    const effectiveActive = override?.activeOverride ?? item.active;
    const dueDate = effectiveDueDay ? context.start.date(effectiveDueDay).format('YYYY-MM-DD') : '';
    const effectiveStatus = paymentStatus?.status || 'unpaid';
    const isPaid = effectiveStatus === 'paid';
    const isDueToday = Boolean(effectiveDueDay) && isCurrentMonth && effectiveDueDay === today.date();
    const isOverdue =
      Boolean(effectiveDueDay) && isCurrentMonth && effectiveDueDay < today.date() && !isPaid;
    const daysUntilDue = effectiveDueDay
      ? context.start.date(effectiveDueDay).diff(today.startOf('day'), 'day')
      : null;

    return {
      ...item,
      amount: effectiveAmount,
      dueDay: effectiveDueDay,
      active: effectiveActive,
      dueDate,
      paymentStatus: effectiveStatus,
      paidAt: paymentStatus?.paidAt || null,
      isPaid,
      isDueToday,
      isOverdue,
      daysUntilDue,
      hasOverride: Boolean(override),
      override: override || null
    };
  });

  const nextPayment = enriched
    .filter((item) => item.active && item.billingCycle === 'monthly' && item.dueDay && !item.isPaid)
    .sort((a, b) => {
      const aDate = dayjs(a.dueDate);
      const bDate = dayjs(b.dueDate);
      const aDistance = Math.abs(aDate.diff(today.startOf('day'), 'day'));
      const bDistance = Math.abs(bDate.diff(today.startOf('day'), 'day'));
      if (a.isOverdue !== b.isOverdue) {
        return a.isOverdue ? -1 : 1;
      }
      if (aDistance !== bDistance) {
        return aDistance - bDistance;
      }
      return (a.dueDay || 99) - (b.dueDay || 99);
    })[0] || null;

  return {
    recurringItems: enriched.map((item) => ({
      ...item,
      isNextPayment: nextPayment ? nextPayment.id === item.id : false
    })),
    nextPayment: nextPayment
      ? {
          ...nextPayment,
          isNextPayment: true
        }
      : null
  };
}

function buildCardDynamicPlannedExpenses(cards, monthlyForecasts, installmentPlans, context) {
  const cardMap = new Map(cards.map((card) => [card.id, card]));
  const variableForecastByCard = new Map(monthlyForecasts.map((item) => [item.cardId, item]));
  const variableItems = [];
  const installmentItems = [];

  for (const [cardId, forecast] of variableForecastByCard.entries()) {
    if (forecast.variableAmount <= 0) {
      continue;
    }

    const card = cardMap.get(cardId);
    variableItems.push({
      id: `card-forecast-${cardId}-${context.month}`,
      name: `Fatura Variavel ${card?.name || cardId}`,
      amount: roundCurrency(forecast.variableAmount),
      dueDay: card?.dueDay || null,
      category: 'Fatura Variavel',
      type: 'card_forecast',
      paymentChannel: 'credit_card',
      cardId,
      canCut: false,
      dueDate: card?.dueDay ? context.start.date(card.dueDay).format('YYYY-MM-DD') : '',
      paymentStatus: 'unpaid',
      isPaid: false,
      isOverdue: false,
      isDueToday: false,
      paidAt: null,
      isNextPayment: false,
      sourceType: 'card_variable',
      notes: forecast.notes || ''
    });
  }

  for (const plan of installmentPlans.filter((item) => item.active)) {
    const installmentNumber = planInstallmentNumberForMonth(plan, context.month);
    if (!installmentNumber) {
      continue;
    }

    const card = cardMap.get(plan.cardId);
    installmentItems.push({
      id: `installment-${plan.id}-${context.month}`,
      name: `${plan.description} ${installmentNumber}/${plan.totalInstallments}`,
      amount: roundCurrency(plan.installmentAmount),
      dueDay: card?.dueDay || null,
      category: plan.category || 'Cartao Parcelado',
      type: 'card_installment',
      paymentChannel: 'credit_card',
      cardId: plan.cardId,
      canCut: false,
      dueDate: card?.dueDay ? context.start.date(card.dueDay).format('YYYY-MM-DD') : '',
      paymentStatus: 'unpaid',
      isPaid: false,
      isOverdue: false,
      isDueToday: false,
      paidAt: null,
      isNextPayment: false,
      sourceType: 'card_installment',
      installmentNumber,
      totalInstallments: plan.totalInstallments,
      planId: plan.id,
      notes: plan.notes || ''
    });
  }

  return {
    variableItems,
    installmentItems
  };
}

export async function updateRecurringPaymentStatus(id, monthValue, nextStatus) {
  const monthRef = monthValue || dayjs().format('YYYY-MM');
  const status = nextStatus === 'paid' ? 'paid' : 'unpaid';

  const recurringResult = await query('SELECT id FROM recurring_items WHERE id = $1 LIMIT 1', [id]);
  if (recurringResult.rowCount === 0) {
    const error = new Error('Item nao encontrado');
    error.status = 404;
    throw error;
  }

  await query(
    `
      INSERT INTO recurring_item_payment_statuses (recurring_item_id, month_ref, status, paid_at)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (recurring_item_id, month_ref)
      DO UPDATE SET
        status = EXCLUDED.status,
        paid_at = EXCLUDED.paid_at,
        updated_at = NOW()
    `,
    [id, monthRef, status, status === 'paid' ? new Date().toISOString() : null]
  );

  const result = await query(
    `
      SELECT recurring_item_id, month_ref, status, paid_at
      FROM recurring_item_payment_statuses
      WHERE recurring_item_id = $1 AND month_ref = $2
      LIMIT 1
    `,
    [id, monthRef]
  );

  return mapPaymentStatus(result.rows[0]);
}

export async function getMonthlySummary(monthValue) {
  const context = getMonthContext(monthValue);
  const now = dayjs();
  const isCurrentMonth = context.month === now.format('YYYY-MM');

  const [
    settings,
    cards,
    recurringItemsBase,
    recurringOverrides,
    paymentStatuses,
    monthlyForecasts,
    installmentPlans,
    allTransactions,
    allInvestments
  ] = await Promise.all([
    getSettings(),
    listCards(),
    listRecurringItems(),
    listRecurringOverrides(context.month),
    listPaymentStatuses(context.month),
    listCardMonthlyForecasts(context.month),
    listInstallmentPlans(),
    listTransactions(),
    listInvestments()
  ]);

  const { recurringItems, nextPayment: recurringNextPayment } = enrichRecurringItems(
    recurringItemsBase,
    recurringOverrides,
    paymentStatuses,
    context
  );
  const { variableItems, installmentItems } = buildCardDynamicPlannedExpenses(
    cards,
    monthlyForecasts,
    installmentPlans,
    context
  );

  const recurring = recurringItems.filter((item) => item.active);
  const transactions = allTransactions.filter((transaction) => {
    const date = dayjs(transaction.date);
    return !date.isBefore(context.start, 'day') && !date.isAfter(context.end, 'day');
  });
  const investments = allInvestments.filter((investment) => {
    const date = dayjs(investment.date);
    return !date.isBefore(context.start, 'day') && !date.isAfter(context.end, 'day');
  });

  const plannedExpenses = recurring
    .filter((item) => item.includeInMonthlyForecast)
    .map((item) => ({
      id: item.id,
      name: item.name,
      amount: roundCurrency(item.amount),
      dueDay: item.dueDay,
      category: item.category,
      type: item.type,
      paymentChannel: item.paymentChannel,
      cardId: item.cardId,
      canCut: item.canCut,
      dueDate: item.dueDate,
      paymentStatus: item.paymentStatus,
      isPaid: item.isPaid,
      isOverdue: item.isOverdue,
      isDueToday: item.isDueToday,
      paidAt: item.paidAt,
      isNextPayment: item.isNextPayment,
      sourceType: 'recurring',
      hasOverride: item.hasOverride
    }))
    .concat(variableItems, installmentItems);

  const nextPayment = [...plannedExpenses]
    .filter((item) => item.dueDay && !item.isPaid)
    .sort((a, b) => {
      const aDate = dayjs(a.dueDate || `${context.month}-01`);
      const bDate = dayjs(b.dueDate || `${context.month}-01`);
      const aDistance = Math.abs(aDate.diff(now.startOf('day'), 'day'));
      const bDistance = Math.abs(bDate.diff(now.startOf('day'), 'day'));
      if (a.isOverdue !== b.isOverdue) {
        return a.isOverdue ? -1 : 1;
      }
      if (aDistance !== bDistance) {
        return aDistance - bDistance;
      }
      return (a.dueDay || 99) - (b.dueDay || 99);
    })[0] || recurringNextPayment || null;

  plannedExpenses.forEach((item) => {
    item.isNextPayment = Boolean(nextPayment && nextPayment.id === item.id);
  });

  const plannedTotal = roundCurrency(plannedExpenses.reduce((sum, item) => sum + item.amount, 0));
  const plannedCard = roundCurrency(
    plannedExpenses
      .filter((item) => item.paymentChannel === 'credit_card')
      .reduce((sum, item) => sum + item.amount, 0)
  );
  const plannedCash = roundCurrency(plannedTotal - plannedCard);

  const expenseTransactions = transactions.filter((item) => item.type === 'expense');
  const incomeTransactions = transactions.filter((item) => item.type === 'income');

  const actualDailySpent = roundCurrency(
    expenseTransactions.reduce((sum, item) => sum + item.amount, 0)
  );
  const actualIncome = roundCurrency(incomeTransactions.reduce((sum, item) => sum + item.amount, 0));
  const incomeBase = actualIncome || roundCurrency(settings?.defaultSalary || 0);
  const projectedBalance = roundCurrency(incomeBase - plannedTotal - actualDailySpent);
  const averageDailySpend =
    actualDailySpent > 0
      ? roundCurrency(actualDailySpent / (isCurrentMonth ? Math.max(now.date(), 1) : context.daysInMonth))
      : 0;

  const categoryMap = new Map();

  for (const item of plannedExpenses) {
    categoryMap.set(item.category, roundCurrency((categoryMap.get(item.category) || 0) + item.amount));
  }

  for (const item of expenseTransactions) {
    categoryMap.set(item.category, roundCurrency((categoryMap.get(item.category) || 0) + item.amount));
  }

  const categoryTotals = [...categoryMap.entries()]
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  const upcomingPayments = plannedExpenses
    .filter((item) => item.dueDay && !item.isPaid)
    .sort((a, b) => {
      if (a.isOverdue !== b.isOverdue) {
        return a.isOverdue ? -1 : 1;
      }
      return (a.dueDay || 99) - (b.dueDay || 99);
    })
    .slice(0, 10);

  const overduePayments = plannedExpenses
    .filter((item) => item.isOverdue)
    .sort((a, b) => (a.dueDay || 99) - (b.dueDay || 99));

  const cutCandidates = plannedExpenses
    .filter((item) => item.canCut)
    .sort((a, b) => b.amount - a.amount);

  const cardMap = new Map(
    cards.map((card) => [
      card.id,
      {
        cardId: card.id,
        cardName: card.name,
        dueDay: card.dueDay,
        plannedAmount: 0,
        actualAmount: 0,
        fixedAmount: 0,
        variableAmount: 0,
        installmentsAmount: 0
      }
    ])
  );

  for (const item of plannedExpenses) {
    if (item.cardId && cardMap.has(item.cardId)) {
      const current = cardMap.get(item.cardId);
      current.plannedAmount = roundCurrency(current.plannedAmount + item.amount);
      if (item.sourceType === 'card_variable') {
        current.variableAmount = roundCurrency(current.variableAmount + item.amount);
      } else if (item.sourceType === 'card_installment') {
        current.installmentsAmount = roundCurrency(current.installmentsAmount + item.amount);
      } else {
        current.fixedAmount = roundCurrency(current.fixedAmount + item.amount);
      }
    }
  }

  for (const item of expenseTransactions) {
    if (item.cardId && cardMap.has(item.cardId)) {
      const current = cardMap.get(item.cardId);
      current.actualAmount = roundCurrency(current.actualAmount + item.amount);
    }
  }

  const cardTotals = [...cardMap.values()].sort((a, b) => b.plannedAmount - a.plannedAmount);
  const annualSubscriptions = recurring
    .filter((item) => item.billingCycle === 'annual')
    .map((item) => ({
      ...item,
      monthlyEquivalent: getMonthlyAmount(item)
    }));

  const totalInvested = roundCurrency(investments.reduce((sum, item) => sum + item.amount, 0));
  const largestCategory = categoryTotals[0] || null;
  const paidPlannedExpenses = plannedExpenses.filter((item) => item.isPaid);
  const unpaidPlannedExpenses = plannedExpenses.filter((item) => !item.isPaid);

  return {
    month: context.month,
    salary: roundCurrency(settings?.defaultSalary || 0),
    actualIncome,
    incomeBase,
    plannedTotal,
    plannedCard,
    plannedCash,
    actualDailySpent,
    projectedBalance,
    averageDailySpend,
    totalInvested,
    categoryTotals,
    upcomingPayments,
    overduePayments,
    cutCandidates,
    cardTotals,
    annualSubscriptions,
    recurringOverrides,
    cardMonthlyForecasts: monthlyForecasts,
    installmentPlans,
    paidCount: paidPlannedExpenses.length,
    unpaidCount: unpaidPlannedExpenses.length,
    paidPlannedTotal: roundCurrency(paidPlannedExpenses.reduce((sum, item) => sum + item.amount, 0)),
    unpaidPlannedTotal: roundCurrency(
      unpaidPlannedExpenses.reduce((sum, item) => sum + item.amount, 0)
    ),
    insights: {
      largestCategory,
      optionalMonthlySpend: roundCurrency(
        cutCandidates.reduce((sum, item) => sum + item.amount, 0)
      ),
      totalUpcomingCount: upcomingPayments.length,
      nextPayment,
      today: {
        date: now.format('YYYY-MM-DD'),
        day: now.date(),
        month: now.format('YYYY-MM'),
        isCurrentMonth
      }
    }
  };
}

export async function getBootstrapData(monthValue) {
  const context = getMonthContext(monthValue);
  const [
    summary,
    cards,
    recurringItemsBase,
    recurringOverrides,
    paymentStatuses,
    cardMonthlyForecasts,
    installmentPlans,
    transactions,
    milesPrograms,
    investments,
    settings
  ] =
    await Promise.all([
      getMonthlySummary(context.month),
      listCards(),
      listRecurringItems(),
      listRecurringOverrides(context.month),
      listPaymentStatuses(context.month),
      listCardMonthlyForecasts(context.month),
      listInstallmentPlans(),
      listTransactions(),
      listMilesPrograms(),
      listInvestments(),
      getSettings()
    ]);

  const { recurringItems } = enrichRecurringItems(
    recurringItemsBase,
    recurringOverrides,
    paymentStatuses,
    context
  );

  return {
    summary,
    cards,
    recurringItems,
    recurringOverrides,
    cardMonthlyForecasts,
    installmentPlans,
    transactions,
    milesPrograms,
    investments,
    settings
  };
}
