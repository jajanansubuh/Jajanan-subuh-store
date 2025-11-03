export interface Banner {
  id: string;
  label: string;
  imageUrl: string;
}

export interface Category {
  id: string;
  name: string;
  banner: Banner;
}

export interface Product {
  id: string;
  category: Category;
  name: string;
  price: string;
  // storeId is optional on client product payloads but may be present from API
  storeId?: string;
  isFeatured: boolean;
  images: Image[];
  quantity?: number;
  /** Optional number of items sold. If absent, UI will show a default example value. */
  sold?: number;
  /** Average rating (0-5) computed from reviews */
  avgRating?: number;
  /** Number of ratings / reviews */
  ratingCount?: number;
}

export interface Image {
  id: string;
  url: string;
}
