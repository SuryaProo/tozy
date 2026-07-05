import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './ARViewer.css';

// Free 3D shoe models
const SHOE_MODELS: Record<string, { glb: string; usdz: string; name: string }> = {
  default: {
    glb:  'https://res.cloudinary.com/frn6949c/raw/upload/v1783238703/free_shoe_model-v1_wbhxya.glb',
    usdz: '',
    name: 'Shoe',
  },
};

// Load model-viewer web component script
const loadModelViewerScript = () => {
  if (document.querySelector('script[src*="model-viewer"]')) return;
  const script = document.createElement('script');
  script.type   = 'module';
  script.src    = 'https://unpkg.com/@google/model-viewer@3.4.0/dist/model-viewer.min.js';
  document.head.appendChild(script);
};

interface ARViewerProps {
  productId: string;
  productName: string;
  // Optional: pass your own .glb URL from Cloudinary
  glbUrl?: string;
  usdzUrl?: string;
}

const ARViewer: React.FC<ARViewerProps> = ({ productId, productName, glbUrl, usdzUrl }) => {
  const [open, setOpen]         = useState(false);
  const [arSupported, setArSupported] = useState(false);

  useEffect(() => {
    loadModelViewerScript();
    // Check if AR is supported (mobile browsers)
    const isIOS     = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    setArSupported(isIOS || isAndroid);
  }, []);

  const model = SHOE_MODELS[productId] ?? SHOE_MODELS.default;
  const finalGlb   = glbUrl   || model.glb;
  const finalUsdz  = usdzUrl  || model.usdz;

  return (
    <>
      <motion.button
        className="ar-trigger"
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
      >
        <span className="ar-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </span>
        View in 3D / AR
        {arSupported && <span className="ar-badge">AR Ready</span>}
      </motion.button>

      {open && (
        <div className="ar-modal-backdrop" onClick={() => setOpen(false)}>
          <motion.div
            className="ar-modal"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="ar-modal-header">
              <div>
                <h3>3D View — {productName}</h3>
                <p className="ar-sub">
                  {arSupported
                    ? '📱 Tap "View in AR" to see it in your room!'
                    : '🖥️ Rotate · Zoom · Inspect from every angle'}
                </p>
              </div>
              <button className="ar-close" onClick={() => setOpen(false)}>✕</button>
            </div>

            {/* Google Model Viewer */}
            <div className="ar-viewer-wrap">
              {/* @ts-ignore — model-viewer is a custom web component */}
              <model-viewer
                src={finalGlb}
                alt={`3D model of ${productName}`}
                ar
                ar-modes="webxr scene-viewer quick-look"
                camera-controls
                auto-rotate
                auto-rotate-delay="500"
                shadow-intensity="1"
                exposure="1"
                loading="eager"
                reveal="auto"
                crossorigin="anonymous"
                style={{ width: '100%', height: '360px', background: '#f8f8f6', borderRadius: '10px' }}
              >
                <button slot="ar-button" className="ar-button-slot">
                  📱 View in Your Room (AR)
                </button>
              </model-viewer>
            </div>

            <div className="ar-instructions">
              <div className="ar-step"><span>🖱️</span><span>Drag to rotate</span></div>
              <div className="ar-step"><span>🔍</span><span>Pinch/scroll to zoom</span></div>
              {arSupported && <div className="ar-step"><span>📱</span><span>Tap AR button to try in real space</span></div>}
            </div>

            {/* Upload hint for admin */}
            {!glbUrl && (
              <div className="ar-upload-hint">
                💡 Upload a <code>.glb</code> file of your product to Cloudinary and add the URL in Admin Portal for real 3D model.
                Free 3D models: <a href="https://sketchfab.com/features/free-3d-models" target="_blank" rel="noreferrer">Sketchfab ↗</a>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </>
  );
};

export default ARViewer;
