import React, { useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductCategory } from '../types';
import { useCart } from '../context/CartContext';
import './Navbar.css';

export type Page = 'home' | 'craft' | 'about' | 'contact';

interface NavbarProps {
  activeProduct: ProductCategory | null;
  activePage: Page;
  onLogoClick: () => void;
  onNavClick: (page: Page) => void;
}

const NAV_LINKS: { label: string; page: Page }[] = [
  { label: 'Collection', page: 'home' },
  { label: 'Craft',      page: 'craft' },
  { label: 'About',      page: 'about' },
  { label: 'Contact',    page: 'contact' },
];

const Navbar: React.FC<NavbarProps> = ({ activeProduct, activePage, onLogoClick, onNavClick }) => {
  const navRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems, openCart }  = useCart();

  useEffect(() => {
    gsap.fromTo(navRef.current,
      { y: -80, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', delay: 0.3 }
    );
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (page: Page) => {
    onNavClick(page);
    setMobileOpen(false);
  };

  return (
    <>
      <nav ref={navRef} className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <button className="nav-logo" onClick={onLogoClick} aria-label="TozYcozY home">
          <span className="logo-tozy">TOZY</span>
          <span className="logo-cozy">COZY</span>
        </button>

        <div className="nav-links">
          {NAV_LINKS.map(link => (
            <button
              key={link.page}
              className={`nav-link ${activePage === link.page ? 'active' : ''}`}
              onClick={() => handleNav(link.page)}
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="nav-actions">
          {activeProduct && (
            <span className="nav-breadcrumb">/ {activeProduct === 'shirt' ? 'Shirts' : 'Shoes'}</span>
          )}
          <button className="nav-cart" onClick={openCart} aria-label="Open cart">
            <span className="nav-cart-icon">○</span>
            <span className="nav-cart-label">Cart</span>
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </button>
          <button
            className="nav-hamburger"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <span style={{ transform: mobileOpen ? 'rotate(45deg) translateY(6.5px)' : '' }} />
            <span style={{ opacity: mobileOpen ? 0 : 1 }} />
            <span style={{ transform: mobileOpen ? 'rotate(-45deg) translateY(-6.5px)' : '' }} />
          </button>
        </div>
      </nav>

      {/* Mobile full-screen menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="nav-mobile-menu open"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {NAV_LINKS.map((link, i) => (
              <motion.button
                key={link.page}
                className={`nav-mobile-link ${activePage === link.page ? 'active' : ''}`}
                onClick={() => handleNav(link.page)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                {link.label}
              </motion.button>
            ))}
            <motion.button
              className="nav-mobile-link"
              onClick={() => { openCart(); setMobileOpen(false); }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{ color: 'var(--red)' }}
            >
              Cart {totalItems > 0 && `(${totalItems})`}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
