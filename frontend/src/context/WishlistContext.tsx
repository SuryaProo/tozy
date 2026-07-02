import React, { createContext, useContext, useState, useCallback } from 'react';
import { Product } from '../types';

interface WishlistContextType {
  items: Product[];
  isOpen: boolean;
  isWishlisted: (id: string) => boolean;
  toggle: (product: Product) => void;
  remove: (id: string) => void;
  openWishlist: () => void;
  closeWishlist: () => void;
  pendingToggle: Product | null;
  clearPending: () => void;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems]   = useState<Product[]>([]);
  const [isOpen, setOpen]   = useState(false);
  const [pendingToggle, setPendingToggle] = useState<Product | null>(null);

  const isWishlisted = useCallback((id: string) => items.some(p => p.id === id), [items]);

  const toggle = useCallback((product: Product) => {
    setItems(prev =>
      prev.some(p => p.id === product.id)
        ? prev.filter(p => p.id !== product.id)
        : [...prev, product]
    );
  }, []);

  const remove        = useCallback((id: string) => setItems(prev => prev.filter(p => p.id !== id)), []);
  const openWishlist  = useCallback(() => setOpen(true), []);
  const closeWishlist = useCallback(() => setOpen(false), []);
  const clearPending  = useCallback(() => setPendingToggle(null), []);

  return (
    <WishlistContext.Provider value={{
      items, isOpen, isWishlisted, toggle, remove,
      openWishlist, closeWishlist,
      pendingToggle, clearPending,
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};
