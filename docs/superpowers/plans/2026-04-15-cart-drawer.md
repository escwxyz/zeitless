# Cart Drawer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a storefront-wide cart drawer that opens from every screen, uses nanostores for shared state, and switches between a right-side desktop drawer and a bottom mobile drawer.

**Architecture:** Keep the cart UI in one global React-driven overlay so the header button and the drawer always read the same state. Use nanostores as the single source of truth for cart contents, drawer state, and derived totals, then inject the drawer from the shared storefront layout so every page gets it automatically. Use the existing drawer and scroll-area primitives for the interaction shell and keep all content/rows small and composable.

**Tech Stack:** Astro, React island, nanostores, `@nanostores/persistent`, `@nanostores/react`, existing `Drawer`/`ScrollArea` primitives from `@zeitless/ui`, TypeScript, Ultracite, Prettier.

---

## File Map

- Create `apps/web/src/lib/cart-store.ts`
- Create `apps/web/src/lib/cart-data.ts`
- Create `apps/web/src/hooks/use-media-query.ts`
- Create `apps/web/src/components/storefront/cart-trigger.tsx`
- Create `apps/web/src/components/storefront/cart-drawer.tsx`
- Create `apps/web/src/components/storefront/cart-drawer-item.tsx`
- Create `apps/web/src/components/storefront/cart-drawer-summary.tsx`
- Modify `apps/web/src/components/storefront/site-header.astro`
- Modify `apps/web/src/layouts/storefront-layout.astro`
- Modify `docs/PLAN.md`
- If the drawer primitive needs a behavior fix, modify `packages/ui/src/components/drawer.tsx`
- If the scroll region needs a behavior fix, modify `packages/ui/src/components/scroll-area.tsx`

## Task 1: Define the global cart state and mock cart data

**Files:**
- Create `apps/web/src/lib/cart-data.ts`
- Create `apps/web/src/lib/cart-store.ts`

- [ ] **Step 1: Write the cart data model and seed items**

Create a cart data module that keeps mock cart rows separate from the drawer UI:

```ts
export interface CartItem {
  id: string
  productId: string
  title: string
  brand: string
  imageAlt: string
  imageUrl: string
  price: string
  quantity: number
  size: string
}

export const cartSeedItems: CartItem[] = [
  {
    id: "cart-item-01",
    productId: "deconstructed-wool-tunic",
    title: "Deconstructed Wool Tunic",
    brand: "Comme des Garcons",
    imageAlt: "...",
    imageUrl: "...",
    price: "€1,450",
    quantity: 1,
    size: "M",
  },
]
```

Keep the seed minimal and use the existing product-detail mock imagery so the drawer looks consistent with the storefront.

- [ ] **Step 2: Build the nanostore state**

Create a single cart store module that holds drawer state, cart identity, and derived totals:

```ts
import { atom, computed } from "nanostores"
import { persistentAtom } from "@nanostores/persistent"

export const cartIdStore = persistentAtom<string>("zeitless-cart-id", "guest-cart")
export const cartItemsStore = atom<CartItem[]>(cartSeedItems)
export const cartDrawerOpenStore = atom(false)
export const cartLoadingStore = atom(false)
export const cartErrorStore = atom<string | null>(null)

export const cartItemCountStore = computed(cartItemsStore, (items) =>
  items.reduce((count, item) => count + item.quantity, 0)
)

export const cartSubtotalStore = computed(cartItemsStore, (items) =>
  items.reduce((total, item) => total + item.quantity * parsePrice(item.price), 0)
)

export function openCartDrawer() {
  cartDrawerOpenStore.set(true)
}

export function closeCartDrawer() {
  cartDrawerOpenStore.set(false)
}

export function setCartDrawerOpen(open: boolean) {
  cartDrawerOpenStore.set(open)
}

export function toggleCartDrawer() {
  cartDrawerOpenStore.set(!cartDrawerOpenStore.get())
}

function parsePrice(price: string) {
  return Number(price.replace(/[^0-9.]/g, ""))
}
```

Add helper functions for opening, closing, toggling, and clearing the drawer state so components do not manipulate atom internals directly.

- [ ] **Step 3: Verify the store shape before building UI**

Run:

```bash
bun run check-types
```

Expected: the new store module type-checks cleanly and the seed data has a stable shape.

## Task 2: Build the cart trigger and drawer components

**Files:**
- Create `apps/web/src/hooks/use-media-query.ts`
- Create `apps/web/src/components/storefront/cart-trigger.tsx`
- Create `apps/web/src/components/storefront/cart-drawer-item.tsx`
- Create `apps/web/src/components/storefront/cart-drawer-summary.tsx`
- Create `apps/web/src/components/storefront/cart-drawer.tsx`

- [ ] **Step 1: Add a small viewport hook for drawer direction**

Create a hook that returns `true` when the viewport is mobile-sized:

```ts
export function useMediaQuery(query: string): boolean
```

The cart drawer will use this hook to choose `direction="bottom"` on mobile and `direction="right"` on desktop.

- [ ] **Step 2: Build the header trigger island**

Create a tiny React button component for the header bag icon that reads the shared nanostores and toggles the drawer:

