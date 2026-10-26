# Bot or Not — Backend

Production-oriented backend for the Bot or Not Turing Game.

Built with Fastify, WebSockets, PostgreSQL, Drizzle ORM, Redis, Better Auth (Google OAuth), and OpenRouter AI.

---

## 1. Quick Start

### Prerequisites
- Node.js >= 20
- Docker & Docker Compose (or Colima)

### Step 1: Start Infrastructure
From the project root:
```bash
docker compose up -d
```
This starts:
- PostgreSQL 16 on `localhost:5432` (`botornot` database)
- Redis 7 on `localhost:6379`

### Step 2: Configure Environment
Copy `.env.example` to `.env` in `backend/`:
```bash
cd backend
cp .env.example .env
```

### Step 3: Run Database Migrations
```bash
npm run db:migrate
```
*(If updating schemas, run `npm run db:generate` followed by `npm run db:migrate`)*

### Step 4: Run the Development Server
```bash
npm run dev
```
The server will start at `http://localhost:4000`.

---

## 2. Available Scripts

- `npm run dev`: Starts the backend server with live reload (`tsx watch src/server.ts`).
- `npm run build`: Compiles TypeScript to `dist/` (`tsc`).
- `npm run start`: Runs compiled production server (`node dist/server.js`).
- `npm run db:generate`: Generates SQL migrations from Drizzle schemas.
- `npm run db:migrate`: Executes pending migrations on PostgreSQL.
- `npm run test`: Runs the Vitest test suite.
- `npm run lint`: Runs fast linter (`oxlint`).

---

## 3. Architecture Overview

```
backend/
├── src/
│   ├── config/env.ts              # Zod-validated environment configuration
│   ├── db/
│   │   ├── schema/                # Auth, users, games, messages, tokens, subscriptions
│   │   ├── migrations/            # Generated SQL migrations
│   │   └── index.ts               # Postgres connection & Drizzle instance
│   ├── auth/
│   │   ├── auth.ts                # Better Auth (Google OAuth)
│   │   └── middleware.ts          # Fastify & WebSocket session validation
│   ├── modules/
│   │   ├── matchmaking/           # Redis atomic Lua queue & AI timer fallback
│   │   ├── games/                 # Game state machine & guess/reward resolution
│   │   ├── chat/                  # Message validation, turn enforcement, AI trigger
│   │   ├── ai/                    # OpenRouter streaming & versioned prompts
│   │   ├── tokens/                # Atomic token ledger with balance safeguards
│   │   ├── extensions/            # Mutual-consent extension flow & Pro exemptions
│   │   ├── subscriptions/         # EntitlementService abstraction
│   │   └── stats/                 # Rolling 24-hr statistics & win percentage
│   ├── jobs/
│   │   └── expiry-worker.ts       # Server-authoritative session timer reconciler
│   ├── websocket/
│   │   ├── protocol.ts            # Zod-typed client & server event schemas
│   │   ├── connection-manager.ts  # Socket routing & game broadcasting
│   │   └── router.ts              # WebSocket event router
│   ├── routes/
│   │   ├── health.ts              # GET /health
│   │   ├── me.ts                  # GET /api/me & GET /api/me/stats
│   │   └── games.ts               # GET /api/games/:id & messages
│   ├── app.ts                     # Fastify setup & plugin registration
│   └── server.ts                  # Server entrypoint
```

---

## 4. Key Rules & Guarantees

1. **Server Authority**: The server owns timers (`ends_at`), balances, outcomes, and rewards. The client cannot forge results or balances.
2. **Atomic Token Ledger**: Token transactions use transactions with idempotency keys and enforce non-negative balances.
3. **Turn-Taking**: The server randomly chooses the first sender (Player A vs B, or Human vs AI). Only the designated side may send the initial message; subsequent chat is open.
4. **AI Anonymity**: The client is never told whether their opponent is Human or AI until the guessing phase is resolved. OpenRouter API keys never reach the frontend.
5. **Extensions**: Extensions are only available on resolved Human games. Both players must mutually consent; Pro players are exempt from token fees while normal players pay 20 tokens transactionally.
