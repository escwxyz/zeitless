# Checkout Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a custom checkout review page that collects shipping/contact details, summarizes the cart, and hands off to hosted Stripe Checkout.

**Architecture:** Astro owns the route shell and page composition. TanStack Form and cart summary UI live in client-only React islands so the page stays branded without pushing payment UI into the storefront. Stripe still owns payment capture; the server only creates the session and redirects with dedicated complete/cancel routes.

**Tech Stack:** Astro, React 19, TanStack Form, nanostores, shadcn/ui, Stripe Checkout Sessions, oRPC, Hono/Workers.

---

### Task 1: Add checkout form primitives and shared validation/content

**Files:**
- Create: `packages/ui/src/components/field.tsx`
- Create: `packages/ui/src/components/input.tsx`
- Create: `packages/ui/src/components/select.tsx`
- Create: `packages/ui/src/components/separator.tsx`
- Create: `apps/web/src/lib/checkout-content.ts`
- Create: `apps/web/src/lib/checkout-form-schema.ts`
- Create: `apps/web/src/lib/checkout-form-schema.test.ts`

- [ ] **Step 1: Add the shadcn primitives used by the TanStack Form UI**

Run:

```bash
bunx --bun shadcn@latest add field input select separator -c apps/web
```

Expected:
- shadcn adds the field/input/select/separator source files to the shared UI package.
- the generated imports use the repo aliases from `apps/web/components.json`.

- [ ] **Step 2: Write the failing schema test**

Create `apps/web/src/lib/checkout-form-schema.test.ts` with:

```ts
/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test";

import { checkoutFormDefaults, checkoutFormSchema } from "./checkout-form-schema";

describe("checkoutFormSchema", () => {
  test("accepts the MVP shipping/contact payload", () => {
    expect(
      checkoutFormSchema.parse({
        ...checkoutFormDefaults,
        fullName: "Evelyn Thorne",
        email: "evelyn@example.com",
        line1: "12 Savile Row",
        city: "London",
        postalCode: "W1S 3PQ",
        country: "United Kingdom",
      }),
    ).toMatchObject({
      fullName: "Evelyn Thorne",
      email: "evelyn@example.com",
      line1: "12 Savile Row",
      city: "London",
      postalCode: "W1S 3PQ",
      country: "United Kingdom",
    });
  });
});
```

- [ ] **Step 3: Implement the checkout content and schema modules**

Create `apps/web/src/lib/checkout-content.ts` with the page copy and checkout status copy:

```ts
export const checkoutPageContent = {
  eyebrow: "Step 1 of 3: Acquisition Details",
  title: "Finalizing the Archive",
  summaryTitle: "The Selection",
  ctaLabel: "Continue to payment",
  cancelNote:
    "You can cancel within 30 minutes of payment. The reservation will release automatically after that window.",
} as const;
```

Create `apps/web/src/lib/checkout-form-schema.ts` with the shipping/contact schema and defaults:

```ts
import { z } from "zod";

export const checkoutFormSchema = z.object({
  fullName: z.string().min(1),
  email: z.email(),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  region: z.string().optional(),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  phone: z.string().optional(),
});

export const checkoutFormDefaults = {
  fullName: "",
  email: "",
  line1: "",
  line2: "",
  city: "",
  region: "",
  postalCode: "",
  country: "United Kingdom",
  phone: "",
} as const;

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;
```

- [ ] **Step 4: Verify the schema in isolation**

Run:

```bash
bun test apps/web/src/lib/checkout-form-schema.test.ts -v
```

Expected:
- the schema test passes
- `checkoutFormDefaults` and `checkoutFormSchema` are consistent with the MVP fields

- [ ] **Step 5: Run the repo checks for the new shared files**

Run:

```bash
bun run check-types
bun x ultracite check packages/ui/src/components/field.tsx packages/ui/src/components/input.tsx packages/ui/src/components/select.tsx packages/ui/src/components/separator.tsx apps/web/src/lib/checkout-content.ts apps/web/src/lib/checkout-form-schema.ts apps/web/src/lib/checkout-form-schema.test.ts
```

