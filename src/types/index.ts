export type ProductCategory = 'shirt' | 'shoes';

export interface ProductSize {
  label: string;
  available: boolean;
}

export interface ProductSpec {
  label: string;
  value: string;
  detail: string;
}

export interface ExplodedPart {
  id: string;
  name: string;
  detail: string;
  tooltip: string;
  icon: string;
  gridCol: number;
  gridRow: number;
}

export interface Product {
  id: ProductCategory;
  category: string;
  emoji: string;
  title: string;
  titleLine2: string;
  subtitle: string;
  eyebrow: string;
  cardDesc: string;
  features: string[];
  sizes: ProductSize[];
  specs: ProductSpec[];
  parts: ExplodedPart[];
  price?: number;
  images?: string[];
  sku?: string;
  stock?: number;
}

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}
