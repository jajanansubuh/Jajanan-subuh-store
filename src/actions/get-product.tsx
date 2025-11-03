import { Product } from "@/types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || process.env.PUBLIC_API_URL || "";
const URL = `${API_BASE}/products`;

const getProduct = async (id: string): Promise<Product> => {
  const res = await fetch(`${URL}/${id}`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Failed to fetch product ${id} (${res.status} ${res.statusText}): ${text}`
    );
  }

  return res.json();
};

export default getProduct;
