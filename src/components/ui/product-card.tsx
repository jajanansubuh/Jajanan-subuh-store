"use client";

import { Product } from "@/types";
import Image from "next/image";
import Currency from "./currency";
import useCart from "@/hooks/use-cart";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { MouseEventHandler, useRef, useState, useEffect } from "react";
import { useLoading } from "@/providers/loading-provider";
import AddToCart from "./add-to-cart";
// import PreviewModal from "../preview-modal";

interface ProductCardProps {
  data: Product;
}

// Small star rating component (partial fill)
const StarRating: React.FC<{ value: number; size?: number }> = ({
  value,
  size = 16,
}) => {
  const percent = Math.max(0, Math.min(5, value)) / 5;
  // width percentage for filled stars
  const widthPercent = Math.round(percent * 100);

  return (
    <span className="inline-block relative" style={{ lineHeight: 0 }}>
      <span
        className="inline-block text-gray-300 whitespace-nowrap"
        aria-hidden
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="currentColor"
            className="inline-block align-middle mr-0.5"
          >
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.562L19.335 24 12 20.201 4.665 24l1.635-8.688L.6 9.75l7.732-1.732z" />
          </svg>
        ))}
      </span>

      <span
        className="absolute left-0 top-0 overflow-hidden text-yellow-400 whitespace-nowrap"
        style={{ width: `${widthPercent}%`, whiteSpace: "nowrap" }}
        aria-hidden
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="currentColor"
            className="inline-block align-middle mr-0.5"
          >
            <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.562L19.335 24 12 20.201 4.665 24l1.635-8.688L.6 9.75l7.732-1.732z" />
          </svg>
        ))}
      </span>
    </span>
  );
};

const ProductCard: React.FC<ProductCardProps> = ({ data }) => {
  const router = useRouter();

  const { setLoading } = useLoading();

  const handleClick = async () => {
    setLoading(true);
    router.push(`/product/${data?.id}`);
    // loader will be dismissed by next page/layout
  };

  const cart = useCart();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  const [qty, setQty] = useState<number>(1);

  const onAddToCart: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();

    // get image element and its bounding rect to animate from
    const imgEl = containerRef.current?.querySelector("img");
    const rect = imgEl?.getBoundingClientRect();

    // prevent adding if out of stock
    const available = data.quantity ?? 0;
    if (available <= 0) {
      toast.error("Stok habis");
      return;
    }
    // prevent adding more than available (cart may already have some qty)
    const existing =
      cart.items.find((i) => i.product.id === data.id)?.quantity ?? 0;
    if (existing + qty > available) {
      toast.error("Stok tidak cukup");
      return;
    }

    // actually add to cart
    cart.add(data, qty);

    // dispatch a small custom event for the floating animation
    try {
      if (imgEl && rect) {
        window.dispatchEvent(
          new CustomEvent("jjs_cart_add", {
            detail: {
              src: (imgEl as HTMLImageElement).src,
              from: {
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height,
              },
            },
          })
        );
      }
    } catch {
      // ignore event errors
    }
  };

  // listen for global cart drawer open/close so we can hide the inline
  // AddToCart control when the drawer is visible
  useEffect(() => {
    const handler = (e: Event) => {
      try {
        const ev = e as CustomEvent;
        const detail = ev.detail;
        if (!detail) return;
        setCartDrawerOpen(!!detail.open);
      } catch {
        // ignore
      }
    };

    window.addEventListener("jjs_cart_drawer_toggle", handler as EventListener);
    return () =>
      window.removeEventListener(
        "jjs_cart_drawer_toggle",
        handler as EventListener
      );
  }, []);

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className="bg-white group cursor-pointer rounded-xl border p-3 flex flex-col w-full h-full overflow-hidden relative"
    >
      {/* Images dan action */}
      <div className="w-full rounded-lg bg-gray-100 relative h-44 overflow-hidden">
        <Image
          alt="Image"
          src={data?.images?.[0]?.url}
          fill
          className="object-cover rounded-lg"
        />
      </div>
      {/* Product Description */}
      <div className="mt-3 flex-1">
        <p className="font-semibold text-sm md:text-base line-clamp-2">
          {data.name}
        </p>
        <p className="text-xs text-gray-400 uppercase mt-1">
          {data.category?.name}
        </p>

        <div className="mt-2 text-sm text-gray-600 space-y-1">
          <p>Stok: {data.quantity ?? 0}</p>
          <p>Terjual: {data.sold ?? 20}</p>
          <div className="flex items-center gap-2">
            <StarRating value={data.avgRating ?? 0} size={14} />
            <span className="text-sm text-gray-700">
              {(data.avgRating ?? 0).toFixed(1)}
            </span>
            <span className="text-gray-400">({data.ratingCount ?? 0})</span>
          </div>
        </div>
      </div>

      {/* Harga and add-to-cart */}
      <div className="mt-3 flex items-center justify-between">
        <div className="font-extrabold text-lg">
          <Currency value={data?.price} />
        </div>

        {/* Floating add to cart button */}
        <div className="ml-2">
          {!cartDrawerOpen && (
            <div className="relative">
              <div className="absolute -right-2 -bottom-6">
                <AddToCart
                  value={qty}
                  onChange={(v) => setQty(v)}
                  onAdd={onAddToCart}
                  min={1}
                  max={data.quantity ?? 0}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
