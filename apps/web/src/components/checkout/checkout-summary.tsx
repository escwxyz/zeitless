import { useStore } from "@nanostores/react";

import { Separator } from "@zeitless/ui/components/separator";

import { CartDrawerItem } from "../storefront/cart-drawer-item";
import {
  cartCurrencyStore,
  cartItemCountStore,
  cartItemsStore,
  cartSubtotalStore,
} from "../../lib/cart-store";
import { checkoutPageContent } from "../../lib/checkout-content";

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en", {
    currency,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(amount);
}

function CheckoutSummary(): JSX.Element {
  const items = useStore(cartItemsStore);
  const itemCount = useStore(cartItemCountStore);
  const subtotal = useStore(cartSubtotalStore);
  const currency = useStore(cartCurrencyStore);

  return (
    <section className="border border-[color:var(--outline)]/18 bg-[color:var(--surface-low)]/72 p-5 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="display-font text-2xl font-light italic text-[color:var(--on-surface)]">
            {checkoutPageContent.summaryTitle}
          </h2>
          <p className="label-font text-[10px] tracking-[0.24em] text-[color:var(--on-surface)]/54 uppercase">
            {itemCount} item{itemCount === 1 ? "" : "s"}
          </p>
        </div>
        <p className="label-font text-[10px] tracking-[0.24em] text-[color:var(--on-surface)]/54 uppercase">
          Ready to reserve
        </p>
      </div>

      <div className="mt-6">
        <ul className="flex flex-col">
          {items.map((item) => (
            <CartDrawerItem item={item} key={item.id} />
          ))}
        </ul>
      </div>

      <Separator className="my-6" />

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-[color:var(--on-surface)]/54">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal, currency)}</span>
        </div>
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-[color:var(--on-surface)]/54">
          <span>Shipping</span>
          <span>Calculated at checkout</span>
        </div>
      </div>

      <p className="mt-5 text-xs leading-6 text-[color:var(--on-surface)]/56">
        {checkoutPageContent.cancelNote}
      </p>
    </section>
  );
}

export { CheckoutSummary };
