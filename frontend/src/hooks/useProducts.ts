import { useState, useEffect } from 'react';
import { Product } from '../types';
import { PRODUCTS as FALLBACK_PRODUCTS } from '../data/products';
import { api } from '../utils/api';

/**
 * Fetches products from the backend (/api/products).
 * Falls back to the local static data/products.ts if the backend
 * is unreachable or hasn't been connected to MongoDB yet — so the
 * frontend always renders something, even before you set MONGODB_URI.
 */

// Backend documents use `slug` as the id; map to the frontend's `id` field
const mapBackendProduct = (p: any): Product => ({
  ...p,
  id: p.slug,
});

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [loading, setLoading]   = useState(false);  // Start false — fallback always ready
  const [usingFallback, setUsingFallback] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const res = await api.get('/products');
      if (cancelled) return;

      if (res.success && Array.isArray(res.products) && res.products.length > 0) {
        setProducts(res.products.map(mapBackendProduct));
        setUsingFallback(false);
      } else {
        setProducts(FALLBACK_PRODUCTS);
        setUsingFallback(true);
      }
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, []);

  return { products, loading, usingFallback };
};
