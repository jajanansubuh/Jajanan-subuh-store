import { Category } from "../types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const URL = `${API_BASE}/categories`;

const getCategories = async (): Promise<Category[]> => {
  try {
    // Add cache: 'no-store' to prevent stale data during build
    const res = await fetch(URL, {
      cache: 'no-store',
      next: { revalidate: 3600 } // Revalidate every hour
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
    // During build, return empty array instead of throwing
    if (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL) {
      console.warn('Error fetching categories during build, returning empty array:', error);
      return [];
    }
    throw error;
  }
};

export default getCategories;
