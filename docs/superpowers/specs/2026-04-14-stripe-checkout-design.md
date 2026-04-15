# Stripe Checkout and Webhook Design

## Goal

Add the first payment slice for Zeitless without depending on a custom frontend payment UI.

## Recommended Approach

Use **Stripe-hosted Checkout Sessions** for the MVP.

This keeps the buyer payment UI outside the app while the backend owns:

- reservation creation
- internal order creation
- Stripe Checkout Session creation
- webhook-driven payment confirmation
- paid-order state transition

## Scope

### In scope

- Create a Stripe Checkout Session from the API
- Attach the internal `orderId` and `reservationId` to Stripe metadata
- Redirect the buyer to Stripe-hosted Checkout
- Handle `checkout.session.completed` in a webhook
- Mark the internal order as paid after webhook verification
- Keep the existing reservation release path for failed or expired payments

### Out of scope

- Custom payment UI
- Payment Element integration
- Frontend checkout page work
- Refund automation beyond the existing order lifecycle
- Email delivery implementation

## Backend Flow

1. Buyer starts checkout from the cart flow.
2. The cart DO reserves the product and creates the internal order record.
3. The API creates a Stripe Checkout Session for that order.
4. The client receives the Stripe session URL and redirects to Stripe.
5. Stripe sends `checkout.session.completed` to the webhook.
6. The webhook verifies the signature, loads the order by metadata, and marks it `paid`.

## API Boundaries

- `checkout` remains the buyer-facing reservation entry point.
- Stripe session creation belongs to the API layer, not the frontend.
- Webhook handling belongs to the server entrypoint or a dedicated API route.
- Order access continues to use the email-token flow already in place.

## Data Requirements

- Order rows must store enough information to correlate Stripe events back to the order.
- Stripe metadata should include at least:
  - `orderId`
  - `reservationId`
- The existing order schema can remain the source of truth for buyer state.

## Error Handling

- If Stripe session creation fails, the reservation should be released and the checkout should fail.
- If the webhook arrives for an unknown or already-paid order, the handler should be idempotent.
- If webhook signature verification fails, reject the event.

## Testing

- Unit test Stripe session creation payload mapping
- Unit test webhook event handling and idempotency
- Integration test checkout start -> session creation -> webhook update path
- Keep existing checkout/reservation tests passing

## Migration Path Later

Once the frontend is ready, Stripe Checkout can be replaced or supplemented by a more customized payment flow without changing the core order/reservation model.
