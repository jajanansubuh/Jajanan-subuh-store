import { Banner } from "../types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || process.env.PUBLIC_API_URL || "";
const URL = `${API_BASE}/banners`;

const getBanners = async (storeId: string): Promise<Banner[]> => {
  const res = await fetch(`${URL}?storeId=${storeId}`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Failed to fetch banners (${res.status} ${res.statusText}): ${text}`
    );
  }

  return res.json();
};

export default getBanners;
