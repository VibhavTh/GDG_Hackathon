# Green Market — Features

> **Stack:** Next.js · Supabase (PostgreSQL + pgvector) · Stripe Connect · Supabase Auth · Vercel  
> **Last updated:** April 2026

---

## Phase Overview

| Phase | Weeks | Focus | Status |
|---|---|---|---|
| Phase 1 | 1–8 | MVP — farmer lists products, customer pays | 🔨 In progress |
| Phase 2 | 9–13 | Multi-farm + real Stripe payouts + moderation | 📋 Planned |
| Phase 3 | 14–18 | AI listing + vector search + discovery | 📋 Planned |
| Phase 4 | 19+ | Voice inventory + advanced analytics + growth | 💭 Future |

> Each phase ends with something a farmer can actually use. No partial ships.

---

## Phase 1 — MVP

> *Can a farmer list products and receive a paid order without help?*

### Checklist

- [ ] Supabase project setup with RLS enabled on all tables from day one
- [ ] Farm owner auth — email + password + email OTP (2FA)
- [ ] Customer auth — Google OAuth + magic link + guest checkout
- [ ] Manual product creation — name, category, price, stock, photo upload
- [ ] Product storefront — browse, filter by category, keyword search
- [ ] Single-farm cart
- [ ] Stripe checkout (platform collects full charge, manual payout for now)
- [ ] Order confirmation email to customer (via Resend)
- [ ] Farm owner order inbox — view orders, mark fulfilled
- [ ] Manual stock editing per product
- [ ] Mobile-friendly UI throughout — farm dashboard and storefront

### Explicitly out of Phase 1

- AI image listing generation
- Vector / semantic search
- Voice or NLU inventory updates
- Per-farm analytics
- Stripe Connect split payouts
- Staff accounts
- Super admin panel
- SMS notifications
- Pickup slot scheduling

### Open decisions blocking Phase 1

| Decision | Options | Recommendation | Resolved? |
|---|---|---|---|
| Background job queue | Inngest / QStash / Trigger.dev | **Inngest** — best DX on Vercel, generous free tier | ❌ |
| Auth provider | Supabase Auth / Clerk | **Supabase Auth** — already in stack, one less service | ❌ |
| Image storage | Cloudinary / Supabase Storage | **Cloudinary** — better free tier, built-in transforms + moderation | ❌ |
| Email service | Resend / Postmark | **Resend** — simplest SDK, 3k emails/month free | ❌ |
| Platform fee % | 3–8% typical | TBD — needed before Phase 2 | ❌ |
| Staging environment | Vercel preview / separate project | Vercel preview branches — zero config | ❌ |

### Known gaps to fix before Phase 1 ships

- **Failed payment states** — the order lifecycle needs `failed` and `abandoned` states. Declined cards, network timeouts mid-PaymentIntent, and out-of-order webhooks all need explicit paths. Without this you get phantom orders with no payment and no cleanup.
- **Guest order tracking** — guest checkout is in scope but there's no way to check status after the confirmation email. Need a lookup page by email + order ID, no account required.
- **Webhook idempotency** — Stripe re-delivers events. Every handler needs an idempotency check against `processed_webhooks` before acting, or a fulfilled order can trigger two transfers.
- **`special_instructions` on orders** — customers need a notes field at checkout ("leave at gate", allergy notes). Trivial now, painful migration later.
- **Soft delete on products** — `deleted_at timestamptz`, not `is_visible = false`. Historical order rows must still render the product name after a product is removed.

### Order lifecycle

```
Placed → Confirmed → Preparing → Ready → Fulfilled
                                        ↘ Cancelled (any stage)
       ↘ Failed (payment declined / timeout)
       ↘ Abandoned (PaymentIntent created, never completed)
```

### User roles (Phase 1 scope)

| Role | Access |
|---|---|
| Farm Owner | Their farm — full CRUD on products, orders, inventory |
| Customer | Storefront, own order history |
| Guest | Browse only, guest checkout, no history |

Full role table (Farm Staff, Super Admin) activates in Phase 2.

### Auth rules

