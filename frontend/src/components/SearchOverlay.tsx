import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearch } from '../context/SearchContext';
import { Product } from '../types';
import './SearchOverlay.css';

interface SearchOverlayProps {
  onSelectProduct: (id: Product['id']) => void;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ onSelectProduct }) => {
  const { query, results, isOpen, setQuery, closeSearch, clearSearch } = useSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  // Lock scroll + auto-focus input
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 80);
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeSearch(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeSearch]);

  const handleSelect = (id: Product['id']) => {
    closeSearch();
    onSelectProduct(id);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="search-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeSearch}
          />

          {/* Panel */}
          <motion.div
            className="search-panel"
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Input row */}
            <div className="search-input-row">
              <span className="search-icon">○</span>
              <input
                ref={inputRef}
                className="search-input"
                type="text"
                placeholder="Search shirts, shoes, linen…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                aria-label="Search products"
              />
              {query && (
                <button className="search-clear" onClick={clearSearch} aria-label="Clear search">✕</button>
              )}
              <button className="search-close-btn" onClick={closeSearch} aria-label="Close search">
                <span>ESC</span>
              </button>
            </div>

            {/* Results */}
            <div className="search-results">
              {!query && (
                <div className="search-hint">
                  <p className="search-hint-title">What are you looking for?</p>
                  <div className="search-suggestions">
                    {['Linen shirt', 'Premium shoes', 'Relaxed fit', 'Leather'].map(s => (
                      <button key={s} className="search-suggestion" onClick={() => setQuery(s)}>{s}</button>
                    ))}
                  </div>
                </div>
              )}

              {query && results.length === 0 && (
                <div className="search-empty">
                  <p>No results for "<strong>{query}</strong>"</p>
                  <span>Try: shirt, shoes, linen, leather</span>
                </div>
              )}

              {results.length > 0 && (
                <div className="search-result-list">
                  <div className="search-result-label">{results.length} result{results.length > 1 ? 's' : ''}</div>
                  {results.map((product, i) => (
                    <motion.button
                      key={product.id}
                      className="search-result-item"
                      onClick={() => handleSelect(product.id)}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <span className="result-emoji">{product.emoji}</span>
                      <div className="result-info">
                        <span className="result-name">{product.title} {product.titleLine2}</span>
                        <span className="result-cat">{product.category}</span>
                      </div>
                      {product.price && (
                        <span className="result-price">₹{product.price.toLocaleString('en-IN')}</span>
                      )}
                      <span className="result-arrow">→</span>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SearchOverlay;
