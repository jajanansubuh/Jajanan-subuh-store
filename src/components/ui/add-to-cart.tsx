"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface AddToCartProps {
  value: number;
  onChange: (v: number) => void;
  onAdd: React.MouseEventHandler<HTMLButtonElement>;
  min?: number;
  max?: number;
  className?: string;
  variant?: "card" | "info";
}

const AddToCart: React.FC<AddToCartProps> = ({
  value,
  onChange,
  onAdd,
  min = 1,
  max,
  className,
  variant = "card",
}) => {
  const [clicked, setClicked] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [localInput, setLocalInput] = useState<string | null>(null);
  const [hasUserInput, setHasUserInput] = useState(false);
  const [animating, setAnimating] = useState(false);

  // collapse when clicking outside
  useEffect(() => {
    if (!expanded) return;
    const onDocClick = (ev: MouseEvent) => {
      const target = ev.target as Node | null;
      if (!containerRef.current) return;
      if (target && !containerRef.current.contains(target)) {
        setExpanded(false);
        try {
          window.dispatchEvent(
            new CustomEvent("jjs_cart_control_toggle", {
              detail: { open: false },
            })
          );
        } catch {}
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [expanded]);

  // when expanded, if value === min and user hasn't typed, show empty placeholder
  useEffect(() => {
    if (expanded) {
      if (value === min && !hasUserInput) {
        setLocalInput("");
      } else {
        setLocalInput(String(value));
      }
    } else {
      setLocalInput(null);
    }
  }, [expanded, value, min, hasUserInput]);

  // trigger a short animation when the placeholder becomes a typed value
  useEffect(() => {
    const isTyped = hasUserInput && localInput != null && localInput !== "";
    if (isTyped) {
      setAnimating(true);
      const t = window.setTimeout(() => setAnimating(false), 220);
      return () => window.clearTimeout(t);
    }
    setAnimating(false);
  }, [hasUserInput, localInput]);

  const dec = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onChange(Math.max(min, value - 1));
    // reflect change in local input
    setLocalInput(String(Math.max(min, value - 1)));
    setHasUserInput(true);
  };

  const inc = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (typeof max === "number") onChange(Math.min(max, value + 1));
    else onChange(value + 1);
    // reflect change in local input
    setLocalInput(
      String(typeof max === "number" ? Math.min(max, value + 1) : value + 1)
    );
    setHasUserInput(true);
  };

  const handleAdd: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    setClicked(true);
    try {
      onAdd(e);
      // after submitting, collapse back to icon-only state
      setExpanded(false);
      try {
        window.dispatchEvent(
          new CustomEvent("jjs_cart_control_toggle", {
            detail: { open: false },
          })
        );
      } catch {}
    } finally {
      window.setTimeout(() => setClicked(false), 500);
    }
  };

  const toggleExpand: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    setExpanded((s) => {
      const next = !s;
      try {
        window.dispatchEvent(
          new CustomEvent("jjs_cart_control_toggle", {
            detail: { open: next },
          })
        );
      } catch {}
      return next;
    });
  };

  return (
    <div
      ref={containerRef}
      className={cn("inline-flex items-center", className)}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Card variant: animated panel with controls */}
      {variant === "card" && (
        <div
          className={cn(
            "inline-flex items-center gap-x-1 bg-white/90 shadow-sm rounded-full px-1 py-1 ml-2 max-w-[140px] overflow-hidden transform origin-right transition-all duration-200 ease-out",
            expanded
              ? "opacity-100 scale-100 translate-x-0 pointer-events-auto"
              : "opacity-0 scale-95 translate-x-2 pointer-events-none"
          )}
          aria-hidden={!expanded}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={dec}
            aria-label="Kurangi jumlah"
            disabled={value <= min}
            className="w-8 h-8 p-0"
          >
            -
          </Button>

          <input
            aria-label="Jumlah"
            value={expanded ? localInput ?? String(value) : String(value)}
            onChange={(e) => {
              e.stopPropagation();
              const raw = e.target.value.replace(/[^0-9]/g, "");
              setLocalInput(raw);
              setHasUserInput(true);
              if (raw === "") return;
              const v = Number(raw) || min;
              let next = Math.max(min, Math.floor(v));
              if (typeof max === "number") next = Math.min(max, next);
              onChange(next);
            }}
            onBlur={() => {
              // if input left empty, revert to showing placeholder (empty)
              if (localInput === "") {
                setHasUserInput(false);
                // keep parent value unchanged
              } else if (localInput != null) {
                // ensure parent is synced when blurring
                const v = Number(localInput) || min;
                let next = Math.max(min, Math.floor(v));
                if (typeof max === "number") next = Math.min(max, next);
                onChange(next);
              }
            }}
            className={cn(
              "w-7 text-center border rounded-md px-1 py-0.5 text-sm mx-0.5",
              animating
                ? "transform transition-all duration-200 ease-out scale-105 opacity-95"
                : "transition-all duration-150"
            )}
          />

          <Button
            variant="ghost"
            size="icon"
            onClick={inc}
            aria-label="Tambah jumlah"
            disabled={typeof max === "number" ? value >= max : false}
            className="w-8 h-8 p-0"
          >
            +
          </Button>

          <Button
            onClick={handleAdd}
            className={cn(
              "ml-1 p-2 text-sm",
              clicked ? "animate-[pop_360ms_ease] scale-95" : ""
            )}
            aria-label="Tambah ke keranjang"
          >
            <i className="fa-solid fa-cart-plus text-sm" aria-hidden="true" />
          </Button>

          {/* also show a small toggle icon on the left when expanded for symmetry */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleExpand}
            aria-label="Tutup kontrol keranjang"
            className="w-9 h-9 p-1 bg-white/90 shadow-sm"
          >
            <i
              className="fa-solid fa-cart-shopping text-gray-700 text-sm"
              aria-hidden="true"
            />
          </Button>
        </div>
      )}

      {/* Main button - for info variant render a single square button that directly adds; for card variant render toggle when collapsed */}
      {variant === "info" ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleAdd}
          aria-label="Tambah ke keranjang"
          className={cn(
            clicked ? "animate-[pop_360ms_ease] scale-95" : "",
            "w-10 h-10 p-2 bg-white/90 shadow-sm rounded-md"
          )}
        >
          <i
            className="fa-solid fa-cart-shopping text-gray-700 text-sm"
            aria-hidden="true"
          />
        </Button>
      ) : (
        !expanded && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleExpand}
            aria-label={
              expanded ? "Tutup kontrol keranjang" : "Buka kontrol keranjang"
            }
            className={cn(
              clicked ? "animate-[pop_360ms_ease] scale-95" : "",
              "w-9 h-9 p-1 bg-white/90 shadow-sm"
            )}
          >
            <i
              className="fa-solid fa-cart-shopping text-gray-700 text-sm"
              aria-hidden="true"
            />
          </Button>
        )
      )}
    </div>
  );
};

export default AddToCart;
