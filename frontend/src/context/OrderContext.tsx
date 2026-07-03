import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Order, CartItem } from '../types';
import { useAuth } from './AuthContext';
import { api } from '../utils/api';

interface PlaceOrderAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  pin: string;
}

interface OrderContextType {
  orders: Order[];
  ordersLoading: boolean;
  placeOrder: (items: CartItem[], address: PlaceOrderAddress, paymentMethod?: 'card' | 'upi' | 'cod') => Promise<{ ok: boolean; error?: string; order?: Order }>;
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | null>(null);

// Maps a backend order document → frontend Order shape
const mapBackendOrder = (o: any): Order => ({
  id: o.orderId,
  date: new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
  items: o.items.map((it: any) => ({
    product: {
      id: it.product,
      title: it.title,
      titleLine2: it.titleLine2,
      emoji: it.emoji,
      price: it.price,
      // minimal fields — order history only needs display data, not the full product shape
      category: '', subtitle: '', eyebrow: '', cardDesc: '',
      features: [], sizes: [], specs: [], parts: [],
    },
    size: it.size,
    quantity: it.quantity,
  })),
  total: o.total,
  status: o.status,
  address: `${o.address?.street ?? ''}, ${o.address?.city ?? ''} - ${o.address?.pin ?? ''}`,
});

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const { user } = useAuth();

  const refreshOrders = useCallback(async () => {
    if (!user) { setOrders([]); return; }
    setOrdersLoading(true);
    const res = await api.get('/orders/my');
    if (res.success && Array.isArray(res.orders)) {
      setOrders(res.orders.map(mapBackendOrder));
    }
    setOrdersLoading(false);
  }, [user]);

  // Reload order history whenever the user logs in/out
  useEffect(() => { refreshOrders(); }, [refreshOrders]);

  const placeOrder = useCallback(async (
    items: CartItem[],
    address: PlaceOrderAddress,
    paymentMethod: 'card' | 'upi' | 'cod' = 'card'
  ) => {
    const payload = {
      items: items.map(i => ({
        productId: i.product.id, // backend resolves this to the Mongo _id via slug lookup — see note below
        size: i.size,
        quantity: i.quantity,
      })),
      address,
      paymentMethod,
    };

    const res = await api.post('/orders', payload);
    if (res.success && res.order) {
      const mapped = mapBackendOrder(res.order);
      setOrders(prev => [mapped, ...prev]);
      return { ok: true, order: mapped };
    }
    return { ok: false, error: res.message || 'Failed to place order.' };
  }, []);

  return (
    <OrderContext.Provider value={{ orders, ordersLoading, placeOrder, refreshOrders }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrders must be used within OrderProvider');
  return ctx;
};
