import { ShoppingBag } from "@phosphor-icons/react";
import { useStore } from "@nanostores/react";

import { Button } from "@zeitless/ui/components/button";

import { cartItemCountStore, openCartDrawer } from "../../lib/cart-store";

function CartTrigger(): JSX.Element {
  const itemCount = useStore(cartItemCountStore);
  const hasItems = itemCount > 0;

  return (
    <Button
      aria-label={`Open cart drawer${hasItems ? ` with ${itemCount} items` : ""}`}
      className="relative"
      onClick={openCartDrawer}
      size="icon-sm"
      type="button"
      variant="ghost"
    >
      <ShoppingBag aria-hidden="true" className="size-4" />
      {hasItems ? (
        <span className="absolute top-1 right-1 inline-flex min-w-4 items-center justify-center rounded-none bg-[color:var(--primary)] px-1 text-[9px] font-semibold text-[color:var(--surface)]">
          {itemCount}
        </span>
      ) : null}
    </Button>
  );
}

export { CartTrigger };
