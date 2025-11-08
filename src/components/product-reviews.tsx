"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as faStarSolid } from "@fortawesome/free-solid-svg-icons";
import { Loader } from "./ui/loader";

interface Review {
  id: string;
  productId: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface Props {
  productId: string;
}

const ProductReviews: React.FC<Props> = ({ productId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  // Resolve API base at runtime so mobile clients (ngrok / different origin)
  // can fall back to the current page origin when NEXT_PUBLIC_API_URL isn't set.
  const getApiBase = () => {
    // Use environment variable if available
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
    }
    // Fallback to the deployed admin URL
    return "https://jajanan-subuh-admin.vercel.app";
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Call the store's local API proxy. This keeps server-side rendering
        // stable (server components call internal routes) and avoids
        // cross-origin issues.
        const url = `/api/reviews?productId=${productId}`;
        console.debug("[PRODUCT_REVIEWS_FETCH] url=", url);
        const res = await fetch(url, { headers: { Accept: "application/json" } });
        if (!res.ok) {
          // admin reviews endpoint may not exist yet; treat as empty
          if (!mounted) return;
          setReviews([]);
          return;
        }
        const data = await res.json();

        if (!mounted) return;
        setReviews(Array.isArray(data) ? data : []);
      } catch (e) {
        // network or other error -> show empty list
        if (!mounted) return;
        console.error("[PRODUCT_REVIEWS_FETCH]", e);
        setReviews([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [productId]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !comment) return;
    setLoading(true);
    try {
      // Post to the store's local proxy which forwards to the admin API.
      const url = `/api/reviews`;
      console.debug("[PRODUCT_REVIEWS_POST] url=", url);
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ productId, name, rating, comment }),
      });
      console.debug("[PRODUCT_REVIEWS_POST] status=", res.status);
      if (res.ok) {
        const created = await res.json();
        setReviews((r) => [created, ...r]);
        setName("");
        setComment("");
        setRating(5);
      } else {
        console.error("Failed to submit review", res.status);
      }
    } catch (e) {
      console.error("[PRODUCT_REVIEWS_POST]", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold">Ulasan Produk</h3>

      <form onSubmit={onSubmit} className="mt-4 space-y-3 max-w-xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Input
            placeholder="Nama"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div>
            <Select
              value={String(rating)}
              onValueChange={(v) => setRating(Number(v))}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Pilih rating" />
              </SelectTrigger>
              <SelectContent>
                {[5, 4, 3, 2, 1].map((r) => (
                  <SelectItem key={r} value={String(r)}>
                    <div className="flex items-center gap-2">
                      <div className="text-amber-400 flex items-center">
                        {Array.from({ length: r }).map((_, i) => (
                          <FontAwesomeIcon
                            key={i}
                            icon={faStarSolid}
                            className="w-3 h-3"
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {r} bintang
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Textarea
          placeholder="Tulis ulasan Anda..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <div>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader className="h-4 w-4" />
                Mengirim...
              </span>
            ) : (
              "Kirim Ulasan"
            )}
          </Button>
        </div>
      </form>

      <div className="mt-6 space-y-4">
        {reviews.length === 0 && (
          <div className="text-sm text-muted-foreground">Belum ada ulasan.</div>
        )}
        {reviews.map((rv) => (
          <div key={rv.id} className="border rounded-md p-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">{rv.name}</div>
              <div className="text-sm text-muted-foreground">
                {new Date(rv.createdAt).toLocaleString()}
              </div>
            </div>
            <div className="text-sm text-amber-400 flex">
              {Array.from({ length: rv.rating }).map((_, i) => (
                <FontAwesomeIcon
                  key={i}
                  icon={faStarSolid}
                  className="w-4 h-4 text-amber-400 mr-0.5"
                />
              ))}
            </div>
            <div className="mt-2 text-sm">{rv.comment}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductReviews;
