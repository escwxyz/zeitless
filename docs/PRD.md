# ZEITLESS MVP PRD

## 1. Product Overview

**Name:** Zeitless  
**Positioning:** Curated high-fashion archive store (single-item new + second-hand)  
**Core Value:** Sell _taste_, not inventory

---

## 2. Goals (MVP)

- Launch a minimal but high-quality fashion storefront
- Support end-to-end purchase flow
- Provide internal dashboard for product & order management
- Fully deploy on Cloudflare (no VPS)
- Protect single-item availability with reservation windows and no oversell

---

## 3. User Roles

### Buyer

- Browse products
- Add to cart
- Checkout
- View order + tracking
- Buyer may be anonymous or logged in, but the MVP core flow should not split core schemas by login state.
- Order viewing is validated through the email token sent by Resend or Cloudflare Email, so login is not required for core order access in phase 1.
- Logged-in buyer conveniences are a later enhancement, after Better Auth is fully landed.

### Admin (You)

- Manage products
- Upload images
- Manage orders
- Input tracking info
- Admin identity is determined by email match via environment variable + Better Auth hooks
- Admin-only/internal fields must live in admin-only schemas and should not be mixed into buyer-facing output.

### Contract & Access Model

- Contract-first API design is organized by **business domain**.
- Buyer-facing and admin/internal schemas are separated to keep permissions simple and explicit.
- The first App contract scope should focus on the core commerce flow:
  - product
  - reservation
  - cart
  - checkout/order
- Payment / Stripe and AfterShip are later-phase concerns and are not part of the first contract pass.
- Anonymous and logged-in buyers share the same phase-1 core commerce flow.

---

## 4. Core Features

### 4.1 Product

- Single-item model (no SKU system)

```ts
Product {
  id
  title
  brand
  category
  condition
  size
  price
  currency
  description
  images[]
  isSold
  reservedUntil?
  reservationStatus // available | reserved | sold
  createdAt
}
```

---

### 4.2 Inventory & Reservation

- Every item is a one-off product, not a stock count
- Item availability is controlled by a Durable Object per product
- Use optimistic locking / CAS to prevent oversell during checkout
- Reservation means a temporary hold on a single item when checkout begins, not ownership and not payment confirmation
- Reserve an item when checkout begins, not after payment completes
- Reservation expires after 30 minutes unless payment is confirmed
- A Durable Object alarm releases expired reservations automatically
- Stripe / external payment I/O must happen outside the critical storage section

---

### 4.3 Cart

- Stored in Durable Object
- Supports guest session
- Cart is separate from item reservation and does not guarantee ownership
- Phase 1 does not require separate guest-vs-login cart schemas; logged-in cart persistence is a later enhancement.
- Guest carts can be carried by a session or cookie-backed cart id, while browser-local storage remains a valid visitor-side fallback.
- Cart state does not own the inventory lock; checkout and reservation DOs own that lifecycle.

---

### 4.4 Order

```ts
Order {
  id
  userId
  items[]
  totalPrice
  status // reserved | paid | cancelled | shipped | completed
  shippingInfo
  trackingNumber
  reservedAt
  reservedUntil
  paidAt?
  cancelledAt?
  refundedAt?
  createdAt
}
```

- Buyer-facing order output should not expose admin-only notes or internal workflow metadata.
- Admin order schemas may include internal notes, review state, and operational metadata separately.

---

### 4.5 Payment

- Stripe-hosted Checkout Sessions for the MVP
- Webhook confirms payment and advances order state
- Payment success converts a reservation into a paid order
- Buyers may cancel within 30 minutes of payment and receive a refund to the original payment method
- After 30 minutes, refunds are not supported
- Timeout / cancellation should release the item back to available inventory
- Payment is important for the MVP, but the first App contract pass does not need to include payment/Stripe yet.

---

### 4.6 Authentication

- Single admin only
- Use environment variable email matching via Better Auth Data Hooks
- Non-admin users remain normal buyers with no elevated dashboard access

---

### 4.7 Logistics

- AfterShip (MVP)
- Supports SF Express

---

### 4.8 Dashboard

- Product CRUD
- Image upload (R2)
- Order management
- Shipment update
- Admin-only surface

### 4.9 API & Contract Model

- Shared schemas should live in `packages/contract` and act as the source of truth for ORPC input/output definitions.
- App contracts should cover buyer-facing business domains first.
- Admin contracts should cover dashboard CRUD and internal fields separately.
- Common schemas shared across both surfaces should be isolated in a common module.

---

## 5. Tech Stack

### Framework

- Better-T-Stack (monorepo + turborepo)

### Apps

- `apps/web` → Astro storefront
- `apps/dashboard` → TanStack Start admin
- `apps/server` → Hono API (Cloudflare Workers)

### Packages

- `api` → oRPC endpoints
- `contract` → shared ORPC input/output schemas and business-domain contracts
- `auth` → better-auth
- `db` → D1 + Drizzle
- `infra` → Cloudflare bindings (DO, R2, KV)

---

## 6. Architecture

```
Web (Astro)
   ↓
(oRPC)
   ↓
Hono API (Workers)
   ↓
D1 / R2 / Durable Objects
```

---

## 7. Third-party Services

- Stripe → payment
- AfterShip → tracking
- Resend / Cloudflare Email → email

---

## 8. Non-Goals (MVP)

- No multi-tenant
- No recommendation system
- No reviews/comments
- No complex inventory

---

## 9. Development Phases

### Phase 1

- Product model + reservation lifecycle
- Product API + reservation API
- Cart API + checkout reservation flow
- Image upload (R2)
- Product listing page

### Phase 2

- Product detail page
- Buyer order access by email token
- Logged-in buyer conveniences after Better Auth is fully landed

### Phase 3

- Stripe integration
- Refund / cancel window
- Order system

### Phase 4

- Dashboard

### Phase 5

- Tracking integration

---

## 10. Key Principles

- Minimal UI
- Fast loading (Cloudflare edge)
- Strong visual quality (images first)
- Manual curation over automation
- Reservation-first, single-item commerce
- Luxury editorial presentation over software-dashboard aesthetics
- No oversell, no post-window refund

---

## 11. One-line Summary

A Cloudflare-native curated fashion store with reservation-safe single-item commerce and full control.