Expected:
- typecheck passes
- ultracite reports no format/lint errors

---

### Task 2: Build the custom `/checkout` review page

**Files:**
- Create: `apps/web/src/components/checkout/checkout-form.tsx`
- Create: `apps/web/src/components/checkout/checkout-summary.tsx`
- Create: `apps/web/src/pages/checkout/index.astro`

- [ ] **Step 1: Write the checkout form island**

Create `apps/web/src/components/checkout/checkout-form.tsx` as a client-only React component that:

- uses TanStack Form with `checkoutFormSchema` and `checkoutFormDefaults`
- reads `cartIdStore` so the submit call targets the current cart
- calls `orpc.checkout.start(...)` on submit
- redirects to `stripeCheckoutUrl` on success
- surfaces loading/error state through the submit button and a small inline message

Skeleton:

```tsx
import { useForm } from "@tanstack/react-form";
import { orpc } from "../../lib/orpc";
import { checkoutFormDefaults, checkoutFormSchema } from "../../lib/checkout-form-schema";
import { cartIdStore } from "../../lib/cart-store";

// submit handler:
// const session = await orpc.checkout.start({
//   cartId,
//   email: values.email,
//   shippingAddress: {
//     fullName: values.fullName,
//     line1: values.line1,
//     line2: values.line2 || undefined,
//     city: values.city,
//     region: values.region || undefined,
//     postalCode: values.postalCode,
//     country: values.country,
//     phone: values.phone || undefined,
//   },
// });
// window.location.assign(session.stripeCheckoutUrl);
```

- [ ] **Step 2: Write the checkout summary island**

Create `apps/web/src/components/checkout/checkout-summary.tsx` as a client-only React component that:

- reads `cartItemsStore`, `cartItemCountStore`, `cartSubtotalStore`, and `cartCurrencyStore`
- renders the current item list, subtotal, and the 30-minute cancellation note
- keeps the summary sticky on desktop and stacked on mobile by following the Astro page layout
- uses the existing checkout note copy from `checkoutPageContent`
- reuses the existing cart row layout so the checkout summary stays visually aligned with the cart drawer

Skeleton:

```tsx
import { useStore } from "@nanostores/react";
import { cartCurrencyStore, cartItemCountStore, cartItemsStore, cartSubtotalStore } from "../../lib/cart-store";
import { checkoutPageContent } from "../../lib/checkout-content";

// render:
// - item count
// - each cart row with thumbnail, title, brand, size, price
// - subtotal + shipping note
// - the cancellation note
```

- [ ] **Step 3: Write the Astro page shell**

Create `apps/web/src/pages/checkout/index.astro`:

```astro
---
import CheckoutForm from "../../components/checkout/checkout-form";
import CheckoutSummary from "../../components/checkout/checkout-summary";
import SiteFooter from "../../components/storefront/site-footer.astro";
import SiteHeader from "../../components/storefront/site-header.astro";
import StorefrontLayout from "../../layouts/storefront-layout.astro";
import { checkoutPageContent } from "../../lib/checkout-content";
---

<StorefrontLayout title="ZEITLESS | Checkout">
  <SiteHeader />
  <main class="mx-auto w-full max-w-7xl px-4 pt-32 pb-24 sm:px-6 lg:px-12">
    <section class="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)] lg:items-start">
      <div class="flex flex-col gap-10 lg:pr-8">
        <header class="flex flex-col gap-4">
          <p class="label-font text-[11px] tracking-[0.24em] text-[color:var(--primary)]/72 uppercase">
            {checkoutPageContent.eyebrow}
          </p>
          <h1 class="display-font max-w-3xl text-5xl leading-[0.92] font-light text-[color:var(--on-surface)] sm:text-6xl lg:text-[4.2rem]">
            {checkoutPageContent.title}
          </h1>
        </header>

        <CheckoutForm client:only="react" />
      </div>

      <aside class="lg:sticky lg:top-28">
        <CheckoutSummary client:only="react" />
      </aside>
    </section>
  </main>
  <SiteFooter />
</StorefrontLayout>
```

