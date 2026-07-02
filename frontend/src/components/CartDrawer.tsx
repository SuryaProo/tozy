import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import './CartDrawer.css';

const CartDrawer: React.FC = () => {
  const { items, isOpen, closeCart, removeItem, updateQty, totalItems, totalPrice, clearCart } = useCart();
  const { placeOrder } = useOrders();
  const { user, openLogin } = useAuth();

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const [checkout, setCheckout]   = useState(false);
  const [orderDone, setOrderDone] = useState(false);
  const [placing, setPlacing]     = useState(false);
  const [orderError, setOrderError] = useState('');

  // Address form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [email, setEmail]         = useState('');
  const [phone, setPhone]         = useState('');
  const [street, setStreet]       = useState('');
  const [city, setCity]           = useState('');
  const [pin, setPin]             = useState('');

  const handleCheckout = () => {
    if (!user) {
      closeCart();
      openLogin();
      return;
    }
    setCheckout(true);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError('');
    setPlacing(true);

    const res = await placeOrder(
      items,
      { firstName, lastName, email, phone, street, city, pin },
      'card'
    );

    setPlacing(false);

    if (!res.ok) {
      setOrderError(res.error || 'Could not place order. Please try again.');
      return;
    }

    setOrderDone(true);
    setTimeout(() => {
      clearCart();
      setOrderDone(false);
      setCheckout(false);
      closeCart();
      setFirstName(''); setLastName(''); setEmail(''); setPhone('');
      setStreet(''); setCity(''); setPin('');
    }, 2400);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="cart-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
          />

          <motion.div
            className="cart-drawer"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 35 }}
          >
            <div className="cart-header">
              <div>
                <h2 className="cart-title">Your Cart</h2>
                <span className="cart-count">{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
              </div>
              <button className="cart-close" onClick={closeCart} aria-label="Close cart">✕</button>
            </div>

            <AnimatePresence mode="wait">
              {orderDone ? (
                <motion.div key="done" className="cart-done"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                >
                  <div className="done-icon">✓</div>
                  <h3>Order Placed!</h3>
                  <p>Check Order History in your account to track it.</p>
                </motion.div>

              ) : checkout ? (
                <motion.form
                  key="checkout"
                  className="checkout-form"
                  onSubmit={handlePlaceOrder}
                  initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <button type="button" className="checkout-back" onClick={() => setCheckout(false)}>← Back to cart</button>
                  <h3 className="checkout-section-title">Delivery Details</h3>
                  <div className="form-grid">
                    <input className="form-input" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                    <input className="form-input" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} required />
                    <input className="form-input full" type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required />
                    <input className="form-input full" type="tel" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} required />
                    <input className="form-input full" placeholder="Street Address" value={street} onChange={e => setStreet(e.target.value)} required />
                    <input className="form-input" placeholder="City" value={city} onChange={e => setCity(e.target.value)} required />
                    <input className="form-input" placeholder="PIN Code" value={pin} onChange={e => setPin(e.target.value)} required />
                  </div>

                  <h3 className="checkout-section-title" style={{ marginTop: 24 }}>Payment</h3>
                  <div className="payment-options">
                    <label className="payment-option active">
                      <input type="radio" name="pay" defaultChecked readOnly />
                      <span>💳 Card / UPI / Net Banking</span>
                    </label>
                    <label className="payment-option">
                      <input type="radio" name="pay" readOnly />
                      <span>💵 Cash on Delivery</span>
                    </label>
                  </div>

                  <div className="checkout-summary">
                    <div className="summary-row"><span>Subtotal</span><span>₹{totalPrice.toLocaleString('en-IN')}</span></div>
                    <div className="summary-row"><span>Shipping</span><span className="free">Free</span></div>
                    <div className="summary-row total"><span>Total</span><span>₹{totalPrice.toLocaleString('en-IN')}</span></div>
                  </div>

                  {orderError && (
                    <div className="auth-error" style={{ marginBottom: 12 }}>{orderError}</div>
                  )}

                  <button type="submit" className="btn-place-order" disabled={placing}>
                    {placing ? 'Placing Order…' : 'Place Order →'}
                  </button>
                </motion.form>

              ) : items.length === 0 ? (
                <motion.div key="empty" className="cart-empty"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                >
                  <div className="empty-icon">○</div>
                  <p>Your cart is empty.</p>
                  <button className="cart-shop-btn" onClick={closeCart}>Continue Shopping</button>
                </motion.div>

              ) : (
                <motion.div key="items" className="cart-items"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.35 }}
                >
                  {items.map((item, i) => (
                    <motion.div key={`${item.product.id}-${item.size}`} className="cart-item" layout
                      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 40, height: 0 }}
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
                        <button className="item-remove" onClick={() => removeItem(item.product.id, item.size)} aria-label="Remove item">✕</button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {!checkout && !orderDone && items.length > 0 && (
              <div className="cart-footer">
                <div className="cart-total">
                  <span>Total</span>
                  <span className="total-price">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
                {!user && (
                  <p className="cart-login-nudge">
                    🔒 Sign in to checkout and track your order
                  </p>
                )}
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