- Farm owners require email verification + 2FA before dashboard access
- Farm cannot go live until: email verified + farm profile complete + (Phase 2) Stripe onboarding done
- Customer sessions persist 30 days with "remember me"
- Dashboard sessions expire after 8 hours of inactivity
- Plain-language error messages throughout — no "Invalid credentials", say "We couldn't find that email"

---

## Phase 2 — Multi-Farm & Payments

> *Make real money move to multiple farms correctly.*

### Checklist

- [ ] Multi-farm marketplace — multiple farms live simultaneously
- [ ] Stripe Connect Express onboarding per farm
- [ ] Unified cart → split order records per farm
- [ ] Automated payout to each farm on `Fulfilled` status
- [ ] Platform fee via `application_fee_amount` (exact % TBD)
- [ ] Full and partial refund handling
- [ ] Super admin — approve farms, view all orders, remove products
- [ ] Basic farm analytics — revenue chart, order count, top products
- [ ] Low stock threshold badge in dashboard
- [ ] Full order status email sequence (confirmed / ready / fulfilled / cancelled)
- [ ] Stripe Tax integration (sales tax by region)
- [ ] Order cancellation window — customer self-service cancel within 15 minutes

### New gaps introduced in Phase 2

- **Image moderation** — before opening multi-farm public registration, need automated NSFW screening on every upload. Cloudinary's moderation add-on handles this with one config flag.
- **Stripe `payouts_enabled` flip** — farms can lose payout capability after onboarding when Stripe requests updated verification docs. The dashboard needs an alert banner for this state. Currently nowhere in the spec.
- **Super admin audit log** — every admin action (edit farm, remove product, issue refund) must be persisted. Both a compliance requirement and a trust requirement when real money is involved.
- **Session revocation** — farm owners need a "sign out everywhere" button for stolen device scenarios. Requires invalidating refresh tokens across all sessions.
- **`tax_category` on products** — fresh produce, baked goods, and honey have different tax treatment by state. Must exist at the product level before Stripe Tax can calculate correctly.

### Stripe Connect implementation

```
Customer pays full amount  →  Platform Stripe account
Platform retains fee           (application_fee_amount)
On Fulfilled event         →  Transfer to farm's stripe_account_id

Key fields:
  farms.stripe_account_id            -- acct_1ABC...
  farms.stripe_onboarding_complete   -- bool
  farms.payouts_enabled              -- bool (sync from Stripe webhook)
  orders.stripe_payment_intent_id    -- pi_3ABC...
  orders.stripe_transfer_id          -- set after transfer fires
  orders.platform_fee_cents
```

- Transfer fires on `Fulfilled`, never at order creation
- Webhook handler checks `stripe_transfer_id IS NULL` before firing — idempotency
- Verify all webhooks with `stripe.webhooks.constructEvent`
- 1099-K forms auto-issued by Stripe — no manual handling required

### Refund handling matrix

| Scenario | Action |
|---|---|
| Customer cancels one item | Partial refund + suppress that farm's transfer |
| Customer cancels full order | Full refund + suppress all farm transfers |
| Farm cancels their portion | Partial refund to customer + no transfer to that farm |
| Chargeback filed | Platform absorbs initially; Stripe claws back per policy |

### Super admin capabilities

- List all farms: Active / Inactive / Pending Approval / Suspended
- Approve new farm registrations (optional moderation gate — decide before Phase 2)
- View any farm's dashboard without impersonating
- Flag or remove products violating platform policy
- Issue refunds on behalf of farms
- View platform-wide GMV, order count, active farms

---

## Phase 3 — AI & Discovery

> *Reduce farmer workload. Improve customer product discovery.*

### Checklist

- [ ] AI image → product listing pipeline (GPT-4o Vision)
- [ ] pgvector setup — `embedding vector(1536)` on products table
- [ ] Product embedding on create/update (async, non-blocking)
- [ ] Semantic search replacing basic keyword search
- [ ] Hybrid search — BM25 full-text + pgvector cosine + RRF merge
- [ ] "You might also like" recommendations on product pages
- [ ] Farm similarity on farm profile pages
- [ ] AI price suggestion via vector similarity against existing listings
- [ ] Duplicate product detection at listing creation time
- [ ] Low stock email + SMS notifications (Resend + Twilio)
- [ ] Embedding backfill job for all Phase 1–2 products (see below)

