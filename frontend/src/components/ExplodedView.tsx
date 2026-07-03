import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExplodedPart } from '../types';
import './ExplodedView.css';

interface ExplodedViewProps {
  parts: ExplodedPart[];
  title: string;
  titleLine2: string;
}

const ExplodedView: React.FC<ExplodedViewProps> = ({ parts, title, titleLine2 }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [touchActiveId, setTouchActiveId] = useState<string | null>(null);

  // How many columns: ≤6 parts → 3 cols, ≤9 → 3 cols, else 4 cols
  const cols = parts.length <= 6 ? 3 : 4;

  // Active id works for both hover (desktop) and tap (mobile)
  const activeId = hoveredId ?? touchActiveId;

  return (
    <div className="exploded-section">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="section-label">Anatomy of Craft</div>
        <h2 className="exploded-title">
          Every part.<br />{titleLine2}
        </h2>
        <p className="exploded-sub">
          {window.matchMedia('(hover: none)').matches
            ? 'Tap any component to discover its story.'
            : 'Hover any component to discover its story.'}
        </p>
      </motion.div>

      <div
        className="exploded-grid"
        style={{ '--cols': cols } as React.CSSProperties}
      >
        {parts.map((part, i) => {
          const isActive = activeId === part.id;
          return (
            <motion.div
              key={part.id}
              className={`part-cell ${isActive ? 'active' : ''}`}
              initial={{ opacity: 0, scale: 0.75 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.05 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: i * 0.04 }}
              onMouseEnter={() => setHoveredId(part.id)}
              onMouseLeave={() => setHoveredId(null)}
              onTouchStart={() => setTouchActiveId(prev => prev === part.id ? null : part.id)}
              role="button"
              tabIndex={0}
              aria-label={`${part.name}: ${part.tooltip}`}
            >
              {/* Tooltip — shows on hover desktop, tap mobile */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    className="part-tooltip"
                    initial={{ opacity: 0, y: 6, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.9 }}
                    transition={{ duration: 0.18 }}
                  >
                    {part.tooltip}
                    <div className="part-tooltip-arrow" />
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.span
                className="part-icon"
                animate={{ scale: isActive ? 1.2 : 1, y: isActive ? -3 : 0 }}
                transition={{ duration: 0.2 }}
                aria-hidden="true"
              >
                {part.icon}
              </motion.span>
              <div className="part-name">{part.name}</div>
              <div className="part-detail">{part.detail}</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ExplodedView;
