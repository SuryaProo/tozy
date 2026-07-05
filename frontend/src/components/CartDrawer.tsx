import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import './CartDrawer.css';

interface SavedAddress {
  _id: string;
  label: string;
  firstName: string;
  lastName: string;
  phone: string;
  street: string;
  city: string;
  pin: string;
  isDefault: boolean;
}

const loadRazorpay = (): Promise<boolean> => {
  return new Promise(resolve => {
    if ((window as any).Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const CartDrawer: React.FC = () => {
  const { items, isOpen, closeCart, removeItem, updateQty, totalItems, totalPrice, clearCart } = useCart();
  const { placeOrder } = useOrders();
  const { user, openLogin, openEmailVerify } = useAuth();

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const [checkout, setCheckout]       = useState(false);
  const [orderDone, setOrderDone]     = useState(false);
  const [placing, setPlacing]         = useState(false);
  const [orderError, setOrderError]   = useState('');
  const [useRazorpay, setUseRazorpay] = useState(true);
  const [saveAddress, setSaveAddress] = useState(true);
  const [needsVerify, setNeedsVerify] = useState(false);

  // Auto-clear verify banner when user gets verified
  useEffect(() => {
    if (user?.emailVerified) setNeedsVerify(false);
  }, [user?.emailVerified]);

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddrId, setSelectedAddrId] = useState<string | null>(null);
  const [addingNew, setAddingNew]           = useState(false);

  // Address form fields
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [email,     setEmail]     = useState('');
  const [phone,     setPhone]     = useState('');
  const [street,    setStreet]    = useState('');
  const [city,      setCity]      = useState('');
  const [pin,       setPin]       = useState('');
  const [label,     setLabel]     = useState('Home');

  // Fetch saved addresses when checkout opens
  useEffect(() => {
    if (checkout && user) {
      api.get('/auth/addresses').then(res => {
        if (res.success && res.addresses.length > 0) {
          setSavedAddresses(res.addresses);
          // Auto-select default address
          const def = res.addresses.find((a: SavedAddress) => a.isDefault) ?? res.addresses[0];
          setSelectedAddrId(def._id);
          setAddingNew(false);
          // Pre-fill form with default
          setFirstName(def.firstName); setLastName(def.lastName);
          setPhone(def.phone); setStreet(def.street);
          setCity(def.city); setPin(def.pin);
          setEmail(user.email ?? '');
        } else {
          // No saved addresses — show new address form
          setSavedAddresses([]);
          setAddingNew(true);
          setEmail(user.email ?? '');
        }
      });
    }
  }, [checkout, user]);

  // When user selects a saved address — fill form
  const selectSavedAddress = (addr: SavedAddress) => {
    setSelectedAddrId(addr._id);
    setAddingNew(false);
    setFirstName(addr.firstName); setLastName(addr.lastName);
    setPhone(addr.phone); setStreet(addr.street);
    setCity(addr.city); setPin(addr.pin);
  };

  const handleCheckout = () => {
    if (!user) { closeCart(); openLogin(); return; }
    setCheckout(true);
  };

  const resetAfterOrder = () => {
    setOrderDone(false); setCheckout(false); closeCart();
    setFirstName(''); setLastName(''); setEmail('');
    setPhone(''); setStreet(''); setCity(''); setPin('');
    setAddingNew(false); setSelectedAddrId(null);
  };

  // ── Razorpay ──────────────────────────────────────────────────────────────
  const handleRazorpayPayment = useCallback(async () => {
    setOrderError(''); setPlacing(true);

    const loaded = await loadRazorpay();
    if (!loaded) {
      setOrderError('Razorpay failed to load. Check your internet.');
      setPlacing(false); return;
    }

    // Optionally save new address first
    if (addingNew && saveAddress && user) {
      await api.post('/auth/addresses', { firstName, lastName, phone, street, city, pin, label });
    }

    const orderRes = await api.post('/payment/create-order', {
      items: items.map(i => ({ productId: i.product.id, size: i.size, quantity: i.quantity })),
      address: { firstName, lastName, email, phone, street, city, pin },
    });

    if (!orderRes.success) {
      setPlacing(false);
      if (orderRes.requiresEmailVerification) {
        setNeedsVerify(true);
        setOrderError('');
      } else {
        setOrderError(orderRes.message || 'Could not create payment order.');
      }
      return;
    }

    setPlacing(false);

    const options = {
      key:      orderRes.keyId,
      amount:   orderRes.amount * 100,
      currency: 'INR',
      name:     'TozYcozY',
      description: 'Premium Fashion',
      order_id: orderRes.razorpayOrderId,
      prefill:  { name: `${firstName} ${lastName}`, email, contact: phone },
      theme:    { color: '#C41E3A' },
      handler: async (response: any) => {
        setPlacing(true);
        const verifyRes = await api.post('/payment/verify', {
          razorpay_order_id:   response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature:  response.razorpay_signature,
          items: items.map(i => ({ productId: i.product.id, size: i.size, quantity: i.quantity })),
          address: { firstName, lastName, email, phone, street, city, pin },
          paymentMethod: 'card',
        });
        setPlacing(false);
        if (verifyRes.success) {
          setOrderDone(true); clearCart();
          setTimeout(resetAfterOrder, 3000);
        } else {
          setOrderError('Payment verification failed. Contact support.');
        }
      },
      modal: { ondismiss: () => setOrderError('Payment cancelled.') },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.on('payment.failed', (resp: any) => {
      setOrderError(`Payment failed: ${resp.error.description}`);
    });
    rzp.open();
  }, [items, firstName, lastName, email, phone, street, city, pin, label, addingNew, saveAddress, user, clearCart]);

  // ── COD ───────────────────────────────────────────────────────────────────
  const handleCOD = useCallback(async () => {
    setOrderError(''); setPlacing(true);

    if (addingNew && saveAddress && user) {
      await api.post('/auth/addresses', { firstName, lastName, phone, street, city, pin, label });
    }

    const res = await placeOrder(
      items,
      { firstName, lastName, email, phone, street, city, pin },
      'cod'
    );
    setPlacing(false);
    if (res.ok) {
      setOrderDone(true); clearCart();
      setTimeout(resetAfterOrder, 3000);
    } else if ((res as any).requiresEmailVerification) {
      setNeedsVerify(true);
      setOrderError('');
    } else {
      setOrderError(res.error || 'Order failed. Try again.');
    }
  }, [items, firstName, lastName, email, phone, street, city, pin, label, addingNew, saveAddress, user, placeOrder, clearCart]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (useRazorpay) handleRazorpayPayment();
    else handleCOD();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div className="cart-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeCart}
          />
          <motion.div className="cart-drawer"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 35 }}
          >
            {/* Header */}
            <div className="cart-header">
              <div>
                <h2 className="cart-title">Your Cart</h2>
                <span className="cart-count">{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
              </div>
              <button className="cart-close" onClick={closeCart}>✕</button>
            </div>

            <AnimatePresence mode="wait">
              {/* ORDER DONE */}
              {orderDone && (
                <motion.div key="done" className="cart-done"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="done-icon">✓</div>
                  <h3>Order Placed!</h3>
                  <p>Check Order History to track your order.</p>
                </motion.div>
              )}

              {/* CHECKOUT FORM */}
              {!orderDone && checkout && (
                <motion.form key="checkout" className="checkout-form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                >
                  <button type="button" className="checkout-back" onClick={() => setCheckout(false)}>
                    ← Back to cart
                  </button>

                  {/* Saved addresses */}
                  {savedAddresses.length > 0 && (
                    <div className="saved-addresses">
                      <h3 className="checkout-section-title">Saved Addresses</h3>
                      {savedAddresses.map(addr => (
                        <div
                          key={addr._id}
                          className={`saved-addr-card ${selectedAddrId === addr._id && !addingNew ? 'active' : ''}`}
                          onClick={() => selectSavedAddress(addr)}
                        >
                          <div className="saved-addr-radio">
                            <div className={`radio-circle ${selectedAddrId === addr._id && !addingNew ? 'checked' : ''}`} />
                          </div>
                          <div className="saved-addr-info">
                            <span className="saved-addr-label">{addr.label}</span>
                            <span className="saved-addr-name">{addr.firstName} {addr.lastName}</span>
                            <span className="saved-addr-detail">{addr.street}, {addr.city} — {addr.pin}</span>
                            <span className="saved-addr-phone">📱 {addr.phone}</span>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        className={`add-new-addr-btn ${addingNew ? 'active' : ''}`}
                        onClick={() => {
                          setAddingNew(true);
                          setSelectedAddrId(null);
                          setFirstName(''); setLastName('');
                          setPhone(''); setStreet(''); setCity(''); setPin('');
                        }}
                      >
                        + Add New Address
                      </button>
                    </div>
                  )}

                  {/* New address form — show if no saved addresses OR adding new */}
                  {(savedAddresses.length === 0 || addingNew) && (
                    <div>
                      <h3 className="checkout-section-title">
                        {savedAddresses.length > 0 ? 'New Address' : 'Delivery Details'}
                      </h3>
                      <div className="form-grid">
                        <input className="form-input" placeholder="First Name *" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                        <input className="form-input" placeholder="Last Name *"  value={lastName}  onChange={e => setLastName(e.target.value)}  required />
                        <input className="form-input full" type="email" placeholder="Email *" value={email} onChange={e => setEmail(e.target.value)} required />
                        <input className="form-input full" type="tel"  placeholder="Phone *" value={phone} onChange={e => setPhone(e.target.value)} required />
                        <input className="form-input full" placeholder="Street Address *" value={street} onChange={e => setStreet(e.target.value)} required />
                        <input className="form-input" placeholder="City *"     value={city} onChange={e => setCity(e.target.value)} required />
                        <input className="form-input" placeholder="PIN Code *" value={pin}  onChange={e => setPin(e.target.value)}  required />
                        <div className="form-input full" style={{ padding: 0, border: 'none' }}>
                          <select className="form-input" style={{ width: '100%' }} value={label} onChange={e => setLabel(e.target.value)}>
                            <option value="Home">🏠 Home</option>
                            <option value="Work">💼 Work</option>
                            <option value="Other">📍 Other</option>
                          </select>
                        </div>
                      </div>
                      {user && (
                        <label className="save-addr-toggle">
                          <input type="checkbox" checked={saveAddress} onChange={e => setSaveAddress(e.target.checked)} />
                          <span>Save this address for future orders</span>
                        </label>
                      )}
                    </div>
                  )}

                  {/* Payment method */}
                  <h3 className="checkout-section-title" style={{ marginTop: 20 }}>Payment</h3>
                  <div className="payment-options">
                    <label className={`payment-option ${useRazorpay ? 'active' : ''}`} onClick={() => setUseRazorpay(true)}>
                      <input type="radio" name="pay" checked={useRazorpay} readOnly />
                      <div>
                        <span className="pay-title">💳 Pay Online</span>
                        <span className="pay-sub">UPI · Card · Net Banking · Wallets</span>
                      </div>
                    </label>
                    <label className={`payment-option ${!useRazorpay ? 'active' : ''}`} onClick={() => setUseRazorpay(false)}>
                      <input type="radio" name="pay" checked={!useRazorpay} readOnly />
                      <div>
                        <span className="pay-title">💵 Cash on Delivery</span>
                        <span className="pay-sub">Pay when you receive</span>
                      </div>
                    </label>
                  </div>

                  {/* Summary */}
                  <div className="checkout-summary">
                    <div className="summary-row"><span>Subtotal</span><span>₹{totalPrice.toLocaleString('en-IN')}</span></div>
                    <div className="summary-row"><span>Shipping</span><span className="free">Free</span></div>
                    <div className="summary-row total"><span>Total</span><span>₹{totalPrice.toLocaleString('en-IN')}</span></div>
                  </div>

                  {/* Email verification required */}
                  {needsVerify && (
                    <div className="checkout-verify-required">
                      <div className="cvr-icon">📧</div>
                      <div className="cvr-content">
                        <div className="cvr-title">Email verification required</div>
                        <div className="cvr-msg">
                          Please verify your email <strong>{user?.email}</strong> before placing an order.
                        </div>
                        <button
                          className="cvr-btn"
                          onClick={async () => {
                            await api.post('/auth/email/send-verify', {});
                            closeCart();
                            openEmailVerify();
                          }}
                        >
                          Verify Email Now →
                        </button>
                      </div>
                    </div>
                  )}
                  {orderError && <div className="checkout-error">{orderError}</div>}

                  <button type="submit" className="btn-place-order" disabled={placing}>
                    {placing ? 'Processing…' : useRazorpay ? `Pay ₹${totalPrice.toLocaleString('en-IN')} →` : 'Place Order (COD) →'}
                  </button>
                </motion.form>
              )}

              {/* EMPTY */}
              {!orderDone && !checkout && items.length === 0 && (
                <motion.div key="empty" className="cart-empty"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                >
                  <div className="empty-icon">○</div>
                  <p>Your cart is empty.</p>
                  <button className="cart-shop-btn" onClick={closeCart}>Continue Shopping</button>
                </motion.div>
              )}

              {/* ITEMS */}
              {!orderDone && !checkout && items.length > 0 && (
                <motion.div key="items" className="cart-items"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                >
                  {items.map((item, i) => (
                    <motion.div key={`${item.product.id}-${item.size}`} className="cart-item" layout
                      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 40 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <div className="item-emoji">{item.product.emoji}</div>
                      <div className="item-info">
                        <div className="item-name">{item.product.title} {item.product.titleLine2}</div>
                        <div className="item-size">Size: {item.size}</div>
                        <div className="item-price">₹{(item.product.price ?? 0).toLocaleString('en-IN')}</div>
                      </div>
                      <div className="item-controls">
                        <button className="qty-btn" onClick={() => updateQty(item.product.id, item.size, item.quantity - 1)}>−</button>
                        <span className="qty-val">{item.quantity}</span>
                        <button className="qty-btn" onClick={() => updateQty(item.product.id, item.size, item.quantity + 1)}>+</button>
                        <button className="item-remove" onClick={() => removeItem(item.product.id, item.size)}>✕</button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer */}
            {!checkout && !orderDone && items.length > 0 && (
              <div className="cart-footer">
                <div className="cart-total">
                  <span>Total</span>
                  <span className="total-price">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
                {!user && <p className="cart-login-nudge">🔒 Sign in to checkout</p>}
                <button className="btn-checkout" onClick={handleCheckout}>
                  {user ? 'Checkout →' : 'Sign In & Checkout →'}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
