import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../types';
import { useWishlist } from '../context/WishlistContext';
import { useAuthGuard } from '../hooks/useAuthGuard';
import './CategoryPage.css';

interface CategoryPageProps {
  categoryId: 'shirts' | 'shoes';
  products: Product[];
  onSelectProduct: (id: string) => void;
  onBack: () => void;
}

type SortKey = 'default' | 'price-asc' | 'price-desc' | 'name';

// Price range chips for shirts vs shoes
const PRICE_FILTERS: Record<string, { label: string; min: number; max: number }[]> = {
  shirts: [
    { label: 'Under ₹3,000', min: 0, max: 2999 },
    { label: '₹3,000 – ₹3,999', min: 3000, max: 3999 },
    { label: 'Above ₹4,000', min: 4000, max: Infinity },
  ],
  shoes: [
    { label: 'Under ₹7,500', min: 0, max: 7499 },
    { label: '₹7,500 – ₹9,999', min: 7500, max: 9999 },
    { label: 'Above ₹10,000', min: 10000, max: Infinity },
  ],
};

// Random Unsplash images for placeholder product photos — realistic clothing/shoe shots
const PLACEHOLDER_IMAGES: Record<string, string[]> = {
  'shirt-linen-white':  ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80'],
  'shirt-linen-black':  ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80'],
  'shirt-oxford-blue':  ['https://images.unsplash.com/photo-1594938298603-c8148c4b4c6c?w=600&q=80', 'https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?w=600&q=80'],
  'shirt-linen-olive':  ['https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600&q=80', 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80'],
  'shirt-stripe-white': ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80', 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&q=80'],
  'shirt-chambray':     ['https://images.unsplash.com/photo-1579338908476-3a3a1d71a706?w=600&q=80', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80'],
  'shoes-leather-tan':  ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80'],
  'shoes-leather-black':['https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80'],
  'shoes-white-minimal':['https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&q=80', 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=600&q=80'],
  'shoes-chelsea-brown':['https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600&q=80', 'https://images.unsplash.com/photo-1605812860427-4024433a70fd?w=600&q=80'],
  'shoes-loafer-navy':  ['https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&q=80', 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600&q=80'],
  'shoes-desert-sand':  ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80', 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80'],
};

const getImage = (product: Product) => {
  if (product.images && product.images.length > 0) return product.images[0];
  return PLACEHOLDER_IMAGES[product.id]?.[0] ?? '';
};

// Mini product card — same style as BearHouse
const ProductGridCard: React.FC<{
  product: Product;
  onSelect: (id: string) => void;
  index: number;
}> = ({ product, onSelect, index }) => {
  const { isWishlisted, toggle } = useWishlist();
  const guard = useAuthGuard();
  const [hovered, setHovered] = useState(false);
  const wishlisted = isWishlisted(product.id);

  const img1 = getImage(product);
  const imgs = product.images?.length ? product.images : (PLACEHOLDER_IMAGES[product.id] ?? []);
  const img2 = imgs[1] ?? img1;

  return (
    <motion.div
      className="cat-product-card"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(product.id)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onSelect(product.id)}
    >
      {/* Image area */}
      <div className="cat-card-img-wrap">
        <img
          src={hovered && img2 ? img2 : img1}
          alt={`${product.title} ${product.titleLine2}`}
          className="cat-card-img"
          loading="lazy"
          onError={e => { (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x500/f5f5f3/999999?text=${encodeURIComponent(product.emoji)}`; }}
        />
        {/* Wishlist heart */}
        <button
          className={`cat-card-heart ${wishlisted ? 'active' : ''}`}
          onClick={e => { e.stopPropagation(); guard(() => toggle(product)); }}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {wishlisted ? '♥' : '♡'}
        </button>

        {/* Quick add overlay on hover */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              className="cat-card-hover"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
            >
              View Product →
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info */}
      <div className="cat-card-info">
        <div className="cat-card-name">{product.title} {product.titleLine2}</div>
        <div className="cat-card-price">₹{(product.price ?? 0).toLocaleString('en-IN')}</div>
      </div>
    </motion.div>
  );
};

// ── Main CategoryPage ──────────────────────────────────────────────────────────
const CategoryPage: React.FC<CategoryPageProps> = ({ categoryId, products, onSelectProduct, onBack }) => {
  const [sort, setSort]             = useState<SortKey>('default');
  const [priceFilter, setPriceFilter] = useState<string | null>(null);

  const priceChips = PRICE_FILTERS[categoryId] ?? [];

  const sorted = useMemo(() => {
    let list = [...products];
    if (priceFilter) {
      const chip = priceChips.find(c => c.label === priceFilter);
      if (chip) list = list.filter(p => (p.price ?? 0) >= chip.min && (p.price ?? 0) <= chip.max);
    }
    if (sort === 'price-asc')  list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    if (sort === 'price-desc') list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    if (sort === 'name')       list.sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [products, sort, priceFilter, priceChips]);

  const title = categoryId === 'shirts' ? 'Shirts for Men' : 'Shoes & Boots';

  return (
    <div className="cat-page">
      {/* Header */}
      <div className="cat-header">
        <button className="cat-back" onClick={onBack}>
          <span>←</span> Home
        </button>
        <h1 className="cat-title">{title}</h1>
        <p className="cat-count">{sorted.length} products</p>
      </div>

      {/* Controls bar */}
      <div className="cat-controls">
        <div className="cat-filters">
          {priceChips.map(chip => (
            <button
              key={chip.label}
              className={`cat-chip ${priceFilter === chip.label ? 'active' : ''}`}
              onClick={() => setPriceFilter(priceFilter === chip.label ? null : chip.label)}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <div className="cat-sort">
          <span className="cat-sort-label">Sort:</span>
          <select
            className="cat-sort-select"
            value={sort}
            onChange={e => setSort(e.target.value as SortKey)}
          >
            <option value="default">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      {/* Product grid */}
      {sorted.length === 0 ? (
        <div className="cat-empty">
          <p>No products match your filters.</p>
          <button onClick={() => setPriceFilter(null)}>Clear filters</button>
        </div>
      ) : (
        <div className="cat-grid">
          {sorted.map((product, i) => (
            <ProductGridCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
