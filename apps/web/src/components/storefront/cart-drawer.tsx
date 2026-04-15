import { useStore } from "@nanostores/react";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@zeitless/ui/components/drawer";
import { ScrollArea } from "@zeitless/ui/components/scroll-area";

import { CartDrawerItem } from "./cart-drawer-item";
import { CartDrawerSummary } from "./cart-drawer-summary";
import { useMediaQuery } from "../../hooks/use-media-query";
import { cartDrawerOpenStore, cartItemsStore, setCartDrawerOpen } from "../../lib/cart-store";

function CartDrawer(): JSX.Element {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const open = useStore(cartDrawerOpenStore);
  const items = useStore(cartItemsStore);
  const direction = isDesktop ? "right" : "bottom";
  const hasItems = items.length > 0;

  return (
    <Drawer direction={direction} onOpenChange={setCartDrawerOpen} open={open}>
      <DrawerContent className="border-[color:var(--outline)]/70 bg-[color:var(--surface)] text-[color:var(--on-surface)] data-[vaul-drawer-direction=bottom]:h-[88vh] data-[vaul-drawer-direction=bottom]:max-h-[88vh] data-[vaul-drawer-direction=right]:h-[100dvh] data-[vaul-drawer-direction=right]:w-[min(100vw,34rem)] data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:sm:max-w-[34rem]">
        <div className="flex h-full min-h-0 flex-col">
          <DrawerHeader className="border-b border-[color:var(--outline)]/60 px-6 py-5 text-left">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <DrawerTitle className="display-font text-2xl font-light tracking-[0.16em] uppercase">
                  The Selection
                </DrawerTitle>
                <DrawerDescription className="max-w-sm text-[11px] uppercase tracking-[0.24em] text-[color:var(--on-surface)]/54">
                  {hasItems
                    ? `${items.length} curated item${items.length === 1 ? "" : "s"} ready for reservation`
                    : "Your archive selection is currently empty"}
                </DrawerDescription>
              </div>

              <DrawerClose asChild>
                <button
                  aria-label="Close cart drawer"
                  className="inline-flex h-9 w-9 items-center justify-center border border-[color:var(--outline)]/70 text-[color:var(--on-surface)] transition-transform hover:scale-105"
                  type="button"
                >
                  <span className="text-xl leading-none">×</span>
                </button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <ScrollArea className="min-h-0 flex-1">
            <div className="px-6 py-4">
              {hasItems ? (
                <ul className="space-y-0">
                  {items.map((item) => (
                    <CartDrawerItem item={item} key={item.id} />
                  ))}
                </ul>
              ) : (
                <div className="flex min-h-[24rem] flex-col items-start justify-center gap-4 py-10">
                  <p className="max-w-xs text-sm leading-6 text-[color:var(--on-surface)]/64">
                    Add a piece from the archive and it will appear here with its reservation
                    summary.
                  </p>
                  <DrawerClose asChild>
                    <button
                      className="label-font text-[11px] tracking-[0.24em] text-[color:var(--primary)] underline-offset-4 hover:underline"
                      type="button"
                    >
                      Continue browsing
                    </button>
                  </DrawerClose>
                </div>
              )}
            </div>
          </ScrollArea>

          <CartDrawerSummary />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export { CartDrawer };
