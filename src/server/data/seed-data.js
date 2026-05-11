import dayjs from 'dayjs';

const today = dayjs();

export const seedData = {
  settings: {
    id: 'settings-default',
    defaultSalary: 30000,
    portfolioLink: 'https://investidor10.com.br/',
    ownerName: 'Seu painel',
    currentMonth: today.format('YYYY-MM')
  },
  users: [
    {
      id: 'user-admin',
      username: 'admin',
      password: '123456',
      displayName: 'Administrador'
    }
  ],
  cards: [
    { id: 'card-xp', name: 'XP Visa Infinite', brand: 'Visa', color: '#5b8cff', dueDay: 5 },
    { id: 'card-uniclass', name: 'Black Uniclass', brand: 'Mastercard', color: '#9b7bff', dueDay: 8 },
    { id: 'card-c6', name: 'C6', brand: 'Mastercard', color: '#ffb020', dueDay: 10 },
    { id: 'card-personalite', name: 'Black Personalite', brand: 'Mastercard', color: '#00c2a8', dueDay: 8 },
    { id: 'card-nubank', name: 'Nubank', brand: 'Mastercard', color: '#8a3ffc', dueDay: 8 }
  ],
  recurringItems: [
    { id: 'rec-trae', name: 'Trae', category: 'Ferramentas', type: 'subscription', amount: 400, billingCycle: 'annual', dueDay: null, paymentChannel: 'credit_card', cardId: 'card-xp', canCut: true, includeInMonthlyForecast: false, active: true, notes: 'Ja pago anual.' },
    { id: 'rec-investidor10', name: 'Investidor10', category: 'Ferramentas', type: 'subscription', amount: 20, billingCycle: 'annual', dueDay: null, paymentChannel: 'credit_card', cardId: 'card-xp', canCut: true, includeInMonthlyForecast: false, active: true, notes: 'Ja pago anual.' },
    { id: 'rec-spotify', name: 'Spotify', category: 'Assinaturas', type: 'subscription', amount: 23.9, billingCycle: 'monthly', dueDay: 27, paymentChannel: 'credit_card', cardId: 'card-c6', canCut: true, includeInMonthlyForecast: true, active: true, notes: '' },
    { id: 'rec-netflix', name: 'Netflix', category: 'Assinaturas', type: 'subscription', amount: 20.9, billingCycle: 'monthly', dueDay: 23, paymentChannel: 'credit_card', cardId: 'card-c6', canCut: true, includeInMonthlyForecast: true, active: true, notes: '' },
    { id: 'rec-disney', name: 'Disney+', category: 'Assinaturas', type: 'subscription', amount: 67, billingCycle: 'monthly', dueDay: 23, paymentChannel: 'credit_card', cardId: 'card-c6', canCut: true, includeInMonthlyForecast: true, active: true, notes: '' },
    { id: 'rec-amazon', name: 'Amazon Prime', category: 'Assinaturas', type: 'subscription', amount: 13.9, billingCycle: 'monthly', dueDay: 12, paymentChannel: 'credit_card', cardId: 'card-c6', canCut: true, includeInMonthlyForecast: true, active: true, notes: '' },
    { id: 'rec-apple-storage', name: 'Apple Storage', category: 'Assinaturas', type: 'subscription', amount: 66.9, billingCycle: 'monthly', dueDay: 27, paymentChannel: 'credit_card', cardId: 'card-c6', canCut: true, includeInMonthlyForecast: true, active: true, notes: '' },
    { id: 'rec-socio', name: 'Socio Santa Cruz', category: 'Lazer', type: 'fixed', amount: 25, billingCycle: 'monthly', dueDay: 10, paymentChannel: 'credit_card', cardId: 'card-c6', canCut: true, includeInMonthlyForecast: true, active: true, notes: '' },
    { id: 'rec-internet', name: 'Internet', category: 'Moradia', type: 'fixed', amount: 119.99, billingCycle: 'monthly', dueDay: 11, paymentChannel: 'pix_boleto', cardId: null, canCut: false, includeInMonthlyForecast: true, active: true, notes: '' },
    { id: 'rec-tim', name: 'Plano de Celular TIM', category: 'Servicos', type: 'fixed', amount: 94.99, billingCycle: 'monthly', dueDay: 7, paymentChannel: 'pix_boleto', cardId: null, canCut: false, includeInMonthlyForecast: true, active: true, notes: '' },
    { id: 'rec-pietro', name: 'Cabeleireiro Pietro', category: 'Cuidados Pessoais', type: 'fixed', amount: 120, billingCycle: 'monthly', dueDay: 1, paymentChannel: 'credit_card', cardId: 'card-c6', canCut: false, includeInMonthlyForecast: true, active: true, notes: '' },
    { id: 'rec-voleis', name: 'Voleis', category: 'Saude e Bem-estar', type: 'fixed', amount: 165, billingCycle: 'monthly', dueDay: 1, paymentChannel: 'pix_boleto', cardId: null, canCut: false, includeInMonthlyForecast: true, active: true, notes: '' },
    { id: 'rec-pelada', name: 'Pelada', category: 'Saude e Bem-estar', type: 'fixed', amount: 70, billingCycle: 'monthly', dueDay: 1, paymentChannel: 'pix_boleto', cardId: null, canCut: false, includeInMonthlyForecast: true, active: true, notes: '' },
    { id: 'rec-academia', name: 'Academia', category: 'Saude e Bem-estar', type: 'fixed', amount: 129.99, billingCycle: 'monthly', dueDay: 1, paymentChannel: 'credit_card', cardId: 'card-c6', canCut: false, includeInMonthlyForecast: true, active: true, notes: '' },
    { id: 'rec-personal', name: 'Personal', category: 'Saude e Bem-estar', type: 'fixed', amount: 560, billingCycle: 'monthly', dueDay: 1, paymentChannel: 'pix_boleto', cardId: null, canCut: false, includeInMonthlyForecast: true, active: true, notes: '' },
    { id: 'rec-srpe', name: 'Sr Pe', category: 'Educacao', type: 'fixed', amount: 180, billingCycle: 'monthly', dueDay: 25, paymentChannel: 'credit_card', cardId: 'card-c6', canCut: true, includeInMonthlyForecast: true, active: true, notes: '' },
    { id: 'rec-fabio', name: 'Fabio Salsa', category: 'Saude e Bem-estar', type: 'fixed', amount: 250, billingCycle: 'monthly', dueDay: 1, paymentChannel: 'credit_card', cardId: 'card-c6', canCut: true, includeInMonthlyForecast: true, active: false, notes: 'Marcado como inativo porque voce indicou que pode nao ocorrer em alguns meses.' },
    { id: 'rec-livelo', name: 'Livelo', category: 'Milhas', type: 'subscription', amount: 83.5, billingCycle: 'annual', dueDay: null, paymentChannel: 'credit_card', cardId: 'card-xp', canCut: true, includeInMonthlyForecast: false, active: true, notes: 'Ja pago anual.' },
    { id: 'rec-gmail', name: 'Assinatura Espaco Gmail', category: 'Ferramentas', type: 'subscription', amount: 3.75, billingCycle: 'annual', dueDay: null, paymentChannel: 'credit_card', cardId: 'card-xp', canCut: true, includeInMonthlyForecast: false, active: true, notes: 'Ja pago anual.' },
    { id: 'rec-contador', name: 'Contador', category: 'Profissional', type: 'fixed', amount: 290, billingCycle: 'monthly', dueDay: 15, paymentChannel: 'pix_boleto', cardId: null, canCut: false, includeInMonthlyForecast: true, active: true, notes: '' },
    { id: 'rec-apartamento', name: 'Mensal + Evolucao Apartamento', category: 'Moradia', type: 'fixed', amount: 4500, billingCycle: 'monthly', dueDay: 25, paymentChannel: 'pix_boleto', cardId: null, canCut: false, includeInMonthlyForecast: true, active: true, notes: '' },
    { id: 'rec-lazer-cartao', name: 'Gastos Avulsos Lazer', category: 'Lazer', type: 'estimate', amount: 5000, billingCycle: 'monthly', dueDay: 28, paymentChannel: 'credit_card', cardId: 'card-xp', canCut: true, includeInMonthlyForecast: true, active: true, notes: 'Estimativa mensal.' },
    { id: 'rec-casamento', name: 'Gastos do Casamento', category: 'Casamento', type: 'fixed', amount: 5500, billingCycle: 'monthly', dueDay: 10, paymentChannel: 'pix_boleto', cardId: null, canCut: false, includeInMonthlyForecast: true, active: true, notes: '' },
    { id: 'rec-casa', name: 'Gastos de Casa', category: 'Casa', type: 'estimate', amount: 5000, billingCycle: 'monthly', dueDay: 8, paymentChannel: 'pix_boleto', cardId: null, canCut: false, includeInMonthlyForecast: true, active: true, notes: 'Media mensal.' },
    { id: 'rec-oktoplus', name: 'Oktoplus', category: 'Milhas', type: 'subscription', amount: 11.15, billingCycle: 'annual', dueDay: null, paymentChannel: 'credit_card', cardId: 'card-xp', canCut: true, includeInMonthlyForecast: false, active: true, notes: 'Ja pago anual.' },
    { id: 'rec-psplus', name: 'PS Plus', category: 'Assinaturas', type: 'subscription', amount: 40, billingCycle: 'annual', dueDay: null, paymentChannel: 'credit_card', cardId: 'card-c6', canCut: true, includeInMonthlyForecast: false, active: true, notes: 'Ja pago anual.' },
    { id: 'rec-ingles', name: 'Aulas de Ingles', category: 'Educacao', type: 'fixed', amount: 675, billingCycle: 'monthly', dueDay: 30, paymentChannel: 'pix_boleto', cardId: null, canCut: false, includeInMonthlyForecast: true, active: true, notes: '' }
  ],
  transactions: [
    { id: 'tx-salary-1', date: today.date(5).format('YYYY-MM-DD'), description: 'Salario Fixo', amount: 30000, type: 'income', category: 'Receita', paymentChannel: 'bank_transfer', cardId: null, notes: '' },
    { id: 'tx-uber-1', date: today.date(2).format('YYYY-MM-DD'), description: 'Uber', amount: 42.5, type: 'expense', category: 'Transporte', paymentChannel: 'credit_card', cardId: 'card-xp', notes: '' },
    { id: 'tx-ifood-1', date: today.date(3).format('YYYY-MM-DD'), description: 'iFood', amount: 68.9, type: 'expense', category: 'Alimentacao', paymentChannel: 'credit_card', cardId: 'card-xp', notes: '' },
    { id: 'tx-farmacia-1', date: today.date(4).format('YYYY-MM-DD'), description: 'Farmacia', amount: 55.3, type: 'expense', category: 'Saude', paymentChannel: 'pix_boleto', cardId: null, notes: '' },
    { id: 'tx-restaurante-1', date: today.date(6).format('YYYY-MM-DD'), description: 'Restaurante', amount: 132.4, type: 'expense', category: 'Lazer', paymentChannel: 'credit_card', cardId: 'card-xp', notes: '' },
    { id: 'tx-mercado-1', date: today.date(8).format('YYYY-MM-DD'), description: 'Mercado', amount: 286.75, type: 'expense', category: 'Casa', paymentChannel: 'pix_boleto', cardId: null, notes: '' }
  ],
  milesPrograms: [
    { id: 'mile-tudoazul', name: 'Tudo Azul', balance: 58000, expiryDate: '2026-09-04', notes: '' },
    { id: 'mile-livelo', name: 'Livelo', balance: 100, expiryDate: '', notes: '' },
    { id: 'mile-latampass', name: 'LATAM Pass', balance: 4500, expiryDate: '2026-06-08', notes: '' },
    { id: 'mile-smiles', name: 'Smiles', balance: 16000, expiryDate: '2026-10-07', notes: '' },
    { id: 'mile-mastercard', name: 'Mastercard Surpreenda', balance: 750, expiryDate: '2027-04-29', notes: '' },
    { id: 'mile-shellbox', name: 'Shellbox', balance: 0, expiryDate: '', notes: '' },
    { id: 'mile-km', name: 'KM', balance: 4500, expiryDate: '', notes: '' },
    { id: 'mile-viva', name: 'Clube Viva Boticario', balance: 300, expiryDate: '2026-01-16', notes: '' },
    { id: 'mile-iupp', name: 'IUPP', balance: 0, expiryDate: '', notes: '' },
    { id: 'mile-stix', name: 'Stix', balance: 37, expiryDate: '', notes: '' }
  ],
  investments: [
    { id: 'inv-1', date: today.date(3).format('YYYY-MM-DD'), platform: 'Investidor10', asset: 'Aporte Manual', amount: 1500, type: 'aporte', notes: 'Lancamento manual complementar' },
    { id: 'inv-2', date: today.date(7).format('YYYY-MM-DD'), platform: 'XP', asset: 'Tesouro Selic', amount: 2000, type: 'aporte', notes: '' }
  ]
};