### AI image → listing pipeline

**Farmer UX:**
1. Tap "Add product" → "Upload a photo"
2. Client-side quality check (blur detection, size validation, basic food classifier)
3. Loading state: "Analyzing your product…" (~2–4 seconds)
4. Form pre-filled — farmer reviews, edits, publishes
5. AI never auto-publishes. Farmer always has final approval.

**Fields auto-generated:**

| Field | Notes |
|---|---|
| Product name | Specific ("Heirloom Cherry Tomatoes", not "Tomatoes") |
| Category | One of 11 defined categories |
| Description | 2–3 sentences, warm farm-to-table voice, no invented farm names |
| Suggested price | Cross-referenced via vector search against similar listings |
| Unit type | per lb / oz / each / dozen / bunch / jar / loaf |
| Tags | Array (e.g. `["organic", "seasonal", "fresh"]`) |
| Seasonal label | Spring / Summer / Fall / Winter / Year-round |
| Confidence score | 0.0–1.0. If < 0.6, warn farmer to double-check |

**Model routing:**

| Model | Use for | Cost/image |
|---|---|---|
| GPT-4o | Default — best accuracy + structured JSON | ~$0.02 |
| Claude Sonnet 4.6 | A/B test on description field — best prose quality | ~$0.02 |
| Gemini Flash | High-volume repeat uploads at scale | ~$0.005 |

Start with GPT-4o. A/B test Claude Sonnet on description quality. Route to Gemini Flash for scale once accuracy is validated.

**Estimated cost:** ~$0.01–0.03/image. At 100 new listings/month ≈ $1–3/month.

### Vector search architecture

**Embedding model:** `text-embedding-3-small` (OpenAI) — 1536 dimensions, $0.02/million tokens.

**Storage:** pgvector via Supabase — no extra service, RLS auto-scopes farm queries, HNSW index for ANN search. Revisit at 1M+ products.

```sql
ALTER TABLE products ADD COLUMN embedding vector(1536);
ALTER TABLE products ADD COLUMN embedding_updated_at timestamptz;
ALTER TABLE farms    ADD COLUMN catalog_embedding vector(1536);

CREATE INDEX ON products USING hnsw (embedding vector_cosine_ops);
```

**Re-embed when:** name, description, category, or tags change.  
**Do not re-embed when:** price, stock, or visibility changes.  
Re-embedding is always async — never blocks the product save.

**Search pipeline:**
1. Embed query string (~50ms, ~$0.000002/search)
2. Run hybrid search — pgvector cosine + BM25 + RRF merge
3. Apply boosts: in-season products, farms with `payouts_enabled`, listing freshness
4. Return top 20 with similarity scores

**Estimated search cost:** < $1/month at 100,000 searches/month.

**Use cases:**
- Customer semantic search ("something sweet for a salad" → strawberries, honey, cherry tomatoes)
- Price validation at listing time (similar listings average $4.20/lb)
- "You might also like" — embed current cart, find similar products from other farms
- Farm similarity on farm profile pages
- Duplicate detection at listing time

### Embedding backfill — required before Phase 3 launch

All products from Phases 1–2 have no vector. Before semantic search goes live:

1. Write a one-time backfill script — page all products, embed in batches of 50, write to `products.embedding`
2. Run as a background job the night before Phase 3 deploys
3. During transition: semantic search falls back to keyword-only where `embedding IS NULL`
4. Monitor `embedding_updated_at` — confirm 100% completion before removing fallback

**Estimated backfill cost:** 10,000 products × ~50 tokens = 500k tokens → ~$0.01 total.

### Rate limits — enforce before Phase 3 launch

