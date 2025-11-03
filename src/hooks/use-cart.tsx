"use client";

import { useCartContext } from "@/providers/cart-provider";

export default function useCart() {
  return useCartContext();
}
