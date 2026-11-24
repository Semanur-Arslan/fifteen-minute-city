# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project state

Freshly scaffolded with `create-next-app` (single initial commit). The only app code is the default template in `app/` — no domain logic, data layer, or tests exist yet.

## Commands

- `npm run dev` — dev server at http://localhost:3000 (Turbopack). Running it also regenerates the agent-rules block in `AGENTS.md`.
- `npm run build` — production build; also the main type-check gate (there is no separate `tsc` script).
- `npm run start` — serve the production build.
- `npm run lint` — ESLint 9 flat config (`eslint.config.mjs`: `core-web-vitals` + `typescript` presets).
- `npm run test` — run the Vitest suite once (`vitest.config.mts`, Node environment, `@/*` alias).
- `npm run test:watch` — Vitest in watch mode.
- Single file / single test: `npx vitest run lib/geo.test.ts` / `npx vitest run -t "test name"`.

Tests live next to their source as `*.test.ts`.

## Stack and configuration

- **Next.js 16.4 / React 19.3, App Router only** (`app/`). Bundled docs for this exact version are in `node_modules/next/dist/docs/` (`01-app/` is the relevant section) — consult them rather than relying on memory, per `AGENTS.md`.
- `next.config.ts` enables non-default features that change how code must be written:
  - `cacheComponents: true` — Cache Components / Partial Prerendering model; dynamic data access must be inside `<Suspense>` or marked cacheable (`"use cache"`). Check the docs before fetching data in server components.
  - `partialPrefetching: true` and `experimental.agentFeedback: true`.
  - Tailwind is wired through a Turbopack CSS rule (`@tailwindcss/turbopack` loader on `*.css`), not PostCSS — there is no `postcss.config`.
- **Tailwind CSS v4**: configured in CSS, not a `tailwind.config` file. Theme tokens (colors, fonts) live in the `@theme inline` block of `app/globals.css`; light/dark switches via `prefers-color-scheme` on the `--background`/`--foreground` variables.
- Fonts: Geist / Geist Mono via `next/font/google`, exposed as CSS variables in `app/layout.tsx`.
- Route-typed helpers are global (e.g. `LayoutProps<"/">` in `app/layout.tsx`), generated into `.next/types/`.
- TypeScript strict mode; import alias `@/*` maps to the repo root.

## Project vision

"15-Minute City Explorer": The user searches an address in Istanbul or İzmir and sees on a map which daily needs (schools, pharmacies, parks, grocery stores, public transport stops) are within a ~15-minute walk (~1.2 km radius in v1), plus a simple accessibility score per category. The author is a city & regional planning graduate turned frontend developer; this project is a portfolio piece.

## Tech decisions

- Next.js App Router, TypeScript strict mode, Tailwind CSS
- Map: MapLibre GL JS with OpenStreetMap-based tiles
- Geocoding: Nominatim; POI data: Overpass API. Respect their usage policies: debounce requests, cache results, no bulk queries.
- Testing: Vitest + React Testing Library for units/components; Playwright later for E2E.

## Working rules

- Before changing files, briefly explain the plan in Turkish and wait for approval on larger changes.
- Work in small steps; one feature per commit.
- Every new feature gets its own branch and is merged into `main` via a pull request; don't commit features directly to `main`.
- Every utility function gets unit tests.
- Code, comments, README and commit messages in English.
- Never commit secrets; use .env.local.
- Ask before adding a new dependency.
