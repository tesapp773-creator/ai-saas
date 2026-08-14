# MKJ Business AI

Multi-tenant PWA where any business registers, uploads their own products/prices/FAQs, and gets
their own isolated AI assistant to talk to customers.

## What's live right now

- **Database** — deployed on Supabase project `mkj-business-ai` (`vaaeeyapaklszjfybiuj`). Every
  table has row-level security scoping data to its owning business.
- **AI chat engine** — deployed as the `chat` Supabase Edge Function. Looks up the business by
  its `public_key`, builds a system prompt from that business's own knowledge base only, calls
  Groq, stores the conversation, flags low-confidence replies for human handoff, and meters usage.
- **Next.js app** — auth, onboarding, dashboard (usage overview, AI knowledge editor, conversation
  inbox), and the public customer-facing chat widget.

## What's NOT live yet (on purpose)

- **Payments are structural only.** `plan_tier` and `usage_counters` exist so billing logic has
  something to read from, but no Paystack/Flutterwave integration is wired up and no money moves.
  Nothing charges a customer until that's explicitly turned on.
- **Push notifications for handoffs** — the edge function marks a conversation `handed_off`, but
  nothing pushes a notification to the owner yet.
- **Phase 2: competitor price tracking** — not started. Planned as a premium add-on after the core
  product is validated.

## Setup

1. Copy `.env.example` to `.env.local` and fill in `NEXT_PUBLIC_SUPABASE_ANON_KEY` from your
   Supabase project settings (API section).
2. Set the Groq key as a Supabase secret (not in this repo):
   `supabase secrets set GROQ_API_KEY=your_key --project-ref vaaeeyapaklszjfybiuj`
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
lib/
  supabase/                    Browser + server Supabase clients
  actions.ts                   Server actions: auth, business setup, knowledge CRUD, replies
  types.ts                     Shared types matching the database schema
```
