import { persistentAtom } from "@nanostores/persistent";
import { atom, computed } from "nanostores";

import type { CartItem } from "./cart-data";
import { cartSeedItems } from "./cart-data";

export const cartIdStore = persistentAtom<string>("zeitless-cart-id", "guest-cart");
export const cartItemsStore = atom<CartItem[]>([...cartSeedItems]);
export const cartDrawerOpenStore = atom(false);
export const cartLoadingStore = atom(false);
export const cartErrorStore = atom<string | null>(null);

export const cartItemCountStore = computed(cartItemsStore, (items) =>
  items.reduce((count, item) => count + item.quantity, 0),
);

export const cartSubtotalStore = computed(cartItemsStore, (items) =>
  items.reduce((total, item) => total + item.quantity * parsePrice(item.price), 0),
);

export const cartCurrencyStore = computed(cartItemsStore, (items) =>
  getCurrencyCode(items[0]?.price ?? "€0"),
);

export function openCartDrawer(): void {
  cartDrawerOpenStore.set(true);
}

export function closeCartDrawer(): void {
  cartDrawerOpenStore.set(false);
}

export function toggleCartDrawer(): void {
  cartDrawerOpenStore.set(!cartDrawerOpenStore.get());
}

export function setCartDrawerOpen(open: boolean): void {
  cartDrawerOpenStore.set(open);
}

function parsePrice(price: string): number {
  return Number(price.replaceAll(/[^0-9.]/g, ""));
}

function getCurrencyCode(price: string): string {
  if (price.startsWith("$")) {
    return "USD";
  }

  if (price.startsWith("£")) {
    return "GBP";
  }

  return "EUR";
}
