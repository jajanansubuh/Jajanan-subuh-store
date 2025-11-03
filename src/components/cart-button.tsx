"use client";

import React, { useEffect, useRef, useState } from "react";
import useCart from "@/hooks/use-cart";

export default function CartButton({
  onOpen,
  className,
  autoHide = true,
}: {
  onOpen?: () => void;
  className?: string;
  autoHide?: boolean;
}) {
  const { items } = useCart();
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [mounted, setMounted] = useState(false);
  const lastY = useRef(typeof window !== "undefined" ? window.scrollY : 0);

  // Ensure we only render the full interactive button after client mount.
  // This makes the server HTML match the initial client render and avoids
  // hydration mismatches when classes/props differ between server and client.
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // hide this global cart button when a local AddToCart control opens
    const onToggle = (e: Event) => {
      try {
        const ev = e as CustomEvent;
        const detail = ev.detail;
        if (!detail) return;
        const open = !!detail.open;
        const el = btnRef.current;
        if (!el) return;
        // only toggle visibility when autoHide is enabled for this instance
        if (autoHide) {
          // toggle visibility via inline style to avoid reflow issues
          el.style.visibility = open ? "hidden" : "visible";
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener(
      "jjs_cart_control_toggle",
      onToggle as EventListener
    );
    // detect scroll direction to add a small "down" animation
    const onScroll = () => {
      const y = window.scrollY || 0;
      const goingDown = y > lastY.current && y > 20; // ignore tiny moves near top
      if (goingDown !== isScrollingDown) {
        setIsScrollingDown(goingDown);
      }
      lastY.current = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener(
        "jjs_cart_control_toggle",
        onToggle as EventListener
      );
      window.removeEventListener("scroll", onScroll);
    };
  }, [isScrollingDown, autoHide]);

  useEffect(() => {
    const handler = (e: Event) => {
      try {
        const ev = e as CustomEvent;
        const detail = ev.detail;
        if (!detail) return;

        const imgSrc: string = detail.src;
        const from = detail.from;

        // if this CartButton instance is not visible (e.g. the other
        // responsive CartButton is hidden via CSS), skip the animation
        // to avoid duplicate/fighting animations.
        const btn = btnRef.current;
        if (!btn) return;
        // offsetParent is null when element or its ancestor is display:none
        // fall back to bounding rect size check for robustness
        const rectBtn = btn.getBoundingClientRect();
        if (
          btn.offsetParent === null ||
          (rectBtn.width === 0 && rectBtn.height === 0)
        ) {
          return;
        }

        // create flying image
        const fly = document.createElement("img");
        fly.src = imgSrc;
        fly.style.position = "fixed";
        fly.style.left = `${from.left}px`;
        fly.style.top = `${from.top}px`;
        fly.style.width = `${from.width}px`;
        fly.style.height = `${from.height}px`;
        fly.style.transition =
          "transform 1600ms cubic-bezier(.2,.8,.2,1), opacity 1600ms";
        fly.style.zIndex = "9999";
        fly.style.borderRadius = "8px";
        document.body.appendChild(fly);

        // compute target position (cart button center)
        if (btn) {
          const tgt = btn.getBoundingClientRect();
          const targetX = tgt.left + tgt.width / 2 - from.width / 2;
          const targetY = tgt.top + tgt.height / 2 - from.height / 2;

          requestAnimationFrame(() => {
            fly.style.transform = `translate(${targetX - from.left}px, ${
              targetY - from.top
            }px) scale(0.15)`;
            fly.style.opacity = "0.6";
          });

          // pop animation for badge
          btn.animate(
            [
              { transform: "translateY(0) scale(1)" },
              { transform: "translateY(-6px) scale(1.08)" },
              { transform: "translateY(0) scale(1)" },
            ],
            { duration: 400, easing: "ease-out" }
          );
        }

        // cleanup
        setTimeout(() => {
          fly.style.transition = "opacity 200ms";
          fly.style.opacity = "0";
          setTimeout(() => fly.remove(), 250);
        }, 650);
      } catch {
        // ignore
      }
    };

    window.addEventListener("jjs_cart_add", handler as EventListener);
    return () => {
      window.removeEventListener("jjs_cart_add", handler as EventListener);
    };
  }, []);

  const defaultBase = "relative p-2 rounded-md text-white";
  // if caller provided className, keep it but ensure we have `relative`
  const userBase = className ? `relative ${className}` : defaultBase;
  // Keep the small-screen "scroll down" animation, but disable the
  // translate/opacity change on large screens (desktop) so the cart
  // icon doesn't move out of the navbar while scrolling.
  const scrollClass = isScrollingDown
    ? "translate-y-3 opacity-80 lg:translate-y-0 lg:opacity-100"
    : "translate-y-0 opacity-100";

  // Render a placeholder on first render (server + initial client) to keep
  // server HTML and client initial render identical and avoid hydration errors.
  if (!mounted) {
    return <div className={userBase} aria-hidden />;
  }

  return (
    <button
      ref={btnRef}
      onClick={onOpen}
      aria-label="Buka keranjang"
      className={`${userBase} ${scrollClass} transition-transform duration-300 ease-out flex items-center justify-center cursor-pointer ${
        className
          ? ""
          : "bg-white/10 hover:bg-white/20 p-2 rounded-full shadow-sm"
      }`}
    >
      {/* modern SVG cart icon */}
      <svg
        className="h-5 w-5 text-white"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
      >
        <path
          d="M3 3h2l.4 2M7 13h10l3-8H6.4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="10" cy="20" r="1" fill="currentColor" />
        <circle cx="18" cy="20" r="1" fill="currentColor" />
      </svg>

      {totalQty > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-semibold rounded-full px-1.5 py-0.5 shadow-md">
          {totalQty}
        </span>
      )}
    </button>
  );
}
