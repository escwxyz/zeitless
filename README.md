# zeitless

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines Astro, Hono, ORPC, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **Astro** - The web framework for content-driven websites
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **Hono** - Lightweight, performant server framework
- **oRPC** - End-to-end type-safe APIs with OpenAPI integration
- **workers** - Runtime environment
- **Drizzle** - TypeScript-first ORM
- **SQLite/Turso** - Database engine
- **Authentication** - Better-Auth
- **Oxlint** - Oxlint + Oxfmt (linting & formatting)
- **Turborepo** - Optimized monorepo build system

## Getting Started

First, install the dependencies:

```bash
bun install
```

## Database Setup

This project uses SQLite with Drizzle ORM.

1. Start the local SQLite database (optional):
   D1 local development and migrations are handled automatically by Alchemy during dev and deploy.

2. Update your `.env` file in the `apps/server` directory with the appropriate connection details if needed.

3. When you change `packages/db/src/schema/*`, generate a migration first:

```bash
bun run db:generate -- --name <migration-name>
```

4. Apply the migration through Alchemy:

```bash
bun run deploy
```

`bun run deploy` picks up `packages/db/src/migrations` through `packages/infra/alchemy.run.ts`, so D1 stays in sync with the deployed app.

Then, run the development server:

```bash
bun run dev
```

Open [http://localhost:4321](http://localhost:4321) in your browser to see the web application.
The API is running at [http://localhost:3000/v1](http://localhost:3000/v1).
Non-auth API routes are served under `/v1/*`, while Better Auth is mounted at `/auth`.

## Deployment (Cloudflare via Alchemy)

- Dev: bun run dev
- Deploy: bun run deploy
- Destroy: bun run destroy

For more details, see the guide on [Deploying to Cloudflare with Alchemy](https://www.better-t-stack.dev/docs/guides/cloudflare-alchemy).

## Git Hooks and Formatting

- Format and lint fix: `bun run check`

## Project Structure

```
zeitless/
├── apps/
│   ├── web/         # Frontend application (Astro)
│   └── server/      # Backend API (Hono, ORPC)
├── packages/
│   ├── api/         # API layer / business logic
│   ├── auth/        # Authentication configuration & logic
│   └── db/          # Database schema & queries
```

## Available Scripts

- `bun run dev`: Start all applications in development mode
- `bun run build`: Build all applications
- `bun run dev:web`: Start only the web application
- `bun run dev:server`: Start only the server
- `bun run check-types`: Check TypeScript types across all apps
- `bun run db:generate`: Generate database client/types
- `bun run check`: Run Oxlint and Oxfmt
