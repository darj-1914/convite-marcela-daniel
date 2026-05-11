# Refynce

App pessoal para substituir sua planilha de controle financeiro por uma experiencia web mais fluida, agora com PostgreSQL, estrutura modular e frontend moderno com Vite.

## O que o app cobre

- Dashboard mensal com previsao de saldo
- Gastos diarios e receitas avulsas
- Compromissos fixos e calendario de vencimentos
- Separacao entre categoria e forma de pagamento sem dupla contagem
- Assinaturas mensais e anuais com visao de corte
- Milhas e programas de pontos
- Registro manual de investimentos
- Login simples por usuario e senha

## Stack

- `Node.js 20+`
- `Express`
- `PostgreSQL`
- `Docker Compose`
- `Vite`
- Frontend em HTML, CSS e JavaScript modernos

## Estrutura

- `src/server/index.js`: bootstrap do servidor
- `src/server/app.js`: montagem da aplicacao Express
- `src/server/config`: configuracoes de ambiente
- `src/server/db`: pool, migracoes e seed
- `src/server/modules`: modulos de autenticacao, bootstrap e financeiro
- `src/server/data/seed-data.js`: dados iniciais
- `client`: frontend Vite
- `docker-compose.yml`: PostgreSQL local

## Primeira configuracao

```bash
npm install
Copy-Item .env.example .env
npm run db:up
npm run db:migrate
npm run db:seed
```

## Rodando em desenvolvimento

```bash
npm run dev
```

Abre:

- Frontend: `http://localhost:5173`
- API: `http://localhost:3000`

## Rodando build local

```bash
npm run build
npm start
```

Depois abra:

- `http://localhost:3000`

## Login inicial

- Usuario: `admin`
- Senha: `123456`

## Scripts uteis

- `npm run db:up`: sobe o PostgreSQL
- `npm run db:down`: derruba o PostgreSQL
- `npm run db:logs`: acompanha logs do banco
- `npm run db:migrate`: aplica migracoes
- `npm run db:seed`: popula dados iniciais
- `npm run build`: gera o frontend de producao
- `npm run dev`: sobe frontend e backend juntos

## Observacoes

- Itens fixos entram uma vez no total mensal.
- O resumo por cartao mostra apenas o subconjunto pago no cartao.
- Gastos diarios avulsos complementam a leitura do mes e nao precisam repetir seus fixos.
- O backend ja vem preparado para crescer por modulos sem concentrar tudo em um arquivo so.
