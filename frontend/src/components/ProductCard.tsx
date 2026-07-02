import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import './ProductCard.css';

// Frontpage category cards — NO wishlist button here, clean simple cards
interface CategoryCardProps {
  id: 'shirts' | 'shoes';
  label: string;
  description: string;
  emoji: string;
  productCount: number;
  onSelect: (id: 'shirts' | 'shoes') => void;
  delay?: number;
}

const HERO_IMAGES: Record<string, string> = {
  shirts: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80',
  shoes:  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
};

const CategoryCard: React.FC<CategoryCardProps> = ({ id, label, description, emoji, productCount, onSelect, delay = 0 }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 6}deg) scale(1.02)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current)
      cardRef.current.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }}
      style={{ flex: 1 }}
    >
      <div
        ref={cardRef}
        className="category-card"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => onSelect(id)}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && onSelect(id)}
        style={{ transition: 'transform 0.2s ease, box-shadow 0.4s ease' }}
      >
        {/* Background image */}
        <div className="cat-card-bg">
          <img
            src={HERO_IMAGES[id]}
            alt={label}
            className="cat-card-bg-img"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="cat-card-overlay" />
        </div>

        {/* Content */}
        <div className="cat-card-content">
          <div className="cat-card-eyebrow">{productCount} Products</div>
          <h2 className="cat-card-label">{label}</h2>
          <p className="cat-card-desc">{description}</p>
          <div className="cat-card-cta">
            <span>Shop {label}</span>
            <span className="cat-cta-arrow">→</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CategoryCard;
