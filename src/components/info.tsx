"use client";

import React, { useEffect, useState } from "react";
import { Product } from "@/types";
// import from "./ui/"; // Removed invalid import causing build error
import { Button } from "./ui/button";
import Currency from "./ui/currency";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCommentDots } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import useCart from "@/hooks/use-cart";
import { toast } from "sonner";
import { Loader } from "./ui/loader";
import CartQuantityPanel from "./ui/cart-quantity-panel";

interface InfoProps {
  data: Product & { quantity?: number; stock?: number };
}

const Info: React.FC<InfoProps> = ({ data }) => {
  // window is unavailable during SSR. Resolve origin on the client.
  const [origin, setOrigin] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const URL = origin ? `${origin}/product/${data.id}` : `/product/${data.id}`;
  const telp = process.env.NEXT_PUBLIC_TELP ?? "";
  const pesan = `Halo saya ingin membeli ${data.name} - ${data.price} dengan link: ${URL}`;
  const encodedPesan = encodeURIComponent(pesan);

  const link = `https://wa.me/${telp}?text=${encodedPesan}`;
  const cart = useCart();

  const lowStockThreshold = 5;

  // quantity is managed inside CartQuantityPanel; Info doesn't need a local qty

  const onAdd = (qty: number) => {
    const available = data.quantity ?? data.stock ?? 0;
    if (available <= 0) {
      toast.error("Stok habis");
      return;
    }

    const existing =
      cart.items.find((i) => i.product.id === data.id)?.quantity ?? 0;
    if (existing + qty > available) {
      toast.error("Stok tidak cukup");
      return;
    }

    cart.add(data, qty);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">{data.name}</h1>
      <div className="mt-3 flex items-end justify-between">
        <div className="text-2xl text-gray-900">
          <Currency value={data?.price} />
        </div>
      </div>
      <hr className="my-4" />
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Stok:{" "}
          <span className="font-medium">
            {data.quantity ?? data.stock ?? 0}
          </span>
        </p>
        {(data.quantity ?? data.stock ?? 0) <= 0 && (
          <p className="text-sm text-red-600 font-medium">Habis</p>
        )}
        {(data.quantity ?? data.stock ?? 0) > 0 &&
          (data.quantity ?? data.stock ?? 0) <= lowStockThreshold && (
            <p className="text-sm text-yellow-700 font-medium">Stok rendah</p>
          )}
      </div>
      <div className="mt-10 flex flex-col sm:flex-row items-center sm:items-start gap-3">
        {/* Jika origin belum tersedia, tunjukkan indikator loading kecil di tombol chat */}
        {telp ? (
          <Link href={link} target="_blank" className="w-full sm:w-auto">
            <Button className="flex items-center gap-x-2 w-full sm:w-auto justify-center sm:justify-start">
              {origin ? (
                <>
                  Chat Penjual{" "}
                  <FontAwesomeIcon icon={faCommentDots} className="w-5 h-5" />
                </>
              ) : (
                <span className="flex items-center gap-x-2">
                  <Loader className="h-4 w-4" />
                  Memuat...
                </span>
              )}
            </Button>
          </Link>
        ) : (
          <Button
            variant="outline"
            disabled
            className="flex items-center gap-x-2 w-full sm:w-auto justify-center sm:justify-start"
          >
            <FontAwesomeIcon icon={faCommentDots} className="w-5 h-5" /> Chat
            (tidak tersedia)
          </Button>
        )}
        <div className="w-full sm:w-auto">
          <CartQuantityPanel
            productId={data.id}
            initial={1}
            max={data.quantity ?? 0}
            price={data.price}
            onAdd={(q) => onAdd(q)}
          />
        </div>
      </div>
    </div>
  );
};

export default Info;
