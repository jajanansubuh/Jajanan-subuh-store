import { Category } from "../types";

// Prefer NEXT_PUBLIC_API_URL which is the conventional name for public env vars in Next.js
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || process.env.PUBLIC_API_URL || "";
const URL = `${API_BASE}/categories`;

const getCategories = async (): Promise<Category[]> => {
  const res = await fetch(URL);

  // If the response isn't JSON (for example an HTML error page), trying to call
  // res.json() will throw a SyntaxError with the '<!DOCTYPE' message. Detect
  // non-OK responses and surface the raw text so it's easier to debug.
  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Failed to fetch categories (${res.status} ${res.statusText}): ${text}`
    );
  }

  return res.json();
};

export default getCategories;
