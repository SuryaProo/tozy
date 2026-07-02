require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/Product');

// Auto-inject /tozycozy database name if user forgot it in the URI
if (process.env.MONGODB_URI) {
  const uri = process.env.MONGODB_URI;
  // Handle standard SRV: "...mongodb.net/?..." → "...mongodb.net/tozycozy?..."
  // Handle replica set: "...mongodb.net:27017/?..." → "...mongodb.net:27017/tozycozy?..."
  const needsDb =
    /\.mongodb\.net\/(\?|$)/.test(uri) ||        // SRV style missing db
    /\.mongodb\.net:\d+,.*\/(\?|$)/.test(uri) || // Replica set missing db
    /\.mongodb\.net:\d+\/(\?|$)/.test(uri);       // Single node missing db

  if (needsDb) {
    process.env.MONGODB_URI = uri.replace(/(\/((\?)|(admin\?)|$))/, '/tozycozy$3');
    console.log('ℹ️  Auto-added /tozycozy database name to your MongoDB URI');
  }
}

const SHIRT_PARTS = [
  { id: 'collar', name: 'Collar', detail: '100% Linen', tooltip: 'Hand-finished collar', icon: '🪡', gridCol: 2, gridRow: 1 },
  { id: 'buttons', name: 'Buttons', detail: 'Natural Wood', tooltip: 'Hand-selected wood finish', icon: '🔘', gridCol: 2, gridRow: 2 },
  { id: 'pocket', name: 'Pocket', detail: 'Patch Style', tooltip: 'Double-stitch construction', icon: '🪢', gridCol: 2, gridRow: 3 },
  { id: 'hem', name: 'Hem', detail: 'Clean Finish', tooltip: 'Double-fold hem', icon: '➰', gridCol: 2, gridRow: 4 },
];
const SHIRT_SPECS = [
  { label: 'Fabric', value: '180 GSM', detail: 'Premium Linen Blend' },
  { label: 'Fit', value: 'Relaxed', detail: 'Modern Silhouette' },
  { label: 'Care', value: 'Machine Wash', detail: '30°C · Gentle Cycle' },
  { label: 'Origin', value: 'India', detail: 'Artisan Crafted' },
  { label: 'Delivery', value: '3–5 Days', detail: 'Worldwide Shipping' },
  { label: 'Returns', value: '30 Days', detail: 'Hassle-Free Returns' },
];
const SHIRT_SIZES = [
  { label: 'XS', available: true }, { label: 'S', available: true },
  { label: 'M', available: true }, { label: 'L', available: true },
  { label: 'XL', available: true }, { label: 'XXL', available: false },
];
const SHOE_PARTS = [
  { id: 'upper', name: 'Upper', detail: 'Full-Grain', tooltip: 'Italian leather upper', icon: '🟤', gridCol: 2, gridRow: 1 },
  { id: 'insole', name: 'Insole', detail: 'Cork + Latex', tooltip: 'Molded footbed', icon: '🛏️', gridCol: 2, gridRow: 2 },
  { id: 'outsole', name: 'Outsole', detail: 'Vibram', tooltip: 'Anti-slip rubber', icon: '⚫', gridCol: 2, gridRow: 3 },
];
const SHOE_SPECS = [
  { label: 'Upper', value: 'Full-Grain', detail: 'Italian Calf Leather' },
  { label: 'Construction', value: 'Goodyear', detail: 'Welt Welted Sole' },
  { label: 'Outsole', value: 'Vibram', detail: 'Anti-Slip Rubber' },
  { label: 'Origin', value: 'Agra, IN', detail: 'Master Cobblers' },
  { label: 'Delivery', value: '5–7 Days', detail: 'Worldwide Shipping' },
  { label: 'Returns', value: '30 Days', detail: 'Hassle-Free Returns' },
];
const SHOE_SIZES = [
  { label: '38', available: true }, { label: '39', available: true },
  { label: '40', available: true }, { label: '41', available: true },
  { label: '42', available: false }, { label: '43', available: true },
  { label: '44', available: true },
];

