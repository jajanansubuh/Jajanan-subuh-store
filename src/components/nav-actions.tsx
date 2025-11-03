"use client";

import React, { useState, useEffect } from "react";
import NavbarSearch from "./navbar-search";
import MobileMenu from "./mobile-menu";
import CartButton from "./cart-button";
import dynamic from "next/dynamic";
import { Category } from "@/types";

const CartDrawer = dynamic(() => import("./cart-drawer"), { ssr: false });

export default function NavActions({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // notify other components when the cart drawer opens/closes so they
  // can adjust their UI (for example: hide inline AddToCart controls)
  useEffect(() => {
    try {
      window.dispatchEvent(
        new CustomEvent("jjs_cart_drawer_toggle", { detail: { open } })
      );
    } catch {}
  }, [open]);

  // listen for search open/close so we can hide mobile hamburger while typing
  useEffect(() => {
    function onSearch(e: Event) {
      const ev = e as CustomEvent<{ open: boolean }>;
      setSearchOpen(Boolean(ev?.detail?.open));
    }

    window.addEventListener("jjs_nav_search_toggle", onSearch as EventListener);
    return () =>
      window.removeEventListener(
        "jjs_nav_search_toggle",
        onSearch as EventListener
      );
  }, []);

  return (
    <>
      <div className="absolute right-4 flex items-center gap-2">
        <NavbarSearch />

        {/* Desktop/tablet: show cart inside navbar */}
        <div className="hidden lg:inline-flex">
          <CartButton onOpen={() => setOpen(true)} autoHide={false} />
        </div>

        <div className="lg:hidden">
          <MobileMenu data={categories} hideWhenSearchOpen={searchOpen} />
        </div>
      </div>

      {/* Mobile: floating cart button at bottom center */}
      <div
        className="lg:hidden fixed right-4 z-50"
        // ensure the button sits above iOS home indicator / safe area
        style={{ bottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}
      >
        <CartButton
          onOpen={() => setOpen(true)}
          autoHide={false}
          className="bg-[#18442a] text-white p-3 rounded-full shadow-lg"
        />
      </div>

      {open && <CartDrawer onClose={() => setOpen(false)} />}
    </>
  );
}
