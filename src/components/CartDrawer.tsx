import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import './CartDrawer.css';

const CartDrawer: React.FC = () => {
  const { items, isOpen, closeCart, removeItem, updateQty, totalItems, totalPrice } = useCart();
  const overlayRef = useRef<HTMLDivElement>(null);

  // lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const [checkout, setCheckout] = React.useState(false);
  const [orderDone, setOrderDone] = React.useState(false);

  const handleCheckout = () => setCheckout(true);
  const handlePlaceOrder = () => {
    setOrderDone(true);
    setTimeout(() => {
      setOrderDone(false);
      setCheckout(false);
      closeCart();
    }, 3000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="cart-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            className="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 35 }}
          >
            {/* Header */}
            <div className="cart-header">
              <div>
                <h2 className="cart-title">Your Cart</h2>
                <span className="cart-count">{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
              </div>
              <button className="cart-close" onClick={closeCart} aria-label="Close cart">✕</button>
            </div>

            {/* Content — cart view or checkout form */}
            <AnimatePresence mode="wait">
              {orderDone ? (
                <motion.div
                  key="done"
                  className="cart-done"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="done-icon">✓</div>
                  <h3>Order Placed!</h3>
                  <p>We'll send you a confirmation shortly.</p>
                </motion.div>

              ) : checkout ? (
                <motion.div
                  key="checkout"
                  className="checkout-form"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <button className="checkout-back" onClick={() => setCheckout(false)}>← Back to cart</button>
                  <h3 className="checkout-section-title">Delivery Details</h3>
                  <div className="form-grid">
                    <input className="form-input" placeholder="First Name" />
                    <input className="form-input" placeholder="Last Name" />
                    <input className="form-input full" placeholder="Email Address" />
                    <input className="form-input full" placeholder="Phone Number" />
                    <input className="form-input full" placeholder="Street Address" />
                    <input className="form-input" placeholder="City" />
                    <input className="form-input" placeholder="PIN Code" />
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

                  <button className="btn-place-order" onClick={handlePlaceOrder}>
                    Place Order →
                  </button>
                </motion.div>

              ) : items.length === 0 ? (
                <motion.div
                  key="empty"
                  className="cart-empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="empty-icon">○</div>
                  <p>Your cart is empty.</p>
                  <button className="cart-shop-btn" onClick={closeCart}>Continue Shopping</button>
                </motion.div>

              ) : (
                <motion.div
                  key="items"
                  className="cart-items"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.35 }}
                >
                  {items.map((item, i) => (
                    <motion.div
                      key={`${item.product.id}-${item.size}`}
                      className="cart-item"
                      layout
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 40, height: 0 }}
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

            {/* Footer */}
            {!checkout && !orderDone && items.length > 0 && (
              <div className="cart-footer">
                <div className="cart-total">
                  <span>Total</span>
                  <span className="total-price">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
                <button className="btn-checkout" onClick={handleCheckout}>
                  Checkout →
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