- [ ] **Step 4: Run the checkout page in the browser**

Run:

```bash
bun run dev:web
```

Expected:
- `/checkout` loads without hydration errors
- the summary mirrors the cart drawer data
- the form renders the TanStack Form fields with the checkout editorial layout

- [ ] **Step 5: Verify the new checkout files**

Run:

```bash
bun run check-types
bun x ultracite check apps/web/src/components/checkout/checkout-form.tsx apps/web/src/components/checkout/checkout-summary.tsx apps/web/src/pages/checkout/index.astro
```

Expected:
- typecheck passes
- ultracite reports no format/lint errors

---

### Task 3: Add success/cancel routes and switch Stripe return URLs

**Files:**
- Create: `apps/web/src/components/checkout/checkout-result.astro`
- Create: `apps/web/src/pages/checkout/complete.astro`
- Create: `apps/web/src/pages/checkout/cancel.astro`
- Modify: `apps/server/src/stripe.ts`
- Create: `apps/server/src/stripe.test.ts`

- [ ] **Step 1: Write the URL helper test**

Create `apps/server/src/stripe.test.ts` with:

```ts
/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test";

import { buildCheckoutRedirectUrl } from "./stripe";

describe("buildCheckoutRedirectUrl", () => {
  test("joins the storefront origin with checkout routes", () => {
    expect(
      buildCheckoutRedirectUrl(
        "http://localhost:4321",
        "/checkout/complete?orderId=order_123&session_id=session_123",
      ),
    ).toBe("http://localhost:4321/checkout/complete?orderId=order_123&session_id=session_123");
  });
});
```

- [ ] **Step 2: Update the Stripe redirect URLs**

Modify `apps/server/src/stripe.ts` so hosted Checkout uses the new page routes:

```ts
const successUrl = buildCheckoutRedirectUrl(
  bindings.CORS_ORIGIN,
  `/checkout/complete?orderId=${input.orderId}&session_id={CHECKOUT_SESSION_ID}`,
);
const cancelUrl = buildCheckoutRedirectUrl(
  bindings.CORS_ORIGIN,
  `/checkout/cancel?orderId=${input.orderId}`,
);
```

Keep the webhook logic unchanged.

- [ ] **Step 3: Add a reusable checkout result component**

Create `apps/web/src/components/checkout/checkout-result.astro` with a small shared layout:

```astro
---
interface Props {
  eyebrow: string;
  title: string;
  body: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
}

const {
  eyebrow,
  title,
  body,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
} = Astro.props as Props;
---

<section class="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col justify-center gap-6 px-4 pt-32 pb-24 sm:px-6 lg:px-12">
  <p class="label-font text-[11px] tracking-[0.24em] text-[color:var(--primary)]/72 uppercase">
    {eyebrow}
  </p>
  <h1 class="display-font text-5xl leading-[0.92] font-light text-[color:var(--on-surface)] sm:text-6xl">
    {title}
  </h1>
  <p class="max-w-xl text-base leading-7 text-[color:var(--on-surface)]/72">
    {body}
  </p>
  <div class="flex flex-col gap-3 sm:flex-row">
    <a class="inline-flex h-12 items-center justify-center border border-[color:var(--primary)] bg-[color:var(--primary)] px-5 text-[10px] tracking-[0.3em] text-[color:var(--surface-low)] uppercase" href={primaryHref}>
      {primaryLabel}
    </a>
    <a class="inline-flex h-12 items-center justify-center border border-[color:var(--outline)]/28 px-5 text-[10px] tracking-[0.3em] text-[color:var(--on-surface)]/72 uppercase" href={secondaryHref}>
      {secondaryLabel}
    </a>
  </div>
</section>
```

- [ ] **Step 4: Wire the complete and cancel routes**

Create `apps/web/src/pages/checkout/complete.astro` and `apps/web/src/pages/checkout/cancel.astro`:

