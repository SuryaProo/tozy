import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import ExplodedView from './ExplodedView';
import './ProductDetail.css';

gsap.registerPlugin(ScrollTrigger);

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onBack }) => {
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes.find(s => s.available)?.label ?? ''
  );
  const [added, setAdded] = useState(false);
  const emojiRef   = useRef<HTMLDivElement>(null);
  const canvasRef  = useRef<HTMLDivElement>(null);
  const specsRef   = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { addItem, openCart } = useCart();

  const handleCanvasMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    if (emojiRef.current)
      emojiRef.current.style.transform = `rotateY(${x*28}deg) rotateX(${-y*20}deg) scale(1.05)`;
  };
  const handleCanvasLeave = () => {
    if (emojiRef.current)
      emojiRef.current.style.transform = 'rotateY(0deg) rotateX(0deg) scale(1)';
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const ctx = gsap.context(() => {
      gsap.fromTo('.spec-item',
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out',
          scrollTrigger: { trigger: specsRef.current, start: 'top 82%' } }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, [product.id]);

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addItem(product, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

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
          <span className="back-arrow">←</span> Back to Collection
        </button>

        <div className="detail-hero">
          {/* Info */}
          <motion.div className="detail-info"
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="section-label">{product.eyebrow}</div>
            <h1 className="detail-title">{product.title}<br />{product.titleLine2}</h1>
            <p className="detail-subtitle">{product.subtitle}</p>

            <ul className="detail-features">
              {product.features.map((f, i) => (
                <motion.li key={i}
                  initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
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
              <button className="btn-secondary" onClick={() => { handleAddToCart(); openCart(); }}>
                Buy Now
              </button>
            </div>
          </motion.div>

          {/* 3D Visual */}
          <motion.div className="detail-visual"
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="canvas-3d" ref={canvasRef}
              onMouseMove={handleCanvasMove} onMouseLeave={handleCanvasLeave}
            >
              {/* Replace with <img src={product.images?.[0]} className="product-3d-image" /> once images added */}
              <div ref={emojiRef} className="product-3d-render" style={{ transition: 'transform 0.12s ease' }}>
                {product.emoji}
              </div>
              <div className="canvas-label">
                {product.id === 'shirt' ? 'Premium Linen' : 'Full-Grain Leather'}
              </div>
              <div className="canvas-hint">
                <span className="hint-dot" /> Move to interact
              </div>
            </div>
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
          titleLine2={product.id === 'shirt' ? 'Every stitch.' : 'Every sole.'}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default ProductDetail;
