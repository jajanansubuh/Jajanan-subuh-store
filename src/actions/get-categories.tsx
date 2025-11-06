import { Category } from "../types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.PUBLIC_API_URL || "";
// Protect against env vars accidentally set to the string 'undefined'
const hasApiBase = Boolean(API_BASE) && API_BASE !== "undefined";
const URL = hasApiBase ? `${API_BASE}/categories` : null;

const getCategories = async (): Promise<Category[]> => {
  try {
    if (!URL) {
      // If API base is not configured, return empty list during build/runtime to avoid invalid URL errors.
      // This lets the build complete; on Vercel you should still set NEXT_PUBLIC_API_URL so the app can fetch real data.
      console.warn('NEXT_PUBLIC_API_URL is not set or invalid. Returning empty categories.');
      return [];
    }

    const res = await fetch(URL, {
      next: { revalidate: 3600 } // Revalidate every hour, allows static build
    });

    if (!res.ok) {
      // Return empty array during build if API is not available
      if (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL) {
        console.warn('API not available during build, returning empty categories');
        return [];
      }
      const text = await res.text();
      throw new Error(`Failed to fetch categories (${res.status} ${res.statusText}): ${text}`);
    }

    return res.json();
  } catch (error) {
    // Always return an empty array on any fetch/parse error to avoid build failures
    console.warn('Error fetching categories, returning empty array:', error);
    return [];
  }
};

export default getCategories;