| Endpoint | Limit | Reason |
|---|---|---|
| `POST /api/generate-description` | 20 req/hour per farm | ~$0.02/call |
| `POST /api/ai-listing` | 10 req/hour per farm | Vision model, most expensive |
| `POST /api/search` | 100 req/min per IP | Embedding costs per query |
| `POST /api/orders` | 5 req/min per IP | Prevent order spam |
| `POST /api/nlu-inventory` | 30 req/hour per farm | Whisper + LLM cost |

### Feedback loop for AI listing quality

Every time a farmer edits an AI-generated field before publishing, log the diff. Over time this surfaces:
- Systematic errors (AI consistently wrong on honey prices, misidentifies kohlrabi)
- Prompt improvement opportunities with few-shot examples
- Future fine-tuning data

---

## Phase 4 — Voice, Advanced Analytics & Growth

> *Power features that improve operations and retention.*

### Checklist

- [ ] Voice input + NLU inventory updates (Whisper + intent parser)
- [ ] Text semantic inventory updates (same NLU pipeline)
- [ ] Inventory update audit log
- [ ] Advanced analytics — period-over-period, customer return rate, waste log
- [ ] Pickup slot scheduling with slot manifest in order inbox
- [ ] Abandoned cart email reminders (2hr delay)
- [ ] Recurring orders / CSA box subscriptions
- [ ] Promotional codes + flash sales
- [ ] Google Sheets order sync
- [ ] Staff invite accounts with RBAC
- [ ] Customer product reviews + ratings

### NLU inventory update pipeline

Both voice and text flow through the same parser — speech-to-text is just a transcription step feeding the same intent layer.

```
Voice  →  Whisper API  →  cleaned transcript  ┐
                                               ├→ LLM intent parser
Text   ────────────────────────────────────────┘
                               ↓
               { intent, product_mention, quantity, unit }
                               ↓
            Vector similarity search — farm-scoped only
                    /                       \
             score ≥ 0.85               score < 0.85
            auto-apply                 disambiguation card
            + 5s undo toast            "Did you mean...?"
```

**Intent types:**

| Utterance | Intent | DB action |
|---|---|---|
| "we got 5 heirloom tomatoes" | `ADD` | `stock += 5` |
| "set tomatoes to 20" | `SET` | `stock = 20` |
| "sold out of eggs" | `MARK_OOS` | `stock = 0, is_visible = false` |
| "used 3 lbs of honey for samples" | `DEPLETE` | `stock -= 3` |
| "tomatoes are now $5 a pound" | `UPDATE_PRICE` | `price = 5.00` |
| "got 2 dozen eggs and 10 loaves" | `MULTI_UPDATE` | Two updates |

**Threshold rules:**
- `similarity ≥ 0.85` and top match is ≥ 0.08 above second → auto-apply with undo
- `similarity ≥ 0.85` but two matches within 0.05 of each other → disambiguation card
- `similarity < 0.70` → "Product not found — want to create a new listing?"

**LLM output format:**
```json
{
  "intent": "ADD",
  "updates": [
    { "product_mention": "heirloom tomatoes", "quantity": 5, "unit": null, "confidence": 0.97 }
  ]
}
```

**Voice model recommendation:**

| Model | Accuracy | Cost | Latency |
|---|---|---|---|
| Web Speech API | Good | Free | Real-time streaming |
| Whisper (OpenAI) | Best — handles accents, farm noise | $0.006/min | ~1–2s |
| Deepgram Nova-2 | Excellent | $0.0043/min | ~300ms |

**Recommended approach:** Web Speech API for live transcript feedback while farmer speaks → Whisper for final cleaned transcript → NLU parser.

**Estimated voice cost:** ~$0.0005/update. Negligible at 1,000 updates/month (~$0.50).

### Pickup slot gaps to address

- Slot capacity decrement must be transactional (same `SELECT FOR UPDATE` pattern as stock)
- Add waitlist: email notification when a slot opens up — recovers lost orders
- Slot manifest view in order inbox — orders grouped by pickup time for easy fulfillment

### Analytics — farm-level

All metrics strictly scoped to `farm_id`. No cross-farm data ever visible to a farm owner.

