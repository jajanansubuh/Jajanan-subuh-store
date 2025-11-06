import qs from "query-string";
import { Product } from "../types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || process.env.PUBLIC_API_URL || "";
const hasApiBase = Boolean(API_BASE) && API_BASE !== "undefined";
const URL = hasApiBase ? `${API_BASE}/products` : null;

interface Query {
  categoryId?: string;
  isFeatured?: boolean;
  q?: string;
}

const getProducts = async (query: Query): Promise<Product[]> => {
  if (!URL) {
    console.warn("NEXT_PUBLIC_API_URL is not set or invalid. Returning empty products.");
    return [];
  }

  const url = qs.stringifyUrl({
    url: URL as string,
    query: {
      categoryId: query.categoryId,
      isFeatured: query.isFeatured,
      q: query.q,
    },
  });

  const res = await fetch(url);

  if (!res.ok) {
    const text = await res.text();
    console.warn(
      `Failed to fetch products (${res.status} ${res.statusText}): ${text}`
    );
    return [];
  }

  try {
    return await res.json();
  } catch (err) {
    console.warn('Failed to parse products JSON, returning empty array:', err);
    return [];
  }
};

export default getProducts;
