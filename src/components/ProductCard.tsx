import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Product } from '../types';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
  onSelect: (id: Product['id']) => void;
  delay?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect, delay = 0 }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(700px) rotateY(${x * 12}deg) rotateX(${-y * 9}deg) scale(1.02)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(700px) rotateY(0deg) rotateX(0deg) scale(1)';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }}
    >
      <div
        ref={cardRef}
        className="product-card"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => onSelect(product.id)}
        role="button"
        tabIndex={0}
        aria-label={`Explore ${product.title}`}
        onKeyDown={e => e.key === 'Enter' && onSelect(product.id)}
        style={{ transition: 'transform 0.15s var(--ease-out), box-shadow 0.4s var(--ease-out)' }}
      >
        <div className="card-glow" />
        <span className="card-emoji" aria-hidden="true">{product.emoji}</span>
        <div className="card-category">{product.category}</div>
        <h3 className="card-title">{product.title} {product.titleLine2}</h3>
        <p className="card-sub">{product.cardDesc}</p>

        {product.price && (
          <div className="card-price">₹{product.price.toLocaleString('en-IN')}</div>
        )}

        <div className="card-cta">
          <span>Explore</span>
          <span className="cta-arrow">→</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
