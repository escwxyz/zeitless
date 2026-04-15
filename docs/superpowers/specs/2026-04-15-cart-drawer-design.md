# ZEITLESS Cart Drawer Design

## Goal

Build a global cart drawer that is available from every storefront screen, with a right-side drawer on desktop and a bottom drawer on mobile.

The cart should feel like a shared overlay rather than a separate page:

- the header bag button opens the drawer from anywhere in the storefront
- the drawer shows the current cart items, pricing summary, and checkout action
- the drawer uses the existing UI primitives and stays visually aligned with the checkout reference

## Scope

This spec covers the first cart UI implementation only.

Included:

- Global cart state with nanostores
- Shared drawer injected from the storefront layout
- Header bag button wiring to open the drawer
- Responsive drawer direction: right on desktop, bottom on mobile
- Item list inside a scroll area
- Cart summary and action area
- Empty state and loading state for the drawer

Excluded:

- Cart page route
- Checkout page route
- Stripe integration work
- Reservation mutation work
- Full buyer auth persistence

## Reference Shape

The implementation should follow the selection-summary panel in:

- `stitch/zeitless_checkout/screen.png`

The important visual constraints are:

- The cart is presented as a compact editorial panel rather than a bulky commerce sidebar.
- The item list is vertically stacked with image, title, metadata, and price aligned cleanly.
- The summary and CTA sit below the item list and remain visible even when the item list scrolls.

## Layout

### Desktop

- Drawer opens from the right.
- Drawer width should feel like a refined side panel, not a full-page takeover.
- The item list scrolls inside a `ScrollArea`.
- The summary block remains pinned below the scroll region.
- The header bag icon continues to open and close the same global drawer.

### Mobile

- Drawer opens from the bottom.
- Drawer height should cap below full-screen so the user still feels the page context.
- The list scrolls inside a `ScrollArea` to keep long carts usable.
- The summary and checkout CTA stay at the bottom of the sheet.

## Component Breakdown

The cart should be split into focused pieces:

- `cart-store` for shared nanostore state
- `cart-drawer` for the interactive drawer shell
- `cart-drawer-header` for the title, item count, and close action
- `cart-drawer-items` for the scrollable item list
- `cart-drawer-item` for one cart row
- `cart-drawer-summary` for totals and checkout action
- `cart-trigger` wiring inside the header bag button

The drawer should be injected from `storefront-layout` so it is present on every storefront route.

## State Model

Use nanostores as the single source of truth for the cart drawer and cart contents.

The cart state should track:

- `cartId`
- `items`
- `isOpen`
- `isLoading`
- `error`

The store should also derive:

- `itemCount`
- `subtotal`
- `currency`

For guests, persist the cart id so the drawer can survive navigation and refreshes.
Do not introduce a separate customer identity model for this phase.

## Data Flow

1. The header bag button toggles the global drawer state.
2. The cart drawer reads the current nanostore state.
3. The item list renders from the store and scrolls independently.
4. The summary derives totals from the same state.
5. Checkout remains a later step; for now the drawer only needs a clear action path and stable cart presentation.

The drawer should not duplicate cart data in local component state.

## Scroll Behavior

- Use `ScrollArea` for the item list region.
- Keep the summary and action area outside the scrollable region.
- On mobile, ensure the drawer content can scroll without the close button or summary becoming unreachable.
- On desktop, keep the drawer content height bounded so the summary remains visible.

## Accessibility

- The drawer must have a proper title and description.
- The bag button should expose an accessible name and open state.
- The close action must be keyboard reachable.
- The item list should be readable in a screen reader as a sequence of cart entries.
- The drawer must work with Escape and focus management from the shared drawer primitive.

## Styling Rules

- Reuse the existing storefront theme tokens and editorial typography.
- Keep the drawer visually aligned with the checkout reference, but adapt it to a lighter cart summary.
- Prefer subtle borders, spacing, and type hierarchy over heavy cards.
- Keep the cart drawer zero-radius and avoid introducing a new visual language.

## Acceptance Criteria

- The cart drawer is available from every storefront screen.
- Desktop opens the drawer from the right.
- Mobile opens the drawer from the bottom.
- The item list scrolls independently of the summary.
- The header bag button toggles the same global drawer state everywhere.
- Cart state is shared through nanostores rather than page-local state.
- The implementation remains storefront-first and does not create a separate cart page.

## Risks

- If the drawer content is too tall without scroll containment, mobile usability will suffer.
- If the cart state is split between local component state and nanostores, the drawer will drift out of sync across pages.
- If the drawer is too wide on desktop, it will feel like a full modal instead of a lightweight cart panel.

## Implementation Notes

- Prefer a single global cart store and derive UI state from it.
- Inject the drawer from `apps/web/src/layouts/storefront-layout.astro`.
- Reuse `Drawer` and `ScrollArea` from `packages/ui`.
- Keep the cart drawer independent from reservation and checkout logic for the first pass.
