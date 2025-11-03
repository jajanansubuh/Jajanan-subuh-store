"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import useCart from "@/hooks/use-cart";
import { formatPrice } from "@/lib/format";
import useCheckoutModal from "@/hooks/use-checkout-modal";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faXmark } from "@fortawesome/free-solid-svg-icons";

export default function CartDrawer({ onClose }: { onClose?: () => void }) {
  const { items, remove, updateQty, clear } = useCart();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  const handleClose = useCallback(() => {
    // play exit animation
    setVisible(false);
    // call parent's onClose after animation completes
    setTimeout(() => onClose?.(), 300);
  }, [onClose]);

  // mount/unmount: focus + body lock + animate in
  useEffect(() => {
    containerRef.current?.focus();
    const scrollY = window.scrollY || window.pageYOffset;
    const prevOverflow = document.body.style.overflow;
    const prevPosition = document.body.style.position;
    const prevTop = document.body.style.top;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";

    // animate in after mount
    requestAnimationFrame(() => setVisible(true));

    return () => {
      // restore body scroll
      document.body.style.overflow = prevOverflow || "";
      document.body.style.position = prevPosition || "";
      document.body.style.top = prevTop || "";
      // restore scroll position
      window.scrollTo(0, scrollY);
    };
  }, []);

  // Keep drawer height synced with the visual viewport so when the
  // mobile browser address bar hides/shows the drawer expands/contracts
  // to match. We set an inline height (px) from visualViewport when
  // available because some browsers don't update CSS svh immediately.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const el = containerRef.current;

    const setHeight = () => {
      const h = window.visualViewport?.height ?? window.innerHeight;
      if (el && typeof h === "number") {
        // ensure a smooth height transition
        el.style.height = `${Math.round(h)}px`;
        // keep height transition small and quick for a smooth effect
        el.style.transition = "height 200ms ease";
      }
    };

    // initial
    setHeight();

    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener("resize", setHeight);
      vv.addEventListener("scroll", setHeight);
    }
    window.addEventListener("resize", setHeight);

    return () => {
      if (vv) {
        vv.removeEventListener("resize", setHeight);
        vv.removeEventListener("scroll", setHeight);
      }
      window.removeEventListener("resize", setHeight);
      // clean up inline transition to avoid leaking styles
      if (el) {
        el.style.transition = "";
      }
    };
  }, []);

  // key handling (depends on stable handleClose)
  useEffect(() => {
    // helper to get focusable elements inside the drawer
    const getFocusable = () => {
      if (!containerRef.current) return [] as HTMLElement[];
      const nodes = containerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      return Array.from(nodes).filter((n) => !n.hasAttribute("disabled"));
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
        return;
      }

      if (e.key === "Tab") {
        const focusable = getFocusable();
        if (focusable.length === 0) {
          // nothing to focus, keep focus on container
          e.preventDefault();
          containerRef.current?.focus();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (e.shiftKey) {
          if (active === first || active === containerRef.current) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (active === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [handleClose]);

  const total = items.reduce(
    (s, i) => s + (Number(i.product.price) || 0) * i.quantity,
    0
  );

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className={
        "fixed right-0 top-0 min-h-svh h-svh w-70 sm:w-80 border-l shadow-lg z-50 flex flex-col transform transition-all duration-300 ease-out " +
        (visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0") +
        " bg-[#fff]"
      }
    >
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-black">Keranjang ({items.length})</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={clear}
            aria-label="Kosongkan keranjang"
            title="Kosongkan keranjang"
            className="p-2 rounded-md cursor-pointer text-red-600 hover:text-red-400"
          >
            <FontAwesomeIcon icon={faTrash} className="w-5 h-5" />
          </button>
          <button
            onClick={handleClose}
            aria-label="Tutup keranjang"
            title="Tutup"
            className="p-2 rounded-md cursor-pointer text-black "
          >
            <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="p-4 overflow-auto flex-1">
        {items.length === 0 && (
          <div className="text-xl font-bold text-black">Keranjang kosong</div>
        )}
        <ul className="space-y-3">
          {items.map((it) => (
            <li key={it.product.id} className="flex items-center gap-3">
              <div className="relative h-12 w-12 rounded overflow-hidden bg-gray-100">
                <Image
                  src={it.product.images?.[0]?.url || "/logo-jjs.png"}
                  alt={it.product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 font-medium text-black">
                <div className="text-sm font-bold">{it.product.name}</div>
                <div className="text-xs font-medium">
                  {formatPrice(it.product.price)}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="number"
                    min={1}
                    value={it.quantity}
                    onChange={(e) =>
                      updateQty(
                        it.product.id,
                        Math.max(1, Number(e.target.value) || 1)
                      )
                    }
                    className="w-16 border border-black rounded px-2 py-1 text-sm"
                  />
                  <button
                    onClick={() => remove(it.product.id)}
                    className="text-xs cursor-pointer text-red-600 hover:text-red-400"
                  >
                    <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div
        className="p-4 border-t text-black"
        // add extra padding on top of the safe-area inset so buttons aren't too close to the bottom
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom, 12px) + 16px)",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="text-sm">Total</div>
          <div className="font-semibold">{formatPrice(total)}</div>
        </div>
        <div className="mt-3">
          <button
            className="w-full cursor-pointer bg-[#18442a] text-white py-2 rounded"
            onClick={() => {
              const checkout = useCheckoutModal.getState();
              // derive storeId from first item in cart (assume all items belong to same store)
              const storeId =
                items && items.length ? items[0].product.storeId : undefined;
              checkout.onOpen(storeId ? { storeId } : undefined);
            }}
          >
            Checkout
          </button>
        </div>
        {/* spacer to ensure interactive controls are above the mobile address bar */}
        <div
          style={{ height: "calc(env(safe-area-inset-bottom, 12px) + 16px)" }}
        />
      </div>
    </div>
  );
}
