"use client";

import * as React from "react";
// Link removed; not used in inline search
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faXmark,
  faImage,
  faHighlighter,
  faUpRightFromSquare,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import { Product } from "@/types";
import { formatPrice } from "@/lib/format";
import { Input } from "@/components/ui/input";

function useDebouncedValue<T>(value: T, delay = 50) {
  const [v, setV] = React.useState(value);

  React.useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return v;
}

// ...existing code...

export default function NavbarSearch() {
  const [openInline, setOpenInline] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const debounced = useDebouncedValue(query, 250);
  const [results, setResults] = React.useState<Product[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const router = useRouter();
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = React.useState<number>(-1);
  const listRef = React.useRef<HTMLUListElement | null>(null);
  const [prefShowIcons, setPrefShowIcons] = React.useState<boolean>(true);
  const [prefHighlight, setPrefHighlight] = React.useState<boolean>(true);
  const [isNarrow, setIsNarrow] = React.useState<boolean>(false);

  // track small screens (Tailwind 'lg' breakpoint is 1024px)
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const onMq = () => setIsNarrow(mq.matches);
    onMq();

    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", onMq);
      return () => mq.removeEventListener("change", onMq);
    }

    // fallback for older browsers
    const mqLegacy = mq as unknown as MediaQueryList & {
      addListener?: (cb: () => void) => void;
      removeListener?: (cb: () => void) => void;
    };
    if (typeof mqLegacy.addListener === "function") {
      mqLegacy.addListener(onMq);
      return () => mqLegacy.removeListener && mqLegacy.removeListener(onMq);
    }
  }, []);

  // scroll active result into view
  React.useEffect(() => {
    if (activeIndex < 0) return;
    const ul = listRef.current;
    if (!ul) return;
    const el = ul.children[activeIndex] as HTMLElement | undefined;
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  React.useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!(e.target instanceof Node)) return;
      if (!ref.current.contains(e.target)) {
        setOpenInline(false);
      }
    }

    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // When the inline modal closes, clear the form so it's empty next open
  React.useEffect(() => {
    if (!openInline) {
      setQuery("");
      setResults([]);
      setActiveIndex(-1);
    }
  }, [openInline]);

  // notify other components (for example: mobile menu) when search opens/closes
  React.useEffect(() => {
    try {
      window.dispatchEvent(
        new CustomEvent("jjs_nav_search_toggle", {
          detail: { open: openInline },
        })
      );
    } catch {}
  }, [openInline]);
  React.useEffect(() => {
    if (!debounced) {
      setResults([]);
      setActiveIndex(-1);
      return;
    }

    let mounted = true;
    const url = `/api/search?q=${encodeURIComponent(debounced)}`;

    setIsSearching(true);

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        const list = Array.isArray(data) ? data : [];
        // filter client-side to ensure results match what user typed
        const q = String(debounced).trim().toLowerCase();
        const tokens = q.split(/\s+/).filter(Boolean);
        const filtered = tokens.length
          ? list.filter((p: Product) => {
              const name = String(p?.name || "").toLowerCase();
              // every token must be present in the product name
              return tokens.every((t) => name.includes(t));
            })
          : list;
        setResults(filtered.slice(0, 8));
        setActiveIndex(-1);
      })
      .catch(() => {
        if (!mounted) return;
        setResults([]);
      })
      .finally(() => {
        if (!mounted) return;
        setIsSearching(false);
      });

    return () => {
      mounted = false;
    };
  }, [debounced]);

  // load prefs once on mount
  React.useEffect(() => {
    try {
      const s = localStorage.getItem("nav_search_prefs");
      if (s) {
        const obj = JSON.parse(s);
        if (typeof obj.showIcons === "boolean") setPrefShowIcons(obj.showIcons);
        if (typeof obj.highlight === "boolean") setPrefHighlight(obj.highlight);
      }
    } catch {
      // ignore
    }
  }, []);

  // persist prefs when changed
  React.useEffect(() => {
    try {
      localStorage.setItem(
        "nav_search_prefs",
        JSON.stringify({ showIcons: prefShowIcons, highlight: prefHighlight })
      );
    } catch {}
  }, [prefShowIcons, prefHighlight]);

  // helper: render text with highlighted tokens
  function renderHighlighted(name: string, q: string) {
    if (!prefHighlight || !q) return name;
    const tokens = String(q)
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      // don't highlight single-letter tokens (they make odd pills)
      .filter((t) => t.length >= 2);
    if (tokens.length === 0) return name;
    const re = new RegExp(`(${tokens.join("|")})`, "ig");
    const parts = String(name).split(re);
    return parts.map((part, i) =>
      re.test(part) ? (
        <mark
          key={i}
          className="bg-blue-200 text-black px-0.5 rounded-sm leading-tight"
        >
          {part}
        </mark>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  }

  // classes to shift input/dropdown on narrow viewports so they don't overlap logo
  const inputWrapperClass = cn(
    // when open on narrow screens place a small fixed search at the right edge
    isNarrow && openInline
      ? "fixed top-3 right-4 w-48 z-50 transition-all duration-150"
      : "relative w-48 lg:w-64 transition-all duration-150"
  );

  const dropdownClass = cn(
    isNarrow && openInline
      ? "fixed top-[4.5rem] right-4 w-48 bg-white text-black rounded-lg shadow-xl z-50 overflow-hidden"
      : "absolute left-1/2 -translate-x-1/2 mt-2 w-[calc(100vw-12rem)] sm:left-auto sm:translate-x-0 sm:right-0 sm:w-80 bg-white text-black rounded-lg shadow-xl z-50 overflow-hidden"
  );

  return (
    <div className="flex items-center" ref={ref}>
      <div className="relative">
        {!openInline ? (
          <>
            <div
              role="button"
              tabIndex={0}
              onClick={() => setOpenInline(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setOpenInline(true);
              }}
              className={cn(
                "hidden lg:flex items-center gap-3 bg-white/10 hover:bg-white/20 text-sm rounded-full px-3 py-2 transition-all duration-150 cursor-text max-w-[12rem] backdrop-blur-sm"
              )}
            >
              <FontAwesomeIcon
                icon={faSearch}
                className="h-4 w-4 text-white/85"
              />
              <span className="text-sm text-white/85 truncate">
                Cari produk...
              </span>
            </div>

            {/* mobile button */}
            <button
              onClick={() => setOpenInline(true)}
              className="lg:hidden flex items-center justify-center p-2 rounded-md"
              aria-label="Open search"
            >
              <FontAwesomeIcon
                icon={faSearch}
                className="h-6 w-6 cursor-pointer"
              />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <div className={inputWrapperClass}>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <FontAwesomeIcon icon={faSearch} className="h-4 w-4" />
              </div>
              <Input
                autoFocus
                placeholder="Cari produk..."
                value={query}
                // ensure typed text is visible on white input when navbar has light text
                className="pl-10 pr-3 rounded-full bg-white text-sm text-black shadow-lg ring-1"
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(-1);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActiveIndex((i) => Math.min(i + 1, results.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActiveIndex((i) => Math.max(i - 1, 0));
                  } else if (e.key === "Enter") {
                    if (activeIndex >= 0 && results[activeIndex]) {
                      const p = results[activeIndex];
                      setOpenInline(false);
                      router.push(`/product/${p.id}`);
                    }
                  } else if (e.key === "Escape") {
                    setOpenInline(false);
                    setQuery("");
                    setResults([]);
                  }
                }}
              />
            </div>
            <button
              onClick={() => {
                setOpenInline(false);
                setQuery("");
                setResults([]);
              }}
              className="ml-2 p-1 rounded-full cursor-pointer bg-white/10 hover:bg-white/20 hidden sm:inline-flex"
              aria-label="Close search"
            >
              <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
            </button>
          </div>
        )}

        {openInline && String(query).trim() !== "" && (
          // center under the input on small viewports and limit width so dropdown
          // doesn't extend all the way to the left (logo area). On larger
          // screens keep it right-aligned and fixed width.
          <div className={dropdownClass}>
            <ul ref={listRef} className="max-h-64 overflow-auto">
              {isSearching && results.length === 0 ? (
                <li className="flex items-center gap-3 px-3 py-4">
                  <div className="flex-1 text-sm text-gray-700 flex items-center gap-2">
                    <span>Mencari...</span>
                    <span className="inline-block align-middle">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 38 38"
                        xmlns="http://www.w3.org/2000/svg"
                        stroke="#2563eb"
                      >
                        <g fill="none" fillRule="evenodd">
                          <g transform="translate(1 1)" strokeWidth="2">
                            <circle strokeOpacity=".3" cx="18" cy="18" r="18" />
                            <path d="M36 18c0-9.94-8.06-18-18-18">
                              <animateTransform
                                attributeName="transform"
                                type="rotate"
                                from="0 18 18"
                                to="360 18 18"
                                dur="0.8s"
                                repeatCount="indefinite"
                              />
                            </path>
                          </g>
                        </g>
                      </svg>
                    </span>
                  </div>
                </li>
              ) : !isSearching &&
                results.length === 0 &&
                String(query).trim() !== "" ? (
                <li className="flex items-center gap-3 px-3 py-4">
                  <div className="flex-1 text-sm text-gray-700">
                    Barang tidak ditemukan
                  </div>
                </li>
              ) : (
                results.map((p, idx) => (
                  <li key={p.id}>
                    <div
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenInline(false);
                        router.push(`/product/${p.id}`);
                      }}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 cursor-pointer",
                        idx === activeIndex
                          ? "bg-gray-100"
                          : "hover:bg-gray-100"
                      )}
                      onMouseEnter={() => setActiveIndex(idx)}
                    >
                      {prefShowIcons ? (
                        <div className="relative h-8 w-8 rounded-sm overflow-hidden">
                          <Image
                            src={p.images?.[0]?.url || "/logo-jjs.png"}
                            alt={p.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : null}
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-medium">
                          {prefHighlight
                            ? renderHighlighted(p.name, debounced)
                            : p.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatPrice(p.price)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
            <div className="border-t px-2 py-2 bg-white">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPrefShowIcons((s) => !s)}
                    aria-pressed={prefShowIcons}
                    className={cn(
                      "flex items-center gap-1 text-xs px-2 py-1 rounded cursor-pointer",
                      prefShowIcons ? "bg-gray-100" : "hover:bg-gray-50"
                    )}
                    title="Tampilkan ikon"
                  >
                    <FontAwesomeIcon icon={faImage} className="h-3 w-3" />
                    <span>Ikon</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrefHighlight((s) => !s)}
                    aria-pressed={prefHighlight}
                    className={cn(
                      "flex items-center gap-1 text-xs px-2 py-1 rounded cursor-pointer",
                      prefHighlight ? "bg-gray-100" : "hover:bg-gray-50"
                    )}
                    title="Highlight"
                  >
                    <FontAwesomeIcon icon={faHighlighter} className="h-3 w-3" />
                    <span>Highlight</span>
                  </button>
                </div>
                {/* open-in-new-tab preference removed */}
              </div>

              <button
                type="button"
                onClick={() => {
                  const q =
                    String(query ?? "").trim() ||
                    String(debounced ?? "").trim();
                  if (!q) {
                    setOpenInline(true);
                    const inp = ref.current?.querySelector(
                      "input"
                    ) as HTMLInputElement | null;
                    if (inp) inp.focus();
                    return;
                  }

                  setOpenInline(false);
                  const params = new URLSearchParams();
                  params.set("q", q);
                  params.set("icons", prefShowIcons ? "1" : "0");
                  params.set("highlight", prefHighlight ? "1" : "0");
                  // navigate to home page with search params so main page will filter
                  router.push(`/?${params.toString()}`);
                }}
                className="w-full text-left text-sm text-blue-600 hover:underline flex items-center justify-between cursor-pointer"
              >
                <span>Lihat semua hasil</span>
                <FontAwesomeIcon
                  icon={faUpRightFromSquare}
                  className="h-4 w-4"
                />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