const PRODUCTS = [
  // ── SHIRTS ──
  {
    slug: 'shirt-linen-white',
    category: 'Shirts', emoji: '👕',
    title: 'Premium Linen', titleLine2: 'Shirt — White',
    subtitle: 'Crisp white linen for the modern minimalist.',
    eyebrow: 'Premium Linen Collection',
    cardDesc: 'Pure white. 180 GSM linen.\nHand-finished collar.',
    price: 3499, sku: 'TZC-SH-001',
    tags: ['shirt', 'linen', 'white', 'apparel', 'premium'], isFeatured: true,
    features: ['Premium 180 GSM Linen Fabric', 'Soft Touch · Breathable Weave', 'Wrinkle Resistant Finish', 'Hand Finished Collar', 'Natural Plant-Based Dye', 'Double Reinforced Seams', 'Minimal Tailoring · Relaxed Fit'],
    sizes: SHIRT_SIZES, specs: SHIRT_SPECS, parts: SHIRT_PARTS,
  },
  {
    slug: 'shirt-linen-black',
    category: 'Shirts', emoji: '🖤',
    title: 'Premium Linen', titleLine2: 'Shirt — Black',
    subtitle: 'Midnight black linen. Effortlessly formal.',
    eyebrow: 'Premium Linen Collection',
    cardDesc: 'Deep black linen.\nPerfect for evenings.',
    price: 3499, sku: 'TZC-SH-002',
    tags: ['shirt', 'linen', 'black', 'apparel', 'formal'], isFeatured: true,
    features: ['Premium 180 GSM Linen Fabric', 'Deep Black Natural Dye', 'Relaxed Fit · Structured Collar', 'Double Reinforced Seams', 'Sustainable Linen Weave', 'Hand Finished Cuffs'],
    sizes: SHIRT_SIZES, specs: SHIRT_SPECS, parts: SHIRT_PARTS,
  },
  {
    slug: 'shirt-oxford-blue',
    category: 'Shirts', emoji: '👔',
    title: 'Oxford Button-Down', titleLine2: 'Shirt — Navy',
    subtitle: 'Classic Oxford weave in rich navy. A wardrobe essential.',
    eyebrow: 'Oxford Collection',
    cardDesc: 'Classic Oxford weave.\nNavy — built to last.',
    price: 2999, sku: 'TZC-SH-003',
    tags: ['shirt', 'oxford', 'navy', 'button-down', 'classic'],
    features: ['100% Cotton Oxford Weave', 'Button-Down Collar', 'Regular Fit', 'Machine Washable', 'Pre-Shrunk Fabric', 'Contrast Inner Placket'],
    sizes: SHIRT_SIZES,
    specs: [{ label: 'Fabric', value: '100% Cotton', detail: 'Oxford Weave' }, { label: 'Fit', value: 'Regular', detail: 'Classic Silhouette' }, ...SHIRT_SPECS.slice(2)],
    parts: SHIRT_PARTS,
  },
  {
    slug: 'shirt-linen-olive',
    category: 'Shirts', emoji: '🌿',
    title: 'Linen Overshirt', titleLine2: '— Olive',
    subtitle: 'Earth-toned linen overshirt. Wear open or buttoned.',
    eyebrow: 'Relaxed Collection',
    cardDesc: 'Olive linen. Wear it\nopen or buttoned.',
    price: 3999, sku: 'TZC-SH-004',
    tags: ['shirt', 'overshirt', 'olive', 'linen', 'casual'],
    features: ['Medium Weight Linen Blend', 'Relaxed Oversized Fit', 'Chest Patch Pocket', 'Natural Olive Dye', 'Drop Shoulder Construction', 'Perfect as a Layer'],
    sizes: SHIRT_SIZES, specs: SHIRT_SPECS, parts: SHIRT_PARTS,
  },
  {
    slug: 'shirt-stripe-white',
    category: 'Shirts', emoji: '🎽',
    title: 'Stripe Linen', titleLine2: 'Shirt — Ecru',
    subtitle: 'Subtle tonal stripes on soft ecru linen.',
    eyebrow: 'Striped Collection',
    cardDesc: 'Tonal stripe linen.\nSoft ecru ground.',
    price: 3799, sku: 'TZC-SH-005',
    tags: ['shirt', 'stripe', 'ecru', 'linen'],
    features: ['Tonal Woven Stripe', '180 GSM Linen', 'Relaxed Fit', 'Soft Ecru Ground', 'Natural Dye Process', 'Hand Finished Collar'],
    sizes: SHIRT_SIZES, specs: SHIRT_SPECS, parts: SHIRT_PARTS,
  },
  {
    slug: 'shirt-chambray',
    category: 'Shirts', emoji: '💙',
    title: 'Chambray', titleLine2: 'Shirt — Sky',
    subtitle: 'Lightweight chambray in sky blue. Casual perfection.',
    eyebrow: 'Chambray Collection',
    cardDesc: 'Sky blue chambray.\nLight as air.',
    price: 2799, sku: 'TZC-SH-006',
    tags: ['shirt', 'chambray', 'sky', 'blue', 'casual', 'lightweight'],
    features: ['Lightweight Chambray Weave', 'Sky Blue Yarn Dye', 'Regular Fit', 'Spread Collar', 'Machine Washable', 'Summer Essential'],
    sizes: SHIRT_SIZES, specs: SHIRT_SPECS, parts: SHIRT_PARTS,
  },
  // ── SHOES ──
  {
    slug: 'shoes-leather-tan',
    category: 'Shoes', emoji: '👞',
    title: 'Signature Leather', titleLine2: 'Derby — Tan',
    subtitle: 'Full-grain tan leather derby. Hand-lasted, resoleable.',
    eyebrow: 'Artisanal Footwear',
    cardDesc: 'Full-grain tan leather.\nHand-lasted in Agra.',
    price: 8999, sku: 'TZC-FW-001',
    tags: ['shoes', 'leather', 'tan', 'derby', 'formal'], isFeatured: true,
    features: ['Full-Grain Italian Leather', 'Goodyear Welt Construction', 'Cork & Latex Footbed', 'Vibram Outsole', 'Natural Vegetable Tanning', 'Resoleable'],
    sizes: SHOE_SIZES, specs: SHOE_SPECS, parts: SHOE_PARTS,
  },
  {
    slug: 'shoes-leather-black',
    category: 'Shoes', emoji: '👟',
    title: 'Signature Leather', titleLine2: 'Derby — Black',
    subtitle: 'Classic black derby. From boardroom to street.',
    eyebrow: 'Artisanal Footwear',
    cardDesc: 'Classic black derby.\nFrom boardroom to street.',
    price: 8999, sku: 'TZC-FW-002',
    tags: ['shoes', 'leather', 'black', 'derby', 'formal'], isFeatured: true,
    features: ['Full-Grain Black Leather', 'Goodyear Welt Construction', 'Cork Footbed', 'Vibram Anti-Slip Sole', 'Mirror Polish Finish', 'Dust Bag Included'],
    sizes: SHOE_SIZES, specs: SHOE_SPECS, parts: SHOE_PARTS,
  },
  {
    slug: 'shoes-white-minimal',
    category: 'Shoes', emoji: '🤍',
    title: 'Minimal Runner', titleLine2: '— Cloud White',
    subtitle: 'Ultra-clean white leather sneaker. Minimal as it gets.',
    eyebrow: 'Minimal Collection',
    cardDesc: 'Ultra-clean white leather.\nNo logo. Just craft.',
    price: 7499, sku: 'TZC-FW-003',
    tags: ['shoes', 'sneaker', 'white', 'minimal', 'casual'],
    features: ['Full-Grain White Leather', 'Minimal Toe Cap Design', 'Padded Ankle Collar', 'EVA Midsole', 'No Logo — Just Craft', 'Unisex Sizing'],
    sizes: SHOE_SIZES, specs: SHOE_SPECS, parts: SHOE_PARTS,
  },
  {
    slug: 'shoes-chelsea-brown',
    category: 'Shoes', emoji: '🥾',
    title: 'Chelsea Boot', titleLine2: '— Cognac',
    subtitle: 'Cognac Chelsea boot. Elastic gusset, pull tab, Vibram sole.',
    eyebrow: 'Boot Collection',
    cardDesc: 'Cognac Chelsea boot.\nElastic gusset + Vibram.',
    price: 10999, sku: 'TZC-FW-004',
    tags: ['shoes', 'boot', 'chelsea', 'cognac', 'brown'],
    features: ['Cognac Calf Leather', 'Elastic Side Gusset', 'Pull Tab at Heel', 'Vibram Commando Sole', 'Leather Sock Lining', 'Stacked Heel'],
    sizes: SHOE_SIZES, specs: SHOE_SPECS, parts: SHOE_PARTS,
  },
  {
    slug: 'shoes-loafer-navy',
    category: 'Shoes', emoji: '🧲',
    title: 'Penny Loafer', titleLine2: '— Navy Suede',
    subtitle: 'Navy suede penny loafer. The weekend essential.',
    eyebrow: 'Loafer Collection',
    cardDesc: 'Navy suede loafer.\nWeekend essential.',
    price: 6999, sku: 'TZC-FW-005',
    tags: ['shoes', 'loafer', 'suede', 'navy', 'casual'],
    features: ['Premium Navy Suede Upper', 'Penny Keeper Detail', 'Leather Sole + Rubber Heel Pad', 'Cushioned Insole', 'Slip-On Silhouette', 'Unlined for Breathability'],
    sizes: SHOE_SIZES, specs: SHOE_SPECS, parts: SHOE_PARTS,
  },
  {
    slug: 'shoes-desert-sand',
    category: 'Shoes', emoji: '🏜️',
    title: 'Desert Boot', titleLine2: '— Sand Suede',
    subtitle: 'Sand suede desert boot. Crepe sole, unlined comfort.',
    eyebrow: 'Boot Collection',
    cardDesc: 'Sand suede desert boot.\nCrepe sole comfort.',
    price: 7999, sku: 'TZC-FW-006',
    tags: ['shoes', 'boot', 'desert', 'sand', 'suede', 'crepe'],
    features: ['Sand Suede Upper', 'Natural Crepe Sole', 'Two-Eyelet Lacing', 'Unlined Interior', 'Chukka Height', 'Classic Desert Boot Shape'],
    sizes: SHOE_SIZES, specs: SHOE_SPECS, parts: SHOE_PARTS,
  },
];

const run = async () => {
  await connectDB();
  console.log(`🌱 Seeding ${PRODUCTS.length} products...`);
  for (const p of PRODUCTS) {
    await Product.findOneAndUpdate(
      { slug: p.slug }, p,
      { upsert: true, returnDocument: 'after', runValidators: false }
    );
    console.log(`   ✓ ${p.title} ${p.titleLine2} (${p.slug})`);
  }
  console.log('✅ Seed complete.');
  await mongoose.disconnect();
  process.exit(0);
};

run().catch(err => { console.error('❌ Seed failed:', err.message); process.exit(1); });
