import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './OfferSlider.css';

// ── Default slides — change text/colors here or make it admin-editable later
const DEFAULT_SLIDES = [
  {
    id: 1,
    tag: 'Limited Time',
    headline: 'FLAT 20% OFF',
    subline: 'On all Premium Linen Shirts',
    cta: 'Shop Shirts',
    target: 'shirts',
    bg: '#C41E3A',
    color: '#fff',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80',
  },
  {
    id: 2,
    tag: 'New Arrivals',
    headline: 'CRAFT YOUR SOLE',
    subline: 'Artisanal leather shoes — hand-lasted in Agra',
    cta: 'Shop Shoes',
    target: 'shoes',
    bg: '#0a0a0a',
    color: '#fff',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
  },
  {
    id: 3,
    tag: 'Free Shipping',
    headline: 'ORDERS ABOVE ₹2,999',
    subline: 'Pan India delivery · Easy 30-day returns',
    cta: 'Shop Now',
    target: 'shirts',
    bg: '#1d4ed8',
    color: '#fff',
    image: 'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=800&q=80',
  },
];

interface OfferSliderProps {
  onCategoryClick: (cat: 'shirts' | 'shoes') => void;
}

const OfferSlider: React.FC<OfferSliderProps> = ({ onCategoryClick }) => {
  const [current, setCurrent] = useState(0);
  const [direction, setDir]   = useState(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStart = useRef<number | null>(null);

  const slides = DEFAULT_SLIDES;

  const goTo = (idx: number, dir = 1) => {
    setDir(dir);
    setCurrent(idx);
  };

  const next = () => goTo((current + 1) % slides.length,  1);
  const prev = () => goTo((current - 1 + slides.length) % slides.length, -1);

  // Auto-advance every 4s
  useEffect(() => {
    timerRef.current = setTimeout(next, 4000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current]);

  const onTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd   = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(delta) > 50) delta < 0 ? next() : prev();
    touchStart.current = null;
  };

  const slide = slides[current];

  const variants = {
    enter:  (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (d: number) => ({ x: d > 0 ? '-30%' : '30%', opacity: 0 }),
  };

  return (
    <div className="offer-slider" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <AnimatePresence custom={direction} mode="popLayout" initial={false}>
        <motion.div
          key={slide.id}
          className="offer-slide"
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{ background: slide.bg, color: slide.color }}
        >
          {/* Background image */}
          <div className="offer-slide-bg">
            <img src={slide.image} alt="" aria-hidden="true"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <div className="offer-slide-overlay" style={{ background: slide.bg }} />
          </div>

          {/* Content */}
          <div className="offer-slide-content">
            <motion.span
              className="offer-tag"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              {slide.tag}
            </motion.span>
            <motion.h2
              className="offer-headline"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
            >
              {slide.headline}
            </motion.h2>
            <motion.p
              className="offer-subline"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {slide.subline}
            </motion.p>
            <motion.button
              className="offer-cta"
              onClick={() => onCategoryClick(slide.target as 'shirts' | 'shoes')}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              {slide.cta} →
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Arrows */}
      <button className="offer-arrow offer-arrow-left"  onClick={prev} aria-label="Previous">‹</button>
      <button className="offer-arrow offer-arrow-right" onClick={next} aria-label="Next">›</button>

      {/* Dots */}
      <div className="offer-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`offer-dot ${i === current ? 'active' : ''}`}
            onClick={() => goTo(i, i > current ? 1 : -1)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="offer-progress">
        <motion.div
          className="offer-progress-bar"
          key={current}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 4, ease: 'linear' }}
        />
      </div>
    </div>
  );
};

export default OfferSlider;
