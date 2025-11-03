// Formatting helpers
export function formatPrice(price?: number | string) {
  if (price === undefined || price === null || price === "") return "";
  const raw =
    typeof price === "number"
      ? price
      : Number(String(price).replace(/[^0-9.-]+/g, ""));
  if (Number.isNaN(raw)) return String(price);
  return `Rp ${raw.toLocaleString("id-ID")}`;
}

export function formatNumber(n?: number | string) {
  const raw =
    typeof n === "number" ? n : Number(String(n).replace(/[^0-9.-]+/g, ""));
  if (Number.isNaN(raw)) return String(n ?? "");
  return new Intl.NumberFormat("id-ID").format(raw);
}
