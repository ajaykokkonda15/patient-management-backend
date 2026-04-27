# Syntrico Dev — NestJS Microservices ⚙️

A monorepo for NestJS microservices. This repository uses the apps/* pattern for services and libs/* (and `common/`) for shared code such as DTOs, entities, and utilities.

---

## 🚀 Quick start

**Prerequisites**: Node.js >=18, pnpm

Install deps:

```bash
pnpm install
```

Run the `onboarding-svc` in development:

```bash
pnpm run dev:onboarding-svc
```

Build & run:

```bash
pnpm run build:onboarding-svc
node dist/apps/onboarding-svc/main.js
```

Run lint and tests:

```bash
pnpm run lint
pnpm run test
pnpm run test:cov
```

---

## 🧭 Project layout

- `apps/` — individual NestJS services (e.g., `onboarding-svc`).
- `libs/`, `common/` — shared DTOs, interfaces, utilities, and types.
- `db/` — database module and entities shared across services.
- `test/` — integration / e2e tests.

This layout keeps service boundaries clear while letting services share contracts safely.

---

## 🔧 Microservices setup notes

Best practices and setup tips:

- Transport: use a message broker (NATS, RabbitMQ, Redis Streams) or Nest's TCP transport for inter-service communication depending on requirements.
- Contracts: keep DTOs/events in `libs/` so producers and consumers share the same types.
- Idempotency: design handlers to be idempotent to handle retries and duplicates.
- Observability: add structured logging and tracing to messages and handlers.

Example (high level) NATS client registration in a module:

```ts
import { ClientsModule, Transport } from '@nestjs/microservices';

ClientsModule.register([
  {
    name: 'EVENT_BUS',
    transport: Transport.NATS,
    options: { url: process.env.NATS_URL ?? 'nats://localhost:4222' },
  },
]);
```

---

## 🐳 Docker & local infra

Use docker-compose to run Postgres, NATS, or Redis alongside services.

Minimal `docker-compose.yml` snippet:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: syntrico
    ports:
      - "5432:5432"

  nats:
    image: nats:2
    ports:
      - "4222:4222"
```

Store service-specific env vars in `apps/<service>/.env` or your orchestration. Use `.env.example` files to document required variables.

---

## ✅ Running tests

- Unit tests: `pnpm run test`
- Coverage: `pnpm run test:cov`
- E2E tests: ensure infra (DB, broker) is available or use test containers / mocks.

---

## 🧪 Development tips

- Share DTOs and event contracts in `libs/` to ensure type-safety across services.
- Use `class-validator` and `class-transformer` for payload validation.
- Use `@nestjs/config` with a validation schema (see `apps/onboarding-svc/src/env.validate.ts`) for typed env management.

---

## 📚 Resources

- NestJS Docs: https://docs.nestjs.com
- Microservices guide: https://docs.nestjs.com/microservices/basics
- NATS: https://nats.io/

---

## Contributing

1. Open an issue to discuss large changes.
2. Create a branch, add tests, and open a PR targeting `main`.

---

If you'd like, I can add a ready-to-run `docker-compose.yml` and a small NATS-based example (producer + consumer + shared DTOs in `libs/`) — would you like that?