```astro
---
import CheckoutResult from "../../components/checkout/checkout-result.astro";
import SiteFooter from "../../components/storefront/site-footer.astro";
import SiteHeader from "../../components/storefront/site-header.astro";
import StorefrontLayout from "../../layouts/storefront-layout.astro";
---

<StorefrontLayout title="ZEITLESS | Checkout">
  <SiteHeader />
  <main>
    <CheckoutResult
      eyebrow="Payment received"
      title="Your archive order is being finalized."
      body="Stripe confirmed the session and the reservation is now being settled. Your order access details will follow."
      primaryHref="/collections"
      primaryLabel="Back to archive"
      secondaryHref="/checkout"
      secondaryLabel="Review cart again"
    />
  </main>
  <SiteFooter />
</StorefrontLayout>
```

Use a cancellation copy variant in `cancel.astro`:

- eyebrow: `Checkout cancelled`
- title: `Your selection is still available.`
- body: explain that payment was not completed and the cart is still available
- primary: return to `/checkout`
- secondary: return to `/collections`

The `cancel.astro` page should use the same shared `CheckoutResult` component with the cancellation copy:

```astro
---
import CheckoutResult from "../../components/checkout/checkout-result.astro";
import SiteFooter from "../../components/storefront/site-footer.astro";
import SiteHeader from "../../components/storefront/site-header.astro";
import StorefrontLayout from "../../layouts/storefront-layout.astro";
---

<StorefrontLayout title="ZEITLESS | Checkout">
  <SiteHeader />
  <main>
    <CheckoutResult
      eyebrow="Checkout cancelled"
      title="Your selection is still available."
      body="Payment was not completed, so the archive selection remains in your cart and can be retried."
      primaryHref="/checkout"
      primaryLabel="Retry checkout"
      secondaryHref="/collections"
      secondaryLabel="Back to archive"
    />
  </main>
  <SiteFooter />
</StorefrontLayout>
```

- [ ] **Step 5: Verify the server URL change and the new routes**

Run:

```bash
bun test apps/server/src/stripe.test.ts -v
bun run check-types
bun x ultracite check apps/server/src/stripe.ts apps/server/src/stripe.test.ts apps/web/src/components/checkout/checkout-result.astro apps/web/src/pages/checkout/complete.astro apps/web/src/pages/checkout/cancel.astro
```

Expected:
- the URL helper test passes
- typecheck passes
- ultracite reports no format/lint errors

- [ ] **Step 6: Smoke-test the Stripe return flow**

Run:

```bash
bun run dev:web
```

Expected:
- `/checkout/complete` and `/checkout/cancel` render as standalone routes
- the redirect URLs in `apps/server/src/stripe.ts` point to those routes

---

### Task 4: Update the plan docs and lock the implementation down

**Files:**
- Modify: `docs/PLAN.md`

- [ ] **Step 1: Mark the checkout page as complete in the roadmap**

Update the storefront section of `docs/PLAN.md` to mark:

- `/checkout` page complete
- `/checkout/complete` success route complete
- `/checkout/cancel` cancel route complete

- [ ] **Step 2: Add a short implementation note**

Add a note that the checkout flow is now:

- custom review page in Astro
- TanStack Form for shipping/contact
- hosted Stripe Checkout for payment
- dedicated success and cancel routes

- [ ] **Step 3: Run the full verification sweep**

Run:

```bash
bun run check-types
bun run check
```

Expected:
- both commands pass
- no checkout-related type, lint, or formatting errors remain

- [ ] **Step 4: Commit the checkout page work**

```bash
git add apps/web/src packages/ui/src docs/PLAN.md apps/server/src/stripe.ts apps/server/src/stripe.test.ts
git commit -m "Build the custom checkout review page before Stripe handoff" -m "This keeps the checkout experience branded and editorial while preserving hosted Stripe Checkout as the payment surface for the MVP.\n\nConstraint: Hosted Stripe Checkout remains the MVP payment flow\nRejected: Build a fully custom payment form now | Too much frontend and payment-state work for this phase\nConfidence: high\nScope-risk: moderate\nDirective: Keep payment inputs out of the custom page until we intentionally migrate off hosted Checkout\nTested: Schema test, URL helper test, typecheck, ultracite, browser smoke\nNot-tested: Live Stripe payment against production credentials"
```
