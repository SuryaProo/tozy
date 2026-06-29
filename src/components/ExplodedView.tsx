import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ExplodedPart } from '../types';
import './ExplodedView.css';

interface ExplodedViewProps {
  parts: ExplodedPart[];
  title: string;
  titleLine2: string;
}

const ExplodedView: React.FC<ExplodedViewProps> = ({ parts, title, titleLine2 }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="exploded-section" ref={containerRef}>
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
        <p className="exploded-sub">Hover any component to discover its story.</p>
      </motion.div>

      <div className="exploded-grid">
        {parts.map((part, i) => (
          <motion.div
            key={part.id}
            className="part-cell"
            style={{ gridColumn: part.gridCol, gridRow: part.gridRow }}
            initial={{ opacity: 0, scale: 0.7 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{
              duration: 0.55,
              ease: [0.16, 1, 0.3, 1],
              delay: i * 0.035,
            }}
            whileHover={{ scale: 1.1, y: -6, zIndex: 2 }}
          >
            <div className="part-tooltip">{part.tooltip}</div>
            <span className="part-icon" aria-hidden="true">{part.icon}</span>
            <div className="part-name">{part.name}</div>
            <div className="part-detail">{part.detail}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ExplodedView;
