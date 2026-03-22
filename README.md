# FrankmanDev Playground

FrankmanDev Playground is a standalone platform for browser games, useful apps and interactive experiments aligned with the FrankmanDev portfolio brand.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- TanStack Query
- Zustand
- Zod
- Framer Motion
- Supabase-ready auth and data layer

## MVP modules

- `Blackjack Reboot`
- `Todos Hub`

## Project structure

- `app/`: routes and page-level composition
- `components/`: shared UI and layout building blocks
- `features/`: domain modules for games and apps
- `lib/`: utilities, catalog metadata, validation and Supabase helpers
- `supabase/schema.sql`: starter database schema for profiles, favorites, stats and todos

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy env values:

```bash
cp .env.example .env.local
```

3. Start development:

```bash
npm run dev
```

4. Run checks:

```bash
npm run lint
npm run test
```

## Data strategy

- Guest users can play and use apps immediately.
- Auth is optional at first, but the schema supports profiles, favorites, stats and synced todos.
- Local-first UX stays fast while Supabase is introduced incrementally.
