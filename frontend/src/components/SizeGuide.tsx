import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './SizeGuide.css';

interface SizeResult {
  size: string;
  label: string;
  fits: string;
  confidence: 'Perfect' | 'Good' | 'Check';
  color: string;
  modelImg: string;
  tip: string;
}

// Shirt size logic
const getShirtSize = (height: number, weight: number, chest: number): SizeResult => {
  let size = 'M';

  if (chest > 0) {
    if (chest <= 34)      size = 'XS';
    else if (chest <= 36) size = 'S';
    else if (chest <= 38) size = 'M';
    else if (chest <= 40) size = 'L';
    else if (chest <= 42) size = 'XL';
    else                  size = 'XXL';
  } else if (weight > 0 && height > 0) {
    const bmi = weight / ((height / 100) ** 2);
    if      (bmi < 18.5) size = height < 168 ? 'XS' : 'S';
    else if (bmi < 22)   size = height < 170 ? 'S'  : 'M';
    else if (bmi < 25)   size = height < 175 ? 'M'  : 'L';
    else if (bmi < 28)   size = 'L';
    else if (bmi < 32)   size = 'XL';
    else                 size = 'XXL';
  }

  const results: Record<string, SizeResult> = {
    XS: {
      size: 'XS', label: 'Extra Small', confidence: 'Perfect', color: '#10b981',
      fits: 'Height: 155–163 cm · Chest: 32–34 in · Weight: 45–55 kg',
      modelImg: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=300&q=80',
      tip: 'Slim fit · Shoulder seam at shoulder edge',
    },
    S: {
      size: 'S', label: 'Small', confidence: 'Perfect', color: '#10b981',
      fits: 'Height: 163–170 cm · Chest: 35–36 in · Weight: 55–65 kg',
      modelImg: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=300&q=80',
      tip: 'Clean fit · Sits naturally at shoulder',
    },
    M: {
      size: 'M', label: 'Medium', confidence: 'Perfect', color: '#10b981',
      fits: 'Height: 170–177 cm · Chest: 37–38 in · Weight: 65–75 kg',
      modelImg: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&q=80',
      tip: 'Our best fit · Most popular size · True to size',
    },
    L: {
      size: 'L', label: 'Large', confidence: 'Perfect', color: '#10b981',
      fits: 'Height: 177–183 cm · Chest: 39–40 in · Weight: 75–85 kg',
      modelImg: 'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=300&q=80',
      tip: 'Relaxed fit · Extra room in chest and back',
    },
    XL: {
      size: 'XL', label: 'Extra Large', confidence: 'Perfect', color: '#10b981',
      fits: 'Height: 183–188 cm · Chest: 41–42 in · Weight: 85–98 kg',
      modelImg: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4c6c?w=300&q=80',
      tip: 'Comfortable fit · Roomy through shoulders',
    },
    XXL: {
      size: 'XXL', label: 'Double XL', confidence: 'Good', color: '#f59e0b',
      fits: 'Height: 185+ cm · Chest: 43+ in · Weight: 98+ kg',
      modelImg: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&q=80',
      tip: 'Currently limited stock · Contact us for bulk orders',
    },
  };

  return results[size];
};

// Shoe size logic
const getShoeSize = (footLength: number, footWidth: 'narrow' | 'normal' | 'wide'): { eu: string; fits: string; tip: string } => {
  let eu = 41;
  if      (footLength <= 24.0) eu = 38;
  else if (footLength <= 24.5) eu = 39;
  else if (footLength <= 25.0) eu = 40;
  else if (footLength <= 25.5) eu = 41;
  else if (footLength <= 26.0) eu = 42;
  else if (footLength <= 26.5) eu = 43;
  else                         eu = 44;

  const widthNote = footWidth === 'wide' ? ' · Go up half size for wide feet' : footWidth === 'narrow' ? ' · True to size for narrow feet' : '';
  return {
    eu: String(eu),
    fits: `Foot length: ${footLength} cm${widthNote}`,
    tip: eu <= 40 ? 'Snug fit — our shoes run true to size' : eu >= 43 ? 'Roomy toe box — great for wider feet' : 'Perfect fit — true to size',
  };
};

