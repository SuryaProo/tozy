import React, { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SearchProvider } from './context/SearchContext';
import { OrderProvider } from './context/OrderContext';
import Cursor from './components/Cursor';
import Landing from './components/Landing';
import Navbar, { Page } from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import AuthModal from './components/AuthModal';
import SearchOverlay from './components/SearchOverlay';
import Hero from './components/Hero';
import CategoryCard from './components/ProductCard';
import ProductDetail from './components/ProductDetail';
import Footer from './components/Footer';
import CraftPage from './pages/CraftPage';
import AboutPage from './pages/AboutPage';
import AdminPortal from './pages/AdminPortal';
import ContactPage from './pages/ContactPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import CategoryPage from './pages/CategoryPage';
import { useProducts } from './hooks/useProducts';
import { CATEGORY_GROUPS } from './data/products';
import './styles/globals.css';
import './App.css';

const pv = { initial:{opacity:0,y:24}, animate:{opacity:1,y:0}, exit:{opacity:0,y:-16} };
const pt = { duration:0.45, ease:[0.16,1,0.3,1] as const };

type ActiveCategory = 'shirts' | 'shoes' | null;

const AppInner: React.FC<{
  products: ReturnType<typeof useProducts>['products'];
  productsLoading: boolean;
  usingFallback: boolean;
}> = ({ products, productsLoading, usingFallback }) => {
  const [landed, setLanded]                   = useState(false);
  const [activePage, setActivePage]           = useState<Page>('home');
  const [activeCategory, setActiveCategory]   = useState<ActiveCategory>(null);
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [heroKey, setHeroKey]                 = useState(0);
  const [showAdmin, setShowAdmin]             = useState(window.location.hash === '#admin');

  const { user, openLogin } = useAuth();

  // Allow navigating to admin via URL hash
  useEffect(() => {
    const onHash = () => setShowAdmin(window.location.hash === '#admin');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const goHome = useCallback(() => {
    setActiveProductId(null);
    setActiveCategory(null);
    setActivePage('home');
    setHeroKey(k => k + 1);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const openCategory = useCallback((cat: ActiveCategory) => {
    setActiveCategory(cat);
    setActiveProductId(null);
    setActivePage('home');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const openProduct = useCallback((id: string) => {
    setActiveProductId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const backToCategory = useCallback(() => {
    setActiveProductId(null);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const handleNavClick = useCallback((page: Page) => {
    setActiveProductId(null);
    setActiveCategory(null);
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    if (activePage === 'orders' && !user) {
      setActivePage('home');
      openLogin();
    }
  }, [activePage, user, openLogin]);

  // Filtered product lists per category
  const shirtProducts = products.filter(p => p.category === 'Shirts');
  const shoeProducts  = products.filter(p => p.category === 'Shoes');
  const selectedProduct = products.find(p => p.id === activeProductId) ?? null;

  // pageKey drives AnimatePresence transitions
  const pageKey = activeProductId
    ? `product-${activeProductId}`
    : activeCategory
      ? `cat-${activeCategory}`
      : activePage;

  // Admin portal — renders as full screen takeover
  if (showAdmin) {
    return (
      <AdminPortal onExit={() => {
        setShowAdmin(false);
        window.location.hash = '';
      }} />
    );
  }

  return (
    <>
      <Cursor />
      <CartDrawer />
      <WishlistDrawer onSelectProduct={openProduct} />
      <AuthModal />
      <SearchOverlay onSelectProduct={openProduct} />

      <AnimatePresence>
        {!landed && <Landing key="landing" onEnter={() => setLanded(true)} />}
      </AnimatePresence>

      {landed && (
        <div className="site">
          {usingFallback && process.env.NODE_ENV !== 'production' && (
            <div className="dev-banner">
              ⚠ Showing local sample data. Add your MongoDB URI and run <code>npm run seed</code> in /backend.
            </div>
          )}

          <Navbar
            activeProduct={activeProductId}
            activePage={activePage}
            onLogoClick={goHome}
            onNavClick={handleNavClick}
          />

          <AnimatePresence mode="wait">
            {/* ── HOME ── */}
            {pageKey === 'home' && (
              <motion.main key={`home-${heroKey}`} variants={pv} initial="initial" animate="animate" exit="exit" transition={pt}>
                <Hero animKey={heroKey} />

                <section className="products-section" id="products">
                  <motion.div className="products-intro"
                    initial={{ opacity:0, y:32 }} animate={{ opacity:1, y:0 }}
                    transition={{ duration:0.8, delay:0.2, ease:[0.16,1,0.3,1] }}
                  >
                    <div className="section-label-center">The Collection</div>
                    <h2>Shirts.<br />Shoes.</h2>
                    <p>Two categories. One standard — obsessive craftsmanship.</p>
                  </motion.div>

                  {productsLoading ? (
                    <div className="products-loading">Loading collection…</div>
                  ) : (
                    <div className="cards-grid">
                      {CATEGORY_GROUPS.map((group, i) => (
                        <CategoryCard
                          key={group.id}
                          id={group.id as 'shirts' | 'shoes'}
                          label={group.label}
                          description={group.description}
                          emoji={group.emoji}
                          productCount={group.id === 'shirts' ? shirtProducts.length : shoeProducts.length}
                          onSelect={openCategory}
                          delay={i * 0.15}
                        />
                      ))}
                    </div>
                  )}
                </section>

                {/* Featured products strip */}
                {!productsLoading && products.length > 0 && (
                  <section className="featured-section">
                    <div className="featured-header">
                      <div className="section-label-center">New Arrivals</div>
                      <h2>Just Dropped</h2>
                    </div>
                    <div className="featured-strip">
                      {products.slice(0, 4).map((p, i) => (
                        <motion.div
                          key={p.id}
                          className="featured-item"
                          initial={{ opacity:0, y:24 }}
                          whileInView={{ opacity:1, y:0 }}
                          viewport={{ once:true }}
                          transition={{ delay: i * 0.1, duration:0.6 }}
                          onClick={() => openProduct(p.id)}
                        >
                          <div className="featured-img-wrap">
                            <img
                              src={
                                (p.images && p.images.length > 0)
                                  ? p.images[0]
                                  : ({
                                    'shirt-linen-white': 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&q=80',
                                    'shirt-linen-black': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80',
                                    'shirt-oxford-blue': 'https://images.unsplash.com/photo-1594938298603-c8148c4b4c6c?w=400&q=80',
                                    'shirt-linen-olive': 'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=400&q=80',
                                    'shoes-leather-tan': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
                                    'shoes-leather-black': 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&q=80',
                                    'shoes-white-minimal': 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400&q=80',
                                    'shoes-chelsea-brown': 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=400&q=80',
                                  } as Record<string,string>)[p.id] || 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&q=80'
                              }
                              alt={`${p.title} ${p.titleLine2}`}
                              onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x380/f5f5f3/999?text=' + p.emoji; }}
                            />
                          </div>
                          <div className="featured-info">
                            <div className="featured-name">{p.title} {p.titleLine2}</div>
                            <div className="featured-price">₹{(p.price ?? 0).toLocaleString('en-IN')}</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </section>
                )}

                <Footer onNavClick={handleNavClick} />
              </motion.main>
            )}

            {/* ── CATEGORY PAGE ── */}
            {(pageKey === 'cat-shirts' || pageKey === 'cat-shoes') && !activeProductId && (
              <motion.main key={pageKey} variants={pv} initial="initial" animate="animate" exit="exit" transition={pt}>
                <CategoryPage
                  categoryId={activeCategory!}
                  products={activeCategory === 'shirts' ? shirtProducts : shoeProducts}
                  onSelectProduct={openProduct}
                  onBack={goHome}
                />
                <Footer onNavClick={handleNavClick} />
              </motion.main>
            )}

            {/* ── PRODUCT DETAIL ── */}
            {activeProductId && selectedProduct && (
              <motion.main key={pageKey} variants={pv} initial="initial" animate="animate" exit="exit" transition={pt}>
                <ProductDetail
                  product={selectedProduct}
                  onBack={activeCategory ? backToCategory : goHome}
                />
                <Footer onNavClick={handleNavClick} />
              </motion.main>
            )}

            {/* ── OTHER PAGES ── */}
            {pageKey === 'craft' && (
              <motion.main key="craft" variants={pv} initial="initial" animate="animate" exit="exit" transition={pt}>
                <CraftPage /><Footer onNavClick={handleNavClick} />
              </motion.main>
            )}
            {pageKey === 'about' && (
              <motion.main key="about" variants={pv} initial="initial" animate="animate" exit="exit" transition={pt}>
                <AboutPage /><Footer onNavClick={handleNavClick} />
              </motion.main>
            )}
            {pageKey === 'contact' && (
              <motion.main key="contact" variants={pv} initial="initial" animate="animate" exit="exit" transition={pt}>
                <ContactPage /><Footer onNavClick={handleNavClick} />
              </motion.main>
            )}
            {pageKey === 'orders' && user && (
              <motion.main key="orders" variants={pv} initial="initial" animate="animate" exit="exit" transition={pt}>
                <OrderHistoryPage onShopClick={goHome} /><Footer onNavClick={handleNavClick} />
              </motion.main>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );
};

const App: React.FC = () => {
  const { products, loading: productsLoading, usingFallback } = useProducts();
  return (
    <AuthProvider>
      <SearchProvider products={products}>
        <WishlistProvider>
          <OrderProvider>
            <CartProvider>
              <AppInner products={products} productsLoading={productsLoading} usingFallback={usingFallback} />
            </CartProvider>
          </OrderProvider>
        </WishlistProvider>
      </SearchProvider>
    </AuthProvider>
  );
};

export default App;
