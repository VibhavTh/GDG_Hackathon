# Green Market

A single-vendor, farm-to-table storefront built for **The Green Market Farm** at the Blacksburg farmers market. Green Market gives one family-run farm a clean, accessible web presence: customers can browse seasonal produce, place orders, and track them without an account, while the farmer manages inventory, fulfills orders, and drafts new product listings with the help of AI, all from a single dashboard.

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20pgvector-3ecf8e?logo=supabase)
![Stripe](https://img.shields.io/badge/Stripe-Checkout-635bff?logo=stripe)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38bdf8?logo=tailwindcss)

## Overview

Green Market is intentionally **not** a multi-vendor marketplace. It is one storefront, for one farm, with one admin surface. The farm owner and their staff had been losing customers because their only advertising channel was word of mouth, so this project provides a low-friction way to showcase products, capture orders online, and manage fulfillment without needing deep technical knowledge.

The platform serves three audiences:

1. **The farm owner and staff** get a protected admin dashboard for inventory, order fulfillment, events, newsletters, and a built-in AI voice assistant for hands-free farm operations.
2. **Registered customers** can sign in with Google or a magic link and view their order history.
3. **Guests** can browse, check out, and look up their order later using an email and order number, with no account required.

## Features

### Customer storefront

- Product catalog with category filters, sorting (newest, price, name), and seasonal availability windows
- Hybrid search that first does substring matching on product names and descriptions, then falls back to semantic vector search (pgvector) when no keyword match is found
- Shopping cart backed by Zustand with client-side persistence
- Stripe Checkout for guest and authenticated checkout, with server-side stock and price validation
- Delivery or pickup fulfillment, with optional fulfillment fee
- Order confirmation page and guest order lookup (email + order number, no login required)
- Customer accounts via Google OAuth or email magic link
- Farm gallery, contact form, events calendar, and newsletter sign-up

### Farm owner dashboard

- Home dashboard with revenue totals, active orders, sales charts, low-stock alerts, and seasonal product tracking
- Inventory CRUD with **soft delete** (`deleted_at`), so historical orders continue to render the original product name even after a listing is removed
- Order fulfillment workflow covering the full lifecycle: `placed`, `confirmed`, `preparing`, `ready`, `fulfilled`, with `cancelled`, `failed`, and `abandoned` terminal states
- SMS notification sent to the customer when an order advances to `ready`
- Contact inbox for customer messages, newsletter composer and sender, events management, and farm settings (name, description, location, contact info)
- Email and password authentication with email verification for farm owner accounts

### AI capabilities

The platform bundles four distinct AI features, each wired to the model best suited for the job.

- **AI product image analysis** uses the **Google Gemini 2.5 Flash** vision model to turn an uploaded photo into a structured draft listing. The model returns a suggested name, description, category, unit, price, and organic flag, which the farmer can edit before publishing. This removes most of the manual effort of cataloging new produce.
- **AI voice assistant for farm operations** lets staff run the farm hands-free by speaking commands like "mark order 1042 as ready" or "set strawberries to 20 in stock." Intent interpretation runs on **Claude Haiku 4.5**, which calls a controlled set of backend tools (update stock, toggle product active, delete product, advance order status, cancel order, query inventory, query orders, query revenue). Destructive actions require an explicit confirmation turn.
- **Speech transcription for voice workflows** uses **Deepgram Nova-2** to convert microphone audio into text, with product-name keyword boosting so farm-specific vocabulary transcribes accurately even in noisy environments.
- **Semantic enrichment and embeddings** expand each product into a richer, search-oriented description (color, texture, flavor, use cases) via **Gemini 2.5 Flash**, then generate a 1536-dimensional embedding with **OpenAI `text-embedding-3-small`**. Embeddings are stored in Postgres using **pgvector** with an **HNSW index**, powering the semantic search fallback on the storefront.

### Notifications

- **Resend** for transactional email: order confirmations, vendor new-order notifications, approval and rejection emails, contact replies, and newsletter sends
- **Twilio** for SMS: pickup-ready notifications when an order status advances to `ready`

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | Next.js 16.2.3 (App Router), React 19.2.4, TypeScript 5 |
| Styling | Tailwind CSS 4, Newsreader + Plus Jakarta Sans, Material Symbols Outlined |
| Database | Supabase (PostgreSQL + pgvector), row-level security on every table |
| Auth | Supabase Auth via `@supabase/ssr` (email/password for admins, Google OAuth + magic link for customers) |
| Payments | Stripe 22 (Checkout Sessions + webhooks) |
| Client state | Zustand 5 (cart store) |
| AI SDKs | `openai`, `@google/generative-ai`, `@anthropic-ai/sdk`, `@deepgram/sdk`, Vercel `ai` SDK |
| Notifications | Resend (email), Twilio (SMS) |
| Hosting target | Vercel |

## Project structure

```
green-market/
├── src/
│   ├── app/
│   │   ├── (storefront)/         # Customer routes: products, cart, checkout, order-lookup, account, gallery, contact
│   │   ├── (admin)/              # Dashboard, inventory, orders, settings, admin inbox, newsletter, events
│   │   ├── api/
│   │   │   ├── analyze-product-image/   # Gemini 2.5 Flash vision
│   │   │   ├── voice-assistant/         # Claude Haiku 4.5 + Deepgram transcription
│   │   │   ├── checkout/                # Stripe Checkout Session creation
│   │   │   ├── webhooks/stripe/         # Stripe webhook handler (idempotent)
│   │   │   ├── orders/lookup/           # Guest order lookup
│   │   │   └── newsletter/subscribe/
│   │   ├── auth/callback/
│   │   ├── customer/                    # Customer auth pages
│   │   └── vendor/                      # Farm owner auth pages
│   ├── components/
│   │   └── admin/voice-assistant/       # Voice UI + hook
│   ├── lib/
│   │   ├── embeddings.ts                # Gemini enrichment + OpenAI embedding
│   │   ├── email.ts                     # Resend transactional templates
│   │   ├── twilio.ts                    # SMS via Twilio REST API
│   │   └── supabase/                    # Server + browser clients, generated types
│   ├── stores/cart-store.ts
│   └── middleware.ts
├── supabase/                            # SQL migrations (apply in order via Supabase SQL editor)
└── package.json
```

## Getting started

### Prerequisites

- **Node.js 20+**
- A **Supabase** project (free tier is enough for local development)
- A **Stripe** account in test mode, plus the Stripe CLI for local webhook forwarding
- API keys for **OpenAI**, **Google Gemini**, **Anthropic**, **Deepgram**, **Resend**, and **Twilio**

### Install

```bash
git clone <your-fork-url>
cd GDG_Hackathon/green-market
npm install
```

### Environment variables

Create `green-market/.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# AI providers
OPENAI_API_KEY=
GEMINI_API_KEY=
ANTHROPIC_API_KEY=
DEEPGRAM_API_KEY=

# Email (Resend)
RESEND_API_KEY=
RESEND_FROM_EMAIL="Green Market <notifications@greenmarket.farm>"

# SMS (Twilio)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=
```

### Database setup

Apply the SQL files in [supabase/](supabase/) through the Supabase SQL editor, in this order:

1. [supabase/schema-patches.sql](supabase/schema-patches.sql) (core tables and RPCs)
2. [supabase/rls-policies.sql](supabase/rls-policies.sql) (row-level security)
3. [supabase/auth-trigger.sql](supabase/auth-trigger.sql) (auto-create user profiles on sign-up)
4. [supabase/admin-features.sql](supabase/admin-features.sql) (admin dashboard helpers and audit logging)
5. [supabase/vector-search.sql](supabase/vector-search.sql) (pgvector column, HNSW index, match RPC)
6. [supabase/gallery.sql](supabase/gallery.sql) (farm gallery table)

### Run the app

```bash
npm run dev                 # Start Next.js on http://localhost:3000
npm run stripe:listen       # Forward Stripe webhooks to localhost (separate terminal)
```

### Build and lint

```bash
npm run build
npm run start
npm run lint
```

## Key routes

| Route | Audience | Purpose |
| --- | --- | --- |
| `/` | Public | Homepage, featured products, upcoming events, newsletter |
| `/products` | Public | Catalog with filters, sorting, and hybrid search |
| `/cart` | Public | Cart review and quantity adjustment |
| `/checkout` | Public | Guest or authenticated checkout via Stripe |
| `/order-confirmation` | Public | Post-purchase summary |
| `/order-lookup` | Guest | Track an order with email + order number |
| `/customer/login` | Customer | Google OAuth or magic link |
| `/account` | Customer | Order history |
| `/vendor/login` | Farm owner | Email and password sign-in |
| `/dashboard` | Farm owner | Metrics overview and voice assistant |
| `/dashboard/inventory` | Farm owner | Product CRUD with AI image analysis |
| `/dashboard/orders` | Farm owner | Fulfillment queue and order detail |
| `/admin` | Farm owner | Contact inbox, newsletter, events, settings |

## Order lifecycle

```
placed ──▶ confirmed ──▶ preparing ──▶ ready ──▶ fulfilled
                                         │
                                         └──▶ cancelled

       failed      (payment declined or timed out)
       abandoned   (PaymentIntent created, never completed)
```

## Security notes

- **Row-level security** is enabled on every Supabase table from day one, not retrofitted. RLS policies live in [supabase/rls-policies.sql](supabase/rls-policies.sql).
- **Stripe webhooks** are verified via `stripe.webhooks.constructEvent`, and idempotency is enforced through a `processed_webhooks` table, so replays never double-process an order.
- **Soft-deleted products** (`deleted_at`) preserve historical order integrity: a removed product still renders correctly on past receipts.
- **AI output is always human-reviewed** before publish. The product image analysis endpoint returns a draft, never auto-creates a listing.
- **Rate limiting** is applied to AI and paid API surfaces to cap cost exposure.
- Farm owner sessions expire after 8 hours of inactivity; customer sessions persist for 30 days.

## Contributing

This is a shared repository. Please confirm before force-pushing, rewriting history, or deleting branches. See [../CLAUDE.md](../CLAUDE.md) and [../FEATURES.md](../FEATURES.md) for project conventions, the full feature roadmap, and the design system spec.

## License

License is TBD. Until a license is added, all rights are reserved by the project authors.