| Metric | Granularity |
|---|---|
| Total revenue | Daily / weekly / monthly |
| Order count | Daily / weekly / monthly |
| Average order value | Weekly / monthly |
| Top 5 products by revenue | Current period |
| Top 5 products by units sold | Current period |
| Inventory health | % of products low / out of stock |
| Customer return rate | Monthly (accounts only) |
| Period-over-period | vs. prior month / prior year |

### Analytics — super admin aggregate

| Metric | Notes |
|---|---|
| Platform GMV | All farms combined |
| Total orders + active farms | |
| Revenue by farm | Configurable: anonymized or named |
| Top-performing farms and products | |
| Zero-result search queries | Surfaces product gaps |

---

## Cross-Cutting Concerns

### Security checklist

- [ ] HTTPS enforced everywhere (Vercel handles this)
- [ ] All dashboard routes behind server-side role middleware
- [ ] Supabase RLS on every table with a `farm_id` column — enforced at DB level, not just app logic
- [ ] Rate limiting on all AI + paid API surfaces (see Phase 3 table)
- [ ] Stripe webhook signature verification on every handler
- [ ] Webhook idempotency — check `processed_webhooks` before acting
- [ ] Session revocation — "sign out everywhere" in profile settings
- [ ] Super admin audit log — every admin action persisted
- [ ] Image moderation before any upload reaches storage
- [ ] JWT tokens include role claim, validated server-side on every request
- [ ] AI-generated content always reviewed by farmer — never auto-published

### Performance targets

| Metric | Target |
|---|---|
| Hybrid search response | < 200ms |
| AI description generation | < 4s (shown to user) |
| Page load — storefront | < 1.5s LCP |
| Stock decrement transaction | < 50ms |
| Search query embedding | < 50ms, non-blocking to render |
| Re-embedding on product update | Async via job queue, never blocks save |

### Accessibility & usability

- WCAG 2.1 AA on all customer-facing UI
- Farm dashboard: plain language, large tap targets (≥ 44px), minimal required fields
- Mobile-first for both storefront and dashboard — farmers are primarily on phones
- Error messages always plain language — no technical codes surfaced to users

### Notifications

**Customer:**

| Event | Channel |
|---|---|
| Order placed | Email — receipt + summary |
| Order confirmed | Email |
| Order ready for pickup | Email + SMS |
| Order fulfilled | Email |
| Order cancelled | Email + refund confirmation |
| Pickup slot reminder | SMS (1hr before) |

**Farm owner:**

| Event | Channel |
|---|---|
| New order received | Email + in-app badge |
| Low stock threshold breached | Email + in-app badge |
| Stripe payout sent | Email |
| Stripe onboarding incomplete | Email (D+1, D+7 reminders) |
| `payouts_enabled` flipped to false | Email + dashboard banner (Phase 2) |

**Services:** Resend (email) + Twilio (SMS)

---

## Data Model — Additions & Corrections

Changes not covered in the base spec, or corrections to it.

```sql
-- Soft delete (replaces is_visible = false for archived products)
ALTER TABLE products ADD COLUMN deleted_at timestamptz;

-- Customer order notes
ALTER TABLE orders ADD COLUMN special_instructions text;

-- Failed / abandoned order states
-- Add to orders.status enum: 'failed' | 'abandoned'

-- Tax category per product (required for Stripe Tax)
ALTER TABLE products ADD COLUMN tax_category text;
-- values: 'fresh_produce' | 'baked_goods' | 'honey' | 'dairy' | 'meat' | 'general'

-- pgvector additions (Phase 3)
ALTER TABLE products ADD COLUMN embedding vector(1536);
ALTER TABLE products ADD COLUMN embedding_updated_at timestamptz;
ALTER TABLE farms    ADD COLUMN catalog_embedding vector(1536);
CREATE INDEX ON products USING hnsw (embedding vector_cosine_ops);

-- Super admin audit log (Phase 2)
CREATE TABLE admin_audit_logs (
  log_id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES auth.users,
  action        text,        -- 'remove_product' | 'suspend_farm' | 'issue_refund' | ...
  target_type   text,        -- 'farm' | 'product' | 'order'
  target_id     uuid,
  metadata      jsonb,
  created_at    timestamptz DEFAULT now()
);

-- Webhook idempotency (Phase 1)
CREATE TABLE processed_webhooks (
  stripe_event_id text PRIMARY KEY,
  processed_at    timestamptz DEFAULT now()
);

-- NLU inventory update audit log (Phase 4)
CREATE TABLE inventory_update_logs (
  log_id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id              uuid REFERENCES farms,
  product_id           uuid REFERENCES products,
  input_mode           text,        -- 'voice' | 'text'
  raw_transcript       text,
  parsed_intent        text,
  quantity_delta       int,
  price_delta          numeric,
  previous_stock       int,
  new_stock            int,
  match_confidence     float,
  was_confirmed_by_user bool,
  was_undone           bool,
  created_at           timestamptz DEFAULT now()
);
```

