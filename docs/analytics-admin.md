# Painel de acessos (`/admin`)

Analytics próprio do portfólio: coleta first-party, banco Turso (libSQL) e um
dashboard protegido por e-mail + senha. Nenhum serviço de terceiros, nenhum
cookie de rastreamento, nenhum IP armazenado.

## Como funciona

```
visitante → components/analytics/tracker.tsx
              ↓ POST /api/track          (público, 204 sempre)
            app/api/track/route.ts
              ↓
            Turso  (page_views, events)
              ↑
            app/api/admin/stats  (exige cookie de sessão)
              ↑
            /admin/dashboard
```

- **`/admin`** — login. Já logado, redireciona para o dashboard.
- **`/admin/dashboard`** — métricas. Sem sessão, redireciona para `/admin`.
- O grupo de rotas `app/(admin)` tem layout próprio, então o admin não carrega
  a navbar, o footer nem o canvas 3D do site (que ficam em `app/(site)`).

## Setup

### 1. Banco no Turso

```bash
brew install tursodatabase/tap/turso
turso auth login
turso db create space-portfolio
turso db show space-portfolio --url
turso db tokens create space-portfolio
```

As tabelas são criadas sozinhas na primeira requisição — não há migration
manual.

### 2. Credenciais do admin

```bash
npm run admin:credentials
```

O script pergunta e-mail e senha (a senha não aparece na tela) e imprime as três
variáveis. A senha em texto puro nunca é gravada em lugar nenhum: só o digest
PBKDF2-SHA256 (210.000 iterações, salt aleatório) vai para o ambiente.

### 3. Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

| Variável | Para quê |
|---|---|
| `TURSO_DATABASE_URL` | URL do banco. Em dev dá para usar `file:local.db` (mesmo driver, arquivo local). |
| `TURSO_AUTH_TOKEN` | Token do Turso (não precisa com `file:`). |
| `ADMIN_EMAIL` | E-mail que loga no painel. |
| `ADMIN_PASSWORD_HASH` | Digest da senha, do script acima. |
| `ADMIN_AUTH_SECRET` | Chave HMAC do JWT de sessão. Mínimo 32 caracteres. |
| `NEXT_PUBLIC_DISABLE_ANALYTICS` | `1` desliga a coleta no cliente. |

Na Vercel, as mesmas cinco em **Settings → Environment Variables**
(Production + Preview). Trocar `ADMIN_AUTH_SECRET` invalida as sessões abertas.

## Dados falsos para visualizar o painel

```bash
npm run seed:analytics                      # 90 dias simulados
node scripts/seed-analytics.mjs --days 30
node scripts/seed-analytics.mjs --clear     # apaga tudo
```

Gera acessos com curva por hora, queda no fim de semana, crescimento ao longo do
período e picos ocasionais, além de países, dispositivos, origens e cliques de
download distribuídos por peso. O script limpa o banco antes de semear, e se
recusa a rodar contra um banco que não seja `file:` sem `--force` — para não
sujar o Turso de produção por engano.

## O que é coletado

`page_views`: timestamp, caminho, host do referenciador, país e cidade (headers
de geo da Vercel), tipo de dispositivo, navegador, SO, idioma, tempo na página,
id de sessão e um `visitor_hash`.

O `visitor_hash` é `SHA-256(dia + segredo + ip + user-agent)` truncado. O salt
muda todo dia, então dá para contar visitantes únicos por dia sem guardar IP e
sem conseguir reconstruir quem foi. Bots conhecidos são descartados pelo
user-agent antes de qualquer escrita.

`events`: cliques nos botões de download dos projetos
(`components/sub/project-card.tsx`). Para instrumentar outro elemento:

```tsx
import { trackEvent } from "@/lib/analytics/client";

<a onClick={() => trackEvent("contact_click", "LinkedIn")} … />
```

## Segurança

- Sessão em cookie `httpOnly` + `sameSite=lax` + `secure` em produção, JWT
  HS256 com validade de 12h.
- Senha comparada em tempo constante; o KDF roda mesmo quando o e-mail está
  errado, para não vazar por timing.
- Rate limit de 8 tentativas falhas por IP a cada 15 minutos
  (tabela `login_attempts`).
- `/admin` e `/api/` bloqueados no `robots.txt`, e o layout do admin manda
  `noindex`.
- `/api/track` é público por natureza (roda no navegador do visitante), então
  os números são estimativas honestas, não um contador à prova de fraude.

## Notas

- O formato do hash usa `.` como separador e base64url de propósito: `$` é
  expandido pelo dotenv e quebraria o valor dentro do `.env`.
- Os buckets do gráfico são em UTC.
- País e cidade só aparecem em produção na Vercel — em dev os headers de geo não
  existem e a coluna fica vazia.
