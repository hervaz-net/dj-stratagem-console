# D&J Stratagem — operations console

Staff operations console for [D&J Stratagem, Inc.](https://djstratageminc.com): bidding, companies, pipeline, projects, and supply in one workspace.

This repo is the **ops console** (TanStack Start + Postgres). The public marketing site lives in [`hervaz-net/dj-stratagem`](https://github.com/hervaz-net/dj-stratagem) and is hosted at [djstratageminc.com](https://djstratageminc.com).

## Stack

React 19, TanStack Start, Tailwind v4, Better Auth (Google / X), Neon Postgres (PGLite locally).

## Develop

```bash
npm install
npm run dev
```

Sign in is required for `/admin`. Without `DATABASE_URL`, the app uses a local Postgres fallback and seeds demo data.

## Build

```bash
npm run build
npm run typecheck
```
