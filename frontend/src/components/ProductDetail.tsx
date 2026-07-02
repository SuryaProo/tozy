import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuthGuard } from '../hooks/useAuthGuard';
import ExplodedView from './ExplodedView';
import './ProductDetail.css';

gsap.registerPlugin(ScrollTrigger);

// ─── Placeholder images per product slug ────────────────────────────────────
const PLACEHOLDER: Record<string, string[]> = {
  'shirt-linen-white':  [
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=700&q=80',
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=700&q=80',
    'https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?w=700&q=80',
  ],
  'shirt-linen-black':  [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=700&q=80',
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=700&q=80',
    'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=700&q=80',
  ],
  'shirt-oxford-blue':  [
    'https://images.unsplash.com/photo-1594938298603-c8148c4b4c6c?w=700&q=80',
    'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=700&q=80',
    'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=700&q=80',
  ],
  'shirt-linen-olive':  [
    'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=700&q=80',
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=700&q=80',
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=700&q=80',
  ],
  'shirt-stripe-white': [
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=700&q=80',
    'https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?w=700&q=80',
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=700&q=80',
  ],
  'shirt-chambray':     [
    'https://images.unsplash.com/photo-1579338908476-3a3a1d71a706?w=700&q=80',
    'https://images.unsplash.com/photo-1594938298603-c8148c4b4c6c?w=700&q=80',
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=700&q=80',
  ],
  'shoes-leather-tan':  [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&q=80',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=700&q=80',
    'https://images.unsplash.com/photo-1605812860427-4024433a70fd?w=700&q=80',
  ],
  'shoes-leather-black':[
    'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=700&q=80',
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=700&q=80',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=700&q=80',
  ],
  'shoes-white-minimal':[
    'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=700&q=80',
    'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=700&q=80',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&q=80',
  ],
  'shoes-chelsea-brown':[
    'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=700&q=80',
    'https://images.unsplash.com/photo-1605812860427-4024433a70fd?w=700&q=80',
    'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=700&q=80',
  ],
  'shoes-loafer-navy':  [
    'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=700&q=80',
    'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=700&q=80',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&q=80',
  ],
  'shoes-desert-sand':  [
    'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=700&q=80',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&q=80',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=700&q=80',
  ],
};

// ─── Image Slider ────────────────────────────────────────────────────────────
interface SliderProps {
  images: string[];
  productId: string;
  emoji: string;
}

