export type ProductCategory = string;

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
  tags?: string[]; // for search
}

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  emailVerified?: boolean;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered';
  address: string;
}
