# MKJ Business AI

Multi-tenant PWA where any business registers, uploads their own products/prices/FAQs, and gets
their own isolated AI assistant to talk to customers.

Live at: your Vercel deployment (see Vercel project settings for the current URL).

## What's live right now

- **Database** — Supabase project `mkj-business-ai` (`vaaeeyapaklszjfybiuj`). Every table has
  row-level security scoping data to its owning business, with correct grants (fixed Aug 14).
- **AI chat engine** — the `chat` Supabase Edge Function. Looks up the business by its
  `public_key`, builds a system prompt from that business's own knowledge base only, calls Groq,
  stores the conversation, flags low-confidence replies for human handoff, and meters usage.
- **Auth & onboarding** — signup, login, business creation, all with loading feedback on every
  button.
- **Dashboard** — usage ledger, a getting-started checklist for new businesses, an AI knowledge
  editor (with success/error feedback), and a conversation inbox that updates live via Supabase
  Realtime — no refresh needed when a customer messages while you're looking at it.
- **Public customer widget** — at `/widget/[slug]`, link is generated dynamically from the real
  deployed domain (no placeholder text).
- **Error logging** — a lightweight built-in error log (`error_logs` table) captures unexpected
  client-side crashes automatically, queryable directly from Supabase. A dedicated tool like
  Sentry can be connected later for deeper alerting/visualization.
- **Landing page** — full marketing page: hero, how-it-works, feature grid, CTA.

## What's NOT live yet (on purpose)

- **Payments are structural only.** `plan_tier` and `usage_counters` exist so billing logic has
  something to read from, but no Paystack/Flutterwave integration is wired up and no money moves.
- **Push notifications for handoffs** — the edge function marks a conversation `handed_off`, but
  nothing pushes a notification to the owner yet.
- **Phase 2: competitor price tracking** — not started. Planned as a premium add-on after the core
  product is validated.
- **Custom domain** — currently on the default Vercel domain.
- **Real PWA icons** — `manifest.json` references icon files that don't exist yet; doesn't break
  the app, only matters when someone installs it to a home screen.

## Setup

1. Copy `.env.example` to `.env.local` and fill in `NEXT_PUBLIC_SUPABASE_ANON_KEY` from your
   Supabase project settings (API section).
2. Groq key is already set as a Supabase secret on the `chat` edge function.
3. `npm install`
4. `npm run dev`

## Project structure

```
app/
  page.tsx                    Marketing landing page
  login/, signup/              Auth
  onboarding/                  First-time business setup
  dashboard/                   Owner-facing app (usage, AI knowledge, conversations)
  widget/[slug]/                Public customer-facing chat, keyed by business slug
  error.tsx, global-error.tsx  Error boundaries that log to Supabase automatically
lib/
  supabase/                    Browser + server Supabase clients
  actions.ts                   Server actions: auth, business setup, knowledge CRUD, replies
  types.ts                     Shared types matching the database schema
  site-url.ts                  Detects the real deployed URL for widget links
components/
  submit-button.tsx            Shared button with a loading state for every form
```