const ImageSlider: React.FC<SliderProps> = ({ images, productId, emoji }) => {
  const [idx, setIdx]       = useState(0);
  const [direction, setDir] = useState(1);  // 1 = next, -1 = prev
  const touchStartX = useRef<number | null>(null);

  // Merge real images with placeholder fallbacks
  const allImages = images.length > 0
    ? images
    : (PLACEHOLDER[productId] ?? [`https://via.placeholder.com/600x700/f5f5f3/999?text=${encodeURIComponent(emoji)}`]);

  useEffect(() => { setIdx(0); }, [productId]);

  const goTo = (next: number, dir = 1) => {
    setDir(dir);
    setIdx(Math.max(0, Math.min(next, allImages.length - 1)));
  };

  const prev = () => goTo(idx - 1, -1);
  const next = () => goTo(idx + 1,  1);

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) delta < 0 ? next() : prev();
    touchStartX.current = null;
  };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (d: number) => ({ x: d > 0 ? '-60%' : '60%', opacity: 0 }),
  };

  return (
    <div className="slider-wrap">
      {/* Main image area */}
      <div
        className="slider-main"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.img
            key={idx}
            src={allImages[idx]}
            alt={`Product image ${idx + 1}`}
            className="slider-img"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            draggable={false}
            onError={e => {
              (e.target as HTMLImageElement).src =
                `https://via.placeholder.com/600x700/f5f5f3/999999?text=${encodeURIComponent(emoji)}`;
            }}
          />
        </AnimatePresence>

        {/* Arrow buttons — show on desktop when multiple images */}
        {allImages.length > 1 && (
          <>
            <button
              className="slider-arrow slider-arrow-left"
              onClick={prev}
              disabled={idx === 0}
              aria-label="Previous image"
            >‹</button>
            <button
              className="slider-arrow slider-arrow-right"
              onClick={next}
              disabled={idx === allImages.length - 1}
              aria-label="Next image"
            >›</button>
          </>
        )}

        {/* Image counter badge */}
        <div className="slider-counter">{idx + 1} / {allImages.length}</div>
      </div>

      {/* Dot indicators — all screen sizes */}
      {allImages.length > 1 && (
        <div className="slider-dots">
          {allImages.map((_, i) => (
            <button
              key={i}
              className={`slider-dot ${i === idx ? 'active' : ''}`}
              onClick={() => goTo(i, i > idx ? 1 : -1)}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Thumbnail strip — desktop */}
      {allImages.length > 1 && (
        <div className="slider-thumbs">
          {allImages.map((src, i) => (
            <button
              key={i}
              className={`slider-thumb ${i === idx ? 'active' : ''}`}
              onClick={() => goTo(i, i > idx ? 1 : -1)}
              aria-label={`View image ${i + 1}`}
            >
              <img
                src={src}
                alt={`Thumbnail ${i + 1}`}
                onError={e => { (e.target as HTMLImageElement).src = ''; }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main ProductDetail ───────────────────────────────────────────────────────
interface ProductDetailProps {
  product: Product;
  onBack: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onBack }) => {
  const [selectedSize, setSelectedSize] = useState(
    product.sizes.find(s => s.available)?.label ?? ''
  );
  const [added, setAdded] = useState(false);
  const specsRef   = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  const { addItem, openCart } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const guard = useAuthGuard();
  const wishlisted = isWishlisted(product.id);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const ctx = gsap.context(() => {
      gsap.fromTo('.spec-item',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.07, ease: 'power3.out',
          scrollTrigger: { trigger: specsRef.current, start: 'top 85%' } }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, [product.id]);

  const handleAddToCart = useCallback(() => {
    if (!selectedSize) return;
    guard(() => {
      addItem(product, selectedSize);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    });
  }, [selectedSize, guard, addItem, product]);

  const handleBuyNow = useCallback(() => {
    if (!selectedSize) return;
    guard(() => { addItem(product, selectedSize); openCart(); });
  }, [selectedSize, guard, addItem, product, openCart]);

  const handleWishlist = useCallback(() => guard(() => toggle(product)), [guard, toggle, product]);

  return (
    <AnimatePresence>
      <motion.div
        ref={sectionRef}
        className="product-detail"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <button className="detail-back" onClick={onBack}>
          <span className="back-arrow">←</span> Back
        </button>

        {/*
          LAYOUT:
          Desktop: [info left] [slider right]  → side by side
          Mobile:  [slider top] [info below]   → stacked, image first
          Achieved with CSS `order` property
        */}
        <div className="detail-hero">
          {/* Info — order 2 on mobile (comes after image) */}
          <motion.div
            className="detail-info"
            initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="section-label">{product.eyebrow}</div>
            <h1 className="detail-title">{product.title}<br />{product.titleLine2}</h1>
            <p className="detail-subtitle">{product.subtitle}</p>

            <ul className="detail-features">
              {product.features.map((f, i) => (
                <motion.li key={i}
                  initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 0.2 + i * 0.05 }}
                >{f}</motion.li>
              ))}
            </ul>

            {/* Sizes */}
            <div className="sizes-block">
              <div className="section-label">Select Size</div>
              <div className="sizes-row">
                {product.sizes.map(s => (
                  <button
                    key={s.label}
                    className={`size-btn ${selectedSize === s.label ? 'active' : ''} ${!s.available ? 'unavailable' : ''}`}
                    onClick={() => s.available && setSelectedSize(s.label)}
                    disabled={!s.available}
                    aria-pressed={selectedSize === s.label}
                  >
                    {s.label}
                    {!s.available && <div className="size-cross" />}
                  </button>
                ))}
              </div>
            </div>

            {product.price && (
              <div className="detail-price">₹{product.price.toLocaleString('en-IN')}</div>
            )}

            <div className="detail-actions">
              <motion.button
                className={`btn-primary ${added ? 'added' : ''}`}
                onClick={handleAddToCart}
                whileTap={{ scale: 0.97 }}
                disabled={!selectedSize}
              >
                {added ? '✓ Added to Cart' : 'Add to Cart'}
              </motion.button>
              <button className="btn-secondary" onClick={handleBuyNow} disabled={!selectedSize}>
                Buy Now
              </button>
              <motion.button
                className={`btn-wishlist ${wishlisted ? 'wishlisted' : ''}`}
                onClick={handleWishlist}
                whileTap={{ scale: 0.85 }}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                {wishlisted ? '♥' : '♡'}
              </motion.button>
            </div>
            <p className="auth-nudge">🔒 Sign in to save wishlist &amp; track orders</p>
          </motion.div>

          {/* Slider — order 1 on mobile (image first) */}
          <motion.div
            className="detail-visual"
            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <ImageSlider
              images={product.images ?? []}
              productId={product.id}
              emoji={product.emoji}
            />
          </motion.div>
        </div>

        {/* Specs */}
        <div className="specs-section" ref={specsRef}>
          <div className="section-label">Technical Specifications</div>
          <div className="specs-grid">
            {product.specs.map((spec, i) => (
              <div className="spec-item" key={i}>
                <div className="spec-label">{spec.label}</div>
                <div className="spec-value">{spec.value}</div>
                <div className="spec-detail">{spec.detail}</div>
              </div>
            ))}
          </div>
        </div>

        <ExplodedView
          parts={product.parts}
          title={product.title}
          titleLine2={product.category === 'Shoes' ? 'Every sole.' : 'Every stitch.'}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default ProductDetail;
