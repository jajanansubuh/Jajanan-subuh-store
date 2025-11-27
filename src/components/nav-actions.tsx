"use client";

import React, { useState, useEffect } from "react";
import NavbarSearch from "./navbar-search";
import MobileMenu from "./mobile-menu";
import CartButton from "./cart-button";
import dynamic from "next/dynamic";
import { Category } from "@/types";
import { Button } from "@/components/ui/button";
import { UserIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const CartDrawer = dynamic(() => import("./cart-drawer"), { ssr: false });
const LoginModal = dynamic(() => import("./auth/login-modal"), { ssr: false });
const RegisterModal = dynamic(() => import("./auth/register-modal"), { ssr: false });

export default function NavActions({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

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

  // Navigasi antar modal
  const handleSwitchToRegister = () => {
    setLoginModalOpen(false);
    setRegisterModalOpen(true);
  };
  const handleSwitchToLogin = () => {
    setRegisterModalOpen(false);
    setLoginModalOpen(true);
  };

  // listen for login events from modals to update UI
  useEffect(() => {
    function onLogin() {
      setIsAuthenticated(true);
    }
    window.addEventListener("jjs_user_logged_in", onLogin as EventListener);
    return () => window.removeEventListener("jjs_user_logged_in", onLogin as EventListener);
  }, []);

  // listen for requests from other components to open login modal
  useEffect(() => {
    function onRequestOpenLogin() {
      setLoginModalOpen(true);
    }
    window.addEventListener("jjs_request_open_login", onRequestOpenLogin as EventListener);
    return () => window.removeEventListener("jjs_request_open_login", onRequestOpenLogin as EventListener);
  }, []);

  const handleLogout = async () => {
    try {
      const adminUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL;
      if (adminUrl) {
        const normalized = adminUrl.replace(/\/$/, "");
        // try to call logout endpoint on admin if available
        await fetch(`${normalized}/api/auth/logout`, { method: "POST", credentials: "include" });
      }
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setIsAuthenticated(false);
      try { toast.success("Berhasil logout"); } catch {}
      try { window.dispatchEvent(new CustomEvent("jjs_user_logged_out")); } catch {}
    }
  };

  const onRequestLogout = () => {
    // open confirmation dialog
    setLogoutConfirmOpen(true);
  };

  const confirmLogout = async () => {
    setLogoutConfirmOpen(false);
    await handleLogout();
  };

  return (
    <>
      <div className="absolute right-4 flex items-center gap-2">
        <NavbarSearch />

        {/* Desktop/tablet: show cart and login inside navbar */}
        <div className="hidden lg:inline-flex items-center gap-2">
          {isAuthenticated ? (
            <Button variant="ghost" size="icon" onClick={onRequestLogout} className="hover:bg-[#18442a] hover:text-white">
              <span className="sr-only">Logout</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 4.5A1.5 1.5 0 014.5 3h6A1.5 1.5 0 0112 4.5v2a.75.75 0 01-1.5 0v-2c0-.276.224-.5.5-.5h-6c-.276 0-.5.224-.5.5v11c0 .276.224.5.5.5h6c.276 0 .5-.224.5-.5v-2a.75.75 0 011.5 0v2A1.5 1.5 0 0110.5 18h-6A1.5 1.5 0 013 16.5v-12z" clipRule="evenodd" />
                <path d="M15.72 9.22a.75.75 0 010 1.06l-2.25 2.25a.75.75 0 11-1.06-1.06l1.47-1.47H8.75a.75.75 0 010-1.5h5.13l-1.47-1.47a.75.75 0 011.06-1.06l2.25 2.25z" />
              </svg>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLoginModalOpen(true)}
              className="hover:bg-[#18442a] hover:text-white"
            >
              <UserIcon className="h-5 w-5" />
            </Button>
          )}
          <CartButton onOpen={() => setOpen(true)} autoHide={false} />
        </div>

        {/* Mobile: show user icon next to mobile menu so users can open login on small screens */}
        <div className="lg:hidden flex items-center gap-2">
          {isAuthenticated ? (
            <Button variant="ghost" size="icon" onClick={onRequestLogout} className="hover:bg-[#18442a] hover:text-white">
              <span className="sr-only">Logout</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 4.5A1.5 1.5 0 014.5 3h6A1.5 1.5 0 0112 4.5v2a.75.75 0 01-1.5 0v-2c0-.276.224-.5.5-.5h-6c-.276 0-.5.224-.5.5v11c0 .276.224.5.5.5h6c.276 0 .5-.224.5-.5v-2a.75.75 0 011.5 0v2A1.5 1.5 0 0110.5 18h-6A1.5 1.5 0 013 16.5v-12z" clipRule="evenodd" />
                <path d="M15.72 9.22a.75.75 0 010 1.06l-2.25 2.25a.75.75 0 11-1.06-1.06l1.47-1.47H8.75a.75.75 0 010-1.5h5.13l-1.47-1.47a.75.75 0 011.06-1.06l2.25 2.25z" />
              </svg>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLoginModalOpen(true)}
              className="hover:bg-[#18442a] hover:text-white"
            >
              <UserIcon className="h-5 w-5" />
            </Button>
          )}
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
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSwitchToRegister={handleSwitchToRegister}
      />
      <RegisterModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onSwitchToLogin={handleSwitchToLogin}
      />
      <Dialog open={logoutConfirmOpen} onOpenChange={(open) => setLogoutConfirmOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Logout</DialogTitle>
          </DialogHeader>
          <div className="py-2">Apakah Anda yakin ingin logout?</div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setLogoutConfirmOpen(false)}>Tidak</Button>
            <Button onClick={() => void confirmLogout()} className="ml-2">Ya</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
