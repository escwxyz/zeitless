import type { CartItem } from "../../lib/cart-data";

interface Props {
  item: CartItem;
}

function CartDrawerItem({ item }: Props): JSX.Element {
  return (
    <li className="flex gap-4 border-b border-[color:var(--outline)]/60 py-4 last:border-b-0 last:pb-0">
      <div className="h-24 w-20 shrink-0 overflow-hidden bg-[color:var(--surface-highest)] sm:h-28 sm:w-24">
        <img
          alt={item.imageAlt}
          className="h-full w-full object-cover grayscale-[0.04]"
          loading="lazy"
          src={item.imageUrl}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="label-font text-[9px] tracking-[0.22em] text-[color:var(--on-surface)]/52">
              {item.brand}
            </p>
            <h3 className="display-font mt-1 truncate text-base font-light text-[color:var(--on-surface)] sm:text-lg">
              {item.title}
            </h3>
          </div>
          <p className="display-font shrink-0 text-base font-light text-[color:var(--on-surface)] sm:text-lg">
            {item.price}
          </p>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-[color:var(--on-surface)]/66">
          <span>Size {item.size}</span>
          <span>Qty {item.quantity}</span>
        </div>
      </div>
    </li>
  );
}

export { CartDrawerItem };