---

## Pre-Ship Checklists

### Before Phase 1 ships
- [ ] Background job queue chosen and configured (Inngest recommended)
- [ ] Auth provider chosen (Supabase Auth recommended)
- [ ] Image storage chosen (Cloudinary recommended)
- [ ] RLS policies written and tested on all tables
- [ ] Failed + abandoned order states handled
- [ ] Guest order lookup page live
- [ ] Webhook idempotency table created and handlers updated
- [ ] `special_instructions` and `deleted_at` columns added

### Before Phase 2 ships
- [ ] Platform fee % finalized (needed for `application_fee_amount`)
- [ ] States/regions confirmed (affects Stripe Tax config)
- [ ] Farm approval flow decided: manual super admin gate or auto-approve?
- [ ] Partial refund UX decided: who initiates — customer or farm owner?
- [ ] Image moderation live before public registration opens
- [ ] `payouts_enabled` flip alert built into dashboard
- [ ] Super admin audit log live
- [ ] Session revocation built into profile settings
- [ ] `tax_category` added to products table

### Before Phase 3 ships
- [ ] Embedding backfill job written, tested, and scheduled
- [ ] Semantic search falls back to keyword for `embedding IS NULL` during transition
- [ ] Rate limits enforced on all AI endpoints
- [ ] A/B test GPT-4o vs Claude Sonnet on description field — pick winner before full rollout
- [ ] Feedback loop logging (diff between AI output and what farmer published) live

### Before Phase 4 ships
- [ ] Voice model chosen: Whisper vs Deepgram (Deepgram faster, Whisper more accurate)
- [ ] RBAC permissions matrix written for staff accounts
- [ ] Legal review of review/rating system (defamation risk)
- [ ] Pickup slot waitlist built
- [ ] NLU edge cases tested: negative stock, ambiguous units, bad transcription fallback

---

## Unscheduled Backlog

Validated ideas with no phase assignment. Don't lose these.

| Feature | Why it's good | Effort |
|---|---|---|
| QR order receipt | Customer gets QR at checkout, farm scans at pickup — zero paper, great demo moment | Low |
| Seasonal availability calendar | Visual monthly view, products auto-dim out of season — signals domain expertise | Medium |
| Harvest box builder | Custom box up to a price cap, "Surprise me" auto-fills — drives AOV + return visits | Medium |
| WhatsApp order alerts | New order fires WhatsApp to farmer via Twilio — meets them where they already are | Low |
| Digital loyalty punch card | Phone number as ID, stamp per order, free item at 8 — drives repeat visits | Medium |
| Live "only N left" stock counter | Real-time badge on product cards, turns amber at 5 — creates urgency | Low |
| AI description writer (in dashboard) | One-click generate from product name + category, tone selector — Phase 3 lite for MVP | Low |
| Visual search | Customer uploads photo to find matching products — reuses Phase 3 vision pipeline | High |
| SNAP/EBT support | Significant compliance + Stripe config work, but high community impact | High |
| Route optimization | Multi-stop delivery routing — only relevant if farms offer delivery | High |
| Instagram Shopping sync | Product feed pushed to Instagram — good for farm discovery | Medium |
| Barcode/QR label printing | For packaged goods — useful for farms doing delivery | Medium |
| Inventory forecasting | Based on historical sales velocity — surfaces overproduction patterns | High |
