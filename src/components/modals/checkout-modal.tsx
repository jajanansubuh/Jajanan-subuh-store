"use client";

import Modal from "@/components/ui/modal";
import useCheckoutModal from "@/hooks/use-checkout-modal";
import useCart from "@/hooks/use-cart";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
// use native selects for reliability
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useEffect, useState, useRef } from "react";
// ...existing code...

type FormValues = {
  fullName: string;
  address: string;
  phone: string;
  paymentMethod: string;
  shippingMethod: string;
};

export const CheckoutModal = () => {
  const modal = useCheckoutModal();
  const { items, clear } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [storePaymentOptions, setStorePaymentOptions] = useState<
    { value: string; label: string; disabled?: boolean }[] | null
  >(null);
  const [storeShippingOptions, setStoreShippingOptions] = useState<
    { value: string; label: string; disabled?: boolean }[] | null
  >(null);

  const form = useForm<FormValues>({
    defaultValues: {
      fullName: "",
      address: "",
      phone: "",
      paymentMethod: "",
      shippingMethod: "",
    },
  });

  // stable primitive derived from modal.data for useEffect deps
  const modalStoreId =
    (modal.data as Record<string, unknown> | undefined)?.storeId ?? null;

  const buildItemsPayload = (
    sourceItems: { product: { id: string; name?: string }; quantity: number }[]
  ) =>
    sourceItems.map((i) => ({
      productId: i.product.id,
      // always include name for server-side fallback matching; if missing use id
      name: i.product.name ?? i.product.id,
      quantity: i.quantity,
    }));

  type FailedItem = {
    productId: string;
    name?: string;
    ok?: boolean;
    available?: number;
    reason?: string;
  };
  const [failedItems, setFailedItems] = useState<FailedItem[] | null>(null);

  // helper: try local store API first, then fallback to direct admin API if provided
  async function validateStockRequest(
    itemsToCheck: { productId: string; name?: string; quantity: number }[],
    validateOnly = false,
    extra: Record<string, unknown> | null = null
  ) {
    const body: Record<string, unknown> = { items: itemsToCheck };
    if (validateOnly) body.validateOnly = true;
    if (extra) Object.assign(body, extra);
    const jsonSafe = async (r: Response | null) => {
      if (!r) return null;
      try {
        return await r.json().catch(() => null);
      } catch {
        return null;
      }
    };

    try {
      // first try local route
      let res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.status === 404) {
        // local route not found — try direct admin endpoint if configured
        const adminBase = (process.env.NEXT_PUBLIC_ADMIN_URL || "").replace(
          /\/$/,
          ""
        );
        if (adminBase) {
          try {
            console.warn(
              "[CHECKOUT] local /api/checkout returned 404, trying admin directly:",
              adminBase
            );
            res = await fetch(`${adminBase}/api/checkout`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            });
          } catch (err) {
            console.error("[CHECKOUT] direct admin fetch failed", err);
            return { res: null, json: null, error: String(err) };
          }
        }
      }

      const json = await jsonSafe(res);
      return { res, json };
    } catch (err) {
      console.error("[CHECKOUT] validateStockRequest failed", err);
      return { res: null, json: null, error: String(err) };
    }
  }

  // Pre-validate stock whenever modal opens or cart items change
  useEffect(() => {
    if (!modal.isOpen) {
      setFailedItems(null);
      return;
    }

    // when modal opens, try to fetch store-level methods from admin
    (async () => {
      try {
        // The frontend store may know the storeId by environment or admin base.
        // Try to build a URL from NEXT_PUBLIC_API_URL or NEXT_PUBLIC_ADMIN_URL.
        const adminBase = process.env.NEXT_PUBLIC_ADMIN_URL || "";
        const publicApi = process.env.NEXT_PUBLIC_API_URL || "";
        // Prefer a constructed store GET endpoint if storeId available via PUBLIC_API_URL path
        // PUBLIC_API_URL may be like https://admin.example.com/api/<storeId> or origin.
        const tryFetch = async (url: string) => {
          try {
            const res = await fetch(url, { method: "GET" });
            if (!res.ok) return null;
            return await res.json().catch(() => null);
          } catch {
            return null;
          }
        };

        let storeResp: Record<string, unknown> | null = null;

        // derive storeId from precomputed modalStoreId to avoid referencing modal.data here
        const maybeStoreId = modalStoreId ?? undefined;
        if (maybeStoreId && typeof maybeStoreId === "string") {
          // prefer our server-side proxy endpoint first (avoids CORS/host issues)
          const candidates = [
            `/api/admin/stores/${maybeStoreId}`,
            `/api/stores/${maybeStoreId}`,
          ];
          if (publicApi) {
            try {
              const parsed = new URL(publicApi);
              candidates.push(`${parsed.origin}/api/stores/${maybeStoreId}`);
            } catch {
              // ignore
            }
          }
          if (adminBase) {
            try {
              const parsed = new URL(adminBase);
              candidates.push(`${parsed.origin}/api/stores/${maybeStoreId}`);
            } catch {
              // ignore
            }
          }

          console.debug("[CHECKOUT] store GET candidates:", candidates);
          for (const c of candidates) {
            const s = await tryFetch(c);
            console.debug(
              "[CHECKOUT] tried store GET",
              c,
              "=>",
              s ? "ok" : "no response"
            );
            if (s) {
              storeResp = s;
              break;
            }
          }
        }

        // fallback: if PUBLIC_API_URL looks like it contains a store id, try to extract
        if (!storeResp && publicApi) {
          try {
            const parsed = new URL(publicApi);
            // If path ends with /api/<storeId> try that id
            const m = parsed.pathname.match(/\/api\/(.+)$/);
            if (m && m[1]) {
              const id = m[1].split("/")[0];
              const url = `${parsed.origin}/api/stores/${id}`;
              storeResp = await tryFetch(url);
            }
          } catch {
            // ignore
          }
        }

        // last resort: if adminBase is configured and looks absolute, try using a default storeId from modal.data
        if (!storeResp && adminBase) {
          try {
            const parsed = new URL(adminBase);
            // attempt to fetch /api/stores by trying modal.data.storeId if present
            if (maybeStoreId && typeof maybeStoreId === "string") {
              const url = `${parsed.origin}/api/stores/${maybeStoreId}`;
              storeResp = await tryFetch(url);
            }
          } catch {
            // ignore
          }
        }

        console.debug("[CHECKOUT] storeResp:", storeResp);
        if (storeResp) {
          const pm = storeResp["paymentMethods"];
          if (Array.isArray(pm) && pm.length) {
            console.debug("[CHECKOUT] found paymentMethods:", pm);
            setStorePaymentOptions(
              pm.map((p) => ({
                value: String(p.method ?? p.value ?? p),
                label: String(p.label ?? p.method ?? p.value ?? p),
                disabled: p.status !== "Aktif",
              }))
            );
          } else {
            console.debug("[CHECKOUT] no paymentMethods in storeResp");
          }

          const sm = storeResp["shippingMethods"];
          if (Array.isArray(sm) && sm.length) {
            console.debug("[CHECKOUT] found shippingMethods:", sm);
            setStoreShippingOptions(
              sm.map((s) => ({
                value: String(s.method ?? s.value ?? s),
                label: String(s.label ?? s.method ?? s.value ?? s),
                disabled: s.status !== "Aktif",
              }))
            );
          } else {
            console.debug("[CHECKOUT] no shippingMethods in storeResp");
          }
        }
      } catch (err) {
        // ignore fetch errors and keep defaults
        console.warn("[CHECKOUT] could not fetch store methods:", err);
      }
    })();

    // when store options are loaded, pick a sensible default for selects
    (async () => {
      try {
        // small delay not required, rely on setStorePaymentOptions / setStoreShippingOptions side-effects
      } catch {
        // noop
      }
    })();

    let mounted = true;

    (async () => {
      try {
        const { res, json, error } = await validateStockRequest(
          buildItemsPayload(items),
          true, // validateOnly when opening the modal to avoid decrementing stock
          modalStoreId ? { storeId: modalStoreId } : null
        );
        if (!mounted) return;
        if (!res || !res.ok) {
          // Normalize various server response shapes into our FailedItem[] UI shape.
          const normalized: FailedItem[] = [];
          if (json && Array.isArray(json.failed) && json.failed.length) {
            for (const f of json.failed) {
              normalized.push({
                productId: f.requestedProductId ?? f.productId ?? "",
                name: f.requestedName ?? f.name ?? null,
                available:
                  typeof f.available === "number"
                    ? f.available
                    : typeof f.available === "string"
                    ? Number(f.available) || undefined
                    : undefined,
                ok: false,
                reason: f.reason ?? undefined,
              });
            }
          } else if (json && typeof json.error === "string") {
            normalized.push({
              name: undefined,
              productId: "",
              ok: false,
              reason: json.error,
            });
          } else if (error) {
            normalized.push({
              name: undefined,
              productId: "",
              ok: false,
              reason: String(error),
            });
          } else {
            normalized.push({
              name: undefined,
              productId: "",
              ok: false,
              reason: "unknown",
            });
          }

          setFailedItems(normalized);

          if (
            normalized.length &&
            normalized[0].reason &&
            Array.isArray(json?.failed)
          ) {
            toast.error(`${json.failed.length} item stok tidak cukup`);
          }
        } else {
          setFailedItems(null);
        }
      } catch {
        if (mounted) setFailedItems(null);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [modal.isOpen, items, modalStoreId]);

  // when store options change, set default values for the form selects
  useEffect(() => {
    const setDefaultFromOptions = (
      options: { value: string; label: string; disabled?: boolean }[] | null,
      name: "paymentMethod" | "shippingMethod"
    ) => {
      if (!options || options.length === 0) return;
      const firstActive = options.find((o) => !o.disabled) ?? options[0];
      if (firstActive && typeof firstActive.value === "string") {
        try {
          // setValue from react-hook-form API
          // avoid overwriting if user already typed a value
          const current = form.getValues(name);
          if (!current) form.setValue(name, String(firstActive.value));
        } catch {
          // ignore
        }
      }
    };

    setDefaultFromOptions(storePaymentOptions, "paymentMethod");
    setDefaultFromOptions(storeShippingOptions, "shippingMethod");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storePaymentOptions, storeShippingOptions]);

  useEffect(() => {
    if (!modal.isOpen) {
      form.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal.isOpen]);

  // guard to avoid duplicate submits
  const submittingRef = useRef(false);

  const onSubmit = (values: FormValues) => {
    // server-side validate stock before proceeding
    (async () => {
      // prevent double submit at component-level
      if (submittingRef.current) return;
      submittingRef.current = true;
      setIsLoading(true);
      try {
        const { res, json } = await validateStockRequest(
          buildItemsPayload(items),
          true, // validateOnly
          modalStoreId ? { storeId: modalStoreId } : null
        );

        if (!res || !res.ok) {
          const msg =
            json && json.failed && json.failed.length
              ? "Beberapa item stok tidak cukup"
              : "Stok tidak valid";
          toast.error(msg);
          return;
        }

        // double-check required fields (react-hook-form will already validate)
        if (
          !values.fullName?.trim() ||
          !values.address?.trim() ||
          !values.phone?.trim()
        ) {
          toast.error("Nama, alamat, dan No HP wajib diisi.");
          return;
        }
        try {
          const { res: commitRes, json: commitJson } =
            await validateStockRequest(
              buildItemsPayload(items),
              false,
              Object.assign({}, modalStoreId ? { storeId: modalStoreId } : {}, {
                customerName: values.fullName,
                address: values.address,
                paymentMethod: values.paymentMethod,
                phone: values.phone,
                shippingMethod: values.shippingMethod,
              })
            );

          if (!commitRes || !commitRes.ok) {
            const errMsg =
              (commitJson && (commitJson.error || commitJson.message)) ||
              "Gagal membuat pesanan. Stok mungkin berubah.";
            toast.error(String(errMsg));
            return;
          }
        } catch (err) {
          console.error("[CHECKOUT] commit failed", err);
          toast.error("Gagal memproses pesanan. Coba lagi nanti.");
          return;
        }
        try {
          clear();
        } catch {}
        toast.success("Pesanan akan segera diproses. mohon ditunggu.");

        modal.onClose();
      } catch (err) {
        // fallback: ensure modal still closed and notify
        console.error("[CHECKOUT] unexpected error", err);
        toast.error("Terjadi kesalahan saat memproses pesanan.");
        modal.onClose();
      } finally {
        setIsLoading(false);
        submittingRef.current = false;
      }
    })();
  };

  return (
    <Modal
      open={modal.isOpen}
      onClose={modal.onClose}
      overlayClassName="bg-white/70 backdrop-blur-sm"
      closeOnOverlayClick={false}
      hideCloseButton={true}
    >
      <div
        className="w-full overflow-visible px-4 sm:px-6 pt-4 pb-8"
        // ensure button stays above mobile safe-area / gesture bar
        style={{ paddingBottom: "env(safe-area-inset-bottom, 1rem)" }}
      >
        <h3 className="text-lg font-semibold mb-2">Checkout</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Masukkan detail pengiriman dan pembayaran
        </p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="fullName"
              rules={{ required: "Nama lengkap wajib diisi" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input placeholder="Nama lengkap" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              rules={{ required: "Alamat wajib diisi" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat</FormLabel>
                  <FormControl>
                    <Input placeholder="Alamat lengkap" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              rules={{ required: "No HP wajib diisi" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>No HP</FormLabel>
                  <FormControl>
                    <Input placeholder="0812xxxx" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Metode Pembayaran</FormLabel>
                  <FormControl>
                    <div>
                      <Select
                        value={field.value ?? ""}
                        onValueChange={(v) => field.onChange(v)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih metode pembayaran" />
                        </SelectTrigger>
                        <SelectContent className="z-[200]">
                          {(storePaymentOptions ?? []).map((opt) => (
                            <SelectItem
                              key={opt.value}
                              value={String(opt.value)}
                              disabled={opt.disabled}
                            >
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shippingMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Metode Pengiriman</FormLabel>
                  <FormControl>
                    <div>
                      <Select
                        value={field.value ?? ""}
                        onValueChange={(v) => field.onChange(v)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih metode pengiriman" />
                        </SelectTrigger>
                        <SelectContent className="z-[200]">
                          {(storeShippingOptions ?? []).map((opt) => (
                            <SelectItem
                              key={opt.value}
                              value={String(opt.value)}
                              disabled={opt.disabled}
                            >
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div
              className="flex items-center justify-end pt-2 pb-4"
              // extra bottom spacing so buttons are reachable on mobile
              style={{ paddingBottom: "env(safe-area-inset-bottom, 1rem)" }}
            >
              <Button
                variant="outline"
                onClick={modal.onClose}
                className="mr-2"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={
                  (!!failedItems && failedItems.length > 0) || isLoading
                }
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    Loading...
                  </span>
                ) : (
                  "Checkout"
                )}
              </Button>
            </div>
          </form>
        </Form>
        {failedItems && failedItems.length > 0 && (
          <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded">
            <p className="font-semibold text-sm text-red-700">
              Beberapa item stok tidak cukup:
            </p>
            <ul className="text-sm mt-2 list-disc list-inside">
              {failedItems.map((f: FailedItem, idx: number) => {
                // Prefer the local cart item's product name when available
                const local = items.find((it) => it.product.id === f.productId);
                const label =
                  local?.product?.name ??
                  f.name ??
                  f.productId ??
                  "(produk tidak diketahui)";
                return (
                  <li key={idx}>
                    Produk: {label} — Stok: {f.available ?? "tidak diketahui"}
                  </li>
                );
              })}
            </ul>
            <p className="text-xs text-red-600 mt-2">
              Silakan kurangi jumlah atau hapus item dari keranjang sebelum
              melanjutkan.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CheckoutModal;
