import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import './AdminPortal.css';

// ── Types ────────────────────────────────────────────────────────────────────
type AdminPage = 'dashboard' | 'products' | 'orders' | 'customers' | 'inventory' | 'analytics';

interface Stats {
  ordersToday: number; revenueToday: number;
  ordersMonth: number; revenueMonth: number;
  totalOrders: number; totalRevenue: number;
  totalCustomers: number; newUsersToday: number;
  totalProducts: number; pendingOrders: number;
  lowStockProducts: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;
const fmtNum = (n: number) => n.toLocaleString('en-IN');

const STATUS_COLORS: Record<string, string> = {
  Processing: '#C41E3A', Shipped: '#1d4ed8', Delivered: '#16a34a', Cancelled: '#6b7280',
};

// ── Sidebar ──────────────────────────────────────────────────────────────────
const MENU: { id: AdminPage; label: string; icon: string }[] = [
  { id: 'dashboard',  label: 'Dashboard',  icon: '▦' },
  { id: 'products',   label: 'Products',   icon: '◈' },
  { id: 'orders',     label: 'Orders',     icon: '◉' },
  { id: 'customers',  label: 'Customers',  icon: '◎' },
  { id: 'inventory',  label: 'Inventory',  icon: '◌' },
  { id: 'analytics',  label: 'Analytics',  icon: '▤' },
];

// ── Dashboard ─────────────────────────────────────────────────────────────────
const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(r => { if (r.success) setStats(r.stats); setLoading(false); });
  }, []);

  if (loading) return <div className="adp-loading">Loading stats…</div>;
  if (!stats)  return <div className="adp-loading">Failed to load stats.</div>;

  const cards = [
    { label: 'Orders Today',      value: fmtNum(stats.ordersToday),    sub: `₹${fmtNum(stats.revenueToday)} revenue`,  color: '#C41E3A' },
    { label: 'This Month Orders', value: fmtNum(stats.ordersMonth),    sub: fmt(stats.revenueMonth) + ' revenue',      color: '#1d4ed8' },
    { label: 'Total Customers',   value: fmtNum(stats.totalCustomers), sub: `+${stats.newUsersToday} today`,           color: '#16a34a' },
    { label: 'Total Products',    value: fmtNum(stats.totalProducts),  sub: `${stats.lowStockProducts} low stock`,     color: '#d97706' },
    { label: 'Pending Orders',    value: fmtNum(stats.pendingOrders),  sub: 'Needs action',                            color: '#7c3aed' },
    { label: 'Total Revenue',     value: fmt(stats.totalRevenue),      sub: `${fmtNum(stats.totalOrders)} orders`,     color: '#0f766e' },
  ];

  return (
    <div>
      <h2 className="adp-page-title">Dashboard</h2>
      <div className="adp-stats-grid">
        {cards.map((c, i) => (
          <motion.div key={c.label} className="adp-stat-card"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <div className="adp-stat-indicator" style={{ background: c.color }} />
            <div className="adp-stat-value">{c.value}</div>
            <div className="adp-stat-label">{c.label}</div>
            <div className="adp-stat-sub">{c.sub}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ── Products ──────────────────────────────────────────────────────────────────
const Products: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<any | null>(null);
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  // form fields
  const [slug, setSlug]           = useState('');
  const [category, setCategory]   = useState('Shirts');
  const [emoji, setEmoji]         = useState('👕');
  const [title, setTitle]         = useState('');
  const [titleLine2, setLine2]    = useState('');
  const [subtitle, setSubtitle]   = useState('');
  const [eyebrow, setEyebrow]     = useState('');
  const [cardDesc, setCardDesc]   = useState('');
  const [price, setPrice]         = useState('');
  const [sku, setSku]             = useState('');
  const [stock, setStock]         = useState('100');
  const [tags, setTags]           = useState('');
  const [images, setImages]       = useState('');
  const [features, setFeatures]   = useState('');
  const [featured, setFeatured]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await api.get('/admin/products');
    if (r.success) setProducts(r.products ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const flash = (t: string) => { setMsg(t); setTimeout(() => setMsg(''), 3500); };

  const openAdd = () => {
    setEditing(null);
    setSlug(''); setCategory('Shirts'); setEmoji('👕'); setTitle(''); setLine2('');
    setSubtitle(''); setEyebrow('Premium Linen Collection'); setCardDesc('');
    setPrice(''); setSku(''); setStock('100'); setTags(''); setImages('');
    setFeatures(''); setFeatured(false);
    setShowForm(true);
  };

  const openEdit = (p: any) => {
    setEditing(p);
    setSlug(p.slug); setCategory(p.category); setEmoji(p.emoji); setTitle(p.title);
    setLine2(p.titleLine2); setSubtitle(p.subtitle); setEyebrow(p.eyebrow);
    setCardDesc(p.cardDesc); setPrice(String(p.price)); setSku(p.sku ?? '');
    setStock(String(p.stock ?? 100)); setTags((p.tags ?? []).join(', '));
    setImages((p.images ?? []).join('\n')); setFeatures((p.features ?? []).join('\n'));
    setFeatured(p.isFeatured ?? false);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      slug: slug.trim().toLowerCase().replace(/\s+/g,'-'),
      category, emoji, title, titleLine2, subtitle, eyebrow, cardDesc,
      price: parseFloat(price) || 0,
      sku: sku.trim(),
      stock: parseInt(stock) || 0,
      tags: tags.split(',').map(t=>t.trim()).filter(Boolean),
      images: images.split('\n').map(u=>u.trim()).filter(Boolean),
      features: features.split('\n').map(f=>f.trim()).filter(Boolean),
      isFeatured: featured, isActive: true,
      sizes: category === 'Shoes'
        ? [{label:'38',available:true},{label:'39',available:true},{label:'40',available:true},{label:'41',available:true},{label:'42',available:false},{label:'43',available:true},{label:'44',available:true}]
        : [{label:'XS',available:true},{label:'S',available:true},{label:'M',available:true},{label:'L',available:true},{label:'XL',available:true},{label:'XXL',available:false}],
      specs: [], parts: [],
    };
    const r = editing
      ? await api.put(`/admin/products/${editing.slug}`, payload)
      : await api.post('/admin/products', payload);
    setSaving(false);
    if (r.success) { flash(editing ? '✅ Product updated!' : '✅ Product added!'); setShowForm(false); load(); }
    else flash(`❌ ${r.message}`);
  };

  const handleDelete = async (slug: string) => {
    if (!window.confirm(`Delete "${slug}"?`)) return;
    setDeleting(slug);
    const r = await api.delete(`/admin/products/${slug}`);
    setDeleting(null);
    if (r.success) { flash('Product deleted.'); load(); }
    else flash(`❌ ${r.message}`);
  };

  return (
    <div>
      <div className="adp-section-header">
        <h2 className="adp-page-title">Products <span className="adp-count">({products.length})</span></h2>
        <button className="adp-btn adp-btn-primary" onClick={openAdd}>+ Add Product</button>
      </div>
      {msg && <div className={`adp-flash ${msg.startsWith('✅') ? 'ok' : 'err'}`}>{msg}</div>}

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div className="adp-form-card"
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:10 }}
          >
            <div className="adp-form-top">
              <h3>{editing ? `Edit: ${editing.slug}` : 'Add New Product'}</h3>
              <button onClick={() => setShowForm(false)} className="adp-close">✕</button>
            </div>
            <form onSubmit={handleSave} className="adp-form">
              <div className="adp-grid-3">
                <div className="adp-field">
                  <label>Slug *</label>
                  <input value={slug} onChange={e=>setSlug(e.target.value)} placeholder="shirt-linen-pink" required disabled={!!editing} />
                </div>
                <div className="adp-field">
                  <label>Category</label>
                  <select value={category} onChange={e=>setCategory(e.target.value)}>
                    <option>Shirts</option><option>Shoes</option>
                  </select>
                </div>
                <div className="adp-field">
                  <label>Emoji</label>
                  <input value={emoji} onChange={e=>setEmoji(e.target.value)} placeholder="👕" />
                </div>
              </div>
              <div className="adp-grid-2">
                <div className="adp-field"><label>Title *</label><input value={title} onChange={e=>setTitle(e.target.value)} required /></div>
                <div className="adp-field"><label>Title Line 2</label><input value={titleLine2} onChange={e=>setLine2(e.target.value)} /></div>
              </div>
              <div className="adp-field"><label>Eyebrow label</label><input value={eyebrow} onChange={e=>setEyebrow(e.target.value)} /></div>
              <div className="adp-field"><label>Subtitle</label><textarea value={subtitle} onChange={e=>setSubtitle(e.target.value)} rows={2} /></div>
              <div className="adp-field"><label>Card description</label><textarea value={cardDesc} onChange={e=>setCardDesc(e.target.value)} rows={2} /></div>
              <div className="adp-grid-3">
                <div className="adp-field"><label>Price (₹) *</label><input type="number" value={price} onChange={e=>setPrice(e.target.value)} required min="0" /></div>
                <div className="adp-field"><label>SKU</label><input value={sku} onChange={e=>setSku(e.target.value)} /></div>
                <div className="adp-field"><label>Stock</label><input type="number" value={stock} onChange={e=>setStock(e.target.value)} min="0" /></div>
              </div>
              <div className="adp-field"><label>Tags (comma separated)</label><input value={tags} onChange={e=>setTags(e.target.value)} placeholder="shirt, linen, white" /></div>
              <div className="adp-field"><label>Image URLs (one per line)</label><textarea value={images} onChange={e=>setImages(e.target.value)} rows={3} placeholder="https://..." /></div>
              <div className="adp-field"><label>Features (one per line)</label><textarea value={features} onChange={e=>setFeatures(e.target.value)} rows={4} placeholder="Premium Linen&#10;Relaxed Fit" /></div>
              <label className="adp-checkbox"><input type="checkbox" checked={featured} onChange={e=>setFeatured(e.target.checked)} /> Featured on homepage</label>
              <div className="adp-form-actions">
                <button type="submit" className="adp-btn adp-btn-primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Update Product' : 'Add Product'}</button>
                <button type="button" className="adp-btn adp-btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      {loading ? <div className="adp-loading">Loading…</div> : (
        <div className="adp-table-wrap">
          <table className="adp-table">
            <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>SKU</th><th>Actions</th></tr></thead>
            <tbody>
              {products.map(p => (
                <tr key={p.slug}>
                  <td><span className="adp-emoji">{p.emoji}</span> {p.title} {p.titleLine2}</td>
                  <td><span className="adp-badge">{p.category}</span></td>
                  <td className="adp-mono">{fmt(p.price)}</td>
                  <td><span className={`adp-stock ${(p.stock??0) < 10 ? 'low' : ''}`}>{p.stock ?? '—'}</span></td>
                  <td className="adp-muted">{p.sku ?? '—'}</td>
                  <td>
                    <button className="adp-btn adp-btn-sm" onClick={() => openEdit(p)}>Edit</button>
                    <button className="adp-btn adp-btn-sm adp-btn-danger" onClick={() => handleDelete(p.slug)} disabled={deleting === p.slug}>{deleting===p.slug?'…':'Delete'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ── Orders ────────────────────────────────────────────────────────────────────
const Orders: React.FC = () => {
  const [orders, setOrders]           = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [updating, setUpdating]       = useState<string | null>(null);
  const [msg, setMsg]                 = useState('');
  const [expanded, setExpanded]       = useState<string | null>(null);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    const r = await api.get(`/admin/orders?status=${statusFilter}&limit=50`);
    if (r.success) setOrders(r.orders ?? []);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (orderId: string, status: string) => {
    const trackingNumber = trackingInputs[orderId] || undefined;
    setUpdating(orderId);
    const r = await api.put(`/admin/orders/${orderId}/status`, { status, trackingNumber });
    setUpdating(null);
    if (r.success) {
      setMsg(`✅ ${orderId} → ${status}${trackingNumber ? ` | Tracking: ${trackingNumber}` : ''} — Email sent!`);
      setTimeout(() => setMsg(''), 4000);
      load();
    }
  };

  return (
    <div>
      <div className="adp-section-header">
        <h2 className="adp-page-title">Orders <span className="adp-count">({orders.length})</span></h2>
        <div className="adp-filter-row">
          {['all','Processing','Shipped','Delivered','Cancelled'].map(s => (
            <button key={s} className={`adp-filter-btn ${statusFilter===s?'active':''}`} onClick={()=>setStatusFilter(s)}>{s}</button>
          ))}
        </div>
      </div>
      {msg && <div className="adp-flash ok">{msg}</div>}
      {loading ? <div className="adp-loading">Loading…</div> : orders.length === 0 ? (
        <div className="adp-empty"><p>No orders yet.</p></div>
      ) : (
        <div className="adp-orders-list">
          {orders.map(o => (
            <div key={o.orderId} className={`adp-order-card ${expanded === o.orderId ? 'expanded' : ''}`}>
              <div className="adp-order-header" onClick={() => setExpanded(expanded === o.orderId ? null : o.orderId)}>
                <div className="adp-order-id">
                  <span className="adp-mono adp-bold">{o.orderId}</span>
                  <span className="adp-muted adp-small">{new Date(o.createdAt).toLocaleDateString('en-IN', {day:'2-digit',month:'short',year:'numeric'})}</span>
                </div>
                <div className="adp-order-customer">
                  <span className="adp-bold">{o.user?.name ?? 'Guest'}</span>
                  <span className="adp-muted adp-small">{o.user?.email}</span>
                  {o.user?.phone && <span className="adp-muted adp-small">📱 +91 {o.user.phone}</span>}
                </div>
                <span className="adp-mono adp-bold">{fmt(o.total)}</span>
                <span className="adp-status-badge" style={{color:STATUS_COLORS[o.status]??'#000',borderColor:STATUS_COLORS[o.status]??'#ccc'}}>{o.status}</span>
                <span className="adp-expand-icon">{expanded === o.orderId ? '▲' : '▼'}</span>
              </div>

              {expanded === o.orderId && (
                <div className="adp-order-details">
                  <div className="adp-detail-section">
                    <div className="adp-detail-title">🛍️ Items Ordered</div>
                    {(o.items ?? []).map((item: any, i: number) => (
                      <div key={i} className="adp-order-item">
                        <span>{item.emoji} <strong>{item.title} {item.titleLine2}</strong></span>
                        <span className="adp-muted">Size: {item.size} · Qty: {item.quantity}</span>
                        <span className="adp-mono">{fmt(item.price * item.quantity)}</span>
                      </div>
                    ))}
                    <div className="adp-order-total-row">
                      <span>Payment: <strong>{(o.paymentMethod||'cod').toUpperCase()}</strong></span>
                      <span>Total: <strong>{fmt(o.total)}</strong></span>
                    </div>
                  </div>

                  <div className="adp-detail-section">
                    <div className="adp-detail-title">📦 Delivery Address</div>
                    <div className="adp-address-box">
                      <div className="adp-bold">{o.address?.firstName} {o.address?.lastName}</div>
                      <div>{o.address?.street}</div>
                      <div>{o.address?.city} — {o.address?.pin}</div>
                      <div>📱 {o.address?.phone}</div>
                    </div>
                  </div>

                  <div className="adp-detail-section">
                    <div className="adp-detail-title">🚚 Update Status & Tracking</div>
                    <div className="adp-status-update-row">
                      <div className="adp-field" style={{flex:1}}>
                        <label>Tracking Number (AWB — Shiprocket/Delhivery)</label>
                        <input
                          className="adp-input"
                          placeholder="e.g. 1234567890"
                          value={trackingInputs[o.orderId] ?? o.trackingNumber ?? ''}
                          onChange={e => setTrackingInputs(prev => ({...prev, [o.orderId]: e.target.value}))}
                        />
                      </div>
                      <div className="adp-status-btns">
                        {['Processing','Shipped','Delivered','Cancelled'].map(s => (
                          <button
                            key={s}
                            className={`adp-btn adp-btn-sm ${o.status===s?'adp-btn-primary':''} ${s==='Cancelled'?'adp-btn-danger':''}`}
                            onClick={() => updateStatus(o.orderId, s)}
                            disabled={updating === o.orderId || o.status === s}
                          >
                            {updating === o.orderId ? '…' : s}
                          </button>
                        ))}
                      </div>
                    </div>
                    {o.trackingNumber && (
                      <div className="adp-tracking-info">
                        ✅ Tracking: <strong>{o.trackingNumber}</strong> —{' '}
                        <a href={`https://shiprocket.co/tracking/${o.trackingNumber}`} target="_blank" rel="noreferrer">Track ↗</a>
                      </div>
                    )}
                    <p className="adp-muted adp-small" style={{marginTop:6}}>📧 Customer gets email on every status change.</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
// ── Customers ─────────────────────────────────────────────────────────────────
const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [toggling, setToggling]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await api.get(`/admin/customers?search=${search}&limit=50`);
    if (r.success) setCustomers(r.customers ?? []);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => load(), 350);
    return () => clearTimeout(t);
  }, [load]);

  const toggle = async (id: string) => {
    setToggling(id);
    await api.put(`/admin/customers/${id}/toggle`, {});
    setToggling(null);
    load();
  };

  return (
    <div>
      <div className="adp-section-header">
        <h2 className="adp-page-title">Customers <span className="adp-count">({customers.length})</span></h2>
        <input className="adp-search" placeholder="Search name / email / phone…" value={search} onChange={e=>setSearch(e.target.value)} />
      </div>
      {loading ? <div className="adp-loading">Loading…</div> : (
        <div className="adp-table-wrap">
          <table className="adp-table">
            <thead><tr><th>Name</th><th>Email / Phone</th><th>Orders</th><th>Total Spent</th><th>Joined</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {customers.map(c => (
                <tr key={c._id}>
                  <td className="adp-bold">{c.name || '—'}</td>
                  <td>
                    <div className="adp-muted adp-small">{c.email || '—'}</div>
                    <div className="adp-muted adp-small">{c.phone ? `+91 ${c.phone}` : ''}</div>
                  </td>
                  <td className="adp-center">{c.orderCount ?? 0}</td>
                  <td className="adp-mono">{fmt(c.totalSpent ?? 0)}</td>
                  <td className="adp-muted adp-small">{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                  <td><span className={`adp-status-badge ${c.isDisabled ? 'disabled' : 'active'}`}>{c.isDisabled ? 'Disabled' : 'Active'}</span></td>
                  <td>
                    <button className={`adp-btn adp-btn-sm ${c.isDisabled ? '' : 'adp-btn-danger'}`} onClick={() => toggle(c._id)} disabled={toggling === c._id}>
                      {toggling === c._id ? '…' : c.isDisabled ? 'Enable' : 'Disable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ── Inventory ─────────────────────────────────────────────────────────────────
const Inventory: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState<string | null>(null);
  const [newStock, setNewStock] = useState('');
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState('');

  useEffect(() => {
    api.get('/admin/products').then(r => { if (r.success) setProducts(r.products ?? []); setLoading(false); });
  }, []);

  const saveStock = async (slug: string) => {
    setSaving(true);
    const r = await api.put(`/admin/inventory/${slug}/stock`, { stock: parseInt(newStock) });
    setSaving(false);
    if (r.success) {
      setProducts(ps => ps.map(p => p.slug === slug ? { ...p, stock: parseInt(newStock) } : p));
      setMsg(`✅ ${slug} stock updated to ${newStock}`);
      setTimeout(() => setMsg(''), 3000);
      setEditing(null);
    }
  };

  return (
    <div>
      <h2 className="adp-page-title">Inventory</h2>
      {msg && <div className="adp-flash ok">{msg}</div>}
      {loading ? <div className="adp-loading">Loading…</div> : (
        <div className="adp-table-wrap">
          <table className="adp-table">
            <thead><tr><th>Product</th><th>SKU</th><th>Stock</th><th>Status</th><th>Update Stock</th></tr></thead>
            <tbody>
              {products.sort((a,b) => (a.stock??999) - (b.stock??999)).map(p => (
                <tr key={p.slug}>
                  <td><span className="adp-emoji">{p.emoji}</span> {p.title} {p.titleLine2}</td>
                  <td className="adp-muted">{p.sku ?? '—'}</td>
                  <td className="adp-mono adp-bold">{p.stock ?? 0}</td>
                  <td>
                    {(p.stock ?? 0) === 0
                      ? <span className="adp-status-badge disabled">Out of Stock</span>
                      : (p.stock ?? 0) < 10
                        ? <span className="adp-status-badge" style={{color:'#d97706',borderColor:'#d97706'}}>Low Stock</span>
                        : <span className="adp-status-badge active">In Stock</span>
                    }
                  </td>
                  <td>
                    {editing === p.slug ? (
                      <div className="adp-inline-edit">
                        <input type="number" value={newStock} onChange={e=>setNewStock(e.target.value)} min="0" className="adp-stock-input" autoFocus />
                        <button className="adp-btn adp-btn-sm adp-btn-primary" onClick={() => saveStock(p.slug)} disabled={saving}>Save</button>
                        <button className="adp-btn adp-btn-sm" onClick={() => setEditing(null)}>Cancel</button>
                      </div>
                    ) : (
                      <button className="adp-btn adp-btn-sm" onClick={() => { setEditing(p.slug); setNewStock(String(p.stock ?? 0)); }}>
                        Update
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ── Analytics ─────────────────────────────────────────────────────────────────
const Analytics: React.FC = () => {
  const [data, setData]     = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics').then(r => { if (r.success) setData(r); setLoading(false); });
  }, []);

  if (loading) return <div className="adp-loading">Loading analytics…</div>;
  if (!data)   return <div className="adp-loading">Failed to load analytics.</div>;

  const maxRev = Math.max(...(data.dailyRevenue ?? []).map((d: any) => d.revenue), 1);

  return (
    <div>
      <h2 className="adp-page-title">Analytics — Last 7 Days</h2>

      {/* Revenue chart */}
      <div className="adp-analytics-card">
        <h3 className="adp-analytics-title">Daily Revenue</h3>
        <div className="adp-bar-chart">
          {(data.dailyRevenue ?? []).map((d: any) => (
            <div key={d._id} className="adp-bar-col">
              <div className="adp-bar-value">{fmt(d.revenue)}</div>
              <div className="adp-bar" style={{ height: `${Math.max((d.revenue / maxRev) * 140, 4)}px` }} />
              <div className="adp-bar-label">{d._id.slice(5)}</div>
            </div>
          ))}
          {(data.dailyRevenue ?? []).length === 0 && <p className="adp-muted">No orders in last 7 days.</p>}
        </div>
      </div>

      <div className="adp-analytics-row">
        {/* Top products */}
        <div className="adp-analytics-card">
          <h3 className="adp-analytics-title">Top Products by Revenue</h3>
          {(data.topProducts ?? []).map((p: any, i: number) => (
            <div key={p._id} className="adp-top-row">
              <span className="adp-rank">#{i+1}</span>
              <span className="adp-top-name">{p._id}</span>
              <span className="adp-top-val">{fmt(p.revenue)}</span>
              <span className="adp-muted adp-small">{p.sold} sold</span>
            </div>
          ))}
          {(data.topProducts ?? []).length === 0 && <p className="adp-muted">No sales yet.</p>}
        </div>

        {/* Orders by status */}
        <div className="adp-analytics-card">
          <h3 className="adp-analytics-title">Orders by Status</h3>
          {(data.ordersByStatus ?? []).map((s: any) => (
            <div key={s._id} className="adp-top-row">
              <span className="adp-status-badge" style={{ color: STATUS_COLORS[s._id], borderColor: STATUS_COLORS[s._id] }}>{s._id}</span>
              <span className="adp-top-val">{s.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Main Admin Portal ─────────────────────────────────────────────────────────
const AdminPortal: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const { user, logout } = useAuth();
  const [page, setPage]   = useState<AdminPage>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!user || (user as any).role !== 'admin') {
    return (
      <div className="adp-access-denied">
        <h2>Access Denied</h2>
        <p>You need admin privileges.</p>
        <p>Run: <code>npm run make-admin {user?.email ?? 'your@email.com'}</code></p>
        <button className="adp-btn adp-btn-primary" onClick={onExit}>← Back to Store</button>
      </div>
    );
  }

  const PAGE_MAP: Record<AdminPage, React.ReactNode> = {
    dashboard: <Dashboard />,
    products:  <Products />,
    orders:    <Orders />,
    customers: <Customers />,
    inventory: <Inventory />,
    analytics: <Analytics />,
  };

  return (
    <div className="adp-shell">
      {/* Sidebar */}
      <aside className={`adp-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="adp-sidebar-brand">
          <span className="adp-brand-t">TOZY</span><span className="adp-brand-c">COZY</span>
          <span className="adp-admin-label">Admin</span>
        </div>
        <nav className="adp-nav">
          {MENU.map(item => (
            <button
              key={item.id}
              className={`adp-nav-item ${page === item.id ? 'active' : ''}`}
              onClick={() => setPage(item.id)}
            >
              <span className="adp-nav-icon">{item.icon}</span>
              <span className="adp-nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="adp-sidebar-footer">
          <button className="adp-nav-item" onClick={onExit}>← Store</button>
          <button className="adp-nav-item adp-logout" onClick={logout}>Logout</button>
        </div>
      </aside>

      {/* Main */}
      <div className="adp-main">
        {/* Topbar */}
        <div className="adp-topbar">
          <button className="adp-hamburger" onClick={() => setSidebarOpen(o => !o)}>☰</button>
          <span className="adp-topbar-title">{MENU.find(m => m.id === page)?.label}</span>
          <span className="adp-topbar-user">👤 {user.name}</span>
        </div>

        {/* Page content */}
        <div className="adp-content">
          <AnimatePresence mode="wait">
            <motion.div key={page}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {PAGE_MAP[page]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AdminPortal;
