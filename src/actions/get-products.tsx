import qs from "query-string";
import { Product } from "../types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || process.env.PUBLIC_API_URL || "";
const URL = `${API_BASE}/products`;

interface Query {
  categoryId?: string;
  isFeatured?: boolean;
}

const getProducts = async (query: Query): Promise<Product[]> => {
  const url = qs.stringifyUrl({
    url: URL,
    query: {
      categoryId: query.categoryId,
      isFeatured: query.isFeatured,
    },
  });

  const res = await fetch(url);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Failed to fetch products (${res.status} ${res.statusText}): ${text}`
    );
  }

  return res.json();
};

export default getProducts;
