# MKJ Business AI

Multi-tenant PWA where any business registers, uploads their own products/prices/FAQs, and gets
their own isolated AI assistant to talk to customers.

Live at: your Vercel deployment (see Vercel project settings for the current URL).

## What's live right now

- **Database** — Supabase project `mkj-business-ai` (`vaaeeyapaklszjfybiuj`). Every table has
  row-level security scoping data to its owning business, with correct grants, verified table by
  table (last full audit: Aug 16).
- **AI chat engine** — the `chat` Supabase Edge Function. Looks up the business by its
  `public_key`, builds a system prompt from that business's own knowledge, payment methods, and
  rules, calls Groq, replies in Pidgin or English to match the customer, captures confirmed orders
  automatically, logs unanswered questions as knowledge gaps, sends the owner a push notification
  on handoff, stores the conversation, and meters usage.
- **Auth & onboarding** — signup, login, business creation, loading feedback on every button.
- **Dashboard**:
  - Overview — usage ledger, getting-started checklist
  - AI knowledge — products/FAQs/policies editor, plus a live knowledge gaps list
  - Orders — auto-captured from confirmed purchase intent in chat
  - Payment methods — Paystack/Flutterwave links or bank transfer details (informational only,
    no money is ever processed by this app)
  - Conversations — live inbox (Realtime + guaranteed polling fallback), owner replies
  - Analytics — conversation totals, AI-only resolution rate, open gaps, orders, monthly usage
  - Settings — real image uploads (Supabase Storage) for avatar + chat wallpaper, chat color,
    location, profile links, and push notification opt-in
- **Public customer widget** — at `/widget/[slug]`: persists across refresh, polls for new
  messages (owner replies) every few seconds, tap-to-view business profile panel, custom wallpaper
  and color, dynamic link generation (no placeholder domain).
- **Push notifications** — real Web Push (VAPID) to the owner's device on handoff, no third-party
  account required. Requires `VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY` as Supabase secrets and
  `NEXT_PUBLIC_VAPID_PUBLIC_KEY` on Vercel (all three already set as of Aug 16).
- **Error logging** — built-in `error_logs` table captures unexpected client-side crashes,
  queryable directly from Supabase.
- **Landing page** — hero, how-it-works, feature grid, CTA.
- **App icon** — real branded SVG icon (navy/gold), not a placeholder.

## What's NOT live yet (on purpose)

- **Payments are informational only.** No Paystack/Flutterwave API integration, no money is ever
  processed by this app - the AI only shares a link or bank details the business owner adds.
- **Phase 2: competitor price tracking** — not started. Planned as a premium add-on after the core
  product is validated.
- **Custom domain** — currently on the default Vercel domain.
- **Team accounts** — one login per business for now, no multi-staff support yet.
- **Dynamic (amount-specific) payment links** — current links are static, pasted in once by the
  owner, not generated per-order.

## Setup

1. Copy `.env.example` to `.env.local` and fill in `NEXT_PUBLIC_SUPABASE_ANON_KEY` from your
   Supabase project settings (API section).
2. Groq key and VAPID keys are already set as Supabase secrets on the `chat` edge function.
3. `npm install`
4. `npm run dev`

## Project structure

```
app/
  page.tsx                    Marketing landing page
  login/, signup/              Auth
  onboarding/                  First-time business setup
  dashboard/                   Owner-facing app (overview, knowledge, orders, payments,
                               conversations, analytics, settings)
  widget/[slug]/                Public customer-facing chat, keyed by business slug
  error.tsx, global-error.tsx  Error boundaries that log to Supabase automatically
lib/
  supabase/                    Browser + server Supabase clients
  actions.ts                   Server actions: auth, business setup, knowledge/payments/orders/
                               links CRUD, replies, customization
  types.ts                     Shared types matching the database schema
  site-url.ts                  Detects the real deployed URL for widget links
components/
  submit-button.tsx            Shared button with a loading state for every form
public/
  sw.js                        Service worker for push notifications
  icon.svg                     Real branded app icon
```