interface SizeGuideProps {
  category: 'Shirts' | 'Shoes';
  onSizeSelect?: (size: string) => void;
}

const SizeGuide: React.FC<SizeGuideProps> = ({ category, onSizeSelect }) => {
  const [open, setOpen]         = useState(false);
  const [height, setHeight]     = useState('');
  const [weight, setWeight]     = useState('');
  const [chest, setChest]       = useState('');
  const [footLen, setFootLen]   = useState('');
  const [footWidth, setFootWidth] = useState<'narrow' | 'normal' | 'wide'>('normal');
  const [result, setResult]     = useState<any>(null);

  const calculate = () => {
    if (category === 'Shirts') {
      const r = getShirtSize(parseFloat(height)||0, parseFloat(weight)||0, parseFloat(chest)||0);
      setResult(r);
    } else {
      if (!footLen) return;
      const r = getShoeSize(parseFloat(footLen), footWidth);
      setResult(r);
    }
  };

  const reset = () => { setResult(null); setHeight(''); setWeight(''); setChest(''); setFootLen(''); };

  return (
    <>
      <button className="sg-trigger" onClick={() => setOpen(true)}>
        📏 Find My Size
      </button>

      <AnimatePresence>
        {open && (
          <motion.div className="sg-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => { setOpen(false); reset(); }}
          >
            <motion.div className="sg-modal"
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 280, damping: 26 }}
              onClick={e => e.stopPropagation()}
            >
              <button className="sg-close" onClick={() => { setOpen(false); reset(); }}>✕</button>

              <div className="sg-header">
                <h2>Find Your Perfect Size</h2>
                <p>{category === 'Shirts' ? 'Enter your measurements for the best fit' : 'Enter foot length for accurate shoe size'}</p>
              </div>

              {!result ? (
                <div className="sg-form">
                  {category === 'Shirts' ? (
                    <>
                      <div className="sg-field-group">
                        <div className="sg-field">
                          <label>Height (cm)</label>
                          <input type="number" placeholder="e.g. 175" value={height} onChange={e => setHeight(e.target.value)} min="150" max="220" />
                        </div>
                        <div className="sg-field">
                          <label>Weight (kg)</label>
                          <input type="number" placeholder="e.g. 70" value={weight} onChange={e => setWeight(e.target.value)} min="40" max="150" />
                        </div>
                      </div>
                      <div className="sg-field">
                        <label>Chest Circumference (inches) — <span className="sg-optional">optional but most accurate</span></label>
                        <input type="number" placeholder="e.g. 38" value={chest} onChange={e => setChest(e.target.value)} min="28" max="56" />
                        <span className="sg-hint">Measure around fullest part of chest</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="sg-field">
                        <label>Foot Length (cm)</label>
                        <input type="number" placeholder="e.g. 25.5" value={footLen} onChange={e => setFootLen(e.target.value)} min="22" max="30" step="0.5" />
                        <span className="sg-hint">Measure from heel to longest toe on a flat surface</span>
                      </div>
                      <div className="sg-field">
                        <label>Foot Width</label>
                        <div className="sg-radio-group">
                          {(['narrow','normal','wide'] as const).map(w => (
                            <label key={w} className={`sg-radio ${footWidth===w?'active':''}`}>
                              <input type="radio" name="width" value={w} checked={footWidth===w} onChange={() => setFootWidth(w)} />
                              {w.charAt(0).toUpperCase() + w.slice(1)}
                            </label>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Size chart reference */}
                  <div className="sg-chart">
                    <div className="sg-chart-title">Quick Reference Chart</div>
                    {category === 'Shirts' ? (
                      <table className="sg-table">
                        <thead><tr><th>Size</th><th>Chest (in)</th><th>Height (cm)</th><th>Weight (kg)</th></tr></thead>
                        <tbody>
                          <tr><td>XS</td><td>32–34</td><td>155–163</td><td>45–55</td></tr>
                          <tr><td>S</td><td>35–36</td><td>163–170</td><td>55–65</td></tr>
                          <tr className="sg-highlighted"><td>M</td><td>37–38</td><td>170–177</td><td>65–75</td></tr>
                          <tr><td>L</td><td>39–40</td><td>177–183</td><td>75–85</td></tr>
                          <tr><td>XL</td><td>41–42</td><td>183–188</td><td>85–98</td></tr>
                          <tr><td>XXL</td><td>43+</td><td>185+</td><td>98+</td></tr>
                        </tbody>
                      </table>
                    ) : (
                      <table className="sg-table">
                        <thead><tr><th>EU</th><th>Foot Length (cm)</th><th>UK</th><th>US</th></tr></thead>
                        <tbody>
                          <tr><td>38</td><td>24.0</td><td>5</td><td>6</td></tr>
                          <tr><td>39</td><td>24.5</td><td>6</td><td>7</td></tr>
                          <tr><td>40</td><td>25.0</td><td>6.5</td><td>7.5</td></tr>
                          <tr className="sg-highlighted"><td>41</td><td>25.5</td><td>7</td><td>8</td></tr>
                          <tr><td>42</td><td>26.0</td><td>7.5</td><td>8.5</td></tr>
                          <tr><td>43</td><td>26.5</td><td>8.5</td><td>9.5</td></tr>
                          <tr><td>44</td><td>27.0+</td><td>9.5</td><td>10.5</td></tr>
                        </tbody>
                      </table>
                    )}
                  </div>

                  <button
                    className="sg-submit"
                    onClick={calculate}
                    disabled={category === 'Shirts' ? (!height && !weight && !chest) : !footLen}
                  >
                    Find My Size →
                  </button>
                </div>
              ) : (
                // ── Result screen ──
                <motion.div className="sg-result"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                >
                  {category === 'Shirts' ? (
                    <div className="sg-result-shirt">
                      <div className="sg-result-left">
                        <div className="sg-size-badge" style={{ borderColor: result.color, color: result.color }}>
                          {result.size}
                        </div>
                        <div className="sg-size-label">{result.label}</div>
                        <div className="sg-confidence" style={{ color: result.color }}>
                          {result.confidence} Fit ✓
                        </div>
                        <div className="sg-fits">{result.fits}</div>
                        <div className="sg-tip">💡 {result.tip}</div>
                        {onSizeSelect && (
                          <button className="sg-select-btn" onClick={() => { onSizeSelect(result.size); setOpen(false); }}>
                            Select {result.size} →
                          </button>
                        )}
                      </div>
                      <div className="sg-result-right">
                        <img src={result.modelImg} alt={`Size ${result.size} model`}
                          onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
                        <div className="sg-model-label">Similar body type</div>
                      </div>
                    </div>
                  ) : (
                    <div className="sg-result-shoe">
                      <div className="sg-size-badge sg-size-badge-shoe" style={{ borderColor: '#C41E3A', color: '#C41E3A' }}>
                        EU {result.eu}
                      </div>
                      <div className="sg-size-label">European Size {result.eu}</div>
                      <div className="sg-fits">{result.fits}</div>
                      <div className="sg-tip">💡 {result.tip}</div>
                      {onSizeSelect && (
                        <button className="sg-select-btn" onClick={() => { onSizeSelect(result.eu); setOpen(false); }}>
                          Select EU {result.eu} →
                        </button>
                      )}
                    </div>
                  )}

                  <button className="sg-retry" onClick={reset}>← Try different measurements</button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SizeGuide;
