"use client";

import React, { useState, useEffect } from "react";
import NavbarSearch from "./navbar-search";
import MobileMenu from "./mobile-menu";
import CartButton from "./cart-button";
import dynamic from "next/dynamic";
import { Category } from "@/types";
import { Button } from "@/components/ui/button";
import { UserIcon } from "lucide-react";

const CartDrawer = dynamic(() => import("./cart-drawer"), { ssr: false });
const LoginModal = dynamic(() => import("./auth/login-modal"), { ssr: false });

export default function NavActions({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);


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

        {/* Desktop/tablet: show cart and login inside navbar */}
        <div className="hidden lg:inline-flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLoginModalOpen(true)}
            className="hover:bg-[#18442a] hover:text-white"
          >
            <UserIcon className="h-5 w-5" />
          </Button>
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
      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </>
  );
}
