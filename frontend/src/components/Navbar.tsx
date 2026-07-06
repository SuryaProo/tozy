import React, { useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useSearch } from '../context/SearchContext';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export type Page = 'home' | 'craft' | 'about' | 'contact' | 'orders';

interface NavbarProps {
  activeProduct: string | null;
  activePage: Page;
  activeCategory?: string | null;
  onLogoClick: () => void;
  onNavClick: (page: Page) => void;
  onBackToCategory?: () => void;
}

const NAV_LINKS: { label: string; page: Page }[] = [
  { label: 'Collection', page: 'home' },
  { label: 'Craft',      page: 'craft' },
  { label: 'About',      page: 'about' },
  { label: 'Contact',    page: 'contact' },
];

// Detect if current scroll position is over a dark section
const isDarkSection = (): boolean => {
  const darkEls = document.querySelectorAll<HTMLElement>(
    '.hero-sticky, .ss-sticky, .offer-slider, .hero-wrap'
  );
  for (const el of Array.from(darkEls)) {
    const rect = el.getBoundingClientRect();
    // If the element covers the top 80px (where navbar is)
    if (rect.top <= 0 && rect.bottom >= 60) return true;
  }
  return false;
};

const Navbar: React.FC<NavbarProps> = ({ activeProduct, activePage, activeCategory, onLogoClick, onNavClick, onBackToCategory }) => {
  const navRef = useRef<HTMLElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled]       = useState(false);
  const [dark, setDark]               = useState(true);   // true = white text
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { totalItems, openCart }            = useCart();
  const { items: wlItems, openWishlist }    = useWishlist();
  const { openSearch }                      = useSearch();
  const { user, openLogin, logout }         = useAuth();

  useEffect(() => {
    gsap.fromTo(navRef.current,
      { y: -80, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', delay: 0.3 }
    );

    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      setDark(isDarkSection());
    };

    // Initial check
    setDark(isDarkSection());

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!userMenuOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node))
        setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [userMenuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setUserMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleNav = (page: Page) => { onNavClick(page); setMobileOpen(false); };

  return (
    <>
      <nav
        ref={navRef}
        className={`navbar ${scrolled ? 'scrolled' : 'transparent'} ${dark ? 'nav-dark' : 'nav-light'}`}
      >
        {/* Logo */}
        <button className="nav-logo" onClick={onLogoClick} aria-label="TozYcozY home">
          <span className="logo-tozy">TOZY</span><span className="logo-cozy">COZY</span>
        </button>

        {/* Desktop links OR Breadcrumb — never both */}
        {(activeCategory || activeProduct) ? (
          <div className="nav-breadcrumb-trail">
            <button className="nav-bc-home" onClick={onLogoClick}>Home</button>
            {activeCategory && (
              <>
                <span className="nav-bc-sep">›</span>
                <button className="nav-bc-item" onClick={activeProduct ? onBackToCategory : onLogoClick}>
                  {activeCategory === 'shirts' ? 'Shirts' : 'Shoes'}
                </button>
              </>
            )}
            {activeProduct && (
              <>
                <span className="nav-bc-sep">›</span>
                <span className="nav-bc-current">
                  {activeProduct.includes('shoe') ? 'Shoe Detail' : 'Shirt Detail'}
                </span>
              </>
            )}
          </div>
        ) : (
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
        )}

        {/* Right icons */}
        <div className="nav-actions">
          <button className="nav-icon-btn" onClick={openSearch} aria-label="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/>
            </svg>
          </button>

          {/* Wishlist */}
          <button className="nav-icon-btn" onClick={openWishlist} aria-label="Wishlist" style={{ position: 'relative' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            {wlItems.length > 0 && <span className="nav-badge">{wlItems.length}</span>}
          </button>

          {/* Auth */}
          {user ? (
            <div className="nav-user-menu" ref={userMenuRef}>
              <button
                className="nav-icon-btn nav-avatar"
                title={user.name}
                aria-label="Account menu"
                aria-expanded={userMenuOpen}
                onClick={() => setUserMenuOpen(o => !o)}
              >
                {user.name.charAt(0).toUpperCase()}
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    className="nav-user-dropdown"
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="dropdown-name">{user.name}</div>
                    <div className="dropdown-email">{user.email}</div>
                    <hr className="dropdown-divider" />
                    <button className="dropdown-item" onClick={() => { setUserMenuOpen(false); onNavClick('orders'); }}>
                      Order History
                    </button>
                    <button className="dropdown-item dropdown-item-danger" onClick={() => { setUserMenuOpen(false); logout(); }}>
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button className="nav-icon-btn" onClick={openLogin} aria-label="Sign in">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </button>
          )}

          {/* Cart */}
          <button className="nav-cart" onClick={openCart} aria-label="Cart" style={{ position: 'relative' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {totalItems > 0 && <span className="nav-badge">{totalItems}</span>}
          </button>

          {/* Hamburger */}
          <button className="nav-hamburger" onClick={() => setMobileOpen(o => !o)} aria-label="Menu">
            <span style={{ transform: mobileOpen ? 'rotate(45deg) translateY(6.5px)' : '' }} />
            <span style={{ opacity: mobileOpen ? 0 : 1 }} />
            <span style={{ transform: mobileOpen ? 'rotate(-45deg) translateY(-6.5px)' : '' }} />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="nav-mobile-menu open"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {NAV_LINKS.map((link, i) => (
              <motion.button
                key={link.page}
                className={`nav-mobile-link ${activePage === link.page ? 'active' : ''}`}
                onClick={() => handleNav(link.page)}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                {link.label}
              </motion.button>
            ))}
            <div className="mobile-icon-row">
              <button onClick={() => { openSearch(); setMobileOpen(false); }}>Search</button>
              <button onClick={() => { openWishlist(); setMobileOpen(false); }}>
                Wishlist {wlItems.length > 0 && `(${wlItems.length})`}
              </button>
              {user && <button onClick={() => { onNavClick('orders'); setMobileOpen(false); }}>Order History</button>}
              <button onClick={() => { user ? logout() : openLogin(); setMobileOpen(false); }}>
                {user ? `Hi, ${user.name.split(' ')[0]} · Sign out` : 'Sign in'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
