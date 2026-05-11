import bcrypt from 'bcryptjs';
import { pool } from './pool.js';
import { seedData } from '../data/seed-data.js';

async function upsertSettings() {
  const { settings } = seedData;

  await pool.query(
    `
      INSERT INTO settings (id, default_salary, portfolio_link, owner_name, current_month)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id) DO UPDATE
      SET default_salary = EXCLUDED.default_salary,
          portfolio_link = EXCLUDED.portfolio_link,
          owner_name = EXCLUDED.owner_name,
          current_month = EXCLUDED.current_month,
          updated_at = NOW()
    `,
    [
      settings.id,
      settings.defaultSalary,
      settings.portfolioLink,
      settings.ownerName,
      settings.currentMonth
    ]
  );
}

async function upsertUsers() {
  for (const user of seedData.users) {
    const passwordHash = await bcrypt.hash(user.password, 10);

    await pool.query(
      `
        INSERT INTO users (id, username, password_hash, display_name)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO UPDATE
        SET username = EXCLUDED.username,
            password_hash = EXCLUDED.password_hash,
            display_name = EXCLUDED.display_name,
            updated_at = NOW()
      `,
      [user.id, user.username, passwordHash, user.displayName]
    );
  }
}

async function upsertCards() {
  for (const card of seedData.cards) {
    await pool.query(
      `
        INSERT INTO cards (id, name, brand, color, due_day)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE
        SET name = EXCLUDED.name,
            brand = EXCLUDED.brand,
            color = EXCLUDED.color,
            due_day = EXCLUDED.due_day,
            updated_at = NOW()
      `,
      [card.id, card.name, card.brand, card.color, card.dueDay || null]
    );
  }
}

async function upsertRecurringItems() {
  for (const item of seedData.recurringItems) {
    await pool.query(
      `
        INSERT INTO recurring_items (
          id, name, category, type, amount, billing_cycle, due_day,
          payment_channel, card_id, can_cut, include_in_monthly_forecast,
          active, notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO UPDATE
        SET name = EXCLUDED.name,
            category = EXCLUDED.category,
            type = EXCLUDED.type,
            amount = EXCLUDED.amount,
            billing_cycle = EXCLUDED.billing_cycle,
            due_day = EXCLUDED.due_day,
            payment_channel = EXCLUDED.payment_channel,
            card_id = EXCLUDED.card_id,
            can_cut = EXCLUDED.can_cut,
            include_in_monthly_forecast = EXCLUDED.include_in_monthly_forecast,
            active = EXCLUDED.active,
            notes = EXCLUDED.notes,
            updated_at = NOW()
      `,
      [
        item.id,
        item.name,
        item.category,
        item.type,
        item.amount,
        item.billingCycle,
        item.dueDay,
        item.paymentChannel,
        item.cardId,
        item.canCut,
        item.includeInMonthlyForecast,
        item.active,
        item.notes || ''
      ]
    );
  }
}

async function upsertTransactions() {
  for (const transaction of seedData.transactions) {
    await pool.query(
      `
        INSERT INTO transactions (
          id, transaction_date, description, amount, type, category,
          payment_channel, card_id, notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO UPDATE
        SET transaction_date = EXCLUDED.transaction_date,
            description = EXCLUDED.description,
            amount = EXCLUDED.amount,
            type = EXCLUDED.type,
            category = EXCLUDED.category,
            payment_channel = EXCLUDED.payment_channel,
            card_id = EXCLUDED.card_id,
            notes = EXCLUDED.notes,
            updated_at = NOW()
      `,
      [
        transaction.id,
        transaction.date,
        transaction.description,
        transaction.amount,
        transaction.type,
        transaction.category,
        transaction.paymentChannel,
        transaction.cardId,
        transaction.notes || ''
      ]
    );
  }
}

async function upsertMiles() {
  for (const program of seedData.milesPrograms) {
    await pool.query(
      `
        INSERT INTO miles_programs (id, name, balance, expiry_date, notes)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE
        SET name = EXCLUDED.name,
            balance = EXCLUDED.balance,
            expiry_date = EXCLUDED.expiry_date,
            notes = EXCLUDED.notes,
            updated_at = NOW()
      `,
      [program.id, program.name, program.balance, program.expiryDate || null, program.notes || '']
    );
  }
}

async function upsertInvestments() {
  for (const investment of seedData.investments) {
    await pool.query(
      `
        INSERT INTO investments (id, investment_date, platform, asset, amount, type, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE
        SET investment_date = EXCLUDED.investment_date,
            platform = EXCLUDED.platform,
            asset = EXCLUDED.asset,
            amount = EXCLUDED.amount,
            type = EXCLUDED.type,
            notes = EXCLUDED.notes,
            updated_at = NOW()
      `,
      [
        investment.id,
        investment.date,
        investment.platform,
        investment.asset,
        investment.amount,
        investment.type,
        investment.notes || ''
      ]
    );
  }
}

async function run() {
  await upsertSettings();
  await upsertUsers();
  await upsertCards();
  await upsertRecurringItems();
  await upsertTransactions();
  await upsertMiles();
  await upsertInvestments();
}

run()
  .then(async () => {
    await pool.end();
    console.log('Seed concluído.');
  })
  .catch(async (error) => {
    console.error('Erro ao popular o banco:', error);
    await pool.end();
    process.exit(1);
  });
