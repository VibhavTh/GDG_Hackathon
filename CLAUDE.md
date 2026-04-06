# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## IMPORTANT THINGS TO REMEMBER
NEVER USE EM DASHES

## Project Description

The Green Market Farm greatly struggles to advertise their products and manage orders due to limited technical knowledge. They rely on word-of-mouth or other outdated methods, causing them to lose potential customers and revenue.
Build a simple, accessible system/website that allows farm owners to easily showcase their products, manage incoming orders, and track inventory without requiring advanced technical skills. The system should include a clean, visually appealing interface for customers to browse available goods, place orders, and view farm information. On the backend, it should allow farmers to quickly add or update products (name, category, price, availability, and maintain basic record. After the order is put through it could be saved in a database or a spreadsheet for the owner.

## Project Overview

**Green Market** — a farm-to-table marketplace where farmers list products and customers pay.

**Stack:** Next.js · Supabase (PostgreSQL + pgvector) · Stripe Connect · Supabase Auth · Vercel  
**Planned services:** Inngest (jobs) · Cloudinary (images) · Resend (email) · Twilio (SMS)

This is a **shared repository**. Confirm before pushing, force-pushing, or deleting branches.

## Current Status

Phase 1 (MVP) is in progress. No application code exists yet — the repo currently contains:
- `FEATURES.md` — full product spec across 4 phases (source of truth for features, data model, and architecture decisions)
- `UI-Guide/` — HTML prototype screens per feature area, paired with design screenshots
- `UI-Guide/verdant_hearth/DESIGN.md` — design system spec ("The Digital Hearth")

## Architecture Decisions (from FEATURES.md)

Key decisions already made:
- **Auth:** Supabase Auth (email+password+OTP for farm owners; Google OAuth+magic link for customers)
- **Payments:** Stripe — platform collects full charge in Phase 1; Stripe Connect split payouts in Phase 2
- **Images:** Cloudinary (transforms + moderation add-on)
- **Jobs:** Inngest on Vercel
- **Vectors:** pgvector via Supabase (HNSW index, `text-embedding-3-small` 1536-dim)

## User Roles (Phase 1)

| Role | Access |
|---|---|
| Farm Owner | Their farm — full CRUD on products, orders, inventory |
| Customer | Storefront, own order history |
| Guest | Browse, guest checkout, no history |

## Order Lifecycle

```
Placed → Confirmed → Preparing → Ready → Fulfilled
                                        ↘ Cancelled
       ↘ Failed (payment declined/timeout)
       ↘ Abandoned (PaymentIntent created, never completed)
```

## Critical Data Model Notes

- Products use **soft delete** (`deleted_at timestamptz`), not `is_visible = false` — historical orders must still render removed product names.
- Orders need `special_instructions text` and `failed`/`abandoned` status enum values from day one.
- Webhook idempotency via `processed_webhooks` table — every Stripe handler checks this before acting.
- RLS must be enabled on **all** Supabase tables from day one, not retrofitted.

## Design System ("The Digital Hearth")

See `UI-Guide/verdant_hearth/DESIGN.md` for the full spec. Key rules:
- **No 1px solid borders** — define section boundaries through tonal surface shifts (`surface` → `surface-container-low` → `surface-container`).
- **No pure black** — use `on-surface` (#1c1c17).
- **No drop shadows** — use tonal layering; only use diffuse ambient shadows (5% opacity, 20–40px blur) for floating elements.
- **No divider lines in lists** — use margin or background toggles.
- Colors: Forest Green `primary` (#173809), Terracotta `secondary` (#a03f29), Cream `surface` (#fcf9f0).
- Fonts: Newsreader (display/headlines) + Plus Jakarta Sans (body/labels).
- Cards: `rounded-lg` (1rem), no borders, generous padding (≥ 2rem).

## Security Requirements

- Supabase RLS on every table with a `farm_id` — enforced at DB level, not just app logic.
- Farm owners require email verification + 2FA before dashboard access.
- Dashboard sessions expire after 8 hours of inactivity; customer sessions persist 30 days.
- Stripe webhook handlers must verify signatures via `stripe.webhooks.constructEvent`.
- Rate limit all AI and paid API surfaces (see Phase 3 table in `FEATURES.md`).
- AI-generated content is **never** auto-published — farmer always reviews before publish.

## Phase 1 Blockers (must be resolved before ship)

- Background job queue chosen and wired up (Inngest recommended)
- RLS policies written and tested on all tables
- Guest order lookup page (email + order ID, no account required)
- `processed_webhooks` idempotency table and all Stripe handlers updated
- `special_instructions`, `deleted_at`, `tax_category` columns added to schema
- Failed + abandoned order states handled end-to-end
