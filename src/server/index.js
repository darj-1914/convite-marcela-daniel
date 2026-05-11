import { env } from './config/env.js';
import { createApp } from './app.js';

const app = createApp();

app.listen(env.port, () => {
  console.log(`Refynce API rodando em http://localhost:${env.port}`);
});
