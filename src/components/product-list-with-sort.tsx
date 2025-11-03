"use client";

import React, { useMemo, useState } from "react";
import { Product } from "@/types";
import ProductList from "./product-list";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";

interface Props {
  title: string;
  items: Product[];
}

// field options (direction controlled separately)
const SORT_FIELDS = [
  { value: "default", label: "Default" },
  { value: "terbaru", label: "Terbaru" },
  { value: "terlaris", label: "Terlaris" },
  { value: "harga", label: "Harga" },
  { value: "nama", label: "Nama" },
];

const parsePrice = (p?: string) => {
  if (!p) return 0;
  try {
    // remove non-number characters (currency symbols, commas)
    const n = p.replace(/[^0-9.-]+/g, "");
    return parseFloat(n) || 0;
  } catch {
    return 0;
  }
};

const ProductListWithSort: React.FC<Props> = ({ title, items }) => {
  const [field, setField] = useState<string>("default");
  const [direction, setDirection] = useState<"asc" | "desc">("asc");

  const sortedItems = useMemo(() => {
    if (!items) return [] as Product[];
    // keep original order for default
    const copy = [...items];

    switch (field) {
      case "harga":
        return copy.sort((a, b) =>
          direction === "asc"
            ? parsePrice(a.price) - parsePrice(b.price)
            : parsePrice(b.price) - parsePrice(a.price)
        );
      case "nama":
        return copy.sort((a, b) =>
          direction === "asc"
            ? (a.name || "").localeCompare(b.name || "")
            : (b.name || "").localeCompare(a.name || "")
        );
      case "terbaru":
        // sort by created date if we can find one on the item
        const getCreated = (p: Product) => {
          // try common date fields used by various APIs
          const anyP = p as unknown as Record<string, unknown>;
          const candidates = [
            anyP["createdAt"],
            anyP["created_at"],
            anyP["created"],
            anyP["publishedAt"],
            anyP["date"],
          ];
          for (const c of candidates) {
            if (c == null) continue;
            if (c instanceof Date) {
              const d = c as Date;
              if (!isNaN(d.getTime())) return d.getTime();
              continue;
            }
            if (typeof c === "string" || typeof c === "number") {
              const d = new Date(c as string | number);
              if (!isNaN(d.getTime())) return d.getTime();
            }
          }
          return null as number | null;
        };

        return copy.sort((a, b) => {
          const da = getCreated(a);
          const db = getCreated(b);
          // if neither has date, keep original order
          if (da == null && db == null) return 0;
          // missing dates sort after ones with dates
          if (da == null) return direction === "asc" ? 1 : -1;
          if (db == null) return direction === "asc" ? -1 : 1;
          return direction === "asc" ? da - db : db - da;
        });
      case "terlaris":
        // sort by sold / sales count if available
        const getSold = (p: Product) => {
          const anyP = p as unknown as Record<string, unknown>;
          const candidates = [
            anyP["sold"],
            anyP["sales"],
            anyP["soldCount"],
            anyP["totalSold"],
            anyP["quantitySold"],
          ];
          for (const c of candidates) {
            if (typeof c === "number") return c;
            if (typeof c === "string") {
              const n = parseFloat(c as unknown as string);
              if (!isNaN(n)) return n;
            }
          }
          return null as number | null;
        };

        return copy.sort((a, b) => {
          const sa = getSold(a);
          const sb = getSold(b);
          if (sa == null && sb == null) return 0;
          if (sa == null) return direction === "asc" ? 1 : -1;
          if (sb == null) return direction === "asc" ? -1 : 1;
          return direction === "asc" ? sa - sb : sb - sa;
        });
      default:
        return copy;
    }
  }, [items, field, direction]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-y-4">
        <h3 className="font-bold text-3xl">{title}</h3>

        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600 hidden sm:block">
            Sort by
          </label>

          <div className="flex items-center gap-2">
            <Select value={field} onValueChange={(v) => setField(String(v))}>
              <SelectTrigger size="default" className="w-40">
                <SelectValue placeholder="Urutkan" />
              </SelectTrigger>
              <SelectContent>
                {SORT_FIELDS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* direction buttons - icon only (show for harga/nama/terbaru/terlaris) */}
            <div className="flex items-center gap-2">
              {/** show always, but disabled when not applicable */}
              {(() => {
                const canToggle =
                  field === "harga" ||
                  field === "nama" ||
                  field === "terbaru" ||
                  field === "terlaris";
                return (
                  <>
                    <button
                      type="button"
                      onClick={() => canToggle && setDirection("asc")}
                      aria-pressed={direction === "asc"}
                      aria-label="Sort ascending"
                      disabled={!canToggle}
                      className={`p-2 rounded-md border transition flex items-center justify-center ${
                        !canToggle
                          ? "bg-white text-gray-400 border-gray-200 cursor-not-allowed opacity-60"
                          : direction === "asc"
                          ? "bg-primary text-primary-foreground border-transparent"
                          : "bg-background text-foreground border-input hover:bg-primary/5"
                      }`}
                    >
                      <FontAwesomeIcon icon={faArrowUp} className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => canToggle && setDirection("desc")}
                      aria-pressed={direction === "desc"}
                      aria-label="Sort descending"
                      disabled={!canToggle}
                      className={`p-2 rounded-md border transition flex items-center justify-center ${
                        !canToggle
                          ? "bg-white text-gray-400 border-gray-200 cursor-not-allowed opacity-60"
                          : direction === "desc"
                          ? "bg-primary text-primary-foreground border-transparent"
                          : "bg-background text-foreground border-input hover:bg-primary/5"
                      }`}
                    >
                      <FontAwesomeIcon icon={faArrowDown} className="w-4 h-4" />
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      <ProductList title="" items={sortedItems} />
    </div>
  );
};

export default ProductListWithSort;
