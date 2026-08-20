# AGENTS.md - Car Rental (Luna Limo)

## Project Overview
Next.js 16 App Router + Convex backend. Luxury chauffeur service for Seattle.

## Commands
| Task | Command |
|------|---------|
| Dev server | `pnpm dev` |
| Production build | `pnpm build` |
| Start production | `pnpm start` |
| Lint | `pnpm lint` |
| Type check | `npx tsc --noEmit` |
| Convex dev | `npx convex dev` |
| Convex deploy | `npx convex deploy` |

**Note:** No test framework is currently configured. To add tests, use `convex-test` with `vitest` inside the `convex/` directory.

## Architecture
- **Frontend:** Next.js 16 App Router with Server Components
- **Backend:** Convex (queries, mutations, actions, HTTP endpoints)
- **Auth:** `@convex-dev/auth` with JWT providers
- **Styling:** Tailwind CSS v4 with custom dark theme (gold accent)
- **Forms:** React Hook Form + Zod v4 validation
- **State:** Zustand for client state, Convex for server state
- **Maps:** TomTom SDK + Leaflet
- **Package manager:** pnpm

## Code Style

### Imports
- Use `@/*` path alias for project imports (e.g., `@/lib/utils`, `@/components/ui/button`)
- Group imports: React/Next → external libs → internal `@/` → relative
- Always use named imports from Convex: `import { query, mutation } from "./_generated/server"`

### TypeScript
- **Strict mode enabled** — no `any` types
- Use `Id<"tableName">` and `Doc<"tableName">` from `./_generated/dataModel` for Convex types
- Use `QueryCtx`, `MutationCtx`, `ActionCtx` from `./_generated/server` for contexts
- Prefer explicit return types on exported functions
- Use `type` for type aliases, `interface` for object shapes that may be extended

### Components
- Server Components by default; add `"use client"` only when needed (hooks, events, browser APIs)
- Use `React.forwardRef` for UI primitives (buttons, inputs)
- Use CVA (`class-variance-authority`) for variant-based styling
- Combine classes with `cn()` from `@/lib/utils`
- File names: PascalCase for components (`ReviewForm.tsx`), kebab-case for routes

### Convex Conventions
- **Always read `convex/_generated/ai/guidelines.md` first** before writing Convex code
- Schema defined in `convex/schema.ts` with proper indexes
- Always include `args` validators on all functions
- Use `internalQuery`/`internalMutation`/`internalAction` for private functions
- Use `ctx.db.patch()` for partial updates, `ctx.db.replace()` for full replacement
- Prefer `.take(n)` or pagination over `.collect()` for bounded results
- **Do NOT use `.filter()` in queries** — use indexes instead
- Use `ctx.scheduler.runAfter(0, ...)` for async side effects (emails, notifications)
- Actions that need Node.js: add `"use node";` at file top (separate file from queries/mutations)

### Naming Conventions
- Convex functions: camelCase (`createRide`, `updateStatus`, `getRecent`)
- React components: PascalCase (`BookingForm`, `VehicleCard`)
- Variables/functions: camelCase
- Constants: UPPER_SNAKE_CASE
- Database tables: camelCase plural (`carTypes`, `rides`, `reviews`)

### Error Handling
- Throw `Error` with descriptive messages for validation failures
- Convex mutations should validate existence before operations (`ctx.db.get()` then throw if null)
- Client forms use Zod schemas with `@hookform/resolvers/zod`
- Never expose internal errors to users; show friendly messages

### Styling
- Dark theme by default (background: `#000000`, gold accent: `#C5A059`)
- Use CSS custom properties from `globals.css` (`--color-gold`, `--color-surface`, etc.)
- Utility classes: Tailwind v4 syntax with `@import "tailwindcss"`
- Custom utilities: `.glass`, `.gold-glow`, `.text-gradient-gold`, `.animate-fade-in`
- Fonts: DM Sans (body), DM Serif Display (headings)

### File Structure
```
app/              # Next.js App Router pages and layouts
components/       # React components
  ui/             # Primitive UI components (button, card, input)
  global/         # Shared layout components (header, footer)
  admin/          # Admin-specific components
  booking/        # Booking-related components
convex/           # Backend functions and schema
  _generated/     # Auto-generated Convex types (DO NOT EDIT)
  schema.ts       # Database schema
  *.ts            # Function files (rides.ts, users.ts, etc.)
lib/              # Utilities and shared logic
  convex/         # Convex client configuration
  store/          # Zustand stores
  pricing.ts      # Pricing calculations
  tomtom/         # Map utilities
  utils.ts        # General utilities (cn, debounce, formatters)
```

### Important Notes
- Next.js 16 has breaking changes — check `node_modules/next/dist/docs/` when unsure
- The `convex/` directory is excluded from the main tsconfig (separate config inside `convex/`)
- Environment variables: see `.env.example` for required keys
- Convex URL and auth provider config in `convex/auth.config.ts`
- Image optimization: AVIF/WebP formats, cached for 1 year
