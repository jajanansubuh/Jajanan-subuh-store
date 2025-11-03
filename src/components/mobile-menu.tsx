"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons";
import MainNav from "./main-nav";
import Container from "./ui/container";
import { Category } from "@/types"; // Pastikan ini menunjuk ke file tipe data Anda
import { usePathname } from "next/navigation";

// Definisikan tipe data untuk props
interface MobileMenuProps {
  data: Category[];
  // when true the hamburger should visually hide (use transition) and menu will close
  hideWhenSearchOpen?: boolean;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  data,
  hideWhenSearchOpen,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // close menu automatically when navigation happened
  useEffect(() => {
    if (isOpen) setIsOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Fungsi untuk mengubah status menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // close the menu if search is opened elsewhere
  useEffect(() => {
    function onSearch(e: Event) {
      try {
        const ev = e as CustomEvent<{ open: boolean }>;
        if (ev?.detail?.open) setIsOpen(false);
      } catch {}
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
      {/* Tombol Hamburger */}
      <button
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Tutup menu" : "Buka menu"}
        // animate when search opens/closes; when hidden make it non-interactive
        className={`p-2 rounded-md cursor-pointer text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-200 transform ${
          hideWhenSearchOpen
            ? "opacity-0 -translate-x-2 pointer-events-none"
            : "opacity-100 translate-x-0 hover:bg-white/10"
        }`}
      >
        {isOpen ? (
          <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
        ) : (
          <FontAwesomeIcon icon={faBars} className="w-6 h-6" />
        )}
      </button>

      {/* Konten Menu Mobile - diposisikan di bawah navbar dan mengikuti lebar container
          Panel selalu dirender untuk memungkinkan transisi CSS (fade + slide).
          Saat tertutup kita menggunakan opacity/translate dan pointer-events-none agar tidak dapat diinteraksi.
      */}
      <div
        className={`lg:hidden fixed top-16 left-0 right-0 z-40 transition-all duration-300 ease-out transform origin-top
          ${
            isOpen
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-2 pointer-events-none"
          }`}
        aria-hidden={!isOpen}
      >
        <div className="bg-[#124929] border-b shadow-lg">
          <Container>
            <div className="p-4 sm:px-6">
              <MainNav data={data} />
            </div>
          </Container>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
