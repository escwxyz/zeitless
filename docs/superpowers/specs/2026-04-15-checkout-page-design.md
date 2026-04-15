# ZEITLESS Checkout Page Design

## Goal

Build a custom checkout review page for the MVP that feels branded and editorial, while keeping Stripe Checkout as the actual payment surface.

The page should:

- present the buyer’s cart as a final review step
- collect shipping/contact details with TanStack Form
- hand off to hosted Stripe Checkout for payment
- route success and cancellation to separate confirmation pages

This is intentionally not a custom card-payment form. The checkout page is the branded pre-payment step.

## Scope

Included:

- `/checkout` review page
- TanStack Form shipping/contact form
- order summary and cancellation note
- Stripe Checkout session handoff
- `/checkout/complete` success route
- `/checkout/cancel` cancellation route
- server URL adjustments for checkout return paths

Excluded:

- custom payment fields
- embedded Stripe Elements
- customer identity tables
- checkout shipping-rate calculations
- post-payment order management

## Reference Shape

The visual reference is:

- `stitch/zeitless_checkout/screen.png`
- `stitch/zeitless_checkout/code.html`

Important ideas to preserve:

- a large editorial page title
- a clear step label near the top
- a left-side form column and right-side summary panel on desktop
- a stacked layout on mobile
- subtle, refined borders and plenty of whitespace
- a summary block that feels like a curated selection frame

## Route Structure

### `/checkout`

This is the main review page.

- shows shipping/contact inputs
- shows current cart contents
- shows subtotal and a 30-minute cancellation note
- submits to the existing checkout-start flow
- redirects the buyer to Stripe-hosted Checkout

### `/checkout/complete`

This is the post-payment success page.

- shows that the payment was received
- confirms that the order is being finalized
- can show `orderId` and Stripe session context if available
- offers a return path back to the archive or order access flow

### `/checkout/cancel`

This is the cancellation page.

- explains that checkout was not completed
- offers a retry action
- offers a return-to-cart action

## Layout

### Desktop

- Two-column layout.
- Left column: checkout form and page copy.
- Right column: sticky summary panel.
- The summary panel should stay visible while the form scrolls.
- The page should feel polished but not overloaded with controls.

### Mobile

- Single-column stacked layout.
- Summary and cart items should appear before or after the form in a readable order.
- The primary CTA should stay obvious without requiring horizontal scrolling.
- The page should remain usable without feeling like a compressed desktop form.

## Component Breakdown

Keep the page split into small units:

- `checkout-page` for the Astro route shell
- `checkout-form` for the TanStack Form island
- `checkout-summary` for the item list, subtotal, and note
- `checkout-cta` for the Stripe handoff action
- `checkout-complete` for the success route
- `checkout-cancel` for the cancel route

The page should reuse the global cart store and the existing storefront theme rather than introducing a separate checkout visual system.

## Form Model

Use TanStack Form for the buyer-facing form fields.

The MVP form should include:

- full name
- email
- street address
- apartment / suite, optional
- city
- region or state, optional
- postal code
- country
- phone, optional

Use shadcn form patterns for layout and accessibility where the controls need it.

Do not add payment card inputs. The form only prepares shipping/contact data for checkout session creation.

## Data Flow

1. The checkout page reads the current cart contents from the shared cart store.
2. The buyer fills in shipping/contact details.
3. On submit, the page calls the existing checkout-start API flow.
4. The server creates or reuses the order/reservation state and returns the Stripe Checkout Session URL.
5. The browser redirects to Stripe-hosted Checkout.
6. Stripe webhook finalization remains the source of truth for payment success or failure.
7. The success/cancel routes only present status and next actions.

## Server Adjustments

The checkout page should align with the current server shape, with only small adjustments:

- `success_url` should point to `/checkout/complete`
- `cancel_url` should point to `/checkout/cancel`
- the webhook should continue to finalize paid and failed sessions
- the checkout start flow should remain the single entrypoint for session creation

Do not add a parallel payment endpoint for the page.

## Styling Rules

- Reuse the existing storefront editorial theme.
- Keep the page visually close to the reference, but lighter and less form-heavy.
- Use typography and spacing to separate sections instead of large filled cards.
- Keep the summary panel subtle and persistent on desktop.
- Keep the success and cancel pages visually consistent with the checkout page.

## Accessibility

- The checkout page must have a clear hierarchy of heading, section labels, and form labels.
- The form controls must be keyboard accessible and screen-reader friendly.
- The submit action must expose its loading state.
- The summary and note content must remain readable when stacked on mobile.
- Success and cancel routes should present clear next steps, not dead ends.

## Acceptance Criteria

- `/checkout` renders a custom branded review page.
- TanStack Form powers the shipping/contact inputs.
- The page uses the current cart as the order summary source.
- Submission creates a Stripe Checkout Session and redirects the user.
- `/checkout/complete` and `/checkout/cancel` exist as distinct routes.
- Stripe-hosted Checkout remains the payment surface for the MVP.
- The server checkout URLs are updated to the new return routes.

## Risks

- If the form becomes too dense, the page will lose the airy editorial feel from the reference.
- If the checkout page duplicates cart state instead of reading from the shared store, it will drift from the drawer.
- If we try to embed payment fields too early, the MVP will become much larger than necessary.
- If the success and cancel routes are too generic, the Stripe handoff will feel broken rather than intentional.

## Implementation Notes

- Prefer Astro for the page shell and route composition.
- Use React only where TanStack Form requires it.
- Reuse the existing checkout-start contract instead of inventing a second submit path.
- Keep the success and cancel routes intentionally simple so the payment flow stays easy to reason about.
