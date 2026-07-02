import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import './AdminPage.css';

// ── Types ────────────────────────────────────────────────────────────────────
interface SizeEntry   { label: string; available: boolean; }
interface SpecEntry   { label: string; value: string; detail: string; }
interface PartEntry   { id: string; name: string; detail: string; tooltip: string; icon: string; gridCol: number; gridRow: number; }

interface ProductForm {
  slug: string;
  category: string;
  emoji: string;
  title: string;
  titleLine2: string;
  subtitle: string;
  eyebrow: string;
  cardDesc: string;
  price: string;
  sku: string;
  tags: string;           // comma-separated string → array on submit
  images: string;         // newline-separated URLs → array on submit
  features: string;       // one per line
  sizes: SizeEntry[];
  specs: SpecEntry[];
  parts: PartEntry[];
  isFeatured: boolean;
}

const EMPTY_FORM: ProductForm = {
  slug: '', category: 'Shirts', emoji: '👕',
  title: '', titleLine2: '', subtitle: '', eyebrow: '', cardDesc: '',
  price: '', sku: '', tags: '', images: '', features: '',
  isFeatured: false,
  sizes: [
    { label: 'XS', available: true }, { label: 'S', available: true },
    { label: 'M', available: true },  { label: 'L', available: true },
    { label: 'XL', available: true }, { label: 'XXL', available: false },
  ],
  specs: [
    { label: 'Fabric', value: '', detail: '' },
    { label: 'Fit',    value: '', detail: '' },
    { label: 'Care',   value: 'Machine Wash', detail: '30°C · Gentle Cycle' },
    { label: 'Origin', value: 'India',        detail: 'Artisan Crafted' },
    { label: 'Delivery', value: '3–5 Days',   detail: 'Worldwide Shipping' },
    { label: 'Returns',  value: '30 Days',    detail: 'Hassle-Free Returns' },
  ],
  parts: [],
};

const SHOE_SIZES: SizeEntry[] = [
  { label: '38', available: true }, { label: '39', available: true },
  { label: '40', available: true }, { label: '41', available: true },
  { label: '42', available: false },{ label: '43', available: true },
  { label: '44', available: true },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
const formToPayload = (f: ProductForm) => ({
  slug:        f.slug.trim().toLowerCase().replace(/\s+/g, '-'),
  category:    f.category,
  emoji:       f.emoji || '👕',
  title:       f.title.trim(),
  titleLine2:  f.titleLine2.trim(),
  subtitle:    f.subtitle.trim(),
  eyebrow:     f.eyebrow.trim(),
  cardDesc:    f.cardDesc.trim(),
  price:       parseFloat(f.price) || 0,
  sku:         f.sku.trim(),
  tags:        f.tags.split(',').map(t => t.trim()).filter(Boolean),
  images:      f.images.split('\n').map(u => u.trim()).filter(Boolean),
  features:    f.features.split('\n').map(l => l.trim()).filter(Boolean),
  sizes:       f.sizes,
  specs:       f.specs,
  parts:       f.parts,
  isFeatured:  f.isFeatured,
  isActive:    true,
});

// ── Sub-components ────────────────────────────────────────────────────────────
const Label: React.FC<{ text: string; required?: boolean }> = ({ text, required }) => (
  <label className="adm-label">{text}{required && <span className="adm-req">*</span>}</label>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, ...props }) => (
  <div className="adm-field">
    {label && <Label text={label} required={props.required} />}
    <input className="adm-input" {...props} />
  </div>
);

const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; hint?: string }> = ({ label, hint, ...props }) => (
  <div className="adm-field">
    {label && <Label text={label} required={props.required} />}
    {hint && <span className="adm-hint">{hint}</span>}
    <textarea className="adm-input adm-textarea" {...props} />
  </div>
);