```tsx
export function CartTrigger() {
  const isOpen = useStore(cartDrawerOpenStore)
  const itemCount = useStore(cartItemCountStore)

  return (
    <button
      type="button"
      aria-label={`Shopping bag, ${itemCount} items`}
      aria-expanded={isOpen}
      onClick={() => toggleCartDrawer()}
    >
      ...
    </button>
  )
}
```

Keep the trigger visually consistent with the current header icon button, and add a count badge only if the count is non-zero.

- [ ] **Step 3: Build the cart row and summary components**

Create one row component and one summary component so the drawer shell stays readable:

```tsx
export function CartDrawerItem({ item }: { item: CartItem }) {
  return (
    <article className="flex gap-4">
      ...
    </article>
  )
}

export function CartDrawerSummary() {
  return (
    <section className="border-t border-[color:var(--outline)]/18 pt-6">
      ...
    </section>
  )
}
```

The row should show the image, title, brand, size, quantity, and line price. The summary should show item count, subtotal, and a checkout placeholder action for this phase.

- [ ] **Step 4: Build the responsive drawer shell**

Create the main cart drawer island using the shared `Drawer` and `ScrollArea` primitives:

```tsx
export function CartDrawer() {
  const isMobile = useMediaQuery("(max-width: 767px)")
  const isOpen = useStore(cartDrawerOpenStore)
  const items = useStore(cartItemsStore)

  return (
    <Drawer
      open={isOpen}
      onOpenChange={setCartDrawerOpen}
      direction={isMobile ? "bottom" : "right"}
    >
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Shopping Bag</DrawerTitle>
          <DrawerDescription>{items.length} items in your cart</DrawerDescription>
        </DrawerHeader>
        <ScrollArea className="...">
          ...
        </ScrollArea>
        <CartDrawerSummary />
      </DrawerContent>
    </Drawer>
  )
}
```

Use the scroll area only for the item list, keep the summary outside the scroll region, and cap the height so the drawer stays usable on mobile.

- [ ] **Step 5: Verify the drawer components**

Run:

```bash
bun run check-types
PATH="$PWD/node_modules/.bin:$PATH" ./node_modules/.bin/ultracite check \
  apps/web/src/hooks/use-media-query.ts \
  apps/web/src/components/storefront/cart-trigger.tsx \
  apps/web/src/components/storefront/cart-drawer-item.tsx \
  apps/web/src/components/storefront/cart-drawer-summary.tsx \
  apps/web/src/components/storefront/cart-drawer.tsx
```

Expected: the new React files type-check and pass lint/format checks.

## Task 3: Inject the cart into the shared storefront shell

**Files:**
- Modify `apps/web/src/components/storefront/site-header.astro`
- Modify `apps/web/src/layouts/storefront-layout.astro`

- [ ] **Step 1: Mount the global drawer in the layout**

Render the cart drawer once from the storefront layout so it exists on every storefront screen:

```astro
---
import { CartDrawer } from "../components/storefront/cart-drawer"
---

<body>
  <div class="relative isolate overflow-hidden">
    <slot />
    <CartDrawer client:load />
  </div>
</body>
```

The drawer should not be tied to any one page route.

- [ ] **Step 2: Replace the header bag button with the cart trigger island**

Swap the static bag button in `site-header.astro` for the React trigger component:

```astro
---
import { CartTrigger } from "./cart-trigger"
---

<div class="flex items-center gap-2 text-[color:var(--primary)]">
  <button ...>Search</button>
  <CartTrigger client:load />
</div>
```

Keep the existing search button intact and preserve the header visual spacing.

- [ ] **Step 3: Keep the drawer responsive without layout shift**

Use the drawer primitive's `direction` prop and the viewport hook so the same cart state appears as:

```tsx
direction={isMobile ? "bottom" : "right"}
```

If the primitive needs any class or behavior adjustment to keep the mobile sheet height bounded or the desktop panel narrow enough, make that fix in the shared drawer primitive rather than duplicating it in the storefront components.

- [ ] **Step 4: Verify the storefront shell wiring**

Run:

```bash
bun run check-types
```

Expected: the layout and header compile with the new React islands, and the global drawer is available from every storefront page.

## Task 4: Update the roadmap and do the final QA pass

**Files:**
- Modify `docs/PLAN.md`

- [ ] **Step 1: Mark the cart drawer complete in the roadmap**

Update the storefront and priority sections in `docs/PLAN.md` so the cart drawer is marked complete once the drawer is injected globally and the trigger works from the header.

- [ ] **Step 2: Record the implementation note**

Add a short note saying the cart now uses global nanostore state, a shared storefront drawer, responsive drawer directions, and a scroll area for the item list.

- [ ] **Step 3: Run the final verification set**

Run:

```bash
bun run check-types
PATH="$PWD/node_modules/.bin:$PATH" ./node_modules/.bin/ultracite check \
  apps/web/src/lib/cart-data.ts \
  apps/web/src/lib/cart-store.ts \
  apps/web/src/hooks/use-media-query.ts \
  apps/web/src/components/storefront/cart-trigger.tsx \
  apps/web/src/components/storefront/cart-drawer-item.tsx \
  apps/web/src/components/storefront/cart-drawer-summary.tsx \
  apps/web/src/components/storefront/cart-drawer.tsx \
  apps/web/src/components/storefront/site-header.astro \
  apps/web/src/layouts/storefront-layout.astro
```

If the drawer still needs visual tuning, compare the result against `stitch/zeitless_checkout/screen.png` before marking the task done.
