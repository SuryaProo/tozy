import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './VerifySuccess.css';

interface VerifySuccessProps {
  show: boolean;
  onDone: () => void;
}

const VerifySuccess: React.FC<VerifySuccessProps> = ({ show, onDone }) => {
  useEffect(() => {
    if (show) {
      const t = setTimeout(onDone, 2500);
      return () => clearTimeout(t);
    }
  }, [show, onDone]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="vs-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="vs-card"
            initial={{ opacity: 0, scale: 0.4, rotateY: -90, y: 60 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, rotateY: 90, y: -40 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            {/* Confetti dots */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="vs-confetti"
                style={{
                  '--angle': `${i * 30}deg`,
                  '--color': ['#C41E3A','#fff','#f59e0b','#10b981','#3b82f6'][i % 5],
                } as React.CSSProperties}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: [0, 1.5, 0], opacity: [1, 1, 0], x: `calc(cos(${i * 30}deg) * 80px)`, y: `calc(sin(${i * 30}deg) * 80px)` }}
                transition={{ duration: 0.8, delay: 0.3 + i * 0.04 }}
              />
            ))}

            {/* Checkmark circle */}
            <motion.div
              className="vs-check"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.15 }}
            >
              <motion.svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <motion.path
                  d="M8 18L15 25L28 11"
                  stroke="#fff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4, delay: 0.35 }}
                />
              </motion.svg>
            </motion.div>

            {/* Text */}
            <motion.h2
              className="vs-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Email Verified!
            </motion.h2>

            <motion.p
              className="vs-sub"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.52 }}
            >
              Happy Shopping! 🛍️
            </motion.p>

            {/* Progress bar */}
            <motion.div className="vs-progress-wrap">
              <motion.div
                className="vs-progress-bar"
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 2.3, ease: 'linear', delay: 0.2 }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VerifySuccess;