// ── Main AdminPage ────────────────────────────────────────────────────────────
const AdminPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [form,     setForm]     = useState<ProductForm>(EMPTY_FORM);
  const [editSlug, setEditSlug] = useState<string | null>(null);  // null = adding new
  const [showForm, setShowForm] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [msg,      setMsg]      = useState<{ text: string; type: 'ok' | 'err' } | null>(null);

  // Redirect non-admins
  if (!user || (user as any).role !== 'admin') {
    return (
      <div className="adm-no-access">
        <h2>Access Denied</h2>
        <p>You need admin privileges to view this page.</p>
        <p className="adm-hint">Run: <code>npm run make-admin your@email.com</code> in the backend folder.</p>
        <button className="adm-btn adm-btn-secondary" onClick={onBack}>← Go Back</button>
      </div>
    );
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const loadProducts = useCallback(async () => {
    setLoading(true);
    const res = await api.get('/products?limit=100');
    if (res.success) setProducts(res.products ?? []);
    setLoading(false);
  }, []);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => { loadProducts(); }, [loadProducts]);

  const flash = (text: string, type: 'ok' | 'err') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 4000);
  };

  const openAddForm = () => {
    setForm(EMPTY_FORM);
    setEditSlug(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openEditForm = (p: any) => {
    setForm({
      slug:       p.slug,
      category:   p.category,
      emoji:      p.emoji,
      title:      p.title,
      titleLine2: p.titleLine2,
      subtitle:   p.subtitle,
      eyebrow:    p.eyebrow,
      cardDesc:   p.cardDesc,
      price:      String(p.price),
      sku:        p.sku ?? '',
      tags:       (p.tags ?? []).join(', '),
      images:     (p.images ?? []).join('\n'),
      features:   (p.features ?? []).join('\n'),
      sizes:      p.sizes ?? EMPTY_FORM.sizes,
      specs:      p.specs ?? EMPTY_FORM.specs,
      parts:      p.parts ?? [],
      isFeatured: p.isFeatured ?? false,
    });
    setEditSlug(p.slug);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelForm = () => { setShowForm(false); setEditSlug(null); setForm(EMPTY_FORM); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.slug || !form.title || !form.price) {
      flash('Slug, Title and Price are required.', 'err');
      return;
    }
    setSaving(true);
    const payload = formToPayload(form);

    const res = editSlug
      ? await api.put(`/products/${editSlug}`, payload)
      : await api.post('/products', payload);

    setSaving(false);
    if (res.success) {
      flash(editSlug ? '✅ Product updated!' : '✅ Product added!', 'ok');
      cancelForm();
      loadProducts();
    } else {
      flash(`❌ ${res.message || 'Failed to save product.'}`, 'err');
    }
  };

  const handleDelete = async (slug: string) => {
    if (!window.confirm(`Delete "${slug}"? This cannot be undone.`)) return;
    setDeleting(slug);
    const res = await api.delete(`/products/${slug}`);
    setDeleting(null);
    if (res.success) {
      flash('Product removed.', 'ok');
      loadProducts();
    } else {
      flash(`❌ ${res.message}`, 'err');
    }
  };

  // Auto-set sizes when category changes
  const setCategory = (cat: string) => {
    setForm(f => ({
      ...f,
      category: cat,
      emoji: cat === 'Shoes' ? '👟' : '👕',
      eyebrow: cat === 'Shoes' ? 'Artisanal Footwear' : 'Premium Linen Collection',
      sizes: cat === 'Shoes' ? SHOE_SIZES : EMPTY_FORM.sizes,
    }));
  };

  const set = (field: keyof ProductForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  // Size toggle
  const toggleSize = (label: string) =>
    setForm(f => ({
      ...f,
      sizes: f.sizes.map(s => s.label === label ? { ...s, available: !s.available } : s),
    }));

  // Spec editing
  const setSpec = (i: number, field: keyof SpecEntry, val: string) =>
    setForm(f => ({ ...f, specs: f.specs.map((s, idx) => idx === i ? { ...s, [field]: val } : s) }));

  const addSpec = () =>
    setForm(f => ({ ...f, specs: [...f.specs, { label: '', value: '', detail: '' }] }));

  const removeSpec = (i: number) =>
    setForm(f => ({ ...f, specs: f.specs.filter((_, idx) => idx !== i) }));

  return (
    <div className="adm-page">
      {/* Header */}
      <div className="adm-header">
        <div>
          <button className="adm-back" onClick={onBack}>← Back to Store</button>
          <h1 className="adm-title">Admin Panel</h1>
          <p className="adm-subtitle">Manage your products — changes reflect live on the website</p>
        </div>
        {!showForm && (
          <button className="adm-btn adm-btn-primary" onClick={openAddForm}>+ Add New Product</button>
        )}
      </div>

      {/* Flash message */}
      <AnimatePresence>
        {msg && (
          <motion.div
            className={`adm-flash ${msg.type}`}
            initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
          >
            {msg.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PRODUCT FORM ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="adm-form-wrap"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.4 }}
          >
            <div className="adm-form-header">
              <h2>{editSlug ? `Editing: ${editSlug}` : 'Add New Product'}</h2>
              <button className="adm-close-btn" onClick={cancelForm} aria-label="Close form">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="adm-form">
              {/* ── Section: Basic info ── */}
              <div className="adm-section">
                <h3 className="adm-section-title">Basic Information</h3>
                <div className="adm-grid-2">
                  <div className="adm-field">
                    <Label text="Category" required />
                    <select className="adm-input adm-select" value={form.category} onChange={e => setCategory(e.target.value)}>
                      <option value="Shirts">Shirts</option>
                      <option value="Shoes">Shoes</option>
                    </select>
                  </div>
                  <Input label="Emoji" value={form.emoji} onChange={set('emoji')} placeholder="👕" />
                </div>
                <div className="adm-grid-2">
                  <Input
                    label="Slug (URL ID — no spaces)"
                    value={form.slug}
                    onChange={set('slug')}
                    placeholder="shirt-linen-pink"
                    required
                    disabled={!!editSlug}
                  />
                  <Input label="SKU" value={form.sku} onChange={set('sku')} placeholder="TZC-SH-007" />
                </div>
                <div className="adm-grid-2">
                  <Input label="Title (line 1)" value={form.title} onChange={set('title')} placeholder="Premium Linen" required />
                  <Input label="Title (line 2)" value={form.titleLine2} onChange={set('titleLine2')} placeholder="Shirt — Pink" />
                </div>
                <Input label="Eyebrow label" value={form.eyebrow} onChange={set('eyebrow')} placeholder="Premium Linen Collection" />
                <Textarea label="Subtitle" value={form.subtitle} onChange={set('subtitle')} placeholder="Soft blush pink linen for a relaxed summer look." rows={2} />
                <Textarea label="Card description (shown on category page)" value={form.cardDesc} onChange={set('cardDesc')} placeholder="Blush pink linen.\nSoft and breathable." rows={2} hint="Use newline for line break" />
              </div>

              {/* ── Section: Pricing ── */}
              <div className="adm-section">
                <h3 className="adm-section-title">Pricing</h3>
                <div className="adm-grid-2">
                  <Input label="Price (₹)" type="number" value={form.price} onChange={set('price')} placeholder="3499" required min="0" />
                  <div className="adm-field adm-checkbox-field">
                    <label className="adm-checkbox-label">
                      <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} />
                      <span>Featured product (show on homepage strip)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* ── Section: Images ── */}
              <div className="adm-section">
                <h3 className="adm-section-title">Product Images</h3>
                <Textarea
                  label="Image URLs"
                  value={form.images}
                  onChange={set('images')}
                  rows={4}
                  placeholder={`https://your-domain.com/images/shirt-front.jpg\nhttps://your-domain.com/images/shirt-back.jpg\nhttps://your-domain.com/images/shirt-detail.jpg`}
                  hint="One URL per line. If empty, placeholder images are shown."
                />
                <p className="adm-tip">
                  💡 Upload images to Cloudinary / ImgBB / your own server and paste the URL here.
                  Free option: <a href="https://imgbb.com" target="_blank" rel="noreferrer">imgbb.com</a>
                </p>
              </div>

              {/* ── Section: Features ── */}
              <div className="adm-section">
                <h3 className="adm-section-title">Features</h3>
                <Textarea
                  label="Features"
                  value={form.features}
                  onChange={set('features')}
                  rows={6}
                  placeholder={`Premium 180 GSM Linen Fabric\nSoft Touch · Breathable Weave\nWrinkle Resistant Finish\nHand Finished Collar`}
                  hint="One feature per line"
                />
              </div>

              {/* ── Section: Tags ── */}
              <div className="adm-section">
                <h3 className="adm-section-title">Search Tags</h3>
                <Input
                  label="Tags"
                  value={form.tags}
                  onChange={set('tags')}
                  placeholder="shirt, linen, pink, summer, casual"
                />
                <p className="adm-hint">Comma-separated</p>
              </div>

              {/* ── Section: Sizes ── */}
              <div className="adm-section">
                <h3 className="adm-section-title">Sizes</h3>
                <p className="adm-hint">Click to toggle available / out of stock</p>
                <div className="adm-sizes-row">
                  {form.sizes.map(s => (
                    <button
                      key={s.label}
                      type="button"
                      className={`adm-size-btn ${s.available ? 'available' : 'oos'}`}
                      onClick={() => toggleSize(s.label)}
                    >
                      {s.label}
                      <span className="adm-size-status">{s.available ? '✓' : '✕'}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Section: Specs ── */}
              <div className="adm-section">
                <h3 className="adm-section-title">Specifications</h3>
                {form.specs.map((spec, i) => (
                  <div key={i} className="adm-spec-row">
                    <input className="adm-input adm-spec-input" placeholder="Label" value={spec.label} onChange={e => setSpec(i, 'label', e.target.value)} />
                    <input className="adm-input adm-spec-input" placeholder="Value" value={spec.value} onChange={e => setSpec(i, 'value', e.target.value)} />
                    <input className="adm-input adm-spec-input" placeholder="Detail" value={spec.detail} onChange={e => setSpec(i, 'detail', e.target.value)} />
                    <button type="button" className="adm-remove-btn" onClick={() => removeSpec(i)} aria-label="Remove spec">✕</button>
                  </div>
                ))}
                <button type="button" className="adm-btn adm-btn-ghost" onClick={addSpec}>+ Add Spec Row</button>
              </div>

              {/* ── Actions ── */}
              <div className="adm-form-actions">
                <button type="submit" className="adm-btn adm-btn-primary adm-btn-lg" disabled={saving}>
                  {saving ? 'Saving…' : editSlug ? 'Update Product' : 'Add Product'}
                </button>
                <button type="button" className="adm-btn adm-btn-secondary" onClick={cancelForm}>Cancel</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PRODUCT LIST ── */}
      <div className="adm-list-header">
        <h2>All Products <span className="adm-count">({products.length})</span></h2>
        <p className="adm-hint">These are live — any change reflects immediately on the website</p>
      </div>

      {loading ? (
        <div className="adm-loading">Loading products…</div>
      ) : products.length === 0 ? (
        <div className="adm-empty">
          <p>No products yet.</p>
          <button className="adm-btn adm-btn-primary" onClick={openAddForm}>Add your first product</button>
        </div>
      ) : (
        <div className="adm-product-list">
          {products.map((p, i) => (
            <motion.div
              key={p.slug}
              className="adm-product-row"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <div className="adm-row-emoji">{p.emoji}</div>
              <div className="adm-row-info">
                <div className="adm-row-name">{p.title} {p.titleLine2}</div>
                <div className="adm-row-meta">
                  <span className="adm-tag">{p.category}</span>
                  <span className="adm-tag">{p.slug}</span>
                  {p.isFeatured && <span className="adm-tag featured">⭐ Featured</span>}
                  {!p.isActive && <span className="adm-tag inactive">Hidden</span>}
                </div>
              </div>
              <div className="adm-row-price">₹{(p.price ?? 0).toLocaleString('en-IN')}</div>
              <div className="adm-row-actions">
                <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => openEditForm(p)}>Edit</button>
                <button
                  className="adm-btn adm-btn-danger adm-btn-sm"
                  onClick={() => handleDelete(p.slug)}
                  disabled={deleting === p.slug}
                >
                  {deleting === p.slug ? '…' : 'Delete'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
