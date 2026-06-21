# ComfyToolkit

A fast, offline-friendly console of developer utilities. Every tool runs entirely in your browser — no data leaves the page. Press `⌘K` to jump to any tool.

## Tools

| Tool                      | Group      | What it does                                          |
| ------------------------- | ---------- | ----------------------------------------------------- |
| JSON Formatter            | Formatters | Format, minify and validate JSON                      |
| Code Formatter            | Formatters | Format JS/TS/CSS/HTML/YAML with Prettier              |
| Base64 Encode / Decode    | Encoders   | Encode and decode Base64 text                         |
| JWT Encoder / Decoder     | Encoders   | Encode, decode, inspect and verify JWTs               |
| HMAC Generator / Verifier | Encoders   | Generate and verify HMAC (SHA-256/384/512) signatures |
| UUID v7 Generator         | Generators | Generate UUID v7 and inspect embedded timestamps      |
| Secret / Key Generator    | Generators | Generate random secrets/keys (charset or random bytes) |
| Markdown Preview          | Text       | Edit Markdown with live GFM preview                   |
| Color Converter           | Color      | Convert between HEX, RGB, HSL, HSV, CMYK, OKLCH, LAB   |
| Palette Generator         | Color      | Build a color shade scale from any color              |
| Gradient Generator        | Color      | Build linear/radial/conic gradients and export them   |

Tools live in `src/lib/tools/` (logic + unit tests) and `src/routes/tools/` (UI). The catalog is defined in `src/lib/tools/registry.ts` — add an entry there to surface a new tool in the home grid and command palette.

## Tech Stack

- **[TanStack Start](https://tanstack.com/start)** — full-stack React framework (SSR + server functions)
- **[TanStack Router](https://tanstack.com/router)** — file-based routing (`src/routes/`)
- **[TanStack Query](https://tanstack.com/query)** + **[TanStack Store](https://tanstack.com/store)** — data and state
- **React 19** with the React Compiler (`babel-plugin-react-compiler`)
- **[Tailwind CSS v4](https://tailwindcss.com/)** + Radix UI primitives, [cmdk](https://cmdk.paco.me/) command palette, lucide icons
- **[Vite 8](https://vite.dev/)** + **[Vitest 4](https://vitest.dev/)** + **TypeScript**
- **[Cloudflare Workers](https://developers.cloudflare.com/workers/)** deploy target (`@cloudflare/vite-plugin`, `wrangler`)

## Getting Started

Requires [pnpm](https://pnpm.io/).

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

## Scripts

```bash
pnpm dev              # start dev server on port 3000
pnpm build            # production build
pnpm preview          # preview the production build
pnpm test             # run Vitest unit tests
pnpm lint             # eslint
pnpm format           # prettier --write + eslint --fix
pnpm check            # prettier --check
pnpm generate-routes  # regenerate routeTree.gen.ts (tsr generate)
pnpm deploy           # build + wrangler deploy
```

## Project Structure

```
src/
  components/
    layout/    # app shell, sidebar, command palette, theme toggle
    tools/     # shared tool UI (panels, copy button, highlighters)
    ui/        # primitives (button, input, tabs, code-editor, ...)
  lib/
    tools/     # tool logic + *.test.ts (jwt, hmac, json, base64, uuid, ...)
    theme.ts   # light/dark theme, persisted to localStorage
    *.ts       # hooks and helpers (persisted state, command palette, utils)
  routes/      # file-based routes; tools/ holds one route per tool
  router.tsx   # router setup
```

## Features

- **Offline-first** — all tools compute client-side (e.g. JWT/HMAC use the Web Crypto API); nothing is sent to a server.
- **Command palette** — `⌘K` to search and navigate every tool.
- **Light / dark theme** — toggled in-app, persisted to `localStorage`, applied before paint to avoid flash.

## Deploy to Cloudflare Workers

```bash
pnpm install -g wrangler
wrangler login
pnpm deploy
```

Worker config lives in `wrangler.jsonc`. KV, D1, R2, and Durable Object bindings are added there — see the [Wrangler configuration docs](https://developers.cloudflare.com/workers/wrangler/configuration/).
