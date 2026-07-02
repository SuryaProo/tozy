import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CartProvider } from './context/CartContext';
import Cursor from './components/Cursor';
import Landing from './components/Landing';
import Navbar, { Page } from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import ProductDetail from './components/ProductDetail';
import Footer from './components/Footer';
import CraftPage from './pages/CraftPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import { PRODUCTS } from './data/products';
import { ProductCategory } from './types';
import './styles/globals.css';
import './App.css';

const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -16 },
};
const pageTransition = { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const };

const AppInner: React.FC = () => {
  const [landed, setLanded]             = useState(false);
  const [activePage, setActivePage]     = useState<Page>('home');
  const [activeProduct, setActiveProduct] = useState<ProductCategory | null>(null);
  const [heroKey, setHeroKey]           = useState(0);

  const selectedProduct = PRODUCTS.find(p => p.id === activeProduct) ?? null;

  const goHome = useCallback(() => {
    setActiveProduct(null);
    setActivePage('home');
    setHeroKey(k => k + 1);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const handleNavClick = useCallback((page: Page) => {
    setActiveProduct(null);
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const openProduct = useCallback((id: ProductCategory) => {
    setActiveProduct(id);
    setActivePage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Determine the page key for AnimatePresence
  const pageKey = activeProduct
    ? `product-${activeProduct}`
    : activePage;

  return (
    <>
      <Cursor />
      <CartDrawer />

      <AnimatePresence>
        {!landed && <Landing key="landing" onEnter={() => setLanded(true)} />}
      </AnimatePresence>

      {landed && (
        <div className="site">
          <Navbar
            activeProduct={activeProduct}
            activePage={activePage}
            onLogoClick={goHome}
            onNavClick={handleNavClick}
          />

          <AnimatePresence mode="wait">
            {/* ── HOME ── */}
            {pageKey === 'home' && (
              <motion.main key={`home-${heroKey}`}
                variants={pageVariants} initial="initial" animate="animate" exit="exit"
                transition={pageTransition}
              >
                <Hero animKey={heroKey} />
                <section className="products-section" id="products">
                  <motion.div className="products-intro"
                    initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="section-label-center">The Collection</div>
                    <h2>Two worlds.<br />One vision.</h2>
                    <p>Premium wearables, designed to outlast trends.</p>
                  </motion.div>
                  <div className="cards-grid">
                    {PRODUCTS.map((product, i) => (
                      <ProductCard key={product.id} product={product} onSelect={openProduct} delay={i * 0.15} />
                    ))}
                  </div>
                </section>
                <Footer onNavClick={handleNavClick} />
              </motion.main>
            )}

            {/* ── PRODUCT DETAIL ── */}
            {activeProduct && selectedProduct && (
              <motion.main key={`product-${activeProduct}`}
                variants={pageVariants} initial="initial" animate="animate" exit="exit"
                transition={pageTransition}
              >
                <ProductDetail product={selectedProduct} onBack={goHome} />
                <Footer onNavClick={handleNavClick} />
              </motion.main>
            )}

            {/* ── CRAFT ── */}
            {pageKey === 'craft' && (
              <motion.main key="craft"
                variants={pageVariants} initial="initial" animate="animate" exit="exit"
                transition={pageTransition}
              >
                <CraftPage />
                <Footer onNavClick={handleNavClick} />
              </motion.main>
            )}

            {/* ── ABOUT ── */}
            {pageKey === 'about' && (
              <motion.main key="about"
                variants={pageVariants} initial="initial" animate="animate" exit="exit"
                transition={pageTransition}
              >
                <AboutPage />
                <Footer onNavClick={handleNavClick} />
              </motion.main>
            )}

            {/* ── CONTACT ── */}
            {pageKey === 'contact' && (
              <motion.main key="contact"
                variants={pageVariants} initial="initial" animate="animate" exit="exit"
                transition={pageTransition}
              >
                <ContactPage />
                <Footer onNavClick={handleNavClick} />
              </motion.main>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );
};

const App: React.FC = () => (
  <CartProvider>
    <AppInner />
  </CartProvider>
);

export default App;
