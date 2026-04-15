import { useStore } from "@nanostores/react";

import { Button } from "@zeitless/ui/components/button";
import { DrawerClose } from "@zeitless/ui/components/drawer";

import {
  cartCurrencyStore,
  cartErrorStore,
  cartLoadingStore,
  cartSubtotalStore,
} from "../../lib/cart-store";

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en", {
    currency,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(amount);
}

function CartDrawerSummary(): JSX.Element {
  const subtotal = useStore(cartSubtotalStore);
  const currency = useStore(cartCurrencyStore);
  const isLoading = useStore(cartLoadingStore);
  const error = useStore(cartErrorStore);

  return (
    <section className="border-t border-[color:var(--outline)]/60 px-6 py-5">
      <div className="space-y-3">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-[color:var(--on-surface)]/54">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal, currency)}</span>
        </div>
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-[color:var(--on-surface)]/54">
          <span>Shipping</span>
          <span>Calculated at checkout</span>
        </div>
        <div className="display-font flex items-center justify-between border-t border-[color:var(--outline)]/60 pt-3 text-lg font-light text-[color:var(--on-surface)]">
          <span>Total</span>
          <span>{formatCurrency(subtotal, currency)}</span>
        </div>
      </div>

      {error ? (
        <p className="mt-4 text-xs text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-5 flex flex-col gap-2">
        <DrawerClose asChild>
          <Button className="w-full" disabled={isLoading} type="button" variant="outline">
            Continue browsing
          </Button>
        </DrawerClose>
        <Button className="w-full" disabled type="button">
          Checkout coming soon
        </Button>
      </div>
    </section>
  );
}

export { CartDrawerSummary };
