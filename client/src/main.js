import './styles.css';

const state = {
  currentMonth: new Date().toISOString().slice(0, 7),
  currentView: 'dashboard',
  data: null
};

const viewMeta = {
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Acompanhe vencimentos, gastos e previsibilidade.'
  },
  lancamentos: {
    title: 'Lancamentos',
    subtitle: 'Registre o dia a dia para enxergar o que sai do controle.'
  },
  compromissos: {
    title: 'Compromissos',
    subtitle: 'Veja vencimentos, despesas fixas e manutencao da rotina.'
  },
  cartoes: {
    title: 'Cartoes',
    subtitle: 'Edite a fatura variavel do mes e projete parcelamentos futuros.'
  },
  assinaturas: {
    title: 'Assinaturas',
    subtitle: 'Encontre servicos que podem ser reduzidos ou removidos.'
  },
  milhas: {
    title: 'Milhas e Pontos',
    subtitle: 'Consolide saldo, validade e oportunidades nos programas.'
  },
  investimentos: {
    title: 'Investimentos',
    subtitle: 'Anote aportes e mantenha seu historico financeiro no mesmo lugar.'
  }
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatCurrency(value) {
  return (Number(value) || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function formatDate(value) {
  if (!value) {
    return 'Sem data';
  }

  const [year, month, day] = String(value).split('-');
  return `${day}/${month}/${year}`;
}

function paymentChannelLabel(value) {
  const labels = {
    credit_card: 'Cartao',
    pix_boleto: 'Pix/Boleto',
    bank_transfer: 'Transferencia'
  };

  return labels[value] || value || '-';
}

function typeLabel(value) {
  const labels = {
    subscription: 'Assinatura',
    fixed: 'Fixo',
    estimate: 'Estimativa'
  };

  return labels[value] || value || '-';
}

function paymentStatusLabel(value) {
  return value === 'paid' ? 'Pago' : 'Nao pago';
}

function paymentStatusClass(value) {
  return value === 'paid' ? 'success' : 'warn';
}

function recurringSourceLabel(item) {
  return item.hasOverride ? 'Ajustado no mes' : 'Automatico';
}

function getDueContextLabel(item, summary) {
  if (item.isPaid) {
    return item.paidAt ? `Pago em ${formatDate(item.paidAt.slice(0, 10))}` : 'Pago';
  }

  if (item.isDueToday && summary.insights.today.isCurrentMonth) {
    return 'Vence hoje';
  }

  if (item.isOverdue) {
    return 'Atrasado';
  }

  if (item.isNextPayment) {
    return 'Proximo da fila';
  }

  if (typeof item.daysUntilDue === 'number') {
    if (item.daysUntilDue > 0) {
      return `Faltam ${item.daysUntilDue} dias`;
    }

    if (item.daysUntilDue < 0) {
      return `${Math.abs(item.daysUntilDue)} dias atrasado`;
    }
  }

  return 'Aguardando pagamento';
}

async function api(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    let payload = {};
    try {
      payload = await response.json();
    } catch {
      payload = {};
    }

    throw new Error(payload.error || 'Falha na requisicao');
  }

  return response.json();
}

function getCardName(cardId) {
  const card = state.data?.cards?.find((item) => item.id === cardId);
  return card?.name || '-';
}

function renderLayout() {
  const app = document.querySelector('#app');
  app.innerHTML = `
    <div class="background-glow bg-one"></div>
    <div class="background-glow bg-two"></div>
    <main class="app-shell">
      <section id="loginView" class="login-view">
        <div class="login-card glass">
          <div class="brand-pill">Refynce</div>
          <h1>Seu financeiro com mais clareza</h1>
          <p>
            Controle gastos fixos, avulsos, vencimentos, cartoes, milhas e investimentos
            em um unico painel.
          </p>
          <form id="loginForm" class="form-grid single-column">
            <label>
              <span>Usuario</span>
              <input type="text" name="username" placeholder="admin" required />
            </label>
            <label>
              <span>Senha</span>
              <input type="password" name="password" placeholder="123456" required />
            </label>
            <button type="submit" class="primary-button">Entrar</button>
          </form>
          <div class="helper-note">
            Login inicial: <strong>admin</strong> / <strong>123456</strong>
          </div>
          <div id="loginFeedback" class="feedback"></div>
        </div>
      </section>

      <section id="appView" class="app-view hidden">
        <aside class="sidebar glass">
          <div>
            <div class="brand-pill">Refynce</div>
            <h2 class="sidebar-title">Painel financeiro</h2>
            <p class="sidebar-subtitle">Fluxo mensal, rotinas e oportunidades de corte.</p>
            <nav class="nav-list">
              <button class="nav-button active" data-view="dashboard">Dashboard</button>
              <button class="nav-button" data-view="lancamentos">Lancamentos</button>
              <button class="nav-button" data-view="compromissos">Compromissos</button>
              <button class="nav-button" data-view="cartoes">Cartoes</button>
              <button class="nav-button" data-view="assinaturas">Assinaturas</button>
              <button class="nav-button" data-view="milhas">Milhas</button>
              <button class="nav-button" data-view="investimentos">Investimentos</button>
            </nav>
          </div>
          <div class="sidebar-footer">
            <button id="logoutButton" class="secondary-button">Sair</button>
          </div>
        </aside>

        <section class="content-area">
          <header class="topbar glass">
            <div>
              <h1 id="pageTitle">Dashboard</h1>
              <p id="pageSubtitle">Acompanhe vencimentos, gastos e previsibilidade.</p>
            </div>
            <div class="topbar-actions">
              <label class="month-filter">
                <span>Mes</span>
                <input type="month" id="monthPicker" />
              </label>
              <button id="refreshButton" class="secondary-button">Atualizar</button>
            </div>
          </header>

          <div id="globalFeedback" class="feedback"></div>

          <section id="dashboard" class="view-section active"></section>
          <section id="lancamentos" class="view-section"></section>
          <section id="compromissos" class="view-section"></section>
          <section id="cartoes" class="view-section"></section>
          <section id="assinaturas" class="view-section"></section>
          <section id="milhas" class="view-section"></section>
          <section id="investimentos" class="view-section"></section>
        </section>
      </section>
    </main>
  `;
}

function setAuthMode(isAuthenticated) {
  document.querySelector('#loginView').classList.toggle('hidden', isAuthenticated);
  document.querySelector('#appView').classList.toggle('hidden', !isAuthenticated);
}

function showMessage(selector, message, isError = false) {
  const element = document.querySelector(selector);
  element.textContent = message || '';
  element.className = `feedback ${isError ? 'accent-danger' : ''}`;
}

function updateHeader() {
  const meta = viewMeta[state.currentView];

  document.querySelector('#pageTitle').textContent = meta.title;
  document.querySelector('#pageSubtitle').textContent = meta.subtitle;

  document.querySelectorAll('.nav-button').forEach((button) => {
    button.classList.toggle('active', button.dataset.view === state.currentView);
  });

  document.querySelectorAll('.view-section').forEach((section) => {
    section.classList.toggle('active', section.id === state.currentView);
  });
}

function emptyState(message) {
  return `<div class="empty-state">${escapeHtml(message)}</div>`;
}

function statCard(label, value, caption) {
  return `
    <div class="stat-card">
      <div class="stat-label">${escapeHtml(label)}</div>
      <div class="stat-value">${value}</div>
      <div class="stat-caption">${escapeHtml(caption)}</div>
    </div>
  `;
}

function formCard(title, innerHtml) {
  return `
    <div class="form-card glass">
      <div class="panel-header"><h3>${escapeHtml(title)}</h3></div>
      ${innerHtml}
    </div>
  `;
}

function tableCard(title, innerHtml) {
  return `
    <div class="table-card">
      <h3>${escapeHtml(title)}</h3>
      <div class="table-wrapper">${innerHtml}</div>
    </div>
  `;
}

function tableHtml(headers, rows) {
  return `
    <table>
      <thead>
        <tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}
      </tbody>
    </table>
  `;
}

function smallInfo(title, value) {
  return `
    <div class="insight-item">
      <div class="muted">${escapeHtml(title)}</div>
      <div class="strong-line">${value}</div>
    </div>
  `;
}

function insightCard(title, value, caption) {
  return `
    <div class="mini-card">
      <strong>${escapeHtml(title)}</strong>
      <div class="stat-value stat-value-sm">${value}</div>
      <div class="muted">${escapeHtml(caption)}</div>
    </div>
  `;
}

function percentage(value, max) {
  if (!max) {
    return 0;
  }

  return Math.max(4, Math.round((Number(value) || 0) / max * 100));
}

function cardSelectHtml(name) {
  const options = [
    '<option value="">Nenhum / nao se aplica</option>',
    ...(state.data?.cards || []).map(
      (card) => `<option value="${escapeHtml(card.id)}">${escapeHtml(card.name)}</option>`
    )
  ];

  return `<select name="${escapeHtml(name)}">${options.join('')}</select>`;
}

function renderDashboard() {
  const section = document.querySelector('#dashboard');
  const summary = state.data.summary;
  const maxCategory = summary.categoryTotals[0]?.amount || 0;
  const maxCard = summary.cardTotals[0]?.plannedAmount || 0;
  const insightCategory = summary.insights.largestCategory
    ? `${summary.insights.largestCategory.category} (${formatCurrency(summary.insights.largestCategory.amount)})`
    : 'Sem dados suficientes';

  const nextPaymentLabel = summary.insights.nextPayment
    ? `${summary.insights.nextPayment.name} • dia ${summary.insights.nextPayment.dueDay}`
    : 'Nenhum vencimento pendente';

  section.innerHTML = `
    <div class="stats-grid">
      ${statCard('Receita base', formatCurrency(summary.incomeBase), 'Referencia mensal usada para previsao.')}
      ${statCard('Compromissos do mes', formatCurrency(summary.plannedTotal), 'Soma planejada sem contar o mesmo item duas vezes.')}
      ${statCard('Pagos no mes', formatCurrency(summary.paidPlannedTotal), `${summary.paidCount} itens marcados como pagos.`)}
      ${statCard('Pendentes no mes', formatCurrency(summary.unpaidPlannedTotal), `${summary.unpaidCount} itens ainda dependem de acao.`)}
      ${statCard('Gasto diario lancado', formatCurrency(summary.actualDailySpent), 'Despesas avulsas ja registradas no mes.')}
      ${statCard('Saldo projetado', formatCurrency(summary.projectedBalance), summary.projectedBalance >= 0 ? 'Mes ainda positivo.' : 'Atencao para ajuste de rota.')}
    </div>

    <div class="two-column">
      <div class="panel glass spotlight-panel">
        <div class="panel-header">
          <div>
            <h3>Radar do dia</h3>
            <div class="panel-subtitle">O que mais importa agora</div>
          </div>
          <span class="pill ${summary.insights.today.isCurrentMonth ? '' : 'warn'}">Hoje ${summary.insights.today.day}</span>
        </div>
        <div class="insight-grid">
          ${insightCard('Data atual', formatDate(summary.insights.today.date), summary.insights.today.isCurrentMonth ? 'Mes em foco alinhado com a data de hoje.' : 'Voce esta olhando outro mes.' )}
          ${insightCard('Proximo pagamento', nextPaymentLabel, summary.insights.nextPayment ? getDueContextLabel(summary.insights.nextPayment, summary) : 'Nenhum item mensal em aberto.')}
          ${insightCard('Atrasados', String(summary.overduePayments.length), summary.overduePayments.length ? 'Existem itens vencidos e nao marcados como pagos.' : 'Nada atrasado no momento.')}
        </div>
      </div>

      <div class="panel glass">
        <div class="panel-header">
          <div>
            <h3>Proximos vencimentos</h3>
            <div class="panel-subtitle">Pendencias em aberto, priorizadas pela data de hoje</div>
          </div>
          <span class="pill warn">${summary.unpaidCount} abertos</span>
        </div>
        <div class="timeline-list">
          ${summary.upcomingPayments.length
            ? summary.upcomingPayments
                .map(
                  (item) => `
                    <div class="timeline-item ${item.isNextPayment ? 'timeline-item-strong' : ''}">
                      <div class="timeline-row">
                        <strong>${escapeHtml(item.name)}</strong>
                        <span>${formatCurrency(item.amount)}</span>
                      </div>
                      <div class="timeline-row">
                        <span class="muted">Dia ${escapeHtml(item.dueDay)} • ${escapeHtml(item.category)}</span>
                        <span class="pill ${paymentStatusClass(item.paymentStatus)}">${escapeHtml(paymentStatusLabel(item.paymentStatus))}</span>
                      </div>
                      <div class="timeline-row">
                        <span class="muted">${escapeHtml(getDueContextLabel(item, summary))}</span>
                        <span class="pill ${item.isOverdue ? 'danger' : item.isDueToday ? 'warn' : ''}">${item.isOverdue ? 'Atrasado' : item.isDueToday ? 'Hoje' : item.isNextPayment ? 'Proximo' : paymentChannelLabel(item.paymentChannel)}</span>
                      </div>
                    </div>
                  `
                )
                .join('')
            : emptyState('Sem vencimentos futuros neste recorte.')}
        </div>
      </div>
    </div>

    <div class="two-column">
      <div class="panel glass">
        <div class="panel-header">
          <div>
            <h3>Gastos por categoria</h3>
            <div class="panel-subtitle">Planejado fixo + avulso registrado</div>
          </div>
          <span class="pill">${escapeHtml(summary.month)}</span>
        </div>
        <div class="bar-list">
          ${summary.categoryTotals.length
            ? summary.categoryTotals
                .map(
                  (item) => `
                    <div class="bar-item">
                      <div class="bar-row">
                        <strong>${escapeHtml(item.category)}</strong>
                        <span>${formatCurrency(item.amount)}</span>
                      </div>
                      <div class="bar-track">
                        <div class="bar-fill" style="width: ${percentage(item.amount, maxCategory)}%"></div>
                      </div>
                    </div>
                  `
                )
                .join('')
            : emptyState('Nenhuma categoria encontrada para este mes.')}
        </div>
      </div>

      <div class="panel glass">
        <div class="panel-header">
          <div>
            <h3>Resumo por cartao</h3>
            <div class="panel-subtitle">Planejado no cartao vs avulso ja registrado</div>
          </div>
        </div>
        <div class="bar-list">
          ${summary.cardTotals.length
            ? summary.cardTotals
                .map(
                  (item) => `
                    <div class="bar-item">
                      <div class="bar-row">
                        <strong>${escapeHtml(item.cardName)}</strong>
                        <span>${formatCurrency(item.plannedAmount)}</span>
                      </div>
                      <div class="bar-track">
                        <div class="bar-fill" style="width: ${percentage(item.plannedAmount, maxCard)}%"></div>
                      </div>
                      <div class="line-between">
                        <span class="muted">Fixos: ${formatCurrency(item.fixedAmount)} • Variavel: ${formatCurrency(item.variableAmount)}</span>
                        <span class="muted">Parcelas: ${formatCurrency(item.installmentsAmount)}</span>
                      </div>
                    </div>
                  `
                )
                .join('')
            : emptyState('Nenhum cartao cadastrado.')}
        </div>
      </div>
    </div>

    <div class="two-column">
      <div class="panel glass">
        <div class="panel-header">
          <div>
            <h3>Insights rapidos</h3>
            <div class="panel-subtitle">Onde agir primeiro</div>
          </div>
        </div>
        <div class="insight-grid">
          ${insightCard('Maior categoria', insightCategory, 'O principal concentrador do seu mes.')}
          ${insightCard('Possivel corte', formatCurrency(summary.insights.optionalMonthlySpend), 'Soma mensal de itens marcados como dispensaveis.')}
          ${insightCard('Media diaria', formatCurrency(summary.averageDailySpend), 'Ritmo medio do que voce ja lancou no dia a dia.')}
        </div>
      </div>

      <div class="panel glass">
        <div class="panel-header">
          <div>
            <h3>Pendencias atrasadas</h3>
            <div class="panel-subtitle">Itens vencidos que ainda nao foram marcados como pagos</div>
          </div>
          <span class="pill ${summary.overduePayments.length ? 'danger' : 'success'}">${summary.overduePayments.length}</span>
        </div>
        <div class="timeline-list">
          ${summary.overduePayments.length
            ? summary.overduePayments.map(
                (item) => `
                  <div class="timeline-item timeline-item-danger">
                    <div class="timeline-row">
                      <strong>${escapeHtml(item.name)}</strong>
                      <span>${formatCurrency(item.amount)}</span>
                    </div>
                    <div class="timeline-row">
                      <span class="muted">Dia ${escapeHtml(item.dueDay)} • ${escapeHtml(item.category)}</span>
                      <span class="pill danger">Atrasado</span>
                    </div>
                  </div>
                `
              ).join('')
            : emptyState('Nenhum item atrasado neste mes.')}
        </div>
      </div>
    </div>
  `;
}

function renderTransactions() {
  const section = document.querySelector('#lancamentos');
  const transactions = state.data.transactions.filter(
    (item) => String(item.date).slice(0, 7) === state.currentMonth
  );

  section.innerHTML = `
    <div class="grid-forms">
      ${formCard(
        'Novo gasto ou receita',
        `
          <form id="transactionForm" class="form-grid">
            <label><span>Data</span><input type="date" name="date" value="${escapeHtml(`${state.currentMonth}-01`)}" required /></label>
            <label><span>Descricao</span><input type="text" name="description" placeholder="Ex: mercado, uber, restaurante" required /></label>
            <div class="form-grid two">
              <label><span>Valor</span><input type="number" step="0.01" name="amount" required /></label>
              <label>
                <span>Tipo</span>
                <select name="type">
                  <option value="expense">Despesa</option>
                  <option value="income">Receita</option>
                </select>
              </label>
            </div>
            <div class="form-grid two">
              <label><span>Categoria</span><input type="text" name="category" placeholder="Alimentacao, Lazer, Casa..." required /></label>
              <label>
                <span>Como foi pago</span>
                <select name="paymentChannel">
                  <option value="pix_boleto">Pix/Boleto</option>
                  <option value="credit_card">Cartao</option>
                  <option value="bank_transfer">Transferencia</option>
                </select>
              </label>
            </div>
            <label><span>Cartao</span>${cardSelectHtml('cardId')}</label>
            <button type="submit" class="primary-button">Salvar lancamento</button>
          </form>
        `
      )}
      ${formCard(
        'Leitura rapida',
        `
          <div class="insight-list">
            ${smallInfo('Lancado no mes', formatCurrency(state.data.summary.actualDailySpent))}
            ${smallInfo('Receita no mes', formatCurrency(state.data.summary.actualIncome))}
            ${smallInfo('Saldo projetado', formatCurrency(state.data.summary.projectedBalance))}
          </div>
        `
      )}
      ${formCard(
        'Como usar',
        `
          <div class="insight-list">
            <div class="insight-item">Lance aqui apenas gastos do dia a dia e receitas extras.</div>
            <div class="insight-item">Itens fixos ja ficam em compromissos e assinaturas.</div>
            <div class="insight-item">Se um streaming cai no cartao, ele entra uma vez so como compromisso no cartao.</div>
          </div>
        `
      )}
    </div>

    ${tableCard(
      'Movimentacoes do mes',
      transactions.length
        ? tableHtml(
            ['Data', 'Descricao', 'Categoria', 'Canal', 'Cartao', 'Valor'],
            transactions.map((item) => [
              formatDate(item.date),
              escapeHtml(item.description),
              escapeHtml(item.category),
              escapeHtml(paymentChannelLabel(item.paymentChannel)),
              escapeHtml(item.cardId ? getCardName(item.cardId) : '-'),
              `<span class="${item.type === 'income' ? 'accent-success' : ''}">${formatCurrency(item.amount)}</span>`
            ])
          )
        : emptyState('Nenhum lancamento no mes selecionado.')
    )}
  `;
}

function annualEquivalentTotal() {
  return (state.data.summary.annualSubscriptions || []).reduce(
    (sum, item) => sum + (Number(item.monthlyEquivalent) || 0),
    0
  );
}

function renderCommitments() {
  const section = document.querySelector('#compromissos');
  const summary = state.data.summary;
  const monthlyItems = state.data.recurringItems.filter((item) => item.billingCycle === 'monthly');
  const sortedMonthlyItems = [...monthlyItems].sort((a, b) => (a.dueDay || 99) - (b.dueDay || 99));
  const nextPayment = summary.insights.nextPayment;

  section.innerHTML = `
    <div class="grid-forms">
      ${formCard(
        'Novo compromisso fixo',
        `
          <form id="recurringForm" class="form-grid">
            <label><span>Nome</span><input type="text" name="name" placeholder="Ex: seguro, condominio, curso" required /></label>
            <div class="form-grid two">
              <label><span>Valor</span><input type="number" step="0.01" name="amount" required /></label>
              <label><span>Dia do pagamento</span><input type="number" name="dueDay" min="1" max="31" /></label>
            </div>
            <div class="form-grid two">
              <label><span>Categoria</span><input type="text" name="category" placeholder="Moradia, Servicos..." required /></label>
              <label>
                <span>Tipo</span>
                <select name="type">
                  <option value="fixed">Fixo</option>
                  <option value="estimate">Estimativa</option>
                  <option value="subscription">Assinatura</option>
                </select>
              </label>
            </div>
            <div class="form-grid two">
              <label>
                <span>Cobranca</span>
                <select name="paymentChannel">
                  <option value="pix_boleto">Pix/Boleto</option>
                  <option value="credit_card">Cartao</option>
                </select>
              </label>
              <label><span>Cartao</span>${cardSelectHtml('cardId')}</label>
            </div>
            <label class="checkbox-line"><input type="checkbox" name="canCut" /> Pode ser cortado sem grande impacto</label>
            <button type="submit" class="primary-button">Salvar compromisso</button>
          </form>
        `
      )}
      ${formCard(
        'Radar do calendario',
        `
          <div class="insight-list">
            ${smallInfo('Hoje', formatDate(summary.insights.today.date))}
            ${smallInfo('Proximo pagamento', nextPayment ? `${escapeHtml(nextPayment.name)} • dia ${nextPayment.dueDay}` : 'Nenhum item em aberto')}
            ${smallInfo('Atrasados', String(summary.overduePayments.length))}
          </div>
        `
      )}
      ${formCard(
        'Ajuste do mes selecionado',
        `
          <form id="recurringOverrideForm" class="form-grid">
            <label>
              <span>Compromisso</span>
              <select name="recurringItemId" required>
                <option value="">Selecione um item</option>
                ${sortedMonthlyItems.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.name)}</option>`).join('')}
              </select>
            </label>
            <div class="form-grid two">
              <label><span>Valor para ${escapeHtml(state.currentMonth)}</span><input type="number" step="0.01" name="amountOverride" placeholder="Deixe vazio para herdar o automatico" /></label>
              <label><span>Dia para ${escapeHtml(state.currentMonth)}</span><input type="number" min="1" max="31" name="dueDayOverride" placeholder="Deixe vazio para herdar" /></label>
            </div>
            <label>
              <span>Status do item neste mes</span>
              <select name="activeOverride">
                <option value="">Herdar comportamento automatico</option>
                <option value="true">Manter ativo neste mes</option>
                <option value="false">Pular somente neste mes</option>
              </select>
            </label>
            <label><span>Observacoes do ajuste</span><input type="text" name="notes" placeholder="Ex: reajuste, promocao, pausa temporaria..." /></label>
            <div class="table-action-group">
              <button type="submit" class="primary-button">Salvar ajuste mensal</button>
              <button type="button" class="secondary-button clear-override-button">Limpar ajuste</button>
            </div>
          </form>
        `
      )}
    </div>

    <div class="panel glass">
      <div class="panel-header">
        <div>
          <h3>Calendario financeiro</h3>
          <div class="panel-subtitle">Com destaque visual para hoje, atraso, proximo pagamento e situacao de quitação</div>
        </div>
        <span class="pill ${summary.insights.today.isCurrentMonth ? 'warn' : ''}">Hoje ${summary.insights.today.day}</span>
      </div>
      <div class="calendar-grid">
        ${sortedMonthlyItems
          .map(
            (item) => `
              <div class="calendar-card ${item.isPaid ? 'calendar-card-paid' : ''} ${item.isOverdue ? 'calendar-card-overdue' : ''} ${item.isDueToday ? 'calendar-card-today' : ''} ${item.isNextPayment ? 'calendar-card-next' : ''}">
                <div class="line-between">
                  <div class="calendar-day">Dia ${escapeHtml(item.dueDay || '-')}</div>
                  <span class="pill ${paymentStatusClass(item.paymentStatus)}">${escapeHtml(paymentStatusLabel(item.paymentStatus))}</span>
                </div>
                <div class="calendar-title">${escapeHtml(item.name)}</div>
                <div class="line-between">
                  <span class="calendar-amount">${formatCurrency(item.amount)}</span>
                  <span class="pill">${escapeHtml(paymentChannelLabel(item.paymentChannel))}</span>
                </div>
                <div class="line-between">
                  <span class="muted">${escapeHtml(item.category)}</span>
                  <span class="muted">${item.active ? 'Ativo' : 'Pausado'}</span>
                </div>
                <div class="calendar-highlight-row">
                  ${item.isDueToday && summary.insights.today.isCurrentMonth ? '<span class="pill warn">Hoje</span>' : ''}
                  ${item.isNextPayment ? '<span class="pill">Proximo</span>' : ''}
                  ${item.isOverdue ? '<span class="pill danger">Atrasado</span>' : ''}
                </div>
                <div class="calendar-context">${escapeHtml(getDueContextLabel(item, summary))}</div>
                <div class="calendar-actions">
                  <button class="primary-button toggle-payment-status" data-id="${escapeHtml(item.id)}" data-status="${item.isPaid ? 'unpaid' : 'paid'}">${item.isPaid ? 'Marcar como nao pago' : 'Marcar como pago'}</button>
                </div>
              </div>
            `
          )
          .join('')}
      </div>
    </div>

    ${tableCard(
      'Todos os compromissos',
      sortedMonthlyItems.length
        ? tableHtml(
            ['Nome', 'Categoria', 'Dia', 'Valor', 'Origem', 'Situacao', 'Leitura rapida', 'Acoes'],
            sortedMonthlyItems.map((item) => [
              escapeHtml(item.name),
              escapeHtml(item.category),
              escapeHtml(item.dueDay || '-'),
              formatCurrency(item.amount),
              `<span class="pill ${item.hasOverride ? '' : 'success'}">${escapeHtml(recurringSourceLabel(item))}</span>`,
              `<span class="pill ${paymentStatusClass(item.paymentStatus)}">${escapeHtml(paymentStatusLabel(item.paymentStatus))}</span>`,
              escapeHtml(getDueContextLabel(item, summary)),
              `<div class="table-action-group"><button class="primary-button toggle-payment-status" data-id="${escapeHtml(item.id)}" data-status="${item.isPaid ? 'unpaid' : 'paid'}">${item.isPaid ? 'Nao pago' : 'Pago'}</button><button class="secondary-button toggle-recurring" data-id="${escapeHtml(item.id)}" data-active="${item.active}">${item.active ? 'Pausar' : 'Reativar'}</button></div>`
            ])
          )
        : emptyState('Nenhum compromisso cadastrado.')
    )}
  `;
}

function renderCards() {
  const section = document.querySelector('#cartoes');
  const summary = state.data.summary;
  const cardTotals = [...summary.cardTotals];
  const installmentPlans = state.data.installmentPlans || [];
  const monthlyForecasts = state.data.cardMonthlyForecasts || [];

  section.innerHTML = `
    <div class="grid-forms">
      ${formCard(
        'Fatura variavel do mes',
        `
          <form id="cardForecastForm" class="form-grid">
            <label>
              <span>Cartao</span>
              ${cardSelectHtml('cardId')}
            </label>
            <label><span>Valor variavel em ${escapeHtml(state.currentMonth)}</span><input type="number" step="0.01" name="variableAmount" placeholder="Ex: compras do mes ainda abertas" required /></label>
            <label><span>Observacoes</span><input type="text" name="notes" placeholder="Ex: compras avulsas, lazer, mercado..." /></label>
            <div class="table-action-group">
              <button type="submit" class="primary-button">Salvar fatura variavel</button>
              <button type="button" class="secondary-button clear-card-forecast-button">Zerar fatura variavel</button>
            </div>
          </form>
        `
      )}
      ${formCard(
        'Nova compra parcelada',
        `
          <form id="installmentPlanForm" class="form-grid">
            <label><span>Descricao</span><input type="text" name="description" placeholder="Ex: notebook, viagem, celular..." required /></label>
            <div class="form-grid two">
              <label><span>Cartao</span>${cardSelectHtml('cardId')}</label>
              <label><span>Categoria</span><input type="text" name="category" placeholder="Tecnologia, Casa, Lazer..." value="Cartao Parcelado" /></label>
            </div>
            <div class="form-grid two">
              <label><span>Valor total</span><input type="number" step="0.01" name="totalAmount" required /></label>
              <label><span>Quantidade de parcelas</span><input type="number" min="2" max="48" name="totalInstallments" required /></label>
            </div>
            <div class="form-grid two">
              <label><span>Primeiro mes da parcela</span><input type="month" name="startMonth" value="${escapeHtml(state.currentMonth)}" required /></label>
              <label><span>Notas</span><input type="text" name="notes" placeholder="Algo importante sobre essa compra" /></label>
            </div>
            <button type="submit" class="primary-button">Salvar parcelamento</button>
          </form>
        `
      )}
      ${formCard(
        'Leitura do mes',
        `
          <div class="insight-list">
            ${smallInfo('Cartao previsto', formatCurrency(summary.plannedCard))}
            ${smallInfo('Componente fixo', formatCurrency(cardTotals.reduce((sum, item) => sum + (item.fixedAmount || 0), 0)))}
            ${smallInfo('Parcelas do mes', formatCurrency(cardTotals.reduce((sum, item) => sum + (item.installmentsAmount || 0), 0)))}
          </div>
        `
      )}
    </div>

    ${tableCard(
      `Resumo de cartoes em ${state.currentMonth}`,
      cardTotals.length
        ? tableHtml(
            ['Cartao', 'Venc.', 'Fixos', 'Variavel', 'Parcelas', 'Total previsto'],
            cardTotals.map((item) => [
              escapeHtml(item.cardName),
              escapeHtml(item.dueDay || '-'),
              formatCurrency(item.fixedAmount || 0),
              formatCurrency(item.variableAmount || 0),
              formatCurrency(item.installmentsAmount || 0),
              formatCurrency(item.plannedAmount || 0)
            ])
          )
        : emptyState('Nenhum cartao cadastrado.')
    )}

    ${tableCard(
      `Fatura variavel configurada em ${state.currentMonth}`,
      monthlyForecasts.length
        ? tableHtml(
            ['Cartao', 'Valor variavel', 'Observacoes'],
            monthlyForecasts.map((item) => [
              escapeHtml(getCardName(item.cardId)),
              formatCurrency(item.variableAmount),
              escapeHtml(item.notes || '-')
            ])
          )
        : emptyState('Nenhum ajuste de fatura variavel neste mes.')
    )}

    ${tableCard(
      'Parcelamentos ativos',
      installmentPlans.length
        ? tableHtml(
            ['Descricao', 'Cartao', 'Inicio', 'Parcela', 'Total', 'Status', 'Acoes'],
            installmentPlans.map((item) => [
              escapeHtml(item.description),
              escapeHtml(getCardName(item.cardId)),
              escapeHtml(item.startMonth),
              `${formatCurrency(item.installmentAmount)} • ${item.totalInstallments}x`,
              formatCurrency(item.totalAmount),
              `<span class="pill ${item.active ? 'success' : 'warn'}">${item.active ? 'Ativo' : 'Pausado'}</span>`,
              `<button class="secondary-button toggle-installment-plan" data-id="${escapeHtml(item.id)}" data-active="${item.active}">${item.active ? 'Pausar' : 'Reativar'}</button>`
            ])
          )
        : emptyState('Nenhum parcelamento cadastrado.')
    )}
  `;
}

function renderSubscriptions() {
  const section = document.querySelector('#assinaturas');
  const subscriptions = state.data.recurringItems.filter((item) => item.type === 'subscription');
  const monthly = subscriptions.filter((item) => item.billingCycle === 'monthly');
  const annual = subscriptions.filter((item) => item.billingCycle === 'annual');

  section.innerHTML = `
    <div class="two-column">
      ${tableCard(
        'Assinaturas mensais',
        monthly.length
          ? tableHtml(
              ['Nome', 'Dia', 'Onde paga', 'Dispensavel', 'Valor'],
              monthly.map((item) => [
                escapeHtml(item.name),
                escapeHtml(item.dueDay || '-'),
                escapeHtml(item.cardId ? getCardName(item.cardId) : paymentChannelLabel(item.paymentChannel)),
                item.canCut ? '<span class="pill warn">Sim</span>' : '<span class="pill success">Nao</span>',
                formatCurrency(item.amount)
              ])
            )
          : emptyState('Nenhuma assinatura mensal cadastrada.')
      )}
      ${tableCard(
        'Assinaturas anuais',
        annual.length
          ? tableHtml(
              ['Nome', 'Onde paga', 'Pago?', 'Custo anual', 'Equiv. mensal'],
              annual.map((item) => [
                escapeHtml(item.name),
                escapeHtml(item.cardId ? getCardName(item.cardId) : paymentChannelLabel(item.paymentChannel)),
                '<span class="pill success">Ja pago</span>',
                formatCurrency(item.amount),
                formatCurrency(item.amount / 12)
              ])
            )
          : emptyState('Nenhuma assinatura anual cadastrada.')
      )}
    </div>

    <div class="panel glass">
      <div class="panel-header">
        <div>
          <h3>Itens possivelmente removiveis</h3>
          <div class="panel-subtitle">Prioridade de corte para abrir folga no mes</div>
        </div>
        <span class="pill warn">${formatCurrency(state.data.summary.insights.optionalMonthlySpend)}</span>
      </div>
      <div class="timeline-list">
        ${state.data.summary.cutCandidates.length
          ? state.data.summary.cutCandidates
              .map(
                (item) => `
                  <div class="timeline-item">
                    <div class="timeline-row">
                      <strong>${escapeHtml(item.name)}</strong>
                      <span>${formatCurrency(item.amount)}</span>
                    </div>
                    <div class="timeline-row">
                      <span class="muted">${escapeHtml(item.category)}</span>
                      <span class="pill">${escapeHtml(paymentChannelLabel(item.paymentChannel))}</span>
                    </div>
                  </div>
                `
              )
              .join('')
          : emptyState('Nenhum candidato de corte identificado.')}
      </div>
    </div>
  `;
}

function renderMiles() {
  const section = document.querySelector('#milhas');
  const list = [...state.data.milesPrograms].sort((a, b) => (b.balance || 0) - (a.balance || 0));
  const totalPoints = list.reduce((sum, item) => sum + (Number(item.balance) || 0), 0);

  section.innerHTML = `
    <div class="grid-forms">
      ${formCard(
        'Novo programa',
        `
          <form id="mileForm" class="form-grid">
            <label><span>Programa</span><input type="text" name="name" placeholder="Ex: Azul, LATAM Pass" required /></label>
            <div class="form-grid two">
              <label><span>Saldo</span><input type="number" name="balance" step="1" required /></label>
              <label><span>Validade</span><input type="date" name="expiryDate" /></label>
            </div>
            <label><span>Observacoes</span><textarea name="notes" placeholder="Estrategia, alerta, promocao..."></textarea></label>
            <button type="submit" class="primary-button">Salvar programa</button>
          </form>
        `
      )}
      ${formCard(
        'Panorama',
        `
          <div class="insight-list">
            ${smallInfo('Programas acompanhados', String(list.length))}
            ${smallInfo('Maior saldo', list.length ? `${escapeHtml(list[0].name)} • ${list[0].balance.toLocaleString('pt-BR')}` : 'Sem dados')}
            ${smallInfo('Pontos totais', totalPoints.toLocaleString('pt-BR'))}
          </div>
        `
      )}
      ${formCard(
        'Uso sugerido',
        `
          <div class="insight-list">
            <div class="insight-item">Concentre aqui pontos, saldos e vencimentos.</div>
            <div class="insight-item">Use observacoes para regras de transferencia e bonus.</div>
            <div class="insight-item">A tabela ajuda a nao deixar saldo expirar.</div>
          </div>
        `
      )}
    </div>

    ${tableCard(
      'Programas e saldos',
      list.length
        ? tableHtml(
            ['Programa', 'Saldo', 'Validade', 'Observacoes'],
            list.map((item) => [
              escapeHtml(item.name),
              Number(item.balance || 0).toLocaleString('pt-BR'),
              item.expiryDate ? formatDate(item.expiryDate) : '-',
              escapeHtml(item.notes || '-')
            ])
          )
        : emptyState('Nenhum programa cadastrado.')
    )}
  `;
}

function renderInvestments() {
  const section = document.querySelector('#investimentos');
  const list = state.data.investments.filter(
    (item) => String(item.date).slice(0, 7) === state.currentMonth
  );
  const portfolioLink = state.data.settings?.portfolioLink || 'https://investidor10.com.br/';

  section.innerHTML = `
    <div class="grid-forms">
      ${formCard(
        'Novo aporte',
        `
          <form id="investmentForm" class="form-grid">
            <label><span>Data</span><input type="date" name="date" value="${escapeHtml(`${state.currentMonth}-01`)}" required /></label>
            <div class="form-grid two">
              <label><span>Plataforma</span><input type="text" name="platform" placeholder="XP, Rico, Investidor10..." required /></label>
              <label>
                <span>Tipo</span>
                <select name="type">
                  <option value="aporte">Aporte</option>
                  <option value="dividendo">Dividendo</option>
                  <option value="resgate">Resgate</option>
                </select>
              </label>
            </div>
            <label><span>Ativo / observacao</span><input type="text" name="asset" placeholder="Tesouro, ETF, FII..." required /></label>
            <label><span>Valor</span><input type="number" step="0.01" name="amount" required /></label>
            <label><span>Notas</span><textarea name="notes" placeholder="Complementos do aporte"></textarea></label>
            <button type="submit" class="primary-button">Salvar investimento</button>
          </form>
        `
      )}
      ${formCard(
        'Resumo do mes',
        `
          <div class="insight-list">
            ${smallInfo('Total investido', formatCurrency(state.data.summary.totalInvested))}
            ${smallInfo('Registros no mes', String(list.length))}
            ${smallInfo('Portfolio externo', `<a href="${escapeHtml(portfolioLink)}" target="_blank" rel="noreferrer">Abrir Investidor10</a>`)}
          </div>
        `
      )}
      ${formCard(
        'Integracao leve',
        `
          <div class="insight-list">
            <div class="insight-item">Use esta area para complementar o que o Investidor10 nao te mostra no dia.</div>
            <div class="insight-item">Voce consegue registrar aportes, dividendos e resgates manualmente.</div>
            <div class="insight-item">Mantem a relacao entre caixa mensal e patrimonio no mesmo app.</div>
          </div>
        `
      )}
    </div>

    ${tableCard(
      'Historico de investimentos',
      list.length
        ? tableHtml(
            ['Data', 'Plataforma', 'Tipo', 'Ativo', 'Valor', 'Notas'],
            list.map((item) => [
              formatDate(item.date),
              escapeHtml(item.platform),
              escapeHtml(item.type),
              escapeHtml(item.asset),
              formatCurrency(item.amount),
              escapeHtml(item.notes || '-')
            ])
          )
        : emptyState('Nenhum investimento registrado no mes selecionado.')
    )}
  `;
}

function renderAll() {
  if (!state.data) {
    return;
  }

  updateHeader();
  renderDashboard();
  renderTransactions();
  renderCommitments();
  renderCards();
  renderSubscriptions();
  renderMiles();
  renderInvestments();
}

async function loadBootstrap() {
  showMessage('#globalFeedback', 'Atualizando dados...');

  try {
    state.data = await api(`/api/bootstrap?month=${encodeURIComponent(state.currentMonth)}`);
    renderAll();
    showMessage('#globalFeedback', 'Dados carregados com sucesso.');
  } catch (error) {
    showMessage('#globalFeedback', error.message, true);
  }
}

async function checkSession() {
  document.querySelector('#monthPicker').value = state.currentMonth;

  try {
    const session = await api('/api/auth/session');
    if (session.authenticated) {
      setAuthMode(true);
      await loadBootstrap();
      return;
    }
  } catch {
    // ignored
  }

  setAuthMode(false);
}

function bindEvents() {
  document.querySelector('#loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    showMessage('#loginFeedback', 'Entrando...');

    try {
      await api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: formData.get('username'),
          password: formData.get('password')
        })
      });

      setAuthMode(true);
      showMessage('#loginFeedback', '');
      await loadBootstrap();
    } catch (error) {
      showMessage('#loginFeedback', error.message, true);
    }
  });

  document.querySelector('#logoutButton').addEventListener('click', async () => {
    try {
      await api('/api/auth/logout', { method: 'POST' });
      state.data = null;
      setAuthMode(false);
    } catch (error) {
      showMessage('#globalFeedback', error.message, true);
    }
  });

  document.querySelector('#refreshButton').addEventListener('click', () => {
    loadBootstrap();
  });

  document.querySelector('#monthPicker').addEventListener('change', (event) => {
    state.currentMonth = event.currentTarget.value || state.currentMonth;
    loadBootstrap();
  });

  document.querySelectorAll('.nav-button').forEach((button) => {
    button.addEventListener('click', () => {
      state.currentView = button.dataset.view;
      updateHeader();
    });
  });

  document.body.addEventListener('submit', async (event) => {
    const form = event.target;

    try {
      if (form.id === 'transactionForm') {
        event.preventDefault();
        const formData = new FormData(form);

        await api('/api/finance/transactions', {
          method: 'POST',
          body: JSON.stringify({
            date: formData.get('date'),
            description: formData.get('description'),
            amount: Number(formData.get('amount')),
            type: formData.get('type'),
            category: formData.get('category'),
            paymentChannel: formData.get('paymentChannel'),
            cardId: formData.get('cardId') || null
          })
        });

        showMessage('#globalFeedback', 'Lancamento salvo.');
        await loadBootstrap();
      }

      if (form.id === 'recurringForm') {
        event.preventDefault();
        const formData = new FormData(form);

        await api('/api/finance/recurring-items', {
          method: 'POST',
          body: JSON.stringify({
            name: formData.get('name'),
            amount: Number(formData.get('amount')),
            dueDay: formData.get('dueDay') ? Number(formData.get('dueDay')) : null,
            category: formData.get('category'),
            type: formData.get('type'),
            paymentChannel: formData.get('paymentChannel'),
            cardId: formData.get('cardId') || null,
            canCut: formData.get('canCut') === 'on',
            billingCycle: 'monthly'
          })
        });

        showMessage('#globalFeedback', 'Compromisso salvo.');
        await loadBootstrap();
      }

      if (form.id === 'recurringOverrideForm') {
        event.preventDefault();
        const formData = new FormData(form);
        const activeOverrideValue = formData.get('activeOverride');

        await api(
          `/api/finance/recurring-items/${encodeURIComponent(formData.get('recurringItemId'))}/override`,
          {
            method: 'PUT',
            body: JSON.stringify({
              month: state.currentMonth,
              amountOverride: formData.get('amountOverride'),
              dueDayOverride: formData.get('dueDayOverride'),
              activeOverride:
                activeOverrideValue === ''
                  ? null
                  : activeOverrideValue === 'true',
              notes: formData.get('notes')
            })
          }
        );

        showMessage('#globalFeedback', 'Ajuste mensal salvo.');
        await loadBootstrap();
      }

      if (form.id === 'cardForecastForm') {
        event.preventDefault();
        const formData = new FormData(form);

        await api(
          `/api/finance/cards/${encodeURIComponent(formData.get('cardId'))}/monthly-forecast`,
          {
            method: 'PUT',
            body: JSON.stringify({
              month: state.currentMonth,
              variableAmount: Number(formData.get('variableAmount')),
              notes: formData.get('notes')
            })
          }
        );

        showMessage('#globalFeedback', 'Fatura variavel atualizada.');
        await loadBootstrap();
      }

      if (form.id === 'installmentPlanForm') {
        event.preventDefault();
        const formData = new FormData(form);

        await api('/api/finance/installment-plans', {
          method: 'POST',
          body: JSON.stringify({
            description: formData.get('description'),
            cardId: formData.get('cardId'),
            category: formData.get('category'),
            totalAmount: Number(formData.get('totalAmount')),
            totalInstallments: Number(formData.get('totalInstallments')),
            startMonth: formData.get('startMonth'),
            notes: formData.get('notes')
          })
        });

        showMessage('#globalFeedback', 'Parcelamento salvo e projetado nos meses futuros.');
        await loadBootstrap();
      }

      if (form.id === 'mileForm') {
        event.preventDefault();
        const formData = new FormData(form);

        await api('/api/finance/miles', {
          method: 'POST',
          body: JSON.stringify({
            name: formData.get('name'),
            balance: Number(formData.get('balance')),
            expiryDate: formData.get('expiryDate'),
            notes: formData.get('notes')
          })
        });

        showMessage('#globalFeedback', 'Programa salvo.');
        await loadBootstrap();
      }

      if (form.id === 'investmentForm') {
        event.preventDefault();
        const formData = new FormData(form);

        await api('/api/finance/investments', {
          method: 'POST',
          body: JSON.stringify({
            date: formData.get('date'),
            platform: formData.get('platform'),
            type: formData.get('type'),
            asset: formData.get('asset'),
            amount: Number(formData.get('amount')),
            notes: formData.get('notes')
          })
        });

        showMessage('#globalFeedback', 'Investimento salvo.');
        await loadBootstrap();
      }
    } catch (error) {
      showMessage('#globalFeedback', error.message, true);
    }
  });

  document.body.addEventListener('click', async (event) => {
    const target = event.target;

    try {
      if (target.classList.contains('toggle-recurring')) {
        await api(`/api/finance/recurring-items/${encodeURIComponent(target.dataset.id)}`, {
          method: 'PUT',
          body: JSON.stringify({
            active: target.dataset.active !== 'true'
          })
        });

        showMessage('#globalFeedback', 'Compromisso atualizado.');
        await loadBootstrap();
      }

      if (target.classList.contains('toggle-payment-status')) {
        await api(
          `/api/finance/recurring-items/${encodeURIComponent(target.dataset.id)}/payment-status`,
          {
            method: 'PUT',
            body: JSON.stringify({
              month: state.currentMonth,
              status: target.dataset.status
            })
          }
        );

        showMessage(
          '#globalFeedback',
          target.dataset.status === 'paid'
            ? 'Pagamento marcado como pago.'
            : 'Pagamento marcado como nao pago.'
        );
        await loadBootstrap();
      }

      if (target.classList.contains('clear-override-button')) {
        const form = target.closest('form');
        const formData = new FormData(form);

        if (!formData.get('recurringItemId')) {
          throw new Error('Selecione um compromisso para limpar o ajuste.');
        }

        await api(
          `/api/finance/recurring-items/${encodeURIComponent(formData.get('recurringItemId'))}/override`,
          {
            method: 'PUT',
            body: JSON.stringify({
              month: state.currentMonth,
              clearOverride: true
            })
          }
        );

        showMessage('#globalFeedback', 'Ajuste mensal removido.');
        await loadBootstrap();
      }

      if (target.classList.contains('clear-card-forecast-button')) {
        const form = target.closest('form');
        const formData = new FormData(form);

        if (!formData.get('cardId')) {
          throw new Error('Selecione um cartao para zerar a fatura variavel.');
        }

        await api(
          `/api/finance/cards/${encodeURIComponent(formData.get('cardId'))}/monthly-forecast`,
          {
            method: 'PUT',
            body: JSON.stringify({
              month: state.currentMonth,
              clearForecast: true,
              variableAmount: 0
            })
          }
        );

        showMessage('#globalFeedback', 'Fatura variavel zerada para o mes.');
        await loadBootstrap();
      }

      if (target.classList.contains('toggle-installment-plan')) {
        await api(`/api/finance/installment-plans/${encodeURIComponent(target.dataset.id)}`, {
          method: 'PUT',
          body: JSON.stringify({
            active: target.dataset.active !== 'true'
          })
        });

        showMessage('#globalFeedback', 'Parcelamento atualizado.');
        await loadBootstrap();
      }
    } catch (error) {
      showMessage('#globalFeedback', error.message, true);
    }
  });
}

renderLayout();
bindEvents();
checkSession();
