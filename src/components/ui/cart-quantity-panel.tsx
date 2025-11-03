"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import useCart from "@/hooks/use-cart";
import { toast } from "sonner";
import Currency from "./currency";

interface CartQuantityPanelProps {
  productId: string;
  price?: number | string;
  initial?: number;
  max?: number;
  onAdd?: (qty: number) => void;
}

const CartQuantityPanel: React.FC<CartQuantityPanelProps> = ({
  productId,
  price,
  initial = 1,
  max,
  onAdd,
}) => {
  const cart = useCart();
  const [qty, setQty] = useState<number>(initial);
  const [loading, setLoading] = useState(false);
  const [localInput, setLocalInput] = useState<string | null>(null);
  const [hasUserInput, setHasUserInput] = useState(false);
  const [animating, setAnimating] = useState(false);

  const dec = () => setQty((q) => Math.max(1, q - 1));
  const inc = () =>
    setQty((q) => (typeof max === "number" ? Math.min(max, q + 1) : q + 1));

  // keep localInput in sync: if user hasn't typed and qty equals initial, show empty placeholder
  React.useEffect(() => {
    if (!hasUserInput && qty === initial) {
      setLocalInput("");
    } else {
      setLocalInput(String(qty));
    }
  }, [qty, initial, hasUserInput]);

  // small visual animation when user starts typing (placeholder -> number)
  React.useEffect(() => {
    const isTyped = hasUserInput && localInput != null && localInput !== "";
    if (isTyped) {
      setAnimating(true);
      const t = window.setTimeout(() => setAnimating(false), 220);
      return () => window.clearTimeout(t);
    }
    setAnimating(false);
  }, [hasUserInput, localInput]);

  const handleAdd = async () => {
    const available = typeof max === "number" ? max : Infinity;
    if (available <= 0) {
      toast.error("Stok habis");
      return;
    }

    const existing =
      cart.items.find((i) => i.product.id === productId)?.quantity ?? 0;
    if (existing + qty > available) {
      toast.error("Stok tidak cukup");
      return;
    }

    try {
      setLoading(true);
      onAdd?.(qty);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-3 w-full">
      {/* Quantity control: compact on mobile, elongated pill on md+ */}
      <div className="mx-auto sm:mx-0">
        <div className="hidden md:flex items-center rounded-full bg-gray-50 px-4 py-3 gap-x-4 shadow-sm border border-transparent hover:border-gray-200 focus-within:border-gray-300">
          <Button
            variant="ghost"
            size="sm"
            onClick={dec}
            aria-label="Kurangi"
            className="w-8 h-8 flex items-center justify-center text-sm rounded-md"
          >
            -
          </Button>

          <input
            aria-label="Jumlah"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={localInput ?? String(qty)}
            placeholder={localInput === "0" ? "0" : undefined}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9]/g, "");
              setLocalInput(raw);
              setHasUserInput(true);
              if (raw === "") return;
              const v = Number(raw) || 1;
              let next = Math.max(1, Math.floor(v));
              if (typeof max === "number") next = Math.min(max, next);
              setQty(next);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur();
                handleAdd();
              }
            }}
            onBlur={() => {
              if (localInput === "") {
                setHasUserInput(false);
                // keep parent qty as-is
              } else if (localInput != null) {
                const v = Number(localInput) || 1;
                let next = Math.max(1, Math.floor(v));
                if (typeof max === "number") next = Math.min(max, next);
                setQty(next);
              }
            }}
            className={
              "appearance-none placeholder-gray-400 bg-transparent text-lg font-semibold text-center w-20 px-2 outline-none " +
              (animating
                ? "transform transition-all duration-200 ease-out scale-105 opacity-95"
                : "transition-all duration-150")
            }
          />

          <Button
            variant="ghost"
            size="sm"
            onClick={inc}
            aria-label="Tambah"
            className="w-8 h-8 flex items-center justify-center text-sm rounded-md"
          >
            +
          </Button>
        </div>

        <div className="md:hidden flex items-center rounded-lg bg-gray-50 px-2 py-1 gap-x-2 shadow-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={dec}
            aria-label="Kurangi"
            className="w-8 h-8 flex items-center justify-center text-sm"
          >
            -
          </Button>

          <input
            aria-label="Jumlah"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={localInput ?? String(qty)}
            placeholder={localInput === "" ? "" : undefined}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9]/g, "");
              setLocalInput(raw);
              setHasUserInput(true);
              if (raw === "") return;
              const v = Number(raw) || 1;
              let next = Math.max(1, Math.floor(v));
              if (typeof max === "number") next = Math.min(max, next);
              setQty(next);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur();
                handleAdd();
              }
            }}
            onBlur={() => {
              if (localInput === "") {
                setHasUserInput(false);
              } else if (localInput != null) {
                const v = Number(localInput) || 1;
                let next = Math.max(1, Math.floor(v));
                if (typeof max === "number") next = Math.min(max, next);
                setQty(next);
              }
            }}
            className={
              "appearance-none placeholder-gray-400 bg-transparent text-sm font-semibold text-center w-10 px-1 outline-none " +
              (animating
                ? "transform transition-all duration-200 ease-out scale-105 opacity-95"
                : "transition-all duration-150")
            }
          />

          <Button
            variant="ghost"
            size="sm"
            onClick={inc}
            aria-label="Tambah"
            className="w-8 h-8 flex items-center justify-center text-sm"
          >
            +
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-stretch sm:items-start w-full sm:w-auto">
        {price != null && (
          <div className="text-base text-gray-800 text-center sm:text-left">
            <div className="text-sm text-gray-500">Total</div>
            <div className="text-lg font-bold mt-0.5">
              <Currency value={Number(price) * qty} />
            </div>
          </div>
        )}

        <Button
          onClick={handleAdd}
          className="mt-2 w-full sm:w-auto"
          disabled={loading}
        >
          {loading ? "Menambahkan..." : "Tambah ke Keranjang"}
        </Button>
      </div>
    </div>
  );
};

export default CartQuantityPanel;
