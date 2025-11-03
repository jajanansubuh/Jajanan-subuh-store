import { Category } from "../types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || process.env.PUBLIC_API_URL || "";
const URL = `${API_BASE}/categories`;

const getCategory = async (id: string): Promise<Category> => {
  const res = await fetch(`${URL}/${id}`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Failed to fetch category ${id} (${res.status} ${res.statusText}): ${text}`
    );
  }

  return res.json();
};

export default getCategory;
