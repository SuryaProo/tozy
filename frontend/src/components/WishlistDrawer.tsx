import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuthGuard } from '../hooks/useAuthGuard';
import { Product } from '../types';
import './WishlistDrawer.css';

interface WishlistDrawerProps {
  onSelectProduct: (id: Product['id']) => void;
}

const WishlistDrawer: React.FC<WishlistDrawerProps> = ({ onSelectProduct }) => {
  const { items, isOpen, closeWishlist, remove } = useWishlist();
  const { addItem } = useCart();
  const guard = useAuthGuard();

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleMoveToCart = (product: Product) => {
    guard(() => {
      addItem(product, product.sizes.find(s => s.available)?.label ?? '');
      remove(product.id);
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="drawer-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeWishlist}
          />
          <motion.div
            className="wishlist-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 35 }}
          >
            <div className="drawer-header">
              <div>
                <h2 className="drawer-title">Wishlist</h2>
                <span className="drawer-count">{items.length} saved {items.length === 1 ? 'item' : 'items'}</span>
              </div>
              <button className="drawer-close" onClick={closeWishlist} aria-label="Close wishlist">✕</button>
            </div>

            <div className="wishlist-body">
              <AnimatePresence>
                {items.length === 0 ? (
                  <motion.div
                    className="wishlist-empty"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="empty-heart">♡</div>
                    <p>Nothing saved yet.</p>
                    <button className="wl-shop-btn" onClick={closeWishlist}>Explore Collection</button>
                  </motion.div>
                ) : (
                  items.map((product, i) => (
                    <motion.div
                      key={product.id}
                      className="wishlist-item"
                      layout
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 40, height: 0, marginBottom: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <button
                        className="wl-item-main"
                        onClick={() => { closeWishlist(); onSelectProduct(product.id); }}
                      >
                        <span className="wl-emoji">{product.emoji}</span>
                        <div className="wl-info">
                          <span className="wl-name">{product.title} {product.titleLine2}</span>
                          <span className="wl-cat">{product.category}</span>
                          {product.price && (
                            <span className="wl-price">₹{product.price.toLocaleString('en-IN')}</span>
                          )}
                        </div>
                      </button>
                      <div className="wl-actions">
                        <button className="wl-cart-btn" onClick={() => handleMoveToCart(product)}>
                          Add to Cart
                        </button>
                        <button className="wl-remove-btn" onClick={() => remove(product.id)} aria-label="Remove from wishlist">✕</button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WishlistDrawer;
