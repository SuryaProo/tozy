import React, { createContext, useContext, useState, useCallback } from 'react';
import { CartItem, Product } from '../types';

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  totalPrice: number;
  addItem: (product: Product, size: string) => void;
  removeItem: (productId: string, size: string) => void;
  updateQty: (productId: string, size: string, qty: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  // pendingAction holds what user wanted to do before login prompt
  pendingAction: { type: 'cart'; product: Product; size: string } | null;
  clearPending: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<CartContextType['pendingAction']>(null);

  const addItem = useCallback((product: Product, size: string) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id && i.size === size);
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id && i.size === size
            ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, size, quantity: 1 }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId: string, size: string) => {
    setItems(prev => prev.filter(i => !(i.product.id === productId && i.size === size)));
  }, []);

  const updateQty = useCallback((productId: string, size: string, qty: number) => {
    if (qty < 1) return;
    setItems(prev => prev.map(i =>
      i.product.id === productId && i.size === size ? { ...i, quantity: qty } : i
    ));
  }, []);

  const clearCart  = useCallback(() => setItems([]), []);
  const openCart   = useCallback(() => setIsOpen(true), []);
  const closeCart  = useCallback(() => setIsOpen(false), []);
  const clearPending = useCallback(() => setPendingAction(null), []);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + (i.product.price ?? 0) * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, isOpen, totalItems, totalPrice,
      addItem, removeItem, updateQty, clearCart, openCart, closeCart,
      pendingAction, clearPending,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
