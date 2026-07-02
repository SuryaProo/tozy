const mongoose = require('mongoose');

const sizeSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    available: { type: Boolean, default: true },
  },
  { _id: false }
);

const specSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
    detail: { type: String, required: true },
  },
  { _id: false }
);

const explodedPartSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    detail: { type: String, required: true },
    tooltip: { type: String, required: true },
    icon: { type: String, required: true },
    gridCol: { type: Number, required: true },
    gridRow: { type: Number, required: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    // Slug used as the public-facing ID (e.g. 'shirt', 'shoes', 'classic-tee')
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    category: { type: String, required: true },
    emoji: { type: String, default: '👕' },
    title: { type: String, required: true },
    titleLine2: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    eyebrow: { type: String, default: '' },
    cardDesc: { type: String, default: '' },
    features: [{ type: String }],
    sizes: [sizeSchema],
    specs: [specSchema],
    parts: [explodedPartSchema],
    price: { type: Number, required: true, min: 0 },
    images: [{ type: String }],
    sku: { type: String, unique: true, sparse: true },
    stock: { type: Number, default: 100, min: 0 },
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.index({ title: 'text', category: 'text', tags: 'text', cardDesc: 'text' });

module.exports = mongoose.model('Product', productSchema);
