# Chatio

A full-stack, real-time chat application featuring a modern Next.js frontend, a robust Node.js backend, and a Drizzle ORM-powered shared database schema. Managed as a monorepo using Turborepo and pnpm.

## Live Demo

- **Frontend Application**: [https://chatio-xcfio.vercel.app/](https://chatio-xcfio.vercel.app/)
- **Backend API & Documentation**: [https://api-xcfio.onrender.com](https://api-xcfio.onrender.com)

## Requirements

- Node.js >= 24.0.0
- pnpm >= 10.0.0

## Installation

```bash
git clone https://github.com/xcfio/chatio.git
cd chatio
pnpm install
```

## Environment Variables

Before starting the application, you'll need to set up your environment variables.
Create a `.env` file in both `apps/frontend` and `apps/backend` (or at the root, depending on your setup).
Typical required variables include:

- Database connection strings (e.g., PostgreSQL connection URL)
- JWT Secrets for authentication
- CORS allowed origins

## Quick Start

```bash
# Start all apps and packages in development mode
node --run dev

# Or start specific apps/packages using Turborepo
node --run dev -- --filter=backend
```

## Available Scripts

From the root directory, you can run the following commands:

- `node --run dev`: Starts the development servers for all applications.
- `node --run build`: Builds all apps and packages for production.
- `node --run lint`: Runs Prettier type checks across the monorepo.
- `node --run fmt`: Runs Prettier to format the codebase.
- `node --run test`: Runs all tests.

### Database Management (Drizzle)

To manage your database schema and migrations within `lib/schema` or `apps/backend`:

- `node --run db`: Starts Drizzle Studio on port `4000` to view and edit your database.
- `node --run gen`: Generates a new migration based on changes to your schema.

## Architecture

### `apps/frontend`

A React web application built with [Next.js](https://nextjs.org/) App Router, styled with [Tailwind CSS](https://tailwindcss.com/) and [shadcn/ui](https://ui.shadcn.com/). Handles the user interface, routing, and real-time Socket.io connections.

### `apps/backend`

A fast and low-overhead Node.js REST API and WebSocket server built heavily around **[Fastify](https://fastify.dev/)**. Includes powerful plugins for cookies, CORS, JWT authentication, rate-limiting, and auto-generated Swagger UI documentation.

### `lib/schema`

Shared [Drizzle ORM](https://orm.drizzle.team/) schemas for **PostgreSQL**, along with migrations and reusable TypeScript (`TypeBox`) validation types synced across the monorepo.

## Features

- **Authentication & Security:** JWT-based login, registration, email/password changes, rate limiting, and CORS configuration.
- **Real-time Engine:** Bi-directional messaging, typing indicators, read receipts, and online user status powered by Socket.IO.
- **Modern UI:** Responsive, accessible components built using shadcn/ui.
- **Extensible Database:** Fully-typed schema managing users, conversations, and messages with built-in migration handling.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Links & Community

| Resource          | URL                                    |
| ----------------- | -------------------------------------- |
| GitHub repository | https://github.com/xcfio/chatio        |
| Live Frontend     | https://chatio-xcfio.vercel.app        |
| Live Backend API  | https://api-xcfio.onrender.com         |
| Bug reports       | https://github.com/xcfio/chatio/issues |

### Discord

Join the community on Discord for help, and discussion:

**https://discord.gg/FaCCaFM74Q**

---

Made with ❤️ by [xcfio](https://github.com/xcfio)